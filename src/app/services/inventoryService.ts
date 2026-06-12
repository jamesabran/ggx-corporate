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
  getProductsByIds,
  productCover,
  PRODUCT_CATEGORIES,
  createProduct,
  updateProduct,
  deleteProduct,
  importProducts,
  type InventoryProduct,
  type ProductStatus,
  type ProductDimensions,
  type ProductInput,
} from '../data/inventory';

export type { InventoryProduct, ProductStatus, ProductDimensions, ProductInput };
export { productCover, PRODUCT_CATEGORIES };

/** Return inventory products for a scope (subaccount/account). */
export async function getInventoryProducts(scopeId: string | undefined): Promise<InventoryProduct[]> {
  return getProductsForScope(scopeId);
}

/** Return a single product by id (or null). */
export async function getInventoryProduct(id: string): Promise<InventoryProduct | null> {
  return getProductById(id) ?? null;
}

/** Resolve products by id list (used by the storefront listing). */
export async function getInventoryProductsByIds(ids: string[]): Promise<InventoryProduct[]> {
  return getProductsByIds(ids);
}

/** Create a product in the given scope. */
export async function createInventoryProduct(
  scopeId: string,
  input: ProductInput,
): Promise<InventoryProduct> {
  return createProduct(scopeId, input);
}

/** Update an existing product. Returns null when the id is unknown. */
export async function updateInventoryProduct(
  id: string,
  patch: Partial<ProductInput>,
): Promise<InventoryProduct | null> {
  return updateProduct(id, patch) ?? null;
}

/** Delete a product. Returns true when removed. */
export async function deleteInventoryProduct(id: string): Promise<boolean> {
  return deleteProduct(id);
}

/** Bulk-import products into a scope. */
export async function importInventoryProducts(
  scopeId: string,
  inputs: ProductInput[],
): Promise<InventoryProduct[]> {
  return importProducts(scopeId, inputs);
}

/** True when stock is at/under the low-stock threshold (unlimited is never low). */
export function isLowStock(p: InventoryProduct): boolean {
  return !p.unlimitedStock && p.stockQuantity <= p.lowStockThreshold;
}

// ─── CSV import / export (presentation helpers) ────────────────────────────────

const CSV_COLUMNS = [
  'name', 'sku', 'category', 'description', 'unitPrice', 'weight',
  'length', 'width', 'height', 'stockQuantity', 'lowStockThreshold', 'status',
] as const;

function csvCell(v: string | number): string {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Serialize products to a CSV string (header + one row per product). */
export function productsToCsv(products: InventoryProduct[]): string {
  const header = CSV_COLUMNS.join(',');
  const rows = products.map((p) =>
    [
      p.name, p.sku, p.category, p.description, p.unitPrice, p.weight,
      p.dimensions.length, p.dimensions.width, p.dimensions.height,
      p.stockQuantity, p.lowStockThreshold, p.status,
    ].map(csvCell).join(','),
  );
  return [header, ...rows].join('\n');
}

export interface CsvParseResult {
  products: ProductInput[];
  errors: string[];
}

/**
 * Parse a pasted CSV/TSV block into ProductInput rows. The first line is a header
 * mapped by column name (order-independent); `name` and `sku` are required.
 * Basic split (no quoted-field handling) — sufficient for the demo import. Real
 * file parsing + validation is a backend/BFF concern.
 */
export function parseProductsCsv(text: string): CsvParseResult {
  const errors: string[] = [];
  const lines = text.replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    errors.push('Provide a header row and at least one product row.');
    return { products: [], errors };
  }

  const delim = lines[0].includes('\t') ? '\t' : ',';
  const header = lines[0].split(delim).map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name.toLowerCase());
  const iName = idx('name');
  const iSku = idx('sku');
  if (iName === -1 || iSku === -1) {
    errors.push('Header must include at least "name" and "sku".');
    return { products: [], errors };
  }

  const iCat = idx('category'), iDesc = idx('description'), iPrice = idx('unitPrice'),
    iWeight = idx('weight'), iL = idx('length'), iW = idx('width'), iH = idx('height'),
    iStock = idx('stockQuantity'), iLow = idx('lowStockThreshold'), iStatus = idx('status');

  const products: ProductInput[] = [];
  for (let r = 1; r < lines.length; r++) {
    const cells = lines[r].split(delim).map((c) => c.trim());
    const name = cells[iName] ?? '';
    const sku = cells[iSku] ?? '';
    if (!name || !sku) {
      errors.push(`Row ${r + 1}: name and SKU are required — skipped.`);
      continue;
    }
    const num = (i: number, d = 0) => {
      if (i === -1) return d;
      const n = Number(cells[i]);
      return Number.isFinite(n) ? n : d;
    };
    const statusRaw = (iStatus !== -1 ? cells[iStatus] : '').toLowerCase();
    products.push({
      name,
      sku,
      category: iCat !== -1 && cells[iCat] ? cells[iCat] : 'Uncategorized',
      description: iDesc !== -1 ? (cells[iDesc] ?? '') : '',
      unitPrice: num(iPrice),
      weight: num(iWeight),
      dimensions: { length: num(iL), width: num(iW), height: num(iH) },
      stockQuantity: num(iStock),
      lowStockThreshold: num(iLow, 10),
      unlimitedStock: false,
      images: [],
      status: statusRaw === 'inactive' ? 'inactive' : 'active',
    });
  }
  return { products, errors };
}
