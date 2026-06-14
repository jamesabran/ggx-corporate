import { useState } from 'react';
import {
  IconWallet,
  IconBuildingBank,
  IconCircleCheckFilled,
  IconClock,
  IconPlus,
  IconChevronRight,
  IconShieldCheck,
} from '@tabler/icons-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Dialog } from '../../components/ui/Dialog';
import { cn } from '../../lib/utils';

interface Payout {
  id: string;
  amount: number;
  status: 'deposited' | 'processing' | 'scheduled';
  date: string;
}

const PAYOUTS: Payout[] = [
  { id: 'PO-0612', amount: 6420, status: 'deposited',  date: 'Jun 12, 2026' },
  { id: 'PO-0605', amount: 5180, status: 'deposited',  date: 'Jun 5, 2026' },
  { id: 'PO-0614', amount: 4320, status: 'processing', date: 'Expected Jun 14' },
  { id: 'PO-0619', amount: 1890, status: 'scheduled',  date: 'Scheduled Jun 19' },
];

const PAYOUT_CFG: Record<Payout['status'], { label: string; variant: 'success' | 'pending' | 'info'; icon: React.ComponentType<{ className?: string }> }> = {
  deposited:  { label: 'Deposited',  variant: 'success', icon: IconCircleCheckFilled },
  processing: { label: 'Processing', variant: 'pending', icon: IconClock },
  scheduled:  { label: 'Scheduled',  variant: 'info',    icon: IconClock },
};

export function BasicEarnings() {
  // Demo state: whether the seller has enrolled a payout bank account yet.
  const [bank, setBank] = useState<{ name: string; acct: string } | null>({
    name: 'BPI', acct: '•••• 4821',
  });
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [form, setForm] = useState({ bankName: 'BPI', accountName: '', accountNumber: '' });

  const saveBank = () => {
    if (!form.accountName || !form.accountNumber) return;
    setBank({ name: form.bankName, acct: `•••• ${form.accountNumber.slice(-4)}` });
    setEnrollOpen(false);
  };

  return (
    <div className="px-4 pt-3 pb-2 space-y-4">
      {/* Available balance */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-sm p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <IconWallet className="w-4 h-4 text-blue-200" />
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest">Available for payout</p>
        </div>
        <p className="text-3xl font-extrabold leading-none tabular-nums">₱18,450</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
          <div>
            <p className="text-[11px] text-blue-200 uppercase tracking-wider leading-none mb-1">For processing</p>
            <p className="text-base font-bold leading-none tabular-nums">₱4,320</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-blue-200 uppercase tracking-wider leading-none mb-1">Collected (30d)</p>
            <p className="text-base font-bold leading-none tabular-nums">₱42,180</p>
          </div>
        </div>
      </div>

      {/* Payout bank account */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-gray-900">Payout account</p>
          {bank && <Badge variant="success" className="text-[10px] px-2 py-0.5 leading-none">Verified</Badge>}
        </div>

        {bank ? (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <IconBuildingBank className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-snug">{bank.name}</p>
              <p className="text-xs text-gray-500 leading-snug">{bank.acct}</p>
            </div>
            <button
              onClick={() => setEnrollOpen(true)}
              className="text-xs font-semibold text-blue-600 cursor-pointer flex items-center gap-0.5"
            >
              Manage <IconChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center mb-2">
              <IconBuildingBank className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900">Add a bank account to get paid</p>
            <p className="text-xs text-gray-400 mt-1 mb-3">Payouts are deposited to your enrolled bank account.</p>
            <Button className="h-11 px-6" onClick={() => setEnrollOpen(true)}>
              <IconPlus className="w-4 h-4" /> Enroll bank account
            </Button>
          </div>
        )}
      </div>

      {/* Payout history */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <p className="px-4 pt-4 pb-2 text-sm font-bold text-gray-900">Payouts</p>
        <div className="divide-y divide-gray-50">
          {PAYOUTS.map((p) => {
            const cfg = PAYOUT_CFG[p.status];
            const Icon = cfg.icon;
            return (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  p.status === 'deposited' ? 'bg-emerald-50' : p.status === 'processing' ? 'bg-orange-50' : 'bg-blue-50'
                )}>
                  <Icon className={cn(
                    'w-5 h-5',
                    p.status === 'deposited' ? 'text-emerald-500' : p.status === 'processing' ? 'text-orange-400' : 'text-blue-500'
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-snug tabular-nums">₱{p.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 leading-snug">{p.date}</p>
                </div>
                <Badge variant={cfg.variant} className="text-[10px] px-2 py-0.5 leading-none flex-shrink-0">{cfg.label}</Badge>
              </div>
            );
          })}
        </div>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 px-4 text-center leading-snug">
        <IconShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
        Payout amounts and schedules are managed by GoGo Xpress finance.
      </p>

      {/* Enroll / manage bank dialog */}
      <Dialog open={enrollOpen} onClose={() => setEnrollOpen(false)} title={bank ? 'Manage payout account' : 'Enroll bank account'}>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">Bank</label>
            <Select
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              className="mt-1"
            >
              <option>BPI</option>
              <option>BDO</option>
              <option>UnionBank</option>
              <option>GCash</option>
              <option>Maya</option>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Account name</label>
            <Input
              className="mt-1"
              placeholder="Full name on the account"
              value={form.accountName}
              onChange={(e) => setForm({ ...form, accountName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Account number</label>
            <Input
              className="mt-1"
              inputMode="numeric"
              placeholder="Account / wallet number"
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
            />
          </div>
          <Button className="w-full h-11" onClick={saveBank}>
            {bank ? 'Save changes' : 'Enroll account'}
          </Button>
          <p className="text-[11px] text-gray-400 text-center leading-snug">
            Your details are used only for payouts. Verification may take 1–2 business days.
          </p>
        </div>
      </Dialog>
    </div>
  );
}
