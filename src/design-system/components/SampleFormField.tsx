import { useId, type ReactNode } from 'react';
import { Input, type InputProps } from '../../app/components/ui/Input';
import { cn } from '../../app/lib/utils';

export interface SampleFormFieldProps extends InputProps {
  label: string;
  /** Helper text shown below the field when there is no error. */
  helper?: ReactNode;
  /** Validation error. When set, the field shows the invalid state. */
  error?: ReactNode;
  required?: boolean;
}

/**
 * Docs sample wrapper: label + helper/error layout around the production
 * `Input` (app/components/ui/Input.tsx).
 *
 * It only provides the surrounding form-field layout and wires accessibility
 * (label association, aria-invalid, aria-describedby). All control visuals come
 * from the canonical `Input`; the only state class passed to it is the standard
 * red border for the error state. This is not a new input component.
 */
export function SampleFormField({ label, helper, error, required, className, id, ...inputProps }: SampleFormFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const describedById = `${fieldId}-desc`;
  const hasError = Boolean(error);

  return (
    <div className="space-y-1.5">
      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-900">
        {label}
        {required && <span className="ml-0.5 text-red-600" aria-hidden="true">*</span>}
      </label>
      <Input
        id={fieldId}
        required={required}
        aria-invalid={hasError || undefined}
        aria-describedby={helper || error ? describedById : undefined}
        className={cn(hasError && 'border-red-500 focus-visible:ring-red-500', className)}
        {...inputProps}
      />
      {(error || helper) && (
        <p id={describedById} className={cn('text-xs', hasError ? 'text-red-600' : 'text-gray-500')}>
          {error || helper}
        </p>
      )}
    </div>
  );
}
