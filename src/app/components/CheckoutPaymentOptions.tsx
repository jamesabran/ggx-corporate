/**
 * Buyer-facing payment options for the public checkout. Tabbed UI matching the
 * app's payment pattern (Cash/COD · E-wallets · Card · Online banking). Only Cash
 * on Delivery is live today; the other methods are shown but disabled / coming
 * soon so the UI is ready for future support without being functional.
 *
 * The buyer does NOT choose who covers the delivery fee — that is seller/store
 * configuration, not a buyer-facing control.
 */
import { IconCash, IconWallet, IconCreditCard, IconBuildingBank } from '@tabler/icons-react';

type Tab = 'cash' | 'ewallet' | 'card' | 'banking';

const TABS: { id: Tab; label: string; icon: React.ReactNode; available: boolean }[] = [
  { id: 'cash',    label: 'Cash / COD',     icon: <IconCash className="w-4 h-4" />,         available: true },
  { id: 'ewallet', label: 'E-wallets',      icon: <IconWallet className="w-4 h-4" />,       available: false },
  { id: 'card',    label: 'Card',           icon: <IconCreditCard className="w-4 h-4" />,   available: false },
  { id: 'banking', label: 'Online banking', icon: <IconBuildingBank className="w-4 h-4" />, available: false },
];

export function CheckoutPaymentOptions() {
  // Cash/COD is the only live method, so it stays selected. Other tabs are
  // present but disabled (coming soon) — kept ready for future support.
  const active: Tab = 'cash';

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-gray-900">Payment options</h2>

      <div className="rounded-lg border border-gray-200">
        {/* Tab row */}
        <div className="flex bg-gray-50 rounded-t-lg overflow-hidden border-b border-gray-200 overflow-x-auto">
          {TABS.map((t) => {
            const selected = active === t.id;
            return (
              <button
                key={t.id}
                type="button"
                disabled={!t.available}
                title={t.available ? undefined : 'Coming soon'}
                className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  selected
                    ? 'border-blue-600 text-blue-700 bg-white'
                    : 'border-transparent text-gray-400 cursor-not-allowed'
                }`}
              >
                {t.icon}
                {t.label}
                {!t.available && (
                  <span className="ml-1 rounded-full bg-gray-200 px-1.5 py-0.5 text-[9px] font-medium text-gray-500">Soon</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4">
          <div className="flex items-start gap-3 rounded-lg border border-emerald-500 bg-emerald-50 px-3 py-2.5">
            <IconCash className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-emerald-800">Cash on Delivery (COD)</p>
              <p className="text-xs text-emerald-700">Pay in cash when your parcel arrives. No prepayment needed.</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            E-wallets, card, and online banking are coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}
