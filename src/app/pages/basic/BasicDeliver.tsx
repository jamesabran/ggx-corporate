import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  IconClock,
  IconAddressBook,
  IconChevronRight,
  IconCheck,
} from '@tabler/icons-react';
import { Button } from '../../components/ui/Button';
import { BasicAddressFormFields } from '../../components/basic/BasicAddressFormFields';
import { BasicAddressSheet } from '../../components/basic/BasicAddressSheet';
import {
  getDefaultSenderAddress,
  getRecentAddresses,
  recordRecentAddress,
  upsertAddress,
  newAddressId,
  type BasicAddress,
} from '../../lib/basicAddressBook';
import {
  INITIAL_DRAFT,
  EMPTY_ADDRESS,
  type BookingAddress,
  type BookingDraft,
} from '../../lib/basicBookingTypes';
import { cn } from '../../lib/utils';

type AddressErrors = Partial<Record<keyof BookingAddress, boolean>>;

function addressFromBook(b: BasicAddress): BookingAddress {
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

function isComplete(a: BookingAddress): boolean {
  return !!(a.name && a.mobile && a.street && a.province && a.city && a.barangay);
}

function validate(a: BookingAddress): AddressErrors {
  return {
    name:     !a.name     ? true : undefined,
    mobile:   !a.mobile   ? true : undefined,
    street:   !a.street   ? true : undefined,
    province: !a.province ? true : undefined,
    city:     !a.city     ? true : undefined,
    barangay: !a.barangay ? true : undefined,
  };
}

export function BasicDeliver() {
  const navigate = useNavigate();
  const [address, setAddress] = useState<BookingAddress>(EMPTY_ADDRESS);
  const [errors, setErrors] = useState<AddressErrors>({});
  const [bookSheet, setBookSheet] = useState(false);
  const [saveToBook, setSaveToBook] = useState(false);
  const [recent, setRecent] = useState<BasicAddress[]>([]);

  // Pre-populate from default sender
  useEffect(() => {
    const def = getDefaultSenderAddress();
    if (def) setAddress(addressFromBook(def));
    setRecent(getRecentAddresses().slice(0, 3));
  }, []);

  const handleNext = () => {
    const errs = validate(address);
    const hasError = Object.values(errs).some(Boolean);
    if (hasError) { setErrors(errs); return; }

    if (saveToBook && address.name) {
      const existing = address.id;
      const entry: BasicAddress = {
        id: existing ?? newAddressId(),
        name: address.name,
        mobile: address.mobile,
        street: address.street,
        unit: address.unit,
        province: address.province,
        city: address.city,
        barangay: address.barangay,
        landmark: address.landmark,
        isDefaultSender: false,
        updatedAt: Date.now(),
      };
      upsertAddress(entry);
      recordRecentAddress(entry);
    } else if (address.id) {
      // record as recent even if not re-saving
      const books = getRecentAddresses();
      const found = books.find((a) => a.id === address.id);
      if (!found) {
        const entry: BasicAddress = {
          id: address.id,
          name: address.name, mobile: address.mobile,
          street: address.street, unit: address.unit,
          province: address.province, city: address.city,
          barangay: address.barangay, landmark: address.landmark,
          isDefaultSender: false, updatedAt: Date.now(),
        };
        recordRecentAddress(entry);
      }
    }

    const draft: BookingDraft = { ...INITIAL_DRAFT, sender: address };
    navigate('/basic/deliver/receiver', { state: { draft } });
  };

  return (
    <div className="space-y-0 pb-4">
      {/* Step header */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-widest mb-0.5">
          Step 1 of 6
        </p>
        <p className="text-[13px] text-gray-500 leading-snug">
          Who is sending this delivery?
        </p>
      </div>

      {/* Quick-select pills */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <button
          onClick={() => setBookSheet(true)}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
            'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600',
          )}
        >
          <IconClock className="w-3.5 h-3.5" />
          Recent Addresses
        </button>
        <button
          onClick={() => setBookSheet(true)}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer',
            'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600',
          )}
        >
          <IconAddressBook className="w-3.5 h-3.5" />
          Address Book
        </button>
      </div>

      {/* Recent addresses quick cards */}
      {recent.length > 0 && (
        <div className="px-4 pb-3 space-y-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Recent</p>
          {recent.map((r) => (
            <button
              key={r.id}
              onClick={() => setAddress(addressFromBook(r))}
              className={cn(
                'w-full text-left rounded-xl border px-3 py-2.5 flex items-center gap-3 transition-colors cursor-pointer',
                address.id === r.id
                  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400'
                  : 'border-gray-100 bg-white hover:border-blue-200',
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-snug truncate">{r.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {[r.street, r.city].filter(Boolean).join(', ')}
                </p>
              </div>
              {address.id === r.id && <IconCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}

      {/* Address form */}
      <div className="bg-white mx-4 rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Sender Details
        </p>
        <BasicAddressFormFields value={address} onChange={setAddress} errors={errors} />
      </div>

      {/* Save to address book */}
      {!address.id && (
        <label className="flex items-center gap-2 px-4 pt-3 cursor-pointer">
          <input
            type="checkbox"
            checked={saveToBook}
            onChange={(e) => setSaveToBook(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 accent-blue-600"
          />
          <span className="text-sm text-gray-600">Save to address book</span>
        </label>
      )}

      {/* Manage address book link */}
      <button
        onClick={() => navigate('/basic/address-book')}
        className="flex items-center gap-1 px-4 pt-2 text-[12px] font-medium text-blue-600 cursor-pointer"
        style={{ background: 'none', border: 'none', padding: '8px 16px 0' }}
      >
        Manage address book <IconChevronRight className="w-3.5 h-3.5" />
      </button>

      {/* CTA */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Shipping fee</p>
            <p className="text-sm font-bold text-gray-800">Starts at <span className="text-blue-600">₱80</span></p>
          </div>
          <p className="text-xs text-gray-400">Computed at review</p>
        </div>
        <Button className="w-full h-12 text-base" onClick={handleNext}>
          Next — Receiver Details
          <IconChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Address book sheet */}
      <BasicAddressSheet
        open={bookSheet}
        onClose={() => setBookSheet(false)}
        onSelect={(addr) => setAddress(addressFromBook(addr))}
        title="Select Sender Address"
      />
    </div>
  );
}
