import { useState, type ReactNode } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { cn } from '../../lib/utils';

export interface AccordionItemProps {
  title: ReactNode;
  children: ReactNode;
  /** Open on first render. */
  defaultOpen?: boolean;
  className?: string;
}

/**
 * Single collapsible section. Compose multiple inside a container (e.g. a Card
 * or a divided list) to build an accordion. Header is a real button with
 * aria-expanded; the panel is hidden when collapsed.
 */
export function AccordionItem({ title, children, defaultOpen = false, className }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn('border-b border-gray-200 last:border-0', className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {title}
        <IconChevronDown className={cn('h-4 w-4 flex-shrink-0 text-gray-500 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="pb-3 text-sm text-gray-600">{children}</div>}
    </div>
  );
}
