import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  IconPackage,
  IconCircleCheck,
  IconTruck,
  IconAlertCircle,
  IconSearch,
  IconArrowLeft,
  IconExternalLink,
} from '@tabler/icons-react';
import { getTransactionById, statusConfig, type Transaction } from '../services/transactionService';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const statusIcon: Record<string, React.ReactNode> = {
  delivered: <IconCircleCheck className="w-6 h-6 text-green-500" />,
  'in-transit': <IconTruck className="w-6 h-6 text-blue-500" />,
  'picked-up': <IconPackage className="w-6 h-6 text-amber-500" />,
  pending: <IconPackage className="w-6 h-6 text-gray-400" />,
  failed: <IconAlertCircle className="w-6 h-6 text-red-500" />,
  returned: <IconAlertCircle className="w-6 h-6 text-gray-500" />,
};

function TrackingResult({ transaction }: { transaction: Transaction }) {
  const status = statusConfig[transaction.status];

  return (
    <div className="space-y-6">
      {/* Status hero */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
            {statusIcon[transaction.status] ?? <IconPackage className="w-6 h-6 text-gray-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-gray-900 truncate">{transaction.trackingNumber}</h2>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="text-sm text-gray-500">
              {transaction.type} Delivery · Booked {transaction.date}
            </p>
          </div>
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Destination</p>
            <p className="text-sm text-gray-900">{transaction.destination}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Recipient</p>
            <p className="text-sm text-gray-900">{transaction.recipient.name}</p>
          </div>
          {transaction.deliveryDate !== '—' && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Delivered On</p>
              <p className="text-sm text-gray-900">{transaction.deliveryDate}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Service Type</p>
            <p className="text-sm text-gray-900">{transaction.type}</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-5">Tracking Timeline</h3>
        <div className="space-y-0">
          {transaction.timeline.map((event, index) => {
            const isLatest = index === 0;
            const isLast = index === transaction.timeline.length - 1;
            return (
              <div key={index} className="relative flex gap-4">
                {/* Connector line */}
                {!isLast && (
                  <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200" />
                )}
                {/* Dot */}
                <div className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                  isLatest
                    ? 'bg-green-500 border-green-500'
                    : 'bg-white border-gray-300'
                }`}>
                  {isLatest && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
                  <p className={`font-medium text-sm ${isLatest ? 'text-gray-900' : 'text-gray-600'}`}>
                    {event.status}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{event.date}</p>
                  {event.note && (
                    <p className="text-xs text-gray-500 mt-1">{event.note}</p>
                  )}
                  {event.hasProof && (
                    <span className="inline-block mt-1.5 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      Proof of delivery available
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Package summary */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Package Details</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Size</p>
            <p className="text-sm text-gray-900">{transaction.packaging.size}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Dimensions</p>
            <p className="text-sm text-gray-900">{transaction.packaging.dimensions}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Weight</p>
            <p className="text-sm text-gray-900">{transaction.packaging.weight}</p>
          </div>
        </div>
      </div>

      {/* Sent by */}
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 flex items-center gap-3">
        <IconPackage className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <p className="text-sm text-gray-600">
          Sent via <span className="font-medium text-gray-800">GGX Business+</span> by{' '}
          <span className="font-medium text-gray-800">{transaction.sender.name}</span>
        </p>
      </div>
    </div>
  );
}

function TrackingNotFound({ trackingNumber }: { trackingNumber: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
      <IconAlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-gray-900">Package not found</h2>
      <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
        No package was found for tracking number{' '}
        <span className="font-medium text-gray-700 break-all">{trackingNumber}</span>.
        Please double-check the number and try again.
      </p>
    </div>
  );
}

export function TrackingPage() {
  const { trackingNumber } = useParams<{ trackingNumber?: string }>();
  const [query, setQuery] = useState(trackingNumber ?? '');
  const [searched, setSearched] = useState(trackingNumber ?? '');
  const [transaction, setTransaction] = useState<Transaction | null | undefined>(
    trackingNumber ? undefined : null
  );
  const [loading, setLoading] = useState(!!trackingNumber);

  useEffect(() => {
    if (!searched) { setTransaction(null); setLoading(false); return; }
    setLoading(true);
    setTransaction(undefined);
    getTransactionById(searched)
      .then((tx) => { setTransaction(tx); setLoading(false); })
      .catch(() => { setTransaction(null); setLoading(false); });
  }, [searched]);

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed) setSearched(trimmed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <IconPackage className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">GGX Business+</span>
          </div>
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <IconExternalLink className="w-3.5 h-3.5" />
            Merchant login
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Track your package</h1>
          <p className="text-sm text-gray-500 mt-1">Enter a GGX tracking number to see real-time updates.</p>
        </div>

        {/* Search bar */}
        <div className="flex gap-2">
          <Input
            className="flex-1"
            placeholder="e.g. GGX-2026-90007"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
          />
          <Button onClick={handleSearch} disabled={!query.trim()}>
            <IconSearch className="w-4 h-4 mr-1.5" />
            Track
          </Button>
        </div>

        {/* Results */}
        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
            Looking up your package…
          </div>
        )}

        {!loading && transaction === null && searched && (
          <TrackingNotFound trackingNumber={searched} />
        )}

        {!loading && transaction && (
          <TrackingResult transaction={transaction} />
        )}

        {!loading && !searched && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
            <IconPackage className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Enter a tracking number above to get started.</p>
          </div>
        )}
      </main>

      <footer className="max-w-2xl mx-auto px-4 py-8 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} GGX Business+. All rights reserved.
      </footer>
    </div>
  );
}
