import { useState } from 'react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { cn } from '../lib/utils';
import { STOREFRONT_DELIVERY_OPTIONS, getServiceTypeLabel, type ServiceTypeKey } from '../data/serviceTypes';
import type { StorefrontProfile, StorefrontProfileInput } from '../services/storefrontService';

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-xs font-medium text-gray-600 mb-1">{children}</label>
);

/** Slugify free text into a URL-safe store slug. */
function slugify(v: string): string {
  return v.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * Edit the storefront profile — name, description, public slug, contact, and the
 * delivery options offered to customers (Standard / Same-Day / On-Demand).
 */
export function StorefrontProfileDialog({
  open,
  profile,
  onClose,
  onSubmit,
}: {
  open: boolean;
  profile: StorefrontProfile;
  onClose: () => void;
  onSubmit: (patch: StorefrontProfileInput) => void;
}) {
  const [form, setForm] = useState<StorefrontProfileInput>({
    storeName: profile.storeName,
    description: profile.description,
    slug: profile.slug,
    contactEmail: profile.contactEmail,
    contactNumber: profile.contactNumber,
    deliveryOptions: [...profile.deliveryOptions],
  });

  const set = <K extends keyof StorefrontProfileInput>(k: K, v: StorefrontProfileInput[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const toggleDelivery = (key: ServiceTypeKey) =>
    setForm((prev) => ({
      ...prev,
      deliveryOptions: prev.deliveryOptions.includes(key)
        ? prev.deliveryOptions.filter((d) => d !== key)
        : [...prev.deliveryOptions, key],
    }));

  const canSubmit = form.storeName.trim().length > 0 && form.slug.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ ...form, storeName: form.storeName.trim(), slug: slugify(form.slug) });
  };

  return (
    <Dialog open={open} onClose={onClose} title="Edit store profile" size="lg">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <div>
          <Label>Store name</Label>
          <Input value={form.storeName} onChange={(e) => set('storeName', e.target.value)} placeholder="e.g. Acme Luzon Shop" />
        </div>

        <div>
          <Label>Description</Label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={2}
            placeholder="Short description shown to customers"
            className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
        </div>

        <div>
          <Label>Store URL</Label>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-gray-400">gogoxpress.shop/</span>
            <Input
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              onBlur={() => set('slug', slugify(form.slug))}
              placeholder="store-slug"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label>Contact email</Label>
            <Input type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} placeholder="shop@example.com" />
          </div>
          <div>
            <Label>Contact number</Label>
            <Input value={form.contactNumber} onChange={(e) => set('contactNumber', e.target.value)} placeholder="+63 9xx xxx xxxx" />
          </div>
        </div>

        <div>
          <Label>Delivery options offered</Label>
          <div className="flex flex-wrap gap-2">
            {STOREFRONT_DELIVERY_OPTIONS.map((key) => {
              const selected = form.deliveryOptions.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleDelivery(key)}
                  className={cn(
                    'px-3 py-1.5 rounded-full border text-sm font-medium transition-colors cursor-pointer',
                    selected
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50',
                  )}
                >
                  {getServiceTypeLabel(key)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex gap-2.5 justify-end pt-4 mt-2 border-t border-gray-100">
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" disabled={!canSubmit} onClick={handleSubmit}>Save changes</Button>
      </div>
    </Dialog>
  );
}
