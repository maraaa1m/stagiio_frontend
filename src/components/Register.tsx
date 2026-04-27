import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  Globe, 
  FileText,
  ArrowRight,
  Loader2,
  CheckCircle2,
  GraduationCap,
  CreditCard
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ALGERIA_WILAYAS } from '../constants';

const Register = () => {
  const [type, setType] = useState<'student' | 'company'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    univWillaya: '',
    // department is now sent as the string code — backend maps 'IFA'/'TLSI'/'MI' to FK
    department: '',
    socialSecurityNumber: '',
  });

  const [companyData, setCompanyData] = useState({
    companyName: '',
    email: '',
    password: '',
    phoneNumber: '',
    location: '',
    description: '',
    website: '',
    registreCommerce: null as File | null,
  });

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentData.email.endsWith('.dz')) {
      setError('University email must end with .dz');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      // Field names match StudentRegisterSerializer exactly
      const response = await axios.post('/api/register/student/', {
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        email: studentData.email,
        password: studentData.password,
        phoneNumber: studentData.phoneNumber,
        univWillaya: studentData.univWillaya,
        department: studentData.department,   // backend maps string code → FK
        socialSecurityNumber: studentData.socialSecurityNumber,
      });
      
      const data = response.data;
      const tokens = data.tokens || {};
      const access = tokens.access || data.access || data.token || data.access_token;
      const refresh = tokens.refresh || data.refresh || data.refresh_token;

      if (access) {
        localStorage.setItem('access_token', access);
        if (refresh) localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user_role', 'STUDENT');
        navigate('/profile/setup');
      } else {
        navigate('/login');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || err.response?.data?.email?.[0] || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyData.registreCommerce) {
      setError('Please upload your Registre de Commerce PDF.');
      return;
    }

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    // FIX: field names now match what CompanyRegisterSerializer reads (camelCase)
    formData.append('companyName', companyData.companyName);
    formData.append('email', companyData.email);
    formData.append('password', companyData.password);
    formData.append('phoneNumber', companyData.phoneNumber);
    formData.append('location', companyData.location);
    formData.append('description', companyData.description);
    formData.append('website', companyData.website);
    formData.append('registreCommerce', companyData.registreCommerce);

    try {
      const response = await axios.post('/api/register/company/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = response.data;
      const tokens = data.tokens || {};
      const access = tokens.access || data.access || data.token || data.access_token;
      const refresh = tokens.refresh || data.refresh || data.refresh_token;

      if (access) {
        localStorage.setItem('access_token', access);
        if (refresh) localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user_role', 'COMPANY');
        navigate('/company/dashboard');
      } else {
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
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
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
            <span className="font-bold text-xl text-navy-900">Stag<span className="text-blue-600">.io</span></span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-navy-900 mb-2">Create Account</h1>
          <p className="text-navy-900/40 font-medium">Join the premier Algerian internship ecosystem</p>
        </div>

        {/* Type Toggle */}
        <div className="flex p-1.5 bg-gray-100 rounded-[1.5rem] mb-10 max-w-sm mx-auto">
          <button 
            onClick={() => setType('student')}
            className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest rounded-2xl transition-all ${type === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-navy-900/40 hover:text-navy-900'}`}
          >
            I am a Student
          </button>
          <button 
            onClick={() => setType('company')}
            className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest rounded-2xl transition-all ${type === 'company' ? 'bg-white text-blue-600 shadow-sm' : 'text-navy-900/40 hover:text-navy-900'}`}
          >
            I am a Company
          </button>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-premium border border-white relative">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {type === 'student' ? (
              <motion.form 
                key="student"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleStudentSubmit} 
                className="grid md:grid-cols-2 gap-6"
              >
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">First Name</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                      <User size={18} />
                    </div>
                    <input 
                      required
                      type="text"
                      value={studentData.firstName}
                      onChange={(e) => setStudentData({ ...studentData, firstName: e.target.value })}
                      placeholder="First Name"
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">Last Name</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                      <User size={18} />
                    </div>
                    <input 
                      required
                      type="text"
                      value={studentData.lastName}
                      onChange={(e) => setStudentData({ ...studentData, lastName: e.target.value })}
                      placeholder="Last Name"
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">University Email (.dz)</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input 
                      required
                      type="email"
                      value={studentData.email}
                      onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                      placeholder="student@univ-constantine02.dz"
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">Password</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      required
                      type={showPassword ? "text" : "password"}
                      value={studentData.password}
                      onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
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

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">Phone Number</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                      <Phone size={18} />
                    </div>
                    <input 
                      required
                      type="tel"
                      value={studentData.phoneNumber}
                      onChange={(e) => setStudentData({ ...studentData, phoneNumber: e.target.value })}
                      placeholder="0550 00 00 00"
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">University Wilaya</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                      <MapPin size={18} />
                    </div>
                    <select 
                      required
                      value={studentData.univWillaya}
                      onChange={(e) => setStudentData({ ...studentData, univWillaya: e.target.value })}
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900 appearance-none"
                    >
                      <option value="">Select Wilaya</option>
                      {ALGERIA_WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">Department</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                      <GraduationCap size={18} />
                    </div>
                    <select required
                      value={studentData.department}
                      onChange={(e) => setStudentData({...studentData, department: e.target.value})}
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900 appearance-none"
                    >
                      <option value="">Select your department</option>
                      {/* Values are the string codes the backend maps to FK IDs */}
                      <option value="IFA">Informatique Fondamentale et ses Applications (IFA)</option>
                      <option value="MI">Mathématiques et Informatique (MI)</option>
                      <option value="TLSI">Technologies des Logiciels et Systèmes d'Information (TLSI)</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">Social Security Number</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                      <CreditCard size={18} />
                    </div>
                    <input
                      type="text"
                      value={studentData.socialSecurityNumber}
                      onChange={(e) => setStudentData({...studentData, socialSecurityNumber: e.target.value})}
                      placeholder="ex: 19912524678"
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 pt-4">
                  <button 
                    disabled={isLoading}
                    type="submit"
                    className="w-full py-5 bg-navy-900 text-white rounded-2xl font-bold text-[13px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-navy-900/10 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Student Account <ArrowRight size={18} /></>}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form 
                key="company"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleCompanySubmit} 
                className="grid md:grid-cols-2 gap-6"
              >
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">Company Name</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                      <Building2 size={18} />
                    </div>
                    <input 
                      required
                      type="text"
                      value={companyData.companyName}
                      onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                      placeholder="Company Name"
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">Professional Email</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input 
                      required
                      type="email"
                      value={companyData.email}
                      onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                      placeholder="Email@company.com"
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">Password</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      required
                      type={showPassword ? "text" : "password"}
                      value={companyData.password}
                      onChange={(e) => setCompanyData({ ...companyData, password: e.target.value })}
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

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">Phone Number</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                      <Phone size={18} />
                    </div>
                    <input 
                      required
                      type="tel"
                      value={companyData.phoneNumber}
                      onChange={(e) => setCompanyData({ ...companyData, phoneNumber: e.target.value })}
                      placeholder="030 00 00 00"
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">Location (Wilaya)</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                      <MapPin size={18} />
                    </div>
                    <select 
                      required
                      value={companyData.location}
                      onChange={(e) => setCompanyData({ ...companyData, location: e.target.value })}
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900 appearance-none"
                    >
                      <option value="">Select Wilaya</option>
                      {ALGERIA_WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">Company Website</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                      <Globe size={18} />
                    </div>
                    <input 
                      required
                      type="url"
                      value={companyData.website}
                      onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                      placeholder="https://company.com"
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">
                    Registre de Commerce (PDF) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                      <FileText size={18} />
                    </div>
                    <div className="relative">
                      <input
                        required
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setCompanyData({...companyData, registreCommerce: e.target.files?.[0] || null})}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus-within:border-blue-600/30 focus-within:ring-4 focus-within:ring-blue-600/5 transition-all font-medium text-navy-900 min-h-[58px] flex items-center">
                        <span className={`block truncate ${!companyData.registreCommerce ? 'text-navy-900/40' : 'text-navy-900'}`}>
                          {companyData.registreCommerce ? companyData.registreCommerce.name : "Select Registre de Commerce (PDF)"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">Company Description</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-6 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                      <FileText size={18} />
                    </div>
                    <textarea 
                      required
                      value={companyData.description}
                      onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                      placeholder="Tell us about your company..."
                      rows={4}
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900 resize-none"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 pt-4">
                  <button 
                    disabled={isLoading}
                    type="submit"
                    className="w-full py-5 bg-navy-900 text-white rounded-2xl font-bold text-[13px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-navy-900/10 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Register Company <ArrowRight size={18} /></>}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center mt-8 text-navy-900/40 font-medium">
          Already have an account? {' '}
          <Link to="/login" className="text-blue-600 font-bold hover:text-navy-900 transition-colors">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;