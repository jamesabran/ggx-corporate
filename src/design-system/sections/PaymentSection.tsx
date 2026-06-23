import {
  Section,
  Subsection,
  ResponsivePreview,
  CodeBlock,
  DoDont,
  ImplementationMeta,
  AccessibilityNotes,
} from '../components/DocPrimitives';
import { PaymentMethodTabs } from '../../app/components/PaymentMethodTabs';
import { CheckoutPaymentOptions } from '../../app/components/CheckoutPaymentOptions';

const SENDER_CODE = `import { PaymentMethodTabs } from '@/app/components/PaymentMethodTabs';

// Eligible (billing-enabled) account — billing is the default option:
<PaymentMethodTabs
  billingAvailable
  onPaymentMethodChange={(method) => setMethod(method)}
/>

// Standard account — Cash / E-wallets / Card / Online banking only:
<PaymentMethodTabs onPaymentMethodChange={(method) => setMethod(method)} />`;

const BUYER_CODE = `import { CheckoutPaymentOptions } from '@/app/components/CheckoutPaymentOptions';

// Buyer checkout — no props, no fee-payer control. Cash on Delivery is the
// only live method; the rest are shown as "coming soon".
<CheckoutPaymentOptions />`;

export function PaymentSection() {
  return (
    <Section
      id="payment-option-card"
      title="Payment Options"
      intro="How a delivery is paid for. Sender booking and buyer checkout use different, real components — they are not one generic card. Both are documented and previewed from their production source."
    >
      {/* ── Sender booking variant ─────────────────────────────────────────── */}
      <Subsection
        title="Sender booking — PaymentMethodTabs"
        description="Used when the account holder books and pays. Eligible (billing-enabled) accounts get billing as the default; everyone gets Cash / E-wallets / Card / Online banking. May carry fee-responsibility logic upstream."
      >
        <ImplementationMeta
          id="payment-sender"
          note="The previews render this exact component. billingAvailable is contract-driven — only pass it for eligible accounts."
        />
        <ResponsivePreview>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-gray-500">Eligible account (billingAvailable)</p>
              <PaymentMethodTabs billingAvailable />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-gray-500">Standard account</p>
              <PaymentMethodTabs />
            </div>
          </div>
        </ResponsivePreview>
        <CodeBlock code={SENDER_CODE} />
      </Subsection>

      {/* ── Buyer checkout variant ─────────────────────────────────────────── */}
      <Subsection
        title="Buyer checkout — CheckoutPaymentOptions"
        description="Used at public checkout when a buyer pays. No billing and no delivery-fee-payer control — who covers the fee is seller/store configuration, not a buyer choice."
      >
        <ImplementationMeta
          id="payment-buyer"
          note="Cash on Delivery is the only live method; other tabs are present but disabled (coming soon)."
        />
        <ResponsivePreview defaultView="mobile">
          <CheckoutPaymentOptions />
        </ResponsivePreview>
        <CodeBlock code={BUYER_CODE} />
      </Subsection>

      {/* ── Shared rules ──────────────────────────────────────────────────── */}
      <Subsection title="Rules">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-gray-700">
          <li>Show only payment methods actually available to the user.</li>
          <li>Don’t mention billing unless it is enabled for that account.</li>
          <li>For eligible accounts, billing appears as a normal default option — not a special callout.</li>
          <li>Buyer checkout must not expose a delivery-fee-payer control.</li>
          <li>Sender booking may include fee-responsibility logic where applicable.</li>
          <li>Don’t make early booking screens payment-heavy — keep payment late and light.</li>
          <li>Keep supporting copy concise.</li>
        </ul>
      </Subsection>

      <AccessibilityNotes
        items={[
          'Options and tabs are native <button>s — reachable by Tab and activated with Enter/Space.',
          'Unavailable / coming-soon methods set the native disabled attribute and are skipped in the tab order.',
          'Selected state is shown with both a filled radio/active tab and color — not color alone.',
          'In sender booking, the normal payment card is disabled until "Other payment options" is chosen, so focus stays on the active choice.',
        ]}
      />

      <Subsection title="Content guidance">
        <DoDont
          dos={[
            'Lead with the method name; keep the supporting line to one short sentence.',
            'Surface billing as the default only for accounts where it is enabled.',
            'Disable (not hide) a method that exists but isn’t ready, labelled "coming soon".',
          ]}
          donts={[
            'Don’t list methods the account can’t use.',
            'Don’t add a fee-payer toggle to buyer checkout.',
            'Don’t front-load booking with a wall of payment options.',
          ]}
        />
      </Subsection>
    </Section>
  );
}
