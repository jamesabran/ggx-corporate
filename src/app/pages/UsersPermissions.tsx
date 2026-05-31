import { useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import {
  IconPlus, IconUserCircle, IconShield, IconEdit, IconTrash,
  IconAlertTriangle, IconX, IconCheck,
} from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Dialog, ConfirmDialog } from '../components/ui/Dialog';
import {
  type AppUser,
  SUBACCOUNT_OPTIONS,
  MAX_MANAGERS_PER_SUBACCOUNT,
  getSubaccountName,
  getSubaccountManagerCount,
  getUsers,
  setUsers,
} from '../data/users';
import { SearchInput } from '../components/SearchInput';

// ---------------------------------------------------------------------------
// Access model
//   Admin  — one per account; full access to all subaccounts.
//   Manager — can be assigned to multiple subaccounts (up to MAX per subaccount).
// ---------------------------------------------------------------------------

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function UsersPermissions() {
  // Mirror module state into React so the component is reactive.
  const [users, setLocalUsers] = useState<AppUser[]>(() => getUsers());

  const syncUsers = (next: AppUser[]) => {
    setLocalUsers(next);
    setUsers(next);
  };

  const [searchParams, setSearchParams] = useSearchParams();

  // URL filter: ?subaccount=<canonical-id>
  const subaccountFilterId = searchParams.get('subaccount');
  const subaccountFilterOption = subaccountFilterId
    ? SUBACCOUNT_OPTIONS.find((s) => s.id === subaccountFilterId)
    : null;

  const clearFilter = () =>
    setSearchParams((prev) => { prev.delete('subaccount'); return prev; });

  // Must be declared before displayedUsers so it is initialised before it is read.
  const [searchQuery, setSearchQuery] = useState('');

  // When a subaccount filter is active, show the Admin + managers assigned to that account.
  // Then apply search on top (name or email, min 2 chars).
  const displayedUsers = users
    .filter((u) =>
      !subaccountFilterId || u.role === 'Admin' || u.subaccounts?.includes(subaccountFilterId)
    )
    .filter((u) => {
      const q = searchQuery.trim().toLowerCase();
      return (
        q.length < 2 ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });

  // ---- Add/Edit modal state ----
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // Subaccount IDs the user is assigned to (multi-select via checkboxes).
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<AppUser | null>(null);

  const editingUser = editingId ? users.find((u) => u.id === editingId) : null;
  const isAdminEdit = editingUser?.role === 'Admin';

  const toggleSub = (id: string) =>
    setSelectedSubs((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const openAdd = () => {
    setEditingId(null); setName(''); setEmail('');
    setSelectedSubs([]); setFormError(null); setModalOpen(true);
  };

  const openEdit = (u: AppUser) => {
    setEditingId(u.id); setName(u.name); setEmail(u.email);
    setSelectedSubs(u.subaccounts ?? []); setFormError(null); setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false); setEditingId(null); setName('');
    setEmail(''); setSelectedSubs([]); setFormError(null);
  };

  const commit = () => {
    if (editingId) {
      syncUsers(users.map((u) => {
        if (u.id !== editingId) return u;
        if (isAdminEdit) return { ...u, name: name.trim(), email: email.trim() };
        return { ...u, name: name.trim(), email: email.trim(), subaccounts: selectedSubs };
      }));
    } else {
      syncUsers([
        ...users,
        {
          id: Date.now().toString(),
          name: name.trim(),
          email: email.trim(),
          role: 'Manager' as const,
          subaccounts: selectedSubs,
        },
      ]);
    }
    closeModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setFormError("Enter the user's name."); return; }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Enter a valid email address.'); return;
    }
    if (isAdminEdit) { commit(); return; }

    // Add: prevent duplicate email
    if (!editingId) {
      const duplicate = users.find(
        (u) => u.email.trim().toLowerCase() === email.trim().toLowerCase()
      );
      if (duplicate) {
        setFormError(
          `${email.trim()} already exists. Use Edit to change their subaccount assignments.`
        );
        return;
      }
    }

    if (selectedSubs.length === 0) {
      setFormError('Select at least one subaccount to assign this Manager.'); return;
    }

    // Validate capacity for each selected subaccount.
    for (const subId of selectedSubs) {
      const count = getSubaccountManagerCount(subId, editingId ?? undefined);
      if (count >= MAX_MANAGERS_PER_SUBACCOUNT) {
        setFormError(
          `${getSubaccountName(subId)} already has ${MAX_MANAGERS_PER_SUBACCOUNT} managers. ` +
          `Remove one before assigning another.`
        );
        return;
      }
    }
    commit();
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    syncUsers(users.filter((u) => u.id !== removeTarget.id));
    setRemoveTarget(null);
  };

  const managerCount = users.filter((u) => u.role === 'Manager').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users &amp; Permissions</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage who can access your account and subaccounts
          </p>
        </div>
        <Button onClick={openAdd}>
          <IconPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Subaccount filter banner */}
      {subaccountFilterOption && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-sm text-blue-800">
            Showing users for{' '}
            <span className="font-semibold">{subaccountFilterOption.name}</span>.
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
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle>User List</CardTitle>
            <SearchInput
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="w-full sm:w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role / Assigned subaccounts</TableHead>
                <TableHead>Access</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-400 text-sm">
                    {searchQuery.trim().length >= 2
                      ? 'No users match your search.'
                      : 'No users found.'}
                  </TableCell>
                </TableRow>
              )}
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
                      <div className="flex flex-col gap-0.5">
                        <Badge variant="default" className="w-fit">Manager</Badge>
                        {(user.subaccounts ?? []).map((subId) => (
                          <span key={subId} className="text-sm text-gray-600 leading-snug">
                            · {getSubaccountName(subId)}
                          </span>
                        ))}
                        {(user.subaccounts ?? []).length === 0 && (
                          <span className="text-xs text-gray-400 italic">No subaccount assigned</span>
                        )}
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
                        variant="ghost" size="sm"
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

          {subaccountFilterOption && displayedUsers.filter((u) => u.role === 'Manager').length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No managers assigned to{' '}
              <span className="font-medium text-gray-700">{subaccountFilterOption.name}</span> yet.{' '}
              <Link to="/dashboard/users-permissions" className="text-blue-600 hover:underline" onClick={clearFilter}>
                View all users
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit modal */}
      <Dialog open={modalOpen} onClose={closeModal} size="md">
        <h3 className="text-base font-semibold text-gray-900">
          {editingId ? 'Edit user' : 'Add new user'}
        </h3>
        <p className="text-sm text-gray-500 mt-1 mb-5">
          {editingId
            ? 'Update name, email, or subaccount assignments.'
            : 'Add a new user and assign them as Manager to one or more subaccounts.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
            <Input
              required
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <Input
              type="email" required
              placeholder="user@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!editingId}
            />
            {!!editingId && (
              <p className="text-xs text-gray-500 mt-1.5">
                Email addresses are used for login and cannot be edited here. To change a
                user&apos;s email, remove this user and add them again with the new email address.
              </p>
            )}
          </div>

          {isAdminEdit ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600">
              Role: <span className="font-medium text-gray-800">Admin</span> · Access: All accounts.
              The Admin role and access cannot be changed here.
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned subaccounts
                <span className="ml-1 text-gray-400 font-normal">(select one or more)</span>
              </label>
              <div className="space-y-2 rounded-lg border border-gray-200 p-3 bg-gray-50">
                {SUBACCOUNT_OPTIONS.map((s) => {
                  // savedCount = managers already saved excluding the user being edited.
                  const savedCount = getSubaccountManagerCount(s.id, editingId ?? undefined);
                  const alreadySelected = selectedSubs.includes(s.id);
                  // full: the slot is taken by others AND this user is not already in it.
                  const full = savedCount >= MAX_MANAGERS_PER_SUBACCOUNT && !alreadySelected;
                  // displayCount reflects the live in-form state so users see accurate capacity.
                  const displayCount = savedCount + (alreadySelected ? 1 : 0);
                  const capacityLabel =
                    full ? 'Full' : `${displayCount}/${MAX_MANAGERS_PER_SUBACCOUNT} managers`;
                  return (
                    <label
                      key={s.id}
                      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 border transition-colors cursor-pointer ${
                        full
                          ? 'opacity-50 cursor-not-allowed bg-white border-gray-200'
                          : alreadySelected
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Visual checkbox — sr-only input handles the toggle via the
                            parent label click. No onClick here to prevent double-fire. */}
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 pointer-events-none ${
                            alreadySelected
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {alreadySelected && <IconCheck className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={alreadySelected}
                          disabled={full}
                          onChange={() => !full && toggleSub(s.id)}
                        />
                        <span className="text-sm font-medium text-gray-800 leading-snug">
                          {s.name}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-medium flex-shrink-0 ${
                          full ? 'text-red-500' : 'text-gray-400'
                        }`}
                      >
                        {capacityLabel}
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Each subaccount supports up to {MAX_MANAGERS_PER_SUBACCOUNT} Managers.
              </p>
            </div>
          )}

          {formError && (
            <div className="flex items-start gap-2 text-sm text-red-600">
              <IconAlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
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
              <span className="font-medium text-gray-700">{removeTarget.name}</span>{' '}
              ({removeTarget.email}) will lose access
              {(removeTarget.subaccounts?.length ?? 0) > 0 && (
                <> to{' '}
                  <span className="font-medium text-gray-700">
                    {removeTarget.subaccounts!.map(getSubaccountName).join(', ')}
                  </span>
                </>
              )}. This can be re-added later.
            </>
          }
          confirmLabel="Remove Access"
          variant="destructive"
          confirmIcon={<IconTrash className="w-3.5 h-3.5 mr-1.5" />}
        />
      )}
    </div>
  );
}
