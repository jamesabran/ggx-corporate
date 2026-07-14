import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import {
  IconArrowLeft, IconSend, IconUser, IconHeadset, IconPackage, IconCalendar,
  IconUsersGroup, IconExternalLink, IconRefresh, IconInfoCircle, IconRotateClockwise,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
// The ticket lives in HeyQ; this page is a customer-visible mirror of it. Every
// write (reply, reopen) goes back to HeyQ through the ticketsService façade —
// Business+ keeps no ticket state of its own. Order data comes from OMS.
import {
  getTicketById, replyToTicket, reopenTicket, openTicketInHeyQ, getLiveOrderStatus,
  TICKET_STATUS_META, TICKET_PRIORITY_META,
  type CustomerTicket,
} from '../services/ticketsService';
import { statusConfig } from '../services/transactionService';
import { formatTicketDate } from '../lib/utils';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ok'; ticket: CustomerTicket }
  | { kind: 'not_found' }
  | { kind: 'unavailable' };

export function SupportTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) { setState({ kind: 'not_found' }); return; }
    const res = await getTicketById(id);
    if (res.status === 'ok') setState({ kind: 'ok', ticket: res.data });
    else if (res.status === 'unavailable') setState({ kind: 'unavailable' });
    else setState({ kind: 'not_found' }); // not_found | forbidden — same to the customer
  }, [id]);

  useEffect(() => { setState({ kind: 'loading' }); load(); }, [load]);

  const back = (
    <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/support-tickets')}>
      <IconArrowLeft className="w-4 h-4 mr-2" />
      Back to Support Tickets
    </Button>
  );

  if (state.kind === 'loading') {
    return (
      <div className="p-6 space-y-6">
        {back}
        <Card><CardContent className="p-12 text-center text-sm text-gray-400">Loading ticket…</CardContent></Card>
      </div>
    );
  }

  if (state.kind === 'unavailable') {
    return (
      <div className="p-6 space-y-6">
        {back}
        <Alert variant="warning" title="Support is temporarily unavailable">
          We can’t reach GGX Support right now. Your ticket is safe — please try again shortly.
        </Alert>
      </div>
    );
  }

  if (state.kind === 'not_found') {
    return (
      <div className="p-6 space-y-6">
        {back}
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-base font-semibold text-gray-700">Ticket not found</p>
            <p className="text-sm text-gray-400 mt-1">
              The ticket {id} doesn’t exist or isn’t available on your account.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ticket = state.ticket;
  const status = TICKET_STATUS_META[ticket.status];
  const priority = TICKET_PRIORITY_META[ticket.priority];

  const handleSend = async () => {
    if (!id || !reply.trim() || busy) return;
    setBusy(true);
    const res = await replyToTicket(id, reply);
    if (res.status === 'ok') { setState({ kind: 'ok', ticket: res.data }); setReply(''); }
    setBusy(false);
  };

  const handleReopen = async () => {
    if (!id || busy) return;
    setBusy(true);
    const res = await reopenTicket(id);
    if (res.status === 'ok') setState({ kind: 'ok', ticket: res.data });
    setBusy(false);
  };

  return (
    <div className="p-6 space-y-6">
      {back}

      {/* Ticket header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
            {/* Support-ticket status — NOT the order's delivery status. */}
            <Badge variant={status.variant}>{status.label}</Badge>
            <Badge variant={priority.variant}>{priority.label} priority</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Ticket {ticket.reference} · {ticket.issueType}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => openTicketInHeyQ(ticket.id)}>
          <IconExternalLink className="w-4 h-4 mr-2" />
          Open in GGX Support
        </Button>
      </div>

      {ticket.status === 'resolved' && (
        <Alert variant="success" title="This ticket has been resolved">
          If this isn’t sorted, replying below or reopening will bring it back to our support team.
        </Alert>
      )}
      {ticket.reopenedAt && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
        <Alert variant="info" title="This ticket was reopened">
          Reopened {formatTicketDate(ticket.reopenedAt)}. Our support team is picking it back up.
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversation — public replies only. Internal notes never leave HeyQ. */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>Conversation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {ticket.messages.map((m) => {
                if (m.from === 'system') {
                  return (
                    <p key={m.id} className="text-center text-xs text-gray-400 py-1">
                      {m.body} · {formatTicketDate(m.createdAt)}
                    </p>
                  );
                }
                const isCustomer = m.from === 'you';
                return (
                  <div key={m.id} className={`flex gap-3 ${isCustomer ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCustomer ? 'bg-blue-600' : 'bg-gray-200'}`}>
                      {isCustomer ? <IconUser className="w-4 h-4 text-white" /> : <IconHeadset className="w-4 h-4 text-gray-600" />}
                    </div>
                    <div className={`max-w-[80%] ${isCustomer ? 'items-end text-right' : ''}`}>
                      <div className={`inline-block rounded-xl px-3.5 py-2.5 text-sm text-left ${isCustomer ? 'bg-blue-50 text-gray-800' : 'bg-gray-100 text-gray-800'}`}>
                        {m.body}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {m.authorLabel} · {formatTicketDate(m.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Reply box. A reply to a resolved/closed ticket reopens it in HeyQ. */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <label htmlFor="ticket-reply" className="block text-sm font-medium text-gray-700">
                  Add a reply
                </label>
                <textarea
                  id="ticket-reply"
                  className="w-full h-24 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Type your message to the support team..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <div className="flex items-center justify-end gap-3">
                  {ticket.canReopen && (
                    <Button variant="outline" onClick={handleReopen} disabled={busy}>
                      <IconRotateClockwise className="w-4 h-4 mr-2" />
                      Reopen ticket
                    </Button>
                  )}
                  <Button disabled={!reply.trim() || busy} onClick={handleSend}>
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
              <Detail icon={<IconUsersGroup className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />}
                label="Support team" value={ticket.supportTeam} />
              <Detail icon={<IconCalendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />}
                label="Opened" value={formatTicketDate(ticket.createdAt)} />
              <Detail icon={<IconCalendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />}
                label="Last update" value={formatTicketDate(ticket.updatedAt)} />
            </CardContent>
          </Card>

          {ticket.linkedOrder && <LinkedOrderCard ticket={ticket} />}
        </div>
      </div>
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      {icon}
      <div>
        <p className="text-gray-500 text-xs">{label}</p>
        <p className="text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  );
}

/**
 * The linked order, rendered SNAPSHOT-FIRST — the context captured when the
 * ticket was raised. The snapshot is what makes the ticket self-sufficient: it
 * still renders when the order has since changed, or was archived upstream.
 *
 * "Check live status" re-reads the CURRENT delivery status through the OMS
 * service boundary. Delivery status and ticket status are independent: a parcel
 * moving to Delivered does not resolve the ticket.
 */
function LinkedOrderCard({ ticket }: { ticket: CustomerTicket }) {
  const linked = ticket.linkedOrder!;
  const snapshot = linked.snapshot;
  const [live, setLive] = useState<
    { kind: 'idle' } | { kind: 'loading' } | { kind: 'ok'; label: string; key: string } | { kind: 'gone' }
  >({ kind: 'idle' });

  const checkLive = async () => {
    setLive({ kind: 'loading' });
    const res = await getLiveOrderStatus(linked.externalOrderId);
    if (res.status === 'ok') {
      setLive({ kind: 'ok', label: res.data.deliveryStatusLabel, key: res.data.deliveryStatus });
    } else {
      setLive({ kind: 'gone' });
    }
  };

  const snapshotVariant = snapshot
    ? (statusConfig[snapshot.deliveryStatus as keyof typeof statusConfig]?.variant ?? 'default')
    : 'default';
  const liveVariant =
    live.kind === 'ok'
      ? (statusConfig[live.key as keyof typeof statusConfig]?.variant ?? 'default')
      : 'default';
  const drifted = live.kind === 'ok' && snapshot && live.key !== snapshot.deliveryStatus;

  return (
    <Card>
      <CardHeader><CardTitle>Linked order</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-start gap-2.5">
          <IconPackage className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-gray-500 text-xs">Order</p>
            <Link
              to={`/dashboard/transactions/${linked.trackingNumber}`}
              className="text-blue-600 font-medium hover:underline break-all"
            >
              {linked.trackingNumber}
            </Link>
          </div>
        </div>

        {snapshot ? (
          <>
            <div>
              <p className="text-gray-500 text-xs mb-1">Delivery status when reported</p>
              {/* Delivery status uses the OMS status palette — deliberately a
                  different vocabulary from the support-ticket status above. */}
              <Badge variant={snapshotVariant}>{snapshot.deliveryStatusLabel}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-gray-500 text-xs">Service</p>
                <p className="text-gray-900 font-medium">{snapshot.serviceType}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Booked</p>
                <p className="text-gray-900 font-medium">{snapshot.bookedOn}</p>
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Route</p>
              <p className="text-gray-900 font-medium">{snapshot.route}</p>
            </div>
            <p className="text-[11px] text-gray-400 pt-1 border-t border-gray-100">
              Snapshot taken {formatTicketDate(linked.capturedAt)}
            </p>
          </>
        ) : (
          <Alert variant="info" icon={<IconInfoCircle className="w-4 h-4" />}>
            No order snapshot was captured for this ticket.
          </Alert>
        )}

        {live.kind === 'ok' && (
          <div className="pt-1">
            <p className="text-gray-500 text-xs mb-1">Delivery status now</p>
            <Badge variant={liveVariant}>{live.label}</Badge>
            {drifted && (
              <p className="text-[11px] text-gray-500 mt-1.5">
                The delivery has moved on since this ticket was raised. That doesn’t change the
                ticket’s status — support closes it, not the courier.
              </p>
            )}
          </div>
        )}
        {live.kind === 'gone' && (
          <Alert variant="warning">
            We couldn’t load the current status for this order. The details above are from when the
            ticket was raised.
          </Alert>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={checkLive}
          disabled={live.kind === 'loading'}
        >
          <IconRefresh className="w-4 h-4 mr-2" />
          {live.kind === 'loading' ? 'Checking…' : 'Check live status'}
        </Button>
      </CardContent>
    </Card>
  );
}
