import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { useToast } from '../components/Toast';
import {
  Button, Card, Input, Modal, ConfirmModal,
  PageHeader, SearchBar, Skeleton, EmptyState, Pagination
} from '../components/UI';
import { Plus, Pencil, Trash2, Stethoscope, Mail, Phone, Award } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Doctors = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin';

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['doctors', page, search],
    queryFn: async () => {
      const res = await api.get(`/doctors?page=${page}&search=${search}`);
      return res.data;
    },
    keepPreviousData: true
  });

  const doctors = data?.doctors || [];
  const meta = data?.meta || { totalCount: 0, totalPages: 1, currentPage: 1 };

  const mutation = useMutation({
    mutationFn: (formData) => {
      if (editingDoctor) return api.put(`/doctors/${editingDoctor.id}`, formData);
      return api.post('/doctors', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast('success', `Doctor ${editingDoctor ? 'updated' : 'added'}!`);
      setFormOpen(false);
    },
    onError: () => toast('error', 'Operation failed')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/doctors/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast('success', 'Doctor removed');
      setDeleteTarget(null);
    },
    onError: () => toast('error', 'Delete failed')
  });

  const [form, setForm] = useState({ name: '', specialization: '', email: '', phone: '' });

  const openCreate = () => {
    setEditingDoctor(null);
    setForm({ name: '', specialization: '', email: '', phone: '' });
    setFormOpen(true);
  };

  const openEdit = (d) => {
    setEditingDoctor(d);
    setForm({ name: d.name, specialization: d.specialization, email: d.email || '', phone: d.phone || '' });
    setFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div>
      <PageHeader
        title="Medical Staff"
        description={`${meta?.totalCount || 0} doctors and specializations`}
        action={isAdmin && <Button onClick={openCreate}><Plus size={16} /> Add Doctor</Button>}
      />

      <div className="mb-6 max-w-md">
        <SearchBar value={search} onChange={(val) => { setSearch(val); setPage(1); }} placeholder="Search by name or specialty..." />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <EmptyState icon="🩺" title="No doctors found" description="Add medical staff to start booking appointments."
          action={isAdmin && <Button onClick={openCreate}><Plus size={16} /> Add Doctor</Button>} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {doctors.map(doctor => (
              <Card key={doctor.id} className="p-6 border-transparent hover:border-lime-200 transition-all group flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-lime-100 text-lime-700 flex items-center justify-center font-bold text-xl">
                      {doctor.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 text-lg leading-tight">{doctor.name}</h3>
                      <div className="flex items-center gap-1.5 text-stone-400 text-xs mt-1">
                        <Award size={12} className="text-lime-600" />
                        {doctor.specialization}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-stone-500 text-sm">
                    <Mail size={14} className="text-stone-300" />
                    <span className="truncate">{doctor.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-500 text-sm">
                    <Phone size={14} className="text-stone-300" />
                    <span>{doctor.phone || 'No phone provided'}</span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex gap-2 pt-4 border-t border-stone-50 mt-auto">
                    <button onClick={() => openEdit(doctor)} 
                      className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-stone-600 bg-stone-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">
                      <Pencil size={14} /> Edit
                    </button>
                    <button onClick={() => setDeleteTarget(doctor)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-stone-600 bg-stone-50 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </div>
          <Pagination currentPage={meta?.currentPage || 1} totalPages={meta?.totalPages || 1} onPageChange={setPage} />
        </>
      )}

      {/* Form Modal */}
      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Dr. Arshad Manyal" />
          <Input label="Specialization" required value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} placeholder="e.g. Veterinary Surgeon" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="doctor@example.com" />
            <Input label="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 ..." />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save Doctor'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Remove Doctor"
        message={`Are you sure you want to remove "${deleteTarget?.name}"? Existing appointments for this doctor will be kept.`}
        confirmLabel="Remove"
        confirmVariant="danger"
      />
    </div>
  );
};

export default Doctors;
