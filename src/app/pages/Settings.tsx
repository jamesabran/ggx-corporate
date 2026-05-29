import { useNavigate } from 'react-router';
import { IconBuilding, IconArrowRight } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useSubAccounts } from '../contexts/SubAccountContext';

export function Settings() {
  const navigate = useNavigate();
  const { subAccountsEnabled } = useSubAccounts();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences and settings</p>
      </div>

      <div className="grid gap-6 max-w-3xl">
        {!subAccountsEnabled && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <IconBuilding className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <CardTitle>Enable Subaccounts</CardTitle>
                  <CardDescription className="text-blue-800">
                    Manage multiple brands, branches, or clients under one main account
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-900 mb-4">
                Subaccounts allow you to organize your operations across different business units while keeping billing and finance consolidated. Perfect for businesses managing multiple brands, regional offices, or client accounts.
              </p>
              <Button onClick={() => navigate('/dashboard/subaccounts/enable')}>
                Enable Subaccounts
                <IconArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Update your company details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
              <Input defaultValue="Acme Corporation" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <Input type="email" defaultValue="admin@acme.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <Input type="tel" defaultValue="+63 917 123 4567" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <Input defaultValue="123 Ayala Avenue, Suite 100" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <Input defaultValue="Makati City" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Province</label>
                <Input defaultValue="Metro Manila" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ZIP Code</label>
                <Input defaultValue="1226" />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button>Save Changes</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Manage email and notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { id: 'delivery', label: 'Delivery status updates', checked: true },
              { id: 'billing', label: 'Billing and invoice notifications', checked: true },
              { id: 'weekly', label: 'Weekly summary reports', checked: true },
              { id: 'marketing', label: 'Marketing and promotional emails', checked: false },
            ].map((item) => (
              <label key={item.id} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked={item.checked} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                <span className="text-sm text-gray-700">{item.label}</span>
              </label>
            ))}
            <div className="pt-4">
              <Button>Update Preferences</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage password and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button variant="outline">Change Password</Button>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                <span className="text-sm text-gray-700">Enable two-factor authentication</span>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
