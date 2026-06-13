import { Link } from 'react-router';
import { IconTrendingUp, IconArrowRight, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

interface Props {
  compact?: boolean;
}

export function GrowingNudgeCard({ compact = false }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={cn(
        'relative rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 overflow-hidden',
        compact ? 'p-3' : 'p-4'
      )}
    >
      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-amber-400 hover:text-amber-600 hover:bg-amber-100 transition-colors cursor-pointer"
        aria-label="Dismiss"
      >
        <IconX className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <IconTrendingUp className="w-4.5 h-4.5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('font-semibold text-amber-900 leading-snug', compact ? 'text-sm' : 'text-base')}>
            You may qualify for special business pricing
          </p>
          <p className={cn('text-amber-700 leading-snug mt-0.5', compact ? 'text-xs' : 'text-sm')}>
            Your recent shipping activity may qualify your account for HVM benefits — contracted rates,
            priority support, and more.
          </p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <Link to="/basic/qualify">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-200 hover:bg-amber-300 rounded-lg px-3 py-1.5 transition-colors cursor-pointer">
                Request account review
                <IconArrowRight className="w-3 h-3" />
              </span>
            </Link>
            <Link to="/basic/qualify">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2 cursor-pointer py-1.5">
                Talk to Sales
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
