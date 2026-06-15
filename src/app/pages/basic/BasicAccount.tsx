import { useNavigate } from 'react-router';
import {
  IconUser,
  IconSettings,
  IconChevronRight,
  IconTrendingUp,
  IconShieldCheck,
  IconHeadset,
  IconLogout,
} from '@tabler/icons-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';
import { useBasicSegment } from '../../contexts/BasicSegmentContext';

interface AccountRow {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub?: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
  badgeVariant?: 'info' | 'warning' | 'success';
  iconBg: string;
  iconColor: string;
}

export function BasicAccount() {
  const navigate = useNavigate();
  const { segment } = useBasicSegment();

  const rows: AccountRow[] = [
    {
      icon: IconUser,
      label: 'My Profile',
      sub: 'Name, contact, store details',
      href: '/basic/settings',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      icon: IconSettings,
      label: 'Account Settings',
      sub: 'Payout, address book, preferences',
      href: '/basic/settings',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
    },
    {
      icon: IconShieldCheck,
      label: 'Security',
      sub: 'Password and login',
      href: '/basic/settings',
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      icon: IconHeadset,
      label: 'Help & Support',
      sub: 'Tickets, chat, help center',
      href: '/basic/support',
      iconBg: 'bg-orange-50',
      iconColor: 'text-orange-500',
    },
    {
      icon: IconTrendingUp,
      label: 'Business Upgrade',
      sub: segment === 'growing' ? 'Account review pending' : 'Qualify for Business+',
      href: '/basic/qualify',
      badge: segment === 'growing' ? 'Review pending' : 'Learn more',
      badgeVariant: segment === 'growing' ? 'warning' : 'info',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-0">
      {/* Profile header */}
      <div className="bg-white px-4 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-white leading-none">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 leading-snug">Alex Mercado</h2>
            <p className="text-sm text-gray-500 leading-snug">alex.mercado@shop.com</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="info" className="text-[10px] px-1.5 py-0.5 leading-none">Basic</Badge>
              {segment === 'growing' && (
                <Badge variant="warning" className="text-[10px] px-1.5 py-0.5 leading-none">Growing</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Segment status */}
      {segment === 'growing' && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-3">
          <div className="flex items-start gap-2">
            <IconTrendingUp className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-snug">
              <strong>Growing account</strong> — Your activity qualifies you for Business+ review.
              A GGX rep will contact you within 2–3 business days.
            </p>
          </div>
        </div>
      )}

      {/* Account rows */}
      <div className="bg-white mt-3">
        <Card className="mx-4 border-gray-100 shadow-none rounded-xl overflow-hidden">
          <CardContent className="p-0 divide-y divide-gray-50">
            {rows.map((row) => (
              <button
                key={row.label}
                onClick={() => row.href && navigate(row.href)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', row.iconBg)}>
                  <row.icon className={cn('w-5 h-5', row.iconColor)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{row.label}</p>
                  {row.sub && <p className="text-xs text-gray-500 leading-snug mt-0.5">{row.sub}</p>}
                </div>
                {row.badge && (
                  <Badge
                    variant={row.badgeVariant ?? 'default'}
                    className="text-[10px] px-1.5 py-0.5 leading-none flex-shrink-0 mr-1"
                  >
                    {row.badge}
                  </Badge>
                )}
                <IconChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Log out */}
      <div className="px-4 pt-4 pb-4">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 active:bg-red-100 transition-colors cursor-pointer"
        >
          <IconLogout className="w-4 h-4" />
          Log out
        </button>
        <p className="text-[11px] text-gray-400 text-center mt-3 leading-snug">
          GoGo Xpress · Basic account · Demo
        </p>
      </div>
    </div>
  );
}
