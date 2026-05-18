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
import api from '@/api';
import { toast, Toaster } from 'sonner';
import { ALGERIA_WILAYAS } from '../constants';

const Register = () => {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const initialType = searchParams.get('type') === 'company' ? 'company' : 'student';
  
  const [type, setType] = useState<'student' | 'company'>(initialType);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Chained Select Data
  const [universities, setUniversities] = useState<{id: number, name: string}[]>([]);
  const [faculties, setFaculties] = useState<{id: number, name: string}[]>([]);
  const [departments, setDepartments] = useState<{id: number, name: string}[]>([]);

  const [studentData, setStudentData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    univWillaya: '',
    universityId: '',
    facultyId: '',
    departmentId: '',
    socialSecurityNumber: '',
    idCardNumber: '',
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

  const [isLoadingUniversities, setIsLoadingUniversities] = useState(false);
  const [isLoadingFaculties, setIsLoadingFaculties] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

  React.useEffect(() => {
    const fetchUniversities = async () => {
      setIsLoadingUniversities(true);
      try {
        const response = await api.get('/api/universities/');
        const data = response.data.results || response.data;
        setUniversities(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch universities:', err);
        toast.error('Failed to load universities. Please check your connection.');
      } finally {
        setIsLoadingUniversities(false);
      }
    };
    fetchUniversities();
  }, []);

  const handleUniversityChange = async (univId: string) => {
    setStudentData(prev => ({ ...prev, universityId: univId, facultyId: '', departmentId: '' }));
    setFaculties([]);
    setDepartments([]);
    if (!univId) return;
    setIsLoadingFaculties(true);
    try {
      const response = await api.get(`/api/faculties/${univId}/`);
      const data = response.data.results || response.data;
      setFaculties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch faculties:', err);
      toast.error('Failed to load faculties for this university.');
    } finally {
      setIsLoadingFaculties(false);
    }
  };

  const handleFacultyChange = async (facId: string) => {
    setStudentData(prev => ({ ...prev, facultyId: facId, departmentId: '' }));
    setDepartments([]);
    if (!facId) return;
    setIsLoadingDepartments(true);
    try {
      const response = await api.get(`/api/departments/${facId}/`);
      const data = response.data.results || response.data;
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
      toast.error('Failed to load departments for this faculty.');
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentData.email.endsWith('.dz')) {
      const msg = 'University email must end with .dz';
      setError(msg);
      toast.warning(msg);
      return;
    }
    
    setIsLoading(true);
    setError('');

    // Step 2: Institutional Hierarchy Rule
    // IDs must be sent as integers, not strings or text names
    const payload = {
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      email: studentData.email,
      password: studentData.password,
      phoneNumber: studentData.phoneNumber,
      university: parseInt(studentData.universityId),
      faculty: parseInt(studentData.facultyId),
      department: parseInt(studentData.departmentId),
      univWillaya: studentData.univWillaya,
      university_wilaya: studentData.univWillaya,
      univ_willaya: studentData.univWillaya,
      socialSecurityNumber: studentData.socialSecurityNumber,
      social_security_number: studentData.socialSecurityNumber,
      IDCardNumber: studentData.idCardNumber,
      id_card_number: studentData.idCardNumber,
      idCardNumber: studentData.idCardNumber
    };

    try {
      const response = await api.post('/api/register/student/', payload);
      
      const data = response.data;
      toast.success('Registration successful! Redirecting to profile setup...');
      const tokens = data.tokens || {};
      const access = tokens.access || data.access || data.token || data.access_token;
      const refresh = tokens.refresh || data.refresh || data.refresh_token;

      if (access) {
        localStorage.setItem('access_token', access);
        if (refresh) localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user_role', 'STUDENT');
        navigate('/profile/setup');
      } else {
        // If no tokens, they must login first to get authenticated for setup
        navigate('/login');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorData = err.response?.data;
      let msg = 'Registration failed. Please try again.';
      
      if (errorData) {
        if (typeof errorData === 'string') msg = errorData;
        else if (errorData.detail) msg = errorData.detail;
        else if (errorData.error) msg = errorData.error;
        else if (typeof errorData === 'object') {
          const firstKey = Object.keys(errorData)[0];
          const firstError = errorData[firstKey];
          msg = `${firstKey}: ${Array.isArray(firstError) ? firstError[0] : firstError}`;
        }
      }
      
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyData.registreCommerce) {
      const msg = 'Please upload your Registre de Commerce PDF.';
      setError(msg);
      toast.warning(msg);
      return;
    }

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('companyName', companyData.companyName);
    formData.append('email', companyData.email);
    formData.append('password', companyData.password);
    formData.append('phoneNumber', companyData.phoneNumber);
    formData.append('location', companyData.location);
    formData.append('description', companyData.description);
    formData.append('website', companyData.website);
    formData.append('registreCommerce', companyData.registreCommerce);

    try {
      const response = await api.post('/api/register/company/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const data = response.data;
      toast.success('Company registration submitted! Our team will review your application.');
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
      console.error('Company registration error:', err);
      const errorData = err.response?.data;
      let msg = 'Registration failed. Please try again.';
      
      if (errorData) {
        if (typeof errorData === 'string') msg = errorData;
        else if (errorData.detail) msg = errorData.detail;
        else if (errorData.error) msg = errorData.error;
        else if (typeof errorData === 'object') {
          const firstKey = Object.keys(errorData)[0];
          const firstError = errorData[firstKey];
          msg = `${firstKey}: ${Array.isArray(firstError) ? firstError[0] : firstError}`;
        }
      }
      
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden">
      <Toaster position="top-right" richColors />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 transition-transform group-hover:scale-125" />
            <span className="font-display font-bold text-xl text-navy-900 tracking-tight">Stag<span className="text-blue-600 italic">.io</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 hidden sm:block">Already have an account?</span>
            <Link to="/login" className="px-6 py-2.5 bg-paper text-navy-900 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-navy-900 hover:text-white transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
              <div className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 italic">Join the Bridge</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-navy-900 tracking-tight leading-[1.1] text-balance">
              Create Your <br />
              <span className="text-blue-600 italic">Professional Identity.</span>
            </h1>
            <p className="text-lg text-navy-900/40 font-medium max-w-md mx-auto">
              Join the national infrastructure connecting Algerian talent with high-impact professional experiences.
            </p>
          </div>

          {/* Type Toggle */}
          <div className="flex p-1.5 bg-paper rounded-[2rem] border border-gray-100 mb-12 max-w-sm mx-auto shadow-sm">
            <button 
              onClick={() => setType('student')}
              className={`flex-1 py-3.5 text-[11px] font-bold uppercase tracking-widest rounded-3xl transition-all ${type === 'student' ? 'bg-white text-blue-600 shadow-md shadow-navy-900/5' : 'text-navy-900/40 hover:text-navy-900'}`}
            >
              I am a Student
            </button>
            <button 
              onClick={() => setType('company')}
              className={`flex-1 py-3.5 text-[11px] font-bold uppercase tracking-widest rounded-3xl transition-all ${type === 'company' ? 'bg-white text-blue-600 shadow-md shadow-navy-900/5' : 'text-navy-900/40 hover:text-navy-900'}`}
            >
              I am a Company
            </button>
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

            <AnimatePresence mode="wait">
              {type === 'student' ? (
                <motion.form 
                  key="student"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleStudentSubmit} 
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">First Name</label>
                      <div className="relative group/field">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                          <User size={18} />
                        </div>
                        <input 
                          required
                          type="text"
                          value={studentData.firstName}
                          onChange={(e) => setStudentData({ ...studentData, firstName: e.target.value })}
                          placeholder="First Name"
                          className="w-full bg-paper border border-gray-100 rounded-[2rem] py-5 pl-16 pr-8 outline-none focus:border-blue-600/30 focus:ring-8 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">Last Name</label>
                      <div className="relative group/field">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                          <User size={18} />
                        </div>
                        <input 
                          required
                          type="text"
                          value={studentData.lastName}
                          onChange={(e) => setStudentData({ ...studentData, lastName: e.target.value })}
                          placeholder="Last Name"
                          className="w-full bg-paper border border-gray-100 rounded-[2rem] py-5 pl-16 pr-8 outline-none focus:border-blue-600/30 focus:ring-8 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">University Email (.dz)</label>
                    <div className="relative group/field">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                        <Mail size={18} />
                      </div>
                      <input 
                        required
                        type="email"
                        value={studentData.email}
                        onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                        placeholder="Exemple@univ-constantine2.dz"
                        className="w-full bg-paper border border-gray-100 rounded-[2rem] py-5 pl-16 pr-8 outline-none focus:border-blue-600/30 focus:ring-8 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">Password</label>
                      <div className="relative group/field">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                          <Lock size={18} />
                        </div>
                        <input 
                          required
                          type={showPassword ? "text" : "password"}
                          value={studentData.password}
                          onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
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

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">Phone Number</label>
                      <div className="relative group/field">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                          <Phone size={18} />
                        </div>
                        <input 
                          required
                          type="tel"
                          value={studentData.phoneNumber}
                          onChange={(e) => setStudentData({ ...studentData, phoneNumber: e.target.value })}
                          placeholder="0560 00 00 00"
                          className="w-full bg-paper border border-gray-100 rounded-[2rem] py-5 pl-16 pr-8 outline-none focus:border-blue-600/30 focus:ring-8 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">University Wilaya</label>
                       <div className="relative group/field">
                         <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                           <MapPin size={18} />
                         </div>
                         <select 
                           required
                           value={studentData.univWillaya}
                           onChange={(e) => setStudentData({ ...studentData, univWillaya: e.target.value })}
                           className="w-full bg-paper border border-gray-100 rounded-[2rem] py-5 pl-16 pr-12 outline-none focus:border-blue-600/30 focus:ring-8 focus:ring-blue-600/5 transition-all font-medium text-navy-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem_1.5rem] bg-[right_1.25rem_center] bg-no-repeat"
                         >
                           <option value="">Select Wilaya</option>
                           {ALGERIA_WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                         </select>
                       </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">University</label>
                      <div className="relative group/field">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                          <Building2 size={18} />
                        </div>
                        <select 
                          required
                          value={studentData.universityId}
                          onChange={(e) => handleUniversityChange(e.target.value)}
                          className="w-full bg-paper border border-gray-100 rounded-[2rem] py-5 pl-16 pr-12 outline-none focus:border-blue-600/30 focus:ring-8 focus:ring-blue-600/5 transition-all font-medium text-navy-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem_1.5rem] bg-[right_1.25rem_center] bg-no-repeat disabled:opacity-50"
                        >
                          <option value="">{isLoadingUniversities ? 'Loading...' : 'Select University'}</option>
                          {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                        {isLoadingUniversities && <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-600" />}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">Faculty</label>
                      <div className="relative group/field">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                          <Building2 size={18} />
                        </div>
                        <select 
                          required
                          disabled={!studentData.universityId || isLoadingFaculties}
                          value={studentData.facultyId}
                          onChange={(e) => handleFacultyChange(e.target.value)}
                          className="w-full bg-paper border border-gray-100 rounded-[2rem] py-5 pl-16 pr-12 outline-none focus:border-blue-600/30 focus:ring-8 focus:ring-blue-600/5 transition-all font-medium text-navy-900 appearance-none disabled:opacity-50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem_1.5rem] bg-[right_1.25rem_center] bg-no-repeat"
                        >
                          <option value="">{isLoadingFaculties ? 'Loading...' : 'Select Faculty'}</option>
                          {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                        {isLoadingFaculties && <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-600" />}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">Department</label>
                      <div className="relative group/field">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                          <GraduationCap size={18} />
                        </div>
                        <select 
                          required
                          disabled={!studentData.facultyId || isLoadingDepartments}
                          value={studentData.departmentId}
                          onChange={(e) => setStudentData({...studentData, departmentId: e.target.value})}
                          className="w-full bg-paper border border-gray-100 rounded-[2rem] py-5 pl-16 pr-12 outline-none focus:border-blue-600/30 focus:ring-8 focus:ring-blue-600/5 transition-all font-medium text-navy-900 appearance-none disabled:opacity-50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem_1.5rem] bg-[right_1.25rem_center] bg-no-repeat"
                        >
                          <option value="">{isLoadingDepartments ? 'Loading...' : 'Select Department'}</option>
                          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        {isLoadingDepartments && <Loader2 className="absolute right-12 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-600" />}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">Social Security Number</label>
                      <div className="relative group/field">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                          <CreditCard size={18} />
                        </div>
                        <input
                          type="text"
                          value={studentData.socialSecurityNumber}
                          onChange={(e) => setStudentData({...studentData, socialSecurityNumber: e.target.value})}
                          placeholder="1 99 25 75 123 456 78"
                          className="w-full bg-paper border border-gray-100 rounded-[2rem] py-5 pl-16 pr-8 outline-none focus:border-blue-600/30 focus:ring-8 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">ID Card Number</label>
                      <div className="relative group/field">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                          <CreditCard size={18} />
                        </div>
                        <input
                          required
                          type="text"
                          value={studentData.idCardNumber}
                          onChange={(e) => setStudentData({...studentData, idCardNumber: e.target.value})}
                          placeholder="123456789"
                          className="w-full bg-paper border border-gray-100 rounded-[2rem] py-5 pl-16 pr-8 outline-none focus:border-blue-600/30 focus:ring-8 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-8">
                    <button 
                      disabled={isLoading}
                      type="submit"
                      className="w-full py-6 bg-navy-900 text-white rounded-[2rem] font-bold text-[13px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-navy-900/10 active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-70"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Student Account <ArrowRight size={20} /></>}
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
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">Company Name</label>
                    <div className="relative group/field">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                        <Building2 size={18} />
                      </div>
                      <input 
                        required
                        type="text"
                        value={companyData.companyName}
                        onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                        placeholder="Sonatrach"
                        className="w-full bg-paper border border-gray-100 rounded-[2rem] py-5 pl-16 pr-8 outline-none focus:border-blue-600/30 focus:ring-8 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">Professional Email</label>
                      <div className="relative group/field">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                          <Mail size={18} />
                        </div>
                        <input 
                          required
                          type="email"
                          value={companyData.email}
                          onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                          placeholder="hr@company.dz"
                          className="w-full bg-paper border border-gray-100 rounded-[2rem] py-5 pl-16 pr-8 outline-none focus:border-blue-600/30 focus:ring-8 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">Password</label>
                      <div className="relative group/field">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                          <Lock size={18} />
                        </div>
                        <input 
                          required
                          type={showPassword ? "text" : "password"}
                          value={companyData.password}
                          onChange={(e) => setCompanyData({ ...companyData, password: e.target.value })}
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
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">Phone Number</label>
                      <div className="relative group/field">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                          <Phone size={18} />
                        </div>
                        <input 
                          required
                          type="tel"
                          value={companyData.phoneNumber}
                          onChange={(e) => setCompanyData({ ...companyData, phoneNumber: e.target.value })}
                          placeholder="021 00 00 00"
                          className="w-full bg-paper border border-gray-100 rounded-[2rem] py-5 pl-16 pr-8 outline-none focus:border-blue-600/30 focus:ring-8 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">Wilaya</label>
                      <div className="relative group/field">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                          <MapPin size={18} />
                        </div>
                        <select 
                          required
                          value={companyData.location}
                          onChange={(e) => setCompanyData({ ...companyData, location: e.target.value })}
                          className="w-full bg-paper border border-gray-100 rounded-[2rem] py-5 pl-16 pr-12 outline-none focus:border-blue-600/30 focus:ring-8 focus:ring-blue-600/5 transition-all font-medium text-navy-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236B7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem_1.5rem] bg-[right_1.25rem_center] bg-no-repeat"
                        >
                          <option value="">Select Wilaya</option>
                          {ALGERIA_WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">Website</label>
                    <div className="relative group/field">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                        <Globe size={18} />
                      </div>
                      <input 
                        required
                        type="url"
                        value={companyData.website}
                        onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                        placeholder="https://company.dz"
                        className="w-full bg-paper border border-gray-100 rounded-[2rem] py-5 pl-16 pr-8 outline-none focus:border-blue-600/30 focus:ring-8 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">
                      Registre de Commerce (PDF) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group/field">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
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
                        <div className="w-full bg-paper border border-gray-100 rounded-[2rem] py-5 pl-16 pr-8 outline-none focus-within:border-blue-600/30 focus-within:ring-8 focus-within:ring-blue-600/5 transition-all font-medium text-navy-900 min-h-[66px] flex items-center">
                          <span className={`block truncate ${!companyData.registreCommerce ? 'text-navy-900/20' : 'text-navy-900'}`}>
                            {companyData.registreCommerce ? companyData.registreCommerce.name : "Upload PDF Document"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 ml-6">Description</label>
                    <div className="relative group/field">
                      <div className="absolute left-6 top-6 text-navy-900/20 group-focus-within/field:text-blue-600 transition-colors">
                        <FileText size={18} />
                      </div>
                      <textarea 
                        required
                        value={companyData.description}
                        onChange={(e) => setCompanyData({ ...companyData, description: e.target.value })}
                        placeholder="Brief overview of your company and internship opportunities..."
                        rows={4}
                        className="w-full bg-paper border border-gray-100 rounded-[3rem] py-5 pl-16 pr-8 outline-none focus:border-blue-600/30 focus:ring-8 focus:ring-blue-600/5 transition-all font-medium text-navy-900 resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-8">
                    <button 
                      disabled={isLoading}
                      type="submit"
                      className="w-full py-6 bg-navy-900 text-white rounded-[2rem] font-bold text-[13px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-navy-900/10 active:scale-[0.98] flex items-center justify-center gap-4 disabled:opacity-70"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Register Company <ArrowRight size={20} /></>}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Register;