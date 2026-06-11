import { useState } from 'react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import type { InventoryProduct, ProductInput, ProductStatus } from '../services/inventoryService';

interface FormState {
  name: string;
  sku: string;
  category: string;
  description: string;
  unitPrice: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  stockQuantity: string;
  lowStockThreshold: string;
  status: ProductStatus;
}

function blankForm(): FormState {
  return {
    name: '', sku: '', category: '', description: '',
    unitPrice: '', weight: '', length: '', width: '', height: '',
    stockQuantity: '', lowStockThreshold: '10', status: 'active',
  };
}

function productToForm(p: InventoryProduct): FormState {
  return {
    name: p.name, sku: p.sku, category: p.category, description: p.description,
    unitPrice: String(p.unitPrice), weight: String(p.weight),
    length: String(p.dimensions.length), width: String(p.dimensions.width), height: String(p.dimensions.height),
    stockQuantity: String(p.stockQuantity), lowStockThreshold: String(p.lowStockThreshold),
    status: p.status,
  };
}

const num = (v: string) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label className="block text-xs font-medium text-gray-600 mb-1">
    {children}{required && <span className="text-red-500"> *</span>}
  </label>
);

/**
 * Create / edit an inventory product. A controlled form over `ProductInput`;
 * numeric fields are held as strings and coerced (≥ 0) on submit. Stock is a
 * managed field here (merchant inventory), not a booking deduction.
 */
export function ProductFormDialog({
  open,
  mode,
  product,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  product?: InventoryProduct;
  onClose: () => void;
  onSubmit: (input: ProductInput) => void;
}) {
  const [form, setForm] = useState<FormState>(() => (product ? productToForm(product) : blankForm()));
  const set = (k: keyof FormState, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const canSubmit = form.name.trim().length > 0 && form.sku.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category.trim() || 'Uncategorized',
      description: form.description.trim(),
      unitPrice: num(form.unitPrice),
      weight: num(form.weight),
      dimensions: { length: num(form.length), width: num(form.width), height: num(form.height) },
      stockQuantity: num(form.stockQuantity),
      lowStockThreshold: num(form.lowStockThreshold),
      status: form.status,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} title={mode === 'create' ? 'Add product' : 'Edit product'} size="lg">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label required>Product name</Label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Premium Coffee Beans 1kg" />
          </div>
          <div>
            <Label required>SKU</Label>
            <Input value={form.sku} onChange={(e) => set('sku', e.target.value)} placeholder="e.g. COF-1KG-001" />
          </div>
          <div>
            <Label>Category</Label>
            <Input value={form.category} onChange={(e) => set('category', e.target.value)} placeholder="e.g. Food & Beverage" />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onChange={(e) => set('status', e.target.value as ProductStatus)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={2}
            placeholder="Short product description"
            className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <Label>Unit price (₱)</Label>
            <Input type="number" min={0} value={form.unitPrice} onChange={(e) => set('unitPrice', e.target.value)} placeholder="0" />
          </div>
          <div>
            <Label>Weight (kg)</Label>
            <Input type="number" min={0} step="0.01" value={form.weight} onChange={(e) => set('weight', e.target.value)} placeholder="0" />
          </div>
          <div>
            <Label>Stock qty</Label>
            <Input type="number" min={0} value={form.stockQuantity} onChange={(e) => set('stockQuantity', e.target.value)} placeholder="0" />
          </div>
          <div>
            <Label>Low-stock at</Label>
            <Input type="number" min={0} value={form.lowStockThreshold} onChange={(e) => set('lowStockThreshold', e.target.value)} placeholder="10" />
          </div>
        </div>

        <div>
          <Label>Dimensions L × W × H (cm)</Label>
          <div className="grid grid-cols-3 gap-3">
            <Input type="number" min={0} value={form.length} onChange={(e) => set('length', e.target.value)} placeholder="L" />
            <Input type="number" min={0} value={form.width} onChange={(e) => set('width', e.target.value)} placeholder="W" />
            <Input type="number" min={0} value={form.height} onChange={(e) => set('height', e.target.value)} placeholder="H" />
          </div>
        </div>
      </div>

      <div className="flex gap-2.5 justify-end pt-4 mt-2 border-t border-gray-100">
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" disabled={!canSubmit} onClick={handleSubmit}>
          {mode === 'create' ? 'Add product' : 'Save changes'}
        </Button>
      </div>
    </Dialog>
  );
}
