import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { useToast } from '../components/Toast';
import { useLoadingMessage } from '../components/UI';
import { PawPrint } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const { register } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const loadingMsg = useLoadingMessage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast('success', 'Account created!', 'Welcome to Pets Mart 🐾');
      navigate('/dashboard');
    } catch {
      toast('error', 'Registration failed', 'Email may already be in use.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-lime-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-lime-700 p-2 rounded-xl"><PawPrint size={22} className="text-white" /></div>
            <span className="text-2xl font-bold text-stone-800">Pets Mart</span>
          </Link>
          <h2 className="text-2xl font-bold text-stone-800">Create your account</h2>
          <p className="text-stone-400 text-sm mt-1">Join thousands of happy pet owners</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="John Smith"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-lime-600 focus:ring-2 focus:ring-lime-100 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="john@example.com"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-lime-600 focus:ring-2 focus:ring-lime-100 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} placeholder="Min 6 characters"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-lime-600 focus:ring-2 focus:ring-lime-100 transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-lime-700 hover:bg-lime-600 disabled:bg-lime-400 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-sm">
              {loading ? loadingMsg : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-stone-400 mt-6">
            Already have an account? <Link to="/login" className="text-lime-700 hover:text-lime-600 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
