import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Optional right-aligned action area (buttons, toggles). */
  action?: ReactNode;
  className?: string;
}

/**
 * Standard page header: title + optional subtitle on the left, optional actions
 * on the right. Extracted from the repeated header pattern across dashboard
 * pages so all page titles share one structure.
 */
export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 md:flex-row md:items-center md:justify-between', className)}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-gray-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
