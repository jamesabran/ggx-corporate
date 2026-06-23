import { useState } from 'react';
import {
  Section,
  Subsection,
  ResponsivePreview,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { CheckoutDeliveryOptions } from '../../app/components/CheckoutDeliveryOptions';
import type { DeliveryServiceType } from '../../app/services/transactionService';

const CODE = `import { CheckoutDeliveryOptions } from '@/app/components/CheckoutDeliveryOptions';

<CheckoutDeliveryOptions
  options={['standard', 'same_day', 'on_demand']}
  value={value}
  onChange={setValue}
  region="metro"
  metroOnly={isMetroManila(address)}
/>`;

export function CheckoutDeliveryOptionsSection() {
  const [metro, setMetro] = useState<DeliveryServiceType>('standard');
  const [province, setProvince] = useState<DeliveryServiceType>('standard');

  return (
    <Section
      id="checkout-delivery-options"
      title="Checkout Delivery Options"
      intro="The buyer-facing delivery-option picker on public checkout. Buyers see friendly timing labels (never internal service keys). Same-day and On-demand are Metro-Manila-only — shown disabled elsewhere."
    >
      <ImplementationMeta id="checkout-delivery-options" note="The caller decides which options to pass (e.g. On-demand only when the seller has the add-on) and whether the address is Metro Manila." />

      <Subsection title="Metro Manila — all options" description="Same-day / On-demand selectable.">
        <ResponsivePreview defaultView="mobile">
          <CheckoutDeliveryOptions
            options={['standard', 'same_day', 'on_demand']}
            value={metro}
            onChange={setMetro}
            region="metro"
            metroOnly
          />
        </ResponsivePreview>
      </Subsection>

      <Subsection title="Outside Metro Manila" description="Same-day / On-demand shown disabled with clear copy; selection falls back to Standard.">
        <ResponsivePreview defaultView="mobile">
          <CheckoutDeliveryOptions
            options={['standard', 'same_day', 'on_demand']}
            value={province}
            onChange={setProvince}
            region="luzon"
            metroOnly={false}
          />
        </ResponsivePreview>
      </Subsection>

      <AccessibilityNotes
        items={[
          'Each option is a native <button>; disabled options set the native disabled attribute and are skipped in the tab order.',
          'Selected state shows an accent border + tint, not color alone.',
          'Disabled options keep a visible reason ("Available for Metro Manila deliveries only.").',
        ]}
      />

      <Subsection title="Usage">
        <DoDont
          dos={['Show buyers timing/value labels, never STD/SDD/OD keys.', 'Only pass options the seller scope actually offers.', 'Fall back to Standard when the address can’t use Same-day/On-demand.']}
          donts={['Don’t expose a delivery-fee-payer control to buyers.', 'Don’t hide why an option is unavailable.', 'Don’t offer On-demand without the seller add-on enabled.']}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
      </Subsection>
    </Section>
  );
}
