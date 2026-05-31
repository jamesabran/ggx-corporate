import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { IconPlus, IconMessage, IconEye, IconPaperclip, IconX } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
// Tickets read/write via the ticketsService facade. Status/assignee/priority
// are backend-owned; submit side effects are backend-event stand-ins (§1c).
import { getTicketsList, createTicket, type SupportTicket, type TicketAttachment } from '../services/ticketsService';
import { SearchInput } from '../components/SearchInput';

const MAX_ATTACHMENTS = 5;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

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

  // Ticket list loaded via the service; reloaded after a submit.
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const reloadTickets = () => { getTicketsList().then(setTickets).catch(() => {}); };
  useEffect(() => { reloadTickets(); }, []);

  // New-ticket form state.
  const [form, setForm] = useState({ trackingNumber: '', issueType: '', description: '' });
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const slots = MAX_ATTACHMENTS - attachments.length;
    const added: TicketAttachment[] = Array.from(files).slice(0, slots).map((f) => ({
      name: f.name,
      size: formatFileSize(f.size),
    }));
    setAttachments((prev) => [...prev, ...added]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (idx: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== idx));

  // Deep-link from notifications: ?new=1 opens the submit form.
  useEffect(() => {
    if (searchParams.get('new') === '1') setShowNewTicketForm(true);
  }, [searchParams]);

  const handleSubmit = async () => {
    if (!form.issueType) return;
    const created = await createTicket({ ...form, attachments: attachments.length ? attachments : undefined });
    reloadTickets();
    setForm({ trackingNumber: '', issueType: '', description: '' });
    setAttachments([]);
    setShowNewTicketForm(false);
    navigate(`/dashboard/support-tickets/${created.id}`);
  };

  const [searchQuery, setSearchQuery] = useState('');

  const visibleTickets = tickets.filter((t) => {
    const q = searchQuery.trim().toLowerCase();
    const searchOk =
      q.length < 2 ||
      t.id.toLowerCase().includes(q) ||
      t.trackingNumber.toLowerCase().includes(q);
    const statusOk = statusFilter === 'all' || t.status === statusFilter;
    return searchOk && statusOk;
  });

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

            {/* File attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Attachments
                <span className="ml-1.5 text-gray-400 font-normal">
                  (optional · up to {MAX_ATTACHMENTS} files · images, PDF, CSV)
                </span>
              </label>
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {attachments.map((f, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-700"
                    >
                      <IconPaperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="max-w-[140px] truncate">{f.name}</span>
                      <span className="text-gray-400 flex-shrink-0">· {f.size}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(i)}
                        className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <IconX className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {attachments.length < MAX_ATTACHMENTS && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.csv,.xlsx,.docx"
                    className="sr-only"
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <IconPaperclip className="w-3.5 h-3.5" />
                    Attach file ({attachments.length}/{MAX_ATTACHMENTS})
                  </button>
                </>
              )}
            </div>

            <div className="flex gap-3">
              <Button disabled={!form.issueType} onClick={handleSubmit}>Submit Ticket</Button>
              <Button variant="outline" onClick={() => { setShowNewTicketForm(false); setAttachments([]); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <SearchInput
                placeholder="Search by ticket ID or tracking number..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
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
              {visibleTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-400 text-sm">
                    {searchQuery.trim().length >= 2
                      ? 'No tickets match your search.'
                      : 'No tickets match the current filter.'}
                  </TableCell>
                </TableRow>
              ) : visibleTickets.map((ticket) => (
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
