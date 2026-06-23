import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface PopoverProps {
  /** Trigger content (rendered inside the trigger button). */
  label: ReactNode;
  children: ReactNode;
  /** Horizontal alignment of the panel relative to the trigger. */
  align?: 'start' | 'end';
  triggerClassName?: string;
  className?: string;
}

/**
 * Click-to-open floating panel anchored to a trigger. Closes on outside click
 * and Escape. Standardizes the ad-hoc dropdown panels used in the app shell
 * (notifications, account menu). For a simple hover hint use Tooltip instead.
 */
export function Popover({ label, children, align = 'start', triggerClassName, className }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn('inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2', triggerClassName)}
      >
        {label}
      </button>
      {open && (
        <div
          role="dialog"
          className={cn(
            'absolute z-50 mt-2 min-w-[12rem] rounded-lg border border-gray-200 bg-white p-2 shadow-lg',
            align === 'end' ? 'right-0' : 'left-0',
            className,
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
