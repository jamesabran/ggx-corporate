import { DSPage } from '../../layout/DSPage';
import { Section, Subsection, SpecTable, CodeBlock } from '../../components/DocPrimitives';

export function DocumentationStandardsPage() {
  return (
    <DSPage title="Documentation standards">
      <Section
        id="documentation-standards"
        title="Documentation standards"
        intro="What a complete, publishable component or pattern page looks like. Incomplete pages can be committed but must be marked as in-progress in the registry."
      >
        <Subsection title="Required sections for a component page">
          <SpecTable
            columns={['Section', 'Required?', 'Notes']}
            rows={[
              ['ImplementationMeta block', 'Required', 'Status, source path, Figma reference, usage context'],
              ['Live preview (PreviewBox)', 'Required', 'Must render the real component — no screenshots'],
              ['Code sample (CodeBlock)', 'Required', 'Minimal import + usage; copyable'],
              ['DoDont', 'Recommended', 'At least one Do and one Don\'t that aren\'t obvious'],
              ['AccessibilityNotes', 'Recommended', 'ARIA roles, keyboard behavior, focus management'],
              ['SpecTable for props/variants', 'Recommended for complex components', 'Variant list, size options, or prop reference'],
              ['ResponsivePreview', 'When applicable', 'For layout-sensitive components (cards, tables, forms)'],
            ]}
          />
        </Subsection>

        <Subsection title="Required sections for a pattern page">
          <SpecTable
            columns={['Section', 'Notes']}
            rows={[
              ['Overview paragraph', 'What the pattern is, when to use it, which components compose it'],
              ['Step or structure table', 'SpecTable documenting the steps or regions'],
              ['Design conventions', 'Rules that apply across all uses of this pattern'],
              ['Links to component pages', 'Every component used in the pattern must link to its DS page'],
            ]}
          />
        </Subsection>
      </Section>

      <Section id="naming" title="Naming conventions">
        <SpecTable
          columns={['Item', 'Convention', 'Example']}
          rows={[
            ['Section file', 'PascalCase, ends in Section', 'ButtonSection.tsx'],
            ['Page file', 'PascalCase, ends in Page', 'ButtonPage.tsx'],
            ['Section id', 'kebab-case, matches componentRegistry key', 'id="button"'],
            ['Nav label', 'Title Case', '"Search Input"'],
            ['Route path', 'kebab-case', '"search-input"'],
            ['Registry key', 'kebab-case', '"search-input"'],
          ]}
        />
      </Section>

      <Section id="status-labels" title="Status labels">
        <SpecTable
          columns={['Label', 'Meaning', 'When to use']}
          rows={[
            ['In use', 'Component is shipped and in production use', 'Default for fully implemented, live components'],
            ['In progress', 'Component is real and exported but not yet widely used in the app', 'Use for components that exist but are still rolling out'],
            ['Deprecated', 'Component should not be used in new work', 'When replacing with a newer pattern or component'],
          ]}
        />
      </Section>

      <Section id="what-not-to-document" title="What not to document">
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />Components that don't exist in the codebase or Figma — even if planned.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />Business logic, rate calculations, fee structures, or eligibility rules.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />Invented Figma keys — leave the field blank or mark needsVerification if unsure.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />Screenshots of components — live previews only.</li>
          <li className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />Third-party component internals — document the GGX wrapper, not the underlying library.</li>
        </ul>
      </Section>

      <Section id="page-template" title="Page template">
        <CodeBlock code={`// src/design-system/sections/YourComponentSection.tsx
import {
  Section,
  Subsection,
  ImplementationMeta,
  PreviewBox,
  CodeBlock,
  DoDont,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { YourComponent } from '../../app/components/ui/YourComponent';

export function YourComponentSection() {
  return (
    <Section
      id="your-component"
      title="Your Component"
      intro="One sentence describing what this component does."
    >
      <ImplementationMeta id="your-component" />

      <PreviewBox>
        <YourComponent />
      </PreviewBox>

      <CodeBlock code={\`import { YourComponent } from '@/components/ui/YourComponent';

<YourComponent prop="value" />\`} />

      <DoDont
        dos={['Use for primary action']}
        donts={['Do not use for navigation']}
      />

      <AccessibilityNotes
        items={[
          'Announce state changes with aria-live.',
          'Ensure keyboard focus is visible.',
        ]}
      />
    </Section>
  );
}`} />
      </Section>
    </DSPage>
  );
}
