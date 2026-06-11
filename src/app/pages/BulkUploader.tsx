import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  IconUpload, IconDownload, IconFileSpreadsheet, IconMapPin, IconClock,
  IconLink, IconX, IconTruckDelivery, IconBuildingStore,
  IconPhone, IconArrowUp,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Dialog } from '../components/ui/Dialog';
import { AddressBook, type Address } from '../components/AddressBook';
import { PaymentMethodTabs } from '../components/PaymentMethodTabs';
import { BulkColumnMapper } from '../components/BulkColumnMapper';
import { SpreadsheetBookingGrid } from '../components/SpreadsheetBookingGrid';
import type { BookingRow } from '../lib/bookingValidation';
import { downloadBulkTemplate, BULK_TEMPLATE_COLUMNS } from '../data/bulkTemplate';
import { DROPOFF_LOCATIONS } from '../data/dropoffLocations';
import { isBillingAccount } from '../services/paymentService';
// Bulk upload reads/writes go through the bulkUploadService facade (not the
// data module directly). The recent-uploads list (session records merged with
// the seed) is owned by the service. In production this is fronted by the GGX
// Corporate BFF; batch creation would POST /bulk-uploads.
import {
  addUpload, updateUploadStatus, generateUploadId, createUploadRecord,
  getBulkUploads, type UploadRecord,
} from '../services/bulkUploadService';
import { useSubAccounts } from '../contexts/SubAccountContext';
import { useAuth } from '../contexts/AuthContext';

const STATUS_CONFIG = {
  processing:       { variant: 'info'    as const, label: 'Processing'      },
  'needs-review':   { variant: 'warning' as const, label: 'Needs Review'    },
  'awaiting-payment': { variant: 'pending' as const, label: 'Awaiting Payment' },
  completed:        { variant: 'success' as const, label: 'Completed'       },
};

// Mock file headers and sample data returned when a file is NOT the GGX template.
// Mirrors the column-mapping screenshot reference.
const MOCK_CUSTOM_HEADERS = [
  'Buyer Name', 'CP#', 'Street Address', 'Province', 'City / Town',
  'Barangay', 'Unit/Floor', 'Item Name', 'Pouch/box size', 'Cash on delivery (COD)',
  'COD Amount', 'Item Protection', 'Recipient Pays', 'Promo', 'Ref ID',
];
const MOCK_SAMPLE_DATA = [
  ['Jen Ramos',  '+639176543210', '123 Penarubia St.',           'Metro Manila', 'Mandaluyong City', 'Malamig',    '–', 'UNO FLIP! Double Sided Ca...', 'Small', 'No',  '–',      '–', 'No', '–', '–'],
  ['Ramon Jee',  '+639101234567', '2287 Allegro Center, Chin...', 'Metro Manila', 'Makati City',      'Magallanes', '–', 'UNO FLIP! Double Sided Ca...', 'Small', 'Yes', '500.00', '–', '–', '–', '–'],
  ['Rena Jams',  '+639123456789', '1234 Harmony Lane St.',       'Metro Manila', 'Quezon City',      'Barangay 1', '–', 'UNO FLIP! Double Sided Ca...', 'Small', 'No',  '–',      '–', '–', '–', '–'],
];

/** Whether the uploaded file already uses GGX template headers (skip mapping). */
function isGgxTemplate(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return lower.includes('template') || lower.includes('ggx') || lower.includes('gogo') || lower.endsWith('.csv');
}

type Step = 'form' | 'mapping' | 'fast-processing' | 'background-processing';

export function BulkUploader() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getCurrentAccountName, getCurrentAccountId, currentAccount } = useSubAccounts();
  const { user } = useAuth();
  const isManager = user?.role === 'manager';

  // A Manager always uploads under their assigned subaccount; an Admin uploads
  // under the active account/subaccount context.
  const activeAccountName = isManager ? user!.accountName : getCurrentAccountName();

  // Billing eligibility resolved via the service (Contract Manager-owned in the
  // end state). Defaults to true (the helper's billing fallback) until resolved.
  const [billingAvailable, setBillingAvailable] = useState(true);
  useEffect(() => {
    let active = true;
    isBillingAccount(activeAccountName)
      .then((b) => { if (active) setBillingAvailable(b); })
      .catch(() => { if (active) setBillingAvailable(true); });
    return () => { active = false; };
  }, [activeAccountName]);

  // Account scope captured on the upload record/notification (parent vs subaccount).
  // accountId is the canonical stable id; accountName is display only.
  const uploadAccount = isManager
    ? { accountId: user!.accountId, accountName: user!.accountName, accountType: 'subaccount' as const }
    : {
        accountId: getCurrentAccountId(),
        accountName: activeAccountName,
        accountType: (currentAccount === 'main' ? 'main' : 'subaccount') as 'main' | 'subaccount',
      };

  const [step, setStep]             = useState<Step>('form');
  const [inputMethod, setInputMethod] = useState<'upload' | 'spreadsheet'>('upload');
  const [uploadMode, setUploadMode] = useState<'standard' | 'same-day'>('standard');
  const [firstMile, setFirstMile]   = useState<'pickup' | 'dropoff'>('pickup');
  const [pickupDate, setPickupDate] = useState('');
  const [showDropoffs, setShowDropoffs] = useState(false);
  const [uploadUrl, setUploadUrl]   = useState('');

  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [pendingUploadId, setPendingUploadId] = useState<string | null>(null);

  // Force a re-render when background uploads complete so Recent Uploads updates.
  const [sessionTick, setSessionTick] = useState(0);

  const [showAddressBook, setShowAddressBook] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>({
    id: '1', label: 'office', name: 'Acme Corporation',
    mobileNumber: '+63 917 123 4567', province: 'Metro Manila',
    city: 'Makati', barangay: 'Poblacion',
    otherDetails: '5th Floor, ABC Building, Ayala Avenue', isPreferred: true,
  });

  // Dismiss the fast-processing modal if the navigate fires before unmount.
  useEffect(() => {
    if (step !== 'fast-processing') return;
    const timer = setTimeout(() => {
      if (pendingUploadId) {
        navigate(`/dashboard/bulk-uploader/summary/${pendingUploadId}`);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [step, pendingUploadId, navigate]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const captureFile = (file: File | undefined) => {
    if (!file) return;
    setSelectedFile({ name: file.name, size: formatSize(file.size) });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    captureFile(e.dataTransfer.files?.[0]);
  };

  /**
   * After file selection or URL import: check headers, then either show
   * column mapping (custom file) or proceed directly to processing.
   * uploadMode === 'same-day' → background processing flow
   * uploadMode === 'standard' → fast processing flow
   */
  const startUpload = (fileName?: string) => {
    const name = fileName ?? selectedFile?.name ?? 'upload.csv';
    const id = generateUploadId();
    setPendingUploadId(id);

    if (!isGgxTemplate(name) && !uploadUrl.trim()) {
      // Non-template file via drag/browse → show mapping step
      setStep('mapping');
      return;
    }

    proceedToProcessing(id, name);
  };

  const proceedToProcessing = (id: string, fileName: string) => {
    if (uploadMode === 'same-day') {
      // Background processing — will return to this page
      const record = createUploadRecord(id, fileName, uploadMode, firstMile, 'processing', uploadAccount);
      addUpload(record);
      setStep('background-processing');
    } else {
      // Fast processing — will navigate to summary
      const record = createUploadRecord(id, fileName, uploadMode, firstMile, 'needs-review', uploadAccount);
      addUpload(record);
      setStep('fast-processing');
    }
  };

  const handleMappingConfirm = () => {
    const id = pendingUploadId ?? generateUploadId();
    const fileName = selectedFile?.name ?? 'upload.csv';
    setPendingUploadId(id);
    proceedToProcessing(id, fileName);
  };

  /**
   * Book the valid rows entered via the in-app spreadsheet. Reuses the same
   * upload-record pipeline as the file path (createUploadRecord + addUpload),
   * then navigates to the batch summary. Only valid rows are booked; invalid
   * rows stay in the grid for correction.
   */
  const handleSpreadsheetBook = (validRows: BookingRow[]) => {
    const id = generateUploadId();
    // Carry the SAME downstream context as the file path (delivery mode, first-mile,
    // account scope) and tag the source so the shared summary can adapt.
    const base = createUploadRecord(id, 'Spreadsheet entry', uploadMode, firstMile, 'needs-review', uploadAccount);
    addUpload({
      ...base,
      source: 'spreadsheet',
      fileName: `Spreadsheet entry (${validRows.length} row${validRows.length === 1 ? '' : 's'})`,
      totalRows: validRows.length,
      validRows: validRows.length,
      errorRows: 0,
    });
    navigate(`/dashboard/bulk-uploader/summary/${id}`);
  };

  const handleBackgroundAck = () => {
    setStep('form');
    setSelectedFile(null);
    setUploadUrl('');
    if (!pendingUploadId) return;
    const idToComplete = pendingUploadId;
    // Mock background completion after 8 seconds.
    setTimeout(() => {
      updateUploadStatus(idToComplete, 'needs-review');
      setSessionTick((t) => t + 1);
    }, 8000);
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    setShowAddressBook(false);
  };

  // Recent uploads — loaded via the service (session records merged with seed).
  // Reloads on sessionTick (background completion / new upload) and step changes.
  const [allUploads, setAllUploads] = useState<UploadRecord[]>([]);
  useEffect(() => {
    let cancelled = false;
    getBulkUploads()
      .then((list) => { if (!cancelled) setAllUploads(list); })
      .catch(() => { if (!cancelled) setAllUploads([]); });
    return () => { cancelled = true; };
  }, [sessionTick, step]);

  // --- Mapping step renders instead of the main form ---
  if (step === 'mapping') {
    return (
      <div className="p-6">
        <BulkColumnMapper
          fileName={selectedFile?.name ?? ''}
          fileHeaders={MOCK_CUSTOM_HEADERS}
          sampleData={MOCK_SAMPLE_DATA}
          onConfirm={handleMappingConfirm}
          onBack={() => setStep('form')}
          onDownloadTemplate={downloadBulkTemplate}
        />
      </div>
    );
  }

  if (showAddressBook) {
    return (
      <div className="p-6">
        <AddressBook mode="select" onSelectAddress={handleSelectAddress} onClose={() => setShowAddressBook(false)} />
      </div>
    );
  }

  const accentText = uploadMode === 'same-day' ? 'text-orange-700' : 'text-blue-700';

  // Suppress TypeScript "unused" warning — sessionTick drives re-render only.
  void sessionTick;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Upload</h1>
          <p className="text-gray-600 mt-1 max-w-2xl">
            Book multiple transactions (up to 1,000) in one go. Download the template, fill in your order details, then upload the file or paste a sheet link.
          </p>
        </div>
        <Button variant="outline" className="flex-shrink-0" onClick={downloadBulkTemplate}>
          <IconDownload className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </div>

      {/* Input method — Upload File vs Type in Spreadsheet (an input method
          inside Bulk Booking, not a separate module) */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <button
              onClick={() => setInputMethod('upload')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${inputMethod === 'upload' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <IconUpload className="w-5 h-5 shrink-0" />
                <div className="text-left">
                  <div className="font-semibold">Upload File</div>
                  <div className={`text-xs ${inputMethod === 'upload' ? 'text-blue-100' : 'text-gray-500'}`}>Upload a filled-in template or paste a sheet link</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setInputMethod('spreadsheet')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${inputMethod === 'spreadsheet' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <IconFileSpreadsheet className="w-5 h-5 shrink-0" />
                <div className="text-left">
                  <div className="font-semibold">Type in Spreadsheet</div>
                  <div className={`text-xs ${inputMethod === 'spreadsheet' ? 'text-blue-100' : 'text-gray-500'}`}>Enter or paste orders into an in-app grid</div>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Mode toggle — delivery mode applies to BOTH input methods */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <button
              onClick={() => setUploadMode('standard')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${uploadMode === 'standard' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <IconUpload className="w-5 h-5 shrink-0" />
                <div className="text-left">
                  <div className="font-semibold">Standard Upload</div>
                  <div className={`text-xs ${uploadMode === 'standard' ? 'text-blue-100' : 'text-gray-500'}`}>Regular delivery processing</div>
                </div>
              </div>
            </button>
            <button
              onClick={() => setUploadMode('same-day')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${uploadMode === 'same-day' ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <IconClock className="w-5 h-5 shrink-0" />
                <div className="text-left">
                  <div className="font-semibold">Same-Day Delivery</div>
                  <div className={`text-xs ${uploadMode === 'same-day' ? 'text-orange-100' : 'text-gray-500'}`}>Express same-day processing · background upload</div>
                </div>
              </div>
            </button>
          </div>
          {uploadMode === 'same-day' && (
            <p className="text-xs text-orange-700 mt-2 flex items-center gap-1">
              <IconClock className="w-3.5 h-3.5 shrink-0" />
              Same-day uploads process in the background. You can continue using the app and review the results from Recent Uploads once done.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Both input methods feed the same booking flow: the shared context
          (sender/pickup, schedule, payment) applies to either intake. Upload
          keeps the 2-column layout; Spreadsheet stacks context + full-width grid. */}
      <div className={inputMethod === 'upload' ? 'grid lg:grid-cols-2 gap-6' : 'space-y-6'}>
        {/* Shared booking context */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sender / Pickup Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddressBook(true)}>
                  <IconMapPin className="w-4 h-4 mr-1.5" />
                  Change
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedAddress ? (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <IconMapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant={selectedAddress.label === 'office' ? 'info' : selectedAddress.label === 'home' ? 'success' : 'default'} className="capitalize">
                        {selectedAddress.label === 'custom' ? selectedAddress.customLabel : selectedAddress.label}
                      </Badge>
                      {selectedAddress.isPreferred && <Badge variant="warning">Preferred</Badge>}
                    </div>
                    <p className="font-semibold text-gray-900">{selectedAddress.name}</p>
                    <p className="text-sm text-gray-600">{selectedAddress.mobileNumber}</p>
                    <p className="text-sm text-gray-600 mt-1">{[selectedAddress.barangay, selectedAddress.city, selectedAddress.province].filter(Boolean).join(', ')}</p>
                    {selectedAddress.otherDetails && <p className="text-sm text-gray-500 mt-1">{selectedAddress.otherDetails}</p>}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-3">No pickup address selected</p>
                  <Button onClick={() => setShowAddressBook(true)}>
                    <IconMapPin className="w-4 h-4 mr-2" />
                    Select Pickup Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>First-mile &amp; Schedule</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pick-up or Drop-off</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFirstMile('pickup')}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${firstMile === 'pickup' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <IconTruckDelivery className="w-4 h-4 shrink-0" />
                    Pick-up
                  </button>
                  <button
                    onClick={() => setFirstMile('dropoff')}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${firstMile === 'dropoff' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  >
                    <IconBuildingStore className="w-4 h-4 shrink-0" />
                    Drop-off
                  </button>
                </div>
              </div>
              {firstMile === 'pickup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Pick-up Date</label>
                  <Input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} />
                  <p className="text-xs text-gray-500 mt-1.5">
                    {uploadMode === 'same-day'
                      ? 'Same-day cut-off is 10:00 AM. Orders booked after cut-off move to next day.'
                      : 'Pick-ups are scheduled the next business day by default.'}
                  </p>
                </div>
              )}
              {firstMile === 'dropoff' && (
                <div>
                  <p className="text-sm text-gray-600">Drop off your parcels at any GoGo Xpress branch. No pick-up scheduling required.</p>
                  <button
                    type="button"
                    onClick={() => setShowDropoffs(true)}
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    <IconMapPin className="w-4 h-4" />
                    Check drop-off locations nearby
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
              <CardDescription>Choose how to pay for GoGo Xpress fees</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentMethodTabs key={activeAccountName} billingAvailable={billingAvailable} />
            </CardContent>
          </Card>
        </div>

        {/* Right column — Upload File intake */}
        {inputMethod === 'upload' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Orders</CardTitle>
              <CardDescription>Paste a sheet link or upload your filled-in template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* URL option */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Sheet / file URL</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <IconLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={uploadUrl}
                      onChange={(e) => setUploadUrl(e.target.value)}
                      placeholder="Google Sheet, CSV, or XLS link"
                      className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <Button
                    disabled={!uploadUrl.trim() || step !== 'form'}
                    onClick={() => startUpload('import-from-url.csv')}
                  >
                    Import
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 border-t border-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              {/* File option */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.csv"
                className="hidden"
                onChange={(e) => captureFile(e.target.files?.[0])}
              />

              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50/50"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                      <IconUpload className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Drop filled-in template here</p>
                      <p className="text-sm text-gray-600">or <span className="text-blue-600 font-medium">browse files</span></p>
                    </div>
                    <p className="text-xs text-gray-500">.xlsx or .csv · up to 1,000 orders · max 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <IconFileSpreadsheet className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{selectedFile.size} · ready to validate</p>
                    </div>
                    {step === 'form' && (
                      <button onClick={() => setSelectedFile(null)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Remove file">
                        <IconX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <Button className="w-full mt-4" disabled={step !== 'form'} onClick={() => startUpload()}>
                    <IconFileSpreadsheet className="w-4 h-4 mr-2" />
                    Upload &amp; Validate
                  </Button>
                </div>
              )}

              <p className={`text-xs ${accentText}`}>
                Mode: {uploadMode === 'same-day' ? 'Same-Day Delivery' : 'Standard Upload'} · First-mile: {firstMile === 'pickup' ? 'Pick-up' : 'Drop-off'}
              </p>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-700">Need the template?</p>
                  <Button variant="outline" size="sm" onClick={downloadBulkTemplate}>
                    <IconDownload className="w-3.5 h-3.5 mr-1.5" />
                    Download Template
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Required columns: {BULK_TEMPLATE_COLUMNS.slice(0, 6).join(', ')}, and more.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Province, City/Municipality, and Barangay must be valid GGX-supported locations.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Type in Spreadsheet intake — full-width grid, shares the context above */}
        {inputMethod === 'spreadsheet' && (
          <Card>
            <CardHeader>
              <CardTitle>Type in Spreadsheet</CardTitle>
              <CardDescription>
                Enter orders directly or paste rows from Excel / Google Sheets. Rows are validated inline
                against the same rules as uploaded files; only valid rows are booked.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SpreadsheetBookingGrid onBook={handleSpreadsheetBook} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>Your recently uploaded batches. Click a row to review or open the batch details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Valid</TableHead>
                <TableHead>Errors</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUploads.map((upload) => {
                const cfg = STATUS_CONFIG[upload.status] ?? STATUS_CONFIG['completed'];
                return (
                  <TableRow
                    key={upload.id}
                    className={`cursor-pointer hover:bg-gray-50 ${upload.status === 'processing' ? 'opacity-70' : ''}`}
                    onClick={() => upload.status !== 'processing' && navigate(`/dashboard/bulk-uploader/summary/${upload.id}`)}
                  >
                    <TableCell className="font-medium text-blue-600">{upload.id}</TableCell>
                    <TableCell>{upload.fileName}</TableCell>
                    <TableCell className="text-gray-600">
                      <div className="flex items-center gap-1">
                        <IconClock className="w-3 h-3" />
                        {upload.uploadedAt}
                      </div>
                    </TableCell>
                    <TableCell>{upload.totalRows}</TableCell>
                    <TableCell className="text-green-700 font-medium">{upload.validRows}</TableCell>
                    <TableCell className={upload.errorRows > 0 ? 'text-red-700 font-medium' : 'text-gray-500'}>{upload.errorRows}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                        {upload.status === 'processing' && (
                          <span className="text-xs text-gray-500">Processing in background…</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Drop-off locations dialog */}
      <Dialog open={showDropoffs} onClose={() => setShowDropoffs(false)} size="md" title="Drop-off locations">
        <p className="text-sm text-gray-500 mb-4">Bring your parcels to any of these GoGo Xpress branches.</p>
        <div className="space-y-3 max-h-96 overflow-y-auto">
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

      {/* Fast processing modal */}
      <Dialog open={step === 'fast-processing'} onClose={() => {}} size="sm">
        <div className="text-center py-2 space-y-4">
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Uploading Orders</h3>
          <div className="w-16 h-16 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-600">Please wait while we upload your orders…</p>
        </div>
      </Dialog>

      {/* Background processing modal */}
      <Dialog open={step === 'background-processing'} onClose={() => {}} size="sm">
        <div className="text-center py-2 space-y-4">
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Processing Upload</h3>
          {/* Illustration approximated with Tabler icons */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-14 h-16 bg-blue-100 rounded-lg border-2 border-blue-200 mx-auto mt-1" />
            <div className="w-12 h-14 bg-yellow-100 rounded-lg border-2 border-yellow-200 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 -z-10" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
              <IconArrowUp className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-sm text-gray-600 max-w-xs mx-auto">
            Your orders are being processed. We&apos;ll notify you immediately when the upload is complete.
          </p>
          <Button className="w-full" onClick={handleBackgroundAck}>
            Okay, got it!
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
