import { useState } from 'react';
import { Link } from 'react-router';
import { IconPlus, IconSearch, IconBox, IconDotsVertical } from '@tabler/icons-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../lib/utils';

interface Product {
  name: string;
  sku: string;
  price: number;
  stock: number;
}

const PRODUCTS: Product[] = [
  { name: 'Cotton Tote Bag',      sku: 'TOTE-001', price: 249, stock: 38 },
  { name: 'Ceramic Mug 350ml',   sku: 'MUG-350',  price: 199, stock: 12 },
  { name: 'Scented Candle',      sku: 'CNDL-22',  price: 320, stock: 0 },
  { name: 'Notebook A5 Dotted',  sku: 'NB-A5D',   price: 150, stock: 64 },
  { name: 'Enamel Pin Set',      sku: 'PIN-SET',  price: 280, stock: 5 },
];

function stockBadge(stock: number) {
  if (stock === 0) return { variant: 'danger' as const, label: 'Out of stock' };
  if (stock <= 5)  return { variant: 'warning' as const, label: `Low · ${stock}` };
  return { variant: 'success' as const, label: `${stock} in stock` };
}

export function BasicInventory() {
  const [q, setQ] = useState('');
  const list = PRODUCTS.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="pb-2">
      {/* Search + add */}
      <div className="px-4 pt-3 pb-3 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white rounded-xl px-3 h-11 shadow-sm flex-1">
          <IconSearch className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Search products"
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none"
          />
        </div>
        <Button size="icon" className="h-11 w-11 flex-shrink-0" aria-label="Add product">
          <IconPlus className="w-5 h-5" />
        </Button>
      </div>

      {/* Note */}
      <p className="px-4 pb-3 text-xs text-gray-500 leading-snug">
        Products you list here can be sold from your storefront. Stock is for your reference and is not
        reserved or deducted at booking.
      </p>

      {/* List */}
      <div className="px-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
          {list.map((p) => {
            const sb = stockBadge(p.stock);
            return (
              <div key={p.sku} className="flex items-center gap-3 px-4 py-3.5">
                <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <IconBox className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-snug truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 leading-snug">{p.sku} · ₱{p.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={sb.variant} className={cn('text-[10px] px-2 py-0.5 leading-none')}>{sb.label}</Badge>
                  <button className="text-gray-300 hover:text-gray-500 cursor-pointer" aria-label="Product options">
                    <IconDotsVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {list.length === 0 && (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-semibold text-gray-700">No matching products</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-4">
        <Link to="/basic/store" className="text-xs font-semibold text-blue-600">← Back to your store</Link>
      </div>
    </div>
  );
}
