import { Link } from 'react-router';
import { DSPage } from '../../layout/DSPage';
import { Section, Subsection, CodeBlock, SpecTable, DoDont } from '../../components/DocPrimitives';

export function FormsValidationPage() {
  return (
    <DSPage title="Forms & validation">
      <Section
        id="forms-validation"
        title="Forms & validation"
        intro="GGX forms follow a consistent label-input-helper-error anatomy using the Field component as the standard wrapper."
      >
        <Subsection title="Field anatomy">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Every form control is wrapped in a{' '}
            <Link to="/design-system/components/field" className="text-[#0088C9] hover:underline dark:text-blue-400">Field</Link>{' '}
            that provides the label, optional helper text, and error slot.
          </p>
          <CodeBlock code={`<Field label="Email address" required error={errors.email?.message}>
  <Input
    type="email"
    placeholder="you@example.com"
    aria-invalid={!!errors.email}
  />
</Field>`} />
        </Subsection>

        <Subsection title="Required indicator">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Required fields use a <code className="font-mono text-xs">*</code> asterisk appended to the label.
            The Field component applies this automatically when <code className="font-mono text-xs">required</code> is set.
            Include a "* Required" legend at the top of long forms.
          </p>
        </Subsection>
      </Section>

      <Section id="validation-timing" title="Validation timing">
        <SpecTable
          columns={['Trigger', 'When to use']}
          rows={[
            ['On submit', 'Default for most forms. Show all errors together after the user clicks submit.'],
            ['On blur', 'Use for forms where the user tabs through many fields (e.g., address entry). Avoids premature errors.'],
            ['On change', 'Use only for format constraints (e.g., phone number formatting). Never for required-field errors.'],
          ]}
        />
        <DoDont
          dos={[
            'Validate on submit first, then on blur for subsequent interactions.',
            'Show the error on the specific field — not only in a summary.',
            'Use a field-level error message that says what to fix, not just that it\'s wrong.',
          ]}
          donts={[
            'Show "Required" errors before the user has tried to fill the field.',
            'Clear the field value when validation fails.',
            'Show success states on fields unless explicitly needed (e.g., coupon code).',
          ]}
        />
      </Section>

      <Section id="error-messages" title="Error message writing">
        <SpecTable
          columns={['Error type', 'Message pattern', 'Example']}
          rows={[
            ['Required', '"[Field] is required"', '"Email address is required"'],
            ['Format', '"[Field] must be a valid [format]"', '"Phone number must be a valid Philippine mobile number"'],
            ['Length', '"[Field] must be [n] characters or fewer"', '"Company name must be 100 characters or fewer"'],
            ['Server error', 'Use the server-returned message verbatim when safe; otherwise show a generic retry message.', '"Unable to save changes. Please try again."'],
          ]}
        />
      </Section>

      <Section id="layout-conventions" title="Layout conventions">
        <Subsection title="Single column vs. grid">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Single-column forms are preferred for most GGX contexts. Use a two-column grid
            (<code className="font-mono text-xs">grid grid-cols-2 gap-4</code>) only when fields are
            logically paired and the viewport is wide enough (
            <code className="font-mono text-xs">sm:</code> breakpoint minimum).
          </p>
        </Subsection>
        <Subsection title="CTA placement">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Primary submit CTA is right-aligned on desktop, full-width on mobile. Cancel/secondary
            actions are to the left of the primary. Never place the primary CTA in the middle of a
            button row.
          </p>
        </Subsection>
      </Section>
    </DSPage>
  );
}
