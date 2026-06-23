import { Fragment } from 'react';
import { Link } from 'react-router';
import { IconChevronRight } from '@tabler/icons-react';
import { cn } from '../../lib/utils';

export interface Crumb {
  label: string;
  /** Route for the crumb; omit for the current (last) page. */
  to?: string;
}

export interface BreadcrumbProps {
  items: Crumb[];
  className?: string;
}

/**
 * Navigation trail showing the path to the current page. The last item is the
 * current page (no link); earlier items link via react-router.
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1.5 text-sm', className)}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <Fragment key={`${item.label}-${i}`}>
            {item.to && !isLast ? (
              <Link to={item.to} className="text-gray-500 hover:text-gray-900">{item.label}</Link>
            ) : (
              <span className={isLast ? 'font-medium text-gray-900' : 'text-gray-500'} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
            {!isLast && <IconChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-300" />}
          </Fragment>
        );
      })}
    </nav>
  );
}
