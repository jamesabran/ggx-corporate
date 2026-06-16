import { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  IconChevronLeft,
  IconChevronRight,
  IconTruckDelivery,
  IconBuildingStore,
  IconShieldCheck,
  IconShieldFilled,
  IconTag,
  IconCheck,
  IconX,
  IconPlus,
  IconCreditCard,
  IconWallet,
  IconInfoCircle,
  IconCash,
} from '@tabler/icons-react';
import {
  computeFee,
  MOCK_PROMO_CODES,
  POUCH_OPTIONS,
  type BookingDraft,
  type FeePayer,
  type FirstMile,
  type ItemProtection,
  type PaymentMethod,
  type PouchSize,
} from '../../lib/basicBookingTypes';
import { BasicGlassCard } from '../../components/basic/BasicGlassCard';
import { cn } from '../../lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function addrLine(a: BookingDraft['sender']): string {
  if (!a) return '—';
  return [a.street, a.unit, a.barangay, a.city, a.province].filter(Boolean).join(', ');
}

// ── Route summary ─────────────────────────────────────────────────────────────

function RouteCard({
  draft,
  onEditSender,
  onEditReceiver,
}: {
  draft: BookingDraft;
  onEditSender: () => void;
  onEditReceiver: () => void;
}) {
  const { sender, receiver } = draft;
  return (
    <BasicGlassCard className="p-4">
      {/* Sender row */}
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center flex-shrink-0 mt-1">
          <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-blue-100" />
          <div className="w-0.5 h-6 bg-gray-200/80 mt-1" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Sender</p>
          <p className="text-sm font-semibold text-gray-900 leading-snug truncate">
            {sender?.name ?? '—'} · {sender?.mobile ?? ''}
          </p>
          <p className="text-xs text-gray-500 truncate leading-snug">{addrLine(sender)}</p>
        </div>
        <button
          onClick={onEditSender}
          className="text-[11px] font-semibold text-blue-600 flex-shrink-0 cursor-pointer hover:text-blue-800 mt-0.5"
        >
          Edit
        </button>
      </div>

      {/* Receiver row */}
      <div className="flex items-start gap-3 mt-1">
        <div className="flex flex-col items-center flex-shrink-0 mt-1">
          <div className="w-3 h-3 rounded-full border-2 border-red-400 bg-red-100" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none mb-0.5">Receiver</p>
          <p className="text-sm font-semibold text-gray-900 leading-snug truncate">
            {receiver?.name ?? '—'} · {receiver?.mobile ?? ''}
          </p>
          <p className="text-xs text-gray-500 truncate leading-snug">{addrLine(receiver)}</p>
        </div>
        <button
          onClick={onEditReceiver}
          className="text-[11px] font-semibold text-blue-600 flex-shrink-0 cursor-pointer hover:text-blue-800 mt-0.5"
        >
          Edit
        </button>
      </div>
    </BasicGlassCard>
  );
}

// ── First mile selector ───────────────────────────────────────────────────────

function FirstMileCard({ value, onChange }: { value: FirstMile; onChange: (v: FirstMile) => void }) {
  return (
    <BasicGlassCard className="p-4">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
        How we collect
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {([
          { key: 'pickup'  as FirstMile, label: 'Rider Pick-up', sub: 'We collect from you',          badge: undefined, Icon: IconTruckDelivery },
          { key: 'dropoff' as FirstMile, label: 'Drop-off',       sub: 'At the nearest hub', badge: 'New',     Icon: IconBuildingStore },
        ]).map(({ key, label, sub, badge, Icon }) => {
          const sel = value === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={cn(
                'relative flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition-all cursor-pointer',
                sel
                  ? 'border-blue-400 bg-white/80 ring-1 ring-blue-300'
                  : 'border-white/60 bg-white/30 hover:bg-white/50',
              )}
            >
              {badge && (
                <span className="absolute top-2 right-2 text-[9px] font-bold bg-green-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                  {badge}
                </span>
              )}
              <Icon className={cn('w-5 h-5', sel ? 'text-blue-600' : 'text-gray-400')} />
              <p className={cn('text-sm font-semibold leading-snug', sel ? 'text-blue-900' : 'text-gray-800')}>
                {label}
              </p>
              <p className="text-[10px] text-gray-500 leading-snug">{sub}</p>
            </button>
          );
        })}
      </div>
    </BasicGlassCard>
  );
}

// ── Item details ──────────────────────────────────────────────────────────────

interface ItemState {
  itemName: string;
  pouchSize: PouchSize;
  cod: boolean;
  codAmount: string;
  itemProtection: ItemProtection;
}

function ItemDetailsCard({
  state,
  onChange,
  errors,
  forceExpand,
}: {
  state: ItemState;
  onChange: (patch: Partial<ItemState>) => void;
  errors: Partial<Record<string, boolean>>;
  forceExpand?: boolean;
}) {
  const [expanded, setExpanded] = useState(!state.itemName);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (forceExpand) setExpanded(true);
  }, [forceExpand]);

  const scrollPouch = (dir: -1 | 1) =>
    carouselRef.current?.scrollBy({ left: dir * 148, behavior: 'smooth' });

  const protectionFee =
    state.itemProtection === 'full' && state.cod
      ? Math.round(Math.max(Number(state.codAmount) - 500, 0) * 0.01)
      : 0;

  const summary = state.itemName
    ? `${state.itemName} · ${POUCH_OPTIONS.find((p) => p.key === state.pouchSize)?.label ?? ''}`
    : null;

  return (
    <BasicGlassCard>
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <IconPlus
            className={cn(
              'w-4 h-4 transition-transform',
              expanded ? 'rotate-45 text-blue-500' : 'text-gray-400',
            )}
          />
          <div>
            <p className="text-sm font-semibold text-gray-900 text-left">Item Details</p>
            {!expanded && summary && (
              <p className="text-xs text-gray-500 leading-snug text-left">{summary}</p>
            )}
            {!expanded && !summary && (
              <p className="text-xs text-blue-500 text-left">Tap to add item details</p>
            )}
          </div>
        </div>
        <IconChevronRight
          className={cn('w-4 h-4 text-gray-400 transition-transform', expanded && 'rotate-90')}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/50">
          {/* Item name */}
          <div className="pt-3">
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
              Item name <span className="text-red-400">*</span>
            </label>
            <input
              className={cn(
                'w-full rounded-xl border bg-white/70 px-3 py-2.5 text-sm placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400',
                errors.itemName ? 'border-red-400' : 'border-white/60',
              )}
              placeholder="e.g. Nike Shoes, Samsung Phone"
              value={state.itemName}
              onChange={(e) => onChange({ itemName: e.target.value })}
            />
            {errors.itemName && <p className="mt-0.5 text-[10px] text-red-400">Required</p>}
          </div>

          {/* Pouch size carousel */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                Pouch / Box Size
              </label>
              <div className="flex gap-1">
                <button onClick={() => scrollPouch(-1)} className="w-6 h-6 rounded-full bg-white/60 flex items-center justify-center cursor-pointer">
                  <IconChevronLeft className="w-3.5 h-3.5 text-gray-500" />
                </button>
                <button onClick={() => scrollPouch(1)} className="w-6 h-6 rounded-full bg-white/60 flex items-center justify-center cursor-pointer">
                  <IconChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
            </div>
            <div
              ref={carouselRef}
              className="flex gap-2 overflow-x-auto scrollbar-none"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {POUCH_OPTIONS.map((opt) => {
                const sel = state.pouchSize === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => onChange({ pouchSize: opt.key })}
                    style={{ scrollSnapAlign: 'start' }}
                    className={cn(
                      'flex flex-col items-center flex-shrink-0 w-[128px] rounded-2xl border p-2.5 transition-all cursor-pointer',
                      sel
                        ? 'border-blue-400 bg-white/90 ring-1 ring-blue-300'
                        : 'border-white/50 bg-white/30 hover:bg-white/60',
                    )}
                  >
                    <span className="text-xl mb-1">📦</span>
                    <p className={cn('text-xs font-bold text-center leading-snug', sel ? 'text-blue-800' : 'text-gray-700')}>
                      {opt.label}
                    </p>
                    <p className="text-[9px] text-gray-400 text-center">{opt.dims}</p>
                    <p className="text-[9px] text-gray-400 text-center">Max {opt.maxWt}</p>
                    <p className={cn('mt-1.5 text-sm font-bold', sel ? 'text-blue-700' : 'text-gray-600')}>
                      ₱{opt.price}
                    </p>
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[10px] text-gray-400 leading-snug">
              Rider provides your waybill and pouch on pick-up.
            </p>
          </div>

          {/* COD toggle */}
          <div className={cn(
            'rounded-2xl border p-3.5',
            state.cod ? 'border-blue-300/60 bg-blue-50/60' : 'border-white/50 bg-white/30',
          )}>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={state.cod}
                onChange={(e) => onChange({ cod: e.target.checked, codAmount: e.target.checked ? state.codAmount : '' })}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">Cash on Delivery (COD)</p>
                <p className="text-[10px] text-gray-500 leading-snug">Our rider collects payment when delivering your item</p>
              </div>
            </label>
            {state.cod && (
              <div className="mt-2.5">
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                  COD amount <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">₱</span>
                  <input
                    className={cn(
                      'w-full rounded-xl border bg-white/70 pl-7 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400',
                      errors.codAmount ? 'border-red-400' : 'border-white/60',
                    )}
                    inputMode="numeric"
                    placeholder="0.00"
                    value={state.codAmount}
                    onChange={(e) => onChange({ codAmount: e.target.value })}
                  />
                </div>
                {errors.codAmount && <p className="mt-0.5 text-[10px] text-red-400">Enter COD amount</p>}
              </div>
            )}
          </div>

          {/* Item protection */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Item Protection</p>
              <IconInfoCircle className="w-3 h-3 text-gray-300" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onChange({ itemProtection: 'free' })}
                className={cn(
                  'flex-1 flex items-center gap-2 rounded-xl border p-2.5 cursor-pointer transition-all',
                  state.itemProtection === 'free'
                    ? 'border-blue-400 bg-white/80 ring-1 ring-blue-300'
                    : 'border-white/50 bg-white/30 hover:bg-white/50',
                )}
              >
                <IconShieldCheck className={cn('w-4 h-4 flex-shrink-0', state.itemProtection === 'free' ? 'text-blue-600' : 'text-gray-400')} />
                <div>
                  <p className="text-xs font-semibold text-left text-gray-800">Free</p>
                  <p className="text-[9px] text-gray-500 text-left leading-snug">Up to ₱500</p>
                </div>
              </button>
              <button
                onClick={() => state.cod ? onChange({ itemProtection: 'full' }) : undefined}
                disabled={!state.cod}
                className={cn(
                  'flex-1 flex items-center gap-2 rounded-xl border p-2.5 transition-all',
                  !state.cod
                    ? 'border-gray-100 bg-gray-50/50 opacity-50 cursor-not-allowed'
                    : state.itemProtection === 'full'
                    ? 'border-blue-400 bg-white/80 ring-1 ring-blue-300 cursor-pointer'
                    : 'border-white/50 bg-white/30 hover:bg-white/50 cursor-pointer',
                )}
              >
                <IconShieldFilled className={cn('w-4 h-4 flex-shrink-0', state.itemProtection === 'full' && state.cod ? 'text-blue-600' : 'text-gray-400')} />
                <div>
                  <p className="text-xs font-semibold text-left text-gray-800">Full</p>
                  <p className="text-[9px] text-gray-500 text-left leading-snug">
                    {state.cod
                      ? protectionFee > 0
                        ? `₱${protectionFee} fee`
                        : '1% above ₱500'
                      : 'Requires COD'}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </BasicGlassCard>
  );
}

// ── Shipping & payment ────────────────────────────────────────────────────────

interface ShippingState {
  feePayer: FeePayer;
  paymentMethod: PaymentMethod;
}

function ShippingPaymentCard({
  state,
  onChange,
}: {
  state: ShippingState;
  onChange: (patch: Partial<ShippingState>) => void;
}) {
  const senderPays = state.feePayer === 'sender';

  return (
    <BasicGlassCard className="p-4 space-y-3.5">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
        Shipping Fee
      </p>

      {/* Fee payer toggle */}
      <div className="grid grid-cols-2 gap-2">
        {([
          { key: 'sender',   label: 'Sender pays',   sub: 'Paid upfront'         },
          { key: 'receiver', label: 'Receiver pays',  sub: 'Collected at delivery' },
        ] as const).map(({ key, label, sub }) => {
          const sel = state.feePayer === key;
          return (
            <button
              key={key}
              onClick={() => {
                onChange({
                  feePayer: key,
                  // Reset payment method to default when switching to sender
                  paymentMethod: key === 'sender' ? 'gcash' : state.paymentMethod,
                });
              }}
              className={cn(
                'flex flex-col items-start gap-0.5 rounded-2xl border p-3 cursor-pointer transition-all text-left',
                sel
                  ? 'border-blue-400 bg-white/80 ring-1 ring-blue-300'
                  : 'border-white/60 bg-white/30 hover:bg-white/50',
              )}
            >
              <p className={cn('text-sm font-semibold', sel ? 'text-blue-900' : 'text-gray-800')}>{label}</p>
              <p className="text-[10px] text-gray-500 leading-snug">{sub}</p>
            </button>
          );
        })}
      </div>

      {/* Conditional: payment method (sender pays only) */}
      {senderPays ? (
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Payment Method
          </p>
          <div className="flex gap-2">
            {([
              { key: 'gcash',  label: 'GCash',       Icon: IconCreditCard },
              { key: 'wallet', label: 'GGX Wallet',  Icon: IconWallet     },
            ] as const).map(({ key, label, Icon }) => {
              const sel = state.paymentMethod === key;
              return (
                <button
                  key={key}
                  onClick={() => onChange({ paymentMethod: key })}
                  className={cn(
                    'flex-1 flex items-center gap-2 rounded-xl border p-2.5 cursor-pointer transition-all',
                    sel
                      ? 'border-blue-400 bg-white/80 ring-1 ring-blue-300'
                      : 'border-white/60 bg-white/30 hover:bg-white/50',
                  )}
                >
                  <Icon className={cn('w-4 h-4 flex-shrink-0', sel ? 'text-blue-600' : 'text-gray-400')} />
                  <span className={cn('text-xs font-semibold', sel ? 'text-blue-900' : 'text-gray-700')}>
                    {label}
                  </span>
                  {sel && <IconCheck className="w-3.5 h-3.5 text-blue-500 ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-white/50 bg-white/30 px-3 py-2.5">
          <IconCash className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <p className="text-xs text-gray-600 leading-snug">
            Shipping fee collected by our rider at delivery.
          </p>
        </div>
      )}
    </BasicGlassCard>
  );
}

// ── Promo code ────────────────────────────────────────────────────────────────

interface PromoState {
  promoCode: string;
  promoInput: string;
  promoDiscount: number;
  promoStatus: 'idle' | 'applied' | 'invalid';
}

function PromoSection({
  state,
  onChange,
}: {
  state: PromoState;
  onChange: (patch: Partial<PromoState>) => void;
}) {
  const [open, setOpen] = useState(!!state.promoCode);

  const apply = () => {
    const code = state.promoInput.trim().toUpperCase();
    if (MOCK_PROMO_CODES[code] !== undefined) {
      onChange({ promoCode: code, promoDiscount: MOCK_PROMO_CODES[code], promoStatus: 'applied' });
    } else {
      onChange({ promoStatus: 'invalid' });
    }
  };

  const remove = () => {
    onChange({ promoCode: '', promoInput: '', promoDiscount: 0, promoStatus: 'idle' });
    setOpen(false);
  };

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 cursor-pointer px-1"
        >
          <IconTag className="w-3.5 h-3.5" />
          Have a promo code?
        </button>
      ) : (
        <BasicGlassCard className="p-3.5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <IconTag className="w-3.5 h-3.5 text-violet-500" />
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Promo Code</p>
          </div>

          {state.promoStatus === 'applied' ? (
            <div className="flex items-center gap-2 rounded-xl border border-green-300/80 bg-green-50/70 px-3 py-2.5">
              <IconCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-800">{state.promoCode}</p>
                <p className="text-[10px] text-green-600">₱{state.promoDiscount} off applied</p>
              </div>
              <button onClick={remove} className="p-1 rounded-full hover:bg-green-200 cursor-pointer">
                <IconX className="w-3.5 h-3.5 text-green-700" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                className={cn(
                  'flex-1 rounded-xl border bg-white/70 px-3 py-2 text-sm uppercase placeholder:normal-case placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-400',
                  state.promoStatus === 'invalid' ? 'border-red-400' : 'border-white/60',
                )}
                placeholder="Enter promo code"
                value={state.promoInput}
                onChange={(e) => onChange({ promoInput: e.target.value.toUpperCase(), promoStatus: 'idle' })}
                onKeyDown={(e) => e.key === 'Enter' && apply()}
              />
              <button
                onClick={apply}
                className="rounded-xl border border-white/60 bg-white/50 px-3 py-2 text-sm font-semibold text-blue-700 cursor-pointer hover:bg-white/80 transition-colors"
              >
                Apply
              </button>
            </div>
          )}
          {state.promoStatus === 'invalid' && (
            <p className="mt-1 text-[10px] text-red-500">Invalid code. Try SULIT10, GOGO20, or FIRST15.</p>
          )}
        </BasicGlassCard>
      )}
    </div>
  );
}

// ── Schedule info ─────────────────────────────────────────────────────────────

function ScheduleInfo({ firstMile }: { firstMile: FirstMile }) {
  const today = new Date();
  const pickupDate = today.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
  const deliveryDate = new Date(today.getTime() + 3 * 86400000)
    .toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <BasicGlassCard className="p-4">
      <div className="flex items-start gap-2 mb-3">
        <IconInfoCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-blue-700 leading-snug">
          Book before <strong>2:00 PM</strong> for same-business-day{' '}
          {firstMile === 'pickup' ? 'pick-up' : 'drop-off acceptance'}.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/50 p-2.5 text-center">
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
            Est. {firstMile === 'pickup' ? 'Pick-up' : 'Drop-off'} Date
          </p>
          <p className="text-xs font-bold text-gray-800">{pickupDate}</p>
        </div>
        <div className="rounded-xl bg-white/50 p-2.5 text-center">
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
            Est. Delivery Date
          </p>
          <p className="text-xs font-bold text-gray-800">{deliveryDate}</p>
        </div>
      </div>
    </BasicGlassCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export function BasicBookingScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  type LocationState = { draft?: BookingDraft } | null;
  const prevDraft = (location.state as LocationState)?.draft;

  // Redirect to sender step if no draft (e.g. direct URL access)
  if (!prevDraft?.sender || !prevDraft?.receiver) {
    navigate('/basic/deliver', { replace: true });
    return null;
  }

  // ── local state for all booking fields ────────────────────────────────────
  const [firstMile, setFirstMile] = useState<FirstMile>(prevDraft.firstMile ?? 'pickup');

  const [itemState, setItemState] = useState<ItemState>({
    itemName: prevDraft.itemName ?? '',
    pouchSize: prevDraft.pouchSize ?? 'small',
    cod: prevDraft.cod ?? false,
    codAmount: prevDraft.codAmount ?? '',
    itemProtection: prevDraft.itemProtection ?? 'free',
  });

  const [shippingState, setShippingState] = useState<ShippingState>({
    feePayer: prevDraft.feePayer ?? 'sender',
    paymentMethod: prevDraft.paymentMethod ?? 'gcash',
  });

  const [promoState, setPromoState] = useState<PromoState>({
    promoCode: prevDraft.promoCode ?? '',
    promoInput: prevDraft.promoCode ?? '',
    promoDiscount: prevDraft.promoDiscount ?? 0,
    promoStatus: prevDraft.promoCode ? 'applied' : 'idle',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const fees = computeFee({
    pouchSize: itemState.pouchSize,
    cod: itemState.cod,
    codAmount: itemState.codAmount,
    itemProtection: itemState.itemProtection,
    promoDiscount: promoState.promoDiscount,
  });

  // ── Edit sender / receiver ─────────────────────────────────────────────────
  const currentDraft = (): BookingDraft => ({
    ...prevDraft,
    firstMile,
    ...itemState,
    ...shippingState,
    promoCode: promoState.promoCode,
    promoDiscount: promoState.promoDiscount,
  });

  const handleEditSender = () =>
    navigate('/basic/deliver', { state: { draft: currentDraft(), editReturn: true } });

  const handleEditReceiver = () =>
    navigate('/basic/deliver/receiver', { state: { draft: currentDraft(), editReturn: true } });

  // ── Book Now ───────────────────────────────────────────────────────────────
  const handleBook = () => {
    const errs: Record<string, boolean> = {};
    if (!itemState.itemName.trim()) errs.itemName = true;
    if (itemState.cod && !itemState.codAmount) errs.codAmount = true;
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      // Scroll toward item section handled by page scroll
      return;
    }

    navigate('/basic/deliver/success', { state: { draft: currentDraft() } });
  };

  return (
    <div className="px-4 pt-4 pb-6 space-y-3">
      {/* Route summary */}
      <RouteCard
        draft={prevDraft}
        onEditSender={handleEditSender}
        onEditReceiver={handleEditReceiver}
      />

      {/* First mile */}
      <FirstMileCard value={firstMile} onChange={setFirstMile} />

      {/* Item details */}
      <ItemDetailsCard
        state={itemState}
        onChange={(patch) => setItemState((s) => ({ ...s, ...patch }))}
        errors={fieldErrors}
        forceExpand={!!(fieldErrors.itemName || fieldErrors.codAmount)}
      />

      {/* Schedule info */}
      <ScheduleInfo firstMile={firstMile} />

      {/* Shipping & payment */}
      <ShippingPaymentCard
        state={shippingState}
        onChange={(patch) => setShippingState((s) => ({ ...s, ...patch }))}
      />

      {/* Promo */}
      <PromoSection
        state={promoState}
        onChange={(patch) => setPromoState((s) => ({ ...s, ...patch }))}
      />

      {/* Book Now bar */}
      <div
        className="rounded-[26px] p-4 flex items-center justify-between gap-3"
        style={{
          background: 'rgba(30,143,214,0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.25)',
          boxShadow: '0 14px 38px rgba(30,100,180,0.25)',
        }}
      >
        <div>
          <p className="text-[10px] font-semibold text-blue-100 uppercase tracking-widest">Estimated</p>
          <p className="text-2xl font-extrabold text-white leading-none">₱{fees.total}</p>
          {fees.discount > 0 && (
            <p className="text-[10px] text-blue-200">−₱{fees.discount} promo</p>
          )}
        </div>
        <button
          onClick={handleBook}
          className="rounded-2xl bg-white px-5 py-3 text-sm font-extrabold text-blue-700 cursor-pointer hover:bg-blue-50 transition-colors active:scale-95 transition-transform"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
