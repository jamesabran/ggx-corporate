/**
 * Inventory service facade. Contract between Inventory UI and the BFF.
 * Currently backed by data/inventory.ts. Scoping is enforced here: a viewer only
 * receives products owned by their resolved scope.
 *
 * Future BFF:
 *   GET    /accounts/:id/inventory/products   → getInventoryProducts
 *   GET    /inventory/products/:productId     → getInventoryProduct
 *   POST   /accounts/:id/inventory/products   → createProduct
 *   PUT    /inventory/products/:productId     → updateProduct
 *   DELETE /inventory/products/:productId     → deleteProduct
 *
 * Stock deduction is a backend operation tied to confirmed bookings/orders — the
 * frontend never mutates authoritative stock. See docs/inventory_rules.md.
 */

import {
  getProductsForScope,
  getProductById,
  type InventoryProduct,
  type ProductStatus,
  type ProductDimensions,
} from '../data/inventory';

export type { InventoryProduct, ProductStatus, ProductDimensions };

/** Return inventory products for a scope (subaccount/account). */
export async function getInventoryProducts(scopeId: string | undefined): Promise<InventoryProduct[]> {
  return getProductsForScope(scopeId);
}

/** Return a single product by id (or null). */
export async function getInventoryProduct(id: string): Promise<InventoryProduct | null> {
  return getProductById(id) ?? null;
}

/** True when stock is at/under the low-stock threshold (presentation helper). */
export function isLowStock(p: InventoryProduct): boolean {
  return p.stockQuantity <= p.lowStockThreshold;
}
