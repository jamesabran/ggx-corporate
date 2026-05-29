import { useState } from 'react';
import { useNavigate } from 'react-router';
import { IconUpload, IconDownload, IconFileSpreadsheet, IconMapPin, IconClock } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { AddressBook, type Address } from '../components/AddressBook';

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

export function BulkUploader() {
  const navigate = useNavigate();
  const [uploadMode, setUploadMode] = useState<'standard' | 'same-day'>('standard');
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

  const handleFileUpload = () => {
    navigate('/dashboard/bulk-uploader/summary/UPLOAD-2026-05-19-001');
  };

  if (showAddressBook) {
    return (
      <div className="p-6">
        <AddressBook mode="select" onSelectAddress={handleSelectAddress} onClose={() => setShowAddressBook(false)} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bulk Uploader</h1>
        <p className="text-gray-600 mt-1">Upload CSV files to create multiple shipments at once</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUploadMode('standard')}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${uploadMode === 'standard' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <IconUpload className="w-5 h-5" />
                <div>
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
                <IconClock className="w-5 h-5" />
                <div>
                  <div className="font-semibold">Same-Day Delivery</div>
                  <div className={`text-xs ${uploadMode === 'same-day' ? 'text-orange-100' : 'text-gray-500'}`}>Express same-day processing</div>
                </div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-blue-900">Pickup Address</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowAddressBook(true)} className="bg-white">
              <IconMapPin className="w-4 h-4 mr-1" />
              Change Address
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedAddress ? (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <IconMapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={selectedAddress.label === 'office' ? 'info' : selectedAddress.label === 'home' ? 'success' : 'default'}>
                    {selectedAddress.label === 'custom' ? selectedAddress.customLabel : selectedAddress.label}
                  </Badge>
                  {selectedAddress.isPreferred && <Badge variant="warning">Preferred Pickup</Badge>}
                </div>
                <p className="font-semibold text-blue-900 mb-1">{selectedAddress.name}</p>
                <p className="text-sm text-blue-800">{selectedAddress.mobileNumber}</p>
                <p className="text-sm text-blue-800 mt-1">{selectedAddress.barangay}, {selectedAddress.city}, {selectedAddress.province}</p>
                {selectedAddress.otherDetails && <p className="text-sm text-blue-700 mt-1">{selectedAddress.otherDetails}</p>}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-blue-800 mb-3">No pickup address selected</p>
              <Button onClick={() => setShowAddressBook(true)}>
                <IconMapPin className="w-4 h-4 mr-2" />
                Select Pickup Address
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>Drag and drop your Excel file or click to browse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50/50" onClick={handleFileUpload}>
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <IconUpload className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-1">Drop your Excel file here</p>
                  <p className="text-sm text-gray-600">or <span className="text-blue-600 font-medium">browse files</span></p>
                </div>
                <p className="text-xs text-gray-500">Supported format: .xlsx | Maximum file size: 10MB</p>
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <Button onClick={handleFileUpload}>
                <IconFileSpreadsheet className="w-4 h-4 mr-2" />
                Simulate Upload
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Template & Resources</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <IconDownload className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <IconDownload className="w-4 h-4 mr-2" />
                Download Location Reference
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Requirements</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p className="text-gray-700 font-medium">Required Columns:</p>
                <ul className="space-y-1 text-gray-600 text-xs">
                  <li>• Recipient Name, Contact, Address</li>
                  <li>• Province, City, Barangay</li>
                  <li>• Item Name, Receptacle Size</li>
                  <li>• COD Settings, Insurance</li>
                </ul>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-700 font-medium mb-2">Receptacle Sizes:</p>
                <div className="flex flex-wrap gap-1">
                  {['SMALL', 'MEDIUM', 'LARGE', 'BOX', 'OVERSIZED'].map((size) => (
                    <Badge key={size} variant="default" className="text-xs">{size}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>View and manage your recent bulk upload batches</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Upload ID</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Upload Time</TableHead>
                <TableHead>Total Rows</TableHead>
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
    </div>
  );
}
