/**
 * Shared On-Demand delivery tracking UI.
 *
 * Composable pieces reused by the dashboard Transaction detail (OD progress
 * section) and the public /track page (OD live state) so the two stay visually
 * consistent. All values are presentation-only; dispatch status, ETAs, and the
 * eventual live map are backend/dispatch-owned (see getOnDemandProgress).
 */
import {
  IconBolt, IconMapPin, IconFlag3, IconClockHour4, IconMap2,
  IconCircleCheck, IconAlertTriangle,
} from '@tabler/icons-react';
import type { OnDemandProgress } from '../services/transactionService';

/** Violet On-Demand chip — matches the Transactions list service badge. */
export function OnDemandBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800 ${className}`}>
      <IconBolt className="w-3.5 h-3.5" />
      On-Demand
    </span>
  );
}

/** Placeholder live-map card — a real driver map lands here once dispatch is wired. */
export function OnDemandMapPlaceholder({ eta }: { eta: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-white">
      {/* faint grid to read as a map */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(#ede9fe 1px, transparent 1px), linear-gradient(90deg, #ede9fe 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="relative flex flex-col items-center justify-center gap-2 py-9 text-center px-4">
        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
          <IconMap2 className="w-6 h-6 text-violet-600" />
        </div>
        <p className="text-sm font-medium text-gray-700">Live map preview</p>
        <p className="text-xs text-gray-500 max-w-xs">
          A real-time driver map will appear here once live dispatch tracking is connected.
        </p>
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-xs font-medium text-violet-700 shadow-sm">
          <IconClockHour4 className="w-3.5 h-3.5" />
          {eta}
        </span>
      </div>
    </div>
  );
}

interface RouteEndpoint {
  name?: string;
  address: string;
}

/** Pickup → drop-off address pair. */
export function OnDemandRoute({ pickup, dropoff }: { pickup: RouteEndpoint; dropoff: RouteEndpoint }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
            <IconMapPin className="w-4 h-4 text-violet-600" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Pickup</p>
        </div>
        {pickup.name && <p className="text-sm font-medium text-gray-900">{pickup.name}</p>}
        <p className="text-sm text-gray-600">{pickup.address}</p>
      </div>
      <div className="rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <IconFlag3 className="w-4 h-4 text-emerald-600" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Drop-off</p>
        </div>
        {dropoff.name && <p className="text-sm font-medium text-gray-900">{dropoff.name}</p>}
        <p className="text-sm text-gray-600">{dropoff.address}</p>
      </div>
    </div>
  );
}

/** Courier-style vertical stepper for the OD stages (oldest → newest). */
export function OnDemandTimeline({ progress }: { progress: OnDemandProgress }) {
  return (
    <ol className="relative">
      {progress.stages.map((stage, i) => {
        const isLast = i === progress.stages.length - 1;
        const isException = !!progress.exception && stage.state === 'current';
        return (
          <li key={stage.label} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && (
              <span
                className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${
                  stage.state === 'done' ? 'bg-violet-300' : 'bg-gray-200'
                }`}
              />
            )}
            <span
              className={`relative z-10 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                isException
                  ? 'border-red-500 bg-red-500'
                  : stage.state === 'done'
                    ? 'border-violet-500 bg-violet-500'
                    : stage.state === 'current'
                      ? 'border-violet-500 bg-white'
                      : 'border-gray-300 bg-white'
              }`}
            >
              {isException ? (
                <IconAlertTriangle className="w-3.5 h-3.5 text-white" />
              ) : stage.state === 'done' ? (
                <IconCircleCheck className="w-3.5 h-3.5 text-white" />
              ) : stage.state === 'current' ? (
                <span className="w-2 h-2 rounded-full bg-violet-500" />
              ) : null}
            </span>
            <div className="flex-1">
              <p className={`text-sm font-medium ${stage.state === 'upcoming' ? 'text-gray-400' : 'text-gray-900'}`}>
                {stage.label}
              </p>
              <p className={`text-xs mt-0.5 ${stage.state === 'upcoming' ? 'text-gray-300' : 'text-gray-500'}`}>
                {stage.note}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
