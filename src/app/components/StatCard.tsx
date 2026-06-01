import type { ComponentType } from 'react';
import { Card, CardContent } from './ui/Card';
import { IconContainer } from './IconContainer';
import { cn } from '../lib/utils';

/**
 * Shared overview/stat card used across secondary pages (SLA Alerts, Support
 * Tickets, Operations Requests, Reports, Billing Statements).
 *
 * Pattern: white card, label/value/sub stacked left, icon in a soft-tinted
 * container on the right. Based on the Data Analytics card baseline.
 *
 * Primary summary pages (Dashboard, Earnings) use their own vibrant
 * full-card-background treatment intentionally — do not change those.
 *
 * Figma follow-up: add StatCard component to the GGX Design System file.
 */
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: ComponentType<{ className?: string }>;
  /** Tailwind bg class for the icon container, e.g. 'bg-blue-50' */
  iconBg: string;
  /** Tailwind text class for the icon, e.g. 'text-blue-600' */
  iconColor: string;
  /** Override value text color. Defaults to 'text-gray-900'. */
  valueColor?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor = 'text-gray-900',
  className,
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600">{label}</p>
            <p className={cn('text-2xl font-bold mt-2 tabular-nums', valueColor)}>{value}</p>
            {sub && <p className="text-sm text-gray-500 mt-2">{sub}</p>}
          </div>
          <IconContainer icon={Icon} bg={iconBg} color={iconColor} />
        </div>
      </CardContent>
    </Card>
  );
}
