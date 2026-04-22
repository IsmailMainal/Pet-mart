import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { useToast } from '../components/Toast';
import {
  Button, Card, Input, Textarea, Modal, ConfirmModal,
  PageHeader, SearchBar, Badge, EmptyState, Skeleton
} from '../components/UI';
import { Plus, Pencil, Trash2, Heart, Activity, Stethoscope, Scissors } from 'lucide-react';

const SERVICE_ICONS = {
  'checkup': <Stethoscope size={20} />,
  'surgery': <Activity size={20} />,
  'grooming': <Scissors size={20} />,
  'default': <Heart size={20} />,
};

const getIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('check') || n.includes('exam')) return SERVICE_ICONS.checkup;
  if (n.includes('surg') || n.includes('oper')) return SERVICE_ICONS.surgery;
  if (n.includes('groom') || n.includes('wash')) return SERVICE_ICONS.grooming;
  return SERVICE_ICONS.default;
};

const Services = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const isAdmin = user?.role === 'admin';

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '' });
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch {
      toast('error', 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const openCreate = () => { setEditingService(null); setFormData({ name: '', description: '', price: '' }); setFormOpen(true); };
  const openEdit = (s) => { setEditingService(s); setFormData({ name: s.name, description: s.description, price: s.price }); setFormOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingService) {
        await api.put(`/services/${editingService.id}`, formData);
        toast('success', 'Service updated!');
      } else {
        await api.post('/services', formData);
        toast('success', 'Service added!');
      }
      setFormOpen(false);
      fetchServices();
    } catch {
      toast('error', 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const filtered = (Array.isArray(services) ? services : []).filter(s => 
    (s.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (s.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Veterinary Services"
        description="Manage clinical and grooming services"
        action={isAdmin && <Button onClick={openCreate}><Plus size={16} /> Add Service</Button>}
      />

      <div className="mb-6 max-w-md">
        <SearchBar value={search} onChange={setSearch} placeholder="Search services..." />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-24" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🩺" title="No services found" description="Try a different search or add a new service."
          action={isAdmin && <Button onClick={openCreate}><Plus size={16} /> Add Service</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(service => (
            <Card key={service.id} className="p-6 relative group border-transparent hover:border-lime-200 transition-all">
              <div className="bg-lime-50 text-lime-700 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-lime-700 group-hover:text-white transition-colors duration-300">
                {getIcon(service.name)}
              </div>
              
              <h3 className="text-xl font-bold text-stone-800 mb-2">{service.name}</h3>
              <p className="text-stone-500 text-sm mb-6 line-clamp-2">{service.description || 'Professional pet care service.'}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-50">
                <span className="text-2xl font-black text-lime-700">₹{parseFloat(service.price).toFixed(2)}</span>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(service)} className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Pencil size={16} />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={editingService ? 'Edit Service' : 'Add Service'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Service Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Annual Health Check" />
          <Input label="Price (₹)" type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          <Textarea label="Description" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the service..." />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? 'Saving...' : 'Save Service'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Services;
