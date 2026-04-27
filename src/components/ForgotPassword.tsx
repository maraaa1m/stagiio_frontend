import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      await axios.post('/api/auth/forgot-password/', { email });
      setMessage('If an account exists with this email, you will receive a reset link shortly.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50/40 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
            <span className="font-bold text-xl text-navy-900">Stag<span className="text-blue-600">.io</span></span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-navy-900 mb-2">Reset Password</h1>
          <p className="text-navy-900/40 font-medium">We'll send you a link to reset your password</p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-premium border border-white relative">
          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-sm font-bold rounded-2xl">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">Email Address</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                />
              </div>
            </div>

            <button 
              disabled={isLoading}
              type="submit"
              className="w-full py-5 bg-navy-900 text-white rounded-2xl font-bold text-[13px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-navy-900/10 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <Link to="/login" className="mt-8 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-navy-900/40 hover:text-navy-900 transition-colors">
            <ArrowLeft size={14} />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
