import { useState } from 'react';
import { IconPlus, IconCheck, IconBuilding, IconCreditCard, IconShield, IconTrash, IconAlertTriangle } from '@tabler/icons-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  holder: string;
  isDefault: boolean;
  verified: boolean;
}

interface BankAccount {
  id: string;
  bank: string;
  accountMasked: string;
  accountName: string;
  isPrimary: boolean;
  status: 'verified' | 'pending';
}

const initialMethods: PaymentMethod[] = [
  { id: 'pm1', brand: 'Visa', last4: '4242', expiry: '12/2027', holder: 'Acme Corporation', isDefault: true, verified: true },
  { id: 'pm2', brand: 'Mastercard', last4: '8888', expiry: '08/2028', holder: 'Acme Corporation', isDefault: false, verified: true },
];

const initialBanks: BankAccount[] = [
  { id: 'ba1', bank: 'BDO Unibank', accountMasked: '•••• •••• ••34 5678', accountName: 'Acme Corporation', isPrimary: true, status: 'verified' },
  { id: 'ba2', bank: 'BPI', accountMasked: '•••• •••• ••12 3456', accountName: 'Acme Corporation', isPrimary: false, status: 'pending' },
];

type EditState =
  | { type: 'method'; id: string; holder: string; expiry: string }
  | { type: 'bank'; id: string; accountName: string }
  | null;

type RemoveState =
  | { type: 'method'; id: string; label: string }
  | { type: 'bank'; id: string; label: string }
  | null;

export function PaymentSettings() {
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);
  const [banks, setBanks] = useState<BankAccount[]>(initialBanks);
  const [edit, setEdit] = useState<EditState>(null);
  const [remove, setRemove] = useState<RemoveState>(null);

  const saveEdit = () => {
    if (!edit) return;
    if (edit.type === 'method') {
      setMethods((prev) => prev.map((m) => (m.id === edit.id ? { ...m, holder: edit.holder, expiry: edit.expiry } : m)));
    } else {
      setBanks((prev) => prev.map((b) => (b.id === edit.id ? { ...b, accountName: edit.accountName } : b)));
    }
    setEdit(null);
  };

  const confirmRemove = () => {
    if (!remove) return;
    if (remove.type === 'method') {
      setMethods((prev) => prev.filter((m) => m.id !== remove.id));
    } else {
      setBanks((prev) => prev.filter((b) => b.id !== remove.id));
    }
    setRemove(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment Settings</h1>
        <p className="text-gray-600 mt-1">Manage how you pay GoGo Xpress and receive earnings</p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Methods</h2>
          <p className="text-sm text-gray-600 mb-4">For paying billing statements to GoGo Xpress</p>

          <div className="space-y-4">
            {methods.map((m) => (
              <Card key={m.id} className={m.isDefault ? 'border-blue-300 bg-blue-50/50' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${m.isDefault ? 'bg-gradient-to-r from-blue-600 to-blue-800' : 'bg-gray-100'}`}>
                        <IconCreditCard className={`w-6 h-6 ${m.isDefault ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-gray-900">{m.brand} •••• {m.last4}</p>
                          {m.isDefault && <Badge variant="info">Default</Badge>}
                          {m.verified && <Badge variant="success">Verified</Badge>}
                        </div>
                        <p className="text-sm text-gray-600">Expires {m.expiry}</p>
                        <p className="text-sm text-gray-600">{m.holder}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!m.isDefault && <Button variant="outline" size="sm">Set as Default</Button>}
                      <Button variant="ghost" size="sm" onClick={() => setEdit({ type: 'method', id: m.id, holder: m.holder, expiry: m.expiry })}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setRemove({ type: 'method', id: m.id, label: `${m.brand} •••• ${m.last4}` })}>Remove</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" className="w-full">
              <IconPlus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>

          <Card className="mt-6 bg-gray-50 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <IconShield className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Auto-Pay (Coming Soon)</h4>
                  <p className="text-sm text-gray-600">
                    Automatically pay billing statements using your default payment method. This feature will be available soon to ensure seamless transactions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payout Bank Accounts</h2>
          <p className="text-sm text-gray-600 mb-4">For receiving COD earnings and online payment settlements</p>

          <div className="space-y-4">
            {banks.map((b) => (
              <Card key={b.id} className={b.isPrimary ? 'border-green-300 bg-green-50/50' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${b.isPrimary ? 'bg-green-600' : 'bg-gray-100'}`}>
                        <IconBuilding className={`w-6 h-6 ${b.isPrimary ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-gray-900">{b.bank}</p>
                          {b.isPrimary && <Badge variant="info">Primary</Badge>}
                          {b.status === 'verified' ? <Badge variant="success">Verified</Badge> : <Badge variant="warning">Pending Verification</Badge>}
                        </div>
                        <p className="text-sm text-gray-600">Account Number: {b.accountMasked}</p>
                        <p className="text-sm text-gray-600">Account Name: {b.accountName}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!b.isPrimary && <Button variant="outline" size="sm">Set as Primary</Button>}
                      <Button variant="ghost" size="sm" onClick={() => setEdit({ type: 'bank', id: b.id, accountName: b.accountName })}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setRemove({ type: 'bank', id: b.id, label: b.bank })}>Remove</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" className="w-full">
              <IconPlus className="w-4 h-4 mr-2" />
              Add Bank Account
            </Button>
          </div>

          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <IconCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Payout Schedule</h4>
                    <p className="text-sm text-blue-800">
                      Payouts are processed weekly and deposited to your nominated bank account within 1-2 business days after verification.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <IconCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Bank Account Verification</h4>
                    <p className="text-sm text-blue-800">
                      New bank accounts must be verified before they can receive payouts. Verification typically takes 1-3 business days.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit modal */}
      {edit && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-5">
              {edit.type === 'method' ? 'Edit Payment Method' : 'Edit Bank Account'}
            </h3>
            <div className="space-y-4">
              {edit.type === 'method' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Cardholder / Account Name</label>
                    <Input value={edit.holder} onChange={(e) => setEdit({ ...edit, holder: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry (MM/YYYY)</label>
                    <Input value={edit.expiry} onChange={(e) => setEdit({ ...edit, expiry: e.target.value })} />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Name</label>
                  <Input value={edit.accountName} onChange={(e) => setEdit({ ...edit, accountName: e.target.value })} />
                </div>
              )}
            </div>
            <div className="flex gap-2.5 justify-end pt-5">
              <Button variant="outline" size="sm" onClick={() => setEdit(null)}>Cancel</Button>
              <Button size="sm" onClick={saveEdit}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove confirmation */}
      {remove && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1.5">
              Remove {remove.type === 'method' ? 'payment method' : 'bank account'}?
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              <span className="font-medium text-gray-700">{remove.label}</span> will be removed from your account. This action cannot be undone.
            </p>
            <div className="flex items-start gap-2 mb-5 text-xs text-gray-500">
              <IconAlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5" />
              Any scheduled payments or payouts using this {remove.type === 'method' ? 'card' : 'account'} will need a new method.
            </div>
            <div className="flex gap-2.5 justify-end">
              <Button variant="outline" size="sm" onClick={() => setRemove(null)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={confirmRemove}>
                <IconTrash className="w-3.5 h-3.5 mr-1.5" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
