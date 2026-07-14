/**
 * The cross-system customer journey, driven through the real Business+ UI.
 *
 * Covers the round trip end to end: a customer starts from a transaction, hands
 * the order off to HeyQ, the ticket comes back into the Support Tickets page, an
 * agent works it in HeyQ, and Business+ reflects only the customer-visible half.
 *
 * The HeyQ app itself is not launched: window.open is captured, and the agent
 * half is driven through the mock HeyQ backend — which is exactly what the real
 * HeyQ service will do on the other side of the adapter.
 */
import { after, before, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startDevServer, stopDevServer, signIn, captureHandoffs, resetHeyQ } from './helpers.mjs';

const PORT = 5192;
const ORDER = 'GGX-2026-90008'; // failed delivery, Acme Corporation

let server;
let browser;
let page;
let handoffs;

/** Drive the HeyQ agent side (what the agent app would do). */
const agent = (fn, arg) =>
  page.evaluate(
    async ({ src, arg }) => {
      const store = await import('/src/app/data/heyqTickets.ts');
      return new Function('store', 'arg', `return (${src})(store, arg);`)(store, arg);
    },
    { src: fn.toString(), arg },
  );

/** Submit through HeyQ, as HeyQ's own contact form would. */
const submitInHeyQ = (input) =>
  page.evaluate(async (input) => {
    const svc = await import('/src/app/services/heyqService.ts');
    return svc.submitTicketToHeyQ(input);
  }, input);

before(async () => {
  server = await startDevServer(PORT);
  const session = await signIn(server.base, 'admin');
  browser = session.browser;
  page = session.page;
  handoffs = await captureHandoffs(page);
});

after(async () => {
  await browser?.close();
  stopDevServer(server);
});

beforeEach(async () => {
  await resetHeyQ(page);
});

describe('transaction → HeyQ handoff', () => {
  it('the Need Help banner hands the stable OMS order id to HeyQ', async () => {
    await page.goto(`${server.base}/dashboard/transactions/${ORDER}`, { waitUntil: 'networkidle' });

    const cta = page.getByRole('button', { name: /get help with this order/i });
    await cta.waitFor({ state: 'visible', timeout: 10_000 });
    await cta.click();

    // HeyQ received the correct linked order, deep-linked and pre-attached.
    const opened = await handoffs();
    const url = opened.at(-1);
    assert.match(url, /\/contact\?order=GGX-2026-90008$/);

    // And the customer is told, without being asked to re-enter anything.
    await page.getByText(/we opened ggx support with order ggx-2026-90008/i)
      .waitFor({ state: 'visible', timeout: 5_000 });

    // The banner keeps its place on the page — no new support surface appeared.
    assert.equal(await page.getByRole('heading', { name: 'Need Help?' }).count(), 1);
  });

  it('refuses to hand off an order the account is not authorized for', async () => {
    // Sign in as the Acme Luzon manager and open an Acme Corporation order.
    const mgr = await signIn(server.base, 'manager');
    try {
      await mgr.page.goto(`${server.base}/dashboard/transactions/${ORDER}`, { waitUntil: 'networkidle' });
      const cta = mgr.page.getByRole('button', { name: /get help with this order/i });
      await cta.waitFor({ state: 'visible', timeout: 10_000 });
      await cta.click();

      await mgr.page.getByText(/isn.t available for support on your account/i)
        .waitFor({ state: 'visible', timeout: 5_000 });
    } finally {
      await mgr.browser.close();
    }
  });
});

describe('Support Tickets page', () => {
  it('lists tickets from HeyQ with support status, linked order and team', async () => {
    await page.goto(`${server.base}/dashboard/support-tickets`, { waitUntil: 'networkidle' });

    const row = page.locator('tr', { hasText: 'HQ-10241' });
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.getByText('GGX-2026-90008').waitFor();     // linked OMS order
    await row.getByText('In Progress').waitFor();        // support status, not delivery status
    await row.getByText('Claims').waitFor();             // team, never the agent's name

    // The escalated ticket's agent-only data must not be in the DOM at all.
    const html = (await page.content()).toLowerCase();
    assert.ok(!html.includes('bea santos'), 'agent identity must not reach the browser');
    assert.ok(!html.includes('goodwill credit'), 'internal note must not reach the browser');
  });

  it('summary cards count real HeyQ tickets', async () => {
    await page.goto(`${server.base}/dashboard/support-tickets`, { waitUntil: 'networkidle' });
    await page.locator('tr', { hasText: 'HQ-10241' }).waitFor({ timeout: 10_000 });

    // The Admin's seed: 1 open, 1 in_progress, 1 on_hold, 1 resolved + 1 closed.
    // In a StatCard the value <p> is the label <p>'s immediate next sibling.
    const cardValue = (label) =>
      page.getByText(label, { exact: true }).locator('xpath=following-sibling::p[1]');

    assert.equal((await cardValue('Open Tickets').innerText()).trim(), '1');
    assert.equal((await cardValue('In Progress').innerText()).trim(), '1');
    assert.equal((await cardValue('On Hold').innerText()).trim(), '1');
    assert.equal((await cardValue('Resolved').innerText()).trim(), '2');
  });

  it('search and filters still work', async () => {
    await page.goto(`${server.base}/dashboard/support-tickets`, { waitUntil: 'networkidle' });
    await page.locator('tr', { hasText: 'HQ-10241' }).waitFor({ timeout: 10_000 });

    // Search by linked order id.
    await page.getByPlaceholder(/search by ticket id/i).fill('GGX-2026-90004');
    await page.locator('tr', { hasText: 'HQ-10238' }).waitFor({ timeout: 5_000 });
    assert.equal(await page.locator('tr', { hasText: 'HQ-10241' }).count(), 0);

    await page.getByPlaceholder(/search by ticket id/i).fill('');

    // Filter by support status.
    await page.locator('select').first().selectOption('resolved');
    await page.locator('tr', { hasText: 'HQ-10230' }).waitFor({ timeout: 5_000 });
    assert.equal(await page.locator('tr', { hasText: 'HQ-10241' }).count(), 0);
  });

  it('Submit a Ticket opens HeyQ with no preselected order', async () => {
    await page.goto(`${server.base}/dashboard/support-tickets`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: /submit a ticket/i }).click();

    const url = (await handoffs()).at(-1);
    assert.match(url, /\/contact$/);
    assert.doesNotMatch(url, /order=/);
  });

  it('the View action opens the HeyQ requester ticket by token', async () => {
    await page.goto(`${server.base}/dashboard/support-tickets`, { waitUntil: 'networkidle' });
    const row = page.locator('tr', { hasText: 'HQ-10241' });
    await row.waitFor({ timeout: 10_000 });
    await row.getByRole('button', { name: /view/i }).click();

    const url = (await handoffs()).at(-1);
    assert.match(url, /\/t\/tok_hq10241_/, 'must open the token-scoped requester portal');
  });
});

describe('the full lifecycle', () => {
  it('submit → appears in Business+ → agent works it → resolve → reopen', async () => {
    // 1–2. The customer submits in HeyQ from the order handoff.
    const created = await submitInHeyQ({
      subject: 'Parcel never arrived',
      description: 'The rider marked it failed but nobody came.',
      concernType: 'failed_delivery',
      externalOrderId: ORDER,
    });
    assert.equal(created.status, 'ok');
    const id = created.data.id;

    // 3. It appears on the existing Support Tickets page, linked to the order.
    await page.goto(`${server.base}/dashboard/support-tickets`, { waitUntil: 'networkidle' });
    const row = page.locator('tr', { hasText: id });
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.getByText(ORDER).waitFor();
    await row.getByText('New').waitFor();

    // 4. An agent receives it, assigns, escalates, and replies publicly + privately.
    await agent((store, id) => {
      store.agentAssign(id, 'Alex Cruz', 'Claims');
      store.agentEscalate(id, 'escalated');
      store.agentAddInternalNote(id, 'Alex Cruz', 'CONFIDENTIAL hub investigation');
      store.agentReply(id, 'Claims', 'We have opened an investigation with the hub.');
    }, id);

    // 5. Business+ reflects the customer-visible half only.
    await page.goto(`${server.base}/dashboard/support-tickets/${id}`, { waitUntil: 'networkidle' });
    await page.getByText('We have opened an investigation with the hub.').waitFor({ timeout: 10_000 });
    await page.getByText('In Progress').first().waitFor();

    const detailHtml = (await page.content()).toLowerCase();
    assert.ok(!detailHtml.includes('confidential'), 'internal note must not be visible');
    assert.ok(!detailHtml.includes('escalat'), 'escalation state must not be exposed to the customer');
    // The delivery snapshot is shown, and clearly as delivery — not ticket — status.
    await page.getByText(/delivery status when reported/i).waitFor();

    // 6. The customer replies through the requester flow.
    await page.locator('#ticket-reply').fill('Please confirm the re-delivery date.');
    await page.getByRole('button', { name: /send reply/i }).click();
    await page.getByText('Please confirm the re-delivery date.').waitFor({ timeout: 10_000 });

    // 7. The agent resolves it.
    await agent((store, id) => store.agentResolve(id, 'Re-delivered and received.'), id);

    // 8. Business+ shows the resolved state.
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByText(/this ticket has been resolved/i).waitFor({ timeout: 10_000 });

    // 9. The customer reopens it.
    await page.getByRole('button', { name: /reopen ticket/i }).click();
    await page.getByText(/this ticket was reopened/i).waitFor({ timeout: 10_000 });
  });
});

describe('responsive', () => {
  for (const width of [375, 768, 1280]) {
    it(`Support Tickets has no horizontal overflow at ${width}px`, async () => {
      // Carry the signed-in session (localStorage) into the sized context.
      const storageState = await page.context().storageState();
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, storageState });
      const p = await ctx.newPage();
      try {
        await p.goto(`${server.base}/dashboard/support-tickets`, { waitUntil: 'networkidle' });
        await p.locator('table').waitFor({ timeout: 15_000 });

        const overflow = await p.evaluate(
          () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        );
        assert.equal(overflow, false, `page must not scroll horizontally at ${width}px`);
      } finally {
        await ctx.close();
      }
    });
  }
});
