import { cn } from '../../lib/utils';

export interface ProgressProps {
  /** 0–100. */
  value: number;
  /** Track classes (height/width/background). */
  className?: string;
  /** Fill classes (e.g. a color). Defaults to the brand blue. */
  barClassName?: string;
  'aria-label'?: string;
}

/**
 * Horizontal progress / proportion bar. Extracted from the inline bars used in
 * the Dashboard and analytics. Track is gray-100; fill defaults to blue-600.
 */
export function Progress({ value, className, barClassName, ...aria }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      {...aria}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-gray-100', className)}
    >
      <div className={cn('h-full rounded-full bg-blue-600', barClassName)} style={{ width: `${pct}%` }} />
    </div>
  );
}
