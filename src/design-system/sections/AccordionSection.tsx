import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { AccordionItem } from '../../app/components/ui/Accordion';
import { Card } from '../../app/components/ui/Card';

const CODE = `import { AccordionItem } from '@/app/components/ui/Accordion';

<Card className="px-4">
  <AccordionItem title="How is the delivery fee calculated?">
    Fees are computed by the service from weight, size, and destination.
  </AccordionItem>
  <AccordionItem title="When am I charged?">
    Billing accounts are invoiced after the service.
  </AccordionItem>
</Card>`;

export function AccordionSection() {
  return (
    <Section
      id="accordion"
      title="Accordion"
      intro="A collapsible section for progressively disclosing content (FAQs, advanced options). Compose several AccordionItems inside a container."
    >
      <ImplementationMeta
        id="accordion"
        note="In progress: new shared component. Each item manages its own open state; the header is a real button with aria-expanded."
      />

      <Subsection title="Live implementation" description="Click a header to expand/collapse.">
        <PreviewBox>
          <Card className="max-w-lg px-4">
            <AccordionItem title="How is the delivery fee calculated?" defaultOpen>
              Fees are computed by the service from weight, size, and destination — the app only displays the result.
            </AccordionItem>
            <AccordionItem title="When am I charged?">
              Billing-eligible accounts are invoiced after the service; others pay at booking via the selected method.
            </AccordionItem>
            <AccordionItem title="Can I edit a booked order?">
              Some changes are possible before pickup. Open the transaction and use the available actions.
            </AccordionItem>
          </Card>
        </PreviewBox>
      </Subsection>

      <AccessibilityNotes
        items={[
          'Each header is a <button> with aria-expanded reflecting its state.',
          'Keyboard: Tab to a header, Enter/Space toggles; focus shows the primary ring.',
          'The chevron rotates as an affordance but the button text carries the meaning.',
          'Collapsed content is removed from the DOM, so it’s skipped by assistive tech until opened.',
        ]}
      />

      <Subsection title="Usage">
        <DoDont
          dos={['Use for FAQs and optional/advanced detail.', 'Keep headers short and descriptive.', 'Open the most relevant item by default where helpful.']}
          donts={['Don’t hide essential primary content behind it.', 'Don’t nest accordions deeply.', 'Don’t use for step-by-step flows.']}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>
    </Section>
  );
}
