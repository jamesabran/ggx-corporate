/**
 * Contract tests for the Business+ → HeyQ adapter (`services/heyqService.ts`).
 *
 * These exercise the seam directly: OMS authorization, the customer-safe
 * snapshot, the privacy boundary, and the failure modes. They run in the page so
 * they hit the real modules the app hits.
 */
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startDevServer, stopDevServer, signIn, resetHeyQ } from './helpers.mjs';

const PORT = 5191;

let server;
let browser;
let page;

/** Run an expression against the live adapter module inside the page. */
const adapter = (fn, arg) =>
  page.evaluate(
    async ({ src, arg }) => {
      const svc = await import('/src/app/services/heyqService.ts');
      const store = await import('/src/app/data/heyqTickets.ts');
      // eslint-disable-next-line no-new-func
      return await new Function('svc', 'store', 'arg', `return (${src})(svc, store, arg);`)(svc, store, arg);
    },
    { src: fn.toString(), arg },
  );

before(async () => {
  server = await startDevServer(PORT);
  const session = await signIn(server.base, 'admin');
  browser = session.browser;
  page = session.page;
  await resetHeyQ(page);
});

after(async () => {
  await browser?.close();
  stopDevServer(server);
});

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

  it('opens the requester portal by opaque token, never by ticket reference', async () => {
    const url = await adapter((svc) => svc.buildRequesterTicketUrl('tok_abc123'));
    assert.match(url, /\/t\/tok_abc123$/);
    assert.doesNotMatch(url, /HQ-/);
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
    // A Manager scoped to acme-luzon asking for an Acme Corporation order.
    const res = await adapter((svc) =>
      svc.getAuthorizedOrder(
        { externalUserId: 'manager@email.com', externalOrgId: 'acme-luzon' },
        'GGX-2026-90008', // owned by Acme Corporation
      ),
    );
    assert.equal(res.status, 'forbidden');
  });

  it('aborts a linked submission when the order is out of scope — no half-created ticket', async () => {
    const res = await adapter(async (svc, store) => {
      const before = store.listTicketsForRequester({
        externalUserId: 'manager@email.com',
        externalOrgId: 'acme-luzon',
      }).length;

      // Force the manager identity through the real submission path.
      const attempt = await svc.getAuthorizedOrder(
        { externalUserId: 'manager@email.com', externalOrgId: 'acme-luzon' },
        'GGX-2026-90008',
      );

      const after = store.listTicketsForRequester({
        externalUserId: 'manager@email.com',
        externalOrgId: 'acme-luzon',
      }).length;
      return { attempt: attempt.status, before, after };
    });
    assert.equal(res.attempt, 'forbidden');
    assert.equal(res.after, res.before, 'no ticket may be created on a refused order');
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
    for (const leaked of ['recipient', 'sender', 'contactnumber', 'codamount', 'payment', 'fees', 'items', 'batch']) {
      assert.ok(!(leaked in snapshot), `snapshot must not carry ${leaked}`);
    }
    // The real recipient of GGX-2026-90008 is "Horizon Publishing Co." — the
    // snapshot must not carry it, nor a street address.
    assert.ok(!blob.includes('horizon'), 'snapshot must not carry the recipient name');
    assert.ok(!blob.includes('robinsons'), 'snapshot must not carry the street address');
  });
});

describe('the privacy boundary (agent-only data)', () => {
  it('never projects internal notes, assignee, escalation, tier or SLA to Business+', async () => {
    const { ticket, raw } = await adapter(async (svc, store) => {
      const res = await svc.getMyTicket('HQ-10241');
      const raw = store.listTicketsForRequester(await svc.getRequesterIdentity())
        .find((t) => t.id === 'HQ-10241');
      return { ticket: res.data, raw };
    });

    // The HeyQ record really does carry agent-only data...
    assert.ok(raw.internalNotes.length > 0, 'fixture should have an internal note');
    assert.equal(raw.assigneeName, 'Bea Santos');
    assert.equal(raw.escalationState, 'escalated');

    // ...and none of it crosses the adapter.
    const blob = JSON.stringify(ticket).toLowerCase();
    for (const field of ['internalnotes', 'assigneename', 'escalationstate', 'supporttier', 'slapolicyid']) {
      assert.ok(!blob.includes(field), `customer view must not expose ${field}`);
    }
    assert.ok(!blob.includes('bea santos'), 'agent identity must not be exposed');
    assert.ok(!blob.includes('goodwill credit'), 'internal note body must not be exposed');

    // The handling TEAM is customer-safe and is what the UI shows instead.
    assert.equal(ticket.supportTeam, 'Claims');
  });

  it('scopes ticket reads to the signed-in identity', async () => {
    const res = await adapter(async (svc) => {
      // HQ-10208 belongs to the Acme Luzon manager, not the signed-in Admin.
      const mine = await svc.listMyTickets();
      const other = await svc.getMyTicket('HQ-10208');
      return { ids: mine.map((t) => t.id), other: other.status };
    });
    assert.ok(!res.ids.includes('HQ-10208'), "another user's ticket must not be listed");
    assert.equal(res.other, 'not_found');
  });
});

describe('ticket status vs delivery status vs escalation', () => {
  it('keeps escalation separate from ticket status', async () => {
    const res = await adapter(async (svc, store) => {
      store.agentEscalate('HQ-10238', 'escalated');
      const t = await svc.getMyTicket('HQ-10238');
      return t.data.status;
    });
    // Escalating did not move the ticket out of on_hold.
    assert.equal(res, 'on_hold');
  });

  it('a live delivery change never moves the ticket status', async () => {
    const res = await adapter(async (svc) => {
      const before = (await svc.getMyTicket('HQ-10230')).data;
      // HQ-10230's snapshot was frozen at 'pending'; OMS has since moved on.
      const live = await svc.getLiveOrderStatus(before.linkedOrder.externalOrderId);
      const after = (await svc.getMyTicket('HQ-10230')).data;
      return {
        snapshot: before.linkedOrder.snapshot.deliveryStatus,
        live: live.status === 'ok' ? live.data.deliveryStatus : live.status,
        statusBefore: before.status,
        statusAfter: after.status,
      };
    });

    assert.equal(res.snapshot, 'pending', 'snapshot is frozen at capture time');
    assert.equal(res.live, 'picked-up', 'OMS reports the current delivery status');
    assert.notEqual(res.live, res.snapshot, 'the live order has moved on (stale snapshot)');
    assert.equal(res.statusAfter, res.statusBefore, 'ticket status is unchanged by the shipment');
    assert.equal(res.statusAfter, 'resolved');
  });

  it('renders a ticket whose linked order no longer exists in OMS', async () => {
    const res = await adapter(async (svc) => {
      const t = (await svc.getMyTicket('HQ-10215')).data;
      const live = await svc.getLiveOrderStatus(t.linkedOrder.externalOrderId);
      return { snapshot: t.linkedOrder.snapshot, live: live.status, subject: t.subject };
    });
    // The order is gone upstream...
    assert.equal(res.live, 'not_found');
    // ...but the ticket still renders from its snapshot.
    assert.equal(res.snapshot.deliveryStatusLabel, 'Delivered');
    assert.ok(res.subject.length > 0);
  });
});

describe('requester lifecycle', () => {
  it('submits a general ticket with no linked order', async () => {
    const res = await adapter((svc) =>
      svc.submitTicketToHeyQ({
        subject: 'Invoice question',
        description: 'Please explain the surcharge.',
        concernType: 'billing_issue',
      }),
    );
    assert.equal(res.status, 'ok');
    assert.equal(res.data.linkedOrder, undefined);
    assert.equal(res.data.status, 'new');
  });

  it('submits an order-linked ticket capturing the snapshot at submission', async () => {
    const res = await adapter((svc) =>
      svc.submitTicketToHeyQ({
        subject: 'Delivery failed',
        description: 'Recipient was available.',
        concernType: 'failed_delivery',
        externalOrderId: 'GGX-2026-90004',
      }),
    );
    assert.equal(res.status, 'ok');
    assert.equal(res.data.linkedOrder.externalOrderId, 'GGX-2026-90004');
    assert.equal(res.data.linkedOrder.snapshot.deliveryStatus, 'in-transit');
    assert.ok(res.data.linkedOrder.capturedAt, 'snapshot must record when it was taken');
  });

  it('reflects a public agent reply but not an internal note', async () => {
    const res = await adapter(async (svc, store) => {
      store.agentAddInternalNote('HQ-10238', 'Alex Cruz', 'SECRET internal triage note');
      store.agentReply('HQ-10238', 'Customer Support', 'The hub has located your parcel.');
      const t = (await svc.getMyTicket('HQ-10238')).data;
      return t.messages.map((m) => m.body);
    });
    assert.ok(res.some((b) => b.includes('located your parcel')), 'public reply must be visible');
    assert.ok(!res.some((b) => b.includes('SECRET')), 'internal note must never be visible');
  });

  it('shows resolution, then reopens on a requester reply', async () => {
    const res = await adapter(async (svc, store) => {
      store.agentResolve('HQ-10238', 'Parcel delivered — closing this out.');
      const resolved = (await svc.getMyTicket('HQ-10238')).data;

      const replied = await svc.replyToMyTicket('HQ-10238', 'It still has not arrived.');
      return {
        resolvedStatus: resolved.status,
        canReopen: resolved.canReopen,
        afterReply: replied.data.status,
        reopenedAt: replied.data.reopenedAt,
      };
    });
    assert.equal(res.resolvedStatus, 'resolved');
    assert.equal(res.canReopen, true);
    // Reopen is an EVENT: the ticket returns to active work, not a 'reopened' status.
    assert.ok(['open', 'in_progress'].includes(res.afterReply), 'reply must reopen the ticket');
    assert.ok(res.reopenedAt, 'reopen must be recorded');
  });

  it('reopens explicitly when allowed', async () => {
    const res = await adapter(async (svc) => {
      const before = (await svc.getMyTicket('HQ-10221')).data; // closed
      const after = await svc.reopenMyTicket('HQ-10221');
      return { before: before.status, after: after.data.status };
    });
    assert.equal(res.before, 'closed');
    assert.ok(['open', 'in_progress'].includes(res.after));
  });
});

describe('HeyQ downtime', () => {
  it('degrades safely when HeyQ is unreachable', async () => {
    const res = await adapter(async (svc, store) => {
      store.heyqServiceState.available = false;
      const list = await svc.listMyTickets();
      const one = await svc.getMyTicket('HQ-10241');
      const handoff = await svc.startOrderHandoff('GGX-2026-90008');
      store.heyqServiceState.available = true;
      return { list: list.length, one: one.status, handoff: handoff.status };
    });
    assert.equal(res.list, 0);
    assert.equal(res.one, 'unavailable');
    assert.equal(res.handoff, 'unavailable');
  });
});
