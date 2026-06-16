import { LocationCascadeFields } from '../LocationCascadeFields';
import type { BookingAddress } from '../../lib/basicBookingTypes';
import { EMPTY_ADDRESS } from '../../lib/basicBookingTypes';
import { cn } from '../../lib/utils';

interface Props {
  value: BookingAddress;
  onChange: (next: BookingAddress) => void;
  errors?: Partial<Record<keyof BookingAddress, boolean>>;
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-0.5 text-[10px] text-red-500">Required</p>}
    </div>
  );
}

const inputCls = (err?: boolean) =>
  cn(
    'w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none transition-colors focus:ring-2 focus:ring-blue-400 focus:border-blue-400',
    err ? 'border-red-400' : 'border-gray-200',
  );

export function BasicAddressFormFields({ value, onChange, errors }: Props) {
  const f = value ?? EMPTY_ADDRESS;
  const set = (patch: Partial<BookingAddress>) => onChange({ ...f, ...patch });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Contact name" required error={errors?.name}>
          <input
            className={inputCls(errors?.name)}
            placeholder="Full name"
            value={f.name}
            onChange={(e) => set({ name: e.target.value })}
          />
        </Field>
        <Field label="Mobile number" required error={errors?.mobile}>
          <input
            className={inputCls(errors?.mobile)}
            placeholder="+63 9XX XXX XXXX"
            inputMode="tel"
            value={f.mobile}
            onChange={(e) => set({ mobile: e.target.value })}
          />
        </Field>
      </div>

      <Field label="Street address" required error={errors?.street}>
        <input
          className={inputCls(errors?.street)}
          placeholder="Building, street, subdivision"
          value={f.street}
          onChange={(e) => set({ street: e.target.value })}
        />
      </Field>

      <Field label="House / Floor / Unit no.">
        <input
          className={inputCls()}
          placeholder="e.g. Unit 3B, 2nd Floor"
          value={f.unit}
          onChange={(e) => set({ unit: e.target.value })}
        />
      </Field>

      <LocationCascadeFields
        province={f.province}
        city={f.city}
        barangay={f.barangay}
        onChange={(province, city, barangay) => set({ province, city, barangay })}
        errors={{
          province: errors?.province,
          city: errors?.city,
          barangay: errors?.barangay,
        }}
      />

      <Field label="Landmark / Note to rider">
        <input
          className={inputCls()}
          placeholder="Nearest landmark, gate color, etc."
          value={f.landmark}
          onChange={(e) => set({ landmark: e.target.value })}
        />
      </Field>
    </div>
  );
}
