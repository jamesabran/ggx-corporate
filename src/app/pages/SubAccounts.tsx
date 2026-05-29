import { useNavigate } from 'react-router';
import { IconBuilding, IconLock, IconPlus, IconUsers, IconChartBar, IconSettings } from '@tabler/icons-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { useSubAccounts } from '../contexts/SubAccountContext';

export function SubAccounts() {
  const navigate = useNavigate();
  const { subAccountsEnabled, subAccounts, setCurrentAccount } = useSubAccounts();

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
              Manage multiple brands, branches, or clients under one main account. Assign managers per subaccount while keeping billing and finance consolidated.
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <IconBuilding className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">Organize by brand or branch</div>
                  <div className="text-sm text-gray-600">Create separate operational spaces for each business unit</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <IconUsers className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">Delegate management</div>
                  <div className="text-sm text-gray-600">Assign operational managers while maintaining centralized oversight</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <IconChartBar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 mb-1">Consolidated reporting</div>
                  <div className="text-sm text-gray-600">View performance per subaccount or across all operations</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button onClick={() => navigate('/dashboard/subaccounts/enable')} className="px-8">Enable Subaccounts</Button>
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
            <p className="text-sm text-gray-600 mt-1">Manage your brands, branches, and operational units</p>
          </div>
          <Button onClick={() => navigate('/dashboard/subaccounts/request')}>
            <IconPlus className="w-4 h-4 mr-2" />
            Request Additional Subaccount
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {subAccounts.map((subAccount) => (
          <Card key={subAccount.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                      <IconBuilding className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{subAccount.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                          {subAccount.type === 'default' ? 'Default' : 'Additional'}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                          {subAccount.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Assigned Manager</div>
                      <div className="text-sm font-medium text-gray-900">{subAccount.assignedManager}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Pickup Address</div>
                      <div className="text-sm font-medium text-gray-900 truncate">{subAccount.pickupAddress}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Total Bookings</div>
                      <div className="text-sm font-medium text-gray-900">{subAccount.bookingCount.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setCurrentAccount(subAccount.id); navigate('/dashboard'); }}>
                      <IconChartBar className="w-4 h-4 mr-1.5" />
                      View Dashboard
                    </Button>
                    <Button variant="outline" size="sm">
                      <IconUsers className="w-4 h-4 mr-1.5" />
                      Manage Users
                    </Button>
                    <Button variant="outline" size="sm">
                      <IconSettings className="w-4 h-4 mr-1.5" />
                      Settings
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {subAccounts.length === 0 && (
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
