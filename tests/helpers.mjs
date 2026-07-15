/**
 * Test harness for the Business+ ↔ HeyQ integration.
 *
 * Uses Node's built-in test runner (`node --test`) driving the `playwright`
 * library that is already a devDependency — no new test framework.
 *
 * Service-level assertions run INSIDE the page via dynamic import of the Vite-
 * served module (`import('/src/app/services/heyqService.ts')`). Vite transforms
 * the TypeScript on request, so we get real module-level access to the adapter
 * and the mock HeyQ backend — the same instances the running app uses — without
 * a bundler or a second toolchain.
 */
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const HOST = '127.0.0.1';

/** Start a Vite dev server on `port` and resolve once it answers. */
export async function startDevServer(port) {
  const proc = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['vite', '--port', String(port), '--strictPort', '--host', HOST],
    { cwd: process.cwd(), stdio: 'ignore', shell: process.platform === 'win32' },
  );

  const base = `http://${HOST}:${port}`;
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(base, { signal: AbortSignal.timeout(1000) });
      if (res.ok) return { proc, base };
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  proc.kill();
  throw new Error(`Vite dev server did not start on ${base}`);
}

export function stopDevServer(server) {
  if (!server?.proc) return;
  // Kill the whole tree on Windows; vite spawns children.
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(server.proc.pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    server.proc.kill('SIGTERM');
  }
}

export const CREDENTIALS = {
  admin: { email: 'max@email.com', password: '!1234qwer' },
  manager: { email: 'manager@email.com', password: '!1234qwer' },
};

/** Launch a browser and sign in, returning a page parked on the dashboard. */
export async function signIn(base, who = 'admin', viewport = { width: 1280, height: 900 }) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();

  const { email, password } = CREDENTIALS[who];
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.click('button[type=submit]');
  await page.waitForURL('**/dashboard**', { timeout: 15_000 });

  return { browser, context, page };
}

/**
 * Capture window.open calls instead of actually opening HeyQ, so a handoff can
 * be asserted on without launching the HeyQ app. Reloads once so the init script
 * applies (the session lives in localStorage, so we stay signed in).
 *
 * Returns a getter for the URLs the app tried to hand off to.
 */
export async function captureHandoffs(page) {
  await page.addInitScript(() => {
    window.__handoffs = [];
    window.open = (url) => {
      window.__handoffs.push(String(url));
      return null;
    };
  });
  await page.reload({ waitUntil: 'networkidle' });
  return async () => page.evaluate(() => window.__handoffs ?? []);
}

/**
 * Add a HeyQ-customer-API fetch stub to a page, so the UI renders real API-shaped
 * tickets without a live HeyQ. Intercepts GET /api/customer/tickets (list) and
 * /api/customer/tickets/:id (detail); everything else falls through to the real
 * fetch. Registered as an init script, so it must be added BEFORE the navigation
 * it should affect (no reload here).
 */
export async function addHeyQApiStubScript(page, tickets) {
  await page.addInitScript((tickets) => {
    const orig = window.fetch.bind(window);
    window.fetch = async (url, init) => {
      const u = String(url);
      if (u.includes('/api/customer/tickets')) {
        const path = new URL(u, 'http://x').pathname;
        const m = path.match(/\/api\/customer\/tickets\/([^/]+)$/);
        if (m) {
          const id = decodeURIComponent(m[1]);
          const t = tickets.find((x) => x.id === id || x.reference === id);
          return new Response(JSON.stringify(t ?? { error: 'Ticket not found' }), {
            status: t ? 200 : 404,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify(tickets), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return orig(url, init);
    };
  }, tickets);
}

/** Add the stub and reload so it takes effect on the current page. */
export async function installHeyQApiStub(page, tickets) {
  await addHeyQApiStubScript(page, tickets);
  await page.reload({ waitUntil: 'networkidle' });
}
