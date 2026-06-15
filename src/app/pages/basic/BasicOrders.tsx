import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  IconTruck,
  IconCircleCheckFilled,
  IconHourglass,
  IconArrowBackUp,
  IconChevronRight,
  IconSearch,
} from '@tabler/icons-react';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';
import { BASIC_ORDERS, STATUS_LABEL, STATUS_VARIANT, type OrderStatus } from './basicMockData';

const QUICK_FILTERS: { key: 'all' | OrderStatus; label: string }[] = [
  { key: 'all',        label: 'All' },
  { key: 'pending',    label: 'Pending' },
  { key: 'in-transit', label: 'On the way' },
  { key: 'delivered',  label: 'Delivered' },
  { key: 'returned',   label: 'Returns' },
];

const STATUS_ICON: Record<OrderStatus, React.ComponentType<{ className?: string }>> = {
  'pending': IconHourglass,
  'in-transit': IconTruck,
  'delivered': IconCircleCheckFilled,
  'returned': IconArrowBackUp,
};

export function BasicOrders() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');

  const orders = filter === 'all' ? BASIC_ORDERS : BASIC_ORDERS.filter((o) => o.status === filter);

  return (
    <div className="pb-2">
      {/* Search */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 h-11 shadow-sm">
          <IconSearch className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search tracking no. or recipient"
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none"
          />
        </div>
      </div>

      {/* Quick filters */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none px-4 pb-3">
        {QUICK_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'flex-shrink-0 text-xs font-semibold rounded-full px-3.5 py-1.5 transition-colors cursor-pointer',
              filter === f.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="px-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm px-4 py-12 text-center">
            <p className="text-sm font-semibold text-gray-700">No orders here yet</p>
            <p className="text-xs text-gray-400 mt-1">Bookings in this status will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
            {orders.map((o) => {
              const StatusIcon = STATUS_ICON[o.status];
              return (
                <button
                  key={o.id}
                  onClick={() => navigate(`/basic/orders/${o.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    o.status === 'delivered'  ? 'bg-emerald-50' :
                    o.status === 'in-transit' ? 'bg-blue-50' :
                    o.status === 'returned'   ? 'bg-red-50' : 'bg-orange-50'
                  )}>
                    <StatusIcon className={cn(
                      'w-5 h-5',
                      o.status === 'delivered'  ? 'text-emerald-500' :
                      o.status === 'in-transit' ? 'text-blue-500' :
                      o.status === 'returned'   ? 'text-red-500' : 'text-orange-400'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate leading-snug">{o.id}</p>
                    <p className="text-xs text-gray-500 leading-snug truncate">{o.recipient} · {o.address}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <Badge variant={STATUS_VARIANT[o.status]} className="text-[10px] px-2 py-0.5 leading-none">
                      {STATUS_LABEL[o.status]}
                    </Badge>
                    <span className="text-[11px] text-gray-400 leading-none flex items-center gap-0.5">
                      {o.time} <IconChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
