import React, { useState } from 'react';
import api from '../api';
import { useToast } from '../components/Toast';
import { Button, Input, Card } from '../components/UI';
import { PawPrint, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast('error', 'Validation error', 'Passwords do not match');
    }
    if (form.password.length < 6) {
      return toast('error', 'Validation error', 'Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: form.password });
      toast('success', 'Success!', 'Your password has been reset. You can now login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast('error', 'Reset failed', err.response?.data?.error || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-sm">
          <h2 className="text-xl font-bold text-red-600 mb-2">Invalid Link</h2>
          <p className="text-stone-500 text-sm mb-6">This password reset link is invalid or has expired.</p>
          <Button onClick={() => navigate('/forgot-password')}>Request New Link</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-lime-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="bg-lime-700 p-2 rounded-xl shadow-lg"><PawPrint size={22} className="text-white" /></div>
            <span className="text-2xl font-bold text-stone-800">Pets Mart</span>
          </div>
          <h2 className="text-2xl font-black text-stone-800">Set New Password</h2>
          <p className="text-stone-400 text-sm mt-1">Please enter your new secure password below</p>
        </div>

        <Card className="p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input 
                label="New Password" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})}
                required
                icon={<Lock size={18} className="text-stone-300" />}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Input 
              label="Confirm New Password" 
              type="password" 
              placeholder="••••••••" 
              value={form.confirmPassword} 
              onChange={e => setForm({...form, confirmPassword: e.target.value})}
              required
            />
            <Button type="submit" className="w-full py-4" disabled={loading}>
              {loading ? 'Resetting...' : 'Update Password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
