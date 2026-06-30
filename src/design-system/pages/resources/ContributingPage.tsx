import { DSPage } from '../../layout/DSPage';
import { Section, Subsection, SpecTable, CodeBlock } from '../../components/DocPrimitives';

export function ContributingPage() {
  return (
    <DSPage title="Contributing">
      <Section
        id="contributing"
        title="Contributing"
        intro="The workflow for adding a component or pattern to the GGX Design System: Figma first, then implementation, then documentation, then verification."
      >
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
          <p className="text-sm text-[#0088C9] dark:text-blue-400 font-medium">
            All work must start from an existing GGX-SHADCN component or a reviewed design in Figma.
            Do not add components that don't exist in the codebase or Figma file.
          </p>
        </div>
      </Section>

      <Section id="workflow" title="Four-step workflow">
        <div className="space-y-4">
          {[
            {
              step: '1',
              title: 'Figma',
              description: 'Confirm the component exists in GGX-SHADCN. Note the component name and node key. If the component is custom (GGX-specific), confirm with the design lead that it has a reviewed Figma representation.',
            },
            {
              step: '2',
              title: 'Implementation',
              description: 'Confirm the React component exists in the production codebase. Note the source path (relative to repo root). If the component is new, implement it first and get it merged before documenting it here.',
            },
            {
              step: '3',
              title: 'Documentation',
              description: 'Add a Section file, a Page file, a route, and a nav entry. Add the component to componentRegistry.ts with its Figma key, source path, and status.',
            },
            {
              step: '4',
              title: 'Verification',
              description: 'Run tsc --noEmit and confirm the page renders correctly in the browser. Verify the live preview shows the actual component (not a screenshot). Confirm the Figma key resolves in the GGX-SHADCN file.',
            },
          ].map(({ step, title, description }) => (
            <div key={step} className="flex gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0088C9]/10 text-sm font-bold text-[#0088C9] dark:bg-blue-950/50 dark:text-blue-400">
                {step}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
                <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="file-checklist" title="File checklist">
        <SpecTable
          columns={['File', 'Purpose']}
          rows={[
            ['src/design-system/sections/YourComponentSection.tsx', 'Live preview, CodeBlock, DoDont, AccessibilityNotes'],
            ['src/design-system/pages/[group]/YourComponentPage.tsx', 'DSPage wrapper'],
            ['src/design-system/data/componentRegistry.ts', 'Add ComponentMeta entry with id, title, status, source, figma, blurb'],
            ['src/design-system/nav/DSNavConfig.ts', 'Add DSNavItem in the correct category'],
            ['src/design-system/DSAppShell.tsx', 'Add Route with the correct path'],
          ]}
        />

        <CodeBlock code={`// componentRegistry.ts entry
'your-component': {
  id: 'your-component',
  title: 'Your Component',
  status: 'in-use',
  source: 'src/app/components/ui/YourComponent.tsx',
  figma: { name: 'Your Component', key: 'abc123...' },
  usedIn: [{ label: 'Dashboard', where: '/dashboard' }],
  blurb: 'One-line description for search.',
},`} />
      </Section>

      <Section id="rules" title="Rules">
        <SpecTable
          columns={['Rule', 'Why']}
          rows={[
            ['Live previews only — no screenshots', 'Screenshots go stale; live renders stay accurate'],
            ['No invented Figma links', 'Every Figma link must point to a real, verified node in GGX-SHADCN'],
            ['No invented repo URLs', 'Source paths must be verified against the actual file tree'],
            ['No business logic in the DS reference', 'Rates, fees, eligibility come from the backend — never hardcode them in doc examples'],
            ['Mark status honestly', 'If a component isn\'t in production use yet, mark it "In progress" — don\'t mark it "In use" prematurely'],
          ]}
        />
      </Section>
    </DSPage>
  );
}
