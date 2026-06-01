import type { ComponentType } from 'react';
import { cn } from '../lib/utils';

export interface Segment<T extends string = string> {
  value: T;
  label: string;
  icon?: ComponentType<{ className?: string }>;
}

interface SegmentedControlProps<T extends string = string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Two-or-more segment toggle used to switch between mutually exclusive views.
 * Active segment gets a white pill with shadow; inactive segments are subdued.
 *
 * Figma: GGX-SHADCN → Segmented Control page.
 */
export function SegmentedControl<T extends string = string>({
  segments,
  value,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div className={cn('inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 gap-0.5', className)}>
      {segments.map((seg) => (
        <button
          key={seg.value}
          type="button"
          onClick={() => onChange(seg.value)}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer',
            value === seg.value
              ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          {seg.icon && <seg.icon className="w-3.5 h-3.5" />}
          {seg.label}
        </button>
      ))}
    </div>
  );
}
