/**
 * Inventory product mock data. Scoped per account/subaccount via
 * `scopeAccountId`. See docs/inventory_rules.md.
 *
 * Stock is authoritative-backend data; the frontend never deducts stock on its
 * own (deduction happens on confirmed booking/order, server-side). Future BFF:
 * GET/POST/PUT/DELETE /accounts/:id/inventory/products.
 */

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
  /** Image placeholder reference (no real asset pipeline yet). */
  imageUrl?: string;
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
  status: ProductStatus;
}

// Demo seed — products owned by Acme Luzon (the scope with Inventory enabled).
// Mutable session store: create/edit/delete/import operate on this array for the
// tab session (resets to the seed on reload). Authoritative stock + persistence
// are backend concerns. See docs/inventory_rules.md.
let products: InventoryProduct[] = [
  {
    id: 'prod-1001', scopeAccountId: 'acme-luzon',
    name: 'Premium Coffee Beans 1kg', sku: 'COF-1KG-001',
    description: 'Single-origin arabica beans, whole bean, 1kg resealable pack.',
    category: 'Food & Beverage', unitPrice: 850, weight: 1.05,
    dimensions: { length: 20, width: 12, height: 8 },
    stockQuantity: 320, lowStockThreshold: 50,
    status: 'active', createdBy: 'Rina Lopez', updatedBy: 'Rina Lopez',
    createdAt: '2026-04-02T09:00:00Z', updatedAt: '2026-06-01T14:20:00Z',
  },
  {
    id: 'prod-1002', scopeAccountId: 'acme-luzon',
    name: 'Stainless Tumbler 500ml', sku: 'TMB-500-014',
    description: 'Double-wall insulated stainless steel tumbler, 500ml.',
    category: 'Drinkware', unitPrice: 420, weight: 0.35,
    dimensions: { length: 9, width: 9, height: 22 },
    stockQuantity: 38, lowStockThreshold: 40,
    status: 'active', createdBy: 'Rina Lopez', updatedBy: 'Rina Lopez',
    createdAt: '2026-04-10T10:30:00Z', updatedAt: '2026-05-28T11:05:00Z',
  },
  {
    id: 'prod-1003', scopeAccountId: 'acme-luzon',
    name: 'Canvas Tote Bag', sku: 'BAG-CNV-007',
    description: 'Heavy-duty 12oz canvas tote, natural color.',
    category: 'Bags', unitPrice: 290, weight: 0.25,
    dimensions: { length: 38, width: 42, height: 2 },
    stockQuantity: 0, lowStockThreshold: 25,
    status: 'inactive', createdBy: 'Rina Lopez', updatedBy: 'Rina Lopez',
    createdAt: '2026-03-18T08:15:00Z', updatedAt: '2026-05-12T16:40:00Z',
  },
];

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

// ─── Mutations (session-only; backend-owned in production) ──────────────────────

let productSeq = 1100; // seed uses prod-1001..1003; new ids start above that.
const nextProductId = (): string => `prod-${++productSeq}`;
const nowIso = (): string => new Date().toISOString();

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
  return updated;
}

/** Remove a product. Returns true when a record was removed. */
export function deleteProduct(id: string): boolean {
  const before = products.length;
  products = products.filter((p) => p.id !== id);
  return products.length < before;
}

/** Bulk-create products for a scope (import). Returns the created records. */
export function importProducts(
  scopeAccountId: string,
  inputs: ProductInput[],
  actor = 'Current User',
): InventoryProduct[] {
  return inputs.map((input) => createProduct(scopeAccountId, input, actor));
}
