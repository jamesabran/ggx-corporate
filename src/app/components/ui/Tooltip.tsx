import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface TooltipProps {
  /** Tooltip text/content. */
  content: ReactNode;
  /** The trigger element (should be focusable for keyboard users). */
  children: ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

/**
 * Lightweight hover/focus tooltip (CSS-driven, no portal). Wrap a focusable
 * trigger; the label shows on hover and keyboard focus. For rich/interactive
 * overlays use a Popover instead.
 */
export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100',
          side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5',
          className,
        )}
      >
        {content}
      </span>
    </span>
  );
}
