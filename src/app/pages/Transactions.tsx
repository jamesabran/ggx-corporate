import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  IconDownload, IconEye, IconPackages, IconList,
  IconChevronDown, IconChevronRight, IconTag,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { SearchInput } from '../components/SearchInput';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useSubAccounts } from '../contexts/SubAccountContext';
// Data access goes through the transactionService facade (not the data module
// directly). The service shapes data the UI needs; in production it is fronted
// by the GGX Corporate BFF over OMS/fulfillment/FTX. See transactionService.ts.
import {
  getTransactions,
  getTransactionBatches,
  statusConfig,
  type TransactionSummary,
  type TransactionBatchGroup,
} from '../services/transactionService';

// ─── component ──────────────────────────────────────────────────────────────

export function Transactions() {
  const navigate = useNavigate();
  const { isMainAccountView, getCurrentAccountId } = useSubAccounts();
  const mainView = isMainAccountView();

  // View mode: flat list vs. grouped by batch
  const [viewMode, setViewMode] = useState<'all' | 'batches'>('all');

  // "All Transactions" filter state
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [subaccountFilter, setSubaccountFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // "By Batch" state
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);

  // Service-backed data
  const [allDeliveries, setAllDeliveries] = useState<TransactionSummary[]>([]);
  const [batchGroups, setBatchGroups] = useState<TransactionBatchGroup[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load the full transaction list once (presentation-only filtering happens
  // locally below — filtering/search/grouping are allowed UI operations).
  useEffect(() => {
    let cancelled = false;
    getTransactions()
      .then((list) => { if (!cancelled) setAllDeliveries(list); })
      .catch(() => { if (!cancelled) setLoadError('Unable to load transactions.'); });
    return () => { cancelled = true; };
  }, []);

  // Load batch groups, scoped to the active subaccount when not in main view.
  // Counts/status come precomputed from the service (treated as backend-provided).
  useEffect(() => {
    let cancelled = false;
    const scopeId = mainView ? undefined : (getCurrentAccountId() ?? undefined);
    getTransactionBatches(scopeId)
      .then((groups) => { if (!cancelled) setBatchGroups(groups); })
      .catch(() => { if (!cancelled) setLoadError('Unable to load batches.'); });
    return () => { cancelled = true; };
  }, [mainView, getCurrentAccountId]);

  // ── All Transactions view (presentation-only filtering) ────────────────────
  const q = searchQuery.trim().toLowerCase();
  const filtered = allDeliveries.filter((d) => {
    const searchOk =
      q.length < 2 ||
      d.tracking.toLowerCase().includes(q) ||
      d.recipient.toLowerCase().includes(q) ||
      d.destination.toLowerCase().includes(q);
    const statusOk = statusFilter === 'all' || d.status === statusFilter;
    const typeOk   = typeFilter === 'all'   || d.type.toLowerCase() === typeFilter;
    const subOk    = subaccountFilter === 'all' || d.subaccount === subaccountFilter;
    return searchOk && statusOk && typeOk && subOk;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Track all your bookings and deliveries</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 gap-0.5">
            <button
              onClick={() => setViewMode('all')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <IconList className="w-3.5 h-3.5" />
              All Transactions
            </button>
            <button
              onClick={() => setViewMode('batches')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                viewMode === 'batches'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <IconPackages className="w-3.5 h-3.5" />
              By Batch
            </button>
          </div>
          <Button variant="outline">
            <IconDownload className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {loadError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {/* ── All Transactions view ──────────────────────────────────────────── */}
      {viewMode === 'all' && (
        <Card>
          <CardHeader>
            {/* Filter toolbar — flex-col on mobile, single row on sm+ */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex-1 min-w-[260px]">
                <SearchInput
                  placeholder="Search by tracking number, recipient, or destination..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>
              {isMainAccountView() && (
                <div className="w-full sm:w-[160px] flex-shrink-0">
                  <Select value={subaccountFilter} onChange={(e) => setSubaccountFilter(e.target.value)}>
                    <option value="all">All Subaccounts</option>
                    <option value="Acme Corporation">Acme Corporation</option>
                    <option value="Acme Luzon">Acme Luzon</option>
                  </Select>
                </div>
              )}
              <div className="w-full sm:w-[160px] flex-shrink-0">
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="picked-up">Picked Up</option>
                  <option value="in-transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                  <option value="returned">Returned</option>
                </Select>
              </div>
              <div className="w-full sm:w-[160px] flex-shrink-0">
                <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="express">Express</option>
                  <option value="standard">Standard</option>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking Number</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Destination</TableHead>
                  {isMainAccountView() && <TableHead>Subaccount</TableHead>}
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isMainAccountView() ? 8 : 7} className="text-center py-8 text-gray-400 text-sm">
                      No transactions match your search or filters.
                    </TableCell>
                  </TableRow>
                ) : filtered.map((delivery) => (
                  <TableRow
                    key={delivery.tracking}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(`/dashboard/transactions/${delivery.tracking}`)}
                  >
                    <TableCell className="font-medium">{delivery.tracking}</TableCell>
                    <TableCell>{delivery.recipient}</TableCell>
                    <TableCell>{delivery.destination}</TableCell>
                    {isMainAccountView() && (
                      <TableCell>
                        <span className="text-sm font-medium text-gray-700">{delivery.subaccount}</span>
                      </TableCell>
                    )}
                    <TableCell>
                      <span className="text-sm text-gray-600">{delivery.type}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[delivery.status].variant}>
                        {statusConfig[delivery.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{delivery.date}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <IconEye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {filtered.length} of {allDeliveries.length} transactions
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── By Batch view ─────────────────────────────────────────────────── */}
      {viewMode === 'batches' && (
        <div className="space-y-4">
          {batchGroups.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <IconPackages className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700">No batches found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Upload transactions via Bulk Upload to create batches.
                </p>
              </CardContent>
            </Card>
          ) : batchGroups.map(({ batch, transactions: items, counts, status: st, uploadedDate }) => {
            const isExpanded = expandedBatch === batch.batchId;
            const { total, delivered, inProgress, failed } = counts;

            return (
              <Card key={batch.batchId}>
                {/* Batch summary row — click to expand */}
                <button
                  className="w-full text-left cursor-pointer"
                  onClick={() => setExpandedBatch(isExpanded ? null : batch.batchId)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      {/* Expand icon */}
                      <div className="flex-shrink-0 text-gray-400">
                        {isExpanded
                          ? <IconChevronDown className="w-5 h-5" />
                          : <IconChevronRight className="w-5 h-5" />}
                      </div>

                      {/* Batch icon */}
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <IconPackages className="w-5 h-5 text-blue-600" />
                      </div>

                      {/* Batch details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm">{batch.batchId}</span>
                          <Badge variant={st.variant}>{st.label}</Badge>
                          {mainView && batch.accountName && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                              <IconTag className="w-3 h-3" />
                              {batch.accountName}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 truncate">
                          {batch.fileName} · Uploaded {uploadedDate}
                        </p>
                      </div>

                      {/* Counts */}
                      <div className="hidden sm:flex items-center gap-5 flex-shrink-0 text-sm text-gray-600">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900">{total}</p>
                          <p className="text-xs text-gray-400">Total</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-green-700">{delivered}</p>
                          <p className="text-xs text-gray-400">Delivered</p>
                        </div>
                        {inProgress > 0 && (
                          <div className="text-center">
                            <p className="font-semibold text-blue-600">{inProgress}</p>
                            <p className="text-xs text-gray-400">In Progress</p>
                          </div>
                        )}
                        {failed > 0 && (
                          <div className="text-center">
                            <p className="font-semibold text-red-600">{failed}</p>
                            <p className="text-xs text-gray-400">Failed</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile counts */}
                    <div className="sm:hidden flex items-center gap-4 mt-3 ml-14 text-sm">
                      <span className="text-gray-600">{total} total</span>
                      <span className="text-green-700">{delivered} delivered</span>
                      {inProgress > 0 && <span className="text-blue-600">{inProgress} in progress</span>}
                      {failed > 0 && <span className="text-red-600">{failed} failed</span>}
                    </div>
                  </CardContent>
                </button>

                {/* Expanded transaction list */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tracking Number</TableHead>
                          <TableHead>Recipient</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((tx) => (
                          <TableRow
                            key={tx.tracking}
                            className="cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => navigate(`/dashboard/transactions/${tx.tracking}`)}
                          >
                            <TableCell className="font-medium">{tx.tracking}</TableCell>
                            <TableCell>{tx.recipient}</TableCell>
                            <TableCell>{tx.destination}</TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">{tx.type}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusConfig[tx.status].variant}>
                                {statusConfig[tx.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-600">{tx.date}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <IconEye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>
            );
          })}

          <p className="text-xs text-gray-400 text-center">
            Showing {batchGroups.length} batch{batchGroups.length !== 1 ? 'es' : ''}.
            Transactions booked individually do not appear in batch view.
          </p>
        </div>
      )}
    </div>
  );
}
