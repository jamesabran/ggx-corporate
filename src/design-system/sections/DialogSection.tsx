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
import { Dialog, ConfirmDialog } from '../../app/components/ui/Dialog';
import { Button } from '../../app/components/ui/Button';

const CODE = `import { Dialog, ConfirmDialog } from '@/app/components/ui/Dialog';

// Base modal
<Dialog open={open} onClose={() => setOpen(false)} title="Edit address">
  …form…
</Dialog>

// Confirmation
<ConfirmDialog
  open={confirm}
  onClose={() => setConfirm(false)}
  onConfirm={handleDelete}
  title="Remove address?"
  description="This can’t be undone."
  variant="destructive"
  confirmLabel="Remove"
/>`;

export function DialogSection() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);

  return (
    <Section
      id="dialog"
      title="Dialog"
      intro="The base modal (scrim + centered panel) and a ConfirmDialog wrapper for confirmations. Clicking the scrim closes it; confirmations support a destructive variant."
    >
      <ImplementationMeta id="dialog" note="Controlled by open/onClose. ConfirmDialog composes Dialog with a description and confirm/cancel actions." />

      <Subsection title="Live implementation" description="Open the real modal and confirmation from these triggers.">
        <PreviewBox className="flex flex-wrap gap-3">
          <Button onClick={() => setOpen(true)}>Open dialog</Button>
          <Button variant="destructive" onClick={() => setConfirm(true)}>Open confirm</Button>

          <Dialog open={open} onClose={() => setOpen(false)} title="Edit pickup address" size="md">
            <p className="mb-4 text-sm text-gray-600">
              This is the production Dialog component — the same scrim and panel used across the app.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={() => setOpen(false)}>Save</Button>
            </div>
          </Dialog>

          <ConfirmDialog
            open={confirm}
            onClose={() => setConfirm(false)}
            onConfirm={() => setConfirm(false)}
            title="Remove address?"
            description="This can’t be undone."
            variant="destructive"
            confirmLabel="Remove"
          />
        </PreviewBox>
      </Subsection>

      <Subsection title="Sizes" description="Dialog supports sm (default), md, and lg panel widths.">
        <PreviewBox>
          <p className="text-sm text-gray-600">
            <code className="font-mono text-xs">size="sm"</code> for confirmations,{' '}
            <code className="font-mono text-xs">"md"</code> for short forms,{' '}
            <code className="font-mono text-xs">"lg"</code> for richer content.
          </p>
        </PreviewBox>
      </Subsection>

      <AccessibilityNotes
        items={[
          'Clicking the scrim closes the dialog; the panel stops click propagation so inner clicks don’t dismiss it.',
          'Provide a clear title and an explicit Cancel/close action.',
          'ConfirmDialog’s destructive variant colors the confirm button to signal irreversibility.',
          'Note: this lightweight modal does not trap focus — keep dialogs short; for complex flows consider a focus-trapping pattern.',
        ]}
      />

      <Subsection title="Usage">
        <DoDont
          dos={['Use ConfirmDialog for destructive/irreversible actions.', 'Keep dialog content short and focused.', 'Give every dialog a title and a way out.']}
          donts={['Don’t stack many dialogs (use elevated only when layering is required).', 'Don’t put long multi-step flows in a small modal.', 'Don’t rely on the scrim as the only way to close.']}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>
    </Section>
  );
}
