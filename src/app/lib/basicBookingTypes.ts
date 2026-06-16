export type PouchSize = 'small' | 'medium' | 'large' | 'xl' | 'xxl';
export type FirstMile = 'pickup' | 'dropoff';
export type ItemProtection = 'free' | 'full';
export type PaymentMethod = 'gcash' | 'cod' | 'wallet';
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
  declaredValue: string;
  itemProtection: ItemProtection;
  paymentMethod: PaymentMethod;
  feePayer: FeePayer;
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
  declaredValue: '',
  itemProtection: 'free',
  paymentMethod: 'gcash',
  feePayer: 'sender',
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
  const declared = Number(draft.declaredValue) || 0;
  const protection =
    draft.itemProtection === 'full' ? Math.round(Math.max(declared - 500, 0) * 0.01) : 0;
  const discount = draft.promoDiscount ?? 0;
  return { shipping, protection, discount, total: Math.max(shipping + protection - discount, 0) };
}

export const MOCK_PROMO_CODES: Record<string, number> = {
  SULIT10: 10,
  GOGO20:  20,
  FIRST15: 15,
};
