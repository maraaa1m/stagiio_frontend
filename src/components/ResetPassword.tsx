import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { uid, token }          = useParams<{ uid: string; token: string }>();
  const navigate                = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await axios.post('/api/auth/reset-password/', {
        uid,
        token,
        new_password: password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
        'This reset link is invalid or has expired. Please request a new one.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50/40 rounded-full blur-[120px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span className="font-bold text-xl text-navy-900">Stag<span className="text-blue-600">.io</span></span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-navy-900 mb-2">Set New Password</h1>
          <p className="text-navy-900/40 font-medium">Choose a strong password for your account</p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-premium border border-white">
          {success ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-[2rem] bg-green-50 text-green-500 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-display font-bold text-navy-900 mb-2">Password Updated!</h3>
              <p className="text-navy-900/40 font-medium">Redirecting you to login...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">New Password</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input required type={showPw ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="••••••••" minLength={8}
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-14 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-navy-900/30 hover:text-navy-900 transition-colors">
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input required type={showPw ? 'text' : 'password'} value={confirm}
                      onChange={e => setConfirm(e.target.value)} placeholder="••••••••" minLength={8}
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900" />
                  </div>
                </div>

                <button disabled={isLoading} type="submit"
                  className="w-full py-5 bg-navy-900 text-white rounded-2xl font-bold text-[13px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-navy-900/10 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70">
                  {isLoading
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <><span>Update Password</span><ArrowRight size={18} /></>
                  }
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center mt-8 text-navy-900/40 font-medium">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:text-navy-900 transition-colors">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;