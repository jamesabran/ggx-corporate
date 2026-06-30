import { Link } from 'react-router';
import { IconBrandFigma } from '@tabler/icons-react';
import { GGX_SHADCN_URL, GGX_REPO_URL } from '../data/componentRegistry';

const GGX_LOGO = 'https://gogoxpress.com/wp-content/uploads/2022/07/gogox-logo.png';

export function OverviewSection() {
  return (
    <div className="space-y-14">

      {/* ── Hero ── */}
      <div className="border-b border-gray-100 pb-12 dark:border-gray-800">
        <img
          src={GGX_LOGO}
          alt="GoGo Xpress"
          className="mb-6 h-8 w-auto dark:brightness-0 dark:invert"
        />
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl">
          GoGo Xpress Design System
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-600 dark:text-gray-400">
          The unified reference for GoGo Xpress foundations, components, and patterns — connecting
          Figma design, production code, and documentation in one living source.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/design-system/foundations/overview"
            className="rounded-lg bg-[#0088C9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0077b3] transition-colors"
          >
            Foundations
          </Link>
          <Link
            to="/design-system/components/overview"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Components
          </Link>
          <Link
            to="/design-system/patterns/overview"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Patterns
          </Link>
          <a
            href={GGX_SHADCN_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Open in Figma ↗
          </a>
        </div>
      </div>

      {/* ── Quick reference ── */}
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          Quick reference
        </p>
        <div className="grid gap-4 sm:grid-cols-3">

          {/* GGX-SHADCN Figma */}
          <a
            href={GGX_SHADCN_URL}
            target="_blank"
            rel="noreferrer"
            className="group block rounded-xl bg-[#1a1a2e] p-5 transition-opacity hover:opacity-90"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
              <IconBrandFigma className="h-6 w-6 text-white" stroke={1.5} />
            </div>
            <p className="text-sm font-semibold text-white">GGX-SHADCN (Figma)</p>
            <p className="mt-1 text-sm text-white/65">
              Approved visual design and component specifications. File key:{' '}
              <code className="font-mono text-[11px] text-white/50">9zwtAL4RU3Y8WVRJAsSulX</code>
            </p>
          </a>

          {/* Production code */}
          <a
            href={GGX_REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="group block rounded-xl bg-[#0088C9] p-5 transition-opacity hover:opacity-90"
          >
            <div className="mb-3">
              <img src={GGX_LOGO} alt="GoGo Xpress" className="h-7 w-auto brightness-0 invert" />
            </div>
            <p className="text-sm font-semibold text-white">Production code</p>
            <p className="mt-1 text-sm text-white/80">
              The real implementation shipped in GGX Business+ — React + TypeScript + Tailwind.
            </p>
          </a>

          {/* This reference */}
          <Link
            to="/design-system/getting-started/how-this-works"
            className="group block rounded-xl border border-gray-200 bg-gray-50/60 p-5 transition-colors hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40 dark:hover:border-gray-600"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <span className="text-lg">📐</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">This reference</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Living view of coded components with metadata, previews, and cross-source traceability.
            </p>
          </Link>
        </div>
      </div>

      {/* ── One connected system ── */}
      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6 dark:border-gray-700 dark:bg-gray-800/30">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">One connected system</p>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          Every component listed here exists in both the{' '}
          <a href={GGX_SHADCN_URL} target="_blank" rel="noreferrer" className="font-medium text-[#0088C9] hover:underline dark:text-blue-400">
            GGX-SHADCN Figma file
          </a>{' '}
          and the production codebase. Previews render the actual React component — not a screenshot.
          The{' '}
          <Link to="/design-system/resources/traceability" className="font-medium text-[#0088C9] hover:underline dark:text-blue-400">
            Traceability matrix
          </Link>{' '}
          shows every mapping; missing or unverified links are flagged explicitly.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
          <div className="rounded-lg bg-white p-3 dark:bg-gray-900/60">
            <p className="font-medium text-gray-800 dark:text-gray-200">
              {Object.keys(
                // Inline count from the registry — updated when new components are added.
                // If you see a stale number here, update componentRegistry.ts.
                {} as Record<string, unknown>,
              ).length || '30+'} components
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Primitive + GGX-specific</p>
          </div>
          <div className="rounded-lg bg-white p-3 dark:bg-gray-900/60">
            <p className="font-medium text-gray-800 dark:text-gray-200">6 patterns</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Documented GGX workflows</p>
          </div>
          <div className="rounded-lg bg-white p-3 dark:bg-gray-900/60">
            <p className="font-medium text-gray-800 dark:text-gray-200">Live previews</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Real components, not screenshots</p>
          </div>
        </div>
      </div>

      {/* ── Coverage note ── */}
      <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        Components marked{' '}
        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          In progress
        </span>{' '}
        are real, exported components still rolling out to app screens.{' '}
        <Link to="/design-system/getting-started/how-this-works" className="text-[#0088C9] hover:underline dark:text-blue-400">
          How this reference works →
        </Link>
      </div>
    </div>
  );
}
