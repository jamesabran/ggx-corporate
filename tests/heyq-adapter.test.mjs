/**
 * Focused contract tests for the Business+ → HeyQ adapter.
 *
 * Two halves:
 *   • The HeyQ customer API path (`heyqCustomerApi` behind `heyqService`) — driven
 *     with a stubbed `window.fetch`, so we assert the request the adapter makes
 *     (identity, URL, config) and the mapping/privacy of the response it returns,
 *     plus the failure modes, without a live HeyQ.
 *   • The OMS side (order authorization + the customer-safe snapshot + live
 *     status) — driven against the real `transactionService`, which owns orders.
 *
 * They run INSIDE the page (Vite serves the TS modules) so we hit the real
 * adapter the app hits.
 */
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startDevServer, stopDevServer, signIn } from './helpers.mjs';

const PORT = 5191;
const API_DEFAULT = 'https://heyq-api-production.up.railway.app';

let server;
let browser;
let page;

/** A HeyQ customer-API ticket, plus adversarial agent-only fields that a buggy or
 *  over-broad server might include — the adapter's allowlist mapper must drop them. */
const HEYQ_TICKET = {
  id: 'tkt_abc123',
  reference: 'HQ-5001',
  subject: 'Delivery failed but recipient was available',
  concernType: 'pickup_issue', // not a Business+ concern key → maps to general_inquiry
  issueType: 'Pickup issue',
  status: 'in_progress',
  priority: 'high',
  supportTeam: 'Claims',
  createdAt: '2026-06-01T09:00:00Z',
  updatedAt: '2026-06-02T09:00:00Z',
  openedBySupport: false,
  canReopen: false,
  linkedOrder: {
    externalOrderId: 'GGX-2026-90008',
    trackingNumber: 'GGX-2026-90008',
    capturedAt: '2026-06-01T09:00:00Z',
    snapshot: {
      shipmentStatus: 'out_for_delivery',
      bookingDate: '2026-05-31',
      destination: 'Pasig City',
      serviceType: 'On-Demand',
      deliverySummary: 'Standard delivery',
      route: 'Metro Manila → Pasig City',
    },
  },
  messages: [
    { id: 'm1', from: 'you', authorLabel: 'You', body: 'Please re-attempt.', createdAt: '2026-06-01T09:00:00Z' },
    { id: 'm2', from: 'support', authorLabel: 'Claims', body: 'On it — re-delivery scheduled.', createdAt: '2026-06-02T09:00:00Z' },
  ],
  // ── must NEVER reach Business+ ──
  assigneeName: 'Bea Santos',
  escalationState: 'escalated',
  supportTier: 'L2',
  slaPolicyId: 'sla-high',
  internalNotes: [{ body: 'goodwill credit — do not disclose' }],
};

/**
 * Run an adapter expression with `window.fetch` stubbed. `response` is returned
 * as JSON for every call; `status` sets the HTTP status; `reject` simulates a
 * network failure. Returns the adapter result plus the captured fetch calls.
 */
const withStub = (fn, { response = null, status = 200, reject = false } = {}) =>
  page.evaluate(
    async ({ src, response, status, reject }) => {
      const calls = [];
      const orig = window.fetch;
      window.fetch = async (url, init) => {
        calls.push({ url: String(url), method: init?.method ?? 'GET', body: init?.body ?? null });
        if (reject) throw new TypeError('Failed to fetch');
        return new Response(JSON.stringify(response), {
          status,
          headers: { 'Content-Type': 'application/json' },
        });
      };
      try {
        const svc = await import('/src/app/services/heyqService.ts');
        // eslint-disable-next-line no-new-func
        const result = await new Function('svc', `return (${src})(svc);`)(svc);
        return { result, calls };
      } finally {
        window.fetch = orig;
      }
    },
    { src: fn.toString(), response, status, reject },
  );

/** OMS-side adapter call (no stub — real transactionService). */
const adapter = (fn, arg) =>
  page.evaluate(
    async ({ src, arg }) => {
      const svc = await import('/src/app/services/heyqService.ts');
      // eslint-disable-next-line no-new-func
      return new Function('svc', 'arg', `return (${src})(svc, arg);`)(svc, arg);
    },
    { src: fn.toString(), arg },
  );

before(async () => {
  server = await startDevServer(PORT);
  const session = await signIn(server.base, 'admin');
  browser = session.browser;
  page = session.page;
});

after(async () => {
  await browser?.close();
  stopDevServer(server);
});

describe('configuration', () => {
  it('reads tickets from the deployed HeyQ API by default, under /api/customer', async () => {
    const { calls } = await withStub((svc) => svc.listMyTickets(), { response: [] });
    assert.equal(calls.length, 1);
    assert.ok(calls[0].url.startsWith(`${API_DEFAULT}/api/customer/tickets`), calls[0].url);
  });

  it('exposes the API base url override point', async () => {
    const base = await page.evaluate(async () => {
      const api = await import('/src/app/services/heyqCustomerApi.ts');
      return api.getHeyQApiBaseUrl();
    });
    assert.equal(base, API_DEFAULT);
  });
});

describe('requester identity', () => {
  it('scopes the read to the signed-in identity via query params', async () => {
    const { calls } = await withStub((svc) => svc.listMyTickets(), { response: [] });
    const url = new URL(calls[0].url);
    // Admin session: max@email.com / main (the account scope).
    assert.equal(url.searchParams.get('externalUserId'), 'max@email.com');
    assert.equal(url.searchParams.get('externalOrgId'), 'main');
  });
});

describe('API response mapping', () => {
  it('maps a HeyQ customer ticket to the Business+ CustomerTicket shape', async () => {
    const { result } = await withStub((svc) => svc.listMyTickets(), { response: [HEYQ_TICKET] });
    assert.equal(result.length, 1);
    const t = result[0];
    assert.equal(t.id, 'tkt_abc123');
    assert.equal(t.reference, 'HQ-5001');
    assert.equal(t.status, 'in_progress');
    assert.equal(t.priority, 'high');
    assert.equal(t.supportTeam, 'Claims');
    assert.equal(t.issueType, 'Pickup issue'); // HeyQ's own label, verbatim
    assert.equal(t.concernType, 'general_inquiry'); // pickup_issue has no BP key
    assert.equal(t.messages.length, 2);
    assert.deepEqual(t.messages.map((m) => m.from), ['you', 'support']);
  });

  it('maps the linked-order snapshot into the OMS delivery vocabulary', async () => {
    const { result } = await withStub((svc) => svc.getMyTicket('tkt_abc123'), { response: HEYQ_TICKET });
    assert.equal(result.status, 'ok');
    const snap = result.data.linkedOrder.snapshot;
    assert.equal(snap.deliveryStatus, 'in-transit');       // out_for_delivery → in-transit key
    assert.equal(snap.deliveryStatusLabel, 'Out for Delivery');
    assert.equal(snap.serviceType, 'On-Demand');
    assert.equal(snap.route, 'Metro Manila → Pasig City');
    assert.equal(snap.bookedOn, '2026-05-31');
    assert.equal(result.data.linkedOrder.trackingNumber, 'GGX-2026-90008');
  });
});

describe('privacy filtering', () => {
  it('drops agent-only fields even when the response carries them', async () => {
    const { result } = await withStub((svc) => svc.getMyTicket('tkt_abc123'), { response: HEYQ_TICKET });
    const blob = JSON.stringify(result.data).toLowerCase();
    for (const leaked of ['assigneename', 'escalationstate', 'supporttier', 'slapolicyid', 'internalnotes', 'openedbysupport']) {
      assert.ok(!blob.includes(leaked), `customer view must not carry ${leaked}`);
    }
    assert.ok(!blob.includes('bea santos'), 'agent identity must not be exposed');
    assert.ok(!blob.includes('goodwill credit'), 'internal note body must not be exposed');
    // The handling team IS customer-safe.
    assert.equal(result.data.supportTeam, 'Claims');
  });
});

describe('common API failures', () => {
  const cases = [
    { status: 403, expect: 'forbidden' },
    { status: 404, expect: 'not_found' },
    { status: 500, expect: 'unavailable' },
  ];
  for (const c of cases) {
    it(`maps HTTP ${c.status} to ${c.expect}`, async () => {
      const { result } = await withStub((svc) => svc.getMyTicket('tkt_x'), { response: { error: 'x' }, status: c.status });
      assert.equal(result.status, c.expect);
    });
  }

  it('maps a network error to unavailable', async () => {
    const { result } = await withStub((svc) => svc.getMyTicket('tkt_x'), { reject: true });
    assert.equal(result.status, 'unavailable');
  });

  it('degrades the list to empty on failure', async () => {
    const { result } = await withStub((svc) => svc.listMyTickets(), { response: { error: 'down' }, status: 503 });
    assert.deepEqual(result, []);
  });
});

describe('requester writes go to HeyQ, then re-read the customer view', () => {
  it('reply posts to /tickets/:id/messages then re-reads /customer/tickets/:id', async () => {
    const { result, calls } = await withStub((svc) => svc.replyToMyTicket('tkt_abc123', 'Any update?'), {
      response: HEYQ_TICKET,
    });
    assert.equal(result.status, 'ok');
    assert.equal(calls[0].method, 'POST');
    assert.match(calls[0].url, /\/api\/tickets\/tkt_abc123\/messages$/);
    assert.match(String(calls[0].body), /Any update\?/);
    assert.equal(calls[1].method, 'GET');
    assert.match(calls[1].url, /\/api\/customer\/tickets\/tkt_abc123\?/);
  });

  it('reopen posts to /tickets/:id/reopen then re-reads the customer view', async () => {
    const { result, calls } = await withStub((svc) => svc.reopenMyTicket('tkt_abc123'), { response: HEYQ_TICKET });
    assert.equal(result.status, 'ok');
    assert.equal(calls[0].method, 'POST');
    assert.match(calls[0].url, /\/api\/tickets\/tkt_abc123\/reopen$/);
    assert.match(calls[1].url, /\/api\/customer\/tickets\/tkt_abc123\?/);
  });

  it('a failed reply surfaces the failure without re-reading', async () => {
    const { result, calls } = await withStub((svc) => svc.replyToMyTicket('tkt_x', 'hi'), {
      response: { error: 'forbidden' },
      status: 403,
    });
    assert.equal(result.status, 'forbidden');
    assert.equal(calls.length, 1); // POST only — no re-read after a failed write
  });
});

// ── OMS side: order authorization + the customer-safe snapshot (real service) ──

describe('handoff URLs', () => {
  it('builds a HeyQ contact link with no order for general support', async () => {
    const url = await adapter((svc) => svc.buildContactUrl());
    assert.match(url, /\/contact$/);
    assert.doesNotMatch(url, /order=/);
  });

  it('deep-links the stable OMS order id for order-specific support', async () => {
    const url = await adapter((svc) => svc.buildContactUrl('GGX-2026-90008'));
    assert.match(url, /\/contact\?order=GGX-2026-90008$/);
  });
});

describe('OMS order authorization', () => {
  it('authorizes an in-scope order and returns a snapshot', async () => {
    const res = await adapter(async (svc) => {
      const who = await svc.getRequesterIdentity();
      return svc.getAuthorizedOrder(who, 'GGX-2026-90008');
    });
    assert.equal(res.status, 'ok');
    assert.equal(res.data.trackingNumber, 'GGX-2026-90008');
    assert.equal(res.data.snapshot.deliveryStatus, 'failed');
  });

  it('rejects an unknown order id as not_found', async () => {
    const res = await adapter(async (svc) => {
      const who = await svc.getRequesterIdentity();
      return svc.getAuthorizedOrder(who, 'GGX-9999-00000');
    });
    assert.equal(res.status, 'not_found');
  });

  it("rejects another account's order as forbidden", async () => {
    const res = await adapter((svc) =>
      svc.getAuthorizedOrder(
        { externalUserId: 'manager@email.com', externalOrgId: 'acme-luzon' },
        'GGX-2026-90008', // owned by Acme Corporation
      ),
    );
    assert.equal(res.status, 'forbidden');
  });
});

describe('the customer-safe snapshot', () => {
  it('passes only support-relevant order fields', async () => {
    const snapshot = await adapter(async (svc) => {
      const who = await svc.getRequesterIdentity();
      const res = await svc.getAuthorizedOrder(who, 'GGX-2026-90008');
      return res.data.snapshot;
    });
    assert.deepEqual(
      Object.keys(snapshot).sort(),
      ['bookedOn', 'deliveryStatus', 'deliveryStatusLabel', 'deliverySummary', 'route', 'serviceType'],
    );
  });

  it('withholds recipient, payment, parcel and internal order data', async () => {
    const snapshot = await adapter(async (svc) => {
      const who = await svc.getRequesterIdentity();
      const res = await svc.getAuthorizedOrder(who, 'GGX-2026-90008');
      return res.data.snapshot;
    });
    const blob = JSON.stringify(snapshot).toLowerCase();
    assert.ok(!blob.includes('horizon'), 'snapshot must not carry the recipient name');
    assert.ok(!blob.includes('robinsons'), 'snapshot must not carry the street address');
  });
});

describe('live order status (OMS, independent of ticket status)', () => {
  it('reads the current delivery status for an in-scope order', async () => {
    const res = await adapter(async (svc) => {
      const who = await svc.getRequesterIdentity();
      return svc.getLiveOrderStatus('GGX-2026-90008');
    });
    assert.equal(res.status, 'ok');
    assert.equal(res.data.deliveryStatus, 'failed');
  });

  it('reports not_found for an order that no longer exists in OMS', async () => {
    const res = await adapter((svc) => svc.getLiveOrderStatus('GGX-2023-00001'));
    assert.equal(res.status, 'not_found');
  });
});
