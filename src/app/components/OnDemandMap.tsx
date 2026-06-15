/**
 * OnDemandMap — a lightweight, believable delivery-tracking map MOCKUP.
 *
 * No real map tiles, geolocation, routing API, or live tracking. It draws a
 * styled "city map" background with a pickup pin, delivery pin, a dotted route,
 * a rider marker whose position reflects the mocked OD delivery stage, plus an
 * ETA chip and a status chip. Reused by the seller transaction detail and the
 * public tracking page so both look consistent.
 */
import {
  IconMapPin, IconFlag3, IconTruckDelivery, IconClockHour4, IconLoader2, IconBolt,
} from '@tabler/icons-react';
import type { OnDemandProgress } from '../services/transactionService';

// Route endpoints in the 0–100 coordinate space (also used for % positioning).
const PICKUP = { x: 14, y: 76 };
const DROPOFF = { x: 84, y: 24 };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function OnDemandMap({
  progress,
  className = '',
}: {
  progress: OnDemandProgress;
  className?: string;
}) {
  const searching = progress.riderAt === null && !progress.cancelled && progress.stage === 'looking_for_driver';
  const showRider = progress.riderAt !== null && !progress.cancelled;
  const rider = showRider
    ? { x: lerp(PICKUP.x, DROPOFF.x, progress.riderAt as number), y: lerp(PICKUP.y, DROPOFF.y, progress.riderAt as number) }
    : null;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-violet-100 ${className}`}
      style={{ aspectRatio: '16 / 9' }}
      role="img"
      aria-label={`On-Demand delivery map — ${progress.currentLabel}`}
    >
      {/* Map base: soft terrain wash + street grid + a couple of "blocks" */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-emerald-50" />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(#e9e5f5 1px, transparent 1px), linear-gradient(90deg, #e9e5f5 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }}
      />
      {/* faux city blocks */}
      <div className="absolute left-[8%] top-[12%] w-16 h-12 rounded-md bg-white/60 border border-gray-200/70" />
      <div className="absolute left-[60%] top-[55%] w-20 h-14 rounded-md bg-white/60 border border-gray-200/70" />
      <div className="absolute left-[34%] top-[30%] w-14 h-16 rounded-md bg-white/50 border border-gray-200/60" />

      {/* Route + markers share the 0–100 viewBox so % positions line up. */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <path
          d={`M${PICKUP.x},${PICKUP.y} Q42,42 ${DROPOFF.x},${DROPOFF.y}`}
          fill="none"
          stroke="#a78bfa"
          strokeWidth={progress.cancelled ? 1 : 1.6}
          strokeDasharray="3 3"
          strokeLinecap="round"
          opacity={progress.cancelled ? 0.4 : 0.9}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Pickup pin */}
      <Pin x={PICKUP.x} y={PICKUP.y} tone="violet" icon={<IconMapPin className="w-3.5 h-3.5" />} label="Pickup" />
      {/* Drop-off pin */}
      <Pin x={DROPOFF.x} y={DROPOFF.y} tone="emerald" icon={<IconFlag3 className="w-3.5 h-3.5" />} label="Drop-off" />

      {/* Searching state — pulse rings at pickup, no rider yet */}
      {searching && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${PICKUP.x}%`, top: `${PICKUP.y}%` }}
        >
          <span className="absolute inset-0 -m-3 rounded-full bg-violet-400/30 animate-ping" />
        </div>
      )}

      {/* Rider marker */}
      {rider && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
          style={{ left: `${rider.x}%`, top: `${rider.y}%` }}
        >
          <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-violet-600 text-white shadow-lg ring-4 ring-violet-200">
            <IconTruckDelivery className="w-4 h-4" />
          </span>
        </div>
      )}

      {/* ETA chip (top-left) */}
      <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-violet-700 shadow-sm backdrop-blur">
        <IconClockHour4 className="w-3.5 h-3.5" />
        {progress.eta}
      </div>

      {/* Status chip (bottom-left) */}
      <div className="absolute left-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-violet-600 px-2.5 py-1 text-xs font-medium text-white shadow">
        {searching ? <IconLoader2 className="w-3.5 h-3.5 animate-spin" /> : <IconBolt className="w-3.5 h-3.5" />}
        {progress.cancelled ? 'Cancelled' : progress.currentLabel}
      </div>

      {/* Mock disclaimer (bottom-right) */}
      <span className="absolute right-3 bottom-3 text-[10px] text-gray-400">Map preview</span>
    </div>
  );
}

function Pin({
  x, y, tone, icon, label,
}: {
  x: number; y: number; tone: 'violet' | 'emerald'; icon: React.ReactNode; label: string;
}) {
  const toneCls = tone === 'violet' ? 'bg-violet-100 text-violet-700 border-violet-300' : 'bg-emerald-100 text-emerald-700 border-emerald-300';
  return (
    <div className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center" style={{ left: `${x}%`, top: `${y}%` }}>
      <span className={`flex items-center justify-center w-7 h-7 rounded-full border ${toneCls} shadow-sm`}>{icon}</span>
      <span className="mt-0.5 rounded bg-white/85 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 shadow-sm">{label}</span>
      {/* pin stem */}
      <span className={`w-0.5 h-2 ${tone === 'violet' ? 'bg-violet-300' : 'bg-emerald-300'}`} />
    </div>
  );
}
