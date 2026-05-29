import { useState } from 'react';
import { useNavigate } from 'react-router';
import { IconMessageDots, IconCircleCheck, IconChevronRight, IconBuildingWarehouse } from '@tabler/icons-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import {
  getSlaAlerts, sendFollowUp, resolveAlert,
  SLA_TYPE_META, SLA_STATUS_META, type SlaAlert, type SlaAlertType,
} from '../data/slaAlerts';

export function SlaAlerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<SlaAlert[]>(() => [...getSlaAlerts()]);
  const [typeFilter, setTypeFilter] = useState<'all' | SlaAlertType>('all');

  const refresh = () => setAlerts([...getSlaAlerts()]);

  const handleFollowUp = (id: string) => { sendFollowUp(id); refresh(); };
  const handleResolve = (id: string) => { resolveAlert(id); refresh(); };

  const noMovement = alerts.filter((a) => a.type === 'no_movement' && a.status !== 'resolved').length;
  const breaches = alerts.filter((a) => a.type === 'breach' && a.status !== 'resolved').length;
  const actionNeeded = alerts.filter((a) => a.status === 'open').length;

  const visible = alerts.filter((a) => typeFilter === 'all' || a.type === typeFilter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SLA Alerts</h1>
          <p className="text-gray-600 mt-1">Operations monitoring for delivery SLA risks and follow-ups.</p>
        </div>
        <div className="w-full md:w-48">
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | SlaAlertType)}>
            <option value="all">All alert types</option>
            <option value="no_movement">No Movement</option>
            <option value="breach">Breach SLA</option>
          </Select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">No Movement</p>
            <p className="text-2xl font-bold text-amber-600">{noMovement}</p>
            <p className="text-sm text-gray-500 mt-2">Parcels with stalled scans</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Breach SLA</p>
            <p className="text-2xl font-bold text-red-600">{breaches}</p>
            <p className="text-sm text-gray-500 mt-2">Past committed delivery window</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Action Needed</p>
            <p className="text-2xl font-bold text-gray-900">{actionNeeded}</p>
            <p className="text-sm text-gray-500 mt-2">Awaiting first follow-up</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert list */}
      {visible.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <IconCircleCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-base font-semibold text-gray-700">No SLA alerts</p>
            <p className="text-sm text-gray-400 mt-1">There are no alerts for this filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {visible.map((a) => {
            const meta = SLA_TYPE_META[a.type];
            const Icon = meta.icon;
            const status = SLA_STATUS_META[a.status];
            return (
              <Card key={a.id} className={a.status === 'resolved' ? 'opacity-75' : ''}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.bgClass}`}>
                      <Icon className={`w-5 h-5 ${meta.iconClass}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-semibold text-gray-900">{a.title}</h2>
                        <Badge variant={meta.badge}>{meta.label}</Badge>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1.5">{a.detail}</p>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-xs text-gray-500">
                        <button
                          onClick={() => navigate(`/dashboard/transactions/${a.trackingNumber}`)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {a.trackingNumber}
                          <IconChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <span className="inline-flex items-center gap-1">
                          <IconBuildingWarehouse className="w-3.5 h-3.5" />
                          Assigned: <span className="text-gray-700 font-medium">{a.assignedTo}</span>
                        </span>
                        {a.accountName && <span>· {a.accountName}</span>}
                        <span>· {a.createdAt}</span>
                      </div>

                      {a.followUpNote && (
                        <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2">
                          <IconMessageDots className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-800">{a.followUpNote}</p>
                        </div>
                      )}

                      {a.status !== 'resolved' && (
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm" onClick={() => handleFollowUp(a.id)}>
                            <IconMessageDots className="w-3.5 h-3.5 mr-1.5" />
                            Send follow-up
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleResolve(a.id)}>
                            <IconCircleCheck className="w-3.5 h-3.5 mr-1.5" />
                            Mark resolved
                          </Button>
                        </div>
                      )}
                    </div>
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
