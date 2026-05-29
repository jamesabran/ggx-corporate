import { useState } from 'react';
import { IconCopy, IconEye, IconEyeOff, IconRefresh, IconExternalLink, IconAlertTriangle, IconCircleCheck, IconBook } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

export function APIAccess() {
  const [sandboxMode, setSandboxMode] = useState(true);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.yourcompany.com/webhooks/gogo');

  const apiKey = sandboxMode ? 'ggx_test_demo_xxxxxxxxxxxxxxxxxxxx' : 'ggx_live_demo_xxxxxxxxxxxxxxxxxxxx';

  const handleCopyKey = () => navigator.clipboard.writeText(apiKey);
  const handleCopyWebhook = () => navigator.clipboard.writeText(webhookUrl);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">API Integration</h1>
        <p className="text-gray-600 mt-1">Integrate GoGo Xpress with your systems</p>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <IconBook className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 mb-1">API Documentation</h3>
              <p className="text-sm text-blue-800 mb-3">Learn how to integrate our API into your applications with comprehensive guides and examples.</p>
              <Button variant="outline" size="sm" className="bg-white">
                <IconExternalLink className="w-4 h-4 mr-2" />
                View Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Environment</CardTitle>
                <CardDescription>Switch between sandbox and production environments</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Sandbox</span>
                <button
                  onClick={() => setSandboxMode(!sandboxMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${sandboxMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${sandboxMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!sandboxMode && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                <IconAlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 mb-1">Production Mode Active</p>
                  <p className="text-sm text-red-700">You are now using production API keys. All API calls will affect real deliveries and billing.</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
                <Badge variant={sandboxMode ? 'warning' : 'success'} className="ml-2">{sandboxMode ? 'Test' : 'Live'}</Badge>
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input type={apiKeyVisible ? 'text' : 'password'} value={apiKey} readOnly className="pr-10 font-mono text-sm" />
                  <button onClick={() => setApiKeyVisible(!apiKeyVisible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    {apiKeyVisible ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                  </button>
                </div>
                <Button variant="outline" onClick={handleCopyKey}>
                  <IconCopy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Keep your API key secure and never share it publicly</p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button variant="outline">
                <IconRefresh className="w-4 h-4 mr-2" />
                Generate New Key
              </Button>
              <p className="text-xs text-gray-500 mt-2">Generating a new key will invalidate the current one</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Quick Stats</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">API Calls Today</p>
              <p className="text-2xl font-bold text-gray-900">1,247</p>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Rate Limit</p>
              <p className="text-2xl font-bold text-gray-900">10,000</p>
              <p className="text-xs text-gray-500 mt-1">Requests per hour</p>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <IconCircleCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">All systems operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>Receive real-time notifications about delivery status changes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
            <div className="flex gap-2">
              <Input type="url" placeholder="https://api.yourcompany.com/webhooks" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} />
              <Button variant="outline" onClick={handleCopyWebhook}>
                <IconCopy className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">We'll send POST requests to this URL when delivery status changes</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Events to Subscribe</label>
            <div className="space-y-2">
              {[
                { id: 'pickup', label: 'Pickup Confirmed', checked: true },
                { id: 'transit', label: 'In Transit', checked: true },
                { id: 'delivered', label: 'Delivered', checked: true },
                { id: 'failed', label: 'Delivery Failed', checked: true },
                { id: 'returned', label: 'Returned to Sender', checked: false },
              ].map((event) => (
                <label key={event.id} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={event.checked} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                  <span className="text-sm text-gray-700">{event.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button>Save Configuration</Button>
            <Button variant="outline">Test Webhook</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader><CardTitle>Security Best Practices</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
              <p><strong>Never expose your API key</strong> in client-side code, public repositories, or logs</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
              <p><strong>Use environment variables</strong> to store API keys in your application</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
              <p><strong>Rotate keys regularly</strong> and immediately if you suspect a key has been compromised</p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
              <p><strong>Verify webhook signatures</strong> to ensure requests are coming from GoGo Xpress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
