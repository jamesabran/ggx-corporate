import { useRef, useState } from 'react';
import { IconPhoto, IconStar, IconStarFilled, IconX, IconUpload } from '@tabler/icons-react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { cn } from '../lib/utils';
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

  // Product photos (data URLs in the demo). Cover defaults to the first image.
  const [images, setImages] = useState<string[]>(() => product?.images ?? []);
  const [cover, setCover] = useState<string | undefined>(() => product?.coverImage ?? product?.images?.[0]);
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const url = String(reader.result);
          setImages((prev) => {
            const next = [...prev, url];
            setCover((c) => c ?? next[0]); // first image becomes cover by default
            return next;
          });
        };
        reader.readAsDataURL(file);
      });
  };

  const removeImage = (url: string) => {
    setImages((prev) => {
      const next = prev.filter((u) => u !== url);
      setCover((c) => (c === url ? next[0] : c));
      return next;
    });
  };

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
      images,
      coverImage: cover ?? images[0],
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

        {/* Product photos */}
        <div>
          <Label>Product photos</Label>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => { addFiles(e.target.files); if (fileRef.current) fileRef.current.value = ''; }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors py-4 flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <IconUpload className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Upload photos</span>
            <span className="text-xs text-gray-400">JPG, PNG, or WebP</span>
          </button>

          {images.length > 0 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5 mt-3">
              {images.map((url) => {
                const isCover = (cover ?? images[0]) === url;
                return (
                  <div key={url} className={cn('relative group rounded-lg overflow-hidden border', isCover ? 'border-blue-500 ring-1 ring-blue-300' : 'border-gray-200')}>
                    <img src={url} alt="" className="w-full aspect-square object-cover" />
                    {isCover && (
                      <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 rounded bg-blue-600 text-white text-[10px] px-1 py-0.5">
                        <IconStarFilled className="w-2.5 h-2.5" /> Cover
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" title="Set as cover" onClick={() => setCover(url)} className="p-1 text-white hover:text-blue-200">
                        <IconStar className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" title="Remove" onClick={() => removeImage(url)} className="p-1 text-white hover:text-red-300">
                        <IconX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5">
            <IconPhoto className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <ul className="text-xs text-blue-900/80 space-y-0.5 leading-relaxed">
              <li>Use square images. Recommended 1200 × 1200 px (minimum 800 × 800 px).</li>
              <li>Accepted formats: JPG, PNG, WebP. Keep files compressed for faster checkout loading.</li>
              <li>Use clear product photos on a plain background. The first or selected image is the cover.</li>
            </ul>
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
