import { useEffect, useMemo, useRef, useState } from 'react';
import { IconCheck, IconChevronDown, IconSearch } from '@tabler/icons-react';
import { cn } from '../../lib/utils';

export interface ComboboxOption<T extends string = string> {
  value: T;
  label: string;
}

export interface ComboboxProps<T extends string = string> {
  value: T | '';
  onChange: (value: T) => void;
  options: ComboboxOption<T>[];
  placeholder?: string;
  /** Placeholder for the search field. */
  searchPlaceholder?: string;
  className?: string;
}

/**
 * Searchable single-select. A trigger shows the current value; opening reveals a
 * filter input over the option list. Closes on outside click / Escape. For a
 * short, non-searchable option set use Select.
 */
export function Combobox<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  className,
}: ComboboxProps<T>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
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

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase())),
    [options, query],
  );

  return (
    <div className={cn('relative w-full', className)} ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <span className={cn('truncate', !selected && 'text-gray-500')}>{selected?.label ?? placeholder}</span>
        <IconChevronDown className="h-4 w-4 flex-shrink-0 text-gray-500" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="relative border-b border-gray-100 p-2">
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8 w-full rounded-md border border-gray-200 bg-white pl-7 pr-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <ul role="listbox" className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 && <li className="px-2 py-3 text-center text-xs text-gray-400">No matches.</li>}
            {filtered.map((o) => {
              const isSelected = o.value === value;
              return (
                <li key={o.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => { onChange(o.value); setOpen(false); setQuery(''); }}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-gray-50',
                      isSelected && 'font-medium text-[#0088C9]',
                    )}
                  >
                    {o.label}
                    {isSelected && <IconCheck className="h-3.5 w-3.5 flex-shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
