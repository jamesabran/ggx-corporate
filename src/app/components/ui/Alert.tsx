import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export type AlertVariant = 'info' | 'success' | 'warning' | 'destructive';

export interface AlertProps {
  variant?: AlertVariant;
  /** Optional leading icon (decorative). */
  icon?: ReactNode;
  /** Optional bold title line. */
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const VARIANT: Record<AlertVariant, string> = {
  info: 'border-blue-200 bg-blue-50 text-blue-900',
  success: 'border-green-200 bg-green-50 text-green-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  destructive: 'border-red-200 bg-red-50 text-red-900',
};

/**
 * Inline banner for contextual messages. Standardizes the
 * `rounded-lg border bg-*-50 text-*-900` callouts used across pages (e.g. the
 * Login help notice).
 */
export function Alert({ variant = 'info', icon, title, children, className }: AlertProps) {
  return (
    <div role="status" className={cn('flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm', VARIANT[variant], className)}>
      {icon && <span className="mt-0.5 flex-shrink-0">{icon}</span>}
      <div className="min-w-0">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={title ? 'mt-0.5' : undefined}>{children}</div>}
      </div>
    </div>
  );
}
