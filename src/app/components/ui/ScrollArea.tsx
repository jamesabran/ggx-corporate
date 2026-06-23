import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface ScrollAreaProps {
  children: ReactNode;
  /** Caps the height; content beyond it scrolls. */
  maxHeight?: number | string;
  className?: string;
}

/**
 * Vertically scrollable container with a slim, subtle scrollbar. Standardizes
 * the many ad-hoc `overflow-y-auto` regions (long lists, menus, panels).
 */
export function ScrollArea({ children, maxHeight, className }: ScrollAreaProps) {
  const style: CSSProperties | undefined =
    maxHeight !== undefined ? { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight } : undefined;

  return (
    <div
      style={style}
      className={cn(
        'overflow-y-auto',
        '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-gray-400',
        className,
      )}
    >
      {children}
    </div>
  );
}
