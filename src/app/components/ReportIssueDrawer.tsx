import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  IconX, IconHeadset, IconSend, IconCircleCheck, IconAlertTriangle, IconPackage,
} from '@tabler/icons-react';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Badge } from './ui/Badge';
import { AttachmentInput } from './AttachmentInput';
import {
  submitOrderReport, REPORT_CONCERN_OPTIONS, type CustomerTicket, type HeyQConcernType,
} from '../services/ticketsService';

interface ReportIssueDrawerProps {
  open: boolean;
  onClose: () => void;
  /** The transaction context this report is about (already loaded in Business+). */
  order: { externalOrderId: string; trackingNumber: string; statusLabel?: string };
}

type Phase =
  | { kind: 'form' }
  | { kind: 'submitting' }
  | { kind: 'error'; message: string }
  | { kind: 'success'; ticket: CustomerTicket };

const FAILURE_MESSAGE: Record<'forbidden' | 'not_found' | 'unavailable', string> = {
  forbidden: 'This order isn’t available for support on your account. Check you’re in the right account and try again.',
  not_found: 'We couldn’t find this order to attach it. Please try again.',
  unavailable: 'GGX Support is temporarily unreachable. Your details are kept — try again in a moment.',
};

/**
 * In-app "Report an issue" drawer. Submits an order-linked ticket DIRECTLY to the
 * HeyQ customer API (no redirect to HeyQ's Contact Us page) and keeps the user on
 * the transaction. On success it confirms and links to the created ticket.
 */
export function ReportIssueDrawer({ open, onClose, order }: ReportIssueDrawerProps) {
  const navigate = useNavigate();
  const [concernType, setConcernType] = useState<HeyQConcernType>('delivery_delay');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>({ kind: 'form' });

  // Reset to a clean form each time the drawer opens for a (possibly different) order.
  useEffect(() => {
    if (open) {
      setConcernType('delivery_delay');
      setSubject(`Issue with order ${order.trackingNumber}`);
      setDescription('');
      setFiles([]);
      setPhase({ kind: 'form' });
    }
  }, [open, order.trackingNumber]);

  if (!open) return null;

  const submitting = phase.kind === 'submitting';
  const canSubmit = subject.trim().length > 0 && description.trim().length > 0 && !submitting;

  const close = () => { if (!submitting) onClose(); };

  const handleSubmit = async () => {
    if (!canSubmit) return; // guards empty input AND blocks duplicate submits
    setPhase({ kind: 'submitting' });
    const res = await submitOrderReport({
      externalOrderId: order.externalOrderId,
      concernType,
      subject: subject.trim(),
      description: description.trim(),
      files: files.length ? files : undefined,
    });
    if (res.status === 'ok') setPhase({ kind: 'success', ticket: res.data });
    else setPhase({ kind: 'error', message: FAILURE_MESSAGE[res.status] }); // form values are preserved
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Report an issue">
      <div className="absolute inset-0 bg-gray-900/50" onClick={close} />
      <div className="relative w-full max-w-md h-full bg-white shadow-xl flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <IconHeadset className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Report an issue</h2>
              <p className="text-xs text-gray-500">We’ll open a support ticket for this order.</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-1" onClick={close} aria-label="Close" disabled={submitting}>
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Order context — always shown so the user knows what they're reporting on. */}
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2.5 text-sm">
          <IconPackage className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-gray-500">Order</span>
          <span className="font-medium text-gray-900">{order.trackingNumber}</span>
          {order.statusLabel && <Badge variant="default">{order.statusLabel}</Badge>}
        </div>

        {phase.kind === 'success' ? (
          <SuccessState
            ticket={phase.ticket}
            onView={() => { onClose(); navigate(`/dashboard/support-tickets/${phase.ticket.id}`); }}
            onDone={onClose}
          />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {phase.kind === 'error' && (
                <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <IconAlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{phase.message}</span>
                </div>
              )}

              <div>
                <label htmlFor="report-concern" className="block text-sm font-medium text-gray-700 mb-1.5">
                  What’s the issue?
                </label>
                <Select
                  id="report-concern"
                  value={concernType}
                  onChange={(e) => setConcernType(e.target.value as HeyQConcernType)}
                  disabled={submitting}
                >
                  {REPORT_CONCERN_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label htmlFor="report-subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject
                </label>
                <input
                  id="report-subject"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  disabled={submitting}
                  maxLength={120}
                />
              </div>

              <div>
                <label htmlFor="report-description" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Details
                </label>
                <textarea
                  id="report-description"
                  className="w-full h-32 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Tell us what happened so our team can help…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Attachments <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <AttachmentInput value={files} onChange={setFiles} disabled={submitting} />
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-5 border-t border-gray-100 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={close} disabled={submitting}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!canSubmit}>
                <IconSend className="w-4 h-4 mr-2" />
                {submitting ? 'Submitting…' : 'Submit report'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SuccessState({
  ticket, onView, onDone,
}: { ticket: CustomerTicket; onView: () => void; onDone: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
        <IconCircleCheck className="w-8 h-8 text-emerald-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">Report submitted</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-xs">
        Ticket <span className="font-medium text-gray-700">{ticket.reference}</span> is now with our
        support team. You can track it in Support Tickets.
      </p>
      <div className="flex flex-col w-full max-w-xs gap-2.5 mt-6">
        <Button onClick={onView}>Open ticket</Button>
        <Button variant="outline" onClick={onDone}>Back to transaction</Button>
      </div>
    </div>
  );
}
