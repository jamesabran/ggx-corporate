import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { IconArrowLeft, IconFileSpreadsheet, IconCircleCheck, IconCircleX, IconAlertCircle, IconDownload, IconPackage, IconArrowRight } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { ConfirmDialog } from '../components/ui/Dialog';

const uploadedData = [
  { row: 1, recipientName: 'TechStart Solutions', contactNumber: '+63-917-555-0100', streetAddress: '123 Ayala Avenue', province: 'Metro Manila', city: 'Makati City', barangay: 'Poblacion', landmarks: '5th Floor, ABC Building', itemName: 'Wireless Mouse', receptacleSize: 'SMALL', collectibleAmount: 4500, collectCOD: 'YES', declaredValue: 4500, insureFullValue: 'YES', recipientPaysFees: 'NO', promoCode: '', referenceId: 'REF-001', valid: true },
  { row: 2, recipientName: 'Innovation Labs Inc.', contactNumber: '+63-917-555-0200', streetAddress: '456 IT Park', province: 'Cebu', city: 'Cebu City', barangay: 'Apas', landmarks: 'Building C', itemName: 'Mechanical Keyboard', receptacleSize: 'MEDIUM', collectibleAmount: 5500, collectCOD: 'YES', declaredValue: 5500, insureFullValue: 'NO', recipientPaysFees: 'YES', promoCode: 'PROMO10', referenceId: 'REF-002', valid: true },
  { row: 3, recipientName: 'Global Enterprises', contactNumber: '+63-917-555-0300', streetAddress: '', province: 'Metro Manila', city: 'Quezon City', barangay: '', landmarks: '', itemName: 'Laptop Stand', receptacleSize: 'MEDIUM', collectibleAmount: 0, collectCOD: 'YES', declaredValue: 3200, insureFullValue: 'YES', recipientPaysFees: 'NO', promoCode: '', referenceId: '', valid: false, errors: ['Missing Street Address', 'Missing Barangay', 'COD marked YES but Collectible Amount is 0'] },
  { row: 4, recipientName: 'Summit Technologies', contactNumber: 'invalid-number', streetAddress: '789 Paseo de Roxas', province: 'Metro Manila', city: 'Makati City', barangay: 'San Lorenzo', landmarks: '', itemName: 'Monitor', receptacleSize: 'LARGE', collectibleAmount: 15000, collectCOD: 'YES', declaredValue: 15000, insureFullValue: 'YES', recipientPaysFees: 'NO', promoCode: '', referenceId: 'REF-004', valid: false, errors: ['Invalid contact number format'] },
  { row: 5, recipientName: 'Metro Solutions Inc.', contactNumber: '+63-917-555-0500', streetAddress: '321 Ortigas Avenue', province: 'Metro Manila', city: 'Pasig City', barangay: 'San Antonio', landmarks: 'Megaplaza Tower', itemName: 'Office Supplies', receptacleSize: 'BOX', collectibleAmount: 8500, collectCOD: 'YES', declaredValue: 8500, insureFullValue: 'YES', recipientPaysFees: 'NO', promoCode: '', referenceId: 'REF-005', valid: true },
];

export function BulkUploadSummary() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validRows = uploadedData.filter((row) => row.valid).length;
  const invalidRows = uploadedData.filter((row) => !row.valid).length;
  const totalRows = uploadedData.length;

  // Success / processed state after the batch is submitted.
  if (submitted) {
    return (
      <div className="p-6">
        <Card className="max-w-xl mx-auto mt-8">
          <CardContent className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <IconCircleCheck className="w-9 h-9 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Batch submitted for processing</h2>
            <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
              {validRows} valid {validRows === 1 ? 'booking is' : 'bookings are'} now being processed. You can track them in the Transactions page once confirmed.
            </p>
            <p className="text-xs text-gray-400 mt-3">Batch ID: {id || 'UPLOAD-2026-05-19-001'}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
              <Button onClick={() => navigate('/dashboard/transactions')}>
                <IconPackage className="w-4 h-4 mr-2" />
                View in Transactions
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard/bulk-uploader')}>
                Upload Another Batch
                <IconArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/bulk-uploader')}>
          <IconArrowLeft className="w-4 h-4 mr-2" />
          Back to Bulk Upload
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bulk Upload Summary</h1>
          <p className="text-gray-600 mt-1">Upload ID: {id || 'UPLOAD-2026-05-19-001'}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <IconDownload className="w-4 h-4 mr-2" />
            Download Error Report
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard/bulk-uploader')}>Replace File</Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Validation Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <IconFileSpreadsheet className="w-8 h-8 text-gray-700" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalRows}</p>
                <p className="text-sm text-gray-600">Total Rows</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
              <IconCircleCheck className="w-8 h-8 text-green-700" />
              <div>
                <p className="text-2xl font-bold text-green-900">{validRows}</p>
                <p className="text-sm text-green-700">Valid Bookings</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
              <IconCircleX className="w-8 h-8 text-red-700" />
              <div>
                <p className="text-2xl font-bold text-red-900">{invalidRows}</p>
                <p className="text-sm text-red-700">Errors Found</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>Review all uploaded rows and validation status</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="default">{totalRows} rows</Badge>
              <Badge variant="success">{validRows} valid</Badge>
              <Badge variant="danger">{invalidRows} errors</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Recipient Name</TableHead>
                  <TableHead>Contact Number</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>COD Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {uploadedData.map((row) => (
                  <TableRow key={row.row} className={row.valid ? '' : 'bg-red-50'}>
                    <TableCell className="font-medium">{row.row}</TableCell>
                    <TableCell>{row.recipientName}</TableCell>
                    <TableCell className={row.errors?.some((e) => e.includes('contact')) ? 'text-red-600' : ''}>
                      {row.contactNumber || <span className="text-red-600">Missing</span>}
                    </TableCell>
                    <TableCell className={row.errors?.some((e) => e.includes('Address')) ? 'text-red-600' : ''}>
                      {row.streetAddress ? (
                        <div className="text-sm">
                          <div>{row.streetAddress}</div>
                          <div className="text-gray-500">{row.barangay}, {row.city}, {row.province}</div>
                        </div>
                      ) : (
                        <span className="text-red-600">Missing</span>
                      )}
                    </TableCell>
                    <TableCell>{row.itemName}</TableCell>
                    <TableCell>{row.receptacleSize}</TableCell>
                    <TableCell>{row.collectCOD === 'YES' ? `₱${row.collectibleAmount.toLocaleString()}` : '-'}</TableCell>
                    <TableCell>
                      {row.valid ? (
                        <div className="flex items-center gap-1 text-green-700">
                          <IconCircleCheck className="w-4 h-4" />
                          <span className="text-sm font-medium">Valid</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-red-700">
                            <IconAlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Error</span>
                          </div>
                          {row.errors && (
                            <div className="text-xs text-red-600">
                              {row.errors.map((error, idx) => <div key={idx}>• {error}</div>)}
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-6 border-t border-gray-200">
            {validRows === 0 ? (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <IconAlertCircle className="w-4 h-4 flex-shrink-0" />
                No valid bookings to submit. Fix the errors in your file and re-upload.
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                {validRows} valid {validRows === 1 ? 'booking' : 'bookings'} ready to proceed
                {invalidRows > 0 && <span className="text-gray-400"> · {invalidRows} row{invalidRows === 1 ? '' : 's'} with errors will be skipped</span>}
              </p>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate('/dashboard/bulk-uploader')}>Cancel</Button>
              <Button disabled={validRows === 0} onClick={() => setShowConfirm(true)}>Proceed with Valid Bookings ({validRows})</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit confirmation */}
      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => { setShowConfirm(false); setSubmitted(true); }}
        title={`Submit ${validRows} valid ${validRows === 1 ? 'booking' : 'bookings'}?`}
        description={
          <>
            {validRows} valid {validRows === 1 ? 'booking' : 'bookings'} will be submitted for processing.
            {invalidRows > 0 && <> The {invalidRows} row{invalidRows === 1 ? '' : 's'} with errors will be skipped and can be re-uploaded later.</>}
          </>
        }
        confirmLabel="Confirm & Submit"
        confirmIcon={<IconCircleCheck className="w-4 h-4 mr-1.5" />}
      />
    </div>
  );
}
