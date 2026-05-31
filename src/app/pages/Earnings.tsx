import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { IconDownload, IconBuilding, IconCircleCheck, IconAlertCircle } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useSubAccounts } from '../contexts/SubAccountContext';
// Settlement figures are FTX-owned official finance values delivered via the
// BFF; the page only renders what earningsService returns.
import { getSettlements, SETTLEMENT_STATUS_CONFIG, type Settlement } from '../services/earningsService';

export function Earnings() {
  const { isMainAccountView } = useSubAccounts();
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  useEffect(() => {
    let cancelled = false;
    getSettlements()
      .then((list) => { if (!cancelled) setSettlements(list); })
      .catch(() => { if (!cancelled) setSettlements([]); });
    return () => { cancelled = true; };
  }, []);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [subaccountFilter, setSubaccountFilter] = useState('all');

  const availablePayout = 472875;
  const pendingCollection = 98450;
  const scheduledDeposit = 472875;
  const remittedMonth = 1386812;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earnings</h1>
          <p className="text-gray-600 mt-1">Track your COD collections and online payment settlements</p>
        </div>
        <Button>
          <IconDownload className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 bg-green-100">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Available for Payout</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">₱{availablePayout.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-2">Ready to withdraw</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
                <IconCircleCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-orange-100">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Pending Collection</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">₱{pendingCollection.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-2">In process</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-600 flex items-center justify-center">
                <IconAlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-blue-100">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Scheduled for Deposit</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">₱{scheduledDeposit.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-2">Next payout</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <IconBuilding className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-purple-100">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Remitted This Month</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">₱{remittedMonth.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-2">May 2026</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
                <IconDownload className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader><CardTitle>Primary Bank Account</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-semibold text-gray-900">BDO Unibank</p>
                <Badge variant="success">Verified</Badge>
              </div>
              <p className="text-gray-600">Account Number: •••• •••• ••34 5678</p>
              <p className="text-sm text-gray-500 mt-1">Acme Corporation</p>
            </div>
            <Button variant="outline">Manage Bank Account</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle>Settlement History</CardTitle>
            <div className="flex gap-3">
              {isMainAccountView() && (
                <Select value={subaccountFilter} onChange={(e) => setSubaccountFilter(e.target.value)}>
                  <option value="all">All Subaccounts</option>
                  <option value="Acme Corporation">Acme Corporation</option>
                  <option value="Acme Luzon">Acme Luzon</option>
                </Select>
              )}
              <Select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                <option value="all">All Sources</option>
                <option value="cod">COD</option>
                <option value="online">Online Payment</option>
              </Select>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="scheduled">Scheduled</option>
                <option value="deposited">Deposited</option>
                <option value="failed">Failed</option>
              </Select>
              <Input type="date" className="w-40" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Settlement ID</TableHead>
                {isMainAccountView() && <TableHead>Subaccount</TableHead>}
                <TableHead>Source</TableHead>
                <TableHead>Collection Period</TableHead>
                <TableHead>Gross Amount</TableHead>
                <TableHead>Fees</TableHead>
                <TableHead>Net Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expected Deposit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlements.map((settlement) => (
                <TableRow key={settlement.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/dashboard/earnings/${settlement.id}`}
                      className="text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {settlement.id}
                    </Link>
                  </TableCell>
                  {isMainAccountView() && (
                    <TableCell><span className="text-sm font-medium text-gray-700">{settlement.subaccount}</span></TableCell>
                  )}
                  <TableCell>
                    <Badge variant={settlement.source === 'COD' ? 'info' : 'default'}>{settlement.source}</Badge>
                  </TableCell>
                  <TableCell>{settlement.period}</TableCell>
                  <TableCell className="font-medium">₱{settlement.grossAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-gray-600">-₱{settlement.fees.toLocaleString()}</TableCell>
                  <TableCell className="font-medium text-green-700">₱{settlement.netAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={SETTLEMENT_STATUS_CONFIG[settlement.status as keyof typeof SETTLEMENT_STATUS_CONFIG].variant}>
                      {SETTLEMENT_STATUS_CONFIG[settlement.status as keyof typeof SETTLEMENT_STATUS_CONFIG].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{settlement.expectedDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">Showing 5 of 24 settlements</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
