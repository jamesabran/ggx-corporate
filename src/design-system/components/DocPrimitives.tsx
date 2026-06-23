import type { ReactNode } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { cn } from '../../app/lib/utils';

/** A top-level documented section with an anchor id and heading. */
export function Section({ id, title, intro, children }: { id: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-gray-100 pb-12 last:border-0">
      <h2 className="text-2xl font-semibold tracking-tight text-gray-900">{title}</h2>
      {intro && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">{intro}</p>}
      <div className="mt-6 space-y-8">{children}</div>
    </section>
  );
}

/** A labelled block within a section. */
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

/** A bordered surface to frame live component previews. */
export function PreviewBox({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-gray-50/60 p-6', className)}>{children}</div>
  );
}

/** Monospace code sample. */
export function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-900 p-4 text-xs leading-relaxed text-gray-100">
      <code>{code}</code>
    </pre>
  );
}

/** Small "where this lives" footnote. */
export function SourceNote({ path }: { path: string }) {
  return (
    <p className="text-xs text-gray-400">
      Source: <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-600">{path}</code>
    </p>
  );
}

/** Two-column do / don't guidance. */
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

/** Simple definition table (prop / variant reference). */
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
