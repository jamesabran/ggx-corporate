import { useState } from 'react';
import { useNavigate } from 'react-router';
import { IconDownload, IconEye } from '@tabler/icons-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useSubAccounts } from '../contexts/SubAccountContext';

const deliveries = [
  { tracking: 'GGX-2024-89240', recipient: 'TechStart Solutions', destination: 'Makati City, Metro Manila', status: 'delivered', type: 'Express', date: '2026-05-18', subaccount: 'Acme Corporation' },
  { tracking: 'GGX-2024-89239', recipient: 'Innovation Labs Inc.', destination: 'Cebu City, Cebu', status: 'in-transit', type: 'Standard', date: '2026-05-18', subaccount: 'Acme Luzon' },
  { tracking: 'GGX-2024-89238', recipient: 'Global Enterprises', destination: 'Davao City, Davao', status: 'picked-up', type: 'Express', date: '2026-05-17', subaccount: 'Acme Corporation' },
  { tracking: 'GGX-2024-89237', recipient: 'Summit Technologies', destination: 'Quezon City, Metro Manila', status: 'pending', type: 'Standard', date: '2026-05-17', subaccount: 'Acme Corporation' },
  { tracking: 'GGX-2024-89236', recipient: 'Metro Solutions Inc.', destination: 'Pasig City, Metro Manila', status: 'failed', type: 'Express', date: '2026-05-17', subaccount: 'Acme Luzon' },
  { tracking: 'GGX-2024-89235', recipient: 'Digital Ventures Co.', destination: 'Taguig City, Metro Manila', status: 'delivered', type: 'Standard', date: '2026-05-16', subaccount: 'Acme Corporation' },
  { tracking: 'GGX-2024-89234', recipient: 'Tech Solutions Inc.', destination: 'Mandaluyong City, Metro Manila', status: 'delivered', type: 'Express', date: '2026-05-16', subaccount: 'Acme Luzon' },
  { tracking: 'GGX-2024-89233', recipient: 'Global Innovations Ltd.', destination: 'Caloocan City, Metro Manila', status: 'in-transit', type: 'Standard', date: '2026-05-16', subaccount: 'Acme Corporation' },
  { tracking: 'GGX-2024-89232', recipient: 'Acme Corporation', destination: 'Santa Rosa, Laguna', status: 'picked-up', type: 'Express', date: '2026-05-15', subaccount: 'Acme Luzon' },
  { tracking: 'GGX-2024-89231', recipient: 'Summit Partners', destination: 'Bacoor, Cavite', status: 'returned', type: 'Standard', date: '2026-05-15', subaccount: 'Acme Corporation' },
];

const statusConfig = {
  delivered: { variant: 'success' as const, label: 'Delivered' },
  'in-transit': { variant: 'info' as const, label: 'In Transit' },
  'picked-up': { variant: 'warning' as const, label: 'Picked Up' },
  failed: { variant: 'danger' as const, label: 'Failed' },
  pending: { variant: 'pending' as const, label: 'Pending' },
  returned: { variant: 'default' as const, label: 'Returned' },
};

export function Transactions() {
  const navigate = useNavigate();
  const { isMainAccountView } = useSubAccounts();
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [subaccountFilter, setSubaccountFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Track all your bookings and deliveries</p>
        </div>
        <Button>
          <IconDownload className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <Input placeholder="Search by tracking number, recipient, or destination..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="flex gap-3">
              {isMainAccountView() && (
                <Select value={subaccountFilter} onChange={(e) => setSubaccountFilter(e.target.value)}>
                  <option value="all">All Subaccounts</option>
                  <option value="Acme Corporation">Acme Corporation</option>
                  <option value="Acme Luzon">Acme Luzon</option>
                </Select>
              )}
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="picked-up">Picked Up</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
                <option value="returned">Returned</option>
              </Select>
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
              {deliveries.map((delivery) => (
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
                    <Badge variant={statusConfig[delivery.status as keyof typeof statusConfig].variant}>
                      {statusConfig[delivery.status as keyof typeof statusConfig].label}
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
            <p className="text-sm text-gray-600">Showing 10 of 2,847 deliveries</p>
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
