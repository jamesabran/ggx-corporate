import { useEffect, useState } from 'react';
import { IconCalendar, IconMapPin } from '@tabler/icons-react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { getAdvisories, SEVERITY_META, STATUS_META, type AdvisoryStatus, type ServiceAdvisory } from '../services/serviceAdvisoriesService';

export function ServiceAdvisories() {
  const [statusFilter, setStatusFilter] = useState<'all' | AdvisoryStatus>('all');
  const [advisories, setAdvisories] = useState<ServiceAdvisory[]>([]);

  useEffect(() => {
    let active = true;
    getAdvisories()
      .then((list) => { if (active) setAdvisories(list); })
      .catch(() => { if (active) setAdvisories([]); });
    return () => { active = false; };
  }, []);

  const visible = advisories.filter((a) => statusFilter === 'all' || a.status === statusFilter);
  const activeCount = advisories.filter((a) => a.status === 'active').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Advisories</h1>
          <p className="text-gray-600 mt-1">
            Operational notices affecting pickups and deliveries.
            {activeCount > 0 && <span className="text-amber-700 font-medium"> {activeCount} active.</span>}
          </p>
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | AdvisoryStatus)}>
            <option value="all">All advisories</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="resolved">Resolved</option>
          </Select>
        </div>
      </div>

      {visible.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-base font-semibold text-gray-700">No advisories</p>
            <p className="text-sm text-gray-400 mt-1">There are no service advisories for this filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {visible.map((a) => {
            const sev = SEVERITY_META[a.severity];
            const Icon = sev.icon;
            const status = STATUS_META[a.status];
            const dates = a.effectiveTo && a.effectiveTo !== a.effectiveFrom
              ? `${a.effectiveFrom} – ${a.effectiveTo}`
              : a.effectiveFrom;
            return (
              <Card key={a.id} className={a.status === 'resolved' ? 'opacity-75' : ''}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${sev.bgClass}`}>
                      <Icon className={`w-5 h-5 ${sev.iconClass}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-semibold text-gray-900">{a.title}</h2>
                        <Badge variant={sev.badge}>{sev.label}</Badge>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1.5">{a.body}</p>
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <IconCalendar className="w-3.5 h-3.5" />
                          Effective: <span className="text-gray-700 font-medium">{dates}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <IconMapPin className="w-3.5 h-3.5" />
                          <span className="flex flex-wrap gap-1">
                            {a.affectedAreas.map((area) => (
                              <span key={area} className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-medium">
                                {area}
                              </span>
                            ))}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-2">{a.id} · Posted {a.postedAt}</p>
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
