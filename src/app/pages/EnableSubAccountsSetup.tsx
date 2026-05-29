import { useState } from 'react';
import { useNavigate } from 'react-router';
import { IconCircleCheck, IconInfoCircle } from '@tabler/icons-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useSubAccounts } from '../contexts/SubAccountContext';

export function EnableSubAccountsSetup() {
  const navigate = useNavigate();
  const { enableSubAccounts } = useSubAccounts();
  const [step, setStep] = useState<'setup' | 'success'>('setup');

  const mainAccountData = {
    legalName: 'Acme Corporation',
    accountHolder: 'John Doe',
    billingEmail: 'billing@acme.com',
    financeContact: 'Jane Smith',
    contactNumber: '+63 917 123 4567',
    businessAddress: '123 Business St, Makati City, Metro Manila',
  };

  const handleEnable = () => {
    enableSubAccounts(mainAccountData, {
      id: 'sub-1',
      name: mainAccountData.legalName,
      type: 'default',
      assignedManager: mainAccountData.accountHolder,
      status: 'active',
      bookingCount: 0,
      senderName: mainAccountData.legalName,
      pickupAddress: mainAccountData.businessAddress,
      contactNumber: mainAccountData.contactNumber,
    });
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconCircleCheck className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Subaccounts enabled successfully</h1>
          <p className="text-sm text-gray-600">Your account structure has been upgraded</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-start gap-3">
              <IconCircleCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Main Account Active</div>
                <div className="text-sm text-gray-600">{mainAccountData.legalName}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <IconCircleCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Default Subaccount Created</div>
                <div className="text-sm text-gray-600">{mainAccountData.legalName}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <IconCircleCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Workspace Switcher Available</div>
                <div className="text-sm text-gray-600">Navigate between subaccounts from the sidebar</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/dashboard/subaccounts/request')}>Request Additional Subaccount</Button>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirm Account Structure</h1>
        <p className="text-sm text-gray-600">Review your account configuration before enabling subaccounts</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Main Account</CardTitle>
            <span className="text-xs text-gray-500">Centralized billing & finance</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Legal / Business Name</div>
              <div className="text-sm font-medium text-gray-900">{mainAccountData.legalName}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Account Holder</div>
              <div className="text-sm font-medium text-gray-900">{mainAccountData.accountHolder}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Email</div>
              <div className="text-sm font-medium text-gray-900">{mainAccountData.billingEmail}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Contact Number</div>
              <div className="text-sm font-medium text-gray-900">{mainAccountData.contactNumber}</div>
            </div>
          </div>
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">Need changes? Contact your Account Manager.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Default Subaccount</CardTitle>
            <span className="text-xs text-gray-500">Operational workspace</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <IconInfoCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Your current booking profile will become your default subaccount</p>
                <p className="text-blue-700">All existing operational settings will be automatically inherited</p>
              </div>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Subaccount Name</div>
            <div className="text-sm font-medium text-gray-900">{mainAccountData.legalName}</div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate('/dashboard/settings')}>Cancel</Button>
        <Button onClick={handleEnable}>Enable Subaccounts</Button>
      </div>
    </div>
  );
}
