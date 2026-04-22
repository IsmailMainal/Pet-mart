import React, { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../components/Toast';
import { 
  Button, Card, Input, Select, Modal, ConfirmModal, 
  PageHeader, SearchBar, Badge, EmptyState, Skeleton, Pagination 
} from '../components/UI';
import { Plus, Pencil, Trash2, Shield, User, Headphones } from 'lucide-react';

const ROLE_CONFIG = {
  admin:        { color: 'purple', icon: <Shield size={12} /> },
  receptionist: { color: 'blue',   icon: <Headphones size={12} /> },
  customer:     { color: 'green',  icon: <User size={12} /> },
};

const RoleBadge = ({ role }) => {
  const cfg = ROLE_CONFIG[role] || { color: 'stone' };
  return <Badge color={cfg.color}>{cfg.icon} {role.charAt(0).toUpperCase() + role.slice(1)}</Badge>;
};

const defaultForm = { name: '', email: '', password: '', role: 'receptionist' };

const Users = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ totalCount: 0, totalPages: 1, currentPage: 1 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ ...defaultForm, role: 'receptionist' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try { 
      const res = await api.get(`/users?page=${page}&search=${search}&role=${roleFilter}`); 
      setUsers(res.data.users || []);
      setMeta(res.data.meta || { totalCount: 0, totalPages: 1, currentPage: 1 });
    }
    catch { toast('error', 'Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { 
    const delayDebounce = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [page, search, roleFilter]);

  const openCreate = () => { setEditingUser(null); setFormData(defaultForm); setFormOpen(true); };
  const openEdit = (u) => { setEditingUser(u); setFormData({ name: u.name, email: u.email, password: '', role: u.role }); setFormOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingUser) {
        const payload = { name: formData.name, email: formData.email, role: formData.role };
        if (formData.password) payload.password = formData.password;
        await api.put(`/users/${editingUser.id}`, payload);
        toast('success', 'User updated!');
      } else {
        await api.post('/users', formData);
        toast('success', 'User created!');
      }
      setFormOpen(false);
      fetchUsers();
    } catch { toast('error', 'Operation failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      toast('success', 'User deleted');
      setDeleteTarget(null);
      fetchUsers();
    } catch { toast('error', 'Delete failed'); }
  };

  return (
    <div>
      <PageHeader title="Staff Management" description={`${meta?.totalCount || 0} staff members (admins & receptionists)`} action={<Button onClick={openCreate}><Plus size={16} /> Add Staff</Button>} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar value={search} onChange={(val) => { setSearch(val); setPage(1); }} placeholder="Search users..." />
        <div className="flex gap-2 shrink-0">
          {['all', 'admin', 'receptionist'].map(r => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${roleFilter === r ? 'bg-lime-700 text-white border-lime-700' : 'bg-white border-stone-200 text-stone-500 hover:border-lime-400'}`}>
              {r === 'all' ? 'All Staff' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Card className="overflow-hidden">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-stone-50">
              <Skeleton className="w-9 h-9 rounded-full" />
              <div className="flex-1 space-y-1.5"><Skeleton className="h-4 w-40" /><Skeleton className="h-3 w-28" /></div>
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-xl" />
            </div>
          ))}
        </Card>
      ) : users.length === 0 ? (
        <EmptyState icon="👥" title="No staff found" description="No admin or receptionist accounts match your search." action={<Button onClick={openCreate}><Plus size={16} /> Add Staff</Button>} />
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-stone-100 bg-stone-50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">User</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">Email</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Role</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-lime-600 to-lime-800 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-stone-800">{u.name}</p>
                            <p className="text-xs text-stone-400 md:hidden">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-stone-500 hidden md:table-cell">{u.email}</td>
                      <td className="px-6 py-4"><RoleBadge role={u.role} /></td>
                      <td className="px-6 py-4 text-stone-400 text-xs hidden lg:table-cell">
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(u)} className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Pencil size={15} /></button>
                          <button onClick={() => setDeleteTarget(u)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
           <Pagination currentPage={meta?.currentPage || 1} totalPages={meta?.totalPages || 1} onPageChange={setPage} />
        </>
      )}

      {/* Form Modal */}
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editingUser ? 'Edit User' : 'Add User'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <Input label="Email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <Input label={editingUser ? 'New Password (leave blank to keep)' : 'Password'} type="password" required={!editingUser} minLength={6}
            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          <Select label="Role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
            <option value="receptionist">Receptionist</option>
            <option value="admin">Admin</option>
          </Select>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Saving...' : (editingUser ? 'Update' : 'Create')}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete User" description={`Delete "${deleteTarget?.name}"? This cannot be undone.`} />
    </div>
  );
};

export default Users;
