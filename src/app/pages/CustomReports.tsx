import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { IconReportAnalytics, IconDownload, IconCalendarClock, IconArrowLeft } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useScopedAccountId } from '../hooks/useAccountScope';
import {
  getTransactions, getTransactionsBySubaccountId, statusConfig,
  SERVICE_TYPE_SHORT_LABEL, type TransactionSummary,
} from '../services/transactionService';

type ColKey = 'tracking' | 'recipient' | 'destination' | 'serviceType' | 'status' | 'date' | 'subaccount';

const COLUMNS: { key: ColKey; label: string }[] = [
  { key: 'tracking', label: 'Tracking number' },
  { key: 'recipient', label: 'Recipient' },
  { key: 'destination', label: 'Destination' },
  { key: 'serviceType', label: 'Service type' },
  { key: 'status', label: 'Status' },
  { key: 'date', label: 'Date' },
  { key: 'subaccount', label: 'Subaccount' },
];

const SAVED_TEMPLATES = ['Weekly delivery summary', 'COD collections by subaccount', 'Failed & returned exceptions'];

function cellValue(row: TransactionSummary, key: ColKey): string {
  switch (key) {
    case 'tracking': return row.tracking;
    case 'recipient': return row.recipient;
    case 'destination': return row.destination;
    case 'serviceType': return SERVICE_TYPE_SHORT_LABEL[row.serviceType];
    case 'status': return statusConfig[row.status].label;
    case 'date': return row.date;
    case 'subaccount': return row.subaccount;
  }
}

function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/**
 * Custom Reports (demo) — a simplified report builder: pick columns, preview the
 * result from live transaction data, and export CSV. "Schedule export" is a demo
 * placeholder. The full builder (saved templates, cross-module joins, scheduling)
 * is backend-owned; this keeps navigation from dead-ending during presentation.
 */
export function CustomReports() {
  const scopeId = useScopedAccountId();
  const [rows, setRows] = useState<TransactionSummary[]>([]);
  const [selected, setSelected] = useState<Set<ColKey>>(
    () => new Set<ColKey>(['tracking', 'recipient', 'serviceType', 'status', 'date']),
  );
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    let active = true;
    const load = scopeId ? getTransactionsBySubaccountId(scopeId) : getTransactions();
    load.then((list) => { if (active) setRows(list); }).catch(() => {});
    return () => { active = false; };
  }, [scopeId]);

  const activeCols = useMemo(() => COLUMNS.filter((c) => selected.has(c.key)), [selected]);
  const previewRows = rows.slice(0, 15);

  const toggle = (key: ColKey) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); } else next.add(key);
      return next;
    });

  const handleExport = () => {
    const header = activeCols.map((c) => c.label).join(',');
    const body = rows.map((r) => activeCols.map((c) => {
      const v = cellValue(r, c.key);
      return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(',')).join('\n');
    downloadCsv('custom-report.csv', `${header}\n${body}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/reports">
          <Button variant="ghost" size="sm"><IconArrowLeft className="w-4 h-4 mr-1.5" /> Back to Reports</Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Custom Reports</h1>
        <p className="text-gray-600 mt-1 max-w-2xl">
          Build a report by choosing columns, preview it against your data, and export. Save templates and
          schedule exports beyond the fixed Reports templates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Builder */}
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Columns</CardTitle></CardHeader>
          <CardContent className="space-y-2.5">
            {COLUMNS.map((c) => (
              <label key={c.key} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.has(c.key)}
                  onChange={() => toggle(c.key)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{c.label}</span>
              </label>
            ))}
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Button size="sm" className="w-full" onClick={() => setGenerated(true)}>
                <IconReportAnalytics className="w-4 h-4" /> Generate report
              </Button>
              <Button size="sm" variant="outline" className="w-full" disabled title="Demo only">
                <IconCalendarClock className="w-4 h-4" /> Schedule export (demo)
              </Button>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Saved templates</p>
              <div className="space-y-1.5">
                {SAVED_TEMPLATES.map((t) => (
                  <div key={t} className="flex items-center gap-2 text-sm text-gray-600">
                    <Badge variant="outline">Demo</Badge>{t}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-base">{generated ? 'Report preview' : 'Preview'}</CardTitle>
              <Button size="sm" variant="outline" onClick={handleExport} disabled={rows.length === 0}>
                <IconDownload className="w-4 h-4" /> Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow>{activeCols.map((c) => <TableHead key={c.key}>{c.label}</TableHead>)}</TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((r) => (
                    <TableRow key={r.tracking}>
                      {activeCols.map((c) => <TableCell key={c.key} className="text-gray-700">{cellValue(r, c.key)}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Showing {previewRows.length} of {rows.length} rows · {activeCols.length} column{activeCols.length === 1 ? '' : 's'}.
              Export includes all rows.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
