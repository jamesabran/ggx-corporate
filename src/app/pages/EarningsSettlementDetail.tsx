import { Link, useParams } from 'react-router';
import { IconArrowLeft, IconArrowRight, IconWallet } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { getSettlement, SETTLEMENT_STATUS_CONFIG } from '../data/earnings';

const txStatusConfig = {
  delivered: { variant: 'success' as const, label: 'Delivered' },
  failed:    { variant: 'danger'  as const, label: 'Failed' },
  returned:  { variant: 'default' as const, label: 'Returned' },
};

export function EarningsSettlementDetail() {
  const { settlementId } = useParams<{ settlementId: string }>();
  const settlement = settlementId ? getSettlement(settlementId) : undefined;

  if (!settlement) {
    return (
      <div className="p-6 space-y-4">
        <Link to="/dashboard/earnings">
          <Button variant="ghost" size="sm">
            <IconArrowLeft className="w-4 h-4 mr-2" />
            Back to Earnings
          </Button>
        </Link>
        <Card>
          <CardContent className="p-12 text-center">
            <IconWallet className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-gray-700">Settlement not found</p>
            <p className="text-sm text-gray-400 mt-1">
              No settlement with ID <span className="font-mono">{settlementId}</span>.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusMeta = SETTLEMENT_STATUS_CONFIG[settlement.status];
  const totalCod  = settlement.transactions.reduce((s, t) => s + t.codAmount, 0);
  const totalFees = settlement.transactions.reduce((s, t) => s + t.fees, 0);
  const totalNet  = settlement.transactions.reduce((s, t) => s + t.net, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link to="/dashboard/earnings" className="text-gray-500 hover:text-blue-600 transition-colors">
          Earnings
        </Link>
        <span className="text-gray-400">›</span>
        <span className="text-gray-900 font-semibold">{settlement.id}</span>
      </nav>

      <div className="flex items-center gap-4">
        <Link to="/dashboard/earnings">
          <Button variant="ghost" size="sm">
            <IconArrowLeft className="w-4 h-4 mr-2" />
            Back to Earnings
          </Button>
        </Link>
      </div>

      {/* Settlement header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settlement {settlement.id}</h1>
          <p className="text-gray-600 mt-1">{settlement.period} · {settlement.source} · {settlement.subaccount}</p>
        </div>
        <Badge variant={statusMeta.variant} className="text-sm px-3 py-1 w-fit">
          {statusMeta.label}
        </Badge>
      </div>

      {/* Settlement summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-gray-500 mb-1">Gross Amount</p>
            <p className="text-2xl font-bold text-gray-900">₱{settlement.grossAmount.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">Before fees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-gray-500 mb-1">Total Fees (3%)</p>
            <p className="text-2xl font-bold text-gray-700">-₱{settlement.fees.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">Service + handling</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-5">
            <p className="text-xs text-gray-500 mb-1">Net Payout</p>
            <p className="text-2xl font-bold text-green-700">₱{settlement.netAmount.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">
              Expected: {settlement.expectedDate}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions in this settlement */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions in this Settlement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking Number</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead className="text-right">COD Amount</TableHead>
                  <TableHead className="text-right">Fees</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settlement.transactions.map((tx) => {
                  const txMeta = txStatusConfig[tx.status];
                  return (
                    <TableRow key={tx.trackingNumber}>
                      <TableCell className="font-medium">
                        <Link
                          to={`/dashboard/transactions/${tx.trackingNumber}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {tx.trackingNumber}
                          <IconArrowRight className="w-3 h-3" />
                        </Link>
                      </TableCell>
                      <TableCell className="text-gray-900">{tx.recipient}</TableCell>
                      <TableCell className="text-gray-600">{tx.destination}</TableCell>
                      <TableCell className="text-right text-gray-900">
                        {tx.codAmount > 0 ? `₱${tx.codAmount.toLocaleString()}` : '—'}
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        -₱{tx.fees.toFixed(2)}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${tx.net >= 0 ? 'text-green-700' : 'text-gray-600'}`}>
                        ₱{tx.net.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={txMeta.variant}>{txMeta.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Totals row */}
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end gap-4 text-sm">
            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-gray-500">Total COD</p>
                <p className="font-semibold text-gray-900">₱{totalCod.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">Total Fees</p>
                <p className="font-semibold text-gray-700">-₱{totalFees.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">Total Net</p>
                <p className="font-semibold text-green-700">₱{totalNet.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4">
            {settlement.transactions.length} transaction{settlement.transactions.length !== 1 ? 's' : ''} in this settlement period.
            Transaction data is illustrative (mock). Real payout reconciliation requires backend integration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
