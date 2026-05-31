import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  IconBuilding, IconLock, IconPlus, IconChartBar, IconSettings,
  IconUser, IconUserPlus,
} from '@tabler/icons-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useSubAccounts } from '../contexts/SubAccountContext';
// Subaccount LIST now comes from accountService (which reads the runtime store
// mirrored by SubAccountContext, so Request-flow adds are included). The context
// is still used for enabled state, account switching, and as a reload trigger.
// Manager lookups go through userService.
import { getSubaccounts, type MockSubaccount } from '../services/accountService';
import { getManagersBySubaccountId, type AppUser } from '../services/userService';

function ManagerSlot({
  label,
  manager,
}: {
  label: 'Primary Manager' | 'Backup Manager';
  manager: { name: string; email: string } | null;
}) {
  if (manager) {
    const inits = manager.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
          <span className="text-[9px] font-bold text-white">{inits}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 leading-none mb-0.5">{label}</p>
          <p className="text-sm font-medium text-gray-900 leading-snug truncate">{manager.name}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        <IconUserPlus className="w-3.5 h-3.5 text-gray-400" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 leading-none mb-0.5">{label}</p>
        <p className="text-sm text-gray-400 italic leading-snug">Vacant</p>
      </div>
    </div>
  );
}

export function SubAccounts() {
  const navigate = useNavigate();
  // `subAccounts` from context is the reactivity trigger (Request-flow adds);
  // the rendered list is read from accountService (the runtime-aware facade).
  const { subAccountsEnabled, subAccounts, setCurrentAccount } = useSubAccounts();

  const [accounts, setAccounts] = useState<MockSubaccount[]>([]);
  const [managersByAccount, setManagersByAccount] = useState<Record<string, AppUser[]>>({});

  useEffect(() => {
    let cancelled = false;
    getSubaccounts()
      .then(async (list) => {
        if (cancelled) return;
        setAccounts(list);
        const entries = await Promise.all(
          list.map(async (sa) => [sa.id, await getManagersBySubaccountId(sa.id)] as const)
        );
        if (!cancelled) setManagersByAccount(Object.fromEntries(entries));
      })
      .catch(() => { if (!cancelled) { setAccounts([]); setManagersByAccount({}); } });
    return () => { cancelled = true; };
  }, [subAccounts]);

  if (!subAccountsEnabled) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto py-16 px-4">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <IconLock className="w-8 h-8 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Subaccounts are not enabled yet</h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Manage multiple brands, branches, or clients under one main account. Assign
              managers per subaccount while keeping billing and finance consolidated.
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6 space-y-4">
              {[
                { icon: IconBuilding, title: 'Organize by brand or branch', desc: 'Create separate operational spaces for each business unit' },
                { icon: IconUser,     title: 'Delegate management',          desc: 'Assign operational managers while maintaining centralized oversight' },
                { icon: IconChartBar, title: 'Consolidated reporting',       desc: 'View performance per subaccount or across all operations' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 mb-1">{item.title}</div>
                    <div className="text-sm text-gray-600">{item.desc}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="text-center">
            <Button onClick={() => navigate('/dashboard/subaccounts/enable')} className="px-8">
              Enable Subaccounts
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subaccounts</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your brands, branches, and operational units
            </p>
          </div>
          <Button onClick={() => navigate('/dashboard/subaccounts/request')}>
            <IconPlus className="w-4 h-4 mr-2" />
            Request Additional Subaccount
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {accounts.map((subAccount) => {
          const managers = managersByAccount[subAccount.id] ?? [];
          const primary = managers[0] ?? null;
          const backup  = managers[1] ?? null;

          return (
            <Card key={subAccount.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <IconBuilding className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg leading-snug">
                          {subAccount.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="info" className="text-xs px-2 py-0.5">
                            {subAccount.type === 'default' ? 'Default' : 'Additional'}
                          </Badge>
                          <Badge
                            variant={subAccount.status === 'active' ? 'success' : 'default'}
                            className="text-xs px-2 py-0.5"
                          >
                            {subAccount.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      {/* Manager slots */}
                      <ManagerSlot label="Primary Manager" manager={primary} />
                      <ManagerSlot label="Backup Manager"  manager={backup} />

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Pickup Address</div>
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {subAccount.pickupAddress}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Total Bookings</div>
                        <div className="text-sm font-medium text-gray-900">
                          {subAccount.bookingCount.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline" size="sm"
                        onClick={() => { setCurrentAccount(subAccount.id); navigate('/dashboard'); }}
                      >
                        <IconChartBar className="w-4 h-4 mr-1.5" />
                        View Dashboard
                      </Button>
                      <Button
                        variant="outline" size="sm"
                        onClick={() => navigate(`/dashboard/subaccounts/${subAccount.id}/settings`)}
                      >
                        <IconSettings className="w-4 h-4 mr-1.5" />
                        Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {accounts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <IconBuilding className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No subaccounts yet</h3>
            <p className="text-gray-600 mb-4">Get started by requesting your first subaccount</p>
            <Button onClick={() => navigate('/dashboard/subaccounts/request')}>
              <IconPlus className="w-4 h-4 mr-2" />
              Request Subaccount
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
