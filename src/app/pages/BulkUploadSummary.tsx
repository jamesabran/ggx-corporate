import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import {
  IconArrowLeft, IconCircleCheck, IconCircleX, IconAlertCircle,
  IconDownload, IconArrowRight, IconUpload, IconTruckDelivery, IconBuildingStore,
  IconMapPin, IconRefresh, IconInfoCircle, IconClock, IconPhone, IconTrash,
} from '@tabler/icons-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Dialog } from '../components/ui/Dialog';
import { PaymentMethodTabs, type SelectedPaymentMethod } from '../components/PaymentMethodTabs';
import { DROPOFF_LOCATIONS } from '../data/dropoffLocations';
import { isBillingAccount } from '../data/paymentAccounts';
import { getBulkUploadById } from '../services/bulkUploadService';
import { RECEPTACLE_SIZES } from '../data/bulkTemplate';
import { getAllProvinces, getAllCities, getAllDistricts, type LocationOption } from '../lib/locationApi';
import { useSubAccounts } from '../contexts/SubAccountContext';

// ---------------------------------------------------------------------------
// Shared field styles for the editable error table.
// Inputs and selects use a smaller, consistent radius (rounded-md) so they
// read well in compact table cells. Red/invalid state preserved per-field.
// ---------------------------------------------------------------------------

const TABLE_INPUT_BASE  = 'w-full h-8 px-2 rounded-md border text-sm focus:outline-none focus:ring-1';
const TABLE_SELECT_CLS  = 'w-full h-8 px-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed';

// Compact inline text input for the error table.
function ErrInput({ value, onChange, error, placeholder }: {
  value: string; onChange: (v: string) => void; error: boolean; placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${TABLE_INPUT_BASE} ${
        error ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-primary'
      }`}
    />
  );
}

// Compact segmented Yes/No control used for COD?, Recipient Pays Fees, and
// Insure full item value?. Supports an unset state (value === '') so required
// fields can show a red border until the user picks Yes or No.
function YesNoToggle({ value, onChange, error = false }: {
  value: string; onChange: (v: string) => void; error?: boolean;
}) {
  return (
    <div className={`inline-flex rounded-md border overflow-hidden ${error ? 'border-red-500' : 'border-gray-300'}`}>
      {['Yes', 'No'].map((opt, i) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`px-3 h-8 text-xs font-medium transition-colors ${i === 0 ? 'border-r border-gray-300' : ''} ${
              selected ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LocationCascadeCells — province → city → barangay cascade rendered as THREE
// separate table cells (returns a fragment of <td>s). Uses the non-pickup-
// filtered API endpoints so all GGX-served delivery locations are available.
//
// Cascade rules: city disabled until province chosen; barangay disabled until
// city chosen; changing a parent resets its children.
//
// CORS note: if the API is unreachable from the browser, the cells fall back to
// plain text inputs automatically (documented blocker).
// ---------------------------------------------------------------------------

interface LocationCascadeCellsProps {
  province: string;
  city: string;
  barangay: string;
  onChange: (province: string, city: string, barangay: string) => void;
}

function LocationCascadeCells({ province, city, barangay, onChange }: LocationCascadeCellsProps) {
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [cityId,     setCityId]     = useState<number | null>(null);
  const [provinces,  setProvinces]  = useState<LocationOption[]>([]);
  const [cities,     setCities]     = useState<LocationOption[]>([]);
  const [districts,  setDistricts]  = useState<LocationOption[]>([]);
  const [loadingP,   setLoadingP]   = useState(true);
  const [loadingC,   setLoadingC]   = useState(false);
  const [loadingD,   setLoadingD]   = useState(false);
  const [apiError,   setApiError]   = useState(false);

  // Latest city value without making it an effect dependency (avoids refetch on edits).
  const cityRef = useRef(city); cityRef.current = city;

  // 1. Provinces on mount → pre-select matching province.
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

  // 2. Cities when provinceId changes → pre-select city on first load only.
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

  // 3. Districts/barangays when cityId changes.
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
    onChange(name, '', ''); // reset city + barangay
  };
  const handleCity = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    setCityId(cities.find((c) => c.name === name)?.id ?? null);
    onChange(province, name, ''); // reset barangay
  };
  const handleBarangay = (e: React.ChangeEvent<HTMLSelectElement>) =>
    onChange(province, city, e.target.value);

  // Fallback: API unreachable (CORS / network) — plain editable text inputs.
  if (apiError) {
    return (
      <>
        <td className="px-3 py-2.5 align-top">
          <input value={province} onChange={(e) => onChange(e.target.value, '', '')} placeholder="Province" className={`${TABLE_INPUT_BASE} border-gray-300 focus:ring-primary`} />
          <p className="text-xs text-amber-700 mt-0.5">API offline — type manually</p>
        </td>
        <td className="px-3 py-2.5 align-top">
          <input value={city} onChange={(e) => onChange(province, e.target.value, '')} placeholder="City / Municipality" className={`${TABLE_INPUT_BASE} border-gray-300 focus:ring-primary`} />
        </td>
        <td className="px-3 py-2.5 align-top">
          <input value={barangay} onChange={(e) => onChange(province, city, e.target.value)} placeholder="Barangay" className={`${TABLE_INPUT_BASE} border-gray-300 focus:ring-primary`} />
        </td>
      </>
    );
  }

  return (
    <>
      {/* Province */}
      <td className="px-3 py-2.5 align-top">
        <select value={province} onChange={handleProvince} disabled={loadingP} className={TABLE_SELECT_CLS}>
          <option value="">{loadingP ? 'Loading…' : 'Select province'}</option>
          {provinces.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>
      </td>
      {/* City/Municipality */}
      <td className="px-3 py-2.5 align-top">
        <select value={city} onChange={handleCity} disabled={!province || loadingC} className={TABLE_SELECT_CLS}>
          <option value="">{loadingC ? 'Loading…' : !province ? 'Select province first' : 'Select city'}</option>
          {cities.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
      </td>
      {/* Barangay */}
      <td className="px-3 py-2.5 align-top">
        <select value={barangay} onChange={handleBarangay} disabled={!city || loadingD} className={TABLE_SELECT_CLS}>
          <option value="">{loadingD ? 'Loading…' : !city ? 'Select city first' : 'Select barangay'}</option>
          {districts.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
      </td>
    </>
  );
}

// ---------------------------------------------------------------------------
// Mock data for the review screen
// ---------------------------------------------------------------------------

const VALID_ORDERS = [
  { recipient: 'Lia Santos',   itemName: 'UNO FLIP! Double Sided Card...', itemPrice: 600, feesPaidBy: 'Sender', fees: 120 },
  { recipient: 'Marco Alonzo', itemName: 'UNO FLIP! Double Sided Card...', itemPrice: 600, feesPaidBy: 'Sender', fees: 120 },
  { recipient: 'Tessa Cruz',   itemName: 'UNO FLIP! Double Sided Card...', itemPrice: 600, feesPaidBy: 'Sender', fees: 120 },
  { recipient: 'Rico Mendoza', itemName: 'UNO FLIP! Double Sided Card...', itemPrice: 600, feesPaidBy: 'Sender', fees: 120 },
  { recipient: 'Nina Reyes',   itemName: 'UNO FLIP! Double Sided Card...', itemPrice: 600, feesPaidBy: 'Sender', fees: 120 },
];
const TOTAL_VALID_INITIAL = 100;

// ---------------------------------------------------------------------------
// Error row data — all template columns so reviewers see the full row context.
// ---------------------------------------------------------------------------

interface ErrorRowData {
  row: number;
  errors: string[];
  recipientName: string;
  mobileNumber: string;
  streetAddress: string;
  province: string;
  cityMunicipality: string;
  barangay: string;
  landmarks: string;
  itemName: string;
  pouchSize: string;
  cod: string;               // 'Yes' | 'No' — editable
  codAmount: string;
  insureFull: string;        // 'Yes' | 'No' | '' — editable
  recipientPaysFees: string; // 'Yes' | 'No' — editable
  referenceId: string;
}

// Rows 5 & 6 are duplicates of each other (shared REF-005), otherwise valid —
// removing one leaves the other unique so it revalidates into the valid group.
const INITIAL_ERROR_ROWS: ErrorRowData[] = [
  {
    row: 3,
    errors: ['"Mobile Number" field is required', '"Pouch/box size" field is required', '"Insure full item value?" field is required'],
    recipientName: 'Jen Ramos', mobileNumber: '', streetAddress: '123 Penarubia St.',
    province: 'Metro Manila', cityMunicipality: 'Mandaluyong City', barangay: 'Malamig', landmarks: '–',
    itemName: 'UNO FLIP! Double Sided Card', pouchSize: '', cod: 'No', codAmount: '',
    insureFull: '', recipientPaysFees: 'No', referenceId: '',
  },
  {
    row: 4,
    errors: ['Invalid pouch size', 'COD must not exceed ₱50,000.00'],
    recipientName: 'Rome Jans', mobileNumber: '+639101234567', streetAddress: '2287 Allegro Center, Chinatown',
    province: 'Metro Manila', cityMunicipality: 'Makati City', barangay: 'Bel-Air', landmarks: '–',
    itemName: 'UNO FLIP! Double Sided Card', pouchSize: 'SUPERSIZED', cod: 'Yes', codAmount: '75000',
    insureFull: 'Yes', recipientPaysFees: 'No', referenceId: 'REF-004',
  },
  {
    row: 5,
    errors: ['Possible duplicate of row 6'],
    recipientName: 'Rome Jans', mobileNumber: '+639101234567', streetAddress: '2287 Allegro Center, Chinatown',
    province: 'Metro Manila', cityMunicipality: 'Makati City', barangay: 'Bel-Air', landmarks: '–',
    itemName: 'UNO FLIP! Double Sided Card', pouchSize: 'SMALL', cod: 'Yes', codAmount: '500',
    insureFull: 'No', recipientPaysFees: 'No', referenceId: 'REF-005',
  },
  {
    row: 6,
    errors: ['Possible duplicate of row 5'],
    recipientName: 'Rome Jans', mobileNumber: '+639101234567', streetAddress: '2287 Allegro Center, Chinatown',
    province: 'Metro Manila', cityMunicipality: 'Makati City', barangay: 'Bel-Air', landmarks: '–',
    itemName: 'UNO FLIP! Double Sided Card', pouchSize: 'SMALL', cod: 'Yes', codAmount: '500',
    insureFull: 'No', recipientPaysFees: 'No', referenceId: 'REF-005',
  },
];

type EditableField =
  | 'recipientName' | 'mobileNumber' | 'streetAddress'
  | 'province' | 'cityMunicipality' | 'barangay' | 'landmarks'
  | 'itemName' | 'pouchSize' | 'cod' | 'codAmount'
  | 'insureFull' | 'recipientPaysFees' | 'referenceId';

type RowEdits = Record<EditableField, string>;

function rowToEdits(row: ErrorRowData): RowEdits {
  return {
    recipientName:     row.recipientName,
    mobileNumber:      row.mobileNumber,
    streetAddress:     row.streetAddress,
    province:          row.province,
    cityMunicipality:  row.cityMunicipality,
    barangay:          row.barangay,
    landmarks:         row.landmarks,
    itemName:          row.itemName,
    pouchSize:         row.pouchSize,
    cod:               row.cod,
    codAmount:         row.codAmount,
    insureFull:        row.insureFull,
    recipientPaysFees: row.recipientPaysFees,
    referenceId:       row.referenceId,
  };
}

/**
 * Item Protection Fee.
 * If insured for full value, the full COD amount is covered in case of loss/
 * damage and a fee applies on the value above the free ₱500 tier:
 *   Fee = (COD Amount − 500) × 0.01   (only when Insure = Yes and COD > 500)
 * Otherwise the free ₱500 coverage applies and the fee is ₱0.
 */
function computeItemProtectionFee(edits: RowEdits): number {
  if (edits.insureFull !== 'Yes') return 0;
  const cod = parseFloat(edits.codAmount.replace(/[^0-9.]/g, '')) || 0;
  if (cod <= 500) return 0;
  return parseFloat(((cod - 500) * 0.01).toFixed(2));
}

/**
 * Re-validate a row against its edits and the current row set.
 * - Required-field errors clear when filled (mobile, pouch size, insure-full).
 * - "Invalid pouch size" clears when a valid size is chosen.
 * - "COD must not exceed ₱50,000" clears when amount ≤ 50,000.
 * - Duplicate detection is dynamic by Reference ID: a row is a duplicate only
 *   while another row in the current set shares its Reference ID. Removing the
 *   partner makes the survivor unique, so its duplicate error clears.
 */
function validateEdits(
  row: ErrorRowData,
  edits: RowEdits,
  allRows: ErrorRowData[],
  allEdits: Record<number, RowEdits>,
): string[] {
  const errs: string[] = [];

  if (row.errors.some((e) => e.includes('Mobile Number'))  && !edits.mobileNumber.trim())  errs.push('"Mobile Number" field is required');
  if (row.errors.some((e) => e.includes('Recipient Name')) && !edits.recipientName.trim()) errs.push('"Recipient Name" field is required');
  if (row.errors.some((e) => e.includes('Street Address')) && !edits.streetAddress.trim()) errs.push('"Street Address" field is required');
  if (row.errors.some((e) => e.includes('Pouch/box size') && e.includes('required')) && !edits.pouchSize.trim()) {
    errs.push('"Pouch/box size" field is required');
  }
  // Insure full item value? is now a required, fixable Yes/No field.
  if (row.errors.some((e) => e.includes('Insure full item value')) && !edits.insureFull.trim()) {
    errs.push('"Insure full item value?" field is required');
  }

  if (row.errors.some((e) => e === 'Invalid pouch size')) {
    if (!(RECEPTACLE_SIZES as readonly string[]).includes(edits.pouchSize)) errs.push('Invalid pouch size');
  }

  if (row.errors.some((e) => e.includes('COD must not exceed'))) {
    const amt = parseFloat(edits.codAmount.replace(/[^0-9.]/g, ''));
    if (isNaN(amt) || amt > 50000) errs.push('COD must not exceed ₱50,000.00');
  }

  // Dynamic duplicate check by Reference ID across the current row set.
  const ref = edits.referenceId.trim();
  if (ref && ref !== '–') {
    const partner = allRows.find(
      (r) => r.row !== row.row && (allEdits[r.row]?.referenceId ?? r.referenceId).trim() === ref,
    );
    if (partner) errs.push(`Possible duplicate of row ${partner.row}`);
  }

  return errs;
}

function fieldHasError(fieldKey: EditableField, row: ErrorRowData, edits: RowEdits): boolean {
  switch (fieldKey) {
    case 'mobileNumber':  return row.errors.some((e) => e.includes('Mobile Number'))  && !edits.mobileNumber.trim();
    case 'recipientName': return row.errors.some((e) => e.includes('Recipient Name')) && !edits.recipientName.trim();
    case 'streetAddress': return row.errors.some((e) => e.includes('Street Address')) && !edits.streetAddress.trim();
    case 'insureFull':    return row.errors.some((e) => e.includes('Insure full item value')) && !edits.insureFull.trim();
    case 'pouchSize':
      if (row.errors.some((e) => e.includes('Pouch/box size') && e.includes('required')) && !edits.pouchSize.trim()) return true;
      if (row.errors.some((e) => e === 'Invalid pouch size') && !(RECEPTACLE_SIZES as readonly string[]).includes(edits.pouchSize)) return true;
      return false;
    case 'codAmount': {
      if (!row.errors.some((e) => e.includes('COD must not exceed'))) return false;
      const n = parseFloat(edits.codAmount.replace(/[^0-9.]/g, ''));
      return isNaN(n) || n > 50000;
    }
    default: return false;
  }
}

/** Re-validate the whole set; returns rows still in error + how many became valid. */
function revalidateAll(rows: ErrorRowData[], edits: Record<number, RowEdits>) {
  const remaining: ErrorRowData[] = [];
  let fixed = 0;
  for (const row of rows) {
    const e = edits[row.row] ?? rowToEdits(row);
    const newErr = validateEdits(row, e, rows, edits);
    if (newErr.length === 0) fixed++;
    else remaining.push({ ...row, errors: newErr });
  }
  return { remaining, fixed };
}

/** Human-readable copy for each payment method type. */
function paymentCopy(method: SelectedPaymentMethod | null, billingAvailable: boolean): string {
  if (!method) return billingAvailable ? 'To be invoiced after service' : 'To be paid on pick-up';
  switch (method.type) {
    case 'billing':  return 'To be invoiced after service';
    case 'cash':     return method.cashOption === 'deduct' ? 'Deducted from COD collections' : 'To be paid on pick-up';
    case 'ewallet':  return `Payment completed — prepaid via ${method.wallet}`;
    case 'card':     return 'Payment completed — prepaid via card';
    case 'banking':  return method.bank ? `Payment completed — prepaid via ${method.bank}` : 'Payment completed — prepaid via online banking';
  }
}

const HAD_ERRORS = INITIAL_ERROR_ROWS.length > 0;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BulkUploadSummary() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getCurrentAccountName } = useSubAccounts();

  const activeAccountName = getCurrentAccountName();
  const billingAvailable  = isBillingAccount(activeAccountName);

  // Batch date looked up via the service facade; falls back to the mock default
  // when the batch is unknown (preserves the prior synchronous fallback).
  const [batchDate, setBatchDate] = useState('2026-05-19 10:30 AM');
  useEffect(() => {
    let active = true;
    getBulkUploadById(id ?? '')
      .then((record) => { if (active && record) setBatchDate(record.uploadedAt); })
      .catch(() => { /* keep fallback date */ });
    return () => { active = false; };
  }, [id]);

  // ── Error rows state ──────────────────────────────────────────────────────
  const [errorRows, setErrorRows] = useState<ErrorRowData[]>(INITIAL_ERROR_ROWS);
  const [rowEdits,  setRowEdits]  = useState<Record<number, RowEdits>>(() => {
    const init: Record<number, RowEdits> = {};
    INITIAL_ERROR_ROWS.forEach((r) => { init[r.row] = rowToEdits(r); });
    return init;
  });
  const [fixedCount, setFixedCount] = useState(0);
  const [retried,    setRetried]    = useState(false);

  // ── Booking / bottom section state ────────────────────────────────────────
  const [firstMile,     setFirstMile]     = useState<'pickup' | 'dropoff'>('pickup');
  const [pickupDate,    setPickupDate]    = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedPayment, setSelectedPayment] = useState<SelectedPaymentMethod | null>(null);
  const [showDropoffs,  setShowDropoffs]  = useState(false);
  const [showSuccess,   setShowSuccess]   = useState(false);

  // ── Derived values ────────────────────────────────────────────────────────
  const totalValidCount        = TOTAL_VALID_INITIAL + fixedCount;
  const shippingFee            = 1200; // mock flat
  const totalItemProtectionFee = parseFloat(
    errorRows.reduce((sum, row) => sum + computeItemProtectionFee(rowEdits[row.row] ?? rowToEdits(row)), 0).toFixed(2)
  );
  const fuelSurcharge = 500;
  const totalFees     = shippingFee + totalItemProtectionFee + fuelSurcharge;

  const formatDate = (iso: string) => {
    if (!iso) return 'Tomorrow';
    return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const formattedPickup = formatDate(pickupDate);
  const peso = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const updateEdit = (rowNum: number, field: EditableField, value: string) =>
    setRowEdits((prev) => ({ ...prev, [rowNum]: { ...prev[rowNum], [field]: value } }));

  const updateLocation = (rowNum: number, province: string, city: string, barangay: string) =>
    setRowEdits((prev) => ({
      ...prev,
      [rowNum]: { ...prev[rowNum], province, cityMunicipality: city, barangay },
    }));

  const handleRetryUpload = () => {
    setRetried(true);
    const { remaining, fixed } = revalidateAll(errorRows, rowEdits);
    setFixedCount((c) => c + fixed);
    setErrorRows(remaining);
  };

  /**
   * Remove a duplicate row, then immediately revalidate the remaining rows.
   * The removed row is discarded (not counted as fixed). Any remaining row that
   * is now valid (e.g. a duplicate that became unique) moves to the valid group.
   */
  const handleRemoveRow = (rowNum: number) => {
    const nextEdits = { ...rowEdits };
    delete nextEdits[rowNum];
    const nextRows = errorRows.filter((r) => r.row !== rowNum);
    const { remaining, fixed } = revalidateAll(nextRows, nextEdits);
    setRowEdits(nextEdits);
    setErrorRows(remaining);
    setFixedCount((c) => c + fixed);
    setRetried(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/bulk-uploader')}>
          <IconArrowLeft className="w-4 h-4 mr-2" />
          Back to Bulk Upload
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Review Upload Details</h1>
        <p className="text-sm text-gray-500 mt-1">
          Date uploaded: <span className="text-gray-700 font-medium">{batchDate}</span>
          &nbsp;·&nbsp;
          Batch ID: <span className="text-gray-700 font-medium">{id ?? 'UPLOAD-2026-05-19-001'}</span>
        </p>
      </div>

      {/* ── Valid orders ── */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <IconCircleCheck className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-base font-semibold text-gray-900">
                {totalValidCount} {totalValidCount === 1 ? 'order' : 'orders'} uploaded successfully
              </p>
            </div>
            <Button
              variant="ghost" size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => navigate('/dashboard/transactions')}
            >
              View all in Transactions
              <IconArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead className="text-right">Item Price</TableHead>
                  <TableHead>Fees paid by</TableHead>
                  <TableHead className="text-right">Fees</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {VALID_ORDERS.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium text-gray-900">{row.recipient}</TableCell>
                    <TableCell className="text-gray-600">{row.itemName}</TableCell>
                    <TableCell className="text-right text-gray-900">₱{row.itemPrice.toLocaleString()}.00</TableCell>
                    <TableCell className="text-gray-600">{row.feesPaidBy}</TableCell>
                    <TableCell className="text-right text-gray-900">₱{row.fees}.00</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalValidCount > VALID_ORDERS.length && (
            <p className="text-center text-sm text-blue-600 mt-3 font-medium">
              View all {totalValidCount} in transactions page
            </p>
          )}
          {retried && fixedCount > 0 && (
            <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
              <IconCircleCheck className="w-4 h-4 flex-shrink-0" />
              {fixedCount} previously-errored {fixedCount === 1 ? 'row was' : 'rows were'} fixed and added to valid orders.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Error rows ── */}
      {errorRows.length > 0 ? (
        <Card className="border-red-200">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <IconCircleX className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">{errorRows.length} rows found with error</p>
                  <p className="text-sm text-gray-500">Please check affected rows below and try re-uploading.</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <IconDownload className="w-3.5 h-3.5 mr-1.5" />
                Download Failed Orders
              </Button>
            </div>

            {/*
              Horizontally scrollable editable table. Province / City / Barangay
              are separate columns (cascade selects). Scroll is scoped to this
              card via overflow-x-auto — the page itself does not scroll.
              min-w keeps every column readable without truncating values.
            */}
            <div className="overflow-x-auto rounded-lg border border-red-200">
              <table className="w-full min-w-[2700px] border-collapse text-sm">
                <thead className="bg-red-50 border-b border-red-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 w-12">Row</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[190px]">Error</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[160px]">Recipient Name <span className="text-red-500">*</span></th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[175px]">Mobile Number <span className="text-red-500">*</span></th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[200px]">Street Address <span className="text-red-500">*</span></th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[175px]">Province <span className="text-red-500">*</span></th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[190px]">City/Municipality <span className="text-red-500">*</span></th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[175px]">Barangay <span className="text-red-500">*</span></th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[150px]">Landmarks / Unit #</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[185px]">Item Name</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[150px]">Pouch/box size</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[110px]">COD?</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[130px]">COD Amount</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[150px]">Insure full item value? <span className="text-red-500">*</span></th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[145px]">
                      Item Protection Fee
                      <span className="font-normal text-gray-400 block text-xs leading-tight">(COD − ₱500) × 1%</span>
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[150px]">Recipient Pays Fees</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[140px]">Reference ID</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[80px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {errorRows.map((row) => {
                    const edits         = rowEdits[row.row] ?? rowToEdits(row);
                    const fe            = (f: EditableField) => fieldHasError(f, row, edits);
                    const isDuplicate   = row.errors.some((e) => e.includes('duplicate') || e.includes('Possible'));
                    const protectionFee = computeItemProtectionFee(edits);

                    return (
                      <tr key={row.row} className="border-b border-red-100 bg-white hover:bg-red-50/20 align-top">
                        {/* Row # */}
                        <td className="px-3 py-2.5">
                          <span className="text-sm font-medium text-gray-900">{row.row}</span>
                        </td>

                        {/* Error list */}
                        <td className="px-3 py-2.5">
                          <ul className="space-y-0.5">
                            {row.errors.map((e, i) => (
                              <li key={i} className="text-xs text-red-600 flex items-start gap-1">
                                <span className="mt-0.5 shrink-0">•</span>{e}
                              </li>
                            ))}
                          </ul>
                        </td>

                        {/* Recipient Name */}
                        <td className="px-3 py-2.5">
                          <ErrInput value={edits.recipientName} onChange={(v) => updateEdit(row.row, 'recipientName', v)} error={fe('recipientName')} />
                          {fe('recipientName') && <p className="text-xs text-red-600 mt-0.5">Name is required</p>}
                        </td>

                        {/* Mobile Number */}
                        <td className="px-3 py-2.5">
                          <ErrInput value={edits.mobileNumber} onChange={(v) => updateEdit(row.row, 'mobileNumber', v)} error={fe('mobileNumber')} placeholder="e.g. +639170000000" />
                          {fe('mobileNumber') && <p className="text-xs text-red-600 mt-0.5">Contact number is required</p>}
                        </td>

                        {/* Street Address */}
                        <td className="px-3 py-2.5">
                          <ErrInput value={edits.streetAddress} onChange={(v) => updateEdit(row.row, 'streetAddress', v)} error={fe('streetAddress')} />
                          {fe('streetAddress') && <p className="text-xs text-red-600 mt-0.5">Address is required</p>}
                        </td>

                        {/* Province / City/Municipality / Barangay — 3 cascade cells */}
                        <LocationCascadeCells
                          province={edits.province}
                          city={edits.cityMunicipality}
                          barangay={edits.barangay}
                          onChange={(p, c, b) => updateLocation(row.row, p, c, b)}
                        />

                        {/* Landmarks / Unit # */}
                        <td className="px-3 py-2.5">
                          <ErrInput value={edits.landmarks} onChange={(v) => updateEdit(row.row, 'landmarks', v)} error={false} placeholder="Optional" />
                        </td>

                        {/* Item Name */}
                        <td className="px-3 py-2.5">
                          <ErrInput value={edits.itemName} onChange={(v) => updateEdit(row.row, 'itemName', v)} error={false} />
                        </td>

                        {/* Pouch/box size */}
                        <td className="px-3 py-2.5">
                          <select
                            value={edits.pouchSize}
                            onChange={(e) => updateEdit(row.row, 'pouchSize', e.target.value)}
                            className={`${TABLE_SELECT_CLS} ${fe('pouchSize') ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : ''}`}
                          >
                            <option value="">Select size</option>
                            {RECEPTACLE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          {fe('pouchSize') && <p className="text-xs text-red-600 mt-0.5">Select a valid size</p>}
                        </td>

                        {/* COD? — editable Yes/No */}
                        <td className="px-3 py-2.5">
                          <YesNoToggle value={edits.cod} onChange={(v) => updateEdit(row.row, 'cod', v)} />
                        </td>

                        {/* COD Amount */}
                        <td className="px-3 py-2.5">
                          <ErrInput value={edits.codAmount} onChange={(v) => updateEdit(row.row, 'codAmount', v)} error={fe('codAmount')} placeholder="0.00" />
                          {fe('codAmount') && <p className="text-xs text-red-600 mt-0.5">Exceeds ₱50,000 limit</p>}
                        </td>

                        {/* Insure full item value? — editable Yes/No (required) */}
                        <td className="px-3 py-2.5">
                          <YesNoToggle value={edits.insureFull} onChange={(v) => updateEdit(row.row, 'insureFull', v)} error={fe('insureFull')} />
                          {fe('insureFull') && <p className="text-xs text-red-600 mt-0.5">Select Yes or No</p>}
                        </td>

                        {/* Item Protection Fee — calculated display */}
                        <td className="px-3 py-2.5">
                          <span className={`text-sm font-medium ${protectionFee > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                            ₱{protectionFee.toFixed(2)}
                          </span>
                          {edits.insureFull !== 'Yes' && (
                            <p className="text-xs text-gray-400 mt-0.5">Free ₱500 coverage</p>
                          )}
                        </td>

                        {/* Recipient Pays Fees — editable Yes/No */}
                        <td className="px-3 py-2.5">
                          <YesNoToggle value={edits.recipientPaysFees} onChange={(v) => updateEdit(row.row, 'recipientPaysFees', v)} />
                        </td>

                        {/* Reference ID */}
                        <td className="px-3 py-2.5">
                          <ErrInput value={edits.referenceId} onChange={(v) => updateEdit(row.row, 'referenceId', v)} error={false} placeholder="Optional" />
                        </td>

                        {/* Actions — remove for duplicate rows */}
                        <td className="px-3 py-2.5">
                          {isDuplicate && (
                            <button
                              onClick={() => handleRemoveRow(row.row)}
                              title="Remove duplicate row"
                              aria-label={`Remove duplicate row ${row.row}`}
                              className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <IconTrash className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Info banner + retry */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
              <div className="flex items-start gap-2.5">
                <IconInfoCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  Fix affected rows above and click <strong>Retry Upload</strong> to re-validate.
                  For duplicate rows, use the <strong>trash icon</strong> to remove and discard the duplicate —
                  the remaining row revalidates automatically. You can also proceed with the {totalValidCount} valid orders below.
                </p>
              </div>
              <Button
                variant="outline" size="sm"
                className="flex-shrink-0 border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={handleRetryUpload}
              >
                <IconRefresh className="w-3.5 h-3.5 mr-1.5" />
                Retry Upload
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : HAD_ERRORS ? (
        /* Positive empty state once all error rows are fixed or removed. */
        <Card className="border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <IconCircleCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-base font-semibold text-gray-900">No rows with errors</p>
                <p className="text-sm text-gray-500">
                  All affected rows have been fixed or removed. You can proceed with the valid orders below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* ── Duplicate rows — deferred ── */}
      {/* TODO: A dedicated "Duplicate Reference IDs" section will go here once
           server-side reference-ID deduplication is available. Inline duplicate
           detection + removal (trash icon, dynamic by Reference ID) is already
           wired for the current frontend-only check. */}

      {/* ── Bottom booking section ── */}
      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirm Booking Details</h2>
        <div className="grid md:grid-cols-3 gap-6">

          {/* Col 1 — Pickup / drop-off */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Pick-up options</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFirstMile('pickup')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${firstMile === 'pickup' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                <IconTruckDelivery className="w-4 h-4 shrink-0" />Pick-up
              </button>
              <button
                onClick={() => setFirstMile('dropoff')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${firstMile === 'dropoff' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                <IconBuildingStore className="w-4 h-4 shrink-0" />Drop-off
              </button>
            </div>

            {firstMile === 'pickup' && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Complete your booking before 10:00 AM for same-day pick-up.</p>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Pick-up Date</label>
                  <Input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="h-8 text-sm" />
                </div>
                {pickupDate && (
                  <p className="text-sm text-gray-700 font-medium">
                    {formattedPickup}
                    <button onClick={() => setPickupDate('')} className="ml-2 text-xs text-blue-600 hover:text-blue-700">
                      Change pick-up date
                    </button>
                  </p>
                )}
              </div>
            )}

            {firstMile === 'dropoff' && (
              <div>
                <p className="text-sm text-gray-600">Drop off at any GoGo Xpress branch. No scheduling needed.</p>
                <button onClick={() => setShowDropoffs(true)} className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700">
                  <IconMapPin className="w-4 h-4" />
                  Check drop-off locations
                </button>
              </div>
            )}
          </div>

          {/* Col 2 — Payment */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Choose how to pay for GoGo Xpress fees</h3>
            <PaymentMethodTabs
              key={activeAccountName}
              billingAvailable={billingAvailable}
              onPaymentMethodChange={setSelectedPayment}
            />
          </div>

          {/* Col 3 — Fee summary + CTA */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Summary</h3>
            <div className="rounded-lg border border-gray-200 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Number of orders:</span>
                <span className="font-medium text-gray-900">{totalValidCount}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 space-y-1.5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Fees</p>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping Fee</span>
                  <span className="text-gray-900">₱{shippingFee.toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Item Protection Fee</span>
                  <span className={totalItemProtectionFee > 0 ? 'text-gray-900' : 'text-gray-400'}>
                    {peso(totalItemProtectionFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fuel Surcharge</span>
                  <span className="text-gray-900">₱{fuelSurcharge}.00</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                <span className="text-gray-900">Total fees:</span>
                <span className="text-blue-700 text-base">{peso(totalFees)}</span>
              </div>
              <p className="text-xs text-gray-500">{paymentCopy(selectedPayment, billingAvailable)}</p>
            </div>
            <Button className="w-full" disabled={totalValidCount === 0} onClick={() => setShowSuccess(true)}>
              Complete Booking
            </Button>
            {totalValidCount === 0 && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <IconAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                No valid orders to book. Fix errors above first.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Drop-off locations dialog ── */}
      <Dialog open={showDropoffs} onClose={() => setShowDropoffs(false)} size="md" title="Drop-off locations">
        <p className="text-sm text-gray-500 mb-4">Bring your parcels to any of these GoGo Xpress branches.</p>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {DROPOFF_LOCATIONS.map((loc) => (
            <div key={loc.id} className="rounded-lg border border-gray-200 p-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <IconMapPin className="w-4 h-4 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{loc.name}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{loc.address}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1"><IconPhone className="w-3 h-3" />{loc.contact}</span>
                    <span className="inline-flex items-center gap-1"><IconClock className="w-3 h-3" />{loc.hours}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4">
          <Button variant="outline" size="sm" onClick={() => setShowDropoffs(false)}>Close</Button>
        </div>
      </Dialog>

      {/* ── Booking success dialog ── */}
      <Dialog open={showSuccess} onClose={() => {}} size="sm">
        <div className="text-center space-y-4 py-2">
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Your Booking is Complete</h3>
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <IconCircleCheck className="w-9 h-9 text-green-600" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900">
              {totalValidCount} {totalValidCount === 1 ? 'order' : 'orders'} scheduled for {firstMile === 'pickup' ? 'pick-up' : 'drop-off'}
            </p>
            {firstMile === 'pickup' && pickupDate && (
              <p className="text-sm text-gray-600 mt-1">
                Est. Pick-up Date: <span className="font-medium">{formattedPickup}</span>
              </p>
            )}
            <p className="text-sm text-gray-600 mt-0.5">
              Total fees — {paymentCopy(selectedPayment, billingAvailable)}:&nbsp;
              <span className="font-semibold text-gray-900">{peso(totalFees)}</span>
            </p>
          </div>
          <div className="space-y-2.5 pt-1">
            <Button className="w-full" onClick={() => navigate('/dashboard/bulk-uploader')}>
              <IconUpload className="w-4 h-4 mr-2" />
              Upload Another Batch
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setShowSuccess(false)}>
              Go to Batch Details
            </Button>
            <Link to="/dashboard" className="block w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 py-1">
              Go to Home
            </Link>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
