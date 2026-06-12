import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import {
  IconPackage, IconShieldCheck, IconCircleCheck, IconCash, IconBuildingStore,
} from '@tabler/icons-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { getInventoryProduct, productCover, type InventoryProduct } from '../services/inventoryService';

const peso = (n: number) =>
  `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface OrderForm {
  name: string; mobile: string; street: string;
  province: string; city: string; barangay: string; qty: string;
}

const blank: OrderForm = { name: '', mobile: '', street: '', province: '', city: '', barangay: '', qty: '1' };

/**
 * Public buyer checkout at /buy/:productId — opened from a product's shareable
 * link or a storefront card. The buyer views the product, enters recipient +
 * delivery details, and places a COD-only order. Demo flow: the order is
 * confirmed in-page (no real payment integration; COD only).
 */
export function BuyerCheckout() {
  const { productId } = useParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<InventoryProduct | null>(null);
  const [form, setForm] = useState<OrderForm>(blank);
  const [activeImage, setActiveImage] = useState<string | undefined>();
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    let active = true;
    getInventoryProduct(productId ?? '')
      .then((p) => { if (active) { setProduct(p); setActiveImage(p ? productCover(p) : undefined); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [productId]);

  const set = <K extends keyof OrderForm>(k: K, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  const qty = Math.max(1, Number(form.qty) || 1);
  const total = product ? product.unitPrice * qty : 0;
  const outOfStock = !!product && (product.status !== 'active' || (!product.unlimitedStock && product.stockQuantity <= 0));
  const canOrder = useMemo(
    () => !outOfStock && form.name.trim() && form.mobile.trim() && form.street.trim()
      && form.province.trim() && form.city.trim() && form.barangay.trim(),
    [outOfStock, form],
  );

  if (loading) return null;

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <IconPackage className="w-7 h-7 text-gray-400" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Product not available</h1>
          <p className="text-sm text-gray-500 mt-1">This checkout link is invalid or the product was removed.</p>
        </div>
      </div>
    );
  }

  if (placed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <IconCircleCheck className="w-9 h-9 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Order placed!</h1>
            <p className="text-sm text-gray-600 mt-2">
              Thanks, {form.name}. Your order for <span className="font-medium">{qty} × {product.name}</span> is confirmed.
            </p>
            <div className="mt-4 rounded-lg border border-gray-200 p-4 text-sm text-left space-y-1.5">
              <Row label="Deliver to">{form.name} · {form.mobile}</Row>
              <Row label="Address">{[form.street, form.barangay, form.city, form.province].filter(Boolean).join(', ')}</Row>
              <Row label="Payment"><span className="inline-flex items-center gap-1"><IconCash className="w-4 h-4 text-emerald-600" /> Cash on Delivery</span></Row>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold">
                <span className="text-gray-900">Total (COD)</span><span className="text-gray-900">{peso(total)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              The seller will book this for delivery via GoGo Xpress. Pay cash when your parcel arrives.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cover = activeImage ?? productCover(product);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-gray-500">
          <IconBuildingStore className="w-4 h-4" /> Secure checkout · Powered by GoGo Xpress
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product */}
        <div>
          <div className="aspect-square rounded-2xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center">
            {cover
              ? <img src={cover} alt={product.name} className="w-full h-full object-cover" />
              : <IconPackage className="w-16 h-16 text-gray-300" />}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {product.images.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setActiveImage(url)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border ${cover === url ? 'border-blue-500 ring-1 ring-blue-300' : 'border-gray-200'}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="mt-5">
            <p className="text-xs text-gray-400">{product.category}</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{product.name}</h1>
            <p className="text-xl font-bold text-gray-900 mt-2">{peso(product.unitPrice)}</p>
            {outOfStock
              ? <Badge variant="danger" className="mt-2">Out of stock</Badge>
              : <p className="text-sm text-gray-500 mt-2">{product.description}</p>}
          </div>
        </div>

        {/* Order form */}
        <div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Delivery details</h2>

              <Field label="Full name"><Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Recipient name" /></Field>
              <Field label="Mobile number"><Input value={form.mobile} onChange={(e) => set('mobile', e.target.value)} placeholder="+63 9xx xxx xxxx" /></Field>
              <Field label="Street address"><Input value={form.street} onChange={(e) => set('street', e.target.value)} placeholder="House/unit, street" /></Field>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Province"><Input value={form.province} onChange={(e) => set('province', e.target.value)} /></Field>
                <Field label="City / Municipality"><Input value={form.city} onChange={(e) => set('city', e.target.value)} /></Field>
                <Field label="Barangay"><Input value={form.barangay} onChange={(e) => set('barangay', e.target.value)} /></Field>
              </div>
              <div className="w-28">
                <Field label="Quantity">
                  <Input
                    type="number" min={1}
                    max={product.unlimitedStock ? undefined : (product.stockQuantity || undefined)}
                    value={form.qty}
                    onChange={(e) => set('qty', e.target.value)}
                  />
                </Field>
              </div>

              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5 flex items-center gap-2">
                <IconShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <p className="text-xs text-emerald-800">Cash on Delivery (COD) — pay in cash when your parcel arrives.</p>
              </div>

              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">Total ({qty} × {peso(product.unitPrice)})</span>
                <span className="text-lg font-bold text-gray-900">{peso(total)}</span>
              </div>

              <Button className="w-full" disabled={!canOrder} onClick={() => setPlaced(true)}>
                <IconCash className="w-4 h-4" /> Place COD order
              </Button>
              {outOfStock && (
                <p className="text-xs text-red-600 text-center">This product is currently unavailable.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 text-right">{children}</span>
    </div>
  );
}
