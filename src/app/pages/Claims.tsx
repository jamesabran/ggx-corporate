import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { IconInfoCircle, IconReceiptRefund } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/SearchInput';
import { Select } from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
// Claims read goes through the claimsService facade. Scoping/search/status
// filtering below is presentation-only over the service-provided list.
import { getClaimsList, CLAIM_STATUS_META, type Claim, type ClaimStatus } from '../services/claimsService';
import { useSubAccounts } from '../contexts/SubAccountContext';
import { getSubaccountOptions } from '../services/userService';

export function Claims() {
  const navigate = useNavigate();
  const { isMainAccountView, getCurrentAccountId } = useSubAccounts();
  const mainView = isMainAccountView();

  const [allClaims, setAllClaims] = useState<Claim[]>([]);
  useEffect(() => {
    let cancelled = false;
    getClaimsList()
      .then((list) => { if (!cancelled) setAllClaims(list); })
      .catch(() => { if (!cancelled) setAllClaims([]); });
    return () => { cancelled = true; };
  }, []);
  const [statusFilter, setStatusFilter] = useState<'all' | ClaimStatus>('all');
  const [subaccountFilter, setSubaccountFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [subaccountOptions, setSubaccountOptions] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    let cancelled = false;
    getSubaccountOptions()
      .then((opts) => { if (!cancelled) setSubaccountOptions(opts); })
      .catch(() => { if (!cancelled) setSubaccountOptions([]); });
    return () => { cancelled = true; };
  }, []);

  // In subaccount view, scope to current account only.
  const scopedClaims = mainView
    ? allClaims
    : allClaims.filter((c) => c.accountId === getCurrentAccountId());

  const visible = scopedClaims.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    const searchOk =
      q.length < 2 ||
      c.id.toLowerCase().includes(q) ||
      c.trackingNumber.toLowerCase().includes(q);
    const statusOk = statusFilter === 'all' || c.status === statusFilter;
    const subOk    = !subaccountFilter || c.accountId === subaccountFilter;
    return searchOk && statusOk && subOk;
  });

  const openCount = scopedClaims.filter(
    (c) => c.status === 'open' || c.status === 'in-review'
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Claims</h1>
          <p className="text-gray-600 mt-1">
            Refund requests for undelivered transactions.
            {openCount > 0 && (
              <span className="text-amber-700 font-medium"> {openCount} in progress.</span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex-1 min-w-[280px]">
            <SearchInput
              placeholder="Search by claim ID or tracking number..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          {mainView && (
            <div className="w-full sm:w-[160px] flex-shrink-0">
              <Select
                value={subaccountFilter}
                onChange={(e) => setSubaccountFilter(e.target.value)}
              >
                <option value="">All subaccounts</option>
                {subaccountOptions.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </div>
          )}
          <div className="w-full sm:w-[160px] flex-shrink-0">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | ClaimStatus)}
            >
              <option value="all">All claims</option>
              <option value="open">Open</option>
              <option value="in-review">In Review</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
              <option value="settled">Settled</option>
            </Select>
          </div>
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <IconInfoCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              File a claim from a transaction&apos;s details page when a delivery remains
              undelivered. Claims are linked to the tracking number and reviewed by the
              GoGo Xpress claims team.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Claims</CardTitle>
          <CardDescription>Track the status of your refund requests.</CardDescription>
        </CardHeader>
        <CardContent>
          {visible.length === 0 ? (
            <div className="py-12 text-center">
              <IconReceiptRefund className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700">
                {searchQuery.trim().length >= 2 ? 'No claims match your search.' : 'No claims'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {searchQuery.trim().length >= 2
                  ? 'Try a different claim ID or tracking number.'
                  : 'Claims you file will appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Claim ID</TableHead>
                    <TableHead>Tracking Number</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Filed</TableHead>
                    {mainView && <TableHead>Subaccount</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visible.map((c) => {
                    const meta = CLAIM_STATUS_META[c.status];
                    return (
                      <TableRow
                        key={c.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/dashboard/transactions/${c.trackingNumber}`)}
                      >
                        <TableCell className="font-medium">{c.id}</TableCell>
                        <TableCell className="text-blue-600">{c.trackingNumber}</TableCell>
                        <TableCell className="text-gray-600">{c.reason}</TableCell>
                        <TableCell className="text-right text-gray-900">
                          {c.amount ? `₱${c.amount.toLocaleString()}` : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">{c.createdAt}</TableCell>
                        {mainView && (
                          <TableCell className="text-gray-600 text-sm">
                            {c.accountName ?? '—'}
                          </TableCell>
                        )}
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
