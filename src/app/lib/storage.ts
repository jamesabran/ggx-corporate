// Lightweight, reversible localStorage helpers (frontend/mock only).
// All keys are namespaced under `ggx.`. Failures (private mode, quota, SSR)
// degrade gracefully to in-memory behavior.

const PREFIX = 'ggx.';

export function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function saveState<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignore persistence failures */
  }
}

export function clearState(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

// Session-scoped variants (sessionStorage) — for anything that must survive
// in-tab navigation (e.g. Checkout <-> Cart) but must NEVER outlive the
// browser tab/window, unlike the localStorage helpers above. Use this for
// personally-identifying draft data (name, address, phone) so it never
// lingers for the next person on a shared/public device.

export function loadSessionState<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function saveSessionState<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* ignore persistence failures */
  }
}

export function clearSessionState(key: string): void {
  try {
    sessionStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}
