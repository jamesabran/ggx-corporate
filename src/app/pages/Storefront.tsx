import { useEffect, useState } from 'react';
import { IconBuildingStore, IconWorld, IconMail, IconPhone, IconAlertTriangle } from '@tabler/icons-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/Dialog';
import { EnablementGate } from '../components/EnablementGate';
import { useModuleAccessContext } from '../hooks/useModuleAccess';
import { isFeatureUsable } from '../services/featureEnablementService';
import {
  getStorefrontProfile, getPendingOrderImpact,
  STOREFRONT_PUBLISH_META, UNPUBLISH_MESSAGE,
  type StorefrontProfile, type StorefrontPublishStatus, type OrderImpact,
} from '../services/storefrontService';
import { getServiceTypeLabel } from '../data/serviceTypes';

/**
 * Storefront — store profile + publish/unpublish lifecycle, scoped to the current
 * account/subaccount. Renders the EnablementGate when Storefront isn't usable
 * (disabled, needs setup, requires Inventory first, or role-blocked).
 *
 * Unpublish never auto-cancels existing transactions; pending unpaid orders /
 * active deliveries trigger a warning + explicit confirmation. See
 * docs/storefront_rules.md. Product management + customer-facing checkout are
 * deferred (see roadmap).
 */
export function Storefront() {
  const ctx = useModuleAccessContext();
  const scopeId = ctx.scopeAccountId;
  const [usable, setUsable] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<StorefrontProfile | null>(null);
  const [impact, setImpact] = useState<OrderImpact>({ pendingUnpaidOrders: 0, activeDeliveries: 0 });
  const [status, setStatus] = useState<StorefrontPublishStatus>('draft');
  const [confirmKind, setConfirmKind] = useState<'publish' | 'unpublish' | null>(null);

  useEffect(() => {
    let active = true;
    isFeatureUsable('storefront', scopeId).then((ok) => {
      if (!active) return;
      setUsable(ok);
      if (!ok) return;
      Promise.all([getStorefrontProfile(scopeId), getPendingOrderImpact(scopeId)]).then(([p, imp]) => {
        if (!active) return;
        setProfile(p);
        if (p) setStatus(p.publishStatus);
        setImpact(imp);
      });
    });
    return () => { active = false; };
  }, [scopeId]);

  if (usable === null) return null;
  if (!usable) return <EnablementGate moduleId="storefront" />;
  if (!profile) return null;

  const meta = STOREFRONT_PUBLISH_META[status];
  const isPublished = status === 'published';
  const hasPendingImpact = impact.pendingUnpaidOrders > 0 || impact.activeDeliveries > 0;

  const onConfirm = () => {
    setStatus(confirmKind === 'publish' ? 'published' : 'unpublished');
    setConfirmKind(null);
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
        <div className="flex items-center gap-2">
          <Badge variant={meta.variant}>{meta.label}</Badge>
          {isPublished ? (
            <Button size="sm" variant="outline" onClick={() => setConfirmKind('unpublish')}>Unpublish</Button>
          ) : (
            <Button size="sm" onClick={() => setConfirmKind('publish')}>Publish</Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{profile.storeName}</h2>
            <p className="text-sm text-gray-500 mt-1">{profile.description}</p>
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
              {profile.deliveryOptions.map((o) => (
                <Badge key={o} variant="outline">{getServiceTypeLabel(o)}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmKind === 'publish'}
        onClose={() => setConfirmKind(null)}
        onConfirm={onConfirm}
        title="Publish storefront"
        description="Your storefront will become visible to customers and accept new orders."
        confirmLabel="Publish"
      />

      <ConfirmDialog
        open={confirmKind === 'unpublish'}
        onClose={() => setConfirmKind(null)}
        onConfirm={onConfirm}
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
