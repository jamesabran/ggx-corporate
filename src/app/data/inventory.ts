/**
 * Inventory product mock data. Scoped per account/subaccount via
 * `scopeAccountId`. See docs/inventory_rules.md.
 *
 * Stock is authoritative-backend data; the frontend never deducts stock on its
 * own (deduction happens on confirmed booking/order, server-side). Future BFF:
 * GET/POST/PUT/DELETE /accounts/:id/inventory/products.
 */

import { loadState, saveState } from '../lib/storage';

export type ProductStatus = 'active' | 'inactive';

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface InventoryProduct {
  id: string;
  /** Canonical account/subaccount id that owns this product. */
  scopeAccountId: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  unitPrice: number;
  /** Weight in kg. */
  weight: number;
  dimensions: ProductDimensions;
  stockQuantity: number;
  lowStockThreshold: number;
  /** When true, stock is treated as unlimited (no cap / never low). */
  unlimitedStock: boolean;
  /** Product photos (data URLs in the demo; a CDN/asset pipeline in production). */
  images: string[];
  /** Chosen cover photo (defaults to images[0] when unset). */
  coverImage?: string;
  status: ProductStatus;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

/** Editable product fields (everything except id/scope/audit/timestamps). */
export interface ProductInput {
  name: string;
  sku: string;
  description: string;
  category: string;
  unitPrice: number;
  weight: number;
  dimensions: ProductDimensions;
  stockQuantity: number;
  lowStockThreshold: number;
  unlimitedStock: boolean;
  images: string[];
  coverImage?: string;
  status: ProductStatus;
}

/** High-level product categories (kept intentionally broad for the demo). */
export const PRODUCT_CATEGORIES = [
  'Apparel',
  'Beauty & Personal Care',
  'Food & Beverages',
  'Gadgets & Electronics',
  'Home & Living',
  'Health & Wellness',
  'Books & Stationery',
  'Toys & Hobbies',
  'Other',
] as const;

/** Resolve a product's cover photo (selected cover, else first image, else none). */
export function productCover(p: { images: string[]; coverImage?: string }): string | undefined {
  return p.coverImage ?? p.images[0];
}

// Demo seed — products owned by Acme Luzon (the scope with Inventory enabled).
const SEED_PRODUCTS: InventoryProduct[] = [
  {
    id: 'prod-1001', scopeAccountId: 'acme-luzon',
    name: 'Premium Coffee Beans 1kg', sku: 'COF-1KG-001',
    description: 'Single-origin arabica beans, whole bean, 1kg resealable pack.',
    category: 'Food & Beverages', unitPrice: 850, weight: 1.05,
    dimensions: { length: 20, width: 12, height: 8 },
    stockQuantity: 320, lowStockThreshold: 50, unlimitedStock: false, images: [],
    status: 'active', createdBy: 'Rina Lopez', updatedBy: 'Rina Lopez',
    createdAt: '2026-04-02T09:00:00Z', updatedAt: '2026-06-01T14:20:00Z',
  },
  {
    id: 'prod-1002', scopeAccountId: 'acme-luzon',
    name: 'Stainless Tumbler 500ml', sku: 'TMB-500-014',
    description: 'Double-wall insulated stainless steel tumbler, 500ml.',
    category: 'Home & Living', unitPrice: 420, weight: 0.35,
    dimensions: { length: 9, width: 9, height: 22 },
    stockQuantity: 38, lowStockThreshold: 40, unlimitedStock: false, images: [],
    status: 'active', createdBy: 'Rina Lopez', updatedBy: 'Rina Lopez',
    createdAt: '2026-04-10T10:30:00Z', updatedAt: '2026-05-28T11:05:00Z',
  },
  {
    id: 'prod-1003', scopeAccountId: 'acme-luzon',
    name: 'Canvas Tote Bag', sku: 'BAG-CNV-007',
    description: 'Heavy-duty 12oz canvas tote, natural color.',
    category: 'Apparel', unitPrice: 290, weight: 0.25,
    dimensions: { length: 38, width: 42, height: 2 },
    stockQuantity: 0, lowStockThreshold: 25, unlimitedStock: false, images: [],
    status: 'inactive', createdBy: 'Rina Lopez', updatedBy: 'Rina Lopez',
    createdAt: '2026-03-18T08:15:00Z', updatedAt: '2026-05-12T16:40:00Z',
  },
];

// Demo persistence: products survive refresh via localStorage (key
// `ggx.inventory.products`); falls back to the seed when nothing is stored.
// Reset by clearing that key. Photos persist as data URLs on the product.
const STORE_KEY = 'inventory.products';
let products: InventoryProduct[] = loadState<InventoryProduct[]>(STORE_KEY, SEED_PRODUCTS);
function persist(): void { saveState(STORE_KEY, products); }

/** Return products owned by a scope. Pass undefined for none (gated route). */
export function getProductsForScope(scopeId: string | undefined): InventoryProduct[] {
  if (!scopeId) return [];
  return products.filter((p) => p.scopeAccountId === scopeId);
}

export function getProductById(id: string): InventoryProduct | undefined {
  return products.find((p) => p.id === id);
}

/** Resolve products by id, preserving the given id order (unknown ids skipped). */
export function getProductsByIds(ids: string[]): InventoryProduct[] {
  return ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is InventoryProduct => !!p);
}

// ─── Mutations (persisted to localStorage; backend-owned in production) ─────────

const nowIso = (): string => new Date().toISOString();

/** Next id derived from the current max numeric suffix (collision-safe after reload). */
function nextProductId(): string {
  const max = products.reduce((m, p) => {
    const n = Number(p.id.replace(/\D/g, ''));
    return Number.isFinite(n) && n > m ? n : m;
  }, 1100);
  return `prod-${max + 1}`;
}

/** Create a product owned by a scope. Returns the created record. */
export function createProduct(
  scopeAccountId: string,
  input: ProductInput,
  actor = 'Current User',
): InventoryProduct {
  const ts = nowIso();
  const product: InventoryProduct = {
    id: nextProductId(),
    scopeAccountId,
    ...input,
    createdBy: actor,
    updatedBy: actor,
    createdAt: ts,
    updatedAt: ts,
  };
  products = [product, ...products];
  persist();
  return product;
}

/** Patch an existing product's editable fields. Returns the updated record. */
export function updateProduct(
  id: string,
  patch: Partial<ProductInput>,
  actor = 'Current User',
): InventoryProduct | undefined {
  let updated: InventoryProduct | undefined;
  products = products.map((p) => {
    if (p.id !== id) return p;
    updated = { ...p, ...patch, updatedBy: actor, updatedAt: nowIso() };
    return updated;
  });
  if (updated) persist();
  return updated;
}

/** Remove a product. Returns true when a record was removed. */
export function deleteProduct(id: string): boolean {
  const before = products.length;
  products = products.filter((p) => p.id !== id);
  const removed = products.length < before;
  if (removed) persist();
  return removed;
}

/** Bulk-create products for a scope (import). Returns the created records. */
export function importProducts(
  scopeAccountId: string,
  inputs: ProductInput[],
  actor = 'Current User',
): InventoryProduct[] {
  return inputs.map((input) => createProduct(scopeAccountId, input, actor));
}
