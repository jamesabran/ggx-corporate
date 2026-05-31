import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import {
  IconArrowLeft,
  IconReceiptRefund,
  IconPackage,
  IconArrowRight,
  IconCircleCheck,
  IconClock,
  IconAlertCircle,
  IconInfoCircle,
  IconMessage,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { getClaimById, CLAIM_STATUS_META, type Claim } from '../services/claimsService';
import { getTransactionById, statusConfig, type Transaction } from '../services/transactionService';

const STATUS_STEPS: Array<{ key: string; label: string; description: string }> = [
  { key: 'open',      label: 'Claim Filed',      description: 'Claim received and queued for review.' },
  { key: 'in-review', label: 'Under Review',      description: 'Claims team is reviewing the submission.' },
  { key: 'approved',  label: 'Approved',          description: 'Claim approved. Refund is being processed.' },
  { key: 'settled',   label: 'Settled',           description: 'Refund has been issued to your account.' },
];

const STATUS_ORDER = ['open', 'in-review', 'approved', 'settled'];

function ClaimTimeline({ claim }: { claim: Claim }) {
  const currentIdx = STATUS_ORDER.indexOf(
    claim.status === 'denied' ? 'in-review' : claim.status
  );

  if (claim.status === 'denied') {
    return (
      <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
        <IconAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-900">Claim Denied</p>
          <p className="text-sm text-red-700 mt-0.5">
            This claim was reviewed and denied. Please contact support if you believe this decision is incorrect.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {STATUS_STEPS.map((step, i) => {
        const done   = i <= currentIdx;
        const active = i === currentIdx;
        const last   = i === STATUS_STEPS.length - 1;
        return (
          <div key={step.key} className="relative flex gap-4">
            {!last && (
              <div className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${done && !active ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
            <div className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 mt-0.5 flex items-center justify-center ${
              done && !active ? 'bg-green-500 border-green-500' :
              active         ? 'bg-white border-blue-500' :
                               'bg-white border-gray-300'
            }`}>
              {done && !active && <IconCircleCheck className="w-3.5 h-3.5 text-white" />}
              {active         && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />}
            </div>
            <div className={`flex-1 pb-6 ${last ? 'pb-0' : ''}`}>
              <p className={`text-sm font-medium ${active ? 'text-blue-700' : done ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.label}
              </p>
              <p className={`text-xs mt-0.5 ${active ? 'text-blue-600' : done ? 'text-gray-500' : 'text-gray-300'}`}>
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ClaimDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [claim,       setClaim]       = useState<Claim | null | undefined>(undefined);
  const [transaction, setTransaction] = useState<Transaction | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    if (!id) { setClaim(null); return; }
    getClaimById(id)
      .then((c) => {
        if (cancelled) return;
        setClaim(c);
        if (c) {
          getTransactionById(c.trackingNumber)
            .then((tx) => { if (!cancelled) setTransaction(tx); })
            .catch(() => {});
        } else {
          setTransaction(null);
        }
      })
      .catch(() => { if (!cancelled) setClaim(null); });
    return () => { cancelled = true; };
  }, [id]);

  if (claim === undefined) {
    return (
      <div className="p-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/claims')}>
          <IconArrowLeft className="w-4 h-4 mr-2" />Back to Claims
        </Button>
        <Card className="mt-6">
          <CardContent className="p-12 text-center text-sm text-gray-400">Loading claim…</CardContent>
        </Card>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="p-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/claims')}>
          <IconArrowLeft className="w-4 h-4 mr-2" />Back to Claims
        </Button>
        <Card className="mt-6">
          <CardContent className="p-12 text-center">
            <IconReceiptRefund className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900">Claim not found</h2>
            <p className="text-sm text-gray-500 mt-1">
              No claim with ID <span className="font-medium text-gray-700">{id}</span> was found.
            </p>
            <Button className="mt-6" onClick={() => navigate('/dashboard/claims')}>View All Claims</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const meta = CLAIM_STATUS_META[claim.status];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/claims')}>
          <IconArrowLeft className="w-4 h-4 mr-2" />Back to Claims
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Claim {claim.id}</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-gray-600 text-sm">Filed {claim.createdAt}</p>
            <Badge variant={meta.variant}>{meta.label}</Badge>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Claim Summary */}
          <Card>
            <CardHeader><CardTitle>Claim Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Claim ID</p>
                  <p className="text-gray-900 font-medium">{claim.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Status</p>
                  <Badge variant={meta.variant}>{meta.label}</Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Tracking Number</p>
                  <button
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    onClick={() => navigate(`/dashboard/transactions/${claim.trackingNumber}`)}
                  >
                    {claim.trackingNumber}
                    <IconArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Claim Amount</p>
                  <p className="text-gray-900 font-medium">
                    {claim.amount ? `₱${claim.amount.toLocaleString()}` : '—'}
                  </p>
                </div>
                {claim.accountName && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Subaccount</p>
                    <p className="text-gray-900">{claim.accountName}</p>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Reason</p>
                <p className="text-gray-900">{claim.reason}</p>
              </div>
              {claim.details && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Details</p>
                  <p className="text-gray-700 text-sm">{claim.details}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Linked transaction */}
          {transaction && (
            <Card>
              <CardHeader><CardTitle>Linked Transaction</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <IconPackage className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{transaction.trackingNumber}</p>
                      <Badge variant={statusConfig[transaction.status].variant}>
                        {statusConfig[transaction.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {transaction.recipient.name} · {transaction.destination}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {transaction.type} · Booked {transaction.date}
                    </p>
                    <Link
                      to={`/dashboard/transactions/${transaction.trackingNumber}`}
                      className="inline-flex items-center gap-1 mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View transaction details
                      <IconArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Need Help */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <IconMessage className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Questions about this claim?</p>
                  <p className="text-sm text-blue-800 mb-3">
                    Our claims team typically responds within 2–3 business days. You can also raise a support ticket for faster assistance.
                  </p>
                  <Button size="sm" onClick={() => navigate('/dashboard/support-tickets')}>
                    Open Support Ticket
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: status timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Claim Status</CardTitle></CardHeader>
            <CardContent>
              <ClaimTimeline claim={claim} />
            </CardContent>
          </Card>

          {(claim.status === 'approved' || claim.status === 'settled') && claim.amount && (
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <IconCircleCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-900 mb-1">
                      {claim.status === 'settled' ? 'Refund Issued' : 'Refund Approved'}
                    </p>
                    <p className="text-2xl font-bold text-emerald-800">₱{claim.amount.toLocaleString()}</p>
                    <p className="text-sm text-emerald-700 mt-1">
                      {claim.status === 'settled'
                        ? 'This refund has been credited to your linked account.'
                        : 'Refund is being processed and will arrive within 3–5 business days.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2.5">
                <IconInfoCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-500 leading-relaxed">
                  Claim decisions are made by the GoGo Xpress claims team and are final. Processing typically takes 3–7 business days from the date of filing.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
