import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface PaginationProps {
  /** Left-aligned summary, e.g. "Showing 20 of 142". */
  summary?: ReactNode;
  onPrevious?: () => void;
  onNext?: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
  className?: string;
}

/**
 * List pagination row: a summary on the left, Previous / Next on the right.
 * Extracted from the Transactions list footer.
 */
export function Pagination({
  summary,
  onPrevious,
  onNext,
  previousDisabled,
  nextDisabled,
  className,
}: PaginationProps) {
  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-between gap-4', className)}>
      {summary ? <p className="text-sm text-gray-600">{summary}</p> : <span />}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={previousDisabled} onClick={onPrevious}>Previous</Button>
        <Button variant="outline" size="sm" disabled={nextDisabled} onClick={onNext}>Next</Button>
      </div>
    </nav>
  );
}
