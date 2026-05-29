import { useState } from 'react';
import { IconPlus, IconUserCircle, IconShield, IconEdit, IconTrash, IconAlertTriangle } from '@tabler/icons-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Dialog, ConfirmDialog } from '../components/ui/Dialog';

// Simplified access model:
// - Exactly two roles: Admin and Manager.
// - One Admin (the main account holder) with access to all accounts.
// - Each subaccount can have at most one Manager; a Manager is tied to one subaccount.
type Role = 'Admin' | 'Manager';

interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  subaccount?: string; // present for Manager only
}

// Mock subaccounts available for assignment (mirrors the Transactions filters).
const SUBACCOUNTS = ['Acme Corporation', 'Acme Luzon'];

const initialUsers: AppUser[] = [
  { id: '1', name: 'John Doe', email: 'john@acme.com', role: 'Admin' },
  { id: '2', name: 'Mike Johnson', email: 'mike@acme.com', role: 'Manager', subaccount: 'Acme Corporation' },
  { id: '3', name: 'Sarah Williams', email: 'sarah@acme.com', role: 'Manager', subaccount: 'Acme Luzon' },
];

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function UsersPermissions() {
  const [users, setUsers] = useState<AppUser[]>(initialUsers);

  // Add/Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [account, setAccount] = useState(''); // '' = none, 'main' = Admin, else subaccount name
  const [formError, setFormError] = useState<string | null>(null);

  // Confirmation state
  const [replaceTarget, setReplaceTarget] = useState<AppUser | null>(null); // existing manager to replace
  const [removeTarget, setRemoveTarget] = useState<AppUser | null>(null);

  const editingUser = editingId ? users.find((u) => u.id === editingId) : null;
  const isAdminEdit = editingUser?.role === 'Admin';

  const managerOf = (sub: string, excludeId?: string) =>
    users.find((u) => u.role === 'Manager' && u.subaccount === sub && u.id !== excludeId);

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
    setAccount(u.role === 'Admin' ? 'main' : u.subaccount ?? '');
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
    setReplaceTarget(null);
  };

  const commit = () => {
    setUsers((prev) => {
      let next = replaceTarget ? prev.filter((u) => u.id !== replaceTarget.id) : [...prev];
      if (editingId) {
        next = next.map((u) =>
          u.id === editingId
            ? isAdminEdit
              ? { ...u, name: name.trim(), email }
              : { ...u, name: name.trim(), email, role: 'Manager' as const, subaccount: account }
            : u
        );
      } else {
        next = [...next, { id: Date.now().toString(), name: name.trim(), email, role: 'Manager' as const, subaccount: account }];
      }
      return next;
    });
    closeModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Enter the user’s name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Enter a valid email address.');
      return;
    }
    // Admin edit only updates the email (role/access fixed).
    if (isAdminEdit) {
      commit();
      return;
    }
    if (!account || account === 'main') {
      setFormError('Select a subaccount to assign this user as Manager.');
      return;
    }
    const existing = managerOf(account, editingId ?? undefined);
    if (existing) {
      setReplaceTarget(existing); // ask for replace confirmation
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
                <TableHead>Role / Assigned account</TableHead>
                <TableHead>Access</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
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
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Manager</Badge>
                        <span className="text-sm text-gray-600">· {user.subaccount}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {user.role === 'Admin' ? 'All accounts' : 'Assigned subaccount only'}
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
        <h3 className="text-base font-semibold text-gray-900">{editingId ? 'Edit user access' : 'Add user access'}</h3>
        <p className="text-sm text-gray-500 mt-1 mb-5">Assign a user to manage an account or subaccount.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                <Input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <Input type="email" required placeholder="user@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              {isAdminEdit ? (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600">
                  Role: <span className="font-medium text-gray-800">Admin</span> · Access: All accounts. The Admin role cannot be reassigned here.
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Assign to account</label>
                  <Select value={account} onChange={(e) => setAccount(e.target.value)}>
                    <option value="">Select account</option>
                    <option value="main" disabled>Main account — Admin already assigned</option>
                    {SUBACCOUNTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Subaccount assignments are added as <span className="font-medium">Manager</span>. Each subaccount can have only one Manager.
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

      {/* Replace-manager confirmation */}
      {replaceTarget && (
        <ConfirmDialog
          open
          elevated
          onClose={() => setReplaceTarget(null)}
          onConfirm={commit}
          title="Replace current manager?"
          description={
            <>
              <span className="font-medium text-gray-700">{replaceTarget.name}</span> ({replaceTarget.email}) will lose access to{' '}
              <span className="font-medium text-gray-700">{account}</span> and will no longer be able to manage this subaccount.
            </>
          }
          confirmLabel="Replace Manager"
          variant="destructive"
        />
      )}

      {/* Remove confirmation */}
      {removeTarget && (
        <ConfirmDialog
          open
          onClose={() => setRemoveTarget(null)}
          onConfirm={confirmRemove}
          title="Remove user access?"
          description={
            <>
              <span className="font-medium text-gray-700">{removeTarget.name}</span> ({removeTarget.email}) will lose access
              {removeTarget.subaccount ? <> to <span className="font-medium text-gray-700">{removeTarget.subaccount}</span></> : ''}. This can be re-added later.
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
