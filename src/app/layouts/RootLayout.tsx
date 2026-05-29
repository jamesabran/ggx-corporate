import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import {
  IconLayoutDashboard,
  IconPackage,
  IconUpload,
  IconReceipt,
  IconChartBar,
  IconCode,
  IconMessage,
  IconBuilding,
  IconMapPin,
  IconSettings,
  IconSearch,
  IconBell,
  IconUser,
  IconMenu2,
  IconX,
  IconLogout,
  IconChevronDown,
  IconUserCircle,
  IconLock,
  IconAdjustmentsHorizontal,
  IconCurrencyDollar,
  IconCreditCard,
  IconWallet,
  IconCheck,
  IconSelector,
  IconArrowsLeftRight,
  IconUsers,
} from '@tabler/icons-react';
import { useState, type ComponentType } from 'react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/Dialog';
import { useSubAccounts } from '../contexts/SubAccountContext';

interface NavChild {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

interface NavItem {
  name: string;
  href?: string;
  icon: ComponentType<{ className?: string }>;
  isSection?: boolean;
  children?: NavChild[];
}

const standardAccountNavigation: NavItem[] = [
  { name: 'Dashboard',       href: '/dashboard',               icon: IconLayoutDashboard },
  { name: 'Transactions',    href: '/dashboard/transactions',  icon: IconPackage },
  { name: 'Bulk Uploader',   href: '/dashboard/bulk-uploader', icon: IconUpload },
  { name: 'Data Analytics',  href: '/dashboard/analytics',     icon: IconChartBar },
  {
    name: 'Finance',
    isSection: true,
    icon: IconCurrencyDollar,
    children: [
      { name: 'Earnings',           href: '/dashboard/earnings',         icon: IconWallet },
      { name: 'Billing Statements', href: '/dashboard/billing',          icon: IconReceipt },
      { name: 'Payment Settings',   href: '/dashboard/payment-settings', icon: IconCreditCard },
    ],
  },
  { name: 'Address Book',    href: '/dashboard/address-book',  icon: IconMapPin },
  { name: 'API Integration', href: '/dashboard/api-access',    icon: IconCode },
  { name: 'Support Tickets', href: '/dashboard/support-tickets',    icon: IconMessage },
  { name: 'Subaccounts',     href: '/dashboard/subaccounts',   icon: IconBuilding },
  { name: 'Settings',        href: '/dashboard/settings',      icon: IconSettings },
];

const mainAccountNavigation: NavItem[] = [
  { name: 'Dashboard',       href: '/dashboard',               icon: IconLayoutDashboard },
  { name: 'Transactions',    href: '/dashboard/transactions',  icon: IconPackage },
  { name: 'Analytics',       href: '/dashboard/analytics',     icon: IconChartBar },
  {
    name: 'Finance',
    isSection: true,
    icon: IconCurrencyDollar,
    children: [
      { name: 'Earnings',           href: '/dashboard/earnings',         icon: IconWallet },
      { name: 'Billing Statements', href: '/dashboard/billing',          icon: IconReceipt },
      { name: 'Payment Settings',   href: '/dashboard/payment-settings', icon: IconCreditCard },
    ],
  },
  { name: 'Address Book',        href: '/dashboard/address-book',      icon: IconMapPin },
  { name: 'API Integration',     href: '/dashboard/api-access',        icon: IconCode },
  { name: 'Support Tickets',     href: '/dashboard/support-tickets',        icon: IconMessage },
  { name: 'Subaccounts',         href: '/dashboard/subaccounts',       icon: IconBuilding },
  { name: 'Users & Permissions', href: '/dashboard/users-permissions', icon: IconUsers },
  { name: 'Settings',            href: '/dashboard/settings',          icon: IconSettings },
];

const subaccountNavigation: NavItem[] = [
  { name: 'Dashboard',       href: '/dashboard',               icon: IconLayoutDashboard },
  { name: 'Transactions',    href: '/dashboard/transactions',  icon: IconPackage },
  { name: 'Bulk Uploader',   href: '/dashboard/bulk-uploader', icon: IconUpload },
  { name: 'Data Analytics',  href: '/dashboard/analytics',     icon: IconChartBar },
  { name: 'Address Book',    href: '/dashboard/address-book',  icon: IconMapPin },
  { name: 'API Integration', href: '/dashboard/api-access',    icon: IconCode },
  { name: 'Support Tickets', href: '/dashboard/support-tickets',    icon: IconMessage },
  { name: 'Settings',        href: '/dashboard/settings',      icon: IconSettings },
];

export function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    subAccountsEnabled,
    subAccounts,
    currentAccount,
    setCurrentAccount,
    getCurrentAccountName,
    isMainAccountView,
  } = useSubAccounts();

  const navigation = !subAccountsEnabled
    ? standardAccountNavigation
    : isMainAccountView()
    ? mainAccountNavigation
    : subaccountNavigation;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [financeExpanded, setFinanceExpanded] = useState(true);
  const [subaccountExpanded, setSubaccountExpanded] = useState(false);
  const [subaccountSearch, setSubaccountSearch] = useState('');

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    navigate('/');
  };

  // Account-menu items route into the existing Settings page (no separate
  // profile/security/preferences routes exist).
  const goToSettings = () => {
    setAccountMenuOpen(false);
    navigate('/dashboard/settings');
  };

  const notifications = [
    { icon: IconPackage, title: 'GGX-2024-89240 was delivered', time: '2 hrs ago' },
    { icon: IconReceipt, title: 'Invoice for May is ready', time: '1 day ago' },
  ];

  const handleSwitchAccount = (accountId: string) => {
    setCurrentAccount(accountId);
    setSubaccountExpanded(false);
    setSubaccountSearch('');
  };

  const handleOpenAccountSwitcher = () => {
    setAccountMenuOpen(false);
    setSubaccountExpanded(true);
    setSubaccountSearch('');
  };

  const accountOptions = subAccountsEnabled
    ? [
        { id: 'main', name: 'Main Account', type: 'Manage all accounts' },
        ...subAccounts.map((sa) => ({ id: sa.id, name: sa.name, type: 'Subaccount' })),
      ]
    : [];

  const filtered = accountOptions.filter((acc) =>
    acc.name.toLowerCase().includes(subaccountSearch.toLowerCase())
  );

  const currentAccountName = getCurrentAccountName();
  const currentAccountType = currentAccount === 'main' ? 'Manage all accounts' : 'Subaccount';

  const initials = currentAccountName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col',
          'transform transition-transform duration-200 ease-in-out',
          'lg:translate-x-0 lg:static',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center gap-3 px-5 border-b border-gray-200 flex-shrink-0">
          <img
            src="https://gogoxpress.com/wp-content/uploads/2022/07/gogox-logo.png"
            alt="GoGo Xpress"
            className="h-7 w-auto"
          />
          <div className="flex flex-col leading-none ml-0.5">
            <span className="text-[11px] font-normal text-gray-500 tracking-wide">Corporate</span>
            <span className="text-[11px] font-normal text-gray-500 tracking-wide">Account</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="ml-auto lg:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
          {navigation.map((item) => {
            if (item.isSection && item.children) {
              const isChildActive = item.children.some((c) => location.pathname === c.href);
              return (
                <div key={item.name}>
                  <button
                    onClick={() => setFinanceExpanded(!financeExpanded)}
                    className={cn(
                      'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                      isChildActive ? 'text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    <IconChevronDown
                      className={cn(
                        'w-3.5 h-3.5 flex-shrink-0 text-gray-400 transition-transform duration-150',
                        financeExpanded ? 'rotate-180' : ''
                      )}
                    />
                  </button>
                  {financeExpanded && (
                    <div className="mt-0.5 ml-4 pl-3 border-l border-gray-200 space-y-0.5">
                      {item.children.map((child) => {
                        const isActive = location.pathname === child.href;
                        return (
                          <Link
                            key={child.name}
                            to={child.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                              isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            )}
                          >
                            <child.icon className="w-[18px] h-[18px] flex-shrink-0" />
                            <span>{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href!}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {subAccountsEnabled && (
          <div className="flex-shrink-0 border-t border-gray-200">
            {subaccountExpanded && (
              <div className="border-b border-gray-200 bg-gray-50/70">
                <div className="flex items-center justify-between px-4 pt-3 pb-2">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Accounts</span>
                  <button
                    onClick={() => { setSubaccountExpanded(false); setSubaccountSearch(''); }}
                    className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-200 cursor-pointer transition-colors"
                  >
                    <IconX className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="relative px-3 pb-2">
                  <IconSearch className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" style={{ left: '1.375rem' }} />
                  <input
                    type="text"
                    placeholder="Search accounts..."
                    value={subaccountSearch}
                    onChange={(e) => setSubaccountSearch(e.target.value)}
                    autoFocus
                    className="w-full h-8 pl-8 pr-3 rounded-lg border border-gray-200 bg-white text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="px-2 pb-2 space-y-0.5 max-h-48 overflow-y-auto">
                  {filtered.map((acc) => {
                    const isSel = acc.id === currentAccount;
                    const accInit = acc.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
                    return (
                      <button
                        key={acc.id}
                        onClick={() => handleSwitchAccount(acc.id)}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors cursor-pointer',
                          isSel ? 'bg-blue-50' : 'hover:bg-white hover:shadow-sm'
                        )}
                      >
                        <div className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0',
                          isSel ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                        )}>
                          {accInit}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className={cn('text-sm font-medium truncate leading-snug', isSel ? 'text-blue-700' : 'text-gray-800')}>
                            {acc.name}
                          </p>
                          <p className="text-xs text-gray-400 leading-snug">{acc.type}</p>
                        </div>
                        {isSel && <IconCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                  {filtered.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-3">No accounts found</p>
                  )}
                </div>

                <div className="px-3 pb-3 border-t border-gray-200 pt-2">
                  <Link
                    to="/dashboard/subaccounts"
                    onClick={() => { setSubaccountExpanded(false); setMobileMenuOpen(false); }}
                    className="flex items-center justify-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 cursor-pointer transition-colors py-1 rounded-lg hover:bg-blue-50"
                  >
                    <IconBuilding className="w-3.5 h-3.5" />
                    Manage Subaccounts
                  </Link>
                </div>
              </div>
            )}

            <button
              onClick={() => { setSubaccountExpanded(!subaccountExpanded); setSubaccountSearch(''); }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors group',
                subaccountExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                <span className="text-[11px] font-bold text-white leading-none">{initials}</span>
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{currentAccountName}</p>
                <p className="text-xs text-gray-500 leading-tight mt-0.5">{currentAccountType}</p>
              </div>
              <IconSelector className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 group-hover:text-gray-600 transition-colors" />
            </button>
          </div>
        )}
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center gap-3 px-4 lg:px-6 flex-shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <IconMenu2 className="w-5 h-5" />
          </button>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tracking numbers, orders..."
                className="w-full h-9 pl-10 pr-4 rounded-lg border border-gray-200 bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <IconBell className="w-[18px] h-[18px]" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
                )}
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 top-[calc(100%+6px)] w-72 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">Notifications</p>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <IconBell className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No new notifications</p>
                      </div>
                    ) : (
                      <div className="py-1">
                        {notifications.map((n, i) => (
                          <div key={i} className="flex items-start gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <n.icon className="w-4 h-4 text-gray-500" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-gray-800 leading-snug">{n.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="w-px h-5 bg-gray-200 mx-2" />

            <div className="relative">
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="flex items-center gap-2.5 h-9 pl-1.5 pr-2.5 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                  <IconUser className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="hidden md:flex flex-col items-start justify-center gap-0.5">
                  <span className="text-sm font-medium text-gray-900 leading-none">Max Rodriguez</span>
                  {subAccountsEnabled && (
                    <span className="text-[11px] text-gray-400 leading-none">{currentAccountName}</span>
                  )}
                </div>
                <IconChevronDown
                  className={cn(
                    'w-3.5 h-3.5 text-gray-400 hidden md:block transition-transform duration-150',
                    accountMenuOpen ? 'rotate-180' : ''
                  )}
                />
              </button>

              {accountMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setAccountMenuOpen(false)} />
                  <div className="absolute right-0 top-[calc(100%+6px)] w-60 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
                    <div className="px-4 py-3.5 border-b border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                          <IconUser className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 leading-snug">Max Rodriguez</p>
                          <p className="text-xs text-gray-400 leading-snug">max@email.com</p>
                        </div>
                      </div>
                      {subAccountsEnabled && (
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
                              <span className="text-[9px] font-bold text-white leading-none">{initials}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-800 truncate leading-snug">{currentAccountName}</p>
                              <p className="text-[10px] text-gray-400 leading-snug">{currentAccountType}</p>
                            </div>
                          </div>
                          <button
                            onClick={handleOpenAccountSwitcher}
                            className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-700 cursor-pointer transition-colors ml-2 flex-shrink-0"
                          >
                            <IconArrowsLeftRight className="w-3 h-3" />
                            Switch
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      <p className="px-4 pt-1.5 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                      <button onClick={goToSettings} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                        <IconUserCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        My Profile
                      </button>
                      <button onClick={goToSettings} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                        <IconLock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        Security
                      </button>
                      <button onClick={goToSettings} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                        <IconAdjustmentsHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        Preferences
                      </button>
                    </div>

                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={() => { setAccountMenuOpen(false); setShowLogoutConfirm(true); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                      >
                        <IconLogout className="w-4 h-4 flex-shrink-0" />
                        Log out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm logout"
        description="Are you sure you want to log out of your account?"
        confirmLabel="Log out"
        variant="destructive"
        confirmIcon={<IconLogout className="w-3.5 h-3.5 mr-1.5" />}
      />
    </div>
  );
}
