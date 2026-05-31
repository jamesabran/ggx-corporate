import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { IconArrowLeft, IconSend, IconUser, IconHeadset, IconPackage, IconCalendar, IconUserCheck, IconPaperclip, IconX } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
// Ticket detail + thread via the ticketsService facade.
import {
  getTicketById, getTicketThread, replyToTicket,
  type SupportTicket, type TicketMessage, type TicketAttachment,
} from '../services/ticketsService';

const MAX_ATTACHMENTS = 5;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

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
  // undefined = loading, null = not found, SupportTicket = loaded.
  const [ticket, setTicket] = useState<SupportTicket | null | undefined>(undefined);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [reply, setReply] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<TicketAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    if (!id) { setTicket(null); setMessages([]); return; }
    getTicketById(id).then((t) => { if (!cancelled) setTicket(t); }).catch(() => { if (!cancelled) setTicket(null); });
    getTicketThread(id).then((m) => { if (!cancelled) setMessages(m); }).catch(() => {});
    return () => { cancelled = true; };
  }, [id]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const slots = MAX_ATTACHMENTS - replyAttachments.length;
    const added: TicketAttachment[] = Array.from(files).slice(0, slots).map((f) => ({
      name: f.name,
      size: formatFileSize(f.size),
    }));
    setReplyAttachments((prev) => [...prev, ...added]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (ticket === undefined) {
    return (
      <div className="p-6 space-y-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/support-tickets')}>
          <IconArrowLeft className="w-4 h-4 mr-2" />
          Back to Support Tickets
        </Button>
        <Card>
          <CardContent className="p-12 text-center text-sm text-gray-400">
            Loading ticket…
          </CardContent>
        </Card>
      </div>
    );
  }

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

  const handleSend = async () => {
    if (!id || !reply.trim()) return;
    await replyToTicket(id, reply, replyAttachments.length ? replyAttachments : undefined);
    setMessages(await getTicketThread(id));
    setReply('');
    setReplyAttachments([]);
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
                        {m.attachments && m.attachments.length > 0 && (
                          <div className={`flex flex-wrap gap-1.5 mt-2 ${isCustomer ? 'justify-end' : ''}`}>
                            {m.attachments.map((a, i) => (
                              <span key={i} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-white/70 text-gray-600 border border-gray-200">
                                <IconPaperclip className="w-2.5 h-2.5 text-gray-400" />
                                {a.name} · {a.size}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">{m.author} · {m.timestamp}</p>
                    </div>
                  </div>
                );
              })}

              {/* Reply box */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <label className="block text-sm font-medium text-gray-700">Add a reply</label>
                <textarea
                  className="w-full h-24 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Type your message to the support team..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                {/* Attachment chips */}
                {replyAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {replyAttachments.map((f, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-xs text-gray-700">
                        <IconPaperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="max-w-[120px] truncate">{f.name}</span>
                        <span className="text-gray-400">· {f.size}</span>
                        <button type="button" onClick={() => setReplyAttachments((p) => p.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                          <IconX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    {replyAttachments.length < MAX_ATTACHMENTS && (
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
                          Attach file ({replyAttachments.length}/{MAX_ATTACHMENTS})
                        </button>
                      </>
                    )}
                  </div>
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
