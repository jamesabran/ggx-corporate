import { useEffect, useMemo, useState } from 'react';
import {
  IconPackage, IconPlus, IconPencil, IconTrash, IconUpload, IconDownload, IconInfoCircle,
} from '@tabler/icons-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Dialog, ConfirmDialog } from '../components/ui/Dialog';
import { EnablementGate } from '../components/EnablementGate';
import { ProductFormDialog } from '../components/ProductFormDialog';
import { useModuleAccessContext } from '../hooks/useModuleAccess';
import { isFeatureUsable } from '../services/featureEnablementService';
import {
  getInventoryProducts, createInventoryProduct, updateInventoryProduct,
  deleteInventoryProduct, importInventoryProducts, productsToCsv, parseProductsCsv,
  isLowStock, type InventoryProduct, type ProductInput,
} from '../services/inventoryService';

/** Trigger a client-side CSV download (export is a presentation helper). */
function downloadCsv(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Inventory — product list + create / edit / delete / import / export, scoped to
 * the current account/subaccount and gated by role permissions. Renders the
 * EnablementGate when Inventory isn't usable for the scope. See
 * docs/inventory_rules.md. Stock here is a managed field (merchant inventory);
 * booking-time deduction stays a backend concern.
 */
export function Inventory() {
  const ctx = useModuleAccessContext();
  const scopeId = ctx.scopeAccountId;
  const can = (key: Parameters<typeof ctx.permissions.includes>[0]) => ctx.permissions.includes(key);
  // Mutations need a concrete scope (a subaccount/standard scope, not the
  // consolidated Main Account view).
  const canMutate = !!scopeId;

  const [usable, setUsable] = useState<boolean | null>(null);
  const [products, setProducts] = useState<InventoryProduct[]>([]);

  const reload = () => { if (scopeId) getInventoryProducts(scopeId).then(setProducts); };

  useEffect(() => {
    let active = true;
    isFeatureUsable('inventory', scopeId).then((ok) => {
      if (!active) return;
      setUsable(ok);
      if (ok) getInventoryProducts(scopeId).then((p) => { if (active) setProducts(p); });
    });
    return () => { active = false; };
  }, [scopeId]);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryProduct | null>(null);
  const [deleting, setDeleting] = useState<InventoryProduct | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState('');

  const importPreview = useMemo(
    () => (importText.trim() ? parseProductsCsv(importText) : null),
    [importText],
  );

  if (usable === null) return null;
  if (!usable) return <EnablementGate moduleId="inventory" />;

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (p: InventoryProduct) => { setEditing(p); setFormOpen(true); };

  const handleSubmit = async (input: ProductInput) => {
    if (editing) await updateInventoryProduct(editing.id, input);
    else if (scopeId) await createInventoryProduct(scopeId, input);
    setFormOpen(false);
    setEditing(null);
    reload();
  };

  const handleDelete = async () => {
    if (deleting) await deleteInventoryProduct(deleting.id);
    setDeleting(null);
    reload();
  };

  const handleImport = async () => {
    if (!scopeId || !importPreview || importPreview.products.length === 0) return;
    await importInventoryProducts(scopeId, importPreview.products);
    setImportText('');
    setImportOpen(false);
    reload();
  };

  const handleExport = () => {
    downloadCsv(`inventory-${scopeId ?? 'products'}.csv`, productsToCsv(products));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-1">
            Products available to attach to bookings and storefront listings for this account.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {can('inventory.import') && canMutate && (
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <IconUpload className="w-4 h-4" /> Import
            </Button>
          )}
          {can('inventory.export') && (
            <Button variant="outline" size="sm" onClick={handleExport} disabled={products.length === 0}>
              <IconDownload className="w-4 h-4" /> Export
            </Button>
          )}
          {can('inventory.create') && canMutate && (
            <Button size="sm" onClick={openCreate}>
              <IconPlus className="w-4 h-4" /> Add Product
            </Button>
          )}
        </div>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-12 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <IconPackage className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No products yet</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Add your first product to start attaching items to bulk bookings and storefront listings.
            </p>
            {can('inventory.create') && canMutate && (
              <div className="flex justify-center mt-6">
                <Button onClick={openCreate}><IconPlus className="w-4 h-4" /> Add Product</Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                {(can('inventory.edit') || can('inventory.delete')) && canMutate && (
                  <TableHead className="text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-gray-900">{p.name}</TableCell>
                  <TableCell className="text-gray-500">{p.sku}</TableCell>
                  <TableCell className="text-gray-500">{p.category}</TableCell>
                  <TableCell className="text-gray-700">₱{p.unitPrice.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className="text-gray-700">{p.stockQuantity}</span>
                    {isLowStock(p) && (
                      <Badge variant="warning" className="ml-2">Low</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.status === 'active' ? 'success' : 'default'}>
                      {p.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  {(can('inventory.edit') || can('inventory.delete')) && canMutate && (
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {can('inventory.edit') && (
                          <button
                            onClick={() => openEdit(p)}
                            title="Edit product"
                            aria-label={`Edit ${p.name}`}
                            className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            <IconPencil className="w-4 h-4" />
                          </button>
                        )}
                        {can('inventory.delete') && (
                          <button
                            onClick={() => setDeleting(p)}
                            title="Delete product"
                            aria-label={`Delete ${p.name}`}
                            className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create / edit dialog — keyed so the form resets per open. */}
      {formOpen && (
        <ProductFormDialog
          key={editing?.id ?? 'new'}
          open={formOpen}
          mode={editing ? 'edit' : 'create'}
          product={editing ?? undefined}
          onClose={() => { setFormOpen(false); setEditing(null); }}
          onSubmit={handleSubmit}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete product?"
        description={deleting ? `"${deleting.name}" (${deleting.sku}) will be removed from this account's inventory.` : ''}
        confirmLabel="Delete"
        variant="destructive"
      />

      {/* Import dialog */}
      <Dialog open={importOpen} onClose={() => setImportOpen(false)} title="Import products" size="lg">
        <p className="text-sm text-gray-500 mb-3">
          Paste CSV or tab-separated rows. The first line is a header; <strong>name</strong> and
          <strong> sku</strong> are required. Optional columns: category, description, unitPrice, weight,
          length, width, height, stockQuantity, lowStockThreshold, status.
        </p>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={7}
          placeholder={'name,sku,category,unitPrice,stockQuantity,status\nDesk Lamp,LAMP-001,Home,750,40,active'}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        {importPreview && (
          <div className="mt-3 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2.5 text-sm">
            <p className="text-gray-700">
              <span className="font-semibold text-gray-900">{importPreview.products.length}</span> product
              {importPreview.products.length === 1 ? '' : 's'} ready to import.
            </p>
            {importPreview.errors.length > 0 && (
              <ul className="mt-1.5 space-y-0.5">
                {importPreview.errors.map((err, i) => (
                  <li key={i} className="text-xs text-amber-700 flex items-start gap-1">
                    <IconInfoCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{err}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className="flex gap-2.5 justify-end pt-4 mt-3 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(false)}>Cancel</Button>
          <Button
            size="sm"
            disabled={!importPreview || importPreview.products.length === 0}
            onClick={handleImport}
          >
            Import {importPreview && importPreview.products.length > 0 ? `${importPreview.products.length} ` : ''}products
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
