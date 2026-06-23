import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../app/components/ui/Tabs';

const CODE = `import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/Tabs';

<Tabs defaultValue="deliveries">
  <TabsList>
    <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
    <TabsTrigger value="store">Store Orders</TabsTrigger>
  </TabsList>
  <TabsContent value="deliveries">…</TabsContent>
  <TabsContent value="store">…</TabsContent>
</Tabs>`;

export function TabsSection() {
  return (
    <Section
      id="tabs"
      title="Tabs"
      intro="Radix-based tabs for switching between sections within a page (e.g. Transactions → Deliveries / Store Orders). Keyboard and ARIA come from Radix."
    >
      <ImplementationMeta id="tabs" note="Built on @radix-ui/react-tabs. Use defaultValue (uncontrolled) or value/onValueChange (controlled)." />

      <Subsection title="Live implementation">
        <PreviewBox>
          <Tabs defaultValue="deliveries">
            <TabsList>
              <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
              <TabsTrigger value="store">Store Orders</TabsTrigger>
              <TabsTrigger value="returns">Returns</TabsTrigger>
            </TabsList>
            <TabsContent value="deliveries">
              <p className="text-sm text-gray-600">Delivery transactions for the current scope.</p>
            </TabsContent>
            <TabsContent value="store">
              <p className="text-sm text-gray-600">Buyer store orders awaiting acceptance and fulfillment.</p>
            </TabsContent>
            <TabsContent value="returns">
              <p className="text-sm text-gray-600">Returned and refunded shipments.</p>
            </TabsContent>
          </Tabs>
        </PreviewBox>
      </Subsection>

      <AccessibilityNotes
        items={[
          'Radix provides full keyboard support: arrow keys move between tabs, Home/End jump to ends.',
          'Roles (tablist / tab / tabpanel) and aria-selected are handled by Radix.',
          'The active trigger shows a white pill + shadow and a focus-visible ring.',
        ]}
      />

      <Subsection title="Usage">
        <DoDont
          dos={['Use to split one page into peer sections.', 'Sync the active tab to the URL for shareable state where useful.', 'Keep tab labels short.']}
          donts={['Don’t use tabs for sequential steps — that’s a wizard.', 'Don’t overflow with many tabs on mobile.', 'Don’t hide critical actions behind a non-default tab.']}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>
    </Section>
  );
}
