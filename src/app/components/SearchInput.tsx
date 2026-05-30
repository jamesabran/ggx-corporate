/**
 * Reusable search input with an inline clear (×) button.
 * Accepts a string value + onChange callback so it can be dropped into any
 * page that already manages search state.
 */
import { IconSearch, IconX } from '@tabler/icons-react';
import { cn } from '../lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className,
  inputClassName,
}: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full h-10 pl-9 pr-8 rounded-lg border border-gray-200 bg-white text-sm',
          'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary',
          'focus:border-primary transition-colors',
          inputClassName
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <IconX className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
