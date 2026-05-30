import { Link, useParams } from 'react-router';
import {
  IconBuilding,
  IconArrowRight,
  IconMapPin,
  IconUsers,
  IconInfoCircle,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useSubAccounts } from '../contexts/SubAccountContext';
import { INITIAL_USERS, SUBACCOUNT_OPTIONS } from '../data/users';

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function SubAccountSettings() {
  const { id } = useParams<{ id: string }>();
  const { subAccounts } = useSubAccounts();

  // Look up in live context first; fall back to canonical options for deep-linking.
  const subAccount = subAccounts.find((sa) => sa.id === id);
  const subaccountName =
    subAccount?.name ?? SUBACCOUNT_OPTIONS.find((s) => s.id === id)?.name ?? null;

  if (!subAccount) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/dashboard/subaccounts" className="hover:text-blue-600 transition-colors">
            Subaccounts
          </Link>
          <span>›</span>
          <span className="text-gray-900 font-semibold">Settings</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
          <IconInfoCircle className="w-4 h-4 flex-shrink-0" />
          Subaccount not found. It may not be enabled yet, or the ID is invalid.
        </div>
        <Link to="/dashboard/subaccounts">
          <Button variant="outline" size="sm">Back to Subaccounts</Button>
        </Link>
      </div>
    );
  }

  // Managers assigned to this subaccount (from the shared user seed).
  const managers = INITIAL_USERS.filter(
    (u) => u.role === 'Manager' && u.subaccounts?.includes(subaccountName ?? '')
  );

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link
          to="/dashboard/subaccounts"
          className="text-gray-500 hover:text-blue-600 transition-colors"
        >
          Subaccounts
        </Link>
        <span className="text-gray-400">›</span>
        <span className="text-gray-600">{subAccount.name}</span>
        <span className="text-gray-400">›</span>
        <span className="text-gray-900 font-semibold">Settings</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Subaccount Settings</h1>
        <p className="text-sm text-gray-600 mt-1">
          View settings for <span className="font-medium">{subAccount.name}</span>
        </p>
      </div>

      {/* Section 1 — Subaccount Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <IconBuilding className="w-5 h-5 text-blue-600" />
            </div>
            <CardTitle>Subaccount Info</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <p className="text-xs text-gray-500 mb-1">Name</p>
              <p className="text-sm font-medium text-gray-900">{subAccount.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Account ID</p>
              <p className="text-sm font-mono text-gray-500">{subAccount.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Type</p>
              <Badge variant="info" className="capitalize">
                {subAccount.type === 'default' ? 'Default' : 'Additional'}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <Badge variant={subAccount.status === 'active' ? 'success' : 'default'} className="capitalize">
                {subAccount.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Bookings</p>
              <p className="text-sm font-medium text-gray-900">
                {subAccount.bookingCount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Contact Number</p>
              <p className="text-sm font-medium text-gray-900">{subAccount.contactNumber || '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2 — Assigned Managers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <IconUsers className="w-5 h-5 text-emerald-600" />
              </div>
              <CardTitle>Assigned Managers</CardTitle>
            </div>
            <Link to={`/dashboard/users-permissions?subaccount=${id}`}>
              <Button variant="ghost" size="sm" className="gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                Manage in Users &amp; Permissions
                <IconArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {managers.length === 0 ? (
            <p className="text-sm text-gray-500">
              No managers assigned to this subaccount yet.{' '}
              <Link
                to={`/dashboard/users-permissions?subaccount=${id}`}
                className="text-blue-600 hover:underline"
              >
                Add one
              </Link>
              .
            </p>
          ) : (
            <div className="space-y-3">
              {managers.map((m) => (
                <div key={m.id} className="flex items-center gap-3 py-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-white">{initials(m.name)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 leading-snug">{m.name}</p>
                    <p className="text-xs text-gray-500 leading-snug">{m.email}</p>
                  </div>
                  <Badge variant="default" className="text-[10px]">Manager</Badge>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4">
            Up to 2 Managers can be assigned per subaccount.
          </p>
        </CardContent>
      </Card>

      {/* Section 3 — Pickup Address */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <IconMapPin className="w-5 h-5 text-orange-500" />
              </div>
              <CardTitle>Pickup Address</CardTitle>
            </div>
            <Link to="/dashboard/address-book">
              <Button variant="ghost" size="sm" className="gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                Edit in Address Book
                <IconArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500 mb-3">
            Primary pickup address used for bookings under this subaccount. Manage
            pickup addresses in the Address Book.
          </p>
          {subAccount.pickupAddress ? (
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <IconMapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{subAccount.pickupAddress}</span>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No pickup address on file.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
