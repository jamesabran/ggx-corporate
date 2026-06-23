import type { ComponentType, ReactNode } from 'react';
import { IconCheck, type IconProps } from '@tabler/icons-react';
import { cn } from '../../app/lib/utils';

export type PaymentOptionState = 'selected' | 'available' | 'unavailable' | 'coming_soon';

export interface PaymentOptionCardProps {
  icon: ComponentType<IconProps>;
  title: string;
  /** Short supporting line. Keep concise — avoid heavy explanatory copy. */
  description?: string;
  state?: PaymentOptionState;
  /** Optional trailing slot, e.g. a "Default" tag for eligible billing. */
  trailing?: ReactNode;
  onSelect?: () => void;
}

const STATE_LABEL: Record<Exclude<PaymentOptionState, 'selected' | 'available'>, string> = {
  unavailable: 'Unavailable',
  coming_soon: 'Coming soon',
};

/**
 * A single selectable payment method in a booking/checkout list.
 *
 * Presentation only. Which methods appear, eligibility (e.g. billing), and fee
 * rules are decided by the account contract upstream — this card just renders
 * one option in one of four states.
 */
export function PaymentOptionCard({
  icon: Icon,
  title,
  description,
  state = 'available',
  trailing,
  onSelect,
}: PaymentOptionCardProps) {
  const selected = state === 'selected';
  const disabled = state === 'unavailable' || state === 'coming_soon';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onSelect}
      aria-pressed={selected}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
        selected ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-gray-50',
      )}
    >
      {/* Radio indicator */}
      <span
        className={cn(
          'mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border',
          selected ? 'border-blue-600' : 'border-gray-300',
        )}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-blue-600" />}
      </span>

      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500" stroke={1.8} />

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{title}</span>
          {selected && <IconCheck className="h-3.5 w-3.5 text-blue-600" stroke={2.5} />}
          {trailing}
        </span>
        {description && <span className="mt-0.5 block text-xs text-gray-500">{description}</span>}
      </span>

      {disabled && (
        <span className="ml-auto flex-shrink-0 self-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
          {STATE_LABEL[state as 'unavailable' | 'coming_soon']}
        </span>
      )}
    </button>
  );
}
