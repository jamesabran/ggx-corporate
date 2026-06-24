import { useState } from 'react';
import {
  Section,
  Subsection,
  PreviewBox,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { OtpDialog } from '../../app/components/ui/OtpDialog';
import { Button } from '../../app/components/ui/Button';

const CODE = `import { OtpDialog } from '@/app/components/ui/OtpDialog';

<OtpDialog
  open={open}
  onClose={() => setOpen(false)}
  onVerified={commitFinancialChange}
  actionLabel="Update payout bank account"
/>`;

export function OtpDialogSection() {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <Section
      id="otp-dialog"
      title="OTP Dialog"
      intro="A reusable OTP verification gate required before committing sensitive (financial) actions — even for admins. Composes the Dialog with a 6-digit code field."
    >
      <ImplementationMeta id="otp-dialog" note="onVerified fires only on a correct 6-digit code. This is a frontend/mock gate (code 123456); a real flow sends the code out-of-band." />

      <Subsection title="Live implementation" description="Open the real OTP dialog (mock code: 123456).">
        <PreviewBox className="flex items-center gap-3">
          <Button onClick={() => { setOpen(true); setDone(false); }}>Verify a financial change</Button>
          {done && <span className="text-sm font-medium text-green-700">Verified ✓</span>}
          <OtpDialog
            open={open}
            onClose={() => setOpen(false)}
            onVerified={() => { setOpen(false); setDone(true); }}
            actionLabel="Update payout bank account"
          />
        </PreviewBox>
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>

      <Subsection title="Usage">
        <DoDont
          dos={['Require it before any irreversible financial change.', 'Pass actionLabel so the user knows what they’re authorizing.', 'Treat onVerified as the only success path.']}
          donts={['Don’t skip OTP for admins.', 'Don’t proceed on close/cancel.', 'Don’t reuse it for non-sensitive confirmations — use ConfirmDialog.']}
        />
      </Subsection>

      <AccessibilityNotes
        items={[
          'The code field autofocuses on open and accepts Enter to submit once 6 digits are entered.',
          'Input is numeric (inputMode="numeric") and limited to digits.',
          'Invalid codes show an inline error message tied to the field, not just a color change.',
          'Verify is disabled until 6 digits are present, preventing premature submits.',
        ]}
      />


    </Section>
  );
}
