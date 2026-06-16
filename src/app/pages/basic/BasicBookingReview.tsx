import { useNavigate, useLocation } from 'react-router';
import {
  IconEdit,
  IconMapPin,
  IconPackage,
  IconShieldCheck,
  IconCreditCard,
  IconCash,
  IconWallet,
  IconTruckDelivery,
  IconBuildingStore,
  IconTag,
} from '@tabler/icons-react';
import { Button } from '../../components/ui/Button';
import {
  computeFee,
  POUCH_OPTIONS,
  type BookingDraft,
} from '../../lib/basicBookingTypes';

function ReviewSection({
  title,
  editHref,
  editState,
  children,
}: {
  title: string;
  editHref: string;
  editState: object;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{title}</p>
        <button
          onClick={() => navigate(editHref, { state: editState })}
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
        >
          <IconEdit className="w-3.5 h-3.5" /> Edit
        </button>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

function AddressBlock({ label, addr }: { label: string; addr: BookingDraft['sender'] }) {
  if (!addr) return null;
  const line = [addr.street, addr.unit, addr.barangay, addr.city, addr.province].filter(Boolean).join(', ');
  return (
    <div className="flex items-start gap-2.5">
      <IconMapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{addr.name} · {addr.mobile}</p>
        <p className="text-xs text-gray-500 leading-snug">{line}</p>
      </div>
    </div>
  );
}

const PAYMENT_LABELS: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  gcash:  { label: 'GCash',            icon: IconCreditCard },
  cod:    { label: 'Cash on Delivery', icon: IconCash       },
  wallet: { label: 'GGX Wallet',       icon: IconWallet     },
};

export function BasicBookingReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const draft = (location.state as { draft?: BookingDraft } | null)?.draft;

  if (!draft?.sender || !draft?.receiver) {
    navigate('/basic/deliver', { replace: true });
    return null;
  }

  const fees    = computeFee(draft);
  const pouch   = POUCH_OPTIONS.find((p) => p.key === draft.pouchSize);
  const payment = PAYMENT_LABELS[draft.paymentMethod] ?? PAYMENT_LABELS.gcash;
  const PayIcon = payment.icon;

  const handleBook = () => {
    navigate('/basic/deliver/success', { state: { draft } });
  };

  return (
    <div className="space-y-0 pb-4">
      {/* Step header */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-0.5">
          Step 6 of 6 — Final Review
        </p>
        <p className="text-[13px] text-gray-500 leading-snug">
          Review everything before confirming.
        </p>
      </div>

      <div className="px-4 space-y-3">
        {/* Addresses */}
        <ReviewSection
          title="Delivery Route"
          editHref="/basic/deliver/summary"
          editState={{ draft }}
        >
          <div className="space-y-3">
            <AddressBlock label="Sender" addr={draft.sender} />
            <AddressBlock label="Receiver" addr={draft.receiver} />
            <div className="flex items-center gap-2.5 pt-1 border-t border-gray-50">
              {draft.firstMile === 'pickup'
                ? <IconTruckDelivery className="w-4 h-4 text-gray-400" />
                : <IconBuildingStore className="w-4 h-4 text-gray-400" />
              }
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Collection method</p>
                <p className="text-sm font-semibold text-gray-900">
                  {draft.firstMile === 'pickup' ? 'Rider Pick-up' : 'Drop-off at hub'}
                </p>
              </div>
            </div>
          </div>
        </ReviewSection>

        {/* Item details */}
        <ReviewSection
          title="Item Details"
          editHref="/basic/deliver/items"
          editState={{ draft }}
        >
          <div className="space-y-2">
            <div className="flex items-start gap-2.5">
              <IconPackage className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{draft.itemName}</p>
                <p className="text-xs text-gray-500">
                  {pouch?.label} · {pouch?.dims} · max {pouch?.maxWt}
                </p>
              </div>
            </div>
            {draft.cod && (
              <div className="flex items-center gap-2.5">
                <IconCash className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">COD Amount</p>
                  <p className="text-sm font-semibold text-gray-900">₱{Number(draft.codAmount).toLocaleString()}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <IconShieldCheck className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Item Protection</p>
                <p className="text-sm font-semibold text-gray-900">
                  {draft.itemProtection === 'free'
                    ? 'Free — ₱500 coverage'
                    : `Full — 100% of ₱${draft.declaredValue || '0'}`}
                </p>
              </div>
            </div>
          </div>
        </ReviewSection>

        {/* Payment */}
        <ReviewSection
          title="Payment"
          editHref="/basic/deliver/payment"
          editState={{ draft }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <PayIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Method</p>
                <p className="text-sm font-semibold text-gray-900">
                  {payment.label} · {draft.feePayer === 'sender' ? 'Paid by sender' : 'Paid by receiver'}
                </p>
              </div>
            </div>
            {draft.promoCode && (
              <div className="flex items-center gap-2.5">
                <IconTag className="w-4 h-4 text-violet-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Promo</p>
                  <p className="text-sm font-semibold text-green-700">{draft.promoCode} · −₱{draft.promoDiscount}</p>
                </div>
              </div>
            )}
          </div>
        </ReviewSection>

        {/* Amount to pay */}
        <div className="bg-blue-600 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-blue-200 uppercase tracking-widest">Estimated total</p>
              <p className="text-3xl font-extrabold text-white mt-0.5">₱{fees.total}</p>
              {fees.protection > 0 && (
                <p className="text-[11px] text-blue-200 mt-0.5">
                  Includes ₱{fees.protection} protection fee
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-blue-200">STANDARD DELIVERY</p>
              <p className="text-xs text-blue-200 mt-0.5">1–5 business days</p>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-blue-300 leading-snug">
            Estimated only — final fees confirmed by GoGo Xpress at booking.
          </p>
        </div>

        {/* CTA */}
        <Button
          className="w-full h-14 text-base font-bold"
          style={{ background: '#1e8fd6' }}
          onClick={handleBook}
        >
          Book Now
        </Button>

        <Button
          variant="ghost"
          className="w-full h-11 text-gray-500"
          onClick={() => navigate(-1)}
        >
          Go back
        </Button>
      </div>
    </div>
  );
}
