import React, { useState } from 'react';
import api from '../api';
import { useToast } from '../components/Toast';
import { Button, Input, Card } from '../components/UI';
import { PawPrint, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast('success', 'Email sent', 'Please check your inbox (and console for demo)');
    } catch (err) {
      toast('error', 'Request failed', err.response?.data?.error || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-lime-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="bg-lime-700 p-2 rounded-xl shadow-lg"><PawPrint size={22} className="text-white" /></div>
            <span className="text-2xl font-bold text-stone-800">Pets Mart</span>
          </Link>
          <h2 className="text-2xl font-black text-stone-800">Reset Password</h2>
          <p className="text-stone-400 text-sm mt-1">We'll send you a link to get back into your account</p>
        </div>

        <Card className="p-8 md:p-10">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="john@example.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                required
                icon={<Mail size={18} className="text-stone-300" />}
              />
              <Button type="submit" className="w-full py-4" disabled={loading}>
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">Check your email</h3>
              <p className="text-stone-500 text-sm mb-8">
                If an account exists for {email}, we've sent instructions to reset your password.
              </p>
              <Button variant="secondary" className="w-full" onClick={() => setSent(false)}>
                Try another email
              </Button>
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-stone-50 text-center">
            <Link to="/login" className="text-sm font-bold text-lime-700 hover:text-lime-600 flex items-center justify-center gap-2">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
