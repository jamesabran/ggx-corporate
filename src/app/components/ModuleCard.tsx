import { useNavigate } from 'react-router';
import {
  IconInfoCircle, IconLock, IconMapPin, IconAlertTriangle, IconClockHour4,
  IconUsersGroup, IconFileInvoice, IconBolt, IconPackages, IconBuildingStore,
  IconChartHistogram, IconReportAnalytics, IconApps,
} from '@tabler/icons-react';

// One scannable icon per add-on (existing icon library only). Subtle chip — it
// aids scanning without dominating the card.
const MODULE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  subaccounts: IconUsersGroup,
  consolidated_billing: IconFileInvoice,
  on_demand_delivery: IconBolt,
  inventory: IconPackages,
  storefront: IconBuildingStore,
  advanced_analytics: IconChartHistogram,
  custom_reports: IconReportAnalytics,
};
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';
import { STATUS_META, type ResolvedModule } from '../services/businessModulesService';

/**
 * Status-aware Account Add-on card. Renders a single resolved add-on with its
 * access status badge, notes, and a status-driven CTA.
 *
 * CTA behavior:
 *  - CTAs with a route (Open / Set up / Continue setup / dependency target /
 *    self-enable workflow) navigate.
 *  - Activation CTAs without a route (Enable Inventory/Storefront, Submit request,
 *    Request activation, Contact support) call `onAction` for the request flow.
 *  - Disabled CTAs (coming soon, role-blocked activation) are non-actionable.
 *
 * Status → CTA text is owned by businessModulesService (never re-derived here).
 */
export function ModuleCard({
  module,
  onAction,
  onSimulateApproval,
}: {
  module: ResolvedModule;
  onAction?: (module: ResolvedModule) => void;
  /** Demo-only: simulate GGX approving a pending request (shown while pending). */
  onSimulateApproval?: (module: ResolvedModule) => void;
}) {
  const navigate = useNavigate();
  const { def, status, cta } = module;
  const statusMeta = STATUS_META[status];
  const ModuleIcon = MODULE_ICON[def.id] ?? IconApps;

  const handleCta = () => {
    if (cta.disabled) return;
    if (cta.route) { navigate(cta.route); return; }
    onAction?.(module);
  };

  // The "Open" CTA on an enabled module is the primary action; everything else
  // (enable/request/setup) reads as a secondary, outline action.
  const ctaVariant = cta.kind === 'open' ? 'default' : 'outline';

  return (
    <Card className={cn('flex flex-col', status === 'not_available' && 'opacity-75')}>
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
              <ModuleIcon className="w-[18px] h-[18px] text-gray-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                {module.categoryLabel}
              </p>
              <h3 className="text-sm font-semibold text-gray-900 mt-0.5 leading-snug">{def.name}</h3>
            </div>
          </div>
          <Badge variant={statusMeta.variant} className="flex-shrink-0">{statusMeta.label}</Badge>
        </div>

        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{def.description}</p>

        <div className="mt-3 space-y-1.5">
          {module.contractNote && (
            <Note icon={IconInfoCircle} className="text-gray-500">{module.contractNote}</Note>
          )}
          {status === 'requires_dependency' && module.dependencyNote && (
            <Note icon={IconLock} className="text-amber-600">{module.dependencyNote}</Note>
          )}
          {module.coverageNote && (
            <Note icon={IconMapPin} className="text-gray-500">{module.coverageNote}</Note>
          )}
          {module.activationBlocked && module.blockedNote && (
            <Note icon={IconAlertTriangle} className="text-gray-500">{module.blockedNote}</Note>
          )}
          {module.requestPending && module.requestNote && (
            <Note icon={IconClockHour4} className="text-blue-600">{module.requestNote}</Note>
          )}
          {module.requestPending && onSimulateApproval && (
            <button
              type="button"
              onClick={() => onSimulateApproval(module)}
              className="ml-5 text-xs font-medium text-violet-600 hover:text-violet-700 hover:underline cursor-pointer"
            >
              Demo: simulate GGX approval
            </button>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100">
          <Button
            size="sm"
            variant={ctaVariant}
            disabled={cta.disabled}
            onClick={handleCta}
            className="w-full"
          >
            {cta.label}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Note({
  icon: Icon, className, children,
}: { icon: React.ComponentType<{ className?: string }>; className?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-1.5">
      <Icon className={cn('w-3.5 h-3.5 mt-0.5 flex-shrink-0', className)} />
      <span className={cn('text-xs leading-snug', className)}>{children}</span>
    </div>
  );
}
