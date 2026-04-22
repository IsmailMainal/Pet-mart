import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { useToast } from '../components/Toast';
import { useLoadingMessage } from '../components/UI';
import { PawPrint } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const loadingMsg = useLoadingMessage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast('success', 'Welcome back!');
      navigate('/dashboard');
    } catch {
      toast('error', 'Invalid credentials', 'Please check your email and password.');
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
          <h2 className="text-2xl font-bold text-stone-800">Welcome back</h2>
          <p className="text-stone-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-lime-600 focus:ring-2 focus:ring-lime-100 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-lime-600 focus:ring-2 focus:ring-lime-100 transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-lime-700 hover:bg-lime-600 disabled:bg-lime-400 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-sm">
              {loading ? loadingMsg : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-stone-100">
            <p className="text-xs text-stone-400 text-center mb-3 font-medium">Demo accounts (password: password123)</p>
            <div className="flex gap-2 justify-center">
              {['admin@petsmart.com', 'receptionist@petsmart.com', 'customer@petsmart.com'].map(em => (
                <button key={em} onClick={() => setEmail(em)}
                  className="text-xs bg-stone-100 hover:bg-lime-50 hover:text-lime-700 text-stone-500 px-2.5 py-1.5 rounded-lg transition-colors font-medium capitalize">
                  {em.split('@')[0]}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-stone-400 mt-6">
            Don't have an account? <Link to="/signup" className="text-lime-700 hover:text-lime-600 font-semibold">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
