import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { Select } from '../../app/components/ui/Select';

const CODE = `import { Select } from '@/app/components/ui/Select';

<Select defaultValue="">
  <option value="" disabled>Select a service</option>
  <option value="standard">Standard Delivery</option>
  <option value="same_day">Same-Day Delivery</option>
</Select>`;

export function SelectSection() {
  return (
    <Section
      id="select"
      title="Select"
      intro="A native <select> styled to match the form controls, with a chevron affordance. Native by design — it inherits platform accessibility and mobile pickers."
    >
      <ImplementationMeta id="select" note="Renders a real <select>; pass <option> children. Use a disabled empty option as the placeholder." />

      <Subsection title="States" description="Default, with a value, and disabled.">
        <PreviewBox className="grid max-w-md gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">Service type</label>
            <Select defaultValue="">
              <option value="" disabled>Select a service</option>
              <option value="standard">Standard Delivery</option>
              <option value="same_day">Same-Day Delivery</option>
              <option value="on_demand">On-Demand Delivery</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">Preferred bank</label>
            <Select defaultValue="bdo">
              <option value="bdo">BDO</option>
              <option value="bpi">BPI</option>
              <option value="metrobank">Metrobank</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Region (disabled)</label>
            <Select defaultValue="ncr" disabled>
              <option value="ncr">Metro Manila</option>
            </Select>
          </div>
        </PreviewBox>
      </Subsection>

      <AccessibilityNotes
        items={[
          'Uses a native <select>, so keyboard, screen-reader, and mobile native pickers all work out of the box.',
          'Associate a <label> via htmlFor/id (as in forms).',
          'The chevron is aria-hidden and purely decorative.',
          'Focus shows the standard primary ring; disabled uses the native attribute.',
        ]}
      />

      <Subsection title="Usage">
        <DoDont
          dos={['Use a disabled empty first option as the placeholder.', 'Keep option labels short and scannable.', 'Use for short, known option sets.']}
          donts={['Don’t use for free-text entry — use Input.', 'Don’t build a custom dropdown when the native one fits.', 'Don’t hide the label.']}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>
    </Section>
  );
}
