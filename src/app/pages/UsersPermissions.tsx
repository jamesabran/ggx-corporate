import { IconPlus, IconUserCircle, IconShield, IconEye } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const users = [
  { id: '1', name: 'John Doe', email: 'john@acme.com', role: 'Owner', level: 'Parent', subaccounts: ['All'], status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@acme.com', role: 'Admin', level: 'Parent', subaccounts: ['All'], status: 'active' },
  { id: '3', name: 'Mike Johnson', email: 'mike@acme.com', role: 'Manager', level: 'Subaccount', subaccounts: ['Acme Corporation'], status: 'active' },
  { id: '4', name: 'Sarah Williams', email: 'sarah@acme.com', role: 'Operator', level: 'Subaccount', subaccounts: ['Acme Luzon'], status: 'active' },
];

const roleColors = {
  Owner: 'bg-purple-100 text-purple-700',
  Admin: 'bg-blue-100 text-blue-700',
  Finance: 'bg-emerald-100 text-emerald-700',
  Viewer: 'bg-gray-100 text-gray-700',
  Manager: 'bg-blue-100 text-blue-700',
  Operator: 'bg-orange-100 text-orange-700',
};

export function UsersPermissions() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users & Permissions</h1>
          <p className="text-sm text-gray-600 mt-1">Manage users, roles, and access across your organization</p>
        </div>
        <Button>
          <IconPlus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <IconUserCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <IconShield className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{users.filter((u) => u.level === 'Parent').length}</p>
                <p className="text-sm text-gray-600">Parent-level Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>User List</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">{user.name.split(' ').map((n) => n[0]).join('')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Role</div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${roleColors[user.role as keyof typeof roleColors]}`}>
                        {user.role}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Level</div>
                      <Badge variant={user.level === 'Parent' ? 'info' : 'default'}>{user.level}</Badge>
                    </div>
                    <div className="max-w-[150px]">
                      <div className="text-xs text-gray-500 mb-1">Access</div>
                      <div className="text-sm text-gray-900 truncate">{user.subaccounts.join(', ')}</div>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Role Definitions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Parent-level Roles</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <IconShield className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Owner</div>
                    <div className="text-sm text-gray-600">Full access to all features, billing, and settings</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <IconShield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Admin</div>
                    <div className="text-sm text-gray-600">Manage users, subaccounts, and operational settings</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <IconShield className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Finance</div>
                    <div className="text-sm text-gray-600">Access to billing, payments, and financial reports</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <IconEye className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Viewer</div>
                    <div className="text-sm text-gray-600">Read-only access to dashboards and reports</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Subaccount Roles</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <IconShield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Manager</div>
                    <div className="text-sm text-gray-600">Full operational access within assigned subaccount</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <IconShield className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Operator</div>
                    <div className="text-sm text-gray-600">Create and manage shipments within assigned subaccount</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <IconEye className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Viewer</div>
                    <div className="text-sm text-gray-600">Read-only access to subaccount operations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
