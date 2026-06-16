export interface BasicAddress {
  id: string;
  name: string;
  mobile: string;
  street: string;
  unit: string;
  province: string;
  city: string;
  barangay: string;
  landmark: string;
  isDefaultSender: boolean;
  updatedAt: number;
}

const STORAGE_KEY = 'ggx_basic_address_book';
const RECENT_KEY  = 'ggx_basic_recent_addresses';

const SEED_ADDRESSES: BasicAddress[] = [
  {
    id: 'addr-seed-1',
    name: 'Max Rodriguez',
    mobile: '+63 917 627 5845',
    street: '2287 Allegro Center, Chino Roces Ext.',
    unit: '5F',
    province: 'Metro Manila',
    city: 'Makati City',
    barangay: 'Magallanes',
    landmark: 'Near BDO Magallanes branch',
    isDefaultSender: true,
    updatedAt: Date.now() - 7200000,
  },
  {
    id: 'addr-seed-2',
    name: 'Acme Warehouse – North',
    mobile: '+63 918 234 5678',
    street: 'Km. 34, McArthur Highway',
    unit: '',
    province: 'Bulacan',
    city: 'Calumpit',
    barangay: 'Corazon',
    landmark: 'Near Petron Station',
    isDefaultSender: false,
    updatedAt: Date.now() - 86400000,
  },
];

function loadAll(): BasicAddress[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as BasicAddress[];
  } catch {}
  return [...SEED_ADDRESSES];
}

function persistAll(list: BasicAddress[]): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
}

export function getAddresses(): BasicAddress[] {
  return loadAll();
}

export function getDefaultSenderAddress(): BasicAddress | null {
  const all = loadAll();
  return all.find((a) => a.isDefaultSender) ?? all[0] ?? null;
}

export function upsertAddress(address: BasicAddress): void {
  const list = loadAll();
  const idx = list.findIndex((a) => a.id === address.id);
  const updated = { ...address, updatedAt: Date.now() };
  if (idx >= 0) list[idx] = updated;
  else list.unshift(updated);
  persistAll(list);
}

export function removeAddress(id: string): void {
  persistAll(loadAll().filter((a) => a.id !== id));
}

export function setDefaultSender(id: string): void {
  persistAll(loadAll().map((a) => ({ ...a, isDefaultSender: a.id === id })));
}

export function getRecentAddresses(): BasicAddress[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as BasicAddress[]) : [];
  } catch {
    return [];
  }
}

export function recordRecentAddress(address: BasicAddress): void {
  try {
    const recent = getRecentAddresses().filter((a) => a.id !== address.id);
    localStorage.setItem(RECENT_KEY, JSON.stringify([address, ...recent].slice(0, 5)));
  } catch {}
}

export function newAddressId(): string {
  return `addr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
