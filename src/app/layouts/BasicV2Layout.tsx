import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  IconChevronLeft,
  IconBell,
  IconUser,
  IconHome2,
  IconBox,
  IconReceipt,
} from '@tabler/icons-react';
import { BasicAccountSheet } from '../components/basic/BasicAccountSheet';
import { cn } from '../lib/utils';

const PAGE_TITLES: [string, string][] = [
  ['/basic-v2/delivery/success',  'Booking Confirmed'],
  ['/basic-v2/delivery/booking',  'Review Details'],
  ['/basic-v2/delivery/receiver', 'Receiver Details'],
  ['/basic-v2/delivery',          'Standard Delivery'],
];

function resolveTitle(pathname: string): string | null {
  for (const [prefix, title] of PAGE_TITLES) {
    if (pathname.startsWith(prefix)) return title;
  }
  return null;
}

function V2BottomNav() {
  const location = useLocation();

  function isActive(href: string, exact = false) {
    return exact
      ? location.pathname === href || location.pathname === href + '/'
      : location.pathname.startsWith(href);
  }

  return (
    <nav className="flex-shrink-0 bg-white border-t border-gray-100">
      <div className="flex items-center h-[60px]">
        {/* Home */}
        <Link
          to="/basic-v2"
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-[3px] py-2 transition-colors',
            isActive('/basic-v2', true) ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600',
          )}
        >
          <IconHome2 className="w-[22px] h-[22px]" />
          <span className="text-[10px] font-bold">Home</span>
        </Link>

        {/* Ship FAB */}
        <div className="flex flex-1 flex-col items-center justify-center gap-[3px]">
          <Link
            to="/basic-v2/delivery"
            aria-label="Ship"
            className="flex h-12 w-12 items-center justify-center rounded-full shadow-md transition-transform active:scale-95"
            style={{ background: 'linear-gradient(140deg, #2f9be8, #1e6fd6)' }}
          >
            <IconBox className="w-[22px] h-[22px] text-white" />
          </Link>
          <span className="text-[10px] font-extrabold text-blue-600">Ship</span>
        </div>

        {/* Orders */}
        <Link
          to="/basic/orders"
          className="flex flex-1 flex-col items-center justify-center gap-[3px] py-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <IconReceipt className="w-[22px] h-[22px]" />
          <span className="text-[10px] font-bold">Orders</span>
        </Link>
      </div>
    </nav>
  );
}

export function BasicV2Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [acctOpen, setAcctOpen] = useState(false);

  const isHome = location.pathname === '/basic-v2' || location.pathname === '/basic-v2/';
  const isBookingFlow = location.pathname.startsWith('/basic-v2/delivery');
  const pageTitle = resolveTitle(location.pathname);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Phone shell */}
      <div
        className="relative mx-auto flex h-screen w-full max-w-[430px] flex-col overflow-hidden"
        style={{ background: '#f8f9fb' }}
      >
        {/* ── Header ── */}
        <header className="flex-shrink-0 flex h-14 items-center justify-between px-4 bg-white border-b border-gray-100 z-10">
          {isHome ? (
            <img
              src="https://gogoxpress.com/wp-content/uploads/2022/07/gogox-logo.png"
              alt="GOGO XPRESS"
              className="h-7 w-auto"
            />
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
              aria-label="Back"
            >
              <IconChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
          )}

          {!isHome && pageTitle && (
            <p className="truncate px-2 text-base font-bold text-gray-900">{pageTitle}</p>
          )}

          {isHome ? (
            <div className="flex items-center gap-2">
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                aria-label="Notifications"
              >
                <div className="relative">
                  <IconBell className="h-5 w-5 text-gray-700" />
                  <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
                </div>
              </button>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                aria-label="Account"
                onClick={() => setAcctOpen(true)}
              >
                <IconUser className="h-5 w-5 text-blue-600" />
              </button>
            </div>
          ) : (
            <div className="w-[36px]" />
          )}
        </header>

        {/* ── Page content ── */}
        <main className={`flex-1 overflow-y-auto ${isBookingFlow ? 'pb-6' : 'pb-2'}`}>
          <Outlet />
        </main>

        {/* ── Bottom nav — hidden during booking ── */}
        {!isBookingFlow && <V2BottomNav />}

        <BasicAccountSheet open={acctOpen} onClose={() => setAcctOpen(false)} />
      </div>
    </div>
  );
}
