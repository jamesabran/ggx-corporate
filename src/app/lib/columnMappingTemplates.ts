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

/**
 * Find the best saved template for these headers: an exact signature match wins;
 * otherwise the most similar template above the similarity threshold. Returns
 * null when nothing suitable is saved.
 */
export function findTemplateForHeaders(headers: string[]): ColumnMappingTemplate | null {
  const templates = listTemplates();
  if (templates.length === 0) return null;

  const sig = headerSignature(headers);
  const exact = templates.find((t) => t.signature === sig);
  if (exact) return exact;

  let best: ColumnMappingTemplate | null = null;
  let bestScore = 0;
  for (const t of templates) {
    const score = similarity(headers, t.headers);
    if (score > bestScore) { bestScore = score; best = t; }
  }
  return bestScore >= SIMILARITY_THRESHOLD ? best : null;
}

/**
 * Upsert a template for a header set. Matching by exact signature: an existing
 * template is updated (mapping + lastUsedAt) rather than duplicated.
 */
export function saveTemplateForHeaders(
  headers: string[],
  mapping: Record<string, string>,
  name?: string,
): ColumnMappingTemplate {
  const templates = listTemplates();
  const sig = headerSignature(headers);
  const now = new Date().toISOString();
  const cleaned = Object.fromEntries(Object.entries(mapping).filter(([, v]) => !!v));

  const existing = templates.find((t) => t.signature === sig);
  if (existing) {
    existing.mapping = cleaned;
    existing.headers = headers;
    existing.lastUsedAt = now;
    if (name) existing.name = name;
    saveState(STORAGE_KEY, templates);
    return existing;
  }

  const created: ColumnMappingTemplate = {
    id: `tpl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name ?? `Mapping for ${headers.length} columns`,
    headers,
    signature: sig,
    mapping: cleaned,
    createdAt: now,
    lastUsedAt: now,
  };
  saveState(STORAGE_KEY, [created, ...templates]);
  return created;
}
