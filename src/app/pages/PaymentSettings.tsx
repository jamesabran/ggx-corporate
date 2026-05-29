import { IconPlus, IconCheck, IconBuilding, IconCreditCard, IconShield } from '@tabler/icons-react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function PaymentSettings() {
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
            <Card className="border-blue-300 bg-blue-50/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center flex-shrink-0">
                      <IconCreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-gray-900">Visa •••• 4242</p>
                        <Badge variant="info">Default</Badge>
                        <Badge variant="success">Verified</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Expires 12/2027</p>
                      <p className="text-sm text-gray-600">Acme Corporation</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Remove</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <IconCreditCard className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-gray-900">Mastercard •••• 8888</p>
                        <Badge variant="success">Verified</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Expires 08/2028</p>
                      <p className="text-sm text-gray-600">Acme Corporation</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Set as Default</Button>
                    <Button variant="ghost" size="sm">Remove</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

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
            <Card className="border-green-300 bg-green-50/50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                      <IconBuilding className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-gray-900">BDO Unibank</p>
                        <Badge variant="info">Primary</Badge>
                        <Badge variant="success">Verified</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Account Number: •••• •••• ••34 5678</p>
                      <p className="text-sm text-gray-600">Account Name: Acme Corporation</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Remove</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <IconBuilding className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-gray-900">BPI</p>
                        <Badge variant="warning">Pending Verification</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Account Number: •••• •••• ••12 3456</p>
                      <p className="text-sm text-gray-600">Account Name: Acme Corporation</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Set as Primary</Button>
                    <Button variant="ghost" size="sm">Remove</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

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
    </div>
  );
}
