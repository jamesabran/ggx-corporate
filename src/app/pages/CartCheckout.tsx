import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  IconBuildingStore, IconCash, IconCircleCheck, IconPackage, IconShieldCheck,
} from '@tabler/icons-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LocationCascadeFields } from '../components/LocationCascadeFields';
import { useCartItems, clearCart } from '../lib/cartStore';

const peso = (n: number) =>
  `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface CheckoutForm {
  name: string; mobile: string; street: string;
  province: string; city: string; barangay: string;
}

const blank: CheckoutForm = {
  name: '', mobile: '', street: '', province: '', city: '', barangay: '',
};

/**
 * CartCheckout — /checkout. Multi-product COD checkout for a storefront cart.
 * Cart is read from the session-only cartStore. On place, captures totals before
 * clearing so the confirmation screen has correct values.
 */
export function CartCheckout() {
  const navigate = useNavigate();
  const items = useCartItems();
  const [form, setForm] = useState<CheckoutForm>(blank);
  const [placed, setPlaced] = useState(false);
  const [placedTotal, setPlacedTotal] = useState(0);
  const [placedItemCount, setPlacedItemCount] = useState(0);

  const set = <K extends keyof CheckoutForm>(k: K, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.productSnapshot.unitPrice * i.quantity, 0),
    [items],
  );
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const canOrder = !!(
    items.length > 0 &&
    form.name.trim() && form.mobile.trim() && form.street.trim() &&
    form.province.trim() && form.city.trim() && form.barangay.trim()
  );

  const handlePlace = () => {
    if (!canOrder) return;
    setPlacedTotal(total);
    setPlacedItemCount(itemCount);
    clearCart();
    setPlaced(true);
  };

  if (items.length === 0 && !placed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <p className="text-sm text-gray-500">Your cart is empty.</p>
          <button type="button" onClick={() => navigate(-1)} className="mt-3 text-sm text-blue-600 hover:text-blue-800">
            Go back
          </button>
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
              Thanks, {form.name}. Your order of {placedItemCount} item{placedItemCount === 1 ? '' : 's'} is confirmed.
            </p>
            <div className="mt-4 rounded-lg border border-gray-200 p-4 text-sm text-left space-y-1.5">
              <Row label="Deliver to">{form.name} · {form.mobile}</Row>
              <Row label="Address">{[form.street, form.barangay, form.city, form.province].filter(Boolean).join(', ')}</Row>
              <Row label="Payment"><span className="inline-flex items-center gap-1"><IconCash className="w-4 h-4 text-emerald-600" /> Cash on Delivery</span></Row>
              <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold">
                <span className="text-gray-900">Total (COD)</span>
                <span className="text-gray-900">{peso(placedTotal)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              The seller will book your items for delivery via GoGo Xpress. Pay cash when your parcel arrives.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-gray-500">
          <IconBuildingStore className="w-4 h-4" /> Secure checkout · Powered by GoGo Xpress
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Delivery details */}
        <div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Delivery details</h2>
              <Field label="Full name"><Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Recipient name" /></Field>
              <Field label="Mobile number"><Input value={form.mobile} onChange={(e) => set('mobile', e.target.value)} placeholder="+63 9xx xxx xxxx" /></Field>
              <Field label="Street address"><Input value={form.street} onChange={(e) => set('street', e.target.value)} placeholder="House/unit, street" /></Field>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <LocationCascadeFields
                  province={form.province}
                  city={form.city}
                  barangay={form.barangay}
                  onChange={(p, c, b) => setForm((prev) => ({ ...prev, province: p, city: c, barangay: b }))}
                />
              </div>

              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2.5 flex items-center gap-2">
                <IconShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <p className="text-xs text-emerald-800">Cash on Delivery (COD) — pay in cash when your parcel arrives.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Order summary</h2>
              <div className="space-y-3">
                {items.map((item) => {
                  const cover = item.productSnapshot.images[0];
                  return (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {cover
                          ? <img src={cover} alt={item.productSnapshot.name} className="w-full h-full object-cover" />
                          : <IconPackage className="w-5 h-5 text-gray-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 leading-snug truncate">{item.productSnapshot.name}</p>
                        <p className="text-xs text-gray-500">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900 flex-shrink-0">
                        {peso(item.productSnapshot.unitPrice * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({itemCount} item{itemCount === 1 ? '' : 's'})</span>
                  <span className="font-medium text-gray-900">{peso(total)}</span>
                </div>
                <p className="text-xs text-gray-400">COD amount and shipping confirmed at delivery booking.</p>
              </div>
              <Button className="w-full" disabled={!canOrder} onClick={handlePlace}>
                <IconCash className="w-4 h-4" /> Place COD order · {peso(total)}
              </Button>
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
