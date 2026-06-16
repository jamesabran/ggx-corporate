import { useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  IconChevronRight,
  IconChevronLeft,
  IconInfoCircle,
  IconShieldCheck,
  IconShieldFilled,
} from '@tabler/icons-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import {
  POUCH_OPTIONS,
  type BookingDraft,
  type PouchSize,
  type ItemProtection,
} from '../../lib/basicBookingTypes';

const ITEM_CATEGORIES = [
  'Clothing & Accessories', 'Electronics', 'Books & Stationery',
  'Food & Beverages', 'Health & Beauty', 'Home & Living',
  'Toys & Games', 'Documents', 'Other',
];

export function BasicItemDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const prevDraft = (location.state as { draft?: BookingDraft } | null)?.draft;
  const carouselRef = useRef<HTMLDivElement>(null);

  const [itemName, setItemName]     = useState(prevDraft?.itemName ?? '');
  const [category, setCategory]     = useState('');
  const [pouchSize, setPouchSize]   = useState<PouchSize>(prevDraft?.pouchSize ?? 'small');
  const [cod, setCod]               = useState(prevDraft?.cod ?? false);
  const [codAmount, setCodAmount]   = useState(prevDraft?.codAmount ?? '');
  const [declared, setDeclared]     = useState(prevDraft?.declaredValue ?? '');
  const [protection, setProtection] = useState<ItemProtection>(prevDraft?.itemProtection ?? 'free');
  const [errors, setErrors]         = useState<Record<string, boolean>>({});

  if (!prevDraft?.sender || !prevDraft?.receiver) {
    navigate('/basic/deliver', { replace: true });
    return null;
  }

  const protectionFee =
    protection === 'full' ? Math.round(Math.max(Number(declared) - 500, 0) * 0.01) : 0;

  const handleNext = () => {
    const errs: Record<string, boolean> = {};
    if (!itemName.trim()) errs.itemName = true;
    if (cod && !codAmount) errs.codAmount = true;
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const draft: BookingDraft = {
      ...prevDraft,
      itemName: itemName.trim(),
      pouchSize,
      cod,
      codAmount: cod ? codAmount : '',
      declaredValue: declared,
      itemProtection: protection,
    };
    navigate('/basic/deliver/payment', { state: { draft } });
  };

  const scrollPouch = (dir: -1 | 1) => {
    carouselRef.current?.scrollBy({ left: dir * 160, behavior: 'smooth' });
  };

  return (
    <div className="space-y-0 pb-4">
      {/* Step header */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-0.5">
          Step 4 of 6
        </p>
        <p className="text-[13px] text-gray-500 leading-snug">
          Tell us what you're shipping.
        </p>
      </div>

      {/* Item name + category */}
      <div className="bg-white mx-4 rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Item Info</p>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Item name <span className="text-red-500">*</span>
          </label>
          <input
            className={cn(
              'w-full rounded-xl border bg-white px-3 py-2.5 text-sm placeholder-gray-300 outline-none transition-colors focus:ring-2 focus:ring-blue-400',
              errors.itemName ? 'border-red-400' : 'border-gray-200',
            )}
            placeholder="e.g. Nike Shoes, Samsung Phone"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          {errors.itemName && <p className="mt-0.5 text-[10px] text-red-500">Required</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Category (optional)</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
          >
            <option value="">Select category</option>
            {ITEM_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Pouch / box selector */}
      <div className="mx-4 mt-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Pouch / Box Size</p>
          <div className="flex gap-1">
            <button onClick={() => scrollPouch(-1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
              <IconChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <button onClick={() => scrollPouch(1)} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
              <IconChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div
          ref={carouselRef}
          className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {POUCH_OPTIONS.map((opt) => {
            const sel = pouchSize === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setPouchSize(opt.key)}
                style={{ scrollSnapAlign: 'start' }}
                className={cn(
                  'flex flex-col items-center flex-shrink-0 w-[140px] rounded-xl border p-3 transition-all cursor-pointer',
                  sel
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400'
                    : 'border-gray-200 bg-white hover:border-gray-300',
                )}
              >
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-2', sel ? 'bg-blue-100' : 'bg-gray-100')}>
                  <span className="text-lg">📦</span>
                </div>
                <p className={cn('text-sm font-bold leading-snug text-center', sel ? 'text-blue-900' : 'text-gray-800')}>
                  {opt.label}
                </p>
                <p className="text-[10px] text-gray-400 text-center leading-snug mt-0.5">{opt.dims}</p>
                <p className="text-[10px] text-gray-400 text-center leading-snug">Max {opt.maxWt}</p>
                <p className={cn('mt-2 text-sm font-bold', sel ? 'text-blue-700' : 'text-gray-700')}>
                  ₱{opt.price}
                </p>
              </button>
            );
          })}
        </div>

        <p className="mt-2 text-[11px] text-gray-400 leading-snug">
          Our rider provides your waybill and selected pouch on pick-up.{' '}
          <span className="font-semibold">Oversized?</span> Use own packaging not exceeding 1m diameter.
        </p>
      </div>

      {/* COD */}
      <div className="mx-4 mt-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={cod}
            onChange={(e) => setCod(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-blue-600"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Cash on Delivery (COD)</p>
            <p className="text-xs text-gray-500 mt-0.5">Our rider collects payment when delivering your item</p>
          </div>
        </label>
        {cod && (
          <div className="mt-3">
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              COD amount to collect <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">₱</span>
              <input
                className={cn(
                  'w-full rounded-xl border pl-7 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400',
                  errors.codAmount ? 'border-red-400' : 'border-gray-200',
                )}
                inputMode="numeric"
                placeholder="0.00"
                value={codAmount}
                onChange={(e) => setCodAmount(e.target.value)}
              />
            </div>
            {errors.codAmount && <p className="mt-0.5 text-[10px] text-red-500">Enter COD amount</p>}
          </div>
        )}
      </div>

      {/* Declared value + Item protection */}
      <div className="mx-4 mt-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">
            Declared item value (optional)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">₱</span>
            <input
              className="w-full rounded-xl border border-gray-200 pl-7 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-400"
              inputMode="numeric"
              placeholder="0.00"
              value={declared}
              onChange={(e) => setDeclared(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <p className="text-xs font-semibold text-gray-500">Item Protection</p>
            <IconInfoCircle className="w-3.5 h-3.5 text-gray-300" />
          </div>

          {/* Free tier */}
          <button
            onClick={() => setProtection('free')}
            className={cn(
              'w-full flex items-center gap-3 rounded-xl border p-3 mb-2 text-left transition-all cursor-pointer',
              protection === 'free'
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400'
                : 'border-gray-200 bg-white hover:border-gray-300',
            )}
          >
            <IconShieldCheck className={cn('w-5 h-5 flex-shrink-0', protection === 'free' ? 'text-blue-600' : 'text-gray-400')} />
            <div className="flex-1">
              <p className={cn('text-sm font-semibold', protection === 'free' ? 'text-blue-900' : 'text-gray-800')}>
                Free — ₱500 coverage
              </p>
              <p className="text-[11px] text-gray-500">Protected against loss or damage up to ₱500</p>
            </div>
            <span className="text-sm font-bold text-green-600">Free</span>
          </button>

          {/* Full protection */}
          <button
            onClick={() => setProtection('full')}
            className={cn(
              'w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all cursor-pointer',
              protection === 'full'
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400'
                : 'border-gray-200 bg-white hover:border-gray-300',
            )}
          >
            <IconShieldFilled className={cn('w-5 h-5 flex-shrink-0', protection === 'full' ? 'text-blue-600' : 'text-gray-400')} />
            <div className="flex-1">
              <p className={cn('text-sm font-semibold', protection === 'full' ? 'text-blue-900' : 'text-gray-800')}>
                Full — 100% declared value
              </p>
              <p className="text-[11px] text-gray-500">
                1% of declared value above ₱500
                {declared && Number(declared) > 500
                  ? ` · Fee: ₱${protectionFee}`
                  : ' · Enter declared value to see fee'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 pt-4">
        <Button className="w-full h-12 text-base" onClick={handleNext}>
          Next — Payment
          <IconChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
