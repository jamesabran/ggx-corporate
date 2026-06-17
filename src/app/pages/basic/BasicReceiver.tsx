import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { IconChevronRight, IconAddressBook } from '@tabler/icons-react';
import { Button } from '../../components/ui/Button';
import { BasicAddressFormFields } from '../../components/basic/BasicAddressFormFields';
import { BasicAddressSheet } from '../../components/basic/BasicAddressSheet';
import {
  recordRecentAddress,
  newAddressId,
  type BasicAddress,
} from '../../lib/basicAddressBook';
import {
  EMPTY_ADDRESS,
  type BookingAddress,
  type BookingDraft,
} from '../../lib/basicBookingTypes';

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

export function BasicReceiver() {
  const navigate = useNavigate();
  const location = useLocation();
  const locState = location.state as { draft?: BookingDraft; editReturn?: boolean } | null;
  const prevDraft = locState?.draft;
  const editReturn = locState?.editReturn ?? false;

  const [address, setAddress] = useState<BookingAddress>(
    prevDraft?.receiver ?? EMPTY_ADDRESS,
  );
  const [errors, setErrors] = useState<AddressErrors>({});
  const [bookSheet, setBookSheet] = useState(false);

  if (!prevDraft) {
    navigate('/basic/deliver', { replace: true });
    return null;
  }

  const handleSave = () => {
    const errs = validate(address);
    if (Object.values(errs).some(Boolean)) { setErrors(errs); return; }

    recordRecentAddress({
      id: address.id ?? newAddressId(),
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
    });

    const draft: BookingDraft = { ...prevDraft, receiver: address };

    if (editReturn) {
      // Editing from Review Details — return there with updated draft
      navigate('/basic/deliver/booking', { state: { draft } });
    } else {
      // First time filling receiver — return to Delivery page, trigger item drawer
      navigate('/basic/deliver', { state: { draft, receiverJustSaved: true } });
    }
  };

  return (
    <div className="space-y-0 pb-4">
      {/* Page subtitle */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-[13px] text-gray-500 leading-snug">
          Where is this delivery going?
        </p>
      </div>

      {/* Address book quick-pick */}
      <div className="px-4 pb-3">
        <button
          onClick={() => setBookSheet(true)}
          className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <IconAddressBook className="w-3.5 h-3.5" />
          Pick from Address Book
        </button>
      </div>

      {/* Receiver form */}
      <div className="bg-white mx-4 rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Receiver Details
        </p>
        <BasicAddressFormFields value={address} onChange={setAddress} errors={errors} />
      </div>

      {/* CTA */}
      <div className="px-4 pt-4">
        <Button className="w-full h-12 text-base" onClick={handleSave}>
          {editReturn ? 'Save Changes' : 'Save Receiver'}
          <IconChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <BasicAddressSheet
        open={bookSheet}
        onClose={() => setBookSheet(false)}
        onSelect={(addr) => setAddress(addressFromBook(addr))}
        title="Select Receiver Address"
      />
    </div>
  );
}
