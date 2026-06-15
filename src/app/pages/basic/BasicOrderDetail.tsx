import { useParams, useNavigate, Link } from 'react-router';
import {
  IconMapPin,
  IconUser,
  IconPackage,
  IconCircleCheckFilled,
  IconTruck,
  IconHourglass,
  IconArrowBackUp,
  IconCopy,
} from '@tabler/icons-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';
import { getBasicOrder, STATUS_LABEL, STATUS_VARIANT, type OrderStatus } from './basicMockData';

const TIMELINE: { status: OrderStatus; label: string }[] = [
  { status: 'pending',    label: 'Booked' },
  { status: 'in-transit', label: 'On the way' },
  { status: 'delivered',  label: 'Delivered' },
];

const STATUS_ICON: Record<OrderStatus, React.ComponentType<{ className?: string }>> = {
  'pending': IconHourglass,
  'in-transit': IconTruck,
  'delivered': IconCircleCheckFilled,
  'returned': IconArrowBackUp,
};

export function BasicOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = getBasicOrder(id);

  if (!order) {
    return (
      <div className="px-4 pt-10 text-center">
        <p className="text-sm font-semibold text-gray-700">Order not found</p>
        <p className="text-xs text-gray-400 mt-1">This booking isn’t in your recent orders.</p>
        <Button variant="outline" className="mt-5 h-11" onClick={() => navigate('/basic/orders')}>
          Back to Orders
        </Button>
      </div>
    );
  }

  const StatusIcon = STATUS_ICON[order.status];
  const reachedIdx = order.status === 'returned'
    ? 1
    : TIMELINE.findIndex((t) => t.status === order.status);

  return (
    <div className="px-4 pt-3 pb-2 space-y-4">
      {/* Status header */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{order.id}</p>
            <button className="text-gray-300 hover:text-gray-500 cursor-pointer" aria-label="Copy tracking number">
              <IconCopy className="w-3.5 h-3.5" />
            </button>
          </div>
          <Badge variant={STATUS_VARIANT[order.status]} className="text-[10px] px-2 py-0.5 leading-none flex-shrink-0">
            {STATUS_LABEL[order.status]}
          </Badge>
        </div>

        {/* Timeline */}
        {order.status === 'returned' ? (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5">
            <StatusIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-700 leading-snug">Parcel was returned to sender.</p>
          </div>
        ) : (
          <div className="flex items-center">
            {TIMELINE.map((t, i) => {
              const done = i <= reachedIdx;
              const TIcon = STATUS_ICON[t.status];
              return (
                <div key={t.status} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center',
                      done ? 'bg-blue-600' : 'bg-gray-100'
                    )}>
                      <TIcon className={cn('w-[18px] h-[18px]', done ? 'text-white' : 'text-gray-400')} />
                    </div>
                    <span className={cn('text-[10px] font-medium', done ? 'text-blue-600' : 'text-gray-400')}>{t.label}</span>
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div className={cn('h-0.5 flex-1 mx-1 -mt-4', i < reachedIdx ? 'bg-blue-600' : 'bg-gray-200')} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recipient & address */}
      <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <IconUser className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none mb-1">Recipient</p>
            <p className="text-sm text-gray-800 leading-snug">{order.recipient}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <IconMapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none mb-1">Delivery Address</p>
            <p className="text-sm text-gray-800 leading-snug">{order.address}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <IconPackage className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none mb-1">Service</p>
            <p className="text-sm text-gray-800 leading-snug">{order.service} · Booked {order.bookedAt}</p>
          </div>
        </div>
      </div>

      {/* COD summary */}
      <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider leading-none mb-1">COD to Collect</p>
          <p className="text-2xl font-extrabold text-blue-600 leading-none tabular-nums">
            ₱{order.cod.toLocaleString()}
          </p>
        </div>
        <Link to="/basic/earnings" className="text-xs font-semibold text-blue-600">
          View payouts →
        </Link>
      </div>

      {/* Actions */}
      <div className="space-y-2.5">
        <Link to={`/track/${order.id}`}>
          <Button variant="outline" className="w-full h-12 text-base">Track this parcel</Button>
        </Link>
        <Link to="/basic/support">
          <Button variant="ghost" className="w-full h-12 text-base text-gray-600">Get help with this order</Button>
        </Link>
      </div>
    </div>
  );
}
