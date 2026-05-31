/**
 * serviceAdvisoriesService — operational notices (pickup cutoffs, weather
 * delays, maintenance windows) for the Service Advisories page.
 *
 * Async facade over the mock data module; swap the body for a real ops/status
 * feed when the backend is available.
 *
 * Future API endpoint:
 *   GET /service-advisories → getAdvisories
 *
 * Source-system note: advisories are authored/published by an operations /
 * status system and delivered via the BFF. The frontend renders them; it does
 * not derive advisory severity/status or affected areas itself.
 */

import {
  getAdvisories as getAdvisoriesData,
  SEVERITY_META,
  STATUS_META,
  type ServiceAdvisory,
  type AdvisorySeverity,
  type AdvisoryStatus,
} from '../data/serviceAdvisories';

export type { ServiceAdvisory, AdvisorySeverity, AdvisoryStatus };
export { SEVERITY_META, STATUS_META };

export interface AdvisoryFilters {
  status?: AdvisoryStatus | 'all';
}

/** Return service advisories, with an optional status filter. */
export async function getAdvisories(
  filters?: AdvisoryFilters
): Promise<ServiceAdvisory[]> {
  let result = [...getAdvisoriesData()];
  if (filters?.status && filters.status !== 'all') {
    result = result.filter((a) => a.status === filters.status);
  }
  return result;
}
