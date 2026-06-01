/**
 * dataAnalyticsService — aggregate performance metrics for Data Analytics page.
 *
 * All functions are async to match a real API contract.
 * Mock data is scoped by subaccount: Acme Luzon ~55% of consolidated, Acme Visayas ~35%,
 * Acme Corporation ~85% (regional aggregate), main/consolidated = full values.
 *
 * Future API endpoints:
 *   GET /analytics/overview?subaccountId=&period=  → getAnalyticsOverview
 *   GET /analytics/charts?subaccountId=&period=    → getAnalyticsCharts
 */

export interface AnalyticsOverview {
  totalOrders: number;
  fulfilledOrders: number;
  deliveryEfficiencyPct: number;
  rtsRatePct: number;
  slaHitPct: number;
  slaMissPct: number;
  totalReturns: number;
  amountSettledBase: number;
}

export interface MonthlyVolumePoint {
  month: string;
  orders: number;
}

export interface FulfillmentTrendPoint {
  month: string;
  fulfilled: number;
  rts: number;
}

export interface RegionVolumePoint {
  name: string;
  value: number;
  color: string;
}

export interface DeliveryDaysPoint {
  area: string;
  days: number;
}

export interface ReturnReasonPoint {
  reason: string;
  count: number;
}

export interface SlaDistribution {
  name: string;
  value: number;
  color: string;
}

export interface AnalyticsCharts {
  monthlyVolume: MonthlyVolumePoint[];
  fulfillmentTrend: FulfillmentTrendPoint[];
  regionVolume: RegionVolumePoint[];
  avgDeliveryDays: DeliveryDaysPoint[];
  returnsByReason: ReturnReasonPoint[];
  slaHitMiss: SlaDistribution[];
}

export interface AnalyticsContext {
  subaccountId?: string;
}

// ---------------------------------------------------------------------------
// Consolidated (main account) seed data
// ---------------------------------------------------------------------------

const CONSOLIDATED_OVERVIEW: AnalyticsOverview = {
  totalOrders: 12794,
  fulfilledOrders: 12180,
  deliveryEfficiencyPct: 95.2,
  rtsRatePct: 3.1,
  slaHitPct: 96.4,
  slaMissPct: 3.6,
  totalReturns: 397,
  amountSettledBase: 2418000,
};

const CONSOLIDATED_CHARTS: AnalyticsCharts = {
  monthlyVolume: [
    { month: 'Jan', orders: 2501 },
    { month: 'Feb', orders: 2312 },
    { month: 'Mar', orders: 2678 },
    { month: 'Apr', orders: 2456 },
    { month: 'May', orders: 2847 },
  ],
  fulfillmentTrend: [
    { month: 'Jan', fulfilled: 95.0, rts: 3.4 },
    { month: 'Feb', fulfilled: 94.6, rts: 3.8 },
    { month: 'Mar', fulfilled: 95.4, rts: 3.0 },
    { month: 'Apr', fulfilled: 95.8, rts: 2.8 },
    { month: 'May', fulfilled: 95.2, rts: 3.1 },
  ],
  regionVolume: [
    { name: 'Metro Manila', value: 6120, color: '#3b82f6' },
    { name: 'Luzon (ex-NCR)', value: 3340, color: '#6366f1' },
    { name: 'Visayas', value: 2010, color: '#10b981' },
    { name: 'Mindanao', value: 1324, color: '#f59e0b' },
  ],
  avgDeliveryDays: [
    { area: 'Metro Manila', days: 1.4 },
    { area: 'Luzon (ex-NCR)', days: 2.1 },
    { area: 'Visayas', days: 3.0 },
    { area: 'Mindanao', days: 3.6 },
  ],
  returnsByReason: [
    { reason: 'Recipient unavailable', count: 168 },
    { reason: 'Incorrect address', count: 96 },
    { reason: 'Refused on delivery', count: 71 },
    { reason: 'Damaged in transit', count: 38 },
    { reason: 'Other', count: 24 },
  ],
  slaHitMiss: [
    { name: 'SLA Hit', value: 96.4, color: '#10b981' },
    { name: 'SLA Miss', value: 3.6, color: '#ef4444' },
  ],
};

// ---------------------------------------------------------------------------
// Subaccount-scoped seed data
// Acme Luzon: NCR/Luzon-heavy operation, ~55% of consolidated volume
// Acme Visayas: Visayas-focused, ~35% of consolidated volume
// Acme Corporation: ~85% aggregate (parent org across regions)
// ---------------------------------------------------------------------------

const SUBACCOUNT_OVERRIDES: Record<string, Partial<AnalyticsOverview> & { charts: Partial<AnalyticsCharts> }> = {
  'acme-luzon': {
    totalOrders: 7037,
    fulfilledOrders: 6720,
    deliveryEfficiencyPct: 95.5,
    rtsRatePct: 2.9,
    slaHitPct: 97.1,
    slaMissPct: 2.9,
    totalReturns: 198,
    amountSettledBase: 1312000,
    charts: {
      monthlyVolume: [
        { month: 'Jan', orders: 1376 },
        { month: 'Feb', orders: 1272 },
        { month: 'Mar', orders: 1473 },
        { month: 'Apr', orders: 1350 },
        { month: 'May', orders: 1566 },
      ],
      fulfillmentTrend: [
        { month: 'Jan', fulfilled: 95.3, rts: 3.1 },
        { month: 'Feb', fulfilled: 94.9, rts: 3.5 },
        { month: 'Mar', fulfilled: 95.7, rts: 2.7 },
        { month: 'Apr', fulfilled: 96.1, rts: 2.5 },
        { month: 'May', fulfilled: 95.5, rts: 2.9 },
      ],
      regionVolume: [
        { name: 'Metro Manila', value: 4230, color: '#3b82f6' },
        { name: 'Luzon (ex-NCR)', value: 2510, color: '#6366f1' },
        { name: 'Visayas', value: 210, color: '#10b981' },
        { name: 'Mindanao', value: 87, color: '#f59e0b' },
      ],
      returnsByReason: [
        { reason: 'Recipient unavailable', count: 84 },
        { reason: 'Incorrect address', count: 52 },
        { reason: 'Refused on delivery', count: 38 },
        { reason: 'Damaged in transit', count: 16 },
        { reason: 'Other', count: 8 },
      ],
      slaHitMiss: [
        { name: 'SLA Hit', value: 97.1, color: '#10b981' },
        { name: 'SLA Miss', value: 2.9, color: '#ef4444' },
      ],
    },
  },
  'acme-visayas': {
    totalOrders: 4478,
    fulfilledOrders: 4205,
    deliveryEfficiencyPct: 93.9,
    rtsRatePct: 4.4,
    slaHitPct: 94.2,
    slaMissPct: 5.8,
    totalReturns: 178,
    amountSettledBase: 872000,
    charts: {
      monthlyVolume: [
        { month: 'Jan', orders: 875 },
        { month: 'Feb', orders: 809 },
        { month: 'Mar', orders: 937 },
        { month: 'Apr', orders: 859 },
        { month: 'May', orders: 998 },
      ],
      fulfillmentTrend: [
        { month: 'Jan', fulfilled: 93.7, rts: 4.6 },
        { month: 'Feb', fulfilled: 93.2, rts: 5.1 },
        { month: 'Mar', fulfilled: 94.1, rts: 4.2 },
        { month: 'Apr', fulfilled: 94.5, rts: 4.0 },
        { month: 'May', fulfilled: 93.9, rts: 4.4 },
      ],
      regionVolume: [
        { name: 'Metro Manila', value: 320, color: '#3b82f6' },
        { name: 'Luzon (ex-NCR)', value: 410, color: '#6366f1' },
        { name: 'Visayas', value: 3412, color: '#10b981' },
        { name: 'Mindanao', value: 336, color: '#f59e0b' },
      ],
      returnsByReason: [
        { reason: 'Recipient unavailable', count: 74 },
        { reason: 'Incorrect address', count: 38 },
        { reason: 'Refused on delivery', count: 28 },
        { reason: 'Damaged in transit', count: 24 },
        { reason: 'Other', count: 14 },
      ],
      slaHitMiss: [
        { name: 'SLA Hit', value: 94.2, color: '#10b981' },
        { name: 'SLA Miss', value: 5.8, color: '#ef4444' },
      ],
    },
  },
  'acme-corporation': {
    totalOrders: 10875,
    fulfilledOrders: 10332,
    deliveryEfficiencyPct: 95.0,
    rtsRatePct: 3.3,
    slaHitPct: 96.0,
    slaMissPct: 4.0,
    totalReturns: 338,
    amountSettledBase: 2054000,
    charts: {
      monthlyVolume: [
        { month: 'Jan', orders: 2126 },
        { month: 'Feb', orders: 1965 },
        { month: 'Mar', orders: 2276 },
        { month: 'Apr', orders: 2088 },
        { month: 'May', orders: 2420 },
      ],
      fulfillmentTrend: [
        { month: 'Jan', fulfilled: 94.8, rts: 3.5 },
        { month: 'Feb', fulfilled: 94.4, rts: 3.9 },
        { month: 'Mar', fulfilled: 95.2, rts: 3.2 },
        { month: 'Apr', fulfilled: 95.6, rts: 3.0 },
        { month: 'May', fulfilled: 95.0, rts: 3.3 },
      ],
      regionVolume: [
        { name: 'Metro Manila', value: 5202, color: '#3b82f6' },
        { name: 'Luzon (ex-NCR)', value: 2839, color: '#6366f1' },
        { name: 'Visayas', value: 1709, color: '#10b981' },
        { name: 'Mindanao', value: 1125, color: '#f59e0b' },
      ],
      returnsByReason: [
        { reason: 'Recipient unavailable', count: 143 },
        { reason: 'Incorrect address', count: 82 },
        { reason: 'Refused on delivery', count: 60 },
        { reason: 'Damaged in transit', count: 32 },
        { reason: 'Other', count: 21 },
      ],
      slaHitMiss: [
        { name: 'SLA Hit', value: 96.0, color: '#10b981' },
        { name: 'SLA Miss', value: 4.0, color: '#ef4444' },
      ],
    },
  },
};

function resolveScope(context?: AnalyticsContext): {
  overview: AnalyticsOverview;
  charts: AnalyticsCharts;
} {
  const id = context?.subaccountId;
  const override = id ? SUBACCOUNT_OVERRIDES[id] : undefined;

  if (!override) {
    return { overview: CONSOLIDATED_OVERVIEW, charts: CONSOLIDATED_CHARTS };
  }

  const { charts: chartOverrides, ...overviewOverrides } = override;
  return {
    overview: { ...CONSOLIDATED_OVERVIEW, ...overviewOverrides },
    charts: { ...CONSOLIDATED_CHARTS, ...chartOverrides },
  };
}

/** Return aggregate performance overview metrics, scoped to a subaccount when provided. */
export async function getAnalyticsOverview(context?: AnalyticsContext): Promise<AnalyticsOverview> {
  return resolveScope(context).overview;
}

/** Return chart/time-series data, scoped to a subaccount when provided. */
export async function getAnalyticsCharts(context?: AnalyticsContext): Promise<AnalyticsCharts> {
  return resolveScope(context).charts;
}

/** Return both overview and charts in a single call. */
export async function getAnalyticsData(context?: AnalyticsContext): Promise<{
  overview: AnalyticsOverview;
  charts: AnalyticsCharts;
}> {
  return resolveScope(context);
}
