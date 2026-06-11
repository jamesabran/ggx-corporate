import { useNavigate } from 'react-router';
import {
  IconInfoCircle, IconLock, IconMapPin, IconAlertTriangle,
} from '@tabler/icons-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';
import { STATUS_META, type ResolvedModule } from '../services/businessModulesService';

/**
 * Status-aware Business Module card. Renders a single resolved module with its
 * access status badge, notes, availability metadata, and a status-driven CTA.
 *
 * CTA behavior:
 *  - Routed CTAs (Open / Set up / Continue setup / dependency target) navigate.
 *  - Activation CTAs (Enable / Submit request / Request activation / Contact
 *    support) call `onAction` so the page can handle the request flow.
 *  - Disabled CTAs (coming soon, role-blocked activation) are non-actionable.
 *
 * Status → CTA text is owned by businessModulesService (never re-derived here).
 */
export function ModuleCard({
  module,
  onAction,
}: {
  module: ResolvedModule;
  onAction?: (module: ResolvedModule) => void;
}) {
  const navigate = useNavigate();
  const { def, status, cta } = module;
  const statusMeta = STATUS_META[status];

  const handleCta = () => {
    if (cta.disabled) return;
    if (cta.route && (cta.kind === 'open' || cta.kind === 'setup' || cta.kind === 'continue' || cta.kind === 'dependency')) {
      navigate(cta.route);
      return;
    }
    onAction?.(module);
  };

  // The "Open" CTA on an enabled module is the primary action; everything else
  // (enable/request/setup) reads as a secondary, outline action.
  const ctaVariant = cta.kind === 'open' ? 'default' : 'outline';

  return (
    <Card className={cn('flex flex-col', status === 'not_available' && 'opacity-75')}>
      <CardContent className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {module.categoryLabel}
            </p>
            <h3 className="text-sm font-semibold text-gray-900 mt-0.5 leading-snug">{def.name}</h3>
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
        </div>

        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-gray-400">Available for:</span>
          {module.availableForLabels.map((l) => (
            <span key={l} className="text-[11px] font-medium text-gray-600 bg-gray-100 rounded-full px-2 py-0.5">{l}</span>
          ))}
          <span className="text-[11px] text-gray-400 ml-1">·</span>
          <span className="text-[11px] text-gray-400">Roles:</span>
          <span className="text-[11px] text-gray-600">{module.allowedRoleLabels.join(' / ')}</span>
        </div>

        <div className="mt-4">
          <Button
            size="sm"
            variant={ctaVariant}
            disabled={cta.disabled}
            onClick={handleCta}
            className="w-full sm:w-auto"
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
