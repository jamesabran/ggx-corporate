/**
 * Activation/approval requests for account add-ons that can't be self-enabled
 * (approval- or contract-gated modules). Session-only store keyed by
 * scope + module. In production these are backend-owned and the BFF returns the
 * request status (submitted → in review → approved/declined). See
 * docs/contract_module_rules.md.
 */

export type ModuleRequestKind = 'request_approval' | 'request_activation';
export type ModuleRequestStatus = 'in_review' | 'approved';

export interface ModuleRequest {
  moduleId: string;
  /** Normalized scope id ('main' when consolidated/undefined). */
  scopeId: string;
  kind: ModuleRequestKind;
  status: ModuleRequestStatus;
  submittedAt: string;
}

const SCOPE_FALLBACK = 'main';
const normScope = (s: string | undefined) => s ?? SCOPE_FALLBACK;
const key = (scopeId: string | undefined, moduleId: string) => `${normScope(scopeId)}:${moduleId}`;

const requests: Record<string, ModuleRequest> = {};

/** Return the active request for a module in a scope, if any. */
export function getModuleRequest(scopeId: string | undefined, moduleId: string): ModuleRequest | undefined {
  return requests[key(scopeId, moduleId)];
}

/** Record a submitted request (moves straight to "in review" in the demo). */
export function submitModuleRequest(
  scopeId: string | undefined,
  moduleId: string,
  kind: ModuleRequestKind,
): ModuleRequest {
  const req: ModuleRequest = {
    moduleId,
    scopeId: normScope(scopeId),
    kind,
    status: 'in_review',
    submittedAt: new Date().toISOString(),
  };
  requests[key(scopeId, moduleId)] = req;
  return req;
}

/**
 * Demo-only: simulate the GGX account team approving a submitted request. Flips
 * the request to `approved`, which the module catalog reads as enabled/available.
 */
export function approveModuleRequest(scopeId: string | undefined, moduleId: string): ModuleRequest | undefined {
  const existing = requests[key(scopeId, moduleId)];
  if (!existing) return undefined;
  existing.status = 'approved';
  return existing;
}
