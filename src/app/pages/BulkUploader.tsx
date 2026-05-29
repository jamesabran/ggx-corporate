import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { IconUpload, IconDownload, IconFileSpreadsheet, IconMapPin, IconClock, IconChevronRight, IconLink, IconX, IconTruckDelivery, IconBuildingStore, IconPhone } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Dialog } from '../components/ui/Dialog';
import { AddressBook, type Address } from '../components/AddressBook';
import { PaymentMethodTabs } from '../components/PaymentMethodTabs';
import { downloadBulkTemplate, BULK_TEMPLATE_COLUMNS } from '../data/bulkTemplate';
import { DROPOFF_LOCATIONS } from '../data/dropoffLocations';
import { isBillingAccount } from '../data/paymentAccounts';
import { useSubAccounts } from '../contexts/SubAccountContext';

const recentUploads = [
  { id: 'UPLOAD-2026-05-19-001', fileName: 'bulk_shipments_may19.xlsx', uploadedAt: '2026-05-19 10:30 AM', totalRows: 5, validRows: 3, errorRows: 2, status: 'needs-review' },
  { id: 'UPLOAD-2026-05-18-003', fileName: 'daily_orders_batch3.xlsx', uploadedAt: '2026-05-18 04:15 PM', totalRows: 25, validRows: 25, errorRows: 0, status: 'completed' },
  { id: 'UPLOAD-2026-05-18-002', fileName: 'weekend_deliveries.xlsx', uploadedAt: '2026-05-18 02:45 PM', totalRows: 12, validRows: 10, errorRows: 2, status: 'completed' },
  { id: 'UPLOAD-2026-05-18-001', fileName: 'morning_batch.xlsx', uploadedAt: '2026-05-18 09:20 AM', totalRows: 8, validRows: 8, errorRows: 0, status: 'completed' },
];

const statusConfig = {
  processing: { variant: 'info' as const, label: 'Processing' },
  'needs-review': { variant: 'warning' as const, label: 'Needs Review' },
  'awaiting-payment': { variant: 'pending' as const, label: 'Awaiting Payment' },
  completed: { variant: 'success' as const, label: 'Completed' },
};

const NEW_UPLOAD_ID = 'UPLOAD-2026-05-19-001';

export function BulkUploader() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { getCurrentAccountName } = useSubAccounts();

  // Billing availability is derived from the active account/subaccount contract,
  // not a separate selector. Finance is handled at the parent account level.
  const activeAccountName = getCurrentAccountName();
  const billingAvailable = isBillingAccount(activeAccountName);

  const [uploadMode, setUploadMode] = useState<'standard' | 'same-day'>('standard');
  const [firstMile, setFirstMile] = useState<'pickup' | 'dropoff'>('pickup');
  const [pickupDate, setPickupDate] = useState('');
  const [showDropoffs, setShowDropoffs] = useState(false);
  const [uploadUrl, setUploadUrl] = useState('');

  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading'>('idle');

  const [showAddressBook, setShowAddressBook] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>({
    id: '1',
    label: 'office',
    name: 'Acme Corporation',
    mobileNumber: '+63 917 123 4567',
    province: 'Metro Manila',
    city: 'Makati',
    barangay: 'Poblacion',
    otherDetails: '5th Floor, ABC Building, Ayala Avenue',
    isPreferred: true,
  });

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    setShowAddressBook(false);
  };

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

  // Frontend-only: no real parsing. Proceeds to the validation summary mock.
  const startUpload = () => {
    setUploadStatus('uploading');
    setTimeout(() => navigate(`/dashboard/bulk-uploader/summary/${NEW_UPLOAD_ID}`), 700);
  };

  if (showAddressBook) {
    return (
      <div className="p-6">
        <AddressBook mode="select" onSelectAddress={handleSelectAddress} onClose={() => setShowAddressBook(false)} />
      </div>
    );
  }

  const accentText = uploadMode === 'same-day' ? 'text-orange-700' : 'text-blue-700';

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500">
        <Link to="/dashboard/transactions" className="hover:text-gray-700">Transactions</Link>
        <IconChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">Bulk Upload</span>
      </nav>

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

      {/* Mode toggle */}
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
                  <div className={`text-xs ${uploadMode === 'same-day' ? 'text-orange-100' : 'text-gray-500'}`}>Express same-day processing</div>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: sender + schedule + payment config */}
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
            <CardHeader><CardTitle>First-mile & Schedule</CardTitle></CardHeader>
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
                    {uploadMode === 'same-day' ? 'Same-day cut-off is 11:00 AM. Orders after cut-off move to next day.' : 'Pick-ups are scheduled the next business day by default.'}
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

        {/* Right: upload */}
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
                  <Button disabled={!uploadUrl.trim() || uploadStatus === 'uploading'} onClick={startUpload}>Import</Button>
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
                    {uploadStatus === 'idle' && (
                      <button onClick={() => setSelectedFile(null)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Remove file">
                        <IconX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <Button className="w-full mt-4" disabled={uploadStatus === 'uploading'} onClick={startUpload}>
                    {uploadStatus === 'uploading' ? (
                      <>
                        <IconClock className="w-4 h-4 mr-2 animate-spin" />
                        Uploading & validating…
                      </>
                    ) : (
                      <>
                        <IconFileSpreadsheet className="w-4 h-4 mr-2" />
                        Upload & Validate
                      </>
                    )}
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
                  Required columns: {BULK_TEMPLATE_COLUMNS.slice(0, 9).join(', ')}, and more.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Province, City/Municipality, and Barangay must be valid GGX-supported locations — the same options shown when selecting an address in the Address Book.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>Your recently uploaded batches. Completed uploads appear in the Transactions page.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Upload Batch ID</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead>Total Orders</TableHead>
                <TableHead>Valid</TableHead>
                <TableHead>Errors</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUploads.map((upload) => (
                <TableRow key={upload.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/dashboard/bulk-uploader/summary/${upload.id}`)}>
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
                    <Badge variant={statusConfig[upload.status as keyof typeof statusConfig].variant}>
                      {statusConfig[upload.status as keyof typeof statusConfig].label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Drop-off locations */}
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
    </div>
  );
}
