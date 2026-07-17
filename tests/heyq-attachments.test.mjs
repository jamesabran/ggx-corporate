/**
 * Attachment support for the Business+ ↔ HeyQ integration (client side).
 *
 * Runs INSIDE the page (Vite serves the TS modules) so we exercise the real
 * adapter + shared attachment policy the app uses. Two halves:
 *   • the shared policy (allowlist / size / double-extension / MIME mismatch),
 *   • the adapter's UPLOAD path — `apiCreateTicket` / `apiReplyToMyTicket` must
 *     send a real multipart body carrying the File(s); `buildAttachmentUrl` must
 *     produce an authorized, identity-scoped download URL; and the realtime
 *     projection must carry an attachment's `id` through so the other side can
 *     download a file that arrives live.
 */
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startDevServer, stopDevServer, signIn } from './helpers.mjs';

const PORT = 5193;
const API_DEFAULT = 'https://heyq-api-production.up.railway.app';
const WHO = { externalUserId: 'max@email.com', externalOrgId: 'main' };

let server;
let browser;
let page;

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

/** Evaluate an async fn in the page with `window.fetch` stubbed; capture requests
 * (including multipart FormData contents) and return the fn's result. */
const withStub = (fn, { response = null, status = 200 } = {}) =>
  page.evaluate(
    async ({ src, response, status, WHO }) => {
      const calls = [];
      const orig = window.fetch;
      window.fetch = async (url, init) => {
        const rec = { url: String(url), method: init?.method ?? 'GET', form: null };
        if (init?.body instanceof FormData) {
          rec.form = { fields: {}, files: [] };
          for (const [k, v] of init.body.entries()) {
            if (v instanceof File) rec.form.files.push({ field: k, name: v.name, type: v.type, size: v.size });
            else rec.form.fields[k] = v;
          }
        }
        calls.push(rec);
        return new Response(JSON.stringify(response), { status, headers: { 'Content-Type': 'application/json' } });
      };
      try {
        // eslint-disable-next-line no-new-func
        const result = await new Function('WHO', `return (${src})(WHO);`)(WHO);
        return { result, calls };
      } finally {
        window.fetch = orig;
      }
    },
    { src: fn.toString(), response, status, WHO },
  );

const evalInPage = (fn) =>
  page.evaluate(async ({ src, WHO }) => {
    // eslint-disable-next-line no-new-func
    return new Function('WHO', `return (${src})(WHO);`)(WHO);
  }, { src: fn.toString(), WHO });

// A HeyQ customer ticket the create/reply stub can return (already projected).
const TICKET_RESPONSE = (over = {}) => ({
  id: 'tkt_att', reference: 'HQ-7001', subject: 's', issueType: 'Delivery delay',
  status: 'open', priority: 'normal', supportTeam: 'Customer Support',
  createdAt: '2026-07-17T00:00:00Z', updatedAt: '2026-07-17T00:00:00Z', canReopen: false,
  messages: [], ...over,
});

// ── shared attachment policy ─────────────────────────────────────────────────

describe('attachment policy (shared with HeyQ)', () => {
  it('accepts allowed types and enforces the 5-file / 10-MB limits and rejections', async () => {
    const res = await evalInPage(async () => {
      const p = await import('/src/app/lib/attachmentPolicy.ts');
      const ok = (name, type, size = 100) => p.validateCandidate({ name, size, type });
      return {
        maxFiles: p.MAX_FILES_PER_SUBMISSION,
        validPdf: ok('receipt.pdf', 'application/pdf'),
        validPng: ok('photo.png', 'image/png'),
        blockedExe: ok('malware.exe', 'application/octet-stream'),
        mimeMismatch: ok('photo.png', 'application/x-msdownload'),
        doubleExt: ok('payload.exe.pdf', 'application/pdf'),
        tooBig: ok('big.pdf', 'application/pdf', 10 * 1024 * 1024 + 1),
        previewImage: p.isPreviewable('image/png'),
        previewZip: p.isPreviewable('application/zip'),
      };
    });
    assert.equal(res.maxFiles, 5);
    assert.equal(res.validPdf, null);
    assert.equal(res.validPng, null);
    assert.match(res.blockedExe, /not allowed/i);
    assert.match(res.mimeMismatch, /doesn.t match/i);
    assert.match(res.doubleExt, /double extension/i);
    assert.match(res.tooBig, /10 MB/i);
    assert.equal(res.previewImage, true);
    assert.equal(res.previewZip, false); // zip is downloadable, never inline
  });
});

// ── adapter upload paths ─────────────────────────────────────────────────────

describe('adapter uploads a real multipart body', () => {
  it('apiCreateTicket sends fields + files as multipart when files are attached', async () => {
    const { calls } = await withStub(async (WHO) => {
      const api = await import('/src/app/services/heyqCustomerApi.ts');
      const file = new File([new Uint8Array([1, 2, 3])], 'receipt.pdf', { type: 'application/pdf' });
      return api.apiCreateTicket(WHO, {
        name: 'Max', email: WHO.externalUserId, concernType: 'delivery_delay',
        subject: 's', description: 'd', files: [file],
      });
    }, { response: TICKET_RESPONSE() });

    const create = calls.find((c) => c.method === 'POST' && c.url.endsWith('/api/customer/tickets'));
    assert.ok(create, 'a create POST must be issued');
    assert.ok(create.form, 'the create must be multipart form-data');
    assert.equal(create.form.fields.externalUserId, 'max@email.com');
    assert.equal(create.form.files.length, 1);
    assert.equal(create.form.files[0].field, 'files');
    assert.equal(create.form.files[0].name, 'receipt.pdf');
    assert.equal(create.form.files[0].type, 'application/pdf');
  });

  it('apiCreateTicket stays JSON (no multipart) when there are no files', async () => {
    const { calls } = await withStub(async (WHO) => {
      const api = await import('/src/app/services/heyqCustomerApi.ts');
      return api.apiCreateTicket(WHO, { name: 'Max', email: WHO.externalUserId, concernType: 'delivery_delay', subject: 's', description: 'd' });
    }, { response: TICKET_RESPONSE() });
    const create = calls.find((c) => c.method === 'POST' && c.url.endsWith('/api/customer/tickets'));
    assert.ok(create && create.form === null, 'no-file create must be plain JSON');
  });

  it('apiReplyToMyTicket sends the reply body + files as multipart', async () => {
    const { calls } = await withStub(async (WHO) => {
      const api = await import('/src/app/services/heyqCustomerApi.ts');
      const file = new File([new Uint8Array([9])], 'evidence.jpg', { type: 'image/jpeg' });
      return api.apiReplyToMyTicket(WHO, 'tkt_att', 'here is proof', [file]);
    }, { response: TICKET_RESPONSE({ messages: [{ id: 'm1', from: 'you', authorLabel: 'You', body: 'here is proof', createdAt: '2026-07-17T00:00:00Z', attachments: [{ id: 'a1', name: 'evidence.jpg', size: 1, type: 'image/jpeg' }] }] }) });

    const reply = calls.find((c) => c.method === 'POST' && /\/tickets\/tkt_att\/messages$/.test(c.url));
    assert.ok(reply, 'a reply POST must be issued');
    assert.ok(reply.form, 'the reply must be multipart form-data');
    assert.equal(reply.form.fields.body, 'here is proof');
    assert.equal(reply.form.files[0].name, 'evidence.jpg');
  });
});

// ── download URL + realtime projection ───────────────────────────────────────

describe('download URLs and realtime attachment id', () => {
  it('buildAttachmentUrl is identity-scoped and honours inline preview', async () => {
    const url = await evalInPage(async (WHO) => {
      const api = await import('/src/app/services/heyqCustomerApi.ts');
      return api.buildAttachmentUrl(WHO, 'tkt_att', 'att_123', true);
    });
    assert.ok(url.startsWith(`${API_DEFAULT}/api/customer/tickets/tkt_att/attachments/att_123`), url);
    const q = new URL(url).searchParams;
    assert.equal(q.get('externalUserId'), 'max@email.com');
    assert.equal(q.get('externalOrgId'), 'main');
    assert.equal(q.get('disposition'), 'inline');
  });

  it('projectRealtimeMessage carries an attachment id through so a live file is downloadable', async () => {
    const msg = await evalInPage(async () => {
      const svc = await import('/src/app/services/heyqService.ts');
      return svc.projectRealtimeMessage({
        id: 'm9', from: 'support', authorLabel: 'Claims', body: 'label attached',
        createdAt: '2026-07-17T00:00:00Z',
        attachments: [{ id: 'att_live', name: 'label.pdf', size: 2048, type: 'application/pdf' }],
      });
    });
    assert.equal(msg.attachments.length, 1);
    assert.equal(msg.attachments[0].id, 'att_live'); // the id survives → the other app can download it
    assert.equal(msg.attachments[0].name, 'label.pdf');
  });
});
