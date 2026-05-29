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
