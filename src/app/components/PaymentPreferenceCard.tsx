import { useState } from 'react';
import { IconCreditCard } from '@tabler/icons-react';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';

/**
 * DEMO-ONLY — Bulk Upload "Payment preference" card.
 *
 * Keeps payment acknowledged early in the Bulk Upload journey without turning
 * this page into a checkout step. It is a compact, read-only summary of the
 * default payment method; full payment selection still happens later during
 * batch review / final confirmation.
 *
 * The "Demo" segmented control is a stakeholder-demo affordance only. It changes
 * the *displayed* state of this card and nothing else — no booking, upload,
 * totals, validation, or downstream payment behavior depends on it.
 *
 * To remove the demo behavior later: delete this file (and its single usage in
 * `BulkUploader.tsx`), or strip `DemoScenario`, the `scenario` state, the
 * `SCENARIOS` map, and the segmented control to hard-code a single state.
 */

type DemoScenario = 'standard' | 'billing';

interface ScenarioContent {
  /** Main payment method shown next to the Default badge. */
  method: string;
  /** One-line helper text under the method. */
  helper: string;
  /** Supporting line listing other options available during review. */
  supporting: string;
}

const SCENARIOS: Record<DemoScenario, ScenarioContent> = {
  standard: {
    method: 'Cash',
    helper: 'You can change this during review.',
    supporting: 'Other available options during review: E-wallets, Card, Online banking.',
  },
  billing: {
    method: 'Pay via billing',
    helper: 'You can change this before final confirmation.',
    supporting:
      'Other payment options available during review: Cash, E-wallets, Card, Online banking.',
  },
};

const DEMO_OPTIONS: { key: DemoScenario; label: string }[] = [
  { key: 'standard', label: 'Standard account' },
  { key: 'billing', label: 'Billing account' },
];

export function PaymentPreferenceCard() {
  const [scenario, setScenario] = useState<DemoScenario>('standard');
  const content = SCENARIOS[scenario];

  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        {/* Payment summary + right-aligned action */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <IconCreditCard className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">Payment preference</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{content.method}</span>
                <Badge variant="info">Default</Badge>
              </div>
              <p className="mt-1 text-xs text-gray-500">{content.helper}</p>
            </div>
          </div>
          <button
            type="button"
            className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Change later
          </button>
        </div>

        {/* Subtle divider */}
        <div className="my-3 border-t border-gray-100" />

        {/* Supporting line — other options available during review */}
        <p className="text-xs text-gray-500">{content.supporting}</p>

        {/* Demo-only scenario switcher (secondary, must not compete with summary) */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
            Demo
          </span>
          <div
            className="inline-flex rounded-md border border-gray-200 bg-gray-50 p-0.5"
            role="group"
            aria-label="Demo account scenario (preview only)"
          >
            {DEMO_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setScenario(key)}
                aria-pressed={scenario === key}
                className={cn(
                  'rounded px-2 py-0.5 text-[11px] font-medium transition-colors',
                  scenario === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
