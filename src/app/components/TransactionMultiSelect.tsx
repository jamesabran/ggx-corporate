import { useEffect, useRef, useState } from 'react';
import { IconSearch, IconX, IconPackage, IconLoader2 } from '@tabler/icons-react';
import { Badge } from './ui/Badge';
import { listAuthorizedTransactions, type AuthorizedTransactionOption } from '../services/ticketsService';

interface TransactionMultiSelectProps {
  /** Currently selected transactions (primary/originating first). */
  value: AuthorizedTransactionOption[];
  onChange: (next: AuthorizedTransactionOption[]) => void;
  disabled?: boolean;
}

/**
 * Searchable multi-select for the report drawer's affected transactions.
 *
 * Searches by tracking number (plus recipient/destination) over ONLY the
 * transactions authorized for the signed-in account/subaccount — scoping is
 * enforced in the service, never here. Allows multiple selections, prevents
 * duplicates, and renders selections as removable chips. Each result row shows the
 * tracking number, delivery status, and a short destination/recipient reference.
 * A report may be submitted with no selection at all (a general concern), so this
 * control is entirely optional.
 */
export function TransactionMultiSelect({ value, onChange, disabled }: TransactionMultiSelectProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AuthorizedTransactionOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedIds = new Set(value.map((v) => v.externalOrderId));

  // Debounced, scope-safe lookup. Reruns as the query changes while open; already
  // selected transactions are filtered out so a duplicate can't even be offered.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const handle = window.setTimeout(async () => {
      const found = await listAuthorizedTransactions(query);
      if (cancelled) return;
      setResults(found.filter((r) => !selectedIds.has(r.externalOrderId)));
      setLoading(false);
    }, 180);
    return () => { cancelled = true; window.clearTimeout(handle); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, open, value]);

  // Close the results panel when focus leaves the control.
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const add = (opt: AuthorizedTransactionOption) => {
    if (selectedIds.has(opt.externalOrderId)) return; // guard duplicates
    onChange([...value, opt]);
    setQuery('');
  };

  const remove = (externalOrderId: string) => {
    onChange(value.filter((v) => v.externalOrderId !== externalOrderId));
  };

  return (
    <div ref={containerRef} className="space-y-2">
      {/* Selected transactions as removable chips. */}
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Selected transactions">
          {value.map((v) => (
            <li
              key={v.externalOrderId}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 py-1 pl-2.5 pr-1.5 text-sm"
            >
              <IconPackage className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="font-medium text-gray-900">{v.trackingNumber}</span>
              <Badge variant={v.statusVariant}>{v.statusLabel}</Badge>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => remove(v.externalOrderId)}
                  className="text-gray-400 hover:text-gray-700 p-0.5"
                  aria-label={`Remove ${v.trackingNumber}`}
                >
                  <IconX className="w-3.5 h-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Search field. */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          className="w-full pl-9 pr-9 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
          placeholder="Search transactions by tracking number…"
          value={query}
          disabled={disabled}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
        />
        {loading && (
          <IconLoader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
        )}

        {/* Results dropdown. */}
        {open && !disabled && (
          <div className="absolute z-10 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {results.length === 0 ? (
              <p className="px-3 py-3 text-sm text-gray-400">
                {loading ? 'Searching…' : query.trim() ? 'No matching transactions.' : 'No more transactions to add.'}
              </p>
            ) : (
              <ul>
                {results.map((r) => (
                  <li key={r.externalOrderId}>
                    <button
                      type="button"
                      onClick={() => add(r)}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                    >
                      <IconPackage className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-gray-900">{r.trackingNumber}</span>
                          <Badge variant={r.statusVariant}>{r.statusLabel}</Badge>
                        </span>
                        <span className="block truncate text-xs text-gray-500" title={r.reference}>{r.reference}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
