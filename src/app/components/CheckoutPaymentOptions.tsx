/**
 * Buyer-facing payment options for the public checkout. Aligned with the bulk
 * uploader payment model where it makes sense for a buyer: Cash on Delivery is
 * the only live method (online/prepaid is shown as coming soon), plus who covers
 * the delivery fee (buyer pays vs seller absorbs). Operational fields stay out.
 */
import { IconCash, IconCreditCard, IconCheck } from '@tabler/icons-react';

export type DeliveryFeePayer = 'buyer' | 'seller';

export function CheckoutPaymentOptions({
  feePayer,
  onFeePayerChange,
}: {
  feePayer: DeliveryFeePayer;
  onFeePayerChange: (v: DeliveryFeePayer) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900">Payment options</h2>

      {/* Payment method */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1.5">Payment method</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500 bg-emerald-50 px-3 py-2.5">
            <IconCash className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-800">Cash on Delivery (COD)</p>
              <p className="text-xs text-emerald-700">Pay in cash when your parcel arrives.</p>
            </div>
            <IconCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 opacity-70">
            <IconCreditCard className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-500">Online payment / prepaid</p>
              <p className="text-xs text-gray-400">Card &amp; e-wallet checkout — coming soon.</p>
            </div>
            <span className="text-[11px] font-medium text-gray-400 bg-gray-200 rounded-full px-2 py-0.5 flex-shrink-0">Coming soon</span>
          </div>
        </div>
      </div>

      {/* Delivery fee handling */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-1.5">Delivery fee</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <FeeOption
            selected={feePayer === 'buyer'}
            onClick={() => onFeePayerChange('buyer')}
            title="Buyer pays delivery fee"
            blurb="Added to your COD total."
          />
          <FeeOption
            selected={feePayer === 'seller'}
            onClick={() => onFeePayerChange('seller')}
            title="Seller absorbs delivery fee"
            blurb="You only pay for the items."
          />
        </div>
      </div>
    </div>
  );
}

function FeeOption({
  selected, onClick, title, blurb,
}: { selected: boolean; onClick: () => void; title: string; blurb: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${
        selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
      }`}
    >
      <span className="block text-sm font-medium leading-tight">{title}</span>
      <span className={`block text-xs ${selected ? 'opacity-80' : 'text-gray-500'}`}>{blurb}</span>
    </button>
  );
}
