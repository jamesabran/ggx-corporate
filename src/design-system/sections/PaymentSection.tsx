import { useState } from 'react';
import { IconCash, IconWallet, IconCreditCard, IconReceipt2, IconBuildingBank } from '@tabler/icons-react';
import { Section, Subsection, PreviewBox, CodeBlock, DoDont, SourceNote } from '../components/DocPrimitives';
import { PaymentOptionCard } from '../components/PaymentOptionCard';

const CODE = `import { PaymentOptionCard } from '@/design-system/components/PaymentOptionCard';
import { IconCash } from '@tabler/icons-react';

<PaymentOptionCard
  icon={IconCash}
  title="Cash on pickup"
  description="Hand cash to the rider at pickup."
  state={selected === 'cash' ? 'selected' : 'available'}
  onSelect={() => setSelected('cash')}
/>`;

function DefaultTag() {
  return (
    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">Default</span>
  );
}

export function PaymentSection() {
  const [selected, setSelected] = useState('cash');

  return (
    <Section
      id="payment-option-card"
      title="Payment Option Card"
      intro="A composed pattern for choosing how a delivery is paid. It renders one payment method as a selectable row in one of four states: selected, available, unavailable, or coming soon."
    >
      <Subsection title="States">
        <PreviewBox className="grid gap-2 sm:max-w-md">
          <PaymentOptionCard icon={IconCash} title="Cash on pickup" description="Hand cash to the rider at pickup." state="selected" />
          <PaymentOptionCard icon={IconWallet} title="E-wallet" description="GCash, Maya, and more." state="available" />
          <PaymentOptionCard icon={IconCreditCard} title="Card" description="Visa or Mastercard." state="coming_soon" />
          <PaymentOptionCard icon={IconBuildingBank} title="Online banking" state="unavailable" />
        </PreviewBox>
      </Subsection>

      <Subsection title="Anatomy" description="Radio indicator · method icon · title (+ optional tag) · concise supporting line · trailing state chip when disabled.">
        <PreviewBox className="sm:max-w-md">
          <PaymentOptionCard icon={IconReceipt2} title="Pay via billing" description="Invoiced to your account after the service." state="selected" trailing={<DefaultTag />} />
        </PreviewBox>
      </Subsection>

      <Subsection title="Sender booking — interactive" description="A sender choosing how they pay. Eligible billing accounts see billing as a normal default option.">
        <PreviewBox className="grid gap-2 sm:max-w-md">
          <PaymentOptionCard
            icon={IconReceipt2}
            title="Pay via billing"
            description="Invoiced to your account after the service."
            state={selected === 'billing' ? 'selected' : 'available'}
            trailing={selected === 'billing' ? undefined : <DefaultTag />}
            onSelect={() => setSelected('billing')}
          />
          <PaymentOptionCard
            icon={IconCash}
            title="Cash on pickup"
            description="Hand cash to the rider at pickup."
            state={selected === 'cash' ? 'selected' : 'available'}
            onSelect={() => setSelected('cash')}
          />
          <PaymentOptionCard
            icon={IconWallet}
            title="E-wallet"
            description="GCash, Maya, and more."
            state={selected === 'ewallet' ? 'selected' : 'available'}
            onSelect={() => setSelected('ewallet')}
          />
        </PreviewBox>
      </Subsection>

      <Subsection title="Buyer checkout" description="A buyer paying at checkout. No billing, and no delivery-fee-payer control — that is a sender-side concern only.">
        <PreviewBox className="grid gap-2 sm:max-w-md">
          <PaymentOptionCard icon={IconCash} title="Cash on delivery" description="Pay when your order arrives." state="selected" />
          <PaymentOptionCard icon={IconWallet} title="E-wallet" description="GCash, Maya, and more." state="coming_soon" />
        </PreviewBox>
      </Subsection>

      <Subsection title="Rules">
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-gray-700">
          <li>Show only payment methods actually available to the user.</li>
          <li>Don’t mention billing or other special arrangements unless they’re enabled for that account.</li>
          <li>For eligible accounts, billing appears as a normal available/default option — not a special callout.</li>
          <li>Buyer checkout must not show a delivery-fee-payer control.</li>
          <li>Sender booking may include fee-responsibility rules where applicable.</li>
          <li>Don’t make early booking screens payment-heavy — keep payment late and light.</li>
          <li>Keep labels concise; avoid unnecessary explanatory copy.</li>
        </ul>
      </Subsection>

      <Subsection title="Content guidance">
        <DoDont
          dos={[
            'Lead with the method name; keep the supporting line to one short sentence.',
            'Surface billing as "Default" only for accounts where it is enabled.',
            'Disable (not hide) a method that exists but isn’t ready, labelled "Coming soon".',
          ]}
          donts={[
            'Don’t list methods the account can’t use.',
            'Don’t add fee-payer toggles to buyer checkout.',
            'Don’t front-load booking with a wall of payment options.',
          ]}
        />
      </Subsection>

      <Subsection title="Code">
        <CodeBlock code={CODE} />
        <div className="mt-3 space-y-1">
          <SourceNote path="src/design-system/components/PaymentOptionCard.tsx" />
          <p className="text-xs text-gray-400">
            Related: <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-gray-600">components/PaymentMethodTabs.tsx</code> (the live booking payment surface).
          </p>
        </div>
      </Subsection>
    </Section>
  );
}
