import { useState } from 'react';
import { Link } from 'react-router';
import {
  IconUser,
  IconMapPin,
  IconBuildingBank,
  IconBell,
  IconLock,
  IconWorld,
  IconChevronRight,
} from '@tabler/icons-react';
import { cn } from '../../lib/utils';

interface SettingRow {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  to?: string;
  iconBg: string;
  iconColor: string;
}

const ACCOUNT_ROWS: SettingRow[] = [
  { icon: IconUser,         label: 'Profile',        sub: 'Name, email, mobile, store name', to: '/basic/settings',  iconBg: 'bg-blue-50',    iconColor: 'text-blue-600' },
  { icon: IconMapPin,       label: 'Address book',   sub: 'Saved pickup & return addresses',  to: '/basic/address-book', iconBg: 'bg-teal-50', iconColor: 'text-teal-600' },
  { icon: IconBuildingBank, label: 'Payout account', sub: 'Manage your bank for payouts',      to: '/basic/earnings',  iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { icon: IconLock,         label: 'Security',       sub: 'Password and login',               to: '/basic/settings',  iconBg: 'bg-violet-50',  iconColor: 'text-violet-600' },
];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn('w-11 h-6 rounded-full transition-colors flex-shrink-0 cursor-pointer', on ? 'bg-blue-600' : 'bg-gray-200')}
      aria-pressed={on}
    >
      <span className={cn('block w-5 h-5 rounded-full bg-white shadow transition-transform mt-0.5', on ? 'translate-x-[22px]' : 'translate-x-0.5')} />
    </button>
  );
}

export function BasicSettings() {
  const [pushOn, setPushOn] = useState(true);
  const [emailOn, setEmailOn] = useState(false);

  return (
    <div className="px-4 pt-3 pb-2 space-y-4">
      {/* Account */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-widest">Account</p>
        <div className="divide-y divide-gray-50">
          {ACCOUNT_ROWS.map((r) => (
            <Link key={r.label} to={r.to ?? '#'} className="flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', r.iconBg)}>
                <r.icon className={cn('w-5 h-5', r.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 leading-snug">{r.label}</p>
                <p className="text-xs text-gray-500 leading-snug mt-0.5">{r.sub}</p>
              </div>
              <IconChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <p className="px-4 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-widest">Notifications</p>
        <div className="divide-y divide-gray-50">
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <IconBell className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-snug">Push notifications</p>
              <p className="text-xs text-gray-500 leading-snug mt-0.5">Order and payout updates</p>
            </div>
            <Toggle on={pushOn} onClick={() => setPushOn((v) => !v)} />
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <IconWorld className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-snug">Email updates</p>
              <p className="text-xs text-gray-500 leading-snug mt-0.5">Weekly summary and tips</p>
            </div>
            <Toggle on={emailOn} onClick={() => setEmailOn((v) => !v)} />
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 text-center leading-snug">GoGo Xpress · Basic account · Demo</p>
    </div>
  );
}
