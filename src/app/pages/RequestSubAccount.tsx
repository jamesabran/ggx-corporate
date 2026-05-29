import { useState } from 'react';
import { useNavigate } from 'react-router';
import { IconCircleCheck, IconAlertCircle } from '@tabler/icons-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useSubAccounts } from '../contexts/SubAccountContext';

export function RequestSubAccount() {
  const navigate = useNavigate();
  const { addSubAccount, subAccounts } = useSubAccounts();
  const [step, setStep] = useState<'form' | 'success'>('form');

  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    businessAddress: '',
    pickupAddress: '',
    billingReference: '',
    expectedVolume: '',
    preferredStartDate: '',
    assignedManager: '',
    managerRole: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSubAccountId = `sub-${subAccounts.length + 1}`;
    addSubAccount({
      id: newSubAccountId,
      name: formData.businessName,
      type: 'additional',
      assignedManager: formData.assignedManager,
      status: 'active',
      bookingCount: 0,
      senderName: formData.businessName,
      pickupAddress: formData.pickupAddress,
      contactNumber: '+63 917 123 4567',
    });
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconCircleCheck className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Request submitted successfully</h1>
            <p className="text-sm text-gray-600">
              Your request has been sent to the Sales Team for review. The new subaccount has been created for prototype demonstration.
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex gap-3">
                  <IconAlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <div className="font-medium mb-1">Prototype Note</div>
                    <div>
                      In a real implementation, Sales will review contracts and configuration before activation. For this demo, the subaccount "{formData.businessName}" has been created immediately.
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <IconCircleCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Subaccount Created</div>
                    <div className="text-sm text-gray-600">{formData.businessName}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <IconCircleCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Manager Assigned</div>
                    <div className="text-sm text-gray-600">{formData.assignedManager}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard/subaccounts')}>View All Subaccounts</Button>
            <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Request Additional Subaccount</h1>
        <p className="text-sm text-gray-600">
          Additional subaccounts require review and configuration by the Sales Team. Submit the details below so our team can assist with setup.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Business Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business / Brand / Client Name *</label>
                <Input required value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} placeholder="e.g., Acme Luzon" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Type *</label>
                <Select required value={formData.businessType} onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}>
                  <option value="">Select type</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="retail">Retail</option>
                  <option value="logistics">Logistics</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="other">Other</option>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Address *</label>
                <Input required value={formData.businessAddress} onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })} placeholder="Full business address" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pickup Address *</label>
                <Input required value={formData.pickupAddress} onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })} placeholder="Default pickup location" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Billing Reference or Notes</label>
              <Input value={formData.billingReference} onChange={(e) => setFormData({ ...formData, billingReference: e.target.value })} placeholder="Optional billing reference" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Operational Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected Monthly Shipment Volume *</label>
                <Select required value={formData.expectedVolume} onChange={(e) => setFormData({ ...formData, expectedVolume: e.target.value })}>
                  <option value="">Select range</option>
                  <option value="1-50">1-50</option>
                  <option value="51-100">51-100</option>
                  <option value="101-250">101-250</option>
                  <option value="251-500">251-500</option>
                  <option value="501-1000">501-1000</option>
                  <option value="1000+">1000+</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Start Date</label>
                <Input type="date" value={formData.preferredStartDate} onChange={(e) => setFormData({ ...formData, preferredStartDate: e.target.value })} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Assigned Manager *</label>
                <Input required value={formData.assignedManager} onChange={(e) => setFormData({ ...formData, assignedManager: e.target.value })} placeholder="Manager name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Manager Role</label>
                <Input value={formData.managerRole} onChange={(e) => setFormData({ ...formData, managerRole: e.target.value })} placeholder="e.g., Operations Manager" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Additional Information</CardTitle></CardHeader>
          <CardContent>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes for Sales Team</label>
            <textarea
              className="w-full h-32 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional requirements or special requests..."
            />
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/dashboard/subaccounts')}>Cancel</Button>
          <Button type="submit">Submit Request</Button>
        </div>
      </form>
    </div>
  );
}
