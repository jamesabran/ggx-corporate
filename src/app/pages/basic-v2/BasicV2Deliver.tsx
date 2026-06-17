import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  IconTruckDelivery,
  IconBuildingStore,
  IconPlus,
  IconChevronRight,
  IconInfoCircle,
  IconCheck,
} from '@tabler/icons-react';
import {
  POUCH_OPTIONS,
  INITIAL_DRAFT,
  type BookingDraft,
  type FirstMile,
  type ItemState,
} from '../../lib/basicBookingTypes';
import { BasicAddressSheet } from '../../components/basic/BasicAddressSheet';
import { BasicItemDetailsDrawer } from '../../components/basic/BasicItemDetailsDrawer';
import { getDefaultSenderAddress, type BasicAddress } from '../../lib/basicAddressBook';
import { cn } from '../../lib/utils';

// ── Shared helpers ────────────────────────────────────────────────────────────

function addrLine(a: NonNullable<BookingDraft['sender']>): string {
  return [a.street, a.unit, a.barangay, a.city, a.province].filter(Boolean).join(', ');
}

function addressFromBook(b: BasicAddress): NonNullable<BookingDraft['sender']> {
  return {
    id: b.id, name: b.name, mobile: b.mobile,
    street: b.street, unit: b.unit, province: b.province,
    city: b.city, barangay: b.barangay, landmark: b.landmark,
  };
}

// ── V2 Card ───────────────────────────────────────────────────────────────────

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-2xl shadow-sm', className)}>
      {children}
    </div>
  );
}

type NavState = {
  draft?: BookingDraft;
  receiverJustSaved?: boolean;
  editTarget?: 'sender';
  editReturn?: boolean;
} | null;

// ─────────────────────────────────────────────────────────────────────────────

export function BasicV2Deliver() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as NavState;

  const initDraft = (): BookingDraft => {
    if (navState?.draft) return navState.draft;
    const def = getDefaultSenderAddress();
    return {
      ...INITIAL_DRAFT,
      sender: def
        ? { id: def.id, name: def.name, mobile: def.mobile, street: def.street,
            unit: def.unit, province: def.province, city: def.city,
            barangay: def.barangay, landmark: def.landmark }
        : null,
    };
  };

  const [draft, setDraft] = useState<BookingDraft>(initDraft);
  const [firstMile, setFirstMile] = useState<FirstMile>(navState?.draft?.firstMile ?? 'pickup');
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false);
  const [senderSheetOpen, setSenderSheetOpen] = useState(false);
  const [itemState, setItemState] = useState<ItemState>({
    itemName: navState?.draft?.itemName ?? '',
    pouchSize: navState?.draft?.pouchSize ?? 'small',
    cod: navState?.draft?.cod ?? false,
    codAmount: navState?.draft?.codAmount ?? '',
    itemProtection: navState?.draft?.itemProtection ?? 'free',
  });
  const [itemErrors, setItemErrors] = useState<Record<string, boolean>>({});
  const editReturn = navState?.editReturn ?? false;

  useEffect(() => {
    if (navState?.receiverJustSaved) {
      const t = setTimeout(() => setItemDrawerOpen(true), 150);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (navState?.editTarget === 'sender') {
      const t = setTimeout(() => setSenderSheetOpen(true), 150);
      return () => clearTimeout(t);
    }
  }, []);

  const hasReceiver = !!(draft.receiver?.name);
  const hasItem = !!(itemState.itemName.trim());
  const itemSummary = hasItem
    ? `${itemState.itemName} · ${POUCH_OPTIONS.find((p) => p.key === itemState.pouchSize)?.label ?? ''}`
    : undefined;

  const handleSenderSelect = (b: BasicAddress) => {
    const updated: BookingDraft = { ...draft, sender: addressFromBook(b) };
    setDraft(updated);
    setSenderSheetOpen(false);
    if (editReturn) {
      navigate('/basic-v2/delivery/booking', { state: { draft: { ...updated, firstMile, ...itemState } } });
    }
  };

  const handleTapReceiver = () => {
    navigate('/basic-v2/delivery/receiver', { state: { draft: { ...draft, firstMile, ...itemState } } });
  };

  const handleSaveItem = () => {
    const errs: Record<string, boolean> = {};
    if (!itemState.itemName.trim()) errs.itemName = true;
    if (itemState.cod && !itemState.codAmount) errs.codAmount = true;
    if (Object.keys(errs).length) { setItemErrors(errs); return; }
    navigate('/basic-v2/delivery/booking', { state: { draft: { ...draft, firstMile, ...itemState } } });
  };

  return (
    <div className="px-4 pt-4 pb-6 space-y-3">

      {/* ── Address card ── */}
      <Card>
        {/* Sender row */}
        <button
          onClick={() => setSenderSheetOpen(true)}
          className="w-full flex items-start gap-3 p-4 text-left cursor-pointer hover:bg-gray-50 rounded-t-2xl transition-colors group"
        >
          <div className="flex flex-col items-center flex-shrink-0 mt-1">
            <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-blue-100" />
            <div className="w-px h-6 bg-gray-200 mt-1" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Sender</p>
            {draft.sender ? (
              <>
                <p className="text-sm font-semibold text-gray-900 truncate">{draft.sender.name} · {draft.sender.mobile}</p>
                <p className="text-xs text-gray-500 truncate">{addrLine(draft.sender)}</p>
              </>
            ) : (
              <p className="text-sm text-gray-400">Add sender address</p>
            )}
          </div>
          {draft.sender && (
            <span className="text-xs font-semibold text-blue-600 flex-shrink-0 mt-0.5 group-hover:text-blue-800">Edit</span>
          )}
        </button>

        <div className="border-t border-gray-100 mx-4" />

        {/* Receiver row */}
        <button
          onClick={handleTapReceiver}
          className="w-full flex items-start gap-3 p-4 text-left cursor-pointer hover:bg-gray-50 rounded-b-2xl transition-colors"
        >
          <div className="flex flex-col items-center flex-shrink-0 mt-1">
            <div className="w-3 h-3 rounded-full border-2 border-red-400 bg-red-50" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Receiver</p>
            {draft.receiver ? (
              <>
                <p className="text-sm font-semibold text-gray-900 truncate">{draft.receiver.name} · {draft.receiver.mobile}</p>
                <p className="text-xs text-gray-500 truncate">{addrLine(draft.receiver)}</p>
              </>
            ) : (
              <p className="text-sm font-medium text-blue-600">Add recipient address</p>
            )}
          </div>
          {draft.receiver ? (
            <span className="text-xs font-semibold text-blue-600 flex-shrink-0 mt-0.5 hover:text-blue-800">Edit</span>
          ) : (
            <IconChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          )}
        </button>
      </Card>

      {/* ── First mile ── */}
      <Card className="p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Select Pick-up or Drop-off
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { key: 'pickup' as FirstMile, label: 'Rider Pick-up', sub: 'We collect from you', Icon: IconTruckDelivery },
              { key: 'dropoff' as FirstMile, label: 'Drop-off', sub: 'At the nearest hub', Icon: IconBuildingStore },
            ] as const
          ).map(({ key, label, sub, Icon }) => {
            const sel = firstMile === key;
            return (
              <button
                key={key}
                onClick={() => setFirstMile(key)}
                className={cn(
                  'flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left cursor-pointer transition-all',
                  sel ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400' : 'border-gray-200 bg-gray-50 hover:border-gray-300',
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <Icon className={cn('w-5 h-5', sel ? 'text-blue-600' : 'text-gray-400')} />
                  {sel && <IconCheck className="w-4 h-4 text-blue-600" />}
                </div>
                <p className={cn('text-sm font-semibold leading-snug', sel ? 'text-blue-900' : 'text-gray-800')}>{label}</p>
                <p className="text-[10px] text-gray-500">{sub}</p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* ── Add Item Details CTA — only after receiver filled ── */}
      {hasReceiver && (
        <button onClick={() => setItemDrawerOpen(true)} className="w-full text-left cursor-pointer">
          <Card className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                <IconPlus className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">Item Details</p>
                {hasItem && itemSummary ? (
                  <p className="text-xs text-gray-500 truncate">{itemSummary}</p>
                ) : (
                  <p className="text-xs text-gray-400">Add item details so we can handle your parcel better</p>
                )}
              </div>
              <IconChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          </Card>
        </button>
      )}

      {/* ── Schedule note ── */}
      <Card className="p-4">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <IconInfoCircle className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-sm text-gray-700 leading-relaxed pt-0.5">
            Book now for your item to be{' '}
            {firstMile === 'pickup' ? 'picked up' : 'dropped off'} by{' '}
            <strong className="text-gray-900">
              {new Date(Date.now() + 86400000).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
            </strong>.
          </p>
        </div>
      </Card>

      {/* Drawers */}
      <BasicItemDetailsDrawer
        open={itemDrawerOpen}
        state={itemState}
        onChange={(patch) => setItemState((s) => ({ ...s, ...patch }))}
        errors={itemErrors}
        onSave={handleSaveItem}
        onClose={() => setItemDrawerOpen(false)}
        saveLabel="Save Item Details"
      />

      <BasicAddressSheet
        open={senderSheetOpen}
        onClose={() => setSenderSheetOpen(false)}
        onSelect={handleSenderSelect}
        title="Select Sender Address"
      />
    </div>
  );
}
