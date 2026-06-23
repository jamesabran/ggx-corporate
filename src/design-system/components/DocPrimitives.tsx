import { useCallback, useState, type ReactNode } from 'react';
import {
  IconCheck,
  IconX,
  IconCopy,
  IconDeviceDesktop,
  IconDeviceMobile,
} from '@tabler/icons-react';
import { cn } from '../../app/lib/utils';

/* ------------------------------------------------------------------ */
/* Copy-to-clipboard                                                   */
/* ------------------------------------------------------------------ */

/** Small icon button that copies `value` and shows a temporary "Copied" state. */
export function CopyButton({ value, label, className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* Clipboard unavailable (e.g. insecure context) — fail quietly, no toast. */
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied' : label ?? `Copy ${value}`}
      className={cn(
        'inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        copied && 'text-green-600 hover:text-green-600',
        className,
      )}
    >
      {copied ? <IconCheck className="h-3.5 w-3.5" stroke={2.5} /> : <IconCopy className="h-3.5 w-3.5" stroke={1.8} />}
      <span aria-live="polite" className="sr-only">{copied ? 'Copied' : ''}</span>
    </button>
  );
}

/** Inline value (hex, token, class) with a trailing copy button. */
export function Copyable({ value, mono = true, className }: { value: string; mono?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <code className={cn('text-xs text-gray-600', mono && 'font-mono')}>{value}</code>
      <CopyButton value={value} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Layout primitives                                                   */
/* ------------------------------------------------------------------ */

export function Section({ id, title, intro, children }: { id: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-gray-100 pb-12 last:border-0">
      <h2 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h2>
      {intro && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">{intro}</p>}
      <div className="mt-6 space-y-8">{children}</div>
    </section>
  );
}

export function Subsection({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
        {description && <p className="mt-1 max-w-2xl text-sm text-gray-600">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function PreviewBox({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-xl border border-gray-200 bg-gray-50/60 p-6', className)}>{children}</div>;
}

/* ------------------------------------------------------------------ */
/* Responsive preview (Desktop / Mobile)                               */
/* ------------------------------------------------------------------ */

/** Frames a live preview with a Desktop/Mobile width toggle. */
export function ResponsivePreview({ children, defaultView = 'desktop' }: { children: ReactNode; defaultView?: 'desktop' | 'mobile' }) {
  const [view, setView] = useState<'desktop' | 'mobile'>(defaultView);

  return (
    <div>
      <div className="mb-2 inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-0.5" role="group" aria-label="Preview width">
        {([
          { id: 'desktop', label: 'Desktop', Icon: IconDeviceDesktop },
          { id: 'mobile', label: 'Mobile', Icon: IconDeviceMobile },
        ] as const).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            aria-pressed={view === id}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              view === id ? 'bg-blue-50 text-[#0088C9]' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <Icon className="h-3.5 w-3.5" stroke={1.8} /> {label}
          </button>
        ))}
      </div>
      <PreviewBox>
        <div className={cn('mx-auto transition-all', view === 'mobile' ? 'max-w-[390px]' : 'w-full')}>{children}</div>
      </PreviewBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Code + source metadata                                              */
/* ------------------------------------------------------------------ */

/** Monospace code sample with a copy button. */
export function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative">
      <CopyButton
        value={code}
        label="Copy code"
        className="absolute right-2 top-2 text-gray-400 hover:bg-white/10 hover:text-white"
      />
      <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-900 p-4 pr-10 text-xs leading-relaxed text-gray-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export interface UsedInRef {
  label: string;
  /** Route or file the component is used in. */
  where: string;
}

/**
 * Implementation-fidelity metadata for a documented component.
 *
 * `status` is honest about whether the preview renders a production component or
 * a sample. `source` is the real file path. `usedIn` lists live screens/routes.
 */
export function ImplementationMeta({
  status,
  source,
  usedIn,
  note,
}: {
  status: 'production' | 'sample';
  source: string;
  usedIn?: UsedInRef[];
  note?: ReactNode;
}) {
  const isProd = status === 'production';
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Implementation</p>
          <span
            className={cn(
              'mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
              isProd ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800',
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', isProd ? 'bg-green-600' : 'bg-amber-500')} />
            {isProd ? 'Production component' : 'Sample component'}
          </span>
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Source</p>
          <div className="mt-1 flex items-center gap-1">
            <code className="truncate font-mono text-xs text-gray-700">{source}</code>
            <CopyButton value={source} label="Copy source path" />
          </div>
        </div>

        {usedIn && usedIn.length > 0 && (
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Used in</p>
            <ul className="mt-1 space-y-0.5">
              {usedIn.map((u) => (
                <li key={u.label} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <span className="font-medium text-gray-800">{u.label}</span>
                  <code className="font-mono text-[11px] text-gray-400">{u.where}</code>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {note && <p className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-500">{note}</p>}
    </div>
  );
}

/** Accessibility notes block. */
export function AccessibilityNotes({ items }: { items: ReactNode[] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4">
      <p className="mb-2 text-sm font-semibold text-gray-700">Accessibility</p>
      <ul className="list-disc space-y-1.5 pl-5 text-sm text-gray-600">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

export function DoDont({ dos, donts }: { dos: string[]; donts: string[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-green-700">
          <IconCheck className="h-4 w-4" stroke={2.5} /> Do
        </div>
        <ul className="space-y-1.5">
          {dos.map((d) => (
            <li key={d} className="text-sm text-gray-700">{d}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border border-red-200 bg-red-50/40 p-4">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-700">
          <IconX className="h-4 w-4" stroke={2.5} /> Don&apos;t
        </div>
        <ul className="space-y-1.5">
          {donts.map((d) => (
            <li key={d} className="text-sm text-gray-700">{d}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SpecTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-4 py-2.5 font-semibold">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, i) => (
            <tr key={i} className="align-top">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-gray-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
