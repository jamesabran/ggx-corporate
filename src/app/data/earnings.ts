// Earnings / Settlements mock data (frontend only).
//
// Consumed by Earnings.tsx (list) and EarningsSettlementDetail.tsx (detail).
// Each settlement includes a small set of mock transactions so the detail page
// has something to render. Tracking numbers that exist in transactions.ts are
// used where they match; the rest are illustrative mock IDs.

export type SettlementStatus = 'pending' | 'processing' | 'scheduled' | 'deposited' | 'failed' | 'on-hold';

export interface SettlementTransaction {
  trackingNumber: string;
  recipient: string;
  destination: string;
  codAmount: number;
  fees: number;
  net: number;
  status: 'delivered' | 'failed' | 'returned';
}

export interface Settlement {
  id: string;
  source: string;
  period: string;
  grossAmount: number;
  fees: number;
  netAmount: number;
  status: SettlementStatus;
  expectedDate: string;
  subaccount: string;
  subaccountId?: string;
  transactions: SettlementTransaction[];
}

export const SETTLEMENT_STATUS_CONFIG: Record<SettlementStatus, { variant: 'pending' | 'info' | 'warning' | 'success' | 'danger' | 'default'; label: string }> = {
  pending:    { variant: 'pending', label: 'Pending Collection' },
  processing: { variant: 'info',    label: 'Processing' },
  scheduled:  { variant: 'warning', label: 'Scheduled' },
  deposited:  { variant: 'success', label: 'Deposited' },
  failed:     { variant: 'danger',  label: 'Failed' },
  'on-hold':  { variant: 'default', label: 'On Hold' },
};

export const SETTLEMENTS: Settlement[] = [
  {
    id: 'SET-2026-05-003',
    source: 'COD',
    period: 'May 13–18, 2026',
    grossAmount: 487500,
    fees: 14625,
    netAmount: 472875,
    status: 'scheduled',
    expectedDate: '2026-05-22',
    subaccount: 'Acme Corporation',
    subaccountId: 'acme-corporation',
    transactions: [
      { trackingNumber: 'GGX-2024-89240', recipient: 'Maria Santos',    destination: 'Quezon City',   codAmount: 1850, fees: 55.50, net: 1794.50, status: 'delivered' },
      { trackingNumber: 'GGX-2024-89238', recipient: 'Juan dela Cruz',  destination: 'Makati City',   codAmount: 3200, fees: 96.00, net: 3104.00, status: 'delivered' },
      { trackingNumber: 'GGX-2024-89235', recipient: 'Ana Reyes',       destination: 'Pasig City',    codAmount: 4500, fees: 135.00, net: 4365.00, status: 'delivered' },
      { trackingNumber: 'GGX-2024-89231', recipient: 'Jose Garcia',     destination: 'Taguig City',   codAmount: 4300, fees: 129.00, net: 4171.00, status: 'failed' },
    ],
  },
  {
    id: 'SET-2026-05-002',
    source: 'COD',
    period: 'May 6–12, 2026',
    grossAmount: 523000,
    fees: 15690,
    netAmount: 507310,
    status: 'deposited',
    expectedDate: '2026-05-15',
    subaccount: 'Acme Luzon',
    subaccountId: 'acme-luzon',
    transactions: [
      { trackingNumber: 'GGX-2024-89239', recipient: 'Carmen Lopez',    destination: 'Cebu City',     codAmount: 2100, fees: 63.00, net: 2037.00, status: 'delivered' },
      { trackingNumber: 'GGX-2024-89237', recipient: 'Pedro Villanueva', destination: 'Davao City',   codAmount: 5500, fees: 165.00, net: 5335.00, status: 'delivered' },
      { trackingNumber: 'GGX-2024-89236', recipient: 'Luz Fernandez',   destination: 'Iloilo City',   codAmount: 12300, fees: 369.00, net: 11931.00, status: 'failed' },
    ],
  },
  {
    id: 'SET-2026-05-001',
    source: 'COD',
    period: 'May 1–5, 2026',
    grossAmount: 398200,
    fees: 11946,
    netAmount: 386254,
    status: 'deposited',
    expectedDate: '2026-05-08',
    subaccount: 'Acme Corporation',
    subaccountId: 'acme-corporation',
    transactions: [
      { trackingNumber: 'GGX-2024-89234', recipient: 'Roberto Cruz',    destination: 'Mandaluyong',   codAmount: 7800, fees: 234.00, net: 7566.00, status: 'delivered' },
      { trackingNumber: 'GGX-2024-89233', recipient: 'Sofia Mendoza',   destination: 'San Juan City', codAmount: 3200, fees: 96.00,  net: 3104.00, status: 'delivered' },
      { trackingNumber: 'GGX-2024-89232', recipient: 'Emmanuel Torres', destination: 'Caloocan City', codAmount: 6100, fees: 183.00, net: 5917.00, status: 'returned' },
    ],
  },
  {
    id: 'SET-2026-04-006',
    source: 'COD',
    period: 'Apr 27–30, 2026',
    grossAmount: 445600,
    fees: 13368,
    netAmount: 432232,
    status: 'deposited',
    expectedDate: '2026-05-02',
    subaccount: 'Acme Luzon',
    subaccountId: 'acme-luzon',
    transactions: [
      { trackingNumber: 'GGX-2024-89230', recipient: 'Remedios Ocampo', destination: 'Bacolod City',  codAmount: 4400, fees: 132.00, net: 4268.00, status: 'delivered' },
      { trackingNumber: 'GGX-2024-89229', recipient: 'Danilo Bautista', destination: 'General Santos', codAmount: 9200, fees: 276.00, net: 8924.00, status: 'delivered' },
    ],
  },
  {
    id: 'SET-2026-04-005',
    source: 'Online Payment',
    period: 'Apr 20–26, 2026',
    grossAmount: 612800,
    fees: 18384,
    netAmount: 594416,
    status: 'processing',
    expectedDate: '2026-04-29',
    subaccount: 'Acme Corporation',
    subaccountId: 'acme-corporation',
    transactions: [
      { trackingNumber: 'GGX-2024-89228', recipient: 'Gloria Aquino',   destination: 'Angeles City',  codAmount: 0,    fees: 150.00, net: -150.00, status: 'delivered' },
      { trackingNumber: 'GGX-2024-89227', recipient: 'Vicente Ramos',   destination: 'Antipolo City', codAmount: 0,    fees: 150.00, net: -150.00, status: 'delivered' },
      { trackingNumber: 'GGX-2024-89226', recipient: 'Maricel Santos',  destination: 'Imus, Cavite',  codAmount: 0,    fees: 150.00, net: -150.00, status: 'delivered' },
    ],
  },
];

export function getSettlement(id: string): Settlement | undefined {
  return SETTLEMENTS.find((s) => s.id === id);
}
