import { useParams, Link, useNavigate } from 'react-router';
import { IconShoppingCart, IconTrash, IconBuildingStore, IconPackage, IconArrowLeft } from '@tabler/icons-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useCartItems, removeFromCart, updateQty } from '../lib/cartStore';

const peso = (n: number) =>
  `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * CartReview — /shop/:slug/cart. Shows the buyer's current cart items for a
 * storefront session, lets them adjust quantities, then proceeds to checkout.
 * Cart is session-only (module-level state; cleared on page refresh).
 */
export function CartReview() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const items = useCartItems();

  const subtotal = items.reduce((sum, i) => sum + i.productSnapshot.unitPrice * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-gray-500">
            <IconBuildingStore className="w-4 h-4" /> Secure checkout · Powered by GoGo Xpress
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <IconShoppingCart className="w-8 h-8 text-gray-300" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">Your cart is empty</h1>
            <p className="text-sm text-gray-500 mt-1">Browse the store and add products to continue.</p>
            <Link to={`/shop/${slug}`} className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800">
              ← Back to store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-gray-500">
          <IconBuildingStore className="w-4 h-4" /> Secure checkout · Powered by GoGo Xpress
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link to={`/shop/${slug}`}>
            <Button variant="ghost" size="sm">
              <IconArrowLeft className="w-4 h-4 mr-1.5" /> Continue shopping
            </Button>
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Your cart ({itemCount} item{itemCount === 1 ? '' : 's'})</h1>

        <div className="space-y-3">
          {items.map((item) => {
            const cover = item.productSnapshot.images[0];
            return (
              <Card key={item.productId}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {cover
                        ? <img src={cover} alt={item.productSnapshot.name} className="w-full h-full object-cover" />
                        : <IconPackage className="w-6 h-6 text-gray-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400">{item.productSnapshot.category}</p>
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{item.productSnapshot.name}</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">{peso(item.productSnapshot.unitPrice)}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateQty(item.productId, item.quantity - 1)}
                          className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-lg leading-none"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.productId, item.quantity + 1)}
                          className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-lg leading-none"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 w-20 text-right">
                        {peso(item.productSnapshot.unitPrice * item.quantity)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.productId)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label="Remove item"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal ({itemCount} item{itemCount === 1 ? '' : 's'})</span>
              <span className="font-medium text-gray-900">{peso(subtotal)}</span>
            </div>
            <p className="text-xs text-gray-400">Shipping and COD fees are determined by the seller at booking.</p>
            <Button className="w-full" onClick={() => navigate('/checkout')}>
              Proceed to Checkout · {peso(subtotal)}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
