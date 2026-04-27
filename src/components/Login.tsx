import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Django SimpleJWT expects "username" key by default.
      // Since AUTH_USER_MODEL uses email as username, we pass email as username.
      const response = await axios.post('/api/auth/login/', {
        username: formData.email,
        password: formData.password,
      });

      const access = response.data.access;
      const refresh = response.data.refresh;

      if (!access) throw new Error('No access token received from server');

      localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);

      // Decode JWT to get user role
      let role: string | null = null;
      try {
        const decoded: any = jwtDecode(access);
        role = decoded.role || decoded.user_role || null;
      } catch (e) {
        console.error('Failed to decode token:', e);
      }

      if (role) localStorage.setItem('user_role', role);

      if (role === 'STUDENT') navigate('/student/dashboard');
      else if (role === 'COMPANY') navigate('/company/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/student/dashboard');

    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Invalid credentials. Please try again.'
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
          <h1 className="text-3xl font-display font-bold text-navy-900 mb-2">Welcome Back</h1>
          <p className="text-navy-900/40 font-medium">Enter your credentials to access your account</p>
        </div>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-premium border border-white relative">
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-4">
                <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-bold uppercase tracking-widest text-blue-600 hover:text-navy-900 transition-colors">
                  Forgot?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-14 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-navy-900/30 hover:text-navy-900 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-navy-900/40 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-bold hover:text-navy-900 transition-colors">
            Get Started
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;