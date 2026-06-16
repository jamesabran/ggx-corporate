import { useState, useEffect } from 'react';
import {
  IconPlus,
  IconMapPin,
  IconEdit,
  IconTrash,
  IconStar,
  IconCheck,
  IconX,
  IconChevronLeft,
} from '@tabler/icons-react';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { LocationCascadeFields } from '../../components/LocationCascadeFields';
import {
  getAddresses,
  upsertAddress,
  removeAddress,
  setDefaultSender,
  newAddressId,
  type BasicAddress,
} from '../../lib/basicAddressBook';
import { cn } from '../../lib/utils';

const EMPTY_FORM: Omit<BasicAddress, 'id' | 'updatedAt'> = {
  name: '',
  mobile: '',
  street: '',
  unit: '',
  province: '',
  city: '',
  barangay: '',
  landmark: '',
  isDefaultSender: false,
};

type FormData = Omit<BasicAddress, 'id' | 'updatedAt'>;
type FormErrors = Partial<Record<keyof FormData, boolean>>;

function inputCls(err?: boolean) {
  return cn(
    'w-full rounded-xl border bg-white px-3 py-2.5 text-sm placeholder-gray-300 outline-none transition-colors focus:ring-2 focus:ring-blue-400',
    err ? 'border-red-400' : 'border-gray-200',
  );
}

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-0.5 text-[10px] text-red-500">Required</p>}
    </div>
  );
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: BasicAddress;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  const line = [address.street, address.unit, address.barangay, address.city, address.province]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border shadow-sm p-4 space-y-3',
        address.isDefaultSender ? 'border-blue-300 ring-1 ring-blue-200' : 'border-gray-100',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-bold text-gray-900">{address.name}</p>
            {address.isDefaultSender && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-blue-700 bg-blue-100 rounded-full px-1.5 py-0.5 leading-none">
                <IconStar className="w-2.5 h-2.5 fill-current" />
                Default sender
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{address.mobile}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
            title="Edit"
          >
            <IconEdit className="w-3.5 h-3.5 text-gray-600" />
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
            title="Delete"
          >
            <IconTrash className="w-3.5 h-3.5 text-red-500" />
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <IconMapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-500 leading-snug">{line}</p>
      </div>

      {address.landmark && (
        <p className="text-xs text-gray-400 leading-snug">📍 {address.landmark}</p>
      )}

      {!address.isDefaultSender && (
        <button
          onClick={onSetDefault}
          className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
        >
          <IconStar className="w-3 h-3" />
          Set as default sender
        </button>
      )}
    </div>
  );
}

function AddressForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: BasicAddress;
  onSave: (data: BasicAddress) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormData>(
    initial
      ? { name: initial.name, mobile: initial.mobile, street: initial.street,
          unit: initial.unit, province: initial.province, city: initial.city,
          barangay: initial.barangay, landmark: initial.landmark, isDefaultSender: initial.isDefaultSender }
      : { ...EMPTY_FORM },
  );
  const [errors, setErrors] = useState<FormErrors>({});

  const set = (patch: Partial<FormData>) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: FormErrors = {};
    if (!form.name)     errs.name     = true;
    if (!form.mobile)   errs.mobile   = true;
    if (!form.street)   errs.street   = true;
    if (!form.province) errs.province = true;
    if (!form.city)     errs.city     = true;
    if (!form.barangay) errs.barangay = true;
    if (Object.keys(errs).length) { setErrors(errs); return; }

    onSave({
      id: initial?.id ?? newAddressId(),
      updatedAt: Date.now(),
      ...form,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-0 pb-4">
      <div className="px-4 pt-4 pb-3">
        <p className="text-sm font-bold text-gray-900">{initial ? 'Edit Address' : 'New Address'}</p>
      </div>

      <div className="bg-white mx-4 rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name" required error={errors.name}>
            <input className={inputCls(errors.name)} placeholder="Full name"
              value={form.name} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <Field label="Mobile" required error={errors.mobile}>
            <input className={inputCls(errors.mobile)} placeholder="+63 9XX XXX XXXX" inputMode="tel"
              value={form.mobile} onChange={(e) => set({ mobile: e.target.value })} />
          </Field>
        </div>
        <Field label="Street address" required error={errors.street}>
          <input className={inputCls(errors.street)} placeholder="Building, street, subdivision"
            value={form.street} onChange={(e) => set({ street: e.target.value })} />
        </Field>
        <Field label="House / Floor / Unit">
          <input className={inputCls()} placeholder="e.g. Unit 3B, 2nd Floor"
            value={form.unit} onChange={(e) => set({ unit: e.target.value })} />
        </Field>

        <LocationCascadeFields
          province={form.province}
          city={form.city}
          barangay={form.barangay}
          onChange={(province, city, barangay) => set({ province, city, barangay })}
          errors={{ province: errors.province, city: errors.city, barangay: errors.barangay }}
        />

        <Field label="Landmark / Note">
          <input className={inputCls()} placeholder="Nearest landmark, gate color, etc."
            value={form.landmark} onChange={(e) => set({ landmark: e.target.value })} />
        </Field>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isDefaultSender}
            onChange={(e) => set({ isDefaultSender: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 accent-blue-600"
          />
          <span className="text-sm text-gray-700">Set as default sender address</span>
        </label>
      </div>

      <div className="px-4 pt-4 flex gap-2.5">
        <Button type="submit" className="flex-1 h-11">
          <IconCheck className="w-4 h-4" />
          {initial ? 'Update' : 'Save Address'}
        </Button>
        <Button type="button" variant="outline" className="h-11 px-4" onClick={onCancel}>
          <IconX className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}

export function BasicAddressBook() {
  const [addresses, setAddresses] = useState<BasicAddress[]>([]);
  const [editTarget, setEditTarget]   = useState<BasicAddress | null | 'new'>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => { setAddresses(getAddresses()); }, []);

  const reload = () => setAddresses(getAddresses());

  const handleSave = (addr: BasicAddress) => {
    upsertAddress(addr);
    reload();
    setEditTarget(null);
  };

  const handleDelete = (id: string) => {
    removeAddress(id);
    reload();
    setDeleteTarget(null);
  };

  const handleSetDefault = (id: string) => {
    setDefaultSender(id);
    reload();
  };

  if (editTarget !== null) {
    return (
      <AddressForm
        initial={editTarget === 'new' ? undefined : editTarget}
        onSave={handleSave}
        onCancel={() => setEditTarget(null)}
      />
    );
  }

  return (
    <div className="space-y-0 pb-4">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-900">Your Addresses</p>
          <p className="text-xs text-gray-500">Saved pickup and delivery addresses</p>
        </div>
        <Button
          size="sm"
          onClick={() => setEditTarget('new')}
          className="flex-shrink-0"
        >
          <IconPlus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <IconMapPin className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-600">No saved addresses</p>
          <p className="text-xs text-gray-400 mt-1">Add your pickup and delivery addresses here for faster booking.</p>
          <Button className="mt-4" onClick={() => setEditTarget('new')}>
            <IconPlus className="w-4 h-4" /> Add your first address
          </Button>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              onEdit={() => setEditTarget(addr)}
              onDelete={() => setDeleteTarget(addr.id)}
              onSetDefault={() => handleSetDefault(addr.id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        title="Delete address?"
        description="This address will be removed from your address book."
        confirmLabel="Delete"
        variant="destructive"
        confirmIcon={<IconTrash className="w-3.5 h-3.5 mr-1.5" />}
      />
    </div>
  );
}
