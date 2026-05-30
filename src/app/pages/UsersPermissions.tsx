import { useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { IconPlus, IconUserCircle, IconShield, IconEdit, IconTrash, IconAlertTriangle, IconX } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Dialog, ConfirmDialog } from '../components/ui/Dialog';
import { type AppUser, INITIAL_USERS, SUBACCOUNT_OPTIONS } from '../data/users';

// Access model:
// - Admin: one per account, full access to all subaccounts.
// - Manager: can be assigned to up to 2 subaccounts; each subaccount supports up
//   to 2 Managers. Subaccounts at capacity are disabled in the assignment select.

const MAX_MANAGERS_PER_SUBACCOUNT = 2;

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function UsersPermissions() {
  const [users, setUsers] = useState<AppUser[]>(INITIAL_USERS);
  const [searchParams, setSearchParams] = useSearchParams();

  // Subaccount filter from URL (?subaccount=<canonical-id>)
  const subaccountFilterId = searchParams.get('subaccount');
  const subaccountFilterOption = subaccountFilterId
    ? SUBACCOUNT_OPTIONS.find((s) => s.id === subaccountFilterId)
    : null;
  const subaccountFilterName = subaccountFilterOption?.name ?? null;

  const clearFilter = () => {
    setSearchParams((prev) => {
      prev.delete('subaccount');
      return prev;
    });
  };

  // Displayed rows — filtered when a subaccount filter is active.
  const displayedUsers = subaccountFilterName
    ? users.filter(
        (u) => u.role === 'Admin' || u.subaccounts?.includes(subaccountFilterName)
      )
    : users;

  // Add/Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // Single subaccount selected per Add/Edit action (name string).
  const [account, setAccount] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Remove confirmation
  const [removeTarget, setRemoveTarget] = useState<AppUser | null>(null);

  const editingUser = editingId ? users.find((u) => u.id === editingId) : null;
  const isAdminEdit = editingUser?.role === 'Admin';

  /** How many managers (excluding editingId) are already assigned to `sub`. */
  const managersOf = (sub: string, excludeId?: string) =>
    users.filter(
      (u) => u.role === 'Manager' && u.subaccounts?.includes(sub) && u.id !== excludeId
    );

  const isSubaccountFull = (sub: string, excludeId?: string) =>
    managersOf(sub, excludeId).length >= MAX_MANAGERS_PER_SUBACCOUNT;

  const openAdd = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setAccount('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (u: AppUser) => {
    setEditingId(u.id);
    setName(u.name);
    setEmail(u.email);
    // Pre-fill with the first assigned subaccount (single-select edit).
    setAccount(u.role === 'Admin' ? 'main' : (u.subaccounts?.[0] ?? ''));
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setName('');
    setEmail('');
    setAccount('');
    setFormError(null);
  };

  const commit = () => {
    setUsers((prev) => {
      if (editingId) {
        return prev.map((u) => {
          if (u.id !== editingId) return u;
          if (isAdminEdit) return { ...u, name: name.trim(), email };
          // For Manager edit: replace first subaccount assignment with the newly selected one,
          // keeping any other subaccounts the user may already have.
          const rest = (u.subaccounts ?? []).slice(1);
          return { ...u, name: name.trim(), email, subaccounts: [account, ...rest] };
        });
      }
      // Add: merge into an existing Manager row with the same email if present.
      const existing = prev.find((u) => u.role === 'Manager' && u.email === email.trim());
      if (existing) {
        return prev.map((u) =>
          u.id === existing.id
            ? { ...u, name: name.trim(), subaccounts: [...(u.subaccounts ?? []), account] }
            : u
        );
      }
      return [
        ...prev,
        {
          id: Date.now().toString(),
          name: name.trim(),
          email: email.trim(),
          role: 'Manager' as const,
          subaccounts: [account],
        },
      ];
    });
    closeModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setFormError("Enter the user's name."); return; }
    if (!email.trim() || !email.includes('@')) { setFormError('Enter a valid email address.'); return; }
    if (isAdminEdit) { commit(); return; }
    if (!account) { setFormError('Select a subaccount to assign this user as Manager.'); return; }

    // Prevent assigning someone to a subaccount they already manage.
    const existingManagerRow = users.find((u) => u.role === 'Manager' && u.email === email.trim() && u.id !== editingId);
    if (existingManagerRow?.subaccounts?.includes(account)) {
      setFormError(`${name.trim() || email} is already a manager for ${account}.`);
      return;
    }
    // Prevent assigning to a full subaccount.
    if (isSubaccountFull(account, editingId ?? undefined)) {
      setFormError(`${account} already has ${MAX_MANAGERS_PER_SUBACCOUNT} managers. Remove one before adding another.`);
      return;
    }
    commit();
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== removeTarget.id));
    setRemoveTarget(null);
  };

  const managerCount = users.filter((u) => u.role === 'Manager').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users & Permissions</h1>
          <p className="text-sm text-gray-600 mt-1">Manage who can access your account and subaccounts</p>
        </div>
        <Button onClick={openAdd}>
          <IconPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Subaccount filter banner */}
      {subaccountFilterName && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-800">
            Showing users for <span className="font-semibold">{subaccountFilterName}</span>.
          </p>
          <button
            onClick={clearFilter}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            <IconX className="w-3.5 h-3.5" />
            Clear filter
          </button>
        </div>
      )}

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
                <p className="text-2xl font-bold text-gray-900">{managerCount}</p>
                <p className="text-sm text-gray-600">Subaccount Managers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>User List</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role / Assigned accounts</TableHead>
                <TableHead>Access</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">{initials(user.name)}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 leading-snug">{user.name}</div>
                        <div className="text-sm text-gray-500 leading-snug">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role === 'Admin' ? (
                      <Badge variant="info">Admin</Badge>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">Manager</Badge>
                        </div>
                        {(user.subaccounts ?? []).map((sub) => (
                          <span key={sub} className="text-sm text-gray-600 leading-snug">
                            · {sub}
                          </span>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {user.role === 'Admin'
                        ? 'All accounts'
                        : (user.subaccounts?.length ?? 0) > 1
                        ? `${user.subaccounts!.length} subaccounts`
                        : 'Assigned subaccount only'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>
                        <IconEdit className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 disabled:text-gray-300"
                        disabled={user.role === 'Admin'}
                        title={user.role === 'Admin' ? 'The account Admin cannot be removed' : 'Remove access'}
                        onClick={() => setRemoveTarget(user)}
                      >
                        <IconTrash className="w-3.5 h-3.5 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add / Edit user modal */}
      <Dialog open={modalOpen} onClose={closeModal} size="md">
        <h3 className="text-base font-semibold text-gray-900">
          {editingId ? 'Edit user access' : 'Add user access'}
        </h3>
        <p className="text-sm text-gray-500 mt-1 mb-5">
          Assign a user to manage one or more subaccounts.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <Input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <Input
              type="email"
              required
              placeholder="user@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {isAdminEdit ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600">
              Role: <span className="font-medium text-gray-800">Admin</span> · Access: All accounts.
              The Admin role cannot be reassigned here.
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {editingId ? 'Primary subaccount' : 'Assign to subaccount'}
              </label>
              <Select value={account} onChange={(e) => setAccount(e.target.value)}>
                <option value="">Select subaccount</option>
                <option value="main" disabled>Main account — Admin already assigned</option>
                {SUBACCOUNT_OPTIONS.map((s) => {
                  const full = isSubaccountFull(s.name, editingId ?? undefined);
                  return (
                    <option key={s.id} value={s.name} disabled={full}>
                      {s.name}{full ? ' (Full)' : ''}
                    </option>
                  );
                })}
              </Select>
              <p className="text-xs text-gray-500 mt-1.5">
                Each subaccount supports up to {MAX_MANAGERS_PER_SUBACCOUNT} Managers.
                To assign an existing Manager to another subaccount, use <strong>Add User</strong> again with their email.
              </p>
            </div>
          )}

          {formError && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <IconAlertTriangle className="w-4 h-4 flex-shrink-0" />
              {formError}
            </div>
          )}

          <div className="flex gap-2.5 justify-end pt-2">
            <Button type="button" variant="outline" size="sm" onClick={closeModal}>Cancel</Button>
            <Button type="submit" size="sm">{editingId ? 'Save Changes' : 'Add User'}</Button>
          </div>
        </form>
      </Dialog>

      {/* Remove confirmation */}
      {removeTarget && (
        <ConfirmDialog
          open
          onClose={() => setRemoveTarget(null)}
          onConfirm={confirmRemove}
          title="Remove user access?"
          description={
            <>
              <span className="font-medium text-gray-700">{removeTarget.name}</span> ({removeTarget.email}) will
              lose access
              {(removeTarget.subaccounts?.length ?? 0) > 0 ? (
                <> to <span className="font-medium text-gray-700">{removeTarget.subaccounts!.join(', ')}</span></>
              ) : (
                ''
              )}
              . This can be re-added later.
            </>
          }
          confirmLabel="Remove Access"
          variant="destructive"
          confirmIcon={<IconTrash className="w-3.5 h-3.5 mr-1.5" />}
        />
      )}

      {/* No users in filtered view */}
      {subaccountFilterName && displayedUsers.filter((u) => u.role === 'Manager').length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No managers assigned to{' '}
          <span className="font-medium text-gray-700">{subaccountFilterName}</span> yet.{' '}
          <Link to="/dashboard/users-permissions" className="text-blue-600 hover:underline" onClick={clearFilter}>
            View all users
          </Link>
        </div>
      )}
    </div>
  );
}
