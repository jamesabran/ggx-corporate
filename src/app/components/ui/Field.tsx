import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface FieldProps {
  label: ReactNode;
  value: ReactNode;
  className?: string;
}

/**
 * Read-only label / value pair used in detail panels and summaries. Mirrors the
 * GGX-SHADCN "Field" component (label above, value below). Renders a dt/dd pair;
 * group multiple Fields inside a <dl>.
 */
export function Field({ label, value, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value}</dd>
    </div>
  );
}
