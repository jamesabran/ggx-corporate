// GGX pickup-location API service.
//
// Pickup bookings must use GGX pickup-supported locations only, so every
// request is scoped with `pickup=quad-x`. The same endpoints WITHOUT that
// query param return all locations (including non-pickup areas) and must not
// be used as the pickup-location source.
//
// Endpoints (all return the same paginated envelope):
//   GET /v1/locations/provinces?pickup=quad-x
//   GET /v1/locations/provinces/{provinceId}/cities?pickup=quad-x
//   GET /v1/locations/cities/{cityId}/districts?pickup=quad-x

const BASE_URL = 'https://api.gogox.ph/v1';

// Fetch a generous page size so the full list arrives in a single request.
// Current data volumes are well under this (provinces ~7, cities ~17,
// districts up to ~188), so client-side pagination is unnecessary.
const PER_PAGE = 1000;

/** Raw item shape returned by the GGX locations API. */
export interface LocationApiItem {
  id: number;
  name: string;
  type: 'province' | 'city' | 'district' | string;
  parent_id: number | null;
  postal_code: string;
  pickup: string[];
  delivery: string[];
  odz: boolean;
}

/** Paginated envelope wrapping the `data` array. */
interface LocationApiResponse {
  data: LocationApiItem[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

/** Normalized option used by the UI selects. */
export interface LocationOption {
  id: number;
  name: string;
  /** Postal/ZIP code when provided by the API ("" when absent). */
  postalCode: string;
}

function toOption(item: LocationApiItem): LocationOption {
  // The API returns the string "null" (not a real null) when no code exists.
  const postal = item.postal_code && item.postal_code !== 'null' ? item.postal_code : '';
  return { id: item.id, name: item.name, postalCode: postal };
}

async function doFetch(url: string): Promise<LocationOption[]> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Location request failed (${res.status} ${res.statusText})`);
  }
  const body = (await res.json()) as LocationApiResponse;
  if (!body || !Array.isArray(body.data)) {
    throw new Error('Unexpected location response shape');
  }
  return body.data.map(toOption).sort((a, b) => a.name.localeCompare(b.name));
}

/** Pickup-only endpoint (pickup=quad-x). Used for sender/pickup address selection. */
async function fetchLocations(path: string): Promise<LocationOption[]> {
  const sep = path.includes('?') ? '&' : '?';
  return doFetch(`${BASE_URL}${path}${sep}pickup=quad-x&per_page=${PER_PAGE}&extended=1`);
}

/** All-locations endpoint (no pickup filter). Used for recipient/delivery address selection. */
async function fetchLocationsAll(path: string): Promise<LocationOption[]> {
  const sep = path.includes('?') ? '&' : '?';
  return doFetch(`${BASE_URL}${path}${sep}per_page=${PER_PAGE}&extended=1`);
}

/** Pickup-supported provinces. */
export function getProvinces(): Promise<LocationOption[]> {
  return fetchLocations('/locations/provinces');
}

/** Pickup-supported cities/municipalities within a province. */
export function getCities(provinceId: number): Promise<LocationOption[]> {
  return fetchLocations(`/locations/provinces/${provinceId}/cities`);
}

/** Pickup-supported districts/barangays within a city. */
export function getDistricts(cityId: number): Promise<LocationOption[]> {
  return fetchLocations(`/locations/cities/${cityId}/districts`);
}

// ---------------------------------------------------------------------------
// Delivery / recipient address variants (no pickup filter).
// Use these when selecting a delivery recipient address — all GGX-served
// locations are valid, not just pickup-supported ones.
// ---------------------------------------------------------------------------

/** All provinces served by GGX (for recipient delivery address). */
export function getAllProvinces(): Promise<LocationOption[]> {
  return fetchLocationsAll('/locations/provinces');
}

/** All cities within a province (for recipient delivery address). */
export function getAllCities(provinceId: number): Promise<LocationOption[]> {
  return fetchLocationsAll(`/locations/provinces/${provinceId}/cities`);
}

/** All districts/barangays within a city (for recipient delivery address). */
export function getAllDistricts(cityId: number): Promise<LocationOption[]> {
  return fetchLocationsAll(`/locations/cities/${cityId}/districts`);
}
