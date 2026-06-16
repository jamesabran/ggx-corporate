import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  IconChevronRight,
  IconCreditCard,
  IconCash,
  IconWallet,
  IconTag,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import {
  computeFee,
  MOCK_PROMO_CODES,
  type BookingDraft,
  type PaymentMethod,
  type FeePayer,
} from '../../lib/basicBookingTypes';

const PAYMENT_OPTIONS: {
  key: PaymentMethod;
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: 'gcash',  label: 'GCash',          sub: 'Pay via GCash wallet',           icon: IconCreditCard },
  { key: 'cod',    label: 'Cash on Delivery', sub: 'Collect from receiver on delivery', icon: IconCash    },
  { key: 'wallet', label: 'GGX Wallet',      sub: 'Deduct from prepaid balance',    icon: IconWallet     },
];

const FEE_PAYER_OPTIONS: { key: FeePayer; label: string; sub: string }[] = [
  { key: 'sender',   label: 'Sender pays',   sub: 'Shipping fee charged to you'         },
  { key: 'receiver', label: 'Receiver pays', sub: 'Receiver settles fee on delivery'    },
];

export function BasicPaymentStep() {
  const navigate = useNavigate();
  const location = useLocation();
  const prevDraft = (location.state as { draft?: BookingDraft } | null)?.draft;

  const [method, setMethod]         = useState<PaymentMethod>(prevDraft?.paymentMethod ?? 'gcash');
  const [feePayer, setFeePayer]     = useState<FeePayer>(prevDraft?.feePayer ?? 'sender');
  const [promoCode, setPromoCode]   = useState(prevDraft?.promoCode ?? '');
  const [promoInput, setPromoInput] = useState(prevDraft?.promoCode ?? '');
  const [promoDiscount, setPromoDiscount] = useState(prevDraft?.promoDiscount ?? 0);
  const [promoStatus, setPromoStatus] = useState<'idle' | 'applied' | 'invalid'>('idle');

  if (!prevDraft?.sender || !prevDraft?.receiver) {
    navigate('/basic/deliver', { replace: true });
    return null;
  }

  const fees = computeFee({ ...prevDraft, promoDiscount });

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (MOCK_PROMO_CODES[code] !== undefined) {
      setPromoCode(code);
      setPromoDiscount(MOCK_PROMO_CODES[code]);
      setPromoStatus('applied');
    } else {
      setPromoStatus('invalid');
    }
  };

  const removePromo = () => {
    setPromoCode('');
    setPromoInput('');
    setPromoDiscount(0);
    setPromoStatus('idle');
  };

  const handleNext = () => {
    const draft: BookingDraft = {
      ...prevDraft,
      paymentMethod: method,
      feePayer,
      promoCode,
      promoDiscount,
    };
    navigate('/basic/deliver/review', { state: { draft } });
  };

  return (
    <div className="space-y-0 pb-4">
      {/* Step header */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-0.5">
          Step 5 of 6
        </p>
        <p className="text-[13px] text-gray-500 leading-snug">
          How would you like to pay?
        </p>
      </div>

      {/* Payment method */}
      <div className="bg-white mx-4 rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Payment Method
        </p>
        <div className="space-y-2.5">
          {PAYMENT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const sel = method === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setMethod(opt.key)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer',
                  sel
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400'
                    : 'border-gray-200 bg-white hover:border-gray-300',
                )}
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', sel ? 'bg-blue-100' : 'bg-gray-100')}>
                  <Icon className={cn('w-5 h-5', sel ? 'text-blue-600' : 'text-gray-400')} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-semibold', sel ? 'text-blue-900' : 'text-gray-800')}>{opt.label}</p>
                  <p className="text-xs text-gray-500">{opt.sub}</p>
                </div>
                {sel && <IconCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Who pays fees */}
      <div className="bg-white mx-4 mt-3 rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Who Pays Shipping Fees
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {FEE_PAYER_OPTIONS.map((opt) => {
            const sel = feePayer === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setFeePayer(opt.key)}
                className={cn(
                  'flex flex-col items-start gap-0.5 rounded-xl border p-3 text-left transition-all cursor-pointer',
                  sel
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400'
                    : 'border-gray-200 bg-white hover:border-gray-300',
                )}
              >
                <p className={cn('text-sm font-semibold', sel ? 'text-blue-900' : 'text-gray-800')}>{opt.label}</p>
                <p className="text-[11px] text-gray-500 leading-snug">{opt.sub}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Promo code */}
      <div className="bg-white mx-4 mt-3 rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <IconTag className="w-4 h-4 text-violet-500" />
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Promo Code</p>
        </div>

        {promoStatus === 'applied' ? (
          <div className="flex items-center gap-2 rounded-xl border border-green-300 bg-green-50 px-3 py-2.5">
            <IconCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">{promoCode}</p>
              <p className="text-[11px] text-green-600">₱{promoDiscount} off applied</p>
            </div>
            <button onClick={removePromo} className="p-1 rounded-full hover:bg-green-200 transition-colors cursor-pointer">
              <IconX className="w-3.5 h-3.5 text-green-700" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              className={cn(
                'flex-1 rounded-xl border px-3 py-2.5 text-sm uppercase placeholder:normal-case placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-400',
                promoStatus === 'invalid' ? 'border-red-400' : 'border-gray-200',
              )}
              placeholder="Enter promo code"
              value={promoInput}
              onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoStatus('idle'); }}
              onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
            />
            <Button variant="outline" size="default" onClick={applyPromo} className="flex-shrink-0">
              Apply
            </Button>
          </div>
        )}
        {promoStatus === 'invalid' && (
          <p className="mt-1 text-[11px] text-red-500">Invalid promo code. Try SULIT10, GOGO20, or FIRST15.</p>
        )}
      </div>

      {/* Fee summary */}
      <div className="bg-white mx-4 mt-3 rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Fee Summary</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-semibold text-gray-800">₱{fees.shipping}</span>
          </div>
          {fees.protection > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Item protection</span>
              <span className="font-semibold text-gray-800">₱{fees.protection}</span>
            </div>
          )}
          {fees.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Promo discount</span>
              <span className="font-semibold text-green-600">−₱{fees.discount}</span>
            </div>
          )}
          <div className="border-t border-gray-100 pt-2 flex justify-between">
            <span className="text-sm font-bold text-gray-900">Estimated total</span>
            <span className="text-base font-extrabold text-blue-600">₱{fees.total}</span>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-gray-400 leading-snug">
          Estimated only — final fees confirmed at booking.
        </p>
      </div>

      {/* CTA */}
      <div className="px-4 pt-4">
        <Button className="w-full h-12 text-base" onClick={handleNext}>
          Review Booking
          <IconChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
