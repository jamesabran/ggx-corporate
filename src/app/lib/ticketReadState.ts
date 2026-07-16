/**
 * ticketReadState — customer-side "seen" tracking for support tickets.
 *
 * Unread is a CUSTOMER-UI concern only: HeyQ owns the ticket, and Business+ holds
 * no ticket state, so "have I seen the latest activity?" is tracked here in
 * localStorage rather than round-tripped to HeyQ. It stores nothing privileged —
 * just a per-ticket last-seen `updatedAt` timestamp, namespaced per requester so
 * switching accounts never bleeds read state.
 *
 * Model: a ticket is UNREAD when its current `updatedAt` is newer than the
 * last-seen timestamp we recorded. The first time we ever see a ticket we seed
 * its baseline at the current `updatedAt` (so a first visit isn't a wall of
 * unread); every later agent reply advances `updatedAt` past the baseline and
 * marks it unread until the requester opens it.
 */
import { loadState, saveState } from './storage';

type SeenMap = Record<string, string>; // ticketId → last-seen updatedAt (ISO)

const keyFor = (scope: string) => `ticketSeen.${scope || 'anon'}`;

function read(scope: string): SeenMap {
  return loadState<SeenMap>(keyFor(scope), {});
}

/**
 * Given the current tickets, return the set of UNREAD ticket ids and seed a
 * baseline for any ticket seen for the first time. Call on every list fetch.
 */
export function computeUnread(
  scope: string,
  tickets: { id: string; lastUpdate: string }[],
): Set<string> {
  const seen = read(scope);
  const unread = new Set<string>();
  let changed = false;

  for (const t of tickets) {
    const baseline = seen[t.id];
    if (baseline == null) {
      seen[t.id] = t.lastUpdate; // first sighting → treat as already seen
      changed = true;
      continue;
    }
    if (new Date(t.lastUpdate).getTime() > new Date(baseline).getTime()) {
      unread.add(t.id);
    }
  }

  if (changed) saveState(keyFor(scope), seen);
  return unread;
}

/** Mark a ticket seen up to `updatedAt` (called when the requester opens it). */
export function markTicketSeen(scope: string, ticketId: string, updatedAt: string): void {
  const seen = read(scope);
  const current = seen[ticketId];
  if (current != null && new Date(current).getTime() >= new Date(updatedAt).getTime()) return;
  seen[ticketId] = updatedAt;
  saveState(keyFor(scope), seen);
}
