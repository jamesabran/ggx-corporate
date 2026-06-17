import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  IconTruckDelivery,
  IconBuildingStore,
  IconPlus,
  IconChevronRight,
  IconInfoCircle,
} from '@tabler/icons-react';
import {
  POUCH_OPTIONS,
  INITIAL_DRAFT,
  type BookingDraft,
  type FirstMile,
  type ItemState,
} from '../../lib/basicBookingTypes';
import { BasicGlassCard } from '../../components/basic/BasicGlassCard';
import { BasicAddressSheet } from '../../components/basic/BasicAddressSheet';
import { BasicItemDetailsDrawer } from '../../components/basic/BasicItemDetailsDrawer';
import {
  getDefaultSenderAddress,
  type BasicAddress,
} from '../../lib/basicAddressBook';
import { cn } from '../../lib/utils';

type NavState = {
  draft?: BookingDraft;
  receiverJustSaved?: boolean;
  editTarget?: 'sender';
  editReturn?: boolean;
} | null;

function addrLine(a: NonNullable<BookingDraft['sender']>): string {
  return [a.street, a.unit, a.barangay, a.city, a.province].filter(Boolean).join(', ');
}

function addressFromBook(b: BasicAddress): NonNullable<BookingDraft['sender']> {
  return {
    id: b.id,
    name: b.name,
    mobile: b.mobile,
    street: b.street,
    unit: b.unit,
    province: b.province,
    city: b.city,
    barangay: b.barangay,
    landmark: b.landmark,
  };
}

// ── Address pair card ─────────────────────────────────────────────────────────

function AddressCard({
  sender,
  receiver,
  onTapSender,
  onTapReceiver,
}: {
  sender: BookingDraft['sender'];
  receiver: BookingDraft['receiver'];
  onTapSender: () => void;
  onTapReceiver: () => void;
}) {
  return (
    <BasicGlassCard className="p-4">
      {/* Sender */}
      <button onClick={onTapSender} className="w-full flex items-start gap-3 text-left cursor-pointer group">
        <div className="flex flex-col items-center flex-shrink-0 mt-1">
          <div className="w-3 h-3 rounded-full border-2 border-blue-500 bg-blue-100" />
          <div className="w-0.5 h-6 bg-gray-200/80 mt-1" />
        </div>
        <div className="flex-1 min-w-0">
          {sender ? (
            <>
              <p className="text-sm font-semibold text-gray-900 leading-snug truncate">
                {sender.name} · {sender.mobile}
              </p>
              <p className="text-xs text-gray-500 truncate leading-snug">{addrLine(sender)}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">Add sender address</p>
          )}
        </div>
        {sender && (
          <span className="text-[11px] font-semibold text-blue-600 flex-shrink-0 mt-0.5 group-hover:text-blue-800">
            Edit
          </span>
        )}
      </button>

      {/* Receiver */}
      <button onClick={onTapReceiver} className="w-full flex items-start gap-3 mt-1 text-left cursor-pointer group">
        <div className="flex flex-col items-center flex-shrink-0 mt-1">
          <div className="w-3 h-3 rounded-full border-2 border-red-400 bg-red-100" />
        </div>
        <div className="flex-1 min-w-0">
          {receiver ? (
            <>
              <p className="text-sm font-semibold text-gray-900 leading-snug truncate">
                {receiver.name} · {receiver.mobile}
              </p>
              <p className="text-xs text-gray-500 truncate leading-snug">{addrLine(receiver)}</p>
            </>
          ) : (
            <p className="text-sm font-medium text-blue-500">Add recipient address</p>
          )}
        </div>
        {receiver && (
          <span className="text-[11px] font-semibold text-blue-600 flex-shrink-0 mt-0.5 group-hover:text-blue-800">
            Edit
          </span>
        )}
      </button>
    </BasicGlassCard>
  );
}

// ── First mile card ───────────────────────────────────────────────────────────

function FirstMileCard({ value, onChange }: { value: FirstMile; onChange: (v: FirstMile) => void }) {
  return (
    <BasicGlassCard className="p-4">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Select Pick-up or Drop-off
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {(
          [
            { key: 'pickup' as FirstMile, label: 'Rider Pick-up', sub: 'We collect from you', Icon: IconTruckDelivery },
            { key: 'dropoff' as FirstMile, label: 'Drop-off', sub: 'At the nearest hub', Icon: IconBuildingStore },
          ] as const
        ).map(({ key, label, sub, Icon }) => {
          const sel = value === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={cn(
                'flex flex-col items-start gap-1 rounded-2xl border p-3 text-left transition-all cursor-pointer',
                sel
                  ? 'border-blue-400 bg-white/80 ring-1 ring-blue-300'
                  : 'border-white/60 bg-white/30 hover:bg-white/50',
              )}
            >
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

// ── Add Item Details CTA ──────────────────────────────────────────────────────

function AddItemDetailsCta({
  hasItem,
  itemSummary,
  onClick,
}: {
  hasItem: boolean;
  itemSummary?: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="w-full text-left cursor-pointer">
      <BasicGlassCard className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(30,143,214,0.12)' }}
          >
            <IconPlus className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              {hasItem ? 'Item Details' : 'Item Details'}
            </p>
            {hasItem && itemSummary ? (
              <p className="text-xs text-gray-500 truncate">{itemSummary}</p>
            ) : (
              <p className="text-xs text-gray-400">Add more details so we can handle your items better</p>
            )}
          </div>
          <IconChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </div>
      </BasicGlassCard>
    </button>
  );
}

// ── Schedule note ─────────────────────────────────────────────────────────────

function ScheduleNote({ firstMile }: { firstMile: FirstMile }) {
  const tomorrow = new Date(Date.now() + 86400000);
  const dateStr = tomorrow.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  return (
    <BasicGlassCard className="p-4">
      <div className="flex items-start gap-2.5">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-10 h-10 rounded-full bg-blue-50/80 flex items-center justify-center">
            <IconInfoCircle className="w-5 h-5 text-blue-500" />
          </div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          Book now for your item to be{' '}
          {firstMile === 'pickup' ? 'picked up' : 'dropped off'} by{' '}
          <strong>{dateStr}</strong>.
        </p>
      </div>
    </BasicGlassCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

export function BasicDeliver() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state as NavState;

  const initDraft = (): BookingDraft => {
    if (navState?.draft) return navState.draft;
    const def = getDefaultSenderAddress();
    return {
      ...INITIAL_DRAFT,
      sender: def
        ? {
            id: def.id,
            name: def.name,
            mobile: def.mobile,
            street: def.street,
            unit: def.unit,
            province: def.province,
            city: def.city,
            barangay: def.barangay,
            landmark: def.landmark,
          }
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

  // Auto-open item drawer after receiver save
  useEffect(() => {
    if (navState?.receiverJustSaved) {
      const t = setTimeout(() => setItemDrawerOpen(true), 150);
      return () => clearTimeout(t);
    }
  }, []);

  // Auto-open sender sheet when returning to edit sender
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
      navigate('/basic/deliver/booking', { state: { draft: { ...updated, firstMile, ...itemState } } });
    }
  };

  const handleTapReceiver = () => {
    navigate('/basic/deliver/receiver', { state: { draft: { ...draft, firstMile, ...itemState } } });
  };

  const handleSaveItem = () => {
    const errs: Record<string, boolean> = {};
    if (!itemState.itemName.trim()) errs.itemName = true;
    if (itemState.cod && !itemState.codAmount) errs.codAmount = true;
    if (Object.keys(errs).length) {
      setItemErrors(errs);
      return;
    }
    const completeDraft: BookingDraft = {
      ...draft,
      firstMile,
      ...itemState,
    };
    navigate('/basic/deliver/booking', { state: { draft: completeDraft } });
  };

  return (
    <div className="px-4 pt-4 pb-6 space-y-3">
      {/* Address pair card */}
      <AddressCard
        sender={draft.sender}
        receiver={draft.receiver}
        onTapSender={() => setSenderSheetOpen(true)}
        onTapReceiver={handleTapReceiver}
      />

      {/* First mile selector */}
      <FirstMileCard value={firstMile} onChange={setFirstMile} />

      {/* Add Item Details CTA — only shown when receiver is filled */}
      {hasReceiver && (
        <AddItemDetailsCta
          hasItem={hasItem}
          itemSummary={itemSummary}
          onClick={() => setItemDrawerOpen(true)}
        />
      )}

      {/* Schedule / estimate note */}
      <ScheduleNote firstMile={firstMile} />

      {/* Item details bottom drawer */}
      <BasicItemDetailsDrawer
        open={itemDrawerOpen}
        state={itemState}
        onChange={(patch) => setItemState((s) => ({ ...s, ...patch }))}
        errors={itemErrors}
        onSave={handleSaveItem}
        onClose={() => setItemDrawerOpen(false)}
        saveLabel="Save Item Details"
      />

      {/* Sender address book sheet */}
      <BasicAddressSheet
        open={senderSheetOpen}
        onClose={() => setSenderSheetOpen(false)}
        onSelect={handleSenderSelect}
        title="Select Sender Address"
      />
    </div>
  );
}
