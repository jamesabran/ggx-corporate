import { Section } from '../components/DocPrimitives';

export function OverviewSection() {
  return (
    <Section
      id="overview"
      title="GoGo Xpress Design System"
      intro="A shared reference for the colors, type, icons, and core components behind GoGo Xpress products — from self-serve sellers to Business+ corporate and bulk logistics."
    >
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
        <p className="text-sm font-medium text-[#0088C9]">This is an initial sample, not a complete system.</p>
        <p className="mt-1 text-sm text-gray-600">
          It documents a small, representative slice — brand foundations plus three example patterns — to establish
          tone and structure. Components, states, and tokens will be expanded over time. Treat anything not shown here
          as not yet standardized.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { k: 'Foundations', v: 'Colors, typography, spacing, and the icon set already used across the product.' },
          { k: 'Components', v: 'Reusable building blocks like Button and the Delivery Status Badge.' },
          { k: 'Patterns', v: 'Composed examples such as the Payment Option Card, with usage rules.' },
        ].map((c) => (
          <div key={c.k} className="rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-semibold text-gray-900">{c.k}</p>
            <p className="mt-1 text-sm text-gray-600">{c.v}</p>
          </div>
        ))}
      </div>

      <p className="text-sm leading-relaxed text-gray-600">
        Everything here reuses existing app tokens and assets — nothing on production screens is changed. The page is
        isolated at <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-700">/design-system</code>{' '}
        and is safe to remove without touching any live flow.
      </p>
    </Section>
  );
}
