import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { IconAddressBook } from '@tabler/icons-react';
import { BasicAddressFormFields } from '../../components/basic/BasicAddressFormFields';
import { BasicAddressSheet } from '../../components/basic/BasicAddressSheet';
import { recordRecentAddress, newAddressId, type BasicAddress } from '../../lib/basicAddressBook';
import { EMPTY_ADDRESS, type BookingAddress, type BookingDraft } from '../../lib/basicBookingTypes';

type AddressErrors = Partial<Record<keyof BookingAddress, boolean>>;

function addressFromBook(b: BasicAddress): BookingAddress {
  return {
    id: b.id, name: b.name, mobile: b.mobile, street: b.street,
    unit: b.unit, province: b.province, city: b.city,
    barangay: b.barangay, landmark: b.landmark,
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

export function BasicV2Receiver() {
  const navigate = useNavigate();
  const location = useLocation();
  const locState = location.state as { draft?: BookingDraft; editReturn?: boolean } | null;
  const prevDraft = locState?.draft;
  const editReturn = locState?.editReturn ?? false;

  const [address, setAddress] = useState<BookingAddress>(prevDraft?.receiver ?? EMPTY_ADDRESS);
  const [errors, setErrors] = useState<AddressErrors>({});
  const [bookSheet, setBookSheet] = useState(false);

  if (!prevDraft) {
    navigate('/basic-v2/delivery', { replace: true });
    return null;
  }

  const handleSave = () => {
    const errs = validate(address);
    if (Object.values(errs).some(Boolean)) { setErrors(errs); return; }

    recordRecentAddress({
      id: address.id ?? newAddressId(),
      name: address.name, mobile: address.mobile,
      street: address.street, unit: address.unit,
      province: address.province, city: address.city,
      barangay: address.barangay, landmark: address.landmark,
      isDefaultSender: false, updatedAt: Date.now(),
    });

    const draft: BookingDraft = { ...prevDraft, receiver: address };

    if (editReturn) {
      navigate('/basic-v2/delivery/booking', { state: { draft } });
    } else {
      navigate('/basic-v2/delivery', { state: { draft, receiverJustSaved: true } });
    }
  };

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      {/* Subtitle */}
      <p className="text-sm text-gray-500">Where is this delivery going?</p>

      {/* Address book quick-pick */}
      <button
        onClick={() => setBookSheet(true)}
        className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors cursor-pointer shadow-sm"
      >
        <IconAddressBook className="w-3.5 h-3.5" />
        Pick from Address Book
      </button>

      {/* Form card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Receiver Details</p>
        <BasicAddressFormFields value={address} onChange={setAddress} errors={errors} />
      </div>

      {/* Save CTA */}
      <button
        onClick={handleSave}
        className="w-full h-12 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
      >
        {editReturn ? 'Save Changes' : 'Save Receiver'}
      </button>

      <BasicAddressSheet
        open={bookSheet}
        onClose={() => setBookSheet(false)}
        onSelect={(addr) => setAddress(addressFromBook(addr))}
        title="Select Receiver Address"
      />
    </div>
  );
}
