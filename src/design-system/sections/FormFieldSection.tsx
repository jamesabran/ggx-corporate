import {
  Section,
  Subsection,
  ResponsivePreview,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { SampleFormField } from '../components/SampleFormField';

const CODE = `import { Input } from '@/app/components/ui/Input';

<label htmlFor="email" className="text-sm font-medium text-gray-900">
  Email <span className="text-red-600">*</span>
</label>
<Input
  id="email"
  type="email"
  required
  aria-invalid={hasError || undefined}
  aria-describedby="email-desc"
  className={hasError ? 'border-red-500 focus-visible:ring-red-500' : undefined}
/>
<p id="email-desc" className={hasError ? 'text-xs text-red-600' : 'text-xs text-gray-500'}>
  {hasError ? 'Enter a valid email address.' : 'We’ll send the receipt here.'}
</p>`;

export function FormFieldSection() {
  return (
    <Section
      id="input-field"
      title="Input / Form Field"
      intro="The text input used across forms, with a thin field wrapper that adds a label, helper text, and validation messaging. Validation messages stay directly below the field they describe."
    >
      <ImplementationMeta
        status="production"
        source="src/app/components/ui/Input.tsx"
        usedIn={[
          { label: 'Login', where: '/' },
          { label: 'Tracking lookup', where: '/track' },
          { label: 'Buyer & cart checkout', where: '/buy/:productId, /checkout' },
        ]}
        note="The control is the production Input. The label/helper/error layout around it is a sample wrapper (src/design-system/components/SampleFormField.tsx) — it adds no new control visuals, only the standard red-border error state and ARIA wiring."
      />

      <Subsection title="Live implementation — states" description="Default, filled, required, helper text, validation error, and disabled. Each renders the production Input.">
        <ResponsivePreview>
          <div className="grid gap-5 sm:grid-cols-2">
            <SampleFormField label="Recipient name" placeholder="e.g. Maria Santos" />
            <SampleFormField label="Recipient name" defaultValue="Maria Santos" />
            <SampleFormField label="Mobile number" required placeholder="09XX XXX XXXX" />
            <SampleFormField label="Email" type="email" placeholder="name@email.com" helper="We’ll send the receipt here." />
            <SampleFormField label="Mobile number" required defaultValue="0917" error="Enter a valid 11-digit mobile number." />
            <SampleFormField label="Account ID" defaultValue="GGX-CORP-0098" disabled helper="Managed by your administrator." />
          </div>
        </ResponsivePreview>
      </Subsection>

      <Subsection title="State reference">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">Required + error</p>
            <SampleFormField label="City / Municipality" required error="This field is required." />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500">Helper text</p>
            <SampleFormField label="Landmarks (optional)" helper="Helps the rider find the address faster." />
          </div>
        </div>
      </Subsection>

      <AccessibilityNotes
        items={[
          <>Every field has a <code>&lt;label&gt;</code> associated by <code>htmlFor</code>/<code>id</code>, so clicking the label focuses the input.</>,
          <>The error state sets <code>aria-invalid</code> and links the message with <code>aria-describedby</code>, so screen readers announce it.</>,
          'Required fields use the native required attribute plus a visible asterisk — not color alone.',
          'Disabled uses the native disabled attribute (removed from the tab order, 50% opacity); focus shows the standard primary ring.',
          'The validation message sits immediately below its field — never in a separate summary far from the input.',
        ]}
      />

      <Subsection title="Usage">
        <DoDont
          dos={[
            'Keep the validation message directly under the field it refers to.',
            'Mark required fields and explain the requirement in one short line.',
            'Use helper text for format hints; swap it for the error when validation fails.',
          ]}
          donts={[
            'Don’t collect all errors into one banner away from the fields.',
            'Don’t rely on red color alone to signal an error.',
            'Don’t disable a field without making it clear why (helper text).',
          ]}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>
    </Section>
  );
}
