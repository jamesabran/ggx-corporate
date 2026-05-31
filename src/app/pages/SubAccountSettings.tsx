import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  IconBuilding, IconArrowRight, IconMapPin, IconUsers,
  IconInfoCircle, IconDeviceFloppy,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { useSubAccounts } from '../contexts/SubAccountContext';
import { useAuth } from '../contexts/AuthContext';
// User reads/writes go through the userService facade (not data/users directly).
// In production this is fronted by the GGX Corporate BFF over the identity
// provider (Firebase) + Contract Manager for subaccount context.
import {
  getUsers_,
  setSubaccountManagers,
  MAX_MANAGERS_PER_SUBACCOUNT,
  type AppUser,
} from '../services/userService';

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function ManagerDisplay({ label, manager }: { label: string; manager: AppUser | null }) {
  if (!manager) {
    return (
      <div className="flex items-center gap-3 py-2">
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <IconUsers className="w-4 h-4 text-gray-400" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium leading-none mb-0.5">{label}</p>
          <p className="text-sm text-gray-400 italic">Vacant</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-white">{initials(manager.name)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 font-medium leading-none mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-900 leading-snug">{manager.name}</p>
        <p className="text-xs text-gray-500 leading-snug">{manager.email}</p>
      </div>
      <Badge variant="default" className="text-xs flex-shrink-0">Manager</Badge>
    </div>
  );
}

export function SubAccountSettings() {
  const { id } = useParams<{ id: string }>();
  const { subAccounts } = useSubAccounts();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const subAccount = subAccounts.find((sa) => sa.id === id);

  // Users loaded via the service facade. Reloaded after a save so the page stays reactive.
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);

  useEffect(() => {
    let cancelled = false;
    getUsers_()
      .then((list) => { if (!cancelled) setAllUsers(list); })
      .catch(() => { if (!cancelled) setAllUsers([]); });
    return () => { cancelled = true; };
  }, []);

  const managers = id ? allUsers.filter(
    (u) => u.role === 'Manager' && u.subaccounts?.includes(id)
  ) : [];

  const primary = managers[0] ?? null;
  const backup  = managers[1] ?? null;

  // Editable manager assignment (Admin only).
  const [editingManagers, setEditingManagers] = useState(false);
  const [primaryId,  setPrimaryId]  = useState<string>(primary?.id  ?? '');
  const [backupId,   setBackupId]   = useState<string>(backup?.id   ?? '');
  const [saveError,  setSaveError]  = useState<string | null>(null);

  const startEditing = () => {
    setPrimaryId(primary?.id  ?? '');
    setBackupId(backup?.id   ?? '');
    setSaveError(null);
    setEditingManagers(true);
  };

  const cancelEditing = () => {
    setEditingManagers(false);
    setSaveError(null);
  };

  const saveManagers = async () => {
    if (!id) return;
    if (primaryId === backupId && primaryId !== '') {
      setSaveError('Primary and Backup Manager must be different people.');
      return;
    }

    // The service rebuilds assignments and validates the per-subaccount cap.
    const newAssignees = [primaryId, backupId].filter(Boolean);
    const result = await setSubaccountManagers(id, newAssignees);
    if (!result.success) {
      setSaveError(result.error ?? 'Unable to save manager assignments.');
      return;
    }

    // Refresh from the service so the page reflects the committed state.
    setAllUsers(await getUsers_());
    setEditingManagers(false);
    setSaveError(null);
  };

  // All Manager users available to assign (for dropdowns).
  const managerUsers = allUsers.filter((u) => u.role === 'Manager');

  // Options for Primary select: all managers not already chosen as Backup.
  const primaryOptions = managerUsers.filter((u) => u.id !== backupId);
  // Options for Backup select: all managers not already chosen as Primary.
  const backupOptions  = managerUsers.filter((u) => u.id !== primaryId);

  // ---- Not found ----
  if (!subAccount) {
    return (
      <div className="p-6 space-y-4">
        <nav className="flex items-center gap-2 text-sm">
          <Link to="/dashboard/subaccounts" className="text-gray-500 hover:text-blue-600 transition-colors">
            Subaccounts
          </Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-900 font-semibold">Settings</span>
        </nav>
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

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        <Link to="/dashboard/subaccounts" className="text-gray-500 hover:text-blue-600 transition-colors">
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
          Settings for <span className="font-medium">{subAccount.name}</span>
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
              <Badge variant="info">
                {subAccount.type === 'default' ? 'Default' : 'Additional'}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <Badge variant={subAccount.status === 'active' ? 'success' : 'default'}>
                {subAccount.status === 'active' ? 'Active' : 'Inactive'}
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
              <div>
                <CardTitle>Assigned Managers</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Up to {MAX_MANAGERS_PER_SUBACCOUNT} managers per subaccount
                </p>
              </div>
            </div>
            {isAdmin && !editingManagers && (
              <Button
                variant="outline" size="sm"
                onClick={startEditing}
              >
                Edit Assignments
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingManagers ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Primary Manager
                </label>
                <Select
                  value={primaryId}
                  onChange={(e) => setPrimaryId(e.target.value)}
                >
                  <option value="">— Vacant —</option>
                  {primaryOptions.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Backup Manager
                </label>
                <Select
                  value={backupId}
                  onChange={(e) => setBackupId(e.target.value)}
                >
                  <option value="">— Vacant —</option>
                  {backupOptions.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                  ))}
                </Select>
              </div>
              {saveError && (
                <p className="text-sm text-red-600 flex items-center gap-1.5">
                  <IconInfoCircle className="w-4 h-4 flex-shrink-0" />
                  {saveError}
                </p>
              )}
              <div className="flex gap-2.5 pt-1">
                <Button size="sm" onClick={saveManagers}>
                  <IconDeviceFloppy className="w-3.5 h-3.5 mr-1.5" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEditing}>Cancel</Button>
              </div>
              <p className="text-xs text-gray-400">
                Only add users who exist in{' '}
                <Link to="/dashboard/users-permissions" className="text-blue-600 hover:underline">
                  Users &amp; Permissions
                </Link>
                . To add a new user, go there first.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <ManagerDisplay label="Primary Manager" manager={primary} />
              <ManagerDisplay label="Backup Manager"  manager={backup} />
            </div>
          )}

          {!isAdmin && (
            <p className="text-xs text-gray-400 mt-4">
              Manager assignments are managed by the account Admin.
              {/* Future: self-service assignment requires activity logs and stricter permissions. */}
            </p>
          )}
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
            Primary pickup address for bookings under this subaccount.
            Manage pickup addresses in the Address Book.
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
