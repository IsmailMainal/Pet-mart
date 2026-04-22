import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import { useToast } from '../components/Toast';
import { Button, Card, Input, Modal, ConfirmModal, PageHeader, Skeleton, Badge, useLoadingMessage } from '../components/UI';
import { User as UserIcon, Mail, Phone, Calendar, Shield, Upload, Lock, Trash2, Camera } from 'lucide-react';
import api, { getFileUrl } from '../api';

const Profile = () => {
  const { user, setUser, logout, refreshUser } = useContext(AuthContext);
  const toast = useToast();
  const loadingMsg = useLoadingMessage();

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passForm, setPassForm] = useState({ password: '', confirmPassword: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name, phone: user.phone || '' });
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      handleAutoUpload(file);
    }
  };

  const handleAutoUpload = async (file) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    try {
      const res = await api.put('/users/me', formData);
      setUser(res.data.user);
      toast('success', 'Profile image updated');
    } catch (err) {
      toast('error', 'Failed to upload image');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/users/me', form);
      setUser(res.data.user);
      toast('success', 'Profile updated');
      setIsEditing(false);
    } catch (err) {
      toast('error', err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.password !== passForm.confirmPassword) {
      return toast('error', 'Passwords do not match');
    }
    setSaving(true);
    try {
      await api.put('/users/me', passForm);
      toast('success', 'Password changed successfully');
      setIsChangingPassword(false);
      setPassForm({ password: '', confirmPassword: '' });
    } catch (err) {
      toast('error', err.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      await api.delete('/users/me');
      toast('success', 'Account deactivated', 'Logging you out...');
      setTimeout(logout, 2000);
    } catch (err) {
      toast('error', 'Failed to deactivate account');
    }
  };

  if (!user) return <div className="p-8"><Skeleton className="h-64 w-full" /></div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <PageHeader 
        title="Account Profile" 
        description="Manage your personal information and security" 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-lime-600 to-lime-800" />
            
            <div className="relative mt-8 mb-4">
              <div className="w-28 h-28 rounded-[2.5rem] bg-white p-1 shadow-xl mx-auto overflow-hidden group">
                <div className="w-full h-full rounded-[2.2rem] bg-stone-100 flex items-center justify-center overflow-hidden relative">
                  {user.profileImage || preview ? (
                    <img 
                      src={preview || getFileUrl(user.profileImage)} 
                      alt={user.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <UserIcon size={40} className="text-stone-300" />
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                    <Camera size={20} />
                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                  </label>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-stone-800">{user.name}</h3>
            <p className="text-stone-400 text-sm flex items-center justify-center gap-1.5 mt-1">
              <Shield size={12} className="text-lime-600" />
              <span className="capitalize">{user.role}</span>
            </p>

            <div className="mt-8 pt-8 border-t border-stone-100 space-y-4 text-left">
              <div className="flex items-center gap-3 text-stone-500 text-sm">
                <Mail size={16} className="text-stone-300" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-stone-500 text-sm">
                <Phone size={16} className="text-stone-300" />
                <span>{user.phone || 'No phone added'}</span>
              </div>
              <div className="flex items-center gap-3 text-stone-500 text-sm">
                <Calendar size={16} className="text-stone-300" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </Card>

          <Button 
            variant="outline" 
            className="w-full justify-center" 
            onClick={() => setIsChangingPassword(true)}
          >
            <Lock size={16} /> Change Password
          </Button>
        </div>

        {/* Right Column: Detailed Info & Actions */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-lg font-bold text-stone-800">Personal Information</h4>
              {!isEditing && (
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                  Edit Details
                </Button>
              )}
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input 
                  label="Full Name" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  disabled={!isEditing}
                />
                <Input 
                  label="Phone Number" 
                  value={form.phone} 
                  onChange={e => setForm({...form, phone: e.target.value})} 
                  disabled={!isEditing}
                  placeholder="Not provided"
                />
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="flex items-center justify-between mt-1 px-1">
                  <p className="text-stone-800 font-medium">{user.email}</p>
                  <Badge color="green">Verified</Badge>
                </div>
                <p className="text-[10px] text-stone-400 mt-2 ml-1">Email address cannot be changed for security reasons.</p>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4 border-t border-stone-100">
                  <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button type="submit" className="flex-1" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </form>
          </Card>

          {/* Danger Zone */}
          <Card className="p-8 border-red-100 bg-red-50/30">
            <h4 className="text-lg font-bold text-red-800 mb-2">Danger Zone</h4>
            <p className="text-red-600/70 text-sm mb-6">Once you deactivate your account, you will no longer be able to log in. This action is reversible by an administrator.</p>
            <Button variant="danger" onClick={() => setIsDeactivating(true)}>
              <Trash2 size={16} /> Deactivate Account
            </Button>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={isChangingPassword} 
        onClose={() => setIsChangingPassword(false)} 
        title="Change Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input 
            label="New Password" 
            type="password" 
            required 
            minLength={6}
            value={passForm.password} 
            onChange={e => setPassForm({...passForm, password: e.target.value})} 
          />
          <Input 
            label="Confirm New Password" 
            type="password" 
            required 
            value={passForm.confirmPassword} 
            onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})} 
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsChangingPassword(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal 
        isOpen={isDeactivating} 
        onClose={() => setIsDeactivating(false)} 
        onConfirm={handleDeactivate}
        title="Deactivate Account"
        description="Are you sure you want to deactivate your account? You will be logged out immediately."
        confirmLabel="Deactivate"
      />
    </div>
  );
};

export default Profile;
