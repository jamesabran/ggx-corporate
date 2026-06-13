import { useEffect, useState } from 'react';
import {
  IconBuildingStore, IconWorld, IconMail, IconPhone, IconAlertTriangle,
  IconPencil, IconPackage, IconExternalLink, IconPlus,
} from '@tabler/icons-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/Dialog';
import { EnablementGate } from '../components/EnablementGate';
import { StorefrontProfileDialog } from '../components/StorefrontProfileDialog';
import { StorefrontProductsDialog } from '../components/StorefrontProductsDialog';
import { useModuleAccessContext } from '../hooks/useModuleAccess';
import { isFeatureUsable } from '../services/featureEnablementService';
import {
  getStorefrontProfile, ensureStorefrontProfile, getPendingOrderImpact,
  updateStorefrontProfile, setStorefrontProducts, setStorefrontStatus,
  STOREFRONT_PUBLISH_META, UNPUBLISH_MESSAGE,
  type StorefrontProfile, type StorefrontPublishStatus, type OrderImpact, type StorefrontProfileInput,
} from '../services/storefrontService';
import { getInventoryProducts, getInventoryProductsByIds, isLowStock, type InventoryProduct } from '../services/inventoryService';
import { getServiceTypeLabel } from '../data/serviceTypes';
import { getAccountNameById } from '../data/accounts';

const peso = (n: number) =>
  `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Storefront — store profile, product selection from Inventory, and the
 * publish/unpublish lifecycle, scoped to the current account/subaccount. Renders
 * the EnablementGate when Storefront isn't usable (disabled, needs setup, requires
 * Inventory first, or role-blocked).
 *
 * Unpublish never auto-cancels existing transactions; pending unpaid orders /
 * active deliveries trigger a warning + explicit confirmation. The public
 * customer-facing surface lives at /shop/:slug with demo checkout, session cart,
 * cart review, and cart checkout. Real order placement and persistence are
 * backend-owned (deferred). See docs/storefront_rules.md.
 */
export function Storefront() {
  const ctx = useModuleAccessContext();
  const scopeId = ctx.scopeAccountId;
  const can = (key: Parameters<typeof ctx.permissions.includes>[0]) => ctx.permissions.includes(key);
  const canMutate = !!scopeId;

  const [usable, setUsable] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<StorefrontProfile | null>(null);
  const [inventory, setInventory] = useState<InventoryProduct[]>([]);
  const [listed, setListed] = useState<InventoryProduct[]>([]);
  const [impact, setImpact] = useState<OrderImpact>({ pendingUnpaidOrders: 0, activeDeliveries: 0 });
  const [status, setStatus] = useState<StorefrontPublishStatus>('draft');

  const [confirmKind, setConfirmKind] = useState<'publish' | 'unpublish' | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  // Resolve listed products from the profile's selected ids.
  const refreshListed = (p: StorefrontProfile | null) => {
    if (!p) { setListed([]); return; }
    getInventoryProductsByIds(p.productIds).then(setListed);
  };

  useEffect(() => {
    let active = true;
    isFeatureUsable('storefront', scopeId).then((ok) => {
      if (!active) return;
      setUsable(ok);
      if (!ok) return;
      Promise.all([
        getStorefrontProfile(scopeId),
        getPendingOrderImpact(scopeId),
        getInventoryProducts(scopeId),
      ]).then(async ([p, imp, inv]) => {
        if (!active) return;
        // Usable but no profile yet (e.g. a standard account that just enabled
        // Storefront) → create a default draft so the page isn't blank.
        let prof = p;
        if (!prof && scopeId) {
          prof = await ensureStorefrontProfile(scopeId, getAccountNameById(scopeId) ?? 'My Store');
        }
        if (!active) return;
        setProfile(prof);
        if (prof) { setStatus(prof.publishStatus); refreshListed(prof); }
        setImpact(imp);
        setInventory(inv);
      });
    });
    return () => { active = false; };
  }, [scopeId]);

  if (usable === null) return null;
  if (!usable) return <EnablementGate moduleId="storefront" />;
  // profile can be null in the main-account consolidated view (scopeId=undefined):
  // storefront is a subaccount-level module and profiles are scoped per-subaccount.
  if (!profile) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Storefront</h1>
          <p className="text-gray-600 mt-1">A simple storefront built from your inventory products.</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <IconBuildingStore className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-700">Switch to a subaccount to manage its storefront</p>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            Storefronts are configured per subaccount. Select a subaccount from the switcher above to view or manage its storefront.
          </p>
        </div>
      </div>
    );
  }

  const meta = STOREFRONT_PUBLISH_META[status];
  const isPublished = status === 'published';
  const hasPendingImpact = impact.pendingUnpaidOrders > 0 || impact.activeDeliveries > 0;

  const onConfirmPublish = async () => {
    const next: StorefrontPublishStatus = confirmKind === 'publish' ? 'published' : 'unpublished';
    if (scopeId) await setStorefrontStatus(scopeId, next);
    setStatus(next);
    setConfirmKind(null);
  };

  const handleSaveProfile = async (patch: StorefrontProfileInput) => {
    if (scopeId) {
      const updated = await updateStorefrontProfile(scopeId, patch);
      if (updated) setProfile(updated);
    }
    setEditOpen(false);
  };

  const handleSaveProducts = async (ids: string[]) => {
    if (scopeId) {
      const updated = await setStorefrontProducts(scopeId, ids);
      if (updated) { setProfile(updated); refreshListed(updated); }
    }
    setProductsOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Storefront</h1>
          <p className="text-gray-600 mt-1">
            A simple storefront built from your inventory products.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={meta.variant}>{meta.label}</Badge>
          <a href={`/shop/${profile.slug}`} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline">
              <IconExternalLink className="w-4 h-4" /> View storefront
            </Button>
          </a>
          {isPublished
            ? can('storefront.unpublish') && canMutate && (
                <Button size="sm" variant="outline" onClick={() => setConfirmKind('unpublish')}>Unpublish</Button>
              )
            : can('storefront.publish') && canMutate && (
                <Button size="sm" onClick={() => setConfirmKind('publish')}>Publish</Button>
              )}
        </div>
      </div>

      {/* Store profile */}
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">{profile.storeName}</h2>
              <p className="text-sm text-gray-500 mt-1">{profile.description}</p>
            </div>
            {can('storefront.configure') && canMutate && (
              <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
                <IconPencil className="w-4 h-4" /> Edit profile
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Field icon={IconWorld} label="Store URL">{`gogoxpress.shop/${profile.slug}`}</Field>
            <Field icon={IconMail} label="Contact email">{profile.contactEmail}</Field>
            <Field icon={IconPhone} label="Contact number">{profile.contactNumber}</Field>
            <Field icon={IconBuildingStore} label="Products listed">{`${profile.productIds.length} from inventory`}</Field>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Delivery options</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.deliveryOptions.length === 0
                ? <span className="text-sm text-gray-400">None selected</span>
                : profile.deliveryOptions.map((o) => (
                    <Badge key={o} variant="outline">{getServiceTypeLabel(o)}</Badge>
                  ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listed products */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Listed products</h2>
              <p className="text-sm text-gray-500 mt-0.5">Products from your inventory shown on the storefront.</p>
            </div>
            {can('storefront.manageProducts') && canMutate && (
              <Button size="sm" variant="outline" onClick={() => setProductsOpen(true)}>
                <IconPlus className="w-4 h-4" /> Manage products
              </Button>
            )}
          </div>

          {listed.length === 0 ? (
            <div className="py-8 text-center">
              <IconPackage className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No products listed yet.</p>
              {can('storefront.manageProducts') && canMutate && (
                <Button size="sm" variant="outline" className="mt-3" onClick={() => setProductsOpen(true)}>
                  <IconPlus className="w-4 h-4" /> Add products
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {listed.map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <IconPackage className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      {p.status !== 'active' && <Badge variant="default">Inactive</Badge>}
                      {p.status === 'active' && isLowStock(p) && <Badge variant="warning">Low stock</Badge>}
                    </div>
                    <p className="text-xs text-gray-500">{p.sku}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 flex-shrink-0">{peso(p.unitPrice)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit profile dialog */}
      {editOpen && (
        <StorefrontProfileDialog
          open={editOpen}
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSubmit={handleSaveProfile}
        />
      )}

      {/* Manage products dialog */}
      {productsOpen && (
        <StorefrontProductsDialog
          open={productsOpen}
          products={inventory}
          selectedIds={profile.productIds}
          onClose={() => setProductsOpen(false)}
          onConfirm={handleSaveProducts}
        />
      )}

      <ConfirmDialog
        open={confirmKind === 'publish'}
        onClose={() => setConfirmKind(null)}
        onConfirm={onConfirmPublish}
        title="Publish storefront"
        description="Your storefront will become visible to customers and accept new orders."
        confirmLabel="Publish"
      />

      <ConfirmDialog
        open={confirmKind === 'unpublish'}
        onClose={() => setConfirmKind(null)}
        onConfirm={onConfirmPublish}
        title="Unpublish storefront"
        description={UNPUBLISH_MESSAGE}
        confirmLabel="Unpublish"
        variant="destructive"
      >
        {hasPendingImpact && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
            <IconAlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800">
              <p className="font-medium">This storefront has transactions in progress.</p>
              <p className="mt-0.5">
                {impact.pendingUnpaidOrders} pending unpaid order{impact.pendingUnpaidOrders === 1 ? '' : 's'} ·{' '}
                {impact.activeDeliveries} active deliver{impact.activeDeliveries === 1 ? 'y' : 'ies'}. These will
                continue until completed.
              </p>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}

function Field({
  icon: Icon, label, children,
}: { icon: React.ComponentType<{ className?: string }>; label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <div className="flex items-center gap-1.5 text-gray-900 mt-1">
        <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span>{children}</span>
      </div>
    </div>
  );
}
