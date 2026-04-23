import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ ...defaultForm });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search, roleFilter],
    queryFn: () => api.get(`/users`, { params: { page, search, role: roleFilter } }).then(res => res.data),
    keepPreviousData: true
  });

  const users = data?.users || [];
  const meta = data?.meta || { totalCount: 0, totalPages: 1, currentPage: 1 };

  const saveMutation = useMutation({
    mutationFn: (userData) => {
      if (editingUser) return api.put(`/users/${editingUser.id}`, userData);
      return api.post('/users', userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast('success', `User ${editingUser ? 'updated' : 'created'} successfully`);
      setFormOpen(false);
    },
    onError: (err) => toast('error', err.response?.data?.error || 'Operation failed')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast('success', 'User deleted');
      setDeleteTarget(null);
    },
    onError: (err) => toast('error', err.response?.data?.error || 'Delete failed')
  });

  const openCreate = () => { setEditingUser(null); setFormData(defaultForm); setFormOpen(true); };
  const openEdit = (u) => { setEditingUser(u); setFormData({ name: u.name, email: u.email, password: '', role: u.role }); setFormOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div>
      <PageHeader 
        title="User Management" 
        description={`${meta.totalCount} registered accounts`}
        action={<Button onClick={openCreate}><Plus size={16} /> Add User</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search users..." />
        <div className="flex gap-2 shrink-0">
          {['all', 'admin', 'receptionist', 'customer'].map(r => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${roleFilter === r ? 'bg-lime-700 text-white border-lime-700' : 'bg-white border-stone-200 text-stone-500 hover:border-lime-400'}`}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Card className="overflow-hidden">
          <div className="divide-y divide-stone-100">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-5">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-48 ml-auto hidden sm:block" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      ) : users.length === 0 ? (
        <EmptyState icon="👥" title="No users found" action={<Button onClick={openCreate}><Plus size={16} /> Add User</Button>} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-stone-100 bg-stone-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase hidden sm:table-cell">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase">Role</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-600 border-2 border-white ring-1 ring-stone-100">
                          {u.name.charAt(0)}
                        </div>
                        <p className="font-semibold text-stone-800">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-500 hidden sm:table-cell">{u.email}</td>
                    <td className="px-6 py-4"><RoleBadge role={u.role} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(u)} className="p-2 text-stone-400 hover:text-blue-600 transition-colors"><Pencil size={16} /></button>
                        {u.role !== 'admin' && (
                          <button onClick={() => setDeleteTarget(u)} className="p-2 text-stone-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {meta.totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination currentPage={meta.currentPage} totalPages={meta.totalPages} onPageChange={setPage} />
        </div>
      )}

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editingUser ? 'Edit User' : 'Create New User'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <Input label="Email Address" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <Input label={editingUser ? "New Password (Optional)" : "Password"} type="password" required={!editingUser} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          <Select label="Role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
            <option value="receptionist">Receptionist</option>
            <option value="admin">Admin</option>
            <option value="customer">Customer</option>
          </Select>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete User"
        confirmVariant="danger"
      />
    </div>
  );
};

export default Users;
