import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  IconArrowLeft, IconCalendarClock, IconCheck, IconDownload, IconLoader2,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useScopedAccountId } from '../hooks/useAccountScope';
import { useSubAccounts } from '../contexts/SubAccountContext';
import {
  getTransactions, getTransactionsBySubaccountId, statusConfig,
  SERVICE_TYPE_SHORT_LABEL,
  type TransactionSummary, type TransactionStatus, type DeliveryServiceType,
} from '../services/transactionService';
import { getSubaccountOptions } from '../services/userService';

type ColKey = 'tracking' | 'recipient' | 'destination' | 'serviceType' | 'status' | 'date' | 'subaccount';
type DateRange = 'today' | 'last7' | 'last30' | 'all';
type StatusFilter = TransactionStatus | 'all' | 'failed_returned';

const COLUMNS: { key: ColKey; label: string }[] = [
  { key: 'tracking',    label: 'Tracking number' },
  { key: 'recipient',   label: 'Recipient' },
  { key: 'destination', label: 'Destination' },
  { key: 'serviceType', label: 'Service type' },
  { key: 'status',      label: 'Status' },
  { key: 'date',        label: 'Date' },
  { key: 'subaccount',  label: 'Subaccount' },
];

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'last30', label: 'Last 30 days' },
  { value: 'last7',  label: 'Last 7 days' },
  { value: 'today',  label: 'Today' },
  { value: 'all',    label: 'All time' },
];

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all',             label: 'All statuses' },
  { value: 'delivered',       label: 'Delivered' },
  { value: 'in-transit',      label: 'In Transit' },
  { value: 'picked-up',       label: 'Picked Up' },
  { value: 'pending',         label: 'Pending' },
  { value: 'failed',          label: 'Failed' },
  { value: 'returned',        label: 'Returned' },
  { value: 'failed_returned', label: 'Failed & Returned' },
];

const SERVICE_TYPE_OPTIONS: { value: DeliveryServiceType | 'all'; label: string }[] = [
  { value: 'all',       label: 'All service types' },
  { value: 'standard',  label: 'Standard' },
  { value: 'same_day',  label: 'Same-Day' },
  { value: 'on_demand', label: 'On-Demand' },
];

interface TemplatePreset {
  columns: Set<ColKey>;
  status: StatusFilter;
  serviceType: DeliveryServiceType | 'all';
  dateRange: DateRange;
}

const TEMPLATES: { name: string; preset: TemplatePreset }[] = [
  {
    name: 'Weekly delivery summary',
    preset: {
      columns: new Set<ColKey>(['tracking', 'recipient', 'destination', 'serviceType', 'status', 'date']),
      status: 'delivered',
      serviceType: 'all',
      dateRange: 'last7',
    },
  },
  {
    name: 'COD collections by subaccount',
    preset: {
      columns: new Set<ColKey>(['tracking', 'subaccount', 'recipient', 'serviceType', 'status', 'date']),
      status: 'delivered',
      serviceType: 'all',
      dateRange: 'last30',
    },
  },
  {
    name: 'Failed & returned exceptions',
    preset: {
      columns: new Set<ColKey>(['tracking', 'recipient', 'destination', 'serviceType', 'status', 'date']),
      status: 'failed_returned',
      serviceType: 'all',
      dateRange: 'last30',
    },
  },
];

const PREVIEW_LIMIT = 15;

function cellValue(row: TransactionSummary, key: ColKey): string {
  switch (key) {
    case 'tracking':    return row.tracking;
    case 'recipient':   return row.recipient;
    case 'destination': return row.destination;
    case 'serviceType': return SERVICE_TYPE_SHORT_LABEL[row.serviceType];
    case 'status':      return statusConfig[row.status].label;
    case 'date':        return row.date;
    case 'subaccount':  return row.subaccount;
  }
}

function applyDateRange(rows: TransactionSummary[], range: DateRange): TransactionSummary[] {
  if (range === 'all') return rows;
  const dates = rows.map((r) => r.date).sort();
  if (dates.length === 0) return [];
  const anchor = dates[dates.length - 1];
  const anchorMs = new Date(anchor).getTime();
  const days = range === 'today' ? 1 : range === 'last7' ? 7 : 30;
  const cutoff = new Date(anchorMs - (days - 1) * 86_400_000).toISOString().slice(0, 10);
  return rows.filter((r) => r.date >= cutoff);
}

function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/**
 * Custom Reports — report builder: configure setup → live preview → export.
 * "Save template" and "Schedule export" are deferred (persistence and scheduling
 * are backend-owned). See docs/roadmap.md for deferred items.
 */
export function CustomReports() {
  const scopeId = useScopedAccountId();
  const { isMainAccountView, subAccountsEnabled } = useSubAccounts();
  const isMainView = isMainAccountView();

  const [allRows, setAllRows] = useState<TransactionSummary[]>([]);
  const [selected, setSelected] = useState<Set<ColKey>>(
    () => new Set<ColKey>(['tracking', 'recipient', 'serviceType', 'status', 'date']),
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<DeliveryServiceType | 'all'>('all');
  const [subaccountFilter, setSubaccountFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>('last30');
  const [subaccountOptions, setSubaccountOptions] = useState<{ id: string; name: string }[]>([]);
  const [exporting, setExporting] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    let active = true;
    const load = scopeId ? getTransactionsBySubaccountId(scopeId) : getTransactions();
    load.then((list) => { if (active) setAllRows(list); }).catch(() => {});
    return () => { active = false; };
  }, [scopeId]);

  useEffect(() => {
    if (!isMainView || !subAccountsEnabled) return;
    let active = true;
    getSubaccountOptions()
      .then((opts) => { if (active) setSubaccountOptions(opts); })
      .catch(() => {});
    return () => { active = false; };
  }, [isMainView, subAccountsEnabled]);

  const filteredRows = useMemo(() => {
    let result = applyDateRange(allRows, dateRange);
    if (serviceTypeFilter !== 'all') {
      result = result.filter((r) => r.serviceType === serviceTypeFilter);
    }
    if (statusFilter === 'failed_returned') {
      result = result.filter((r) => r.status === 'failed' || r.status === 'returned');
    } else if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }
    if (isMainView && subaccountFilter !== 'all') {
      const name = subaccountOptions.find((o) => o.id === subaccountFilter)?.name;
      if (name) result = result.filter((r) => r.subaccount === name);
    }
    return result;
  }, [allRows, dateRange, serviceTypeFilter, statusFilter, subaccountFilter, isMainView, subaccountOptions]);

  const activeCols = useMemo(() => COLUMNS.filter((c) => selected.has(c.key)), [selected]);
  const previewRows = filteredRows.slice(0, PREVIEW_LIMIT);

  const toggle = (key: ColKey) =>
    setSelected((prev) => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });

  const loadTemplate = (preset: TemplatePreset) => {
    setSelected(new Set(preset.columns));
    setStatusFilter(preset.status);
    setServiceTypeFilter(preset.serviceType);
    setDateRange(preset.dateRange);
  };

  const handleExport = () => {
    if (exporting || filteredRows.length === 0 || activeCols.length === 0) return;
    setExporting(true);
    setTimeout(() => {
      const header = activeCols.map((c) => c.label).join(',');
      const body = filteredRows.map((r) =>
        activeCols.map((c) => {
          const v = cellValue(r, c.key);
          return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
        }).join(',')
      ).join('\n');
      downloadCsv('custom-report.csv', `${header}\n${body}`);
      setExporting(false);
    }, 400);
  };

  const handleSaveTemplate = () => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const noColumns = activeCols.length === 0;
  const noResults = !noColumns && filteredRows.length === 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/reports">
          <Button variant="ghost" size="sm">
            <IconArrowLeft className="w-4 h-4 mr-1.5" /> Back to Reports
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Custom Reports</h1>
        <p className="text-gray-600 mt-1 max-w-2xl">
          Configure a report, preview it against your data, then export.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left panel — Report setup */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader><CardTitle className="text-base">Report setup</CardTitle></CardHeader>
          <CardContent className="space-y-5">

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Data source</p>
              <p className="text-sm text-gray-700">Transactions</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Date range</p>
              <Select value={dateRange} onChange={(e) => setDateRange(e.target.value as DateRange)}>
                {DATE_RANGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Filters</p>
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}>
                    {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Service type</label>
                  <Select value={serviceTypeFilter} onChange={(e) => setServiceTypeFilter(e.target.value as DeliveryServiceType | 'all')}>
                    {SERVICE_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </Select>
                </div>
                {isMainView && subAccountsEnabled && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Subaccount</label>
                    <Select value={subaccountFilter} onChange={(e) => setSubaccountFilter(e.target.value)}>
                      <option value="all">All subaccounts</option>
                      {subaccountOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Columns</p>
              <div className="space-y-2">
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
              </div>
            </div>

            <div className="pt-1 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Saved templates</p>
              <div className="space-y-1.5">
                {TEMPLATES.map(({ name, preset }) => (
                  <button
                    key={name}
                    onClick={() => loadTemplate(preset)}
                    className="w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:underline py-0.5 cursor-pointer"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400 flex items-start gap-1.5">
                <IconCalendarClock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                Scheduled exports will be available in a future update.
              </p>
            </div>

          </CardContent>
        </Card>

        {/* Right panel — Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle className="text-base">Preview</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveTemplate}
                  disabled={savedFlash}
                >
                  {savedFlash
                    ? <><IconCheck className="w-4 h-4" /> Saved</>
                    : 'Save template'
                  }
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={exporting || filteredRows.length === 0 || noColumns}
                >
                  {exporting
                    ? <><IconLoader2 className="w-4 h-4 animate-spin" /> Preparing CSV…</>
                    : <><IconDownload className="w-4 h-4" /> Export CSV</>
                  }
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {noColumns ? (
              <div className="py-14 text-center text-sm text-gray-500">
                Select at least one column to preview your report.
              </div>
            ) : noResults ? (
              <div className="py-14 text-center text-sm text-gray-500">
                No records match this report setup. Try changing the date range or filters.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {activeCols.map((c) => <TableHead key={c.key}>{c.label}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewRows.map((r) => (
                        <TableRow key={r.tracking}>
                          {activeCols.map((c) => (
                            <TableCell key={c.key} className="text-gray-700">
                              {cellValue(r, c.key)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Showing {previewRows.length} preview row{previewRows.length === 1 ? '' : 's'} from {filteredRows.length} matching record{filteredRows.length === 1 ? '' : 's'}.{' '}
                  CSV export includes all matching records.
                </p>
              </>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
