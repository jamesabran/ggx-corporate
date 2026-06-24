import { IconBrandFigma } from '@tabler/icons-react';
import { Section } from '../components/DocPrimitives';
import { GGX_SHADCN_URL, GGX_REPO_URL } from '../data/componentRegistry';
import iconBulk from '../../assets/basic/icon-bulk.png';

const GGX_LOGO = 'https://gogoxpress.com/wp-content/uploads/2022/07/gogox-logo.png';

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
        {/* Figma source — dark */}
        <a
          href={GGX_SHADCN_URL}
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl bg-[#1a1a2e] p-5 transition-opacity hover:opacity-90"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <IconBrandFigma className="h-6 w-6 text-white" stroke={1.5} />
          </div>
          <p className="text-sm font-semibold text-white">GGX-SHADCN (Figma)</p>
          <p className="mt-1 text-sm text-white/65">The approved visual design and component specifications.</p>
        </a>

        {/* Production code — brand blue */}
        <a
          href={GGX_REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="block rounded-xl bg-[#0088C9] p-5 transition-opacity hover:opacity-90"
        >
          <div className="mb-3">
            <img src={GGX_LOGO} alt="GoGo Xpress" className="h-7 w-auto brightness-0 invert" />
          </div>
          <p className="text-sm font-semibold text-white">Production code</p>
          <p className="mt-1 text-sm text-white/80">The real implementation and behavior shipped in the app.</p>
        </a>

        {/* This reference — light */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-5">
          <div className="mb-3">
            <img src={iconBulk} alt="" className="h-10 w-10 object-contain" />
          </div>
          <p className="text-sm font-semibold text-gray-900">This reference</p>
          <p className="mt-1 text-sm text-gray-600">A living view that renders the coded components and their metadata.</p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-gray-600">
        Every component lists its lifecycle status, source path, Figma reference, and where it's used in the app. Values,
        tokens, import paths, and code blocks are copyable. The page is isolated at{' '}
        <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-700">/design-system</code> and
        changes no production screen or flow.
      </p>

      <div className="rounded-xl border border-gray-200 p-5">
        <p className="text-sm font-semibold text-gray-900">Coverage</p>
        <p className="mt-1 text-sm text-gray-600">
          The documented set now spans essentially the whole GGX-SHADCN primitive library. Components marked{' '}
          <span className="font-medium text-amber-700">In progress</span> are real, exported components that are still
          rolling out into app screens. <span className="text-gray-800">Native Select</span> is represented by the
          documented <span className="text-gray-800">Select</span> (which wraps a native <code className="font-mono text-xs">&lt;select&gt;</code>),
          so it isn't listed separately.
        </p>
      </div>
    </Section>
  );
}
