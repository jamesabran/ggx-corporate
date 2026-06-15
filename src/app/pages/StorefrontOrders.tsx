import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { IconShoppingBag, IconArrowRight, IconInfoCircle } from '@tabler/icons-react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { EnablementGate } from '../components/EnablementGate';
import { useModuleAccessContext } from '../hooks/useModuleAccess';
import { isFeatureUsable } from '../services/featureEnablementService';
import {
  getOrders,
  STOREFRONT_ORDER_STATUS_META,
  type StorefrontOrder,
  type StorefrontOrderStatus,
} from '../services/storefrontOrdersService';
import { SERVICE_TYPE_SHORT_LABEL, type DeliveryServiceType } from '../services/transactionService';

const peso = (n: number) => `₱${n.toLocaleString('en-PH')}`;

const SERVICE_BADGE: Record<DeliveryServiceType, string> = {
  standard: 'bg-blue-100 text-blue-800',
  same_day: 'bg-orange-100 text-orange-800',
  on_demand: 'bg-violet-100 text-violet-800',
};

function itemsSummary(o: StorefrontOrder): string {
  const count = o.items.reduce((sum, i) => sum + i.quantity, 0);
  const first = o.items[0]?.name ?? 'Items';
  const more = o.items.length > 1 ? ` +${o.items.length - 1} more` : '';
  return `${count} × ${first}${more}`;
}

/**
 * StorefrontOrders — seller-facing queue of BUYER commerce orders placed through
 * the public storefront / product checkout. Distinct from delivery Transactions:
 * an order here becomes a delivery transaction only once the seller accepts it.
 */
export function StorefrontOrders() {
  const navigate = useNavigate();
  const ctx = useModuleAccessContext();
  const scopeId = ctx.scopeAccountId;

  const [usable, setUsable] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<StorefrontOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<StorefrontOrderStatus | 'all'>('all');

  useEffect(() => {
    let active = true;
    // Main/consolidated view (no scope) lists every store's orders; a specific
    // subaccount scope must have Storefront usable.
    const check = scopeId ? isFeatureUsable('storefront', scopeId) : Promise.resolve(true);
    check.then((ok) => {
      if (!active) return;
      setUsable(ok);
      if (ok) getOrders(scopeId).then((list) => { if (active) setOrders(list); });
    });
    return () => { active = false; };
  }, [scopeId]);

  if (usable === null) return null;
  if (!usable) return <EnablementGate moduleId="storefront" />;

  const filtered = statusFilter === 'all' ? orders : orders.filter((o) => o.status === statusFilter);
  const awaitingCount = orders.filter((o) => o.status === 'awaiting_acceptance').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Storefront Orders</h1>
          <p className="text-gray-600 mt-1">
            Buyer orders from your storefront. Accept an order to book it for delivery.
          </p>
        </div>
        {awaitingCount > 0 && (
          <Badge variant="pending" className="self-start md:self-auto">
            {awaitingCount} awaiting acceptance
          </Badge>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5">
        <IconInfoCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-900">
          These are buyer commerce orders — separate from delivery{' '}
          <button className="font-medium underline hover:text-blue-700" onClick={() => navigate('/dashboard/transactions')}>
            Transactions
          </button>
          . A delivery transaction is created only after you accept an order.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="text-base font-semibold text-gray-900">Orders</h2>
            <div className="w-full sm:w-[220px]">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StorefrontOrderStatus | 'all')}>
                <option value="all">All statuses</option>
                <option value="awaiting_acceptance">Awaiting seller acceptance</option>
                <option value="accepted">Accepted by seller</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>COD Total</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Placed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-400 text-sm">
                    No orders match this filter.
                  </TableCell>
                </TableRow>
              ) : filtered.map((o) => {
                const meta = STOREFRONT_ORDER_STATUS_META[o.status];
                return (
                  <TableRow
                    key={o.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(`/dashboard/storefront/orders/${o.id}`)}
                  >
                    <TableCell className="font-medium">{o.id}</TableCell>
                    <TableCell>
                      <span className="block text-gray-900">{o.buyer.name}</span>
                      <span className="block text-xs text-gray-500">{o.buyer.destination}</span>
                    </TableCell>
                    <TableCell className="text-gray-600">{itemsSummary(o)}</TableCell>
                    <TableCell>
                      <Badge className={SERVICE_BADGE[o.serviceType]}>{SERVICE_TYPE_SHORT_LABEL[o.serviceType]}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-900">{peso(o.codTotal)}</TableCell>
                    <TableCell><Badge variant={meta.variant}>{meta.label}</Badge></TableCell>
                    <TableCell className="text-gray-600">{o.placedAt}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" iconEnd>
                        Open
                        <IconArrowRight className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {orders.length === 0 && (
            <div className="py-10 text-center">
              <IconShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No storefront orders yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
