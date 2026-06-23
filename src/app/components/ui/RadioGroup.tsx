import { cn } from '../../lib/utils';

export interface RadioOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string = string> {
  /** Shared name for the native radio inputs. */
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: RadioOption<T>[];
  className?: string;
}

/**
 * Single-select group built on native radio inputs (one-of-many choice).
 * Keyboard and form semantics come from the native controls.
 */
export function RadioGroup<T extends string = string>({ name, value, onChange, options, className }: RadioGroupProps<T>) {
  return (
    <div role="radiogroup" className={cn('space-y-2', className)}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors',
              selected ? 'border-blue-500 bg-blue-50/50' : 'border-gray-200 hover:bg-gray-50',
              opt.disabled && 'cursor-not-allowed opacity-60 hover:bg-transparent',
            )}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={selected}
              disabled={opt.disabled}
              onChange={() => onChange(opt.value)}
              className="mt-0.5 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-gray-900">{opt.label}</span>
              {opt.description && <span className="mt-0.5 block text-xs text-gray-500">{opt.description}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}
