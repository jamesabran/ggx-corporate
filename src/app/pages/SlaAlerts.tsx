import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { IconMessageDots, IconCircleCheck, IconChevronRight, IconBuildingWarehouse, IconClock, IconAlertTriangle, IconAlertCircle } from '@tabler/icons-react';
import { Card, CardContent } from '../components/ui/Card';
import { StatCard } from '../components/StatCard';
import { IconContainer } from '../components/IconContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/SearchInput';
import { Select } from '../components/ui/Select';
// SLA reads/writes go through the slaService facade. Scoping/search/type
// filtering below is presentation-only over the service-provided list.
import {
  getSlaAlertsList, sendAlertFollowUp, resolveSlaAlert,
  SLA_TYPE_META, SLA_STATUS_META, type SlaAlert, type SlaAlertType,
} from '../services/slaService';
import { useSubAccounts } from '../contexts/SubAccountContext';
import { useScopedAccountId } from '../hooks/useAccountScope';
import { getSubaccountOptions } from '../services/userService';

export function SlaAlerts() {
  const navigate = useNavigate();
  const { subAccountsEnabled } = useSubAccounts();
  // Role-aware scope: managers are hard-scoped to their subaccount; admins see
  // consolidated on Main Account and scoped when drilled into a subaccount.
  const scopeId = useScopedAccountId();
  const mainView = subAccountsEnabled && scopeId === undefined; // consolidated admin view

  const [allAlerts, setAllAlerts] = useState<SlaAlert[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | SlaAlertType>('all');
  const [subaccountFilter, setSubaccountFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [subaccountOptions, setSubaccountOptions] = useState<{ id: string; name: string }[]>([]);

  const refresh = () => { getSlaAlertsList().then(setAllAlerts).catch(() => {}); };
  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    let cancelled = false;
    getSubaccountOptions()
      .then((opts) => { if (!cancelled) setSubaccountOptions(opts); })
      .catch(() => { if (!cancelled) setSubaccountOptions([]); });
    return () => { cancelled = true; };
  }, []);
  const handleFollowUp = async (id: string) => { await sendAlertFollowUp(id); refresh(); };
  const handleResolve  = async (id: string) => { await resolveSlaAlert(id); refresh(); };

  // In subaccount view, scope stat counts and visible list to current account.
  const scopedAlerts = scopeId
    ? allAlerts.filter((a) => a.accountId === scopeId)
    : allAlerts;

  const noMovement   = scopedAlerts.filter((a) => a.type === 'no_movement' && a.status !== 'resolved').length;
  const breaches     = scopedAlerts.filter((a) => a.type === 'breach'      && a.status !== 'resolved').length;
  const actionNeeded = scopedAlerts.filter((a) => a.status === 'open').length;

  const visible = scopedAlerts.filter((a) => {
    const q       = searchQuery.trim().toLowerCase();
    const searchOk =
      q.length < 2 ||
      a.trackingNumber.toLowerCase().includes(q) ||
      a.assignedTo.toLowerCase().includes(q);
    const typeOk = typeFilter === 'all' || a.type === typeFilter;
    const subOk  = !subaccountFilter || a.accountId === subaccountFilter;
    return searchOk && typeOk && subOk;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SLA Alerts</h1>
          <p className="text-gray-600 mt-1">Operations monitoring for delivery SLA risks and follow-ups.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex-1 min-w-[280px]">
            <SearchInput
              placeholder="Search by tracking number or hub..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          {mainView && (
            <div className="w-full sm:w-[160px] flex-shrink-0">
              <Select
                value={subaccountFilter}
                onChange={(e) => setSubaccountFilter(e.target.value)}
              >
                <option value="">All subaccounts</option>
                {subaccountOptions.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </div>
          )}
          <div className="w-full sm:w-[160px] flex-shrink-0">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'all' | SlaAlertType)}
            >
              <option value="all">All alert types</option>
              <option value="no_movement">No Movement</option>
              <option value="breach">Breach SLA</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary cards — counts from scoped alerts (all in main view, filtered in subaccount view) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="No Movement"
          value={noMovement}
          sub="Parcels with stalled scans"
          icon={IconClock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          valueColor="text-amber-600"
        />
        <StatCard
          label="Breach SLA"
          value={breaches}
          sub="Past committed delivery window"
          icon={IconAlertTriangle}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          valueColor="text-red-600"
        />
        <StatCard
          label="Action Needed"
          value={actionNeeded}
          sub="Awaiting first follow-up"
          icon={IconAlertCircle}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
        />
      </div>

      {/* Alert list */}
      {visible.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <IconCircleCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700">No SLA alerts</p>
            <p className="text-xs text-gray-400 mt-1">
              {searchQuery.trim().length >= 2 ? 'No alerts match your search.' : 'No alerts match the current filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {visible.map((a) => {
            const meta   = SLA_TYPE_META[a.type];
            const Icon   = meta.icon;
            const status = SLA_STATUS_META[a.status];
            return (
              <Card key={a.id} className={a.status === 'resolved' ? 'opacity-75' : ''}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Type icon */}
                    <IconContainer icon={Icon} bg={meta.bgClass} color={meta.iconClass} className="mt-0.5" />

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      {/* Badges sit next to the title */}
                      <div className="flex items-start gap-2 flex-wrap">
                        <h2 className="text-base font-semibold text-gray-900 leading-snug">{a.title}</h2>
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <Badge variant={meta.badge}>{meta.label}</Badge>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mt-1">{a.detail}</p>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2 text-xs text-gray-500">
                        <button
                          onClick={() => navigate(`/dashboard/transactions/${a.trackingNumber}`)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {a.trackingNumber}
                          <IconChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <span className="inline-flex items-center gap-1">
                          <IconBuildingWarehouse className="w-3.5 h-3.5" />
                          {a.assignedTo}
                        </span>
                        {a.accountName && <span>· {a.accountName}</span>}
                        <span>· {a.createdAt}</span>
                      </div>

                      {a.followUpNote && (
                        <div className="mt-2 inline-flex items-start gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1.5 max-w-sm">
                          <IconMessageDots className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-800 leading-snug">{a.followUpNote}</p>
                        </div>
                      )}
                    </div>

                    {/* Right column: CTAs side by side */}
                    {a.status !== 'resolved' && (
                      <div className="flex-shrink-0 flex flex-col sm:flex-row gap-1.5 ml-2">
                        <Button
                          variant="outline" size="sm"
                          className="text-xs whitespace-nowrap"
                          onClick={() => handleFollowUp(a.id)}
                        >
                          <IconMessageDots className="w-3.5 h-3.5 mr-1.5" />
                          Follow-up
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          className="text-xs whitespace-nowrap"
                          onClick={() => handleResolve(a.id)}
                        >
                          <IconCircleCheck className="w-3.5 h-3.5 mr-1.5" />
                          Resolve
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
