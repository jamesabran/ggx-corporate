import { useState } from 'react';
import { IconDownload, IconRefresh, IconClock, IconPlus, IconFileText } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import {
  SEED_REPORTS, REPORT_TYPE_META, REPORT_STATUS_META, downloadReport,
  type ReportItem, type ReportType,
} from '../data/reports';

const GENERATABLE: { type: ReportType; name: string; period: string }[] = [
  { type: 'billing',    name: 'Monthly Billing Report — Jun 2026',  period: 'June 2026' },
  { type: 'settlement', name: 'Settlement Summary — Jun 1–15',      period: 'June 1–15, 2026' },
  { type: 'delivery',   name: 'Delivery Performance — Jun 2026',    period: 'June 2026' },
  { type: 'analytics',  name: 'Custom Analytics Export',            period: 'Custom range' },
];

export function Reports() {
  const [reports, setReports] = useState<ReportItem[]>(SEED_REPORTS);
  const [genType, setGenType] = useState<ReportType>('billing');

  const readyCount      = reports.filter((r) => r.status === 'ready').length;
  const generatingCount = reports.filter((r) => r.status === 'generating').length;

  // Mock generation: append a 'generating' report, then flip to 'ready'.
  const handleGenerate = () => {
    const tmpl = GENERATABLE.find((g) => g.type === genType)!;
    const id = `RPT-${genType.slice(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`;
    const newReport: ReportItem = {
      id, name: tmpl.name, type: genType, period: tmpl.period,
      generatedAt: 'In progress', status: 'generating', format: 'CSV', sizeLabel: '—',
    };
    setReports((prev) => [newReport, ...prev]);
    setTimeout(() => {
      setReports((prev) => prev.map((r) =>
        r.id === id
          ? { ...r, status: 'ready', generatedAt: 'Just now', sizeLabel: `${Math.floor(Math.random() * 50) + 20} KB` }
          : r
      ));
    }, 2500);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports &amp; Downloads</h1>
          <p className="text-gray-600 mt-1">Generate and download billing, settlement, delivery, and analytics reports.</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Total Reports</p>
            <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            <p className="text-sm text-gray-500 mt-2">Available in your account</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Ready to Download</p>
            <p className="text-2xl font-bold text-green-700">{readyCount}</p>
            <p className="text-sm text-gray-500 mt-2">Completed reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Generating</p>
            <p className="text-2xl font-bold text-amber-600">{generatingCount}</p>
            <p className="text-sm text-gray-500 mt-2">In progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Generate a report */}
      <Card>
        <CardHeader>
          <CardTitle>Generate a Report</CardTitle>
          <CardDescription>Choose a report type. Generated reports appear in the list below.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="flex-1 max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Report type</label>
              <Select value={genType} onChange={(e) => setGenType(e.target.value as ReportType)}>
                {GENERATABLE.map((g) => (
                  <option key={g.type} value={g.type}>{REPORT_TYPE_META[g.type].label} — {g.period}</option>
                ))}
              </Select>
            </div>
            <Button onClick={handleGenerate}>
              <IconPlus className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports list */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Download completed reports (CSV).</CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <div className="py-10 text-center">
              <IconFileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">No reports yet</p>
              <p className="text-xs text-gray-400 mt-1">Generate a report above to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((r) => {
                    const meta = REPORT_TYPE_META[r.type];
                    const Icon = meta.icon;
                    const status = REPORT_STATUS_META[r.status];
                    return (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bgClass}`}>
                              <Icon className={`w-4 h-4 ${meta.iconClass}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900">{r.name}</p>
                              <p className="text-xs text-gray-400">{r.id} · {r.format} · {r.sizeLabel}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-600">{meta.label}</TableCell>
                        <TableCell className="text-gray-600">{r.period}</TableCell>
                        <TableCell className="text-gray-600">
                          <div className="flex items-center gap-1">
                            <IconClock className="w-3 h-3" />
                            {r.generatedAt}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {r.status === 'ready' && (
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => downloadReport(r)}>
                              <IconDownload className="w-3.5 h-3.5 mr-1.5" />
                              Download
                            </Button>
                          )}
                          {r.status === 'generating' && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                              <IconClock className="w-3.5 h-3.5 animate-pulse" />
                              Generating…
                            </span>
                          )}
                          {r.status === 'failed' && (
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              <IconRefresh className="w-3.5 h-3.5 mr-1.5" />
                              Retry
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
