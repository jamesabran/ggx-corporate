export type PouchSize = 'small' | 'medium' | 'large' | 'xl' | 'xxl';
export type FirstMile = 'pickup' | 'dropoff';
export type ItemProtection = 'free' | 'full';
// Payment method only applies when feePayer === 'sender'. 'cod' is an item-collection
// toggle (handled by the cod/codAmount fields), not a shipping fee payment method.
export type PaymentMethod = 'gcash' | 'wallet';
export type FeePayer = 'sender' | 'receiver';

export interface BookingAddress {
  id?: string;
  name: string;
  mobile: string;
  street: string;
  unit: string;
  province: string;
  city: string;
  barangay: string;
  landmark: string;
}

export interface BookingDraft {
  sender: BookingAddress | null;
  receiver: BookingAddress | null;
  firstMile: FirstMile;
  itemName: string;
  pouchSize: PouchSize;
  cod: boolean;
  codAmount: string;
  // No declaredValue for Basic — protection is derived from COD amount only.
  itemProtection: ItemProtection;
  feePayer: FeePayer;
  // paymentMethod is only meaningful when feePayer === 'sender'.
  paymentMethod: PaymentMethod;
  promoCode: string;
  promoDiscount: number;
}

export const EMPTY_ADDRESS: BookingAddress = {
  name: '', mobile: '', street: '', unit: '',
  province: '', city: '', barangay: '', landmark: '',
};

export const INITIAL_DRAFT: BookingDraft = {
  sender: null,
  receiver: null,
  firstMile: 'pickup',
  itemName: '',
  pouchSize: 'small',
  cod: false,
  codAmount: '',
  itemProtection: 'free',
  feePayer: 'sender',
  paymentMethod: 'gcash',
  promoCode: '',
  promoDiscount: 0,
};

export const POUCH_OPTIONS: {
  key: PouchSize;
  label: string;
  dims: string;
  maxWt: string;
  price: number;
}[] = [
  { key: 'small',  label: 'Small Pouch',  dims: '24 × 36 cm',       maxWt: '3 kg',  price: 80  },
  { key: 'medium', label: 'Medium Pouch', dims: '30.5 × 46 cm',     maxWt: '5 kg',  price: 100 },
  { key: 'large',  label: 'Large Pouch',  dims: '40 × 60 cm',       maxWt: '10 kg', price: 130 },
  { key: 'xl',     label: 'XL Box',       dims: '50 × 40 × 30 cm',  maxWt: '20 kg', price: 180 },
  { key: 'xxl',    label: 'XXL Box',      dims: '60 × 50 × 40 cm',  maxWt: '30 kg', price: 250 },
];

export interface FeeBreakdown {
  shipping: number;
  protection: number;
  discount: number;
  total: number;
}

export function computeFee(draft: Partial<BookingDraft>): FeeBreakdown {
  const pouch = POUCH_OPTIONS.find((p) => p.key === (draft.pouchSize ?? 'small'));
  const shipping = pouch?.price ?? 80;
  // Protection base = COD amount when COD is on; otherwise no basis for full protection.
  const base = draft.cod ? (Number(draft.codAmount) || 0) : 0;
  const protection =
    draft.itemProtection === 'full' && draft.cod
      ? Math.round(Math.max(base - 500, 0) * 0.01)
      : 0;
  const discount = draft.promoDiscount ?? 0;
  return { shipping, protection, discount, total: Math.max(shipping + protection - discount, 0) };
}

export interface ItemState {
  itemName: string;
  pouchSize: PouchSize;
  cod: boolean;
  codAmount: string;
  itemProtection: ItemProtection;
}

export const MOCK_PROMO_CODES: Record<string, number> = {
  SULIT10: 10,
  GOGO20:  20,
  FIRST15: 15,
};
