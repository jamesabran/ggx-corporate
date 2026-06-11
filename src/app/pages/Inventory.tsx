import { useEffect, useState } from 'react';
import { IconPackage, IconPlus } from '@tabler/icons-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { EnablementGate } from '../components/EnablementGate';
import { useModuleAccessContext } from '../hooks/useModuleAccess';
import { isFeatureUsable } from '../services/featureEnablementService';
import { getInventoryProducts, isLowStock, type InventoryProduct } from '../services/inventoryService';

/**
 * Inventory — basic product list scoped to the current account/subaccount.
 * Renders the EnablementGate when Inventory isn't usable for the scope (disabled,
 * needs setup, or role-blocked). See docs/inventory_rules.md.
 *
 * This is the foundational list/empty-state pass. Create/edit/import flows are
 * deferred (see roadmap).
 */
export function Inventory() {
  const ctx = useModuleAccessContext();
  const scopeId = ctx.scopeAccountId;
  const [usable, setUsable] = useState<boolean | null>(null);
  const [products, setProducts] = useState<InventoryProduct[]>([]);

  useEffect(() => {
    let active = true;
    isFeatureUsable('inventory', scopeId).then((ok) => {
      if (!active) return;
      setUsable(ok);
      if (ok) getInventoryProducts(scopeId).then((p) => { if (active) setProducts(p); });
    });
    return () => { active = false; };
  }, [scopeId]);

  if (usable === null) return null;
  if (!usable) return <EnablementGate moduleId="inventory" />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-1">
            Products available to attach to bookings and storefront listings for this account.
          </p>
        </div>
        <Button size="sm">
          <IconPlus className="w-4 h-4" /> Add Product
        </Button>
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
            <div className="flex justify-center mt-6">
              <Button><IconPlus className="w-4 h-4" /> Add Product</Button>
            </div>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
