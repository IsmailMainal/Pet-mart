import React, { useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { useToast } from '../components/Toast';
import { Button, Card, Input, Textarea, Select, Modal, ConfirmModal, PageHeader, SearchBar, Badge, EmptyState, Skeleton, useLoadingMessage, Pagination } from '../components/UI';
import { Plus, Calendar, Clock, User, Stethoscope, FileText, Trash2, Filter, Download } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDate } from '../utils/format';

const STATUS_COLORS = {
  Pending: 'amber', Confirmed: 'blue', Completed: 'green', Cancelled: 'red'
};

const StatusBadge = ({ status }) => (
  <Badge color={STATUS_COLORS[status] || 'stone'}>{status}</Badge>
);

// ── Detail View ───────────────────────────────────────────────────────────────
const AppointmentDetail = ({ apt, onClose, canEdit, onStatusChange, onReschedule }) => {
  if (!apt) return null;
  const timeline = ['Pending', 'Confirmed', 'Completed'];
  const currentIdx = timeline.indexOf(apt.status);

  return (
    <Modal isOpen={!!apt} onClose={onClose} title="Appointment Details">
      <div className="space-y-5">
        {/* Timeline */}
        {apt.status !== 'Cancelled' && (
          <div className="flex items-center gap-0">
            {timeline.map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                    ${i <= currentIdx ? 'bg-lime-700 border-lime-700 text-white' : 'bg-white border-stone-200 text-stone-400'}`}>
                    {i < currentIdx ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${i <= currentIdx ? 'text-lime-700' : 'text-stone-400'}`}>{step}</span>
                </div>
                {i < timeline.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 transition-all ${i < currentIdx ? 'bg-lime-600' : 'bg-stone-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        {apt.status === 'Cancelled' && <Badge color="red" className="text-sm">This appointment was cancelled</Badge>}

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-stone-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs mb-1"><Calendar size={12} /> Date</div>
            <p className="font-semibold text-stone-800 text-sm">{formatDate(apt.date)}</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs mb-1"><Clock size={12} /> Time</div>
            <p className="font-semibold text-stone-800 text-sm">{apt.time}</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-stone-400 text-xs mb-1"><Stethoscope size={12} /> Doctor</div>
            <p className="font-semibold text-stone-800 text-sm">{apt.Doctor?.name || 'N/A'}</p>
            <p className="text-xs text-stone-400">{apt.Doctor?.specialization}</p>
          </div>
          {apt.customer && (
            <div className="bg-stone-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-stone-400 text-xs mb-1"><User size={12} /> Patient</div>
              <p className="font-semibold text-stone-800 text-sm">{apt.customer?.name}</p>
            </div>
          )}
        </div>
        {apt.reason && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
            <div className="flex items-center gap-1.5 text-amber-600 text-xs mb-1"><FileText size={12} /> Reason for Visit</div>
            <p className="text-stone-700 text-sm">{apt.reason}</p>
          </div>
        )}

        {canEdit && (
          <div className="pt-4 border-t border-stone-100">
            <p className="text-sm font-medium text-stone-700 mb-2">Update Status</p>
            <div className="flex gap-2 flex-wrap">
              {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
                <button key={s} onClick={() => { onStatusChange(apt.id, s); onClose(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all
                    ${apt.status === s
                      ? 'bg-lime-700 text-white border-lime-700'
                    : 'bg-white border-stone-200 text-stone-600 hover:border-lime-400 hover:text-lime-700'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {onReschedule && apt.status === 'Pending' && (
          <div className="pt-4">
            <Button onClick={() => { onReschedule(apt); onClose(); }} variant="secondary" className="w-full">
              Reschedule Appointment
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

// ── Book Form ─────────────────────────────────────────────────────────────────
const BookForm = ({ doctors, onClose }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const doctorsArr = Array.isArray(doctors) ? doctors : [];
  const [form, setForm] = useState({ doctorId: doctorsArr[0]?.id || '', date: '', time: '', reason: '' });
  const loadingMsg = useLoadingMessage();

  const mutation = useMutation({
    mutationFn: (data) => api.post('/appointments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast('success', 'Appointment booked!', 'We will confirm shortly.');
      onClose();
    },
    onError: (err) => toast('error', err.response?.data?.message || 'Booking failed')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select label="Select Doctor" value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} required>
        {doctorsArr.map(d => <option key={d.id} value={d.id}>{d.name} – {d.specialization}</option>)}
      </Select>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Date" type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} min={new Date().toISOString().split('T')[0]} />
        <Input label="Time" type="time" required value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
      </div>
      <Textarea label="Reason for Visit" rows={3} required placeholder="e.g. Annual checkup, vaccination..." value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" disabled={mutation.isPending}>{mutation.isPending ? loadingMsg : 'Confirm Booking'}</Button>
      </div>
    </form>
  );
};

const EditForm = ({ apt, doctors, onClose }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ 
    doctorId: apt?.doctorId || '', 
    date: apt?.date ? new Date(apt.date).toISOString().split('T')[0] : '', 
    time: apt?.time || '', 
    reason: apt?.reason || '' 
  });
  const loadingMsg = useLoadingMessage();

  const mutation = useMutation({
    mutationFn: (data) => api.put(`/appointments/${apt.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast('success', 'Appointment rescheduled successfully');
      onClose();
    },
    onError: (err) => toast('error', err.response?.data?.message || 'Update failed')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select label="Select Doctor" value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value})} required disabled>
        {doctors.map(d => <option key={d.id} value={d.id}>{d.name} – {d.specialization}</option>)}
      </Select>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Date" type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} min={new Date().toISOString().split('T')[0]} />
        <Input label="Time" type="time" required value={form.time} onChange={e => setForm({...form, time: e.target.value})} />
      </div>
      <Textarea label="Reason for Visit" rows={3} required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" disabled={mutation.isPending}>{mutation.isPending ? loadingMsg : 'Update Appointment'}</Button>
      </div>
    </form>
  );
};
const Appointments = () => {
  const { user } = useContext(AuthContext);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [bookOpen, setBookOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editApt, setEditApt] = useState(null);
  const [detailApt, setDetailApt] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const toast = useToast();
  const queryClient = useQueryClient();
  const isStaff = user?.role !== 'customer';

  const { data, isLoading } = useQuery({
    queryKey: ['appointments', page],
    queryFn: async () => {
      const res = await api.get(`/appointments?page=${page}`);
      return res.data;
    }
  });

  const appointments = data?.appointments || [];
  const meta = data?.meta || { totalCount: 0, totalPages: 1, currentPage: 1 };

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      const res = await api.get('/doctors');
      return res.data;
    }
  });

  const { data: fullAptDetail } = useQuery({
    queryKey: ['appointment', detailApt?.id],
    queryFn: () => api.get(`/appointments/${detailApt.id}`).then(r => r.data),
    enabled: !!detailApt,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/appointments/${id}`, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      if (variables.status === 'Confirmed') toast('success', 'Appointment confirmed');
      else if (variables.status === 'Cancelled') toast('error', 'Appointment cancelled');
      else toast('success', `Marked as ${variables.status}`);
    },
    onError: () => toast('error', 'Update failed')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/appointments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast('success', 'Appointment deleted');
      setDeleteTarget(null);
    }
  });

  const updateStatus = (id, status) => statusMutation.mutate({ id, status });

  const handleExport = async () => {
    try {
      toast('info', 'Generating export...');
      const res = await api.get('/export/appointments', { 
        params: { status: statusFilter },
        responseType: 'blob' 
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `appointments_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast('error', 'Failed to generate export');
    }
  };

  const appointmentsArr = Array.isArray(appointments) ? appointments : [];
  const filtered = appointmentsArr.filter(a => {
    const matchSearch = (a.customer?.name || '').toLowerCase().includes(search.toLowerCase())
      || (a.Doctor?.name || '').toLowerCase().includes(search.toLowerCase())
      || (a.reason || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <PageHeader
        title="Appointments"
        description={`${meta.totalCount} total appointments`}
        action={
          <div className="flex gap-2">
            {isStaff && <Button variant="outline" onClick={handleExport}><Download size={16} /> Export CSV</Button>}
            {user?.role === 'customer' && (
              <Button onClick={() => setBookOpen(true)}><Plus size={16} /> Book Appointment</Button>
            )}
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by doctor, patient, reason..." />
        <div className="flex gap-2 shrink-0">
          {['all', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${statusFilter === s ? 'bg-lime-700 text-white border-lime-700' : 'bg-white border-stone-200 text-stone-500 hover:border-lime-400'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card className="overflow-hidden">
          <div className="space-y-0 divide-y divide-stone-100">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32 ml-auto" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📅" title="No appointments" description={search || statusFilter !== 'all' ? 'No appointments match your filters.' : 'No appointments have been booked yet.'}
          action={user?.role === 'customer' && <Button onClick={() => setBookOpen(true)}><Plus size={16} /> Book Now</Button>} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-stone-100 bg-stone-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Date & Time</th>
                  {isStaff && <th className="px-6 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Patient</th>}
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Doctor</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">Reason</th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map(apt => (
                  <tr key={apt.id} onClick={() => setDetailApt(apt)} className="hover:bg-stone-50 cursor-pointer transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-stone-800 font-medium">
                        <Calendar size={14} className="text-lime-600 shrink-0" />
                        {formatDate(apt.date)}
                      </div>
                      <div className="flex items-center gap-2 text-stone-400 text-xs mt-1">
                        <Clock size={12} />{apt.time}
                      </div>
                    </td>
                    {isStaff && <td className="px-6 py-4 text-stone-700">{apt.customer?.name || '—'}</td>}
                    <td className="px-6 py-4">
                      <p className="text-stone-700 font-medium">{apt.Doctor?.name || '—'}</p>
                      <p className="text-xs text-stone-400">{apt.Doctor?.specialization}</p>
                    </td>
                    <td className="px-6 py-4 text-stone-500 hidden md:table-cell max-w-xs truncate">{apt.reason || '—'}</td>
                    <td className="px-6 py-4"><StatusBadge status={apt.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={(e) => { e.stopPropagation(); setDetailApt(apt); }} className="text-xs text-lime-700 hover:underline font-semibold">View</button>
                        {isStaff && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(apt); }}
                            className="text-stone-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
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
          <Pagination 
            currentPage={meta.currentPage} 
            totalPages={meta.totalPages} 
            onPageChange={setPage} 
          />
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={bookOpen} onClose={() => setBookOpen(false)} title="Book Appointment">
        <BookForm doctors={doctors} onClose={() => setBookOpen(false)} />
      </Modal>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Reschedule Appointment">
        <EditForm apt={editApt} doctors={doctors} onClose={() => setEditOpen(false)} />
      </Modal>

      <AppointmentDetail
        apt={fullAptDetail || detailApt}
        onClose={() => setDetailApt(null)}
        canEdit={isStaff}
        onStatusChange={updateStatus}
        onReschedule={user?.role === 'customer' ? (apt) => { setEditApt(apt); setEditOpen(true); } : null}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        title="Delete Appointment"
        message={`Are you sure you want to delete the appointment for "${deleteTarget?.customer?.name || 'this customer'}" on ${deleteTarget?.date}?`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default Appointments;
