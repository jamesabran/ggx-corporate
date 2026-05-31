import { useNavigate, Link } from 'react-router';
import { IconBuilding, IconArrowRight, IconEdit, IconSettings } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AddressDisplayCard } from '../components/AddressDisplayCard';
import type { Address } from '../components/AddressBook';
import { useSubAccounts } from '../contexts/SubAccountContext';

// Default pickup address shown on the account. Address Book is the source of
// truth for creating/editing addresses, so this is display-only here.
const companyAddress: Address = {
  id: 'company-default',
  label: 'office',
  name: 'Acme Corporation',
  mobileNumber: '+63 917 123 4567',
  province: 'Metro Manila',
  city: 'Makati',
  barangay: 'Poblacion',
  otherDetails: '5th Floor, ABC Building, Ayala Avenue',
  postalCode: '1226',
  isPreferred: true,
};

export function Settings() {
  const navigate = useNavigate();
  const { subAccountsEnabled, isMainAccountView, getCurrentAccountName, getCurrentAccountId } = useSubAccounts();

  // When the user is viewing a specific subaccount (not Main Account), surface a
  // contextual banner pointing to that subaccount's dedicated settings page.
  const inSubaccountView = subAccountsEnabled && !isMainAccountView();
  const subaccountId   = inSubaccountView ? getCurrentAccountId()   : null;
  const subaccountName = inSubaccountView ? getCurrentAccountName() : null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          {inSubaccountView
            ? `Main account settings — you are viewing as ${subaccountName}`
            : 'Manage your account preferences and settings'}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Subaccount context banner — shown when drilling into a subaccount */}
        {inSubaccountView && subaccountId && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <IconSettings className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-0.5">
                    Subaccount-specific settings
                  </p>
                  <p className="text-sm text-blue-800 mb-3">
                    You are currently viewing <strong>{subaccountName}</strong>. This page shows
                    main-account settings. For pickup address, manager assignments, and
                    subaccount-level configuration, visit the subaccount settings page.
                  </p>
                  <Link to={`/dashboard/subaccounts/${subaccountId}/settings`}>
                    <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                      Open Subaccount Settings
                      <IconArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Pickup Address</label>
                <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => navigate('/dashboard/address-book')}>
                  <IconEdit className="w-3.5 h-3.5 mr-1.5" />
                  Edit in Address Book
                </Button>
              </div>
              <Card className="border-blue-300 ring-1 ring-blue-200">
                <CardContent className="p-5">
                  <AddressDisplayCard address={companyAddress} />
                </CardContent>
              </Card>
              <p className="text-xs text-gray-500 mt-2">
                Addresses are managed in the Address Book to keep pickup-supported locations consistent.
              </p>
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
