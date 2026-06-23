import { Section } from '../components/DocPrimitives';
import { GGX_SHADCN_URL } from '../data/componentRegistry';

export function OverviewSection() {
  return (
    <Section
      id="overview"
      title="GoGo Xpress Design System"
      intro="A shared reference for the colors, type, icons, and components behind GoGo Xpress products — from self-serve sellers to Business+ corporate and bulk logistics."
    >
      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5">
        <p className="text-sm font-medium text-[#0088C9]">One connected system.</p>
        <p className="mt-1 text-sm text-gray-600">
          This reference documents the approved implementation — it does not reinvent it. Each component is cross-checked
          against the{' '}
          <a href={GGX_SHADCN_URL} target="_blank" rel="noreferrer" className="font-medium text-[#0088C9] hover:underline">
            GGX-SHADCN
          </a>{' '}
          design file and the production code, and the previews render the actual coded component used by the app.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { k: 'GGX-SHADCN (Figma)', v: 'The approved visual design and component specifications.' },
          { k: 'Production code', v: 'The real implementation and behavior shipped in the app.' },
          { k: 'This reference', v: 'A living view that renders the coded components and their metadata.' },
        ].map((c) => (
          <div key={c.k} className="rounded-xl border border-gray-200 p-5">
            <p className="text-sm font-semibold text-gray-900">{c.k}</p>
            <p className="mt-1 text-sm text-gray-600">{c.v}</p>
          </div>
        ))}
      </div>

      <p className="text-sm leading-relaxed text-gray-600">
        Every component lists its lifecycle status, source path, Figma reference, and where it’s used in the app. Values,
        tokens, import paths, and code blocks are copyable. The page is isolated at{' '}
        <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-700">/design-system</code> and
        changes no production screen or flow.
      </p>
    </Section>
  );
}
