import { useState } from 'react';
import { Link } from 'react-router';
import { IconDownload, IconCreditCard } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useSubAccounts } from '../contexts/SubAccountContext';

const summaryStats = [
  { label: 'Current Balance', value: '₱2,418,000', description: 'Amount owed to GoGo Xpress' },
  { label: 'Due This Month', value: '₱2,418,000', description: 'Payment due by Jun 5, 2026' },
  { label: 'Overdue Amount', value: '₱0', description: 'No overdue payments' },
  { label: 'Last Payment', value: '₱2,062,500', description: 'Paid on May 5, 2026' },
];

const invoices = [
  { id: 'INV-2026-05', period: 'May 2026', amount: '₱2,418,000', deliveries: 2847, status: 'pending', dueDate: '2026-06-05', subaccount: 'Acme Corporation' },
  { id: 'INV-2026-04', period: 'April 2026', amount: '₱2,062,500', deliveries: 2456, status: 'paid', dueDate: '2026-05-05', subaccount: 'Acme Luzon' },
  { id: 'INV-2026-03', period: 'March 2026', amount: '₱2,256,000', deliveries: 2678, status: 'paid', dueDate: '2026-04-05', subaccount: 'Acme Corporation' },
  { id: 'INV-2026-02', period: 'February 2026', amount: '₱1,947,000', deliveries: 2312, status: 'paid', dueDate: '2026-03-05', subaccount: 'Acme Luzon' },
  { id: 'INV-2026-01', period: 'January 2026', amount: '₱2,106,900', deliveries: 2501, status: 'paid', dueDate: '2026-02-05', subaccount: 'Acme Corporation' },
  { id: 'INV-2025-12', period: 'December 2025', amount: '₱2,584,000', deliveries: 3067, status: 'paid', dueDate: '2026-01-05', subaccount: 'Acme Luzon' },
];

const statusConfig = {
  paid: { variant: 'success' as const, label: 'Paid' },
  pending: { variant: 'pending' as const, label: 'Pending' },
  overdue: { variant: 'danger' as const, label: 'Overdue' },
  'partially-paid': { variant: 'warning' as const, label: 'Partially Paid' },
};

export function BillingStatement() {
  const { isMainAccountView } = useSubAccounts();
  const [subaccountFilter, setSubaccountFilter] = useState('all');

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing Statements</h1>
          <p className="text-gray-600 mt-1">Manage invoices for services owed to GoGo Xpress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-2">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <IconCreditCard className="w-5 h-5 text-blue-600" />
                <p className="font-semibold text-blue-900">Payment Method on File</p>
              </div>
              <p className="text-blue-800">Visa ending in •••• 4242</p>
              <p className="text-sm text-blue-700 mt-1">Auto-pay enabled for statements</p>
            </div>
            <Link to="/dashboard/payment-settings">
              <Button variant="outline" size="sm" className="bg-white">Manage Payment</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle>Invoice History</CardTitle>
            <div className="flex gap-3">
              {isMainAccountView() && (
                <Select value={subaccountFilter} onChange={(e) => setSubaccountFilter(e.target.value)}>
                  <option value="all">All Subaccounts</option>
                  <option value="Acme Corporation">Acme Corporation</option>
                  <option value="Acme Luzon">Acme Luzon</option>
                </Select>
              )}
              <Select defaultValue="all">
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </Select>
              <Select defaultValue="2026">
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                {isMainAccountView() && <TableHead>Subaccount</TableHead>}
                <TableHead>Period</TableHead>
                <TableHead>Deliveries</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  {isMainAccountView() && (
                    <TableCell><span className="text-sm font-medium text-gray-700">{invoice.subaccount}</span></TableCell>
                  )}
                  <TableCell>{invoice.period}</TableCell>
                  <TableCell>{invoice.deliveries.toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{invoice.amount}</TableCell>
                  <TableCell className="text-gray-600">{invoice.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[invoice.status as keyof typeof statusConfig].variant}>
                      {statusConfig[invoice.status as keyof typeof statusConfig].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {invoice.status === 'pending' && <Button size="sm">Pay Now</Button>}
                      <Button variant="ghost" size="sm">
                        <IconDownload className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Payment Method</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                  <p className="text-sm text-gray-600">Expires 12/2027</p>
                </div>
              </div>
              <Badge variant="success">Primary</Badge>
            </div>
            <Button variant="outline" className="w-full">Update Payment Method</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Billing Contact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div><p className="text-sm font-medium text-gray-600">Company</p><p className="text-gray-900">Acme Corporation</p></div>
              <div><p className="text-sm font-medium text-gray-600">Email</p><p className="text-gray-900">billing@acme.com</p></div>
              <div>
                <p className="text-sm font-medium text-gray-600">Address</p>
                <p className="text-gray-900">123 Ayala Avenue, Suite 100</p>
                <p className="text-gray-900">Makati City, Metro Manila 1226</p>
              </div>
            </div>
            <Button variant="outline" className="w-full">Update Billing Info</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
