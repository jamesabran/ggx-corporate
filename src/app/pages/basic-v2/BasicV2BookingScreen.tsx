import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  IconTruckDelivery,
  IconBuildingStore,
  IconTag,
  IconCheck,
  IconX,
  IconCreditCard,
  IconWallet,
  IconCash,
  IconChevronDown,
  IconPencil,
} from '@tabler/icons-react';
import {
  computeFee,
  MOCK_PROMO_CODES,
  POUCH_OPTIONS,
  type BookingDraft,
  type FeePayer,
  type FirstMile,
  type ItemState,
  type PaymentMethod,
} from '../../lib/basicBookingTypes';
import { BasicItemDetailsDrawer } from '../../components/basic/BasicItemDetailsDrawer';
import { cn } from '../../lib/utils';

function addrLine(a: NonNullable<BookingDraft['sender']>): string {
  return [a.street, a.unit, a.barangay, a.city, a.province].filter(Boolean).join(', ');
}

function fmtPHP(n: number) {
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-2xl shadow-sm', className)}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">{children}</p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

type NavState = { draft?: BookingDraft } | null;

export function BasicV2BookingScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const prevDraft = (location.state as NavState)?.draft;

  if (!prevDraft?.sender || !prevDraft?.receiver || !prevDraft?.itemName) {
    navigate('/basic-v2/delivery', { replace: true });
    return null;
  }

  const [firstMile, setFirstMile] = useState<FirstMile>(prevDraft.firstMile ?? 'pickup');
  const [itemState, setItemState] = useState<ItemState>({
    itemName: prevDraft.itemName,
    pouchSize: prevDraft.pouchSize ?? 'small',
    cod: prevDraft.cod ?? false,
    codAmount: prevDraft.codAmount ?? '',
    itemProtection: prevDraft.itemProtection ?? 'free',
  });
  const [feePayer, setFeePayer] = useState<FeePayer>(prevDraft.feePayer ?? 'sender');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(prevDraft.paymentMethod ?? 'gcash');
  const [promoInput, setPromoInput] = useState(prevDraft.promoCode ?? '');
  const [promoCode, setPromoCode] = useState(prevDraft.promoCode ?? '');
  const [promoDiscount, setPromoDiscount] = useState(prevDraft.promoDiscount ?? 0);
  const [promoStatus, setPromoStatus] = useState<'idle' | 'applied' | 'invalid'>(
    prevDraft.promoCode ? 'applied' : 'idle',
  );
  const [promoOpen, setPromoOpen] = useState(!!prevDraft.promoCode);
  const [paymentExpanded, setPaymentExpanded] = useState(false);
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false);
  const [itemErrors, setItemErrors] = useState<Record<string, boolean>>({});

  const fees = computeFee({
    pouchSize: itemState.pouchSize,
    cod: itemState.cod,
    codAmount: itemState.codAmount,
    itemProtection: itemState.itemProtection,
    promoDiscount,
  });

  const senderTotal = feePayer === 'sender' ? fees.total : 0;
  const pouch = POUCH_OPTIONS.find((p) => p.key === itemState.pouchSize)!;

  const currentDraft = (): BookingDraft => ({
    ...prevDraft, firstMile, ...itemState,
    feePayer, paymentMethod, promoCode, promoDiscount,
  });

  const handleEditSender = () =>
    navigate('/basic-v2/delivery', { state: { draft: currentDraft(), editTarget: 'sender', editReturn: true } });

  const handleEditReceiver = () =>
    navigate('/basic-v2/delivery/receiver', { state: { draft: currentDraft(), editReturn: true } });

  const handleSaveItemDrawer = () => {
    const errs: Record<string, boolean> = {};
    if (!itemState.itemName.trim()) errs.itemName = true;
    if (itemState.cod && !itemState.codAmount) errs.codAmount = true;
    if (Object.keys(errs).length) { setItemErrors(errs); return; }
    setItemErrors({});
    setItemDrawerOpen(false);
  };

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (MOCK_PROMO_CODES[code] !== undefined) {
      setPromoCode(code); setPromoDiscount(MOCK_PROMO_CODES[code]); setPromoStatus('applied');
    } else {
      setPromoStatus('invalid');
    }
  };

  const removePromo = () => {
    setPromoCode(''); setPromoInput(''); setPromoDiscount(0); setPromoStatus('idle'); setPromoOpen(false);
  };

  const handleBook = () => {
    const errs: Record<string, boolean> = {};
    if (!itemState.itemName.trim()) errs.itemName = true;
    if (itemState.cod && !itemState.codAmount) errs.codAmount = true;
    if (Object.keys(errs).length) { setItemErrors(errs); setItemDrawerOpen(true); return; }
    navigate('/basic-v2/delivery/success', { state: { draft: currentDraft() } });
  };

  // Receiver-collected amounts
  const codAmt = itemState.cod ? Number(itemState.codAmount) || 0 : 0;
  const receiverShipping = feePayer === 'receiver' ? fees.shipping : 0;
  const receiverProtection = feePayer === 'receiver' ? fees.protection : 0;
  const receiverTotal = codAmt + receiverShipping + receiverProtection;
  const showReceiverSection = itemState.cod || feePayer === 'receiver';

  // Dates
  const today = new Date();
  const pickupDate = today.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
  const deliveryDate = new Date(today.getTime() + 3 * 86400000)
    .toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <>
      {/* Scrollable content */}
      <div className="px-4 pt-4 pb-[200px] space-y-3">

        {/* 1. Schedule */}
        <Card className="p-4">
          <SectionLabel>Schedule</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: `Est. ${firstMile === 'pickup' ? 'Pick-up' : 'Drop-off'}`, value: pickupDate },
              { label: 'Est. Delivery', value: deliveryDate },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-gray-50 border border-gray-100 p-2.5 text-center">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
                <p className="text-xs font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* 2. Address summary */}
        <Card>
          <div className="p-4 pb-3">
            <SectionLabel>Addresses</SectionLabel>
          </div>
          {/* Sender */}
          <div className="flex items-start gap-3 px-4 pb-3">
            <div className="flex flex-col items-center flex-shrink-0 mt-1">
              <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-blue-100" />
              <div className="w-px h-5 bg-gray-200 mt-1" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {prevDraft.sender!.name} · {prevDraft.sender!.mobile}
              </p>
              <p className="text-xs text-gray-500 truncate">{addrLine(prevDraft.sender!)}</p>
            </div>
            <button onClick={handleEditSender} className="text-xs font-semibold text-blue-600 flex-shrink-0 cursor-pointer hover:text-blue-800">Edit</button>
          </div>
          <div className="border-t border-gray-100 mx-4" />
          {/* Receiver */}
          <div className="flex items-start gap-3 px-4 py-3">
            <div className="flex flex-col items-center flex-shrink-0 mt-1">
              <div className="w-3 h-3 rounded-full border-2 border-red-400 bg-red-50" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {prevDraft.receiver!.name} · {prevDraft.receiver!.mobile}
              </p>
              <p className="text-xs text-gray-500 truncate">{addrLine(prevDraft.receiver!)}</p>
            </div>
            <button onClick={handleEditReceiver} className="text-xs font-semibold text-blue-600 flex-shrink-0 cursor-pointer hover:text-blue-800">Edit</button>
          </div>
        </Card>

        {/* 3. First-mile (inline editable) */}
        <Card className="p-4">
          <SectionLabel>Pick-up or Drop-off Option</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { key: 'pickup' as FirstMile, label: 'Rider Pick-up', Icon: IconTruckDelivery },
                { key: 'dropoff' as FirstMile, label: 'Drop-off', Icon: IconBuildingStore },
              ] as const
            ).map(({ key, label, Icon }) => {
              const sel = firstMile === key;
              return (
                <button
                  key={key}
                  onClick={() => setFirstMile(key)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border p-3 cursor-pointer transition-all',
                    sel ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400' : 'border-gray-200 bg-gray-50 hover:border-gray-300',
                  )}
                >
                  <Icon className={cn('w-5 h-5 flex-shrink-0', sel ? 'text-blue-600' : 'text-gray-400')} />
                  <span className={cn('text-sm font-semibold', sel ? 'text-blue-900' : 'text-gray-800')}>{label}</span>
                  {sel && <IconCheck className="w-4 h-4 text-blue-600 ml-auto" />}
                </button>
              );
            })}
          </div>
        </Card>

        {/* 4. Item details summary */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <SectionLabel>Item Details</SectionLabel>
            <button
              onClick={() => setItemDrawerOpen(true)}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 cursor-pointer hover:text-blue-800 -mt-2"
            >
              <IconPencil className="w-3 h-3" /> EDIT
            </button>
          </div>
          <p className="text-sm font-semibold text-gray-900">{itemState.itemName}</p>
          {itemState.cod && (
            <p className="text-xs text-gray-600 mt-0.5">
              COD · <span className="font-semibold text-emerald-700">{fmtPHP(Number(itemState.codAmount) || 0)}</span>
            </p>
          )}
          <p className="text-xs text-gray-500 mt-0.5">{pouch.label} · Max {pouch.maxWt}</p>
          <div className="mt-2.5 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
            <p className="text-[10px] text-gray-600 leading-snug">
              {itemState.itemProtection === 'full' && fees.protection > 0
                ? `Full protection — up to ${fmtPHP(Number(itemState.codAmount) || 0)} (+${fmtPHP(fees.protection)} fee)`
                : 'Protected up to ₱500 for FREE'}
            </p>
          </div>
        </Card>

        {/* 5. Receiver payable breakdown */}
        {showReceiverSection && (
          <Card className="p-4">
            <SectionLabel>Fees and Breakdown</SectionLabel>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-2">
                Collected from receiver upon delivery
              </p>
              {itemState.cod && (
                <div className="flex justify-between text-xs text-gray-700">
                  <span>Item Value (COD)</span>
                  <span className="font-semibold">{fmtPHP(codAmt)}</span>
                </div>
              )}
              {feePayer === 'receiver' && (
                <div className="flex justify-between text-xs text-gray-700">
                  <span>Shipping Fee</span>
                  <span className="font-semibold">{fmtPHP(receiverShipping)}</span>
                </div>
              )}
              {receiverProtection > 0 && (
                <div className="flex justify-between text-xs text-gray-700">
                  <span>Item Protection Fee</span>
                  <span className="font-semibold">{fmtPHP(receiverProtection)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-1.5 flex justify-between text-sm font-bold text-gray-900">
                <span>Total Amount</span>
                <span>{fmtPHP(receiverTotal)}</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* ── Fixed bottom payment + CTA ── */}
      <div
        className="fixed z-30 w-full max-w-[430px]"
        style={{ bottom: 0, left: '50%', transform: 'translateX(-50%)' }}
      >
        <div className="mx-3 mb-3 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
          {/* Payment section */}
          <div className="px-4 pt-3.5">
            <button
              onClick={() => setPaymentExpanded((v) => !v)}
              className="w-full flex items-center justify-between cursor-pointer mb-2"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Payment Details</p>
              <IconChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', paymentExpanded && 'rotate-180')} />
            </button>

            {/* Compact summary */}
            {!paymentExpanded && (
              <div className="flex items-center gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 flex-1">
                  {feePayer === 'sender' ? (
                    paymentMethod === 'gcash'
                      ? <IconCreditCard className="w-4 h-4 text-blue-500" />
                      : <IconWallet className="w-4 h-4 text-blue-500" />
                  ) : (
                    <IconCash className="w-4 h-4 text-gray-500" />
                  )}
                  <p className="text-xs font-semibold text-gray-700">
                    {feePayer === 'sender'
                      ? `${paymentMethod === 'gcash' ? 'GCash' : 'GGX Wallet'} — Paid by sender`
                      : 'Shipping collected at delivery'}
                  </p>
                </div>
                {!promoOpen && (
                  <button
                    onClick={() => setPromoOpen(true)}
                    className="flex items-center gap-1 text-[10px] font-semibold text-violet-600 cursor-pointer flex-shrink-0"
                  >
                    <IconTag className="w-3 h-3" /> Promo
                  </button>
                )}
              </div>
            )}

            {/* Expanded payment */}
            {paymentExpanded && (
              <div className="space-y-3 mb-3">
                {/* Fee payer */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Who pays shipping fee?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { key: 'sender' as FeePayer, label: 'Sender pays', sub: 'Paid upfront' },
                        { key: 'receiver' as FeePayer, label: 'Receiver pays', sub: 'At delivery' },
                      ] as const
                    ).map(({ key, label, sub }) => {
                      const sel = feePayer === key;
                      return (
                        <button
                          key={key}
                          onClick={() => { setFeePayer(key); if (key === 'receiver') setPaymentMethod('gcash'); }}
                          className={cn(
                            'flex flex-col items-start rounded-xl border p-2.5 cursor-pointer transition-all text-left',
                            sel ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400' : 'border-gray-200 bg-gray-50 hover:border-gray-300',
                          )}
                        >
                          <p className={cn('text-xs font-semibold', sel ? 'text-blue-900' : 'text-gray-800')}>{label}</p>
                          <p className="text-[9px] text-gray-500">{sub}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment method — sender only */}
                {feePayer === 'sender' && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Payment method</p>
                    <div className="flex gap-2">
                      {(
                        [
                          { key: 'gcash' as PaymentMethod, label: 'GCash', Icon: IconCreditCard },
                          { key: 'wallet' as PaymentMethod, label: 'GGX Wallet', Icon: IconWallet },
                        ] as const
                      ).map(({ key, label, Icon }) => {
                        const sel = paymentMethod === key;
                        return (
                          <button
                            key={key}
                            onClick={() => setPaymentMethod(key)}
                            className={cn(
                              'flex-1 flex items-center gap-2 rounded-xl border p-2.5 cursor-pointer transition-all',
                              sel ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400' : 'border-gray-200 bg-gray-50 hover:border-gray-300',
                            )}
                          >
                            <Icon className={cn('w-4 h-4 flex-shrink-0', sel ? 'text-blue-600' : 'text-gray-400')} />
                            <span className={cn('text-xs font-semibold', sel ? 'text-blue-900' : 'text-gray-700')}>{label}</span>
                            {sel && <IconCheck className="w-3.5 h-3.5 text-blue-600 ml-auto" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {feePayer === 'receiver' && (
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                    <IconCash className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <p className="text-xs text-gray-600">Shipping fee collected by rider at delivery.</p>
                  </div>
                )}

                {/* Promo */}
                <div>
                  {!promoOpen ? (
                    <button onClick={() => setPromoOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 cursor-pointer">
                      <IconTag className="w-3.5 h-3.5" /> Got promos and discounts?
                    </button>
                  ) : promoStatus === 'applied' ? (
                    <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2">
                      <IconCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-green-800">{promoCode}</p>
                        <p className="text-[9px] text-green-600">₱{promoDiscount} off applied</p>
                      </div>
                      <button onClick={removePromo} className="p-1 rounded-full hover:bg-green-100 cursor-pointer">
                        <IconX className="w-3 h-3 text-green-700" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          className={cn(
                            'flex-1 rounded-xl border bg-white px-3 py-2 text-sm uppercase placeholder:normal-case placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-400',
                            promoStatus === 'invalid' ? 'border-red-400' : 'border-gray-200',
                          )}
                          placeholder="Enter promo code"
                          value={promoInput}
                          onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoStatus('idle'); }}
                          onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                        />
                        <button onClick={applyPromo} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 cursor-pointer hover:bg-blue-50">
                          Apply
                        </button>
                      </div>
                      {promoStatus === 'invalid' && (
                        <p className="mt-0.5 text-[10px] text-red-500">Invalid code. Try SULIT10, GOGO20, or FIRST15.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Promo chip (compact mode) */}
            {!paymentExpanded && promoStatus === 'applied' && (
              <div className="flex items-center gap-1.5 mb-2">
                <IconCheck className="w-3 h-3 text-green-600" />
                <span className="text-[10px] font-semibold text-green-700">{promoCode} — ₱{promoDiscount} off</span>
                <button onClick={removePromo} className="ml-auto cursor-pointer"><IconX className="w-3 h-3 text-gray-400" /></button>
              </div>
            )}

            {/* Promo input (compact mode) */}
            {!paymentExpanded && promoOpen && promoStatus !== 'applied' && (
              <div className="mb-2">
                <div className="flex gap-2">
                  <input
                    className={cn('flex-1 rounded-xl border bg-white px-3 py-2 text-sm uppercase placeholder:normal-case placeholder-gray-300 outline-none focus:ring-2 focus:ring-blue-400', promoStatus === 'invalid' ? 'border-red-400' : 'border-gray-200')}
                    placeholder="Promo code"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoStatus('idle'); }}
                    onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                  />
                  <button onClick={applyPromo} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 cursor-pointer hover:bg-blue-50">Apply</button>
                </div>
                {promoStatus === 'invalid' && <p className="mt-0.5 text-[10px] text-red-500">Invalid code.</p>}
              </div>
            )}
          </div>

          {/* Total + Confirm CTA */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-t border-gray-100 bg-gray-50">
            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 leading-none">
                {feePayer === 'sender' ? 'Amount to pay' : 'Upfront cost'}
              </p>
              <p className="text-2xl font-extrabold text-gray-900 leading-tight mt-0.5">
                {feePayer === 'sender' ? fmtPHP(senderTotal) : '₱0'}
              </p>
              {feePayer === 'receiver' && (
                <p className="text-[9px] text-gray-400">Shipping collected at delivery</p>
              )}
              {fees.discount > 0 && feePayer === 'sender' && (
                <p className="text-[9px] text-green-600">−₱{fees.discount} promo applied</p>
              )}
            </div>
            <button
              onClick={handleBook}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white cursor-pointer hover:bg-blue-700 active:scale-[0.98] transition-all flex-shrink-0 shadow-sm"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </div>

      {/* Item details drawer */}
      <BasicItemDetailsDrawer
        open={itemDrawerOpen}
        state={itemState}
        onChange={(patch) => setItemState((s) => ({ ...s, ...patch }))}
        errors={itemErrors}
        onSave={handleSaveItemDrawer}
        onClose={() => setItemDrawerOpen(false)}
        saveLabel="Update Item Details"
      />
    </>
  );
}
