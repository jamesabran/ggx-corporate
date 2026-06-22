import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  IconArrowLeft, IconCircleCheck, IconFileSpreadsheet, IconClock, IconExternalLink,
  IconPackages, IconReceipt2, IconHourglassHigh,
} from '@tabler/icons-react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { getBulkUploadById, type UploadRecord } from '../services/bulkUploadService';
import { BULK_FIELD_LABELS as L } from '../data/bulkTemplate';

/**
 * Read-only detail page for a COMPLETED bulk upload. Reached from Recent Uploads
 * when a batch has status `completed`. It deliberately contains NO editable grid,
 * review/error sections, or "Revalidate changes" — those belong to the pre-booking
 * review page. Created transactions are presented as "Awaiting payment" (a
 * successful upload is never shown as paid).
 */

const SOURCE_LABEL: Record<'file' | 'spreadsheet', string> = {
  file: 'Uploaded file',
  spreadsheet: 'In-app spreadsheet',
};

const MODE_LABEL: Record<UploadRecord['uploadMode'], string> = {
  standard: 'Standard Upload',
  'same-day': 'Same-Day Delivery',
  'on-demand': 'On-Demand Delivery',
};

// Sample recipients used to render a representative read-only transaction list.
const SAMPLE_RECIPIENTS = [
  'Lia Santos', 'Marco Alonzo', 'Tessa Cruz', 'Rico Mendoza', 'Nina Reyes',
  'Paolo Cruz', 'Mara Lim', 'Diego Santos', 'Ana Villanueva', 'Carlo Reyes',
];

interface CompletedTxnRow {
  tracking: string;
  recipient: string;
  itemName: string;
  amount: number;
}

function buildTransactionRows(record: UploadRecord): CompletedTxnRow[] {
  const datePart = record.id.replace(/^UPLOAD-/, '').replace(/-\d+$/, '');
  const count = Math.min(record.validRows, SAMPLE_RECIPIENTS.length);
  return Array.from({ length: count }, (_, i) => ({
    tracking: `GGX-${datePart}-${String(i + 1).padStart(4, '0')}`,
    recipient: SAMPLE_RECIPIENTS[i],
    itemName: 'UNO FLIP! Double Sided Card',
    amount: 600,
  }));
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500">{label}</p>
          <p className="text-lg font-semibold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function BulkUploadCompleted() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [record, setRecord] = useState<UploadRecord | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    getBulkUploadById(id ?? '')
      .then((r) => { if (active) { setRecord(r); setLoaded(true); } })
      .catch(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, [id]);

  const txnUrl = `/dashboard/transactions?view=batches&batch=${encodeURIComponent(id ?? '')}`;
  const peso = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const txnRows = record ? buildTransactionRows(record) : [];
  const createdCount = record?.validRows ?? 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard/bulk-uploader')}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <IconArrowLeft className="w-4 h-4 mr-2" />
          Back to Bulk Upload
        </button>
      </div>

      {!loaded ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : !record ? (
        <Card><CardContent className="p-6 text-sm text-gray-500">This upload could not be found.</CardContent></Card>
      ) : (
        <>
          {/* Title + status */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <IconFileSpreadsheet className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{record.fileName}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Batch ID: <span className="text-gray-700 font-medium">{record.id}</span>
                  &nbsp;·&nbsp;
                  <span className="inline-flex items-center gap-1">
                    <IconClock className="w-3.5 h-3.5" />{record.uploadedAt}
                  </span>
                  &nbsp;·&nbsp;
                  Source: <span className="text-gray-700 font-medium">{SOURCE_LABEL[record.source ?? 'file']}</span>
                  &nbsp;·&nbsp;
                  {MODE_LABEL[record.uploadMode]}
                </p>
              </div>
            </div>
            <Badge variant="success" className="self-start flex items-center gap-1.5 px-3 py-1">
              <IconCircleCheck className="w-4 h-4" />
              Completed
            </Badge>
          </div>

          {/* Summary stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard icon={<IconPackages className="w-5 h-5" />} label="Total rows processed" value={record.totalRows} />
            <StatCard icon={<IconReceipt2 className="w-5 h-5" />} label="Created transactions" value={createdCount} />
            <StatCard icon={<IconHourglassHigh className="w-5 h-5" />} label="Awaiting payment" value={createdCount} />
          </div>

          {/* Read-only transaction list */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-base font-semibold text-gray-900">Created transactions</p>
                  <p className="text-sm text-gray-500">
                    These orders were created from this upload and are awaiting payment.
                  </p>
                </div>
                <a
                  href={txnUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View transactions
                  <IconExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tracking #</TableHead>
                      <TableHead>{L.name}</TableHead>
                      <TableHead>{L.itemName}</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {txnRows.map((row) => (
                      <TableRow key={row.tracking}>
                        <TableCell className="font-medium text-blue-600">{row.tracking}</TableCell>
                        <TableCell className="text-gray-900">{row.recipient}</TableCell>
                        <TableCell className="text-gray-600">{row.itemName}</TableCell>
                        <TableCell className="text-right text-gray-900">{peso(row.amount)}</TableCell>
                        <TableCell><Badge variant="pending">Awaiting payment</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {createdCount > txnRows.length && (
                <p className="text-center text-sm text-blue-600 mt-3 font-medium">
                  Showing {txnRows.length} of {createdCount}. View all in the transactions page.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
