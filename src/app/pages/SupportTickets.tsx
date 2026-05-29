import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { IconPlus, IconMessage, IconEye } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { getTickets, submitTicket, type SupportTicket } from '../data/supportTickets';

const statusConfig = {
  open: { variant: 'pending' as const, label: 'Open' },
  'in-review': { variant: 'info' as const, label: 'In Review' },
  resolved: { variant: 'success' as const, label: 'Resolved' },
  closed: { variant: 'default' as const, label: 'Closed' },
};

const priorityConfig = {
  high: { variant: 'danger' as const, label: 'High' },
  medium: { variant: 'warning' as const, label: 'Medium' },
  low: { variant: 'default' as const, label: 'Low' },
};

const summaryCards = [
  { count: '12', label: 'Open Tickets', bg: 'bg-orange-100', color: 'text-orange-600' },
  { count: '8', label: 'In Review', bg: 'bg-blue-100', color: 'text-blue-600' },
  { count: '127', label: 'Resolved', bg: 'bg-green-100', color: 'text-green-600' },
  { count: '2.4 hrs', label: 'Avg. Response', bg: 'bg-gray-100', color: 'text-gray-600' },
];

export function SupportTickets() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Local copy of the ticket list so a submitted ticket appears immediately.
  const [tickets, setTickets] = useState<SupportTicket[]>(() => [...getTickets()]);

  // New-ticket form state.
  const [form, setForm] = useState({ trackingNumber: '', issueType: '', description: '' });

  // Deep-link from notifications: ?new=1 opens the submit form.
  useEffect(() => {
    if (searchParams.get('new') === '1') setShowNewTicketForm(true);
  }, [searchParams]);

  const handleSubmit = () => {
    if (!form.issueType) return; // issue type required
    const created = submitTicket(form);
    setTickets([...getTickets()]);
    setForm({ trackingNumber: '', issueType: '', description: '' });
    setShowNewTicketForm(false);
    // Open the newly created ticket's detail view.
    navigate(`/dashboard/support-tickets/${created.id}`);
  };

  const visibleTickets = tickets.filter(
    (t) => statusFilter === 'all' || t.status === statusFilter
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-600 mt-1">Submit support tickets and track your requests</p>
        </div>
        <Button onClick={() => setShowNewTicketForm(true)}>
          <IconPlus className="w-4 h-4 mr-2" />
          Submit a Ticket
        </Button>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {summaryCards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
                  <IconMessage className={`w-5 h-5 ${c.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{c.count}</p>
                  <p className="text-sm text-gray-600">{c.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showNewTicketForm && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader><CardTitle>Submit a Ticket</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tracking Number</label>
                <Input
                  placeholder="GGX-2024-XXXXX"
                  value={form.trackingNumber}
                  onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Issue Type <span className="text-red-500">*</span></label>
                <Select value={form.issueType} onChange={(e) => setForm({ ...form, issueType: e.target.value })}>
                  <option value="">Select issue type</option>
                  <option value="delayed">Delayed Delivery</option>
                  <option value="failed">Delivery Failed</option>
                  <option value="damaged">Package Damaged</option>
                  <option value="missing">Missing Package</option>
                  <option value="wrong-address">Wrong Address</option>
                  <option value="billing">Billing Inquiry</option>
                  <option value="other">Other</option>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                className="w-full h-32 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Provide details about the issue..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex gap-3">
              <Button disabled={!form.issueType} onClick={handleSubmit}>Submit Ticket</Button>
              <Button variant="outline" onClick={() => setShowNewTicketForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <Input placeholder="Search by ticket ID or tracking number..." />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-review">In Review</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </Select>
              <Select>
                <option value="all">All Types</option>
                <option value="delayed">Delayed Delivery</option>
                <option value="failed">Delivery Failed</option>
                <option value="damaged">Package Damaged</option>
                <option value="missing">Missing Package</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Tracking Number</TableHead>
                <TableHead>Issue Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleTickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/dashboard/support-tickets/${ticket.id}`)}
                >
                  <TableCell className="font-medium text-blue-600">{ticket.id}</TableCell>
                  <TableCell>{ticket.trackingNumber}</TableCell>
                  <TableCell>{ticket.issueType}</TableCell>
                  <TableCell>
                    <Badge variant={priorityConfig[ticket.priority as keyof typeof priorityConfig].variant}>
                      {priorityConfig[ticket.priority as keyof typeof priorityConfig].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[ticket.status as keyof typeof statusConfig].variant}>
                      {statusConfig[ticket.status as keyof typeof statusConfig].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{ticket.assignee}</TableCell>
                  <TableCell className="text-gray-600">{ticket.lastUpdate}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/support-tickets/${ticket.id}`); }}
                    >
                      <IconEye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">Showing {visibleTickets.length} of {tickets.length} tickets</p>
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
