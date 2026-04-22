import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { useToast } from '../components/Toast';
import { useLoadingMessage, Button, Input } from '../components/UI';
import { PawPrint, Eye, EyeOff, Upload, User, Mail, Phone, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const { register } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();
  const loadingMsg = useLoadingMessage();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.includes('@')) newErrors.email = 'Invalid email address';
    if (form.phone && form.phone.length < 10) newErrors.phone = 'Invalid phone number';
    if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('password', form.password);
      formData.append('confirmPassword', form.confirmPassword);
      if (image) formData.append('profileImage', image);

      await register(formData);
      toast('success', 'Account created!', 'Welcome to Pets Mart 🐾');
      navigate('/dashboard');
    } catch (err) {
      toast('error', 'Registration failed', err.response?.data?.error || 'Please try again.');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-lime-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-lime-700 p-2 rounded-xl shadow-lg shadow-lime-200/50">
              <PawPrint size={24} className="text-white" />
            </div>
            <span className="text-3xl font-black text-stone-800 tracking-tight">Pets Mart</span>
          </Link>
          <h2 className="text-2xl font-bold text-stone-800">Create your account</h2>
          <p className="text-stone-400 text-sm mt-1">Join our community of pet lovers</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/50 border border-stone-100 p-8 md:p-10 overflow-hidden relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload */}
            <div className="flex flex-col items-center mb-2">
              <div className="relative group">
                <div className="w-24 h-24 rounded-3xl bg-stone-50 border-2 border-dashed border-stone-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-lime-500">
                  {preview ? (
                    <img src={preview} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-stone-300" />
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                    <Upload size={20} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
              </div>
              <p className="text-[10px] uppercase font-bold text-stone-400 mt-2 tracking-widest">Upload Profile Pic</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Full Name" 
                placeholder="John Smith" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
                error={errors.name}
                required
              />
              <Input 
                label="Phone Number" 
                placeholder="+91 ..." 
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})}
                error={errors.phone}
              />
            </div>

            <Input 
              label="Email Address" 
              type="email"
              placeholder="john@example.com" 
              value={form.email} 
              onChange={e => setForm({...form, email: e.target.value})}
              error={errors.email}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Input 
                  label="Password" 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••" 
                  value={form.password} 
                  onChange={e => setForm({...form, password: e.target.value})}
                  error={errors.password}
                  required
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
                label="Confirm Password" 
                type="password"
                placeholder="••••••••" 
                value={form.confirmPassword} 
                onChange={e => setForm({...form, confirmPassword: e.target.value})}
                error={errors.confirmPassword}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full py-4 text-base" 
              disabled={loading}
            >
              {loading ? loadingMsg : 'Create Account'}
            </Button>
          </form>

          <p className="text-center text-sm text-stone-400 mt-8">
            Already have an account? <Link to="/login" className="text-lime-700 hover:text-lime-600 font-bold underline underline-offset-4">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
