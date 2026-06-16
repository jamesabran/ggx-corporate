import { Link } from 'react-router';
import { IconArrowRight } from '@tabler/icons-react';
import { BasicGlassCard } from './BasicGlassCard';

// TODO: replace mock data with real BFF source (Earnings/Deliveries/ForPickup endpoints)
const MOCK = {
  earnings:    '₱135.8K',
  deliveries:  '4.2K',
  forPickup:   '18',
};

interface StatCardProps {
  iconBg: string;
  iconStroke: string;
  icon: React.ReactNode;
  value: string;
  label: string;
}

function StatCard({ iconBg, icon, value, label }: StatCardProps) {
  return (
    <div
      className="flex flex-1 flex-col rounded-[16px] p-[12px_11px]"
      style={{
        background: 'rgba(255,255,255,0.55)',
        border: '1px solid rgba(255,255,255,0.75)',
      }}
    >
      <div
        className="mb-2 flex h-[30px] w-[30px] items-center justify-center rounded-[9px]"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <p className="text-[17px] font-extrabold leading-none tabular-nums" style={{ color: '#20303f' }}>
        {value}
      </p>
      <p className="mt-1 text-[11px] font-semibold leading-snug" style={{ color: '#6a7a89' }}>
        {label}
      </p>
    </div>
  );
}

export function BasicActivitySummary() {
  return (
    <BasicGlassCard className="p-[17px_16px]">
      {/* Header */}
      <div className="mb-[14px] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[16px] font-extrabold" style={{ color: '#20303f' }}>
            Activity for
          </span>
          <div
            className="flex items-center gap-[5px] rounded-[20px] px-[11px] py-[4px] text-[12px] font-bold"
            style={{
              background: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.8)',
              color: '#33485c',
            }}
          >
            Last 7 Days
          </div>
        </div>
        <Link
          to="/basic/earnings"
          className="flex items-center gap-1 text-[12px] font-medium"
          style={{ color: '#1e8fd6' }}
        >
          View analytics
          <IconArrowRight className="h-[14px] w-[14px]" />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="flex gap-[9px]">
        <StatCard
          iconBg="rgba(90,185,74,0.16)"
          iconStroke="#5aa940"
          value={MOCK.earnings}
          label="Earnings"
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5aa940" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="13" rx="3"/><path d="M16 12h2"/>
            </svg>
          }
        />
        <StatCard
          iconBg="rgba(30,143,214,0.16)"
          iconStroke="#1e8fd6"
          value={MOCK.deliveries}
          label="Deliveries"
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1e8fd6" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5"/>
            </svg>
          }
        />
        <StatCard
          iconBg="rgba(224,160,32,0.18)"
          iconStroke="#e0a020"
          value={MOCK.forPickup}
          label="For Pickup"
          icon={
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#e0a020" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 13a9 4 0 0 0 18 0M3 13l3-7h12l3 7M8 13v3M16 13v3"/>
            </svg>
          }
        />
      </div>
    </BasicGlassCard>
  );
}
