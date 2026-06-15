// Saved Bulk Upload column-mapping templates — FRONTEND/MOCK ONLY.
//
// Persists confirmed column mappings locally (via the shared localStorage helper)
// so the next upload of a file with the same — or similar — headers can be
// pre-filled with the user's previous mapping instead of relying on auto-match
// alone. There is no backend mapping-template contract yet; scope (Main Account /
// Subaccount / shared) and server persistence remain deferred (see
// docs/context/future-backlog.md §3–4).

import { loadState, saveState } from './storage';

const STORAGE_KEY = 'bulkColumnMapping.templates';
// Minimum header-set overlap (Jaccard) to treat two files as "similar".
const SIMILARITY_THRESHOLD = 0.6;

export interface ColumnMappingTemplate {
  id: string;
  /** Human-readable label (demo-generated; not user-edited yet). */
  name: string;
  /**
   * Account scope that owns this template: 'main' for Main Account, or a
   * subaccount id. Templates are suggested to their owning scope first, then to
   * any account-level shared templates. (Mock — real scope/sharing contract is
   * deferred; see docs/context/future-backlog.md §4.)
   */
  scopeAccountId: string;
  /** When true, available across the account (not just the owning scope). */
  shared: boolean;
  /** Original uploaded headers (used for similarity matching). */
  headers: string[];
  /** Normalized + sorted header signature (used for exact matching). */
  signature: string;
  /** Field key → uploaded header label. */
  mapping: Record<string, string>;
  createdAt: string;
  lastUsedAt: string;
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Stable signature for a header set (order-independent). */
export function headerSignature(headers: string[]): string {
  return headers.map(norm).filter(Boolean).sort().join('|');
}

/** Jaccard overlap of two normalized header sets (0–1). */
function similarity(a: string[], b: string[]): number {
  const sa = new Set(a.map(norm).filter(Boolean));
  const sb = new Set(b.map(norm).filter(Boolean));
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const x of sa) if (sb.has(x)) inter += 1;
  const union = new Set([...sa, ...sb]).size;
  return inter / union;
}

export function listTemplates(): ColumnMappingTemplate[] {
  return loadState<ColumnMappingTemplate[]>(STORAGE_KEY, []);
}

/** Best exact-or-similar match within a candidate list (null if none qualifies). */
function matchInList(headers: string[], list: ColumnMappingTemplate[]): ColumnMappingTemplate | null {
  if (list.length === 0) return null;
  const sig = headerSignature(headers);
  const exact = list.find((t) => t.signature === sig);
  if (exact) return exact;

  let best: ColumnMappingTemplate | null = null;
  let bestScore = 0;
  for (const t of list) {
    const score = similarity(headers, t.headers);
    if (score > bestScore) { bestScore = score; best = t; }
  }
  return bestScore >= SIMILARITY_THRESHOLD ? best : null;
}

/**
 * Find the best saved template for these headers, scoped by account when
 * provided: prefer templates owned by the active scope, then account-level
 * shared templates. Within each tier an exact signature match wins, otherwise
 * the most similar template above the threshold. Returns null when nothing
 * suitable is saved.
 */
export function findTemplateForHeaders(
  headers: string[],
  scopeAccountId?: string,
): ColumnMappingTemplate | null {
  const all = listTemplates();
  if (all.length === 0) return null;

  if (!scopeAccountId) return matchInList(headers, all);

  // 1) Templates saved by this scope, then 2) shared account-level templates.
  const own = matchInList(headers, all.filter((t) => t.scopeAccountId === scopeAccountId));
  if (own) return own;
  return matchInList(headers, all.filter((t) => t.shared && t.scopeAccountId !== scopeAccountId));
}

export interface SaveTemplateOptions {
  /** Owning account scope ('main' or a subaccount id). Defaults to 'main'. */
  scopeAccountId?: string;
  /** Make available across the account (Main Account action; deferred UI). */
  shared?: boolean;
  name?: string;
}

/**
 * Upsert a template for a header set within a scope. Matching by exact signature
 * AND owning scope: an existing same-scope template is updated rather than
 * duplicated, so a subaccount's mapping never overwrites another scope's.
 */
export function saveTemplateForHeaders(
  headers: string[],
  mapping: Record<string, string>,
  opts: SaveTemplateOptions = {},
): ColumnMappingTemplate {
  const scopeAccountId = opts.scopeAccountId ?? 'main';
  const templates = listTemplates();
  const sig = headerSignature(headers);
  const now = new Date().toISOString();
  const cleaned = Object.fromEntries(Object.entries(mapping).filter(([, v]) => !!v));

  const existing = templates.find((t) => t.signature === sig && t.scopeAccountId === scopeAccountId);
  if (existing) {
    existing.mapping = cleaned;
    existing.headers = headers;
    existing.lastUsedAt = now;
    if (opts.shared !== undefined) existing.shared = opts.shared;
    if (opts.name) existing.name = opts.name;
    saveState(STORAGE_KEY, templates);
    return existing;
  }

  const created: ColumnMappingTemplate = {
    id: `tpl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: opts.name ?? `Mapping for ${headers.length} columns`,
    scopeAccountId,
    shared: opts.shared ?? false,
    headers,
    signature: sig,
    mapping: cleaned,
    createdAt: now,
    lastUsedAt: now,
  };
  saveState(STORAGE_KEY, [created, ...templates]);
  return created;
}
