/**
 * heyqRealtimeClient — the Business+ customer WebSocket client for one ticket.
 *
 * This is the smallest reusable client the live-conversation feature needs. It
 * speaks HeyQ's realtime protocol (HeyQ/docs/realtime-conversations.md) as a
 * CUSTOMER subscriber bound to a SINGLE authorized ticket:
 *
 *   1. mint a short-lived, single-use, ticket-scoped token over REST (injected as
 *      `mintToken`) — knowing a ticket id is never enough,
 *   2. connect to `wss://<api>/api/realtime` carrying NO credentials in the URL,
 *   3. `auth` with the token, then `subscribe` to the one ticket,
 *   4. forward customer-safe events to `onEvent`,
 *   5. reconnect automatically with backoff, re-minting a token each attempt, and
 *      fire `onResubscribed` so the caller can REFETCH and recover missed events.
 *
 * It owns no conversation state and never persists anything — replies still go
 * over REST. It uses the global `WebSocket`, so a stub can drive it in tests.
 *
 * Security boundary: it subscribes only to the bound ticket, forwards only the
 * four customer-safe event types (`message.created`, `ticket.status_changed`,
 * `typing.started`, `typing.stopped`) and drops everything else — an
 * `assignment_changed` frame, were one ever delivered, is discarded here.
 */
import type { CustomerRealtimeEvent, CustomerRealtimeEventType } from './heyqService';

/** Connection lifecycle, surfaced to the UI for reconnect/delayed-sync feedback. */
export type RealtimeStatus = 'connecting' | 'open' | 'reconnecting' | 'closed';

export interface RealtimeClientOptions {
  /** `wss://<api-origin>/api/realtime` (from `getHeyQRealtimeUrl`). */
  url: string;
  /** The one ticket this client is authorized for. */
  ticketId: string;
  /**
   * Mint a fresh connection token (called once per connect attempt). Returns the
   * token, or null when the requester may no longer see the ticket / is offline —
   * the client then backs off and retries; the REST layer stays authoritative.
   */
  mintToken: () => Promise<string | null>;
  /** A customer-safe realtime event arrived (already type-filtered). */
  onEvent: (event: CustomerRealtimeEvent) => void;
  /** Connection status changed. */
  onStatus?: (status: RealtimeStatus) => void;
  /** Fired after each successful (re)subscribe — the caller should refetch. */
  onResubscribed?: () => void;
}

export interface RealtimeClient {
  /** Begin connecting. Idempotent. */
  start(): void;
  /** Emit a typing signal (no-op when the socket isn't open). */
  sendTyping(state: 'start' | 'stop'): void;
  /** Unsubscribe, close, and stop reconnecting. Idempotent. */
  stop(): void;
}

const CUSTOMER_SAFE_EVENT_TYPES: ReadonlySet<CustomerRealtimeEventType> = new Set([
  'message.created',
  'ticket.status_changed',
  'typing.started',
  'typing.stopped',
]);

const AUTH_TIMEOUT_MS = 10_000; // server closes an un-authed socket at 10s; fail first
const HEARTBEAT_MS = 25_000;
const BACKOFF_BASE_MS = 1_000;
const BACKOFF_MAX_MS = 15_000;

function isRealtimeEvent(value: unknown): value is CustomerRealtimeEvent {
  if (!value || typeof value !== 'object') return false;
  const e = value as Partial<CustomerRealtimeEvent>;
  return (
    typeof e.id === 'string' &&
    typeof e.type === 'string' &&
    typeof e.ticketId === 'string' &&
    typeof e.serverTimestamp === 'string'
  );
}

/**
 * Create (but do not yet start) a realtime client for one ticket. Call `start()`
 * to connect and `stop()` to tear everything down — both are safe to call once.
 */
export function createHeyQRealtimeClient(opts: RealtimeClientOptions): RealtimeClient {
  let ws: WebSocket | null = null;
  let stopped = false;
  let attempts = 0;
  /** Bumped on every (re)connect so a late callback from a stale socket is ignored. */
  let generation = 0;
  let authTimer: ReturnType<typeof setTimeout> | undefined;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  let heartbeatTimer: ReturnType<typeof setInterval> | undefined;

  const setStatus = (status: RealtimeStatus) => opts.onStatus?.(status);

  const clearTimers = () => {
    if (authTimer) { clearTimeout(authTimer); authTimer = undefined; }
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = undefined; }
    if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = undefined; }
  };

  const send = (obj: unknown) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(obj));
    }
  };

  /** Close the current socket without triggering a user-visible status change. */
  const teardownSocket = () => {
    if (authTimer) { clearTimeout(authTimer); authTimer = undefined; }
    if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = undefined; }
    if (ws) {
      // Detach handlers so a close we initiate can't schedule a reconnect.
      ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null;
      try { ws.close(); } catch { /* already closing */ }
      ws = null;
    }
  };

  const scheduleReconnect = () => {
    if (stopped) return;
    setStatus('reconnecting');
    // Exponential backoff with jitter, capped — so a persistent outage doesn't spin.
    const delay = Math.min(BACKOFF_BASE_MS * 2 ** attempts, BACKOFF_MAX_MS);
    const jitter = Math.random() * 0.3 * delay;
    attempts += 1;
    reconnectTimer = setTimeout(connect, delay + jitter);
  };

  const onFrame = (myGen: number, raw: string) => {
    if (myGen !== generation || stopped) return;
    let msg: { t?: string; audience?: string; event?: unknown; reason?: string };
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    switch (msg.t) {
      case 'welcome':
        return; // informational
      case 'auth_ok':
        if (authTimer) { clearTimeout(authTimer); authTimer = undefined; }
        send({ t: 'subscribe', ticketId: opts.ticketId });
        return;
      case 'auth_error':
        // Bad/expired token — drop and retry with a fresh one.
        teardownSocket();
        scheduleReconnect();
        return;
      case 'subscribed':
        attempts = 0; // healthy connection — reset backoff
        setStatus('open');
        opts.onResubscribed?.();
        return;
      case 'sub_error':
        // The ticket isn't visible to us (forbidden / not_found). Retrying won't
        // help immediately; back off and let the REST layer show the real state.
        teardownSocket();
        scheduleReconnect();
        return;
      case 'pong':
        return;
      case 'event': {
        if (!isRealtimeEvent(msg.event)) return;
        const event = msg.event;
        if (event.ticketId !== opts.ticketId) return; // never our concern
        if (!CUSTOMER_SAFE_EVENT_TYPES.has(event.type)) return; // drop agent-only/unknown
        opts.onEvent(event);
        return;
      }
    }
  };

  async function connect(): Promise<void> {
    if (stopped) return;
    reconnectTimer = undefined;
    setStatus(attempts === 0 ? 'connecting' : 'reconnecting');

    const token = await opts.mintToken();
    if (stopped) return;
    if (!token) {
      scheduleReconnect(); // couldn't mint (offline / not visible) — try again later
      return;
    }

    const myGen = ++generation;
    let socket: WebSocket;
    try {
      socket = new WebSocket(opts.url);
    } catch {
      scheduleReconnect();
      return;
    }
    ws = socket;

    socket.onopen = () => {
      if (myGen !== generation || stopped) return;
      send({ t: 'auth', token });
      // If auth never lands, the server closes at 10s; pre-empt so we recover faster.
      authTimer = setTimeout(() => {
        if (myGen === generation && !stopped) { teardownSocket(); scheduleReconnect(); }
      }, AUTH_TIMEOUT_MS);
      // Keep the connection warm through idle proxies.
      heartbeatTimer = setInterval(() => send({ t: 'ping' }), HEARTBEAT_MS);
    };
    socket.onmessage = (ev) => onFrame(myGen, typeof ev.data === 'string' ? ev.data : String(ev.data));
    socket.onerror = () => { /* surfaced via onclose */ };
    socket.onclose = () => {
      if (myGen !== generation || stopped) return;
      if (authTimer) { clearTimeout(authTimer); authTimer = undefined; }
      if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = undefined; }
      ws = null;
      scheduleReconnect();
    };
  }

  return {
    start() {
      if (stopped || ws || reconnectTimer) return;
      attempts = 0;
      void connect();
    },
    sendTyping(state) {
      send({ t: 'typing', ticketId: opts.ticketId, state });
    },
    stop() {
      if (stopped) return;
      stopped = true;
      // Best-effort graceful teardown before closing.
      send({ t: 'typing', ticketId: opts.ticketId, state: 'stop' });
      send({ t: 'unsubscribe', ticketId: opts.ticketId });
      generation += 1; // invalidate any in-flight callbacks
      clearTimers();
      teardownSocket();
      setStatus('closed');
    },
  };
}
