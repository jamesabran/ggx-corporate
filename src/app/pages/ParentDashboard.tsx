import { Link } from 'react-router';
import {
  IconPackage,
  IconCurrencyDollar,
  IconAlertTriangle,
  IconBuilding,
  IconTrendingUp,
  IconTrendingDown,
  IconArrowRight,
  IconUsers,
  IconActivity,
  IconPlus,
  IconActivityHeartbeat,
  IconCircleCheck,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { getSlaAlerts, SLA_TYPE_META } from '../data/slaAlerts';

const stats = [
  { title: 'Total Shipments', value: '8,942', change: '+15.3%', trend: 'up', icon: IconPackage, iconBg: 'bg-blue-600', cardBg: 'bg-blue-50', changeColor: 'text-blue-700' },
  { title: 'Total COD', value: '₱4,285,000', change: '+22.1%', trend: 'up', icon: IconCurrencyDollar, iconBg: 'bg-emerald-600', cardBg: 'bg-emerald-50', changeColor: 'text-emerald-700' },
  { title: 'Active Subaccounts', value: '2', change: '—', trend: null, icon: IconBuilding, iconBg: 'bg-purple-600', cardBg: 'bg-purple-50', changeColor: 'text-purple-700' },
  { title: 'Failed Deliveries', value: '89', change: '-12.5%', trend: 'down', icon: IconAlertTriangle, iconBg: 'bg-red-500', cardBg: 'bg-red-50', changeColor: 'text-red-700' },
];

const subaccountPerformance = [
  { name: 'Acme Corporation', shipments: 5234, revenue: '₱2,418,000', successRate: 94, trend: 'up' },
  { name: 'Acme Luzon', shipments: 3708, revenue: '₱1,867,000', successRate: 91, trend: 'up' },
];

const recentActivity = [
  { type: 'upload', subaccount: 'Acme Corporation', description: 'Bulk upload - 125 shipments', time: '2 hours ago' },
  { type: 'user', subaccount: 'Main Account', description: 'New user added: sarah@acme.com', time: '5 hours ago' },
  { type: 'issue', subaccount: 'Acme Luzon', description: '8 failed deliveries reported', time: '1 day ago' },
  { type: 'billing', subaccount: 'Main Account', description: 'Invoice #2024-102 generated', time: '2 days ago' },
];

const quickActions = [
  { to: '/dashboard/subaccounts/request', icon: IconPlus, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', title: 'Add Subaccount', desc: 'Request new operational unit' },
  { to: '/dashboard/users-permissions', icon: IconUsers, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', title: 'Add User', desc: 'Assign managers to subaccounts' },
  { to: '/dashboard/analytics', icon: IconActivity, iconBg: 'bg-violet-50', iconColor: 'text-violet-600', title: 'View Reports', desc: 'Access analytics and insights' },
  { to: '/dashboard/earnings', icon: IconCurrencyDollar, iconBg: 'bg-orange-50', iconColor: 'text-orange-600', title: 'View Finance', desc: 'Check earnings and billing' },
];

export function ParentDashboard() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Organizational Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Consolidated view across all subaccounts</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className={`border-0 shadow-none ${stat.cardBg}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest leading-none">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-3 leading-none tracking-tight">{stat.value}</p>
                  {stat.trend && (
                    <div className="flex items-center gap-1.5 mt-3">
                      {stat.trend === 'up'
                        ? <IconTrendingUp className={`w-4 h-4 flex-shrink-0 ${stat.changeColor}`} />
                        : <IconTrendingDown className={`w-4 h-4 flex-shrink-0 ${stat.changeColor}`} />}
                      <span className={`text-sm font-semibold ${stat.changeColor}`}>{stat.change}</span>
                      <span className="text-sm text-gray-400">vs last month</span>
                    </div>
                  )}
                </div>
                <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {quickActions.map((a) => (
            <Link key={a.title} to={a.to} className="group">
              <Card className="h-full border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-150 cursor-pointer">
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-xl ${a.iconBg} flex items-center justify-center mb-4`}>
                    <a.icon className={`w-5 h-5 ${a.iconColor}`} />
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">{a.title}</p>
                  <p className="text-sm text-gray-500 mt-1.5 leading-snug">{a.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="flex flex-col">
          <CardHeader className="px-6 pt-5 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-900">Subaccount Performance</CardTitle>
              <Link to="/dashboard/analytics">
                <Button variant="ghost" size="sm" className="h-8 px-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer gap-1.5 -mr-1">
                  View analytics
                  <IconArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-6 pt-4 pb-5 flex-1">
            <div className="space-y-4">
              {subaccountPerformance.map((sub) => (
                <div key={sub.name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <IconBuilding className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="font-semibold text-gray-900">{sub.name}</div>
                    </div>
                    <Badge variant="success">{sub.successRate}% success</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Shipments</div>
                      <div className="text-lg font-semibold text-gray-900">{sub.shipments.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Revenue</div>
                      <div className="text-lg font-semibold text-gray-900">{sub.revenue}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col xl:col-span-1">
          <CardHeader className="px-6 pt-5 pb-0">
            <CardTitle className="text-base font-semibold text-gray-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-3 pb-4 flex-1">
            <div className="space-y-1">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {activity.type === 'upload' && <IconPackage className="w-4 h-4 text-gray-600" />}
                    {activity.type === 'user' && <IconUsers className="w-4 h-4 text-gray-600" />}
                    {activity.type === 'issue' && <IconAlertTriangle className="w-4 h-4 text-gray-600" />}
                    {activity.type === 'billing' && <IconCurrencyDollar className="w-4 h-4 text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 leading-snug">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.subaccount}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active SLA Alerts card */}
        {(() => {
          const openAlerts = getSlaAlerts().filter((a) => a.status !== 'resolved');
          return (
            <Card className="flex flex-col">
              <CardHeader className="px-6 pt-5 pb-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <IconActivityHeartbeat className="w-4 h-4 text-amber-600" />
                    </div>
                    <CardTitle className="text-base font-semibold text-gray-900">Active SLA Alerts</CardTitle>
                  </div>
                  <Link to="/dashboard/sla-alerts">
                    <Button variant="ghost" size="sm" className="h-8 px-2.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer gap-1.5 -mr-1">
                      View all
                      <IconArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="px-4 pt-3 pb-4 flex-1">
                {openAlerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2">
                    <IconCircleCheck className="w-7 h-7 text-emerald-400" />
                    <p className="text-sm text-gray-500">No active alerts</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {openAlerts.slice(0, 3).map((a) => {
                      const meta = SLA_TYPE_META[a.type];
                      return (
                        <div key={a.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${meta.bgClass}`}>
                            <meta.icon className={`w-3.5 h-3.5 ${meta.iconClass}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 leading-snug truncate">{a.title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-400">{meta.label}</span>
                              {a.accountName && (
                                <>
                                  <span className="text-xs text-gray-300">·</span>
                                  <span className="text-xs text-gray-500">{a.accountName}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <Badge variant={meta.badge} className="text-[10px] px-1.5 py-0.5 flex-shrink-0 mt-0.5">
                            {meta.label}
                          </Badge>
                        </div>
                      );
                    })}
                    {openAlerts.length > 3 && (
                      <p className="text-xs text-gray-400 text-center pt-1">
                        +{openAlerts.length - 3} more alert{openAlerts.length - 3 > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}
      </div>
    </div>
  );
}
