import { useEffect, useRef, useState } from 'react';
import { getAllProvinces, getAllCities, getAllDistricts, type LocationOption } from '../lib/locationApi';

/**
 * LocationCascadeCells — province → city → barangay cascade rendered as THREE
 * separate table cells (returns a fragment of <td>s). Uses the GGX-supported
 * locations API so delivery locations are validated, not free-text.
 *
 * Shared by the Bulk Upload review/summary error table and the Type in
 * Spreadsheet grid. `compact` switches to the tighter grid cell styling; pass
 * `errors` to flag required-but-empty fields (red borders).
 *
 * Cascade rules: city disabled until province chosen; barangay disabled until
 * city chosen; changing a parent resets its children. If the API is unreachable
 * (CORS/network), the cells fall back to plain text inputs automatically.
 */

const TABLE_SELECT_CLS =
  'w-full h-8 px-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed';
const TABLE_INPUT_BASE = 'w-full h-8 px-2 rounded-md border text-sm focus:outline-none focus:ring-1';

export interface LocationCascadeCellsProps {
  province: string;
  city: string;
  barangay: string;
  onChange: (province: string, city: string, barangay: string) => void;
  /** Tighter cell styling for the in-app spreadsheet grid. */
  compact?: boolean;
  /** Width utility applied to each of the 3 cells (e.g. 'w-40') in compact grids. */
  widthClass?: string;
  /** Required-but-empty flags → red borders (grid validation). */
  errors?: { province?: boolean; city?: boolean; barangay?: boolean };
}

export function LocationCascadeCells({
  province, city, barangay, onChange, compact = false, widthClass, errors,
}: LocationCascadeCellsProps) {
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [cityId,     setCityId]     = useState<number | null>(null);
  const [provinces,  setProvinces]  = useState<LocationOption[]>([]);
  const [cities,     setCities]     = useState<LocationOption[]>([]);
  const [districts,  setDistricts]  = useState<LocationOption[]>([]);
  const [loadingP,   setLoadingP]   = useState(true);
  const [loadingC,   setLoadingC]   = useState(false);
  const [loadingD,   setLoadingD]   = useState(false);
  const [apiError,   setApiError]   = useState(false);

  const cityRef = useRef(city); cityRef.current = city;

  useEffect(() => {
    getAllProvinces()
      .then((data) => {
        setProvinces(data);
        const match = data.find((p) => p.name === province);
        if (match) setProvinceId(match.id);
      })
      .catch(() => setApiError(true))
      .finally(() => setLoadingP(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevProvinceIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (!provinceId) { setCities([]); setCityId(null); return; }
    setLoadingC(true);
    setCities([]);
    const isFirstLoad = prevProvinceIdRef.current === null;
    prevProvinceIdRef.current = provinceId;

    getAllCities(provinceId)
      .then((data) => {
        setCities(data);
        if (isFirstLoad) {
          const match = data.find((c) => c.name === cityRef.current);
          if (match) setCityId(match.id);
        } else {
          setCityId(null);
        }
      })
      .catch(() => setApiError(true))
      .finally(() => setLoadingC(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceId]);

  useEffect(() => {
    if (!cityId) { setDistricts([]); return; }
    setLoadingD(true);
    setDistricts([]);
    getAllDistricts(cityId)
      .then(setDistricts)
      .catch(() => setApiError(true))
      .finally(() => setLoadingD(false));
  }, [cityId]);

  const handleProvince = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setProvinceId(provinces.find((p) => p.name === name)?.id ?? null);
    onChange(name, '', '');
  };
  const handleCity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setCityId(cities.find((c) => c.name === name)?.id ?? null);
    onChange(province, name, '');
  };
  const handleBarangay = (e: React.ChangeEvent<HTMLSelectElement>) =>
    onChange(province, city, e.target.value);

  const tdCls = compact
    ? `px-1 py-1 align-top${widthClass ? ` ${widthClass}` : ''}`
    : 'px-3 py-2.5 align-top';
  const selCls = (err?: boolean) =>
    compact
      ? `w-full h-8 px-2 rounded border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 ${err ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-200'}`
      : `${TABLE_SELECT_CLS}${err ? ' border-red-500 ring-1 ring-red-500 bg-red-50' : ''}`;
  const txtCls = (err?: boolean) =>
    compact
      ? `w-full h-8 px-2 rounded border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 ${err ? 'border-red-400 ring-1 ring-red-300' : 'border-gray-200'}`
      : `${TABLE_INPUT_BASE} ${err ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-primary'}`;

  if (apiError) {
    return (
      <>
        <td className={tdCls}>
          <input value={province} onChange={(e) => onChange(e.target.value, '', '')} placeholder="Province" className={txtCls(errors?.province)} />
          {!compact && <p className="text-xs text-amber-700 mt-0.5">API offline — type manually</p>}
        </td>
        <td className={tdCls}>
          <input value={city} onChange={(e) => onChange(province, e.target.value, '')} placeholder="City / Municipality" className={txtCls(errors?.city)} />
        </td>
        <td className={tdCls}>
          <input value={barangay} onChange={(e) => onChange(province, city, e.target.value)} placeholder="Barangay" className={txtCls(errors?.barangay)} />
        </td>
      </>
    );
  }

  return (
    <>
      <td className={tdCls}>
        <select value={province} onChange={handleProvince} disabled={loadingP} className={selCls(errors?.province)}>
          <option value="">{loadingP ? 'Loading…' : 'Select province'}</option>
          {provinces.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>
      </td>
      <td className={tdCls}>
        <select value={city} onChange={handleCity} disabled={!province || loadingC} className={selCls(errors?.city)}>
          <option value="">{loadingC ? 'Loading…' : !province ? 'Select province first' : 'Select city'}</option>
          {cities.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </td>
      <td className={tdCls}>
        <select value={barangay} onChange={handleBarangay} disabled={!city || loadingD} className={selCls(errors?.barangay)}>
          <option value="">{loadingD ? 'Loading…' : !city ? 'Select city first' : 'Select barangay'}</option>
          {districts.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
      </td>
    </>
  );
}
