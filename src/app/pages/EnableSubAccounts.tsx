import { useNavigate } from 'react-router';
import { IconBuilding, IconUsers, IconCreditCard, IconChartBar, IconArrowRight } from '@tabler/icons-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

const benefits = [
  { icon: IconBuilding, title: 'Multiple brands or branches', desc: 'Organize operations across business units' },
  { icon: IconUsers, title: 'Assign managers', desc: 'Delegate control per subaccount' },
  { icon: IconCreditCard, title: 'Consolidated billing', desc: 'All finances under Main Account' },
  { icon: IconChartBar, title: 'Detailed reporting', desc: 'Per subaccount or consolidated' },
];

export function EnableSubAccountsIntro() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Enable Subaccounts</h1>
        <p className="text-sm text-gray-600">Activate advanced account structure for managing multiple brands, branches, or clients</p>
      </div>

      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <IconBuilding className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
              <p className="text-sm text-blue-800 mb-3">
                Your current account will become your <strong>Main Account</strong>. Your existing booking profile will become your first subaccount. Billing and finances will remain managed under the Main Account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-8">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Benefits</p>
        <div className="grid md:grid-cols-2 gap-4">
          {benefits.map((b) => (
            <Card key={b.title}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <b.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">{b.title}</div>
                    <div className="text-sm text-gray-600">{b.desc}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate('/dashboard/settings')}>Not Now</Button>
        <Button onClick={() => navigate('/dashboard/subaccounts/enable/setup')}>
          Continue
          <IconArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
