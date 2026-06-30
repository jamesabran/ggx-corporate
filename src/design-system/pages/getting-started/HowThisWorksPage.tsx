import { DSPage } from '../../layout/DSPage';
import { Section, Subsection, CodeBlock, SpecTable } from '../../components/DocPrimitives';

export function HowThisWorksPage() {
  return (
    <DSPage title="How this reference works">
      <Section
        id="purpose"
        title="Purpose"
        intro="This reference documents the approved, implemented GoGo Xpress design system — it does not reinvent it. Every page describes something that already exists in the codebase or in GGX-SHADCN."
      >
        <Subsection title="What it is">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            A living reference that renders the actual coded components alongside their metadata: lifecycle
            status, Figma reference, source path, and where they're used in the app. Previews are live React
            renders — not screenshots — so they stay accurate as components evolve.
          </p>
        </Subsection>
        <Subsection title="What it isn't">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            It is not a design spec generator, a Storybook replacement, or a source of truth for financial or
            operational logic. All rates, fees, eligibility, and business rules come from the backend.
          </p>
        </Subsection>
      </Section>

      <Section
        id="structure"
        title="Structure"
        intro="The reference is organized into five sections."
      >
        <SpecTable
          columns={['Section', 'Contents']}
          rows={[
            ['Getting Started', 'Overview of the system and how this reference is organized.'],
            ['Foundations', 'Color tokens, typography scale, spacing, design tokens, elevation, icons, and responsive behavior.'],
            ['Components', 'Every shared and GGX-specific component with live previews, code samples, and traceability metadata.'],
            ['Patterns', 'Recurring multi-component compositions: booking flows, bulk upload, payments, transactions, forms, and states.'],
            ['Resources', 'Traceability matrix, changelog, contributing guide, and documentation standards.'],
          ]}
        />
      </Section>

      <Section
        id="traceability"
        title="Three-source traceability"
        intro="Each component page connects three sources of truth."
      >
        <SpecTable
          columns={['Source', 'What it covers', 'Where to find it']}
          rows={[
            ['GGX-SHADCN (Figma)', 'Approved visual design and component specifications', 'figma.com — linked from each page and the header'],
            ['Production code', 'The implemented React component used by the live app', 'GitHub repo — source path copyable on each page'],
            ['This reference', 'Live preview, metadata, usage context, and do/don\'t guidance', 'Right here'],
          ]}
        />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Where the three sources diverge, the discrepancy is flagged with a{' '}
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            needs verification
          </span>{' '}
          label. See <a href="/design-system/resources/traceability" className="text-[#0088C9] hover:underline dark:text-blue-400">Traceability</a> for the full matrix.
        </p>
      </Section>

      <Section
        id="adding-a-component"
        title="Adding a component"
      >
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>Create <code className="font-mono text-xs bg-gray-100 rounded px-1 py-0.5 dark:bg-gray-800">src/design-system/sections/YourComponentSection.tsx</code> — render the real component, include a <code className="font-mono text-xs">CodeBlock</code>, <code className="font-mono text-xs">DoDont</code>, and <code className="font-mono text-xs">AccessibilityNotes</code>.</li>
          <li>Add the component's metadata to <code className="font-mono text-xs bg-gray-100 rounded px-1 py-0.5 dark:bg-gray-800">src/design-system/data/componentRegistry.ts</code>.</li>
          <li>Create <code className="font-mono text-xs bg-gray-100 rounded px-1 py-0.5 dark:bg-gray-800">src/design-system/pages/[group]/YourComponentPage.tsx</code> wrapping the section in <code className="font-mono text-xs">DSPage</code>.</li>
          <li>Add a route in <code className="font-mono text-xs bg-gray-100 rounded px-1 py-0.5 dark:bg-gray-800">DSAppShell.tsx</code> and a nav entry in <code className="font-mono text-xs">DSNavConfig.ts</code>.</li>
          <li>Run <code className="font-mono text-xs bg-gray-100 rounded px-1 py-0.5 dark:bg-gray-800">npx tsc --noEmit</code> to confirm no type errors before committing.</li>
        </ol>
        <CodeBlock code={`// Example: src/design-system/sections/MyComponentSection.tsx
import { Section, ImplementationMeta, PreviewBox, CodeBlock, DoDont } from '../components/DocPrimitives';
import { MyComponent } from '../../app/components/ui/MyComponent';

export function MyComponentSection() {
  return (
    <Section id="my-component" title="My Component" intro="One-line description.">
      <ImplementationMeta id="my-component" />
      <PreviewBox>
        <MyComponent />
      </PreviewBox>
      <CodeBlock code={\`import { MyComponent } from '@/components/ui/MyComponent';\`} />
      <DoDont
        dos={['Use for X']}
        donts={['Do not use for Y']}
      />
    </Section>
  );
}`} />
      </Section>

      <Section id="conventions" title="Conventions">
        <SpecTable
          columns={['Convention', 'Rule']}
          rows={[
            ['Status labels', '"In use" = shipped in production; "In progress" = exported but still rolling out; "Deprecated" = do not use.'],
            ['Figma keys', 'Published component key from GGX-SHADCN. Copyable from the metadata block. "Needs verification" means the match is uncertain.'],
            ['Source paths', 'Relative to the repo root. Copyable. Used as the canonical path for code connect.'],
            ['Live previews', 'Always render the actual React component — never a static image.'],
            ['Code samples', 'Show the minimal import and usage, not the entire page.'],
          ]}
        />
      </Section>
    </DSPage>
  );
}
