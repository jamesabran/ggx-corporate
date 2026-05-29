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
import { Select } from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Dialog } from '../components/ui/Dialog';
import { PaymentMethodTabs, type SelectedPaymentMethod } from '../components/PaymentMethodTabs';
import { DROPOFF_LOCATIONS } from '../data/dropoffLocations';
import { isBillingAccount } from '../data/paymentAccounts';
import { getSessionUploads } from '../data/bulkUploads';
import { RECEPTACLE_SIZES } from '../data/bulkTemplate';
import { getAllProvinces, getAllCities, getAllDistricts, type LocationOption } from '../lib/locationApi';
import { useSubAccounts } from '../contexts/SubAccountContext';

// ---------------------------------------------------------------------------
// LocationCascadeEditor — province → city → barangay cascade for recipient
// delivery addresses. Uses the non-pickup-filtered API endpoints so all GGX-
// served locations are available (not just pickup-supported ones).
//
// CORS note: if the API is unreachable from the browser, the component falls
// back to plain text inputs automatically. Document in assumptions if hit.
// ---------------------------------------------------------------------------

interface LocationCascadeEditorProps {
  province: string;
  city: string;
  barangay: string;
  onChange: (province: string, city: string, barangay: string) => void;
}

function LocationCascadeEditor({ province, city, barangay, onChange }: LocationCascadeEditorProps) {
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [cityId,     setCityId]     = useState<number | null>(null);
  const [provinces,  setProvinces]  = useState<LocationOption[]>([]);
  const [cities,     setCities]     = useState<LocationOption[]>([]);
  const [districts,  setDistricts]  = useState<LocationOption[]>([]);
  const [loadingP,   setLoadingP]   = useState(true);
  const [loadingC,   setLoadingC]   = useState(false);
  const [loadingD,   setLoadingD]   = useState(false);
  const [apiError,   setApiError]   = useState(false);

  // Stable refs so useEffect closures see the latest prop values without
  // them becoming dependencies (which would cause re-fetches on user edits).
  const cityRef     = useRef(city);     cityRef.current     = city;
  const barangayRef = useRef(barangay); barangayRef.current = barangay;

  // 1. Fetch all provinces on mount, then pre-select the one matching `province`.
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

  // 2. Fetch cities when provinceId changes; pre-select city on initial load.
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
          // Pre-select city from initial value.
          const match = data.find((c) => c.name === cityRef.current);
          if (match) setCityId(match.id);
        } else {
          // User changed province — city has already been reset via onChange.
          setCityId(null);
        }
      })
      .catch(() => setApiError(true))
      .finally(() => setLoadingC(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceId]);

  // 3. Fetch districts when cityId changes.
  useEffect(() => {
    if (!cityId) { setDistricts([]); return; }
    setLoadingD(true);
    setDistricts([]);
    getAllDistricts(cityId)
      .then(setDistricts)
      .catch(() => setApiError(true))
      .finally(() => setLoadingD(false));
  }, [cityId]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    const match = provinces.find((p) => p.name === name);
    setProvinceId(match?.id ?? null);
    onChange(name, '', '');
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    const match = cities.find((c) => c.name === name);
    setCityId(match?.id ?? null);
    onChange(province, name, '');
  };

  const handleBarangayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(province, city, e.target.value);
  };

  // Shared select class for compact table rows.
  const sel = 'w-full h-8 px-2 pr-7 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed appearance-none';

  // Fallback: API unreachable (CORS or network error).
  if (apiError) {
    const inp = 'w-full h-8 px-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-primary';
    return (
      <div className="space-y-1.5">
        <p className="text-[10px] text-amber-700">Location API unavailable — enter manually.</p>
        <input value={province}  onChange={(e) => onChange(e.target.value, '', '')}            placeholder="Province"        className={inp} />
        <input value={city}      onChange={(e) => onChange(province, e.target.value, '')}       placeholder="City / Municipality" className={inp} />
        <input value={barangay}  onChange={(e) => onChange(province, city, e.target.value)}     placeholder="Barangay"        className={inp} />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <select value={province}  onChange={handleProvinceChange} disabled={loadingP}                 className={sel}>
        <option value="">{loadingP ? 'Loading…' : 'Select province'}</option>
        {provinces.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
      </select>
      <select value={city}      onChange={handleCityChange}     disabled={!province || loadingC}     className={sel}>
        <option value="">{loadingC ? 'Loading cities…' : !province ? 'Select province first' : 'Select city'}</option>
        {cities.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
      </select>
      <select value={barangay}  onChange={handleBarangayChange} disabled={!city || loadingD}        className={sel}>
        <option value="">{loadingD ? 'Loading…' : !city ? 'Select city first' : 'Select barangay'}</option>
        {districts.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
      </select>
    </div>
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
  // Address fields
  recipientName: string;
  mobileNumber: string;
  streetAddress: string;
  province: string;
  cityMunicipality: string;
  barangay: string;
  landmarks: string;
  // Item / order fields
  itemName: string;
  pouchSize: string;
  cod: string;            // 'Yes' | 'No' — display only
  codAmount: string;
  // Insurance
  insureFull: string;     // 'Yes' | 'No' | ''  — editable select
  recipientPaysFees: string; // display only
  referenceId: string;
}

const INITIAL_ERROR_ROWS: ErrorRowData[] = [
  {
    row: 3,
    errors: ['"Mobile Number" field is required', '"Pouch/box size" field is required', '"Item protection" field is required'],
    recipientName: 'Jen Ramos', mobileNumber: '', streetAddress: '123 Penarubia St.',
    province: 'Metro Manila', cityMunicipality: 'Mandaluyong City', barangay: 'Malamig', landmarks: '–',
    itemName: 'UNO FLIP! Double Sided Card', pouchSize: '', cod: 'No', codAmount: '–',
    insureFull: '', recipientPaysFees: 'No', referenceId: '–',
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
    errors: ['Possible duplicate of row 4'],
    recipientName: 'Rome Jans', mobileNumber: '+639101234567', streetAddress: '2287 Allegro Center, Chinatown',
    province: 'Metro Manila', cityMunicipality: 'Makati City', barangay: 'Bel-Air', landmarks: '–',
    itemName: 'UNO FLIP! Double Sided Card', pouchSize: 'SMALL', cod: 'Yes', codAmount: '500',
    insureFull: 'No', recipientPaysFees: 'No', referenceId: 'REF-004',
  },
  {
    row: 6,
    errors: ['Possible duplicate of row 4'],
    recipientName: 'Rome Jans', mobileNumber: '+639101234567', streetAddress: '2287 Allegro Center, Chinatown',
    province: 'Metro Manila', cityMunicipality: 'Makati City', barangay: 'Bel-Air', landmarks: '–',
    itemName: 'UNO FLIP! Double Sided Card', pouchSize: 'SMALL', cod: 'Yes', codAmount: '500',
    insureFull: 'No', recipientPaysFees: 'No', referenceId: 'REF-004',
  },
];

type EditableField =
  | 'recipientName' | 'mobileNumber' | 'streetAddress'
  | 'province' | 'cityMunicipality' | 'barangay' | 'landmarks'
  | 'itemName' | 'pouchSize' | 'codAmount' | 'insureFull' | 'referenceId';

type RowEdits = Record<EditableField, string>;

function rowToEdits(row: ErrorRowData): RowEdits {
  return {
    recipientName:    row.recipientName,
    mobileNumber:     row.mobileNumber,
    streetAddress:    row.streetAddress,
    province:         row.province,
    cityMunicipality: row.cityMunicipality,
    barangay:         row.barangay,
    landmarks:        row.landmarks,
    itemName:         row.itemName,
    pouchSize:        row.pouchSize,
    codAmount:        row.codAmount,
    insureFull:       row.insureFull,
    referenceId:      row.referenceId,
  };
}

/**
 * Item Protection Fee calculation.
 * If "Insure full item value?" = Yes and COD Amount > 500:
 *   Fee = (COD Amount − 500) × 0.01
 * Otherwise: ₱0.
 * The free coverage tier covers up to ₱500 of declared value at no cost.
 */
function computeItemProtectionFee(edits: RowEdits): number {
  if (edits.insureFull !== 'Yes') return 0;
  const cod = parseFloat(edits.codAmount.replace(/[^0-9.]/g, '')) || 0;
  if (cod <= 500) return 0;
  return parseFloat(((cod - 500) * 0.01).toFixed(2));
}

/**
 * Re-validate a row after edits.
 * Required-field errors clear when filled.
 * "Invalid pouch size" clears when a valid size is selected.
 * "COD must not exceed ₱50,000" clears when amount ≤ 50,000.
 * Duplicate errors are unfixable inline — they remain until the duplicate row is removed.
 */
function validateEdits(row: ErrorRowData, edits: RowEdits): string[] {
  const errs: string[] = [];

  if (row.errors.some((e) => e.includes('Mobile Number'))  && !edits.mobileNumber.trim())  errs.push('"Mobile Number" field is required');
  if (row.errors.some((e) => e.includes('Recipient Name')) && !edits.recipientName.trim()) errs.push('"Recipient Name" field is required');
  if (row.errors.some((e) => e.includes('Street Address')) && !edits.streetAddress.trim()) errs.push('"Street Address" field is required');
  if (row.errors.some((e) => e.includes('Pouch/box size') && e.includes('required')) && !edits.pouchSize.trim()) {
    errs.push('"Pouch/box size" field is required');
  }
  if (row.errors.some((e) => e.includes('Item protection') && e.includes('required'))) {
    errs.push('"Item protection" field is required');
  }

  if (row.errors.some((e) => e === 'Invalid pouch size')) {
    if (!(RECEPTACLE_SIZES as readonly string[]).includes(edits.pouchSize)) {
      errs.push('Invalid pouch size');
    }
  }

  if (row.errors.some((e) => e.includes('COD must not exceed'))) {
    const amt = parseFloat(edits.codAmount.replace(/[^0-9.]/g, ''));
    if (isNaN(amt) || amt > 50000) errs.push('COD must not exceed ₱50,000.00');
  }

  // Duplicate errors are always unfixable by editing — only removal resolves them.
  for (const e of row.errors) {
    if ((e.includes('duplicate') || e.includes('Possible')) && !errs.includes(e)) errs.push(e);
  }

  return errs;
}

function fieldHasError(fieldKey: EditableField, row: ErrorRowData, edits: RowEdits): boolean {
  switch (fieldKey) {
    case 'mobileNumber':  return row.errors.some((e) => e.includes('Mobile Number'))  && !edits.mobileNumber.trim();
    case 'recipientName': return row.errors.some((e) => e.includes('Recipient Name')) && !edits.recipientName.trim();
    case 'streetAddress': return row.errors.some((e) => e.includes('Street Address')) && !edits.streetAddress.trim();
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

// Compact inline input for the error table.
function ErrInput({ value, onChange, error, placeholder }: {
  value: string; onChange: (v: string) => void; error: boolean; placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full h-8 px-2 rounded-lg border text-sm focus:outline-none focus:ring-1 ${
        error
          ? 'border-red-500 focus:ring-red-500 bg-red-50'
          : 'border-gray-300 focus:ring-primary'
      }`}
    />
  );
}

/** Human-readable copy for each payment method type in the success modal. */
function paymentCopy(method: SelectedPaymentMethod | null, billingAvailable: boolean): string {
  if (!method) return billingAvailable ? 'To be invoiced after service' : 'To be paid on pick-up';
  switch (method.type) {
    case 'billing':  return 'To be invoiced after service';
    case 'cash':     return method.cashOption === 'deduct' ? 'Deducted from COD collections' : 'To be paid on pick-up';
    case 'ewallet':  return `Prepaid via ${method.wallet}`;
    case 'card':     return 'Prepaid via card';
    case 'banking':  return method.bank ? `Prepaid via ${method.bank}` : 'Prepaid via online banking';
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BulkUploadSummary() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getCurrentAccountName } = useSubAccounts();

  const activeAccountName = getCurrentAccountName();
  const billingAvailable  = isBillingAccount(activeAccountName);

  const sessionRecord = getSessionUploads().find((r) => r.id === id);
  const batchDate     = sessionRecord?.uploadedAt ?? '2026-05-19 10:30 AM';

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
  const totalValidCount       = TOTAL_VALID_INITIAL + fixedCount;
  const shippingFee           = 1200; // mock flat
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
    let newFixed = 0;
    const remaining: ErrorRowData[] = [];
    for (const row of errorRows) {
      const edits  = rowEdits[row.row] ?? rowToEdits(row);
      const newErr = validateEdits(row, edits);
      if (newErr.length === 0) newFixed++;
      else remaining.push({ ...row, errors: newErr });
    }
    setFixedCount((c) => c + newFixed);
    setErrorRows(remaining);
  };

  /**
   * Remove a duplicate row from the error list.
   * The row is discarded (not counted as "fixed") — it will not appear in the
   * batch submission. Use Retry Upload to move genuinely fixed rows to valid.
   */
  const handleRemoveRow = (rowNum: number) => {
    setErrorRows((prev) => prev.filter((r) => r.row !== rowNum));
    setRowEdits((prev) => {
      const next = { ...prev };
      delete next[rowNum];
      return next;
    });
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
      {errorRows.length > 0 && (
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
              Horizontally scrollable editable table.
              Province / City / Barangay are merged into one "Location *" column
              that uses the LocationCascadeEditor (delivery endpoint, no pickup filter).
              min-w keeps all columns legible without wrapping.
              overflow-x-auto is scoped to this card only — the page does not scroll.
            */}
            <div className="overflow-x-auto rounded-lg border border-red-200">
              <table className="w-full min-w-[2000px] border-collapse text-sm">
                <thead className="bg-red-50 border-b border-red-200">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 w-10">Row</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[180px]">Error</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[145px]">Recipient Name <span className="text-red-500">*</span></th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[155px]">Mobile Number <span className="text-red-500">*</span></th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[160px]">Street Address <span className="text-red-500">*</span></th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[210px]">
                      Location <span className="text-red-500">*</span>
                      <span className="font-normal text-gray-400 ml-1">(Province / City / Barangay)</span>
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[145px]">Landmarks / Unit #</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[155px]">Item Name</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[135px]">Pouch/box size</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[60px]">COD?</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[125px]">COD Amount</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[130px]">Insure full value?</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[130px]">
                      Item Protection Fee
                      <span className="font-normal text-gray-400 block text-[10px] leading-tight">(COD − ₱500) × 1%</span>
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[110px]">Recipient Pays</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[120px]">Reference ID</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 min-w-[60px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {errorRows.map((row) => {
                    const edits      = rowEdits[row.row] ?? rowToEdits(row);
                    const fe         = (f: EditableField) => fieldHasError(f, row, edits);
                    const isDuplicate = row.errors.some((e) => e.includes('duplicate') || e.includes('Possible'));
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
                          {fe('recipientName') && <p className="text-[10px] text-red-600 mt-0.5">Name is required</p>}
                        </td>

                        {/* Mobile Number */}
                        <td className="px-3 py-2.5">
                          <ErrInput value={edits.mobileNumber} onChange={(v) => updateEdit(row.row, 'mobileNumber', v)} error={fe('mobileNumber')} placeholder="e.g. +639170000000" />
                          {fe('mobileNumber') && <p className="text-[10px] text-red-600 mt-0.5">Contact number is required</p>}
                        </td>

                        {/* Street Address */}
                        <td className="px-3 py-2.5">
                          <ErrInput value={edits.streetAddress} onChange={(v) => updateEdit(row.row, 'streetAddress', v)} error={fe('streetAddress')} />
                          {fe('streetAddress') && <p className="text-[10px] text-red-600 mt-0.5">Address is required</p>}
                        </td>

                        {/* Location cascade — Province / City / Barangay */}
                        <td className="px-3 py-2.5">
                          <LocationCascadeEditor
                            province={edits.province}
                            city={edits.cityMunicipality}
                            barangay={edits.barangay}
                            onChange={(p, c, b) => updateLocation(row.row, p, c, b)}
                          />
                        </td>

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
                          <Select
                            value={edits.pouchSize}
                            onChange={(e) => updateEdit(row.row, 'pouchSize', e.target.value)}
                            className={`h-8 text-sm w-full ${fe('pouchSize') ? 'border-red-500 ring-1 ring-red-500 bg-red-50' : ''}`}
                          >
                            <option value="">Select size</option>
                            {RECEPTACLE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </Select>
                          {fe('pouchSize') && <p className="text-[10px] text-red-600 mt-0.5">Select a valid size</p>}
                        </td>

                        {/* COD? — display only */}
                        <td className="px-3 py-2.5">
                          <span className="text-sm text-gray-700">{row.cod}</span>
                        </td>

                        {/* COD Amount */}
                        <td className="px-3 py-2.5">
                          <ErrInput value={edits.codAmount} onChange={(v) => updateEdit(row.row, 'codAmount', v)} error={fe('codAmount')} placeholder="0.00" />
                          {fe('codAmount') && <p className="text-[10px] text-red-600 mt-0.5">Exceeds ₱50,000 limit</p>}
                        </td>

                        {/* Insure full item value? */}
                        <td className="px-3 py-2.5">
                          <Select
                            value={edits.insureFull}
                            onChange={(e) => updateEdit(row.row, 'insureFull', e.target.value)}
                            className="h-8 text-sm w-full"
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes — full COD covered</option>
                            <option value="No">No — free ₱500 only</option>
                          </Select>
                        </td>

                        {/* Item Protection Fee — calculated display */}
                        <td className="px-3 py-2.5">
                          <span className={`text-sm font-medium ${protectionFee > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                            {protectionFee > 0 ? `₱${protectionFee.toFixed(2)}` : '₱0.00'}
                          </span>
                          {edits.insureFull === 'No' && (
                            <p className="text-[10px] text-gray-400 mt-0.5">Free ₱500 coverage</p>
                          )}
                        </td>

                        {/* Recipient Pays Fees — display only */}
                        <td className="px-3 py-2.5">
                          <span className="text-sm text-gray-700">{row.recipientPaysFees}</span>
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
                  For duplicate rows, use the <strong>trash icon</strong> to remove and discard the duplicate.
                  You can proceed with the {totalValidCount} valid orders below without resolving all errors.
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
      )}

      {/* ── Duplicate rows — deferred ── */}
      {/* TODO: A "Duplicate Reference IDs" section will go here once server-side
           reference-ID deduplication is available. Inline duplicate row removal
           (via trash icon) is already wired for the current frontend-only check. */}

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
                    ₱{totalItemProtectionFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fuel Surcharge</span>
                  <span className="text-gray-900">₱{fuelSurcharge}.00</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                <span className="text-gray-900">Total fees:</span>
                <span className="text-blue-700 text-base">₱{totalFees.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
              <span className="font-semibold text-gray-900">
                ₱{totalFees.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
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
