import { useEffect, useState } from 'react';
import { IconCopy, IconEye, IconEyeOff, IconRefresh, IconExternalLink, IconAlertTriangle, IconCircleCheck, IconBook, IconLoader2, IconCheck } from '@tabler/icons-react';
import { Dialog } from '../components/ui/Dialog';
import { IconContainer } from '../components/IconContainer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { SearchInput } from '../components/SearchInput';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import {
  getApiLogs, API_LOG_STATUS_META, type ApiLog, type ApiLogStatus,
} from '../services/apiLogsService';

// ─── API Logs tab ──────────────────────────────────────────────────────────────

function logStatusIcon(status: ApiLogStatus) {
  if (status === 'success') return <IconCircleCheck className="w-4 h-4 text-emerald-500" />;
  return <IconAlertTriangle className={status === 'failed' ? 'w-4 h-4 text-red-500' : 'w-4 h-4 text-amber-500'} />;
}

function ApiLogsTab() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    getApiLogs({ status: statusFilter as ApiLogStatus | 'all', search })
      .then(setLogs)
      .catch(() => {});
  }, [statusFilter, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <div className="flex-1 min-w-[240px]">
          <SearchInput
            placeholder="Search by endpoint, message, or reference…"
            value={search}
            onChange={setSearch}
          />
        </div>
        <div className="w-full sm:w-[160px] flex-shrink-0">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="failed">Failed</option>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className={logs.length === 0 ? '' : 'p-0'}>
          {logs.length === 0 ? (
            <div className="py-12 text-center">
              <IconRefresh className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700">No API activity yet</p>
              <p className="text-xs text-gray-400 mt-1">
                API requests and webhook events will appear here as your integration runs.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Endpoint / Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const st = API_LOG_STATUS_META[log.status];
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-gray-500 whitespace-nowrap">{log.timestamp}</TableCell>
                      <TableCell className="font-mono text-xs text-gray-700">{log.endpoint}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5">
                          {logStatusIcon(log.status)}
                          <Badge variant={st.variant}>{st.label}</Badge>
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600 max-w-md">{log.message}</TableCell>
                      <TableCell className="font-mono text-xs text-gray-500">
                        {log.reference ?? '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function APIAccess() {
  const [sandboxMode, setSandboxMode] = useState(true);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://api.yourcompany.com/webhooks/gogo');
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [savedConfig, setSavedConfig] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<'success' | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const apiKey = generatedKey ?? (sandboxMode ? 'ggx_test_demo_xxxxxxxxxxxxxxxxxxxx' : 'ggx_live_demo_xxxxxxxxxxxxxxxxxxxx');

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setKeyCopied(true);
    setTimeout(() => setKeyCopied(false), 2000);
  };
  const handleCopyWebhook = () => navigator.clipboard.writeText(webhookUrl);

  const handleRegenerate = async () => {
    setRegenerating(true);
    setShowRegenerateConfirm(false);
    await new Promise((r) => setTimeout(r, 1000));
    const prefix = sandboxMode ? 'sk_test_' : 'sk_live_';
    const rand = Math.random().toString(36).slice(2, 18).toUpperCase();
    setGeneratedKey(`${prefix}${rand}`);
    setRegenerating(false);
    setApiKeyVisible(true);
  };

  const handleSaveConfig = async () => {
    setSavedConfig(false);
    await new Promise((r) => setTimeout(r, 600));
    setSavedConfig(true);
    setTimeout(() => setSavedConfig(false), 3000);
  };

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    setWebhookTestResult(null);
    await new Promise((r) => setTimeout(r, 1400));
    setTestingWebhook(false);
    setWebhookTestResult('success');
    setTimeout(() => setWebhookTestResult(null), 4000);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">API Integration</h1>
        <p className="text-gray-600 mt-1">Integrate GoGo Xpress with your systems</p>
      </div>

      <Tabs defaultValue="config">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="logs">API Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="mt-6 space-y-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <IconContainer icon={IconBook} bg="bg-blue-100" color="text-blue-600" />
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
                  {keyCopied ? <IconCheck className="w-4 h-4 text-green-500" /> : <IconCopy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Keep your API key secure and never share it publicly</p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setShowRegenerateConfirm(true)} disabled={regenerating}>
                {regenerating ? (
                  <><IconLoader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</>
                ) : (
                  <><IconRefresh className="w-4 h-4 mr-2" />Generate New Key</>
                )}
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

          {webhookTestResult === 'success' && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <IconCircleCheck className="w-4 h-4 flex-shrink-0" />
              Webhook test successful — your endpoint responded with 200 OK.
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSaveConfig}>
              {savedConfig ? (
                <><IconCheck className="w-4 h-4 mr-2 text-white" />Saved</>
              ) : 'Save Configuration'}
            </Button>
            <Button variant="outline" onClick={handleTestWebhook} disabled={testingWebhook}>
              {testingWebhook ? (
                <><IconLoader2 className="w-4 h-4 mr-2 animate-spin" />Testing…</>
              ) : 'Test Webhook'}
            </Button>
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
        </TabsContent>

        <TabsContent value="logs" className="mt-6">
          <ApiLogsTab />
        </TabsContent>
      </Tabs>

      <Dialog open={showRegenerateConfirm} onClose={() => setShowRegenerateConfirm(false)} size="sm" title="Regenerate API Key">
        <p className="text-sm text-gray-600 mb-4">
          This will invalidate your current {sandboxMode ? 'test' : 'live'} API key immediately. Any integrations using the old key will stop working until updated.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => setShowRegenerateConfirm(false)}>Cancel</Button>
          <Button size="sm" onClick={handleRegenerate}>Regenerate Key</Button>
        </div>
      </Dialog>
    </div>
  );
}
