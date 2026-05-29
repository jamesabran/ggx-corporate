import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import {
  IconArrowLeft, IconCircleCheck, IconCircleX, IconAlertCircle,
  IconDownload, IconArrowRight, IconUpload, IconTruckDelivery, IconBuildingStore,
  IconMapPin, IconRefresh, IconInfoCircle, IconClock, IconPhone,
} from '@tabler/icons-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Dialog } from '../components/ui/Dialog';
import { PaymentMethodTabs } from '../components/PaymentMethodTabs';
import { DROPOFF_LOCATIONS } from '../data/dropoffLocations';
import { isBillingAccount } from '../data/paymentAccounts';
import { getSessionUploads } from '../data/bulkUploads';
import { RECEPTACLE_SIZES } from '../data/bulkTemplate';
import { useSubAccounts } from '../contexts/SubAccountContext';

// ---------------------------------------------------------------------------
// Mock data for the review screen
// ---------------------------------------------------------------------------

// Valid orders — 100 total; first 5 shown in the summary table.
const VALID_ORDERS = [
  { recipient: 'Lia Santos',   itemName: 'UNO FLIP! Double Sided Card...', itemPrice: 600, feesPaidBy: 'Sender', fees: 120 },
  { recipient: 'Marco Alonzo', itemName: 'UNO FLIP! Double Sided Card...', itemPrice: 600, feesPaidBy: 'Sender', fees: 120 },
  { recipient: 'Tessa Cruz',   itemName: 'UNO FLIP! Double Sided Card...', itemPrice: 600, feesPaidBy: 'Sender', fees: 120 },
  { recipient: 'Rico Mendoza', itemName: 'UNO FLIP! Double Sided Card...', itemPrice: 600, feesPaidBy: 'Sender', fees: 120 },
  { recipient: 'Nina Reyes',   itemName: 'UNO FLIP! Double Sided Card...', itemPrice: 600, feesPaidBy: 'Sender', fees: 120 },
];
const TOTAL_VALID_INITIAL = 100;

// ---------------------------------------------------------------------------
// Error row data — all template columns included so the review table is complete.
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
  cod: string;             // 'Yes' | 'No'  — display only
  codAmount: string;
  itemProtection: string;  // display only
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
    itemProtection: '', recipientPaysFees: 'No', referenceId: '–',
  },
  {
    row: 4,
    errors: ['Invalid pouch size', 'COD must not exceed ₱50,000.00'],
    recipientName: 'Rome Jans', mobileNumber: '+639101234567', streetAddress: '2287 Allegro Center, Chinatown',
    province: 'Metro Manila', cityMunicipality: 'Makati City', barangay: 'Bel-Air', landmarks: '–',
    itemName: 'UNO FLIP! Double Sided Card', pouchSize: 'SUPERSIZED', cod: 'Yes', codAmount: '75000',
    itemProtection: '–', recipientPaysFees: 'No', referenceId: 'REF-004',
  },
  {
    row: 5,
    errors: ['Possible duplicate of row 4'],
    recipientName: 'Rome Jans', mobileNumber: '+639101234567', streetAddress: '2287 Allegro Center, Chinatown',
    province: 'Metro Manila', cityMunicipality: 'Makati City', barangay: 'Bel-Air', landmarks: '–',
    itemName: 'UNO FLIP! Double Sided Card', pouchSize: 'SMALL', cod: 'Yes', codAmount: '500',
    itemProtection: '–', recipientPaysFees: 'No', referenceId: 'REF-004',
  },
  {
    row: 6,
    errors: ['Possible duplicate of row 4'],
    recipientName: 'Rome Jans', mobileNumber: '+639101234567', streetAddress: '2287 Allegro Center, Chinatown',
    province: 'Metro Manila', cityMunicipality: 'Makati City', barangay: 'Bel-Air', landmarks: '–',
    itemName: 'UNO FLIP! Double Sided Card', pouchSize: 'SMALL', cod: 'Yes', codAmount: '500',
    itemProtection: '–', recipientPaysFees: 'No', referenceId: 'REF-004',
  },
];

const PH_PROVINCES = [
  'Metro Manila', 'Cebu', 'Davao del Sur', 'Laguna',
  'Cavite', 'Bulacan', 'Rizal', 'Batangas', 'Pampanga',
];

// Fields the user can edit inline in the error table.
type EditableField =
  | 'recipientName' | 'mobileNumber' | 'streetAddress'
  | 'province' | 'cityMunicipality' | 'barangay' | 'landmarks'
  | 'itemName' | 'pouchSize' | 'codAmount' | 'referenceId';

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
    referenceId:      row.referenceId,
  };
}

/**
 * Re-validate a row after the user edits it.
 * Required-field errors clear when filled.
 * Fixable structural errors (pouch size, COD limit) clear when corrected.
 * Unfixable errors (duplicates) remain regardless of edits.
 */
function validateEdits(row: ErrorRowData, edits: RowEdits): string[] {
  const errs: string[] = [];

  // Required-field checks (clear when user fills the field)
  if (row.errors.some((e) => e.includes('Mobile Number'))  && !edits.mobileNumber.trim())  errs.push('"Mobile Number" field is required');
  if (row.errors.some((e) => e.includes('Recipient Name')) && !edits.recipientName.trim()) errs.push('"Recipient Name" field is required');
  if (row.errors.some((e) => e.includes('Street Address')) && !edits.streetAddress.trim()) errs.push('"Street Address" field is required');
  if (row.errors.some((e) => e.includes('Pouch/box size') && e.includes('required')) && !edits.pouchSize.trim()) {
    errs.push('"Pouch/box size" field is required');
  }
  if (row.errors.some((e) => e.includes('Item protection') && e.includes('required'))) {
    errs.push('"Item protection" field is required');  // structural — user must fix in file
  }

  // Fixable structural: invalid pouch size (clears if user selects a valid size)
  if (row.errors.some((e) => e === 'Invalid pouch size')) {
    if (!(RECEPTACLE_SIZES as readonly string[]).includes(edits.pouchSize)) {
      errs.push('Invalid pouch size');
    }
  }

  // Fixable structural: COD over limit (clears if amount ≤ 50,000)
  if (row.errors.some((e) => e.includes('COD must not exceed'))) {
    const amt = parseFloat(edits.codAmount.replace(/[^0-9.]/g, ''));
    if (isNaN(amt) || amt > 50000) errs.push('COD must not exceed ₱50,000.00');
  }

  // Unfixable structural errors (duplicates, etc.) — always keep
  const unfixable = row.errors.filter((e) =>
    e.includes('duplicate') || e.includes('Possible'),
  );
  for (const u of unfixable) {
    if (!errs.includes(u)) errs.push(u);
  }

  return errs;
}

/** Whether an editable field should be highlighted red. */
function fieldHasError(fieldKey: EditableField, row: ErrorRowData, edits: RowEdits): boolean {
  switch (fieldKey) {
    case 'mobileNumber':     return row.errors.some((e) => e.includes('Mobile Number'))  && !edits.mobileNumber.trim();
    case 'recipientName':    return row.errors.some((e) => e.includes('Recipient Name')) && !edits.recipientName.trim();
    case 'streetAddress':    return row.errors.some((e) => e.includes('Street Address')) && !edits.streetAddress.trim();
    case 'pouchSize':
      // Red if "field is required" and empty, OR "Invalid pouch size" and still invalid
      if (row.errors.some((e) => e.includes('Pouch/box size') && e.includes('required')) && !edits.pouchSize.trim()) return true;
      if (row.errors.some((e) => e === 'Invalid pouch size') && !(RECEPTACLE_SIZES as readonly string[]).includes(edits.pouchSize)) return true;
      return false;
    case 'codAmount':        return row.errors.some((e) => e.includes('COD must not exceed')) &&
                               (() => { const n = parseFloat(edits.codAmount.replace(/[^0-9.]/g, '')); return isNaN(n) || n > 50000; })();
    default:                 return false;
  }
}

// Compact inline input used in the error table cells.
function ErrInput({ value, onChange, error, placeholder }: {
  value: string; onChange: (v: string) => void; error: boolean; placeholder?: string;
}) {
  return (
    <div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-8 px-2 rounded border text-sm focus:outline-none focus:ring-1 ${
          error ? 'border-red-500 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-primary'
        }`}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BulkUploadSummary() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getCurrentAccountName } = useSubAccounts();

  const activeAccountName = getCurrentAccountName();
  const billingAvailable = isBillingAccount(activeAccountName);

  // Try to read metadata from the session store; fall back to defaults.
  const sessionRecord = getSessionUploads().find((r) => r.id === id);
  const batchDate = sessionRecord?.uploadedAt ?? '2026-05-19 10:30 AM';

  // Error rows state — edits tracked separately so original errors are preserved.
  const [errorRows, setErrorRows] = useState<ErrorRowData[]>(INITIAL_ERROR_ROWS);
  const [rowEdits, setRowEdits]   = useState<Record<number, RowEdits>>(() => {
    const init: Record<number, RowEdits> = {};
    INITIAL_ERROR_ROWS.forEach((r) => { init[r.row] = rowToEdits(r); });
    return init;
  });
  const [fixedCount, setFixedCount] = useState(0);
  const [retried,    setRetried]    = useState(false);

  // Booking / bottom section state.
  const [firstMile, setFirstMile]   = useState<'pickup' | 'dropoff'>('pickup');
  const [pickupDate, setPickupDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [showDropoffs, setShowDropoffs] = useState(false);
  const [showSuccess,  setShowSuccess]  = useState(false);

  const totalValidCount   = TOTAL_VALID_INITIAL + fixedCount;
  const shippingFee       = 1200;  // mock flat
  const itemProtectionFee = 0;
  const fuelSurcharge     = 500;
  const totalFees         = shippingFee + itemProtectionFee + fuelSurcharge;

  const formatDate = (iso: string) => {
    if (!iso) return 'Tomorrow';
    return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const formattedPickup = formatDate(pickupDate);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const updateEdit = (rowNum: number, field: EditableField, value: string) =>
    setRowEdits((prev) => ({ ...prev, [rowNum]: { ...prev[rowNum], [field]: value } }));

  const handleRetryUpload = () => {
    setRetried(true);
    let newFixed = 0;
    const remaining: ErrorRowData[] = [];
    for (const row of errorRows) {
      const edits = rowEdits[row.row];
      const newErrors = validateEdits(row, edits);
      if (newErrors.length === 0) {
        newFixed++;
      } else {
        remaining.push({ ...row, errors: newErrors });
      }
    }
    setFixedCount((c) => c + newFixed);
    setErrorRows(remaining);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
            {/* Header row */}
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
              Horizontally scrollable error table.
              All template-relevant columns are shown so reviewers can see the full row
              context without opening a separate file. Scroll is contained to this element.
              min-w keeps columns from collapsing on narrower viewports.
            */}
            <div className="overflow-x-auto rounded-lg border border-red-200">
              <table className="w-full min-w-[1800px] border-collapse text-sm">
                <thead className="bg-red-50 border-b border-red-200">
                  <tr>
                    {/* Col widths are set via the min-w on each th */}
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap w-12">Row</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap min-w-[180px]">Error</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap min-w-[140px]">Recipient Name <span className="text-red-500">*</span></th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap min-w-[155px]">Mobile Number <span className="text-red-500">*</span></th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap min-w-[160px]">Street Address <span className="text-red-500">*</span></th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap min-w-[140px]">Province <span className="text-red-500">*</span></th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap min-w-[155px]">City/Municipality <span className="text-red-500">*</span></th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap min-w-[130px]">Barangay <span className="text-red-500">*</span></th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap min-w-[140px]">Landmarks / Unit #</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap min-w-[160px]">Item Name</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap min-w-[130px]">Pouch/box size</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap min-w-[60px]">COD?</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap min-w-[120px]">COD Amount</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap min-w-[110px]">Item Protection</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap min-w-[110px]">Recipient Pays</th>
                    <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2.5 whitespace-nowrap min-w-[120px]">Reference ID</th>
                  </tr>
                </thead>
                <tbody>
                  {errorRows.map((row) => {
                    const edits = rowEdits[row.row];
                    const fe = (f: EditableField) => fieldHasError(f, row, edits);

                    return (
                      <tr key={row.row} className="border-b border-red-100 bg-white hover:bg-red-50/30 align-top">

                        {/* Row # */}
                        <td className="px-3 py-2">
                          <span className="text-sm font-medium text-gray-900">{row.row}</span>
                        </td>

                        {/* Error list */}
                        <td className="px-3 py-2">
                          <ul className="space-y-0.5">
                            {row.errors.map((e, i) => (
                              <li key={i} className="text-xs text-red-600 flex items-start gap-1">
                                <span className="mt-0.5 shrink-0">•</span>{e}
                              </li>
                            ))}
                          </ul>
                        </td>

                        {/* Recipient Name */}
                        <td className="px-3 py-2">
                          <ErrInput
                            value={edits.recipientName}
                            onChange={(v) => updateEdit(row.row, 'recipientName', v)}
                            error={fe('recipientName')}
                          />
                          {fe('recipientName') && <p className="text-[10px] text-red-600 mt-0.5">Name is required</p>}
                        </td>

                        {/* Mobile Number */}
                        <td className="px-3 py-2">
                          <ErrInput
                            value={edits.mobileNumber}
                            onChange={(v) => updateEdit(row.row, 'mobileNumber', v)}
                            error={fe('mobileNumber')}
                            placeholder="e.g. +639170000000"
                          />
                          {fe('mobileNumber') && <p className="text-[10px] text-red-600 mt-0.5">Contact number is required</p>}
                        </td>

                        {/* Street Address */}
                        <td className="px-3 py-2">
                          <ErrInput
                            value={edits.streetAddress}
                            onChange={(v) => updateEdit(row.row, 'streetAddress', v)}
                            error={fe('streetAddress')}
                          />
                          {fe('streetAddress') && <p className="text-[10px] text-red-600 mt-0.5">Address is required</p>}
                        </td>

                        {/* Province */}
                        <td className="px-3 py-2">
                          <Select
                            value={edits.province}
                            onChange={(e) => updateEdit(row.row, 'province', e.target.value)}
                            className="h-8 text-sm w-full"
                          >
                            <option value="">Select province</option>
                            {PH_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                          </Select>
                        </td>

                        {/* City/Municipality */}
                        <td className="px-3 py-2">
                          <ErrInput
                            value={edits.cityMunicipality}
                            onChange={(v) => updateEdit(row.row, 'cityMunicipality', v)}
                            error={false}
                          />
                        </td>

                        {/* Barangay */}
                        <td className="px-3 py-2">
                          <ErrInput
                            value={edits.barangay}
                            onChange={(v) => updateEdit(row.row, 'barangay', v)}
                            error={false}
                          />
                        </td>

                        {/* Landmarks / Unit # */}
                        <td className="px-3 py-2">
                          <ErrInput
                            value={edits.landmarks}
                            onChange={(v) => updateEdit(row.row, 'landmarks', v)}
                            error={false}
                            placeholder="Optional"
                          />
                        </td>

                        {/* Item Name */}
                        <td className="px-3 py-2">
                          <ErrInput
                            value={edits.itemName}
                            onChange={(v) => updateEdit(row.row, 'itemName', v)}
                            error={false}
                          />
                        </td>

                        {/* Pouch/box size */}
                        <td className="px-3 py-2">
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
                        <td className="px-3 py-2">
                          <span className="text-sm text-gray-700">{row.cod}</span>
                        </td>

                        {/* COD Amount */}
                        <td className="px-3 py-2">
                          <ErrInput
                            value={edits.codAmount}
                            onChange={(v) => updateEdit(row.row, 'codAmount', v)}
                            error={fe('codAmount')}
                            placeholder="0.00"
                          />
                          {fe('codAmount') && <p className="text-[10px] text-red-600 mt-0.5">Exceeds ₱50,000 limit</p>}
                        </td>

                        {/* Item Protection — display only */}
                        <td className="px-3 py-2">
                          <span className="text-sm text-gray-700">{row.itemProtection || '–'}</span>
                        </td>

                        {/* Recipient Pays Fees — display only */}
                        <td className="px-3 py-2">
                          <span className="text-sm text-gray-700">{row.recipientPaysFees}</span>
                        </td>

                        {/* Reference ID */}
                        <td className="px-3 py-2">
                          <ErrInput
                            value={edits.referenceId}
                            onChange={(v) => updateEdit(row.row, 'referenceId', v)}
                            error={false}
                            placeholder="Optional"
                          />
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Info banner + retry CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3">
              <div className="flex items-start gap-2.5">
                <IconInfoCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800">
                  Fix the affected rows above and click <strong>Retry Upload</strong> to re-validate,
                  or proceed to book the {totalValidCount} valid orders below.
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
           reference-ID deduplication is implemented. Expected structure: card
           similar to the error rows above, read-only, with a "Skip duplicates"
           action and a count badge. */}

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
                <IconTruckDelivery className="w-4 h-4 shrink-0" />
                Pick-up
              </button>
              <button
                onClick={() => setFirstMile('dropoff')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${firstMile === 'dropoff' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                <IconBuildingStore className="w-4 h-4 shrink-0" />
                Drop-off
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
                <button
                  onClick={() => setShowDropoffs(true)}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <IconMapPin className="w-4 h-4" />
                  Check drop-off locations
                </button>
              </div>
            )}
          </div>

          {/* Col 2 — Payment */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Choose how to pay for GoGo Xpress fees</h3>
            <PaymentMethodTabs key={activeAccountName} billingAvailable={billingAvailable} />
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
                  <span className="text-gray-500">₱{itemProtectionFee}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fuel Surcharge</span>
                  <span className="text-gray-900">₱{fuelSurcharge}.00</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                <span className="text-gray-900">Total fees:</span>
                <span className="text-blue-700 text-base">₱{totalFees.toLocaleString()}.00</span>
              </div>
              <p className="text-xs text-gray-500">
                {billingAvailable
                  ? 'To be invoiced after service'
                  : firstMile === 'pickup'
                  ? 'To be collected by rider on pick-up'
                  : 'To be paid at drop-off location'}
              </p>
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
              Total fees —&nbsp;
              {billingAvailable
                ? 'To be invoiced after service'
                : firstMile === 'pickup'
                ? 'To be paid on pick-up'
                : 'To be paid at drop-off'}:&nbsp;
              <span className="font-semibold text-gray-900">₱{totalFees.toLocaleString()}.00</span>
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
            <Link
              to="/dashboard"
              className="block w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700 py-1"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
