import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  IconBuildingStore, IconMail, IconPhone, IconShoppingCart, IconEyeCog, IconPackage, IconCheck,
} from '@tabler/icons-react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { getStorefrontProfileBySlug, type StorefrontProfile } from '../services/storefrontService';
import { getInventoryProductsByIds, isLowStock, productCover, type InventoryProduct } from '../services/inventoryService';
import { getServiceTypeLabel } from '../data/serviceTypes';
import { addToCart, useCartItems } from '../lib/cartStore';

const peso = (n: number) =>
  `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Public customer-facing storefront at /shop/:slug. Renders the store profile,
 * delivery options, and the listed (active) inventory products as a browse-only
 * catalog. There is NO checkout yet — ordering is a placeholder (see
 * docs/storefront_rules.md). When the store isn't published, a preview banner is
 * shown (this same page doubles as the merchant's preview).
 */
export function StorefrontPreview() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<StorefrontProfile | null>(null);
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const cartItems = useCartItems();
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  // Track which product was just added (resets after 2s for per-card feedback).
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getStorefrontProfileBySlug(slug ?? '')
      .then(async (p) => {
        if (!active) return;
        setProfile(p);
        if (p) {
          const items = await getInventoryProductsByIds(p.productIds);
          if (active) setProducts(items.filter((it) => it.status === 'active'));
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  if (loading) return null;

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <IconBuildingStore className="w-7 h-7 text-gray-400" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Store not available</h1>
          <p className="text-sm text-gray-500 mt-1">This storefront link is invalid or no longer active.</p>
        </div>
      </div>
    );
  }

  const isPublished = profile.publishStatus === 'published';

  return (
    <div className="min-h-screen bg-gray-50">
      {!isPublished && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-5xl mx-auto px-6 py-2.5 flex items-center gap-2 text-sm text-amber-800">
            <IconEyeCog className="w-4 h-4 flex-shrink-0" />
            Preview — this storefront is not published yet. Customers can't see it.
          </div>
        </div>
      )}

      {/* Store header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Cart button — top-right of the header area */}
          {cartCount > 0 && (
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={() => navigate(`/shop/${slug}/cart`)}
                className="relative inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <IconShoppingCart className="w-4 h-4" />
                View cart
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              </button>
            </div>
          )}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <IconBuildingStore className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">{profile.storeName}</h1>
              <p className="text-gray-600 mt-1 max-w-2xl">{profile.description}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1.5"><IconMail className="w-4 h-4" />{profile.contactEmail}</span>
                <span className="inline-flex items-center gap-1.5"><IconPhone className="w-4 h-4" />{profile.contactNumber}</span>
              </div>
              {profile.deliveryOptions.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wide mr-1">Delivery</span>
                  {profile.deliveryOptions.map((o) => (
                    <Badge key={o} variant="outline">{getServiceTypeLabel(o)}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Product catalog */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">Products</h2>
          <span className="text-sm text-gray-400">{products.length} item{products.length === 1 ? '' : 's'}</span>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <IconPackage className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No products are listed in this store yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => {
              const outOfStock = p.stockQuantity <= 0;
              const cover = productCover(p);
              return (
                <Card key={p.id} className="flex flex-col overflow-hidden">
                  <div className="h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {cover
                      ? <img src={cover} alt={p.name} className="w-full h-full object-cover" />
                      : <IconPackage className="w-10 h-10 text-gray-300" />}
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <p className="text-xs text-gray-400">{p.category}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5 leading-snug">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {outOfStock
                        ? <Badge variant="danger">Out of stock</Badge>
                        : isLowStock(p)
                          ? <Badge variant="warning">Low stock</Badge>
                          : <Badge variant="success">In stock</Badge>}
                    </div>
                    <div className="mt-auto pt-3">
                      <p className="text-base font-bold text-gray-900">{peso(p.unitPrice)}</p>
                      {outOfStock ? (
                        <button
                          type="button" disabled
                          className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-400 text-sm font-medium h-9 cursor-not-allowed"
                        >
                          Out of stock
                        </button>
                      ) : justAddedId === p.id ? (
                        <button
                          type="button" disabled
                          className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-600 text-white text-sm font-medium h-9 cursor-default"
                        >
                          <IconCheck className="w-4 h-4" />
                          Added!
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            addToCart({
                              productId: p.id,
                              quantity: 1,
                              productSnapshot: {
                                name: p.name,
                                unitPrice: p.unitPrice,
                                images: p.images,
                                category: p.category,
                              },
                            });
                            setJustAddedId(p.id);
                            setTimeout(() => setJustAddedId(null), 2000);
                          }}
                          className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium h-9 transition-colors"
                        >
                          <IconShoppingCart className="w-4 h-4" />
                          Add to cart
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Powered by GoGo Xpress · Orders are Cash on Delivery and booked for delivery by the seller.
        </p>
      </main>
    </div>
  );
}
