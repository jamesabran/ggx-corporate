import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { IconArrowLeft, IconSend, IconUser, IconHeadset, IconPackage, IconCalendar, IconUserCheck } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { getTicket, getTicketMessages, addTicketReply, type TicketMessage } from '../data/supportTickets';

const statusConfig = {
  open:        { variant: 'pending' as const, label: 'Open' },
  'in-review': { variant: 'info'    as const, label: 'In Review' },
  resolved:    { variant: 'success' as const, label: 'Resolved' },
  closed:      { variant: 'default' as const, label: 'Closed' },
};

const priorityConfig = {
  high:   { variant: 'danger'  as const, label: 'High' },
  medium: { variant: 'warning' as const, label: 'Medium' },
  low:    { variant: 'default' as const, label: 'Low' },
};

export function SupportTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ticket = id ? getTicket(id) : undefined;

  const [messages, setMessages] = useState<TicketMessage[]>(() => (id ? [...getTicketMessages(id)] : []));
  const [reply, setReply] = useState('');

  // Not-found state for unknown ticket ids.
  if (!ticket) {
    return (
      <div className="p-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/support-tickets')}>
          <IconArrowLeft className="w-4 h-4 mr-2" />
          Back to Support Tickets
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-base font-semibold text-gray-700">Ticket not found</p>
            <p className="text-sm text-gray-400 mt-1">The ticket {id} doesn’t exist or is no longer available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[ticket.status];
  const priority = priorityConfig[ticket.priority];

  const handleSend = () => {
    if (!id || !reply.trim()) return;
    addTicketReply(id, reply);
    setMessages([...getTicketMessages(id)]);
    setReply('');
  };

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/support-tickets')}>
        <IconArrowLeft className="w-4 h-4 mr-2" />
        Back to Support Tickets
      </Button>

      {/* Ticket header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{ticket.issueType}</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
            <Badge variant={priority.variant}>{priority.label} priority</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">Ticket {ticket.id}</p>
        </div>
      </div>

      {/* Meta + conversation */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversation */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>Conversation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {messages.map((m) => {
                const isCustomer = m.role === 'customer';
                return (
                  <div key={m.id} className={`flex gap-3 ${isCustomer ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCustomer ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      {isCustomer ? <IconUser className="w-4 h-4 text-white" /> : <IconHeadset className="w-4 h-4 text-gray-600" />}
                    </div>
                    <div className={`max-w-[80%] ${isCustomer ? 'items-end text-right' : ''}`}>
                      <div className={`inline-block rounded-xl px-3.5 py-2.5 text-sm ${isCustomer ? 'bg-blue-50 text-gray-800' : 'bg-gray-100 text-gray-800'}`}>
                        {m.body}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">{m.author} · {m.timestamp}</p>
                    </div>
                  </div>
                );
              })}

              {/* Reply box */}
              <div className="border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Add a reply</label>
                <textarea
                  className="w-full h-24 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Type your message to the support team..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <Button disabled={!reply.trim()} onClick={handleSend}>
                    <IconSend className="w-4 h-4 mr-2" />
                    Send Reply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <IconPackage className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500 text-xs">Tracking Number</p>
                  <p className="text-gray-900 font-medium">{ticket.trackingNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <IconUserCheck className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500 text-xs">Assignee</p>
                  <p className="text-gray-900 font-medium">{ticket.assignee}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <IconCalendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500 text-xs">Created</p>
                  <p className="text-gray-900 font-medium">{ticket.created}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <IconCalendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-500 text-xs">Last Update</p>
                  <p className="text-gray-900 font-medium">{ticket.lastUpdate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
