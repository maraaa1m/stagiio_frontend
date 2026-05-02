import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/api';
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
      // Step 1: The Login Payload Rule (Fixes 400 errors)
      // SimpleJWT requires 'username' key even if using email
      const response = await api.post('/api/auth/login/', {
        username: formData.email,
        password: formData.password
      });
      
      const access = response.data.access || response.data.access_token || response.data.token;
      const refresh = response.data.refresh || response.data.refresh_token;
      
      if (!access) {
        throw new Error('No access token received from server');
      }

      // Step 4: JWT State Management Rule
      localStorage.setItem('access_token', access);
      if (refresh) localStorage.setItem('refresh_token', refresh);
      
      let role = response.data.role;
      let deptId = response.data.department_id || response.data.department;
      
      // Secondary extraction from JWT decoded body
      try {
        const decoded: any = jwtDecode(access);
        role = role || decoded.role || decoded.user_role || decoded.groups?.[0];
        deptId = deptId || decoded.department_id || decoded.department;
        
        if (role) localStorage.setItem('user_role', role);
        if (deptId) localStorage.setItem('department_id', deptId.toString());
      } catch (e) {
        console.error('Failed to decode token:', e);
      }

      // Routing logic
      if (role === 'STUDENT') navigate('/student/dashboard');
      else if (role === 'COMPANY') navigate('/company/dashboard');
      else if (role === 'ADMIN') {
        // If deptId is null, it unlocks Superadmin/Dean Mode
        navigate('/admin/dashboard');
      }
      else {
        navigate('/student/dashboard');
      }
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 transition-transform group-hover:scale-125" />
            <span className="font-display font-bold text-xl text-navy-900 tracking-tight">Stag<span className="text-blue-600 italic">.io</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 hidden sm:block">No account yet?</span>
            <Link to="/register" className="px-6 py-2.5 bg-paper text-navy-900 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-navy-900 hover:text-white transition-all">
              Register
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-12 space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 italic">Welcome Back</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-navy-900 tracking-tight leading-[1.1] text-balance">
              Access the <br />
              <span className="text-blue-600 italic">National Ecosystem.</span>
            </h1>
          </div>

          <div className="relative group">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-8 p-6 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-[2rem] flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">Email Address</label>
                <div className="relative group/field">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.dz"
                    className="w-full bg-paper border border-gray-100 rounded-[2rem] py-5 pl-16 pr-8 outline-none focus:border-blue-600/30 focus:ring-8 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-6 mr-6">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30">Password</label>
                  <Link to="/forgot-password"
                    className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-navy-900 transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative group/field">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    required
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-paper border border-gray-100 rounded-[2rem] py-5 pl-16 pr-16 outline-none focus:border-blue-600/30 focus:ring-8 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-navy-900/20 hover:text-navy-900 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  disabled={isLoading}
                  type="submit"
                  className="w-full py-6 bg-navy-900 text-white rounded-[2rem] font-bold text-[13px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-navy-900/10 active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <p className="text-center mt-12 text-navy-900/30 font-bold uppercase tracking-[0.2em] text-[10px]">
            New to Stag.io? {' '}
            <Link to="/register" className="text-blue-600 hover:text-navy-900 transition-colors">
              Create an account
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default Login;

