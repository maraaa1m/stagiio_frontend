import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  MapPin, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  FileText, 
  LayoutDashboard, 
  Building2, 
  ClipboardList, 
  BarChart3, 
  LogOut, 
  Bell,
  ArrowRight,
  Loader2,
  AlertCircle,
  Briefcase,
  XCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/api';
import { toast, Toaster } from 'sonner';
import { jwtDecode } from 'jwt-decode';

interface AdminApplication {
  id: number;
  internshipId?: number | null;
  status: 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'VALIDATED' | 'ONGOING' | 'PENDING_CERT' | 'COMPLETED';
  matchingScore: number;
  appliedAt: string;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    photo?: string;
    cvLink?: string;
  };
  offer: {
    title: string;
    companyName: string;
  };
}

const AdminApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'PENDING_CERT' | 'COMPLETED'>('ALL');
  const [adminDept, setAdminDept] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setAdminDept(decoded.department || 'DEAN');
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    const extractDeptFromName = (name: string) => {
      if (!name || typeof name !== 'string') return '';
      const match = name.match(/\(([^)]+)\)/);
      return match ? match[1].toUpperCase().trim() : '';
    };

    try {
      const response = await api.get('/api/admin/applications/');
      const data = Array.isArray(response.data) ? response.data : (response.data?.applications || response.data?.results || []);
      
      let mapped = data.map((a: any) => {
        const studentObj = a.student || a.user || a.student_details || {};
        const companyObj = a.company || a.company_details || a.offer?.company || {};
        const offerObj = a.offer || a.offer_details || {};
        
        const studentName = (typeof studentObj === 'object' ? `${studentObj.firstName || studentObj.first_name || ''} ${studentObj.lastName || studentObj.last_name || ''}`.trim() : String(studentObj || '')) || 
                          a.studentName || a.student_name ||
                          `${a.student_first_name || ''} ${a.student_last_name || ''}`.trim() || 
                          'Student';

        const rawStatus = (a.status || 'PENDING').toUpperCase();

        return {
          id: a.id,
          internshipId: a.internshipId || a.internship?.id || a.internship_id || null,
          status: rawStatus,
          matchingScore: a.score || a.matchingScore || a.matching_score || 0,
          appliedAt: a.appliedAt || a.applied_date || a.created_at || a.date_applied || '',
          student: {
            id: studentObj.id || a.student_id || a.studentId || 0,
            firstName: (typeof studentObj === 'object' ? (studentObj.firstName || studentObj.first_name) : null) || a.student_first_name || a.first_name || studentName.split(' ')[0] || '',
            lastName: (typeof studentObj === 'object' ? (studentObj.lastName || studentObj.last_name) : null) || a.student_last_name || a.last_name || studentName.split(' ')[1] || '',
            email: (typeof studentObj === 'object' ? studentObj.email : null) || a.studentEmail || a.student_email || a.email || '',
            department: (typeof studentObj === 'object' ? (studentObj.department || studentObj.dept) : null) || a.student_department || a.department || a.dept || extractDeptFromName(studentName) || '',
            photo: (typeof studentObj === 'object' ? (studentObj.profile_photo?.url || studentObj.photo) : null) || a.profile_photo || a.student_photo || a.photo || '',
            cvLink: (typeof studentObj === 'object' ? (studentObj.cvUrl || studentObj.cv_url || studentObj.cvFile || studentObj.cv_file || studentObj.cv) : null) || 
                    a.cvUrl || a.cv_url || a.cvFile || a.cv_file || a.cv || 
                    (studentObj.cv && typeof studentObj.cv === 'object' ? studentObj.cv.url : '') || 
                    (a.cv && typeof a.cv === 'object' ? a.cv.url : '') || ''
          },
          offer: {
            title: (typeof offerObj === 'object' ? (offerObj.title || offerObj.offerTitle || offerObj.offer_title) : null) || a.offerTitle || a.offer_title || a.title || 'Internship',
            companyName: (typeof companyObj === 'object' ? (companyObj.companyName || companyObj.company_name || companyObj.name) : null) || 
                         (typeof offerObj === 'object' ? (offerObj.companyName || offerObj.company_name || offerObj.company?.name || offerObj.company?.companyName) : null) ||
                         a.companyName || a.company_name || a.company || a.offer_company_name || ''
          }
        };
      });

      const tokenCached = localStorage.getItem('access_token');
      if (tokenCached) {
        try {
          const decoded: any = jwtDecode(tokenCached);
          const deptHead = String(decoded.department || 'DEAN').toUpperCase().trim();
          if (deptHead !== 'DEAN') {
            mapped = mapped.filter((a: any) => {
              const sDept = String(a.student.department || '').toUpperCase().trim();
              const studentFullName = `${a.student.firstName} ${a.student.lastName}`.toUpperCase();
              return sDept === deptHead || studentFullName.includes(`(${deptHead})`);
            });
          }
        } catch (e) {
          console.error("Applications filter error:", e);
        }
      }

      setApplications(mapped);
    } catch (err) {
      console.error('Error fetching applications:', err);
      toast.error('Failed to load application directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  const [validationResult, setValidationResult] = useState<{ isOpen: boolean; pdfUrl: string | null; studentName: string }>({
    isOpen: false,
    pdfUrl: null,
    studentName: ''
  });

  const handleIssueCertificate = async (app: AdminApplication) => {
    if (!app.internshipId) {
      toast.error('No internship linked to this application.');
      return;
    }
    setIsActionLoading(app.id);
    try {
      const response = await api.post(`/api/admin/internships/${app.internshipId}/issue-certificate/`, {});
      const pdfUrl = response.data.pdf_url || response.data.pdfUrl || response.data.url;
      toast.success('Certificate issued successfully!');
      setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'COMPLETED' } : a));
      if (pdfUrl) {
        window.open(pdfUrl, '_blank');
      }
    } catch (err) {
      toast.error('Failed to issue certificate.');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleAutoValidate = async (app: AdminApplication) => {
    const id = app.id;
    setIsActionLoading(id);
    
    const now = new Date();
    const future = new Date();
    future.setMonth(now.getMonth() + 4);
    
    const payload = {
      start_date: now.toISOString().split('T')[0],
      end_date: future.toISOString().split('T')[0],
      internshipTopic: `Internship at ${app.offer.companyName}`,
      supervisor_name: 'Department Head'
    };

    try {
      const response = await api.post(`/api/admin/validate/${id}/`, payload);
      
      const pdfUrl = response.data.pdf_url || response.data.pdfUrl || response.data.url;
      
      toast.success('Agreement validated automatically!');
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'ACCEPTED' as any } : a));

      if (pdfUrl) {
        setValidationResult({ 
          isOpen: true, 
          pdfUrl, 
          studentName: `${app.student.firstName} ${app.student.lastName}`
        });
      }
    } catch (err) {
      toast.error('Failed to validate agreement.');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  const filteredApplications = applications.filter(a => {
    const matchesSearch = `${a.student.firstName} ${a.student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.offer.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      a.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return { label: 'Validated', color: 'text-sage-700 bg-sage-50 border-sage-200' };
      case 'PENDING': return { label: 'Reviewing', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'REFUSED': return { label: 'Rejected', color: 'text-clay-700 bg-clay-50 border-clay-200' };
      case 'PENDING_CERT': return { label: 'Pending Cert', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'COMPLETED': return { label: 'Completed', color: 'text-green-700 bg-green-50 border-green-200' };
      default: return { label: status, color: 'text-stone-500 bg-stone-50 border-stone-200' };
    }
  };

  const getDeptColor = (dept: string) => {
    const d = dept?.toUpperCase();
    if (d === 'TLSI') return 'bg-sage-400';
    if (d === 'IFA') return 'bg-blue-400';
    if (d === 'MI') return 'bg-amber-400';
    return 'bg-stone-300';
  };

  return (
    <div className="min-h-screen bg-[#FBFAF7] flex font-sans text-stone-900 selection:bg-blue-100 selection:text-blue-700">
      <style>{`
        .bg-paper { background-color: #F3F0E9; }
        .text-sage-700 { color: #5B6E5B; }
        .bg-sage-50 { background-color: #F1F4EE; }
        .bg-sage-400 { background-color: #D1DBC8; }
        .border-sage-200 { border-color: #E2E8DC; }
        .text-clay-700 { color: #8B6B61; }
        .bg-clay-50 { background-color: #F4EEEC; }
        .border-clay-200 { border-color: #E8D7D0; }
        .shadow-soft { box-shadow: 0 4px 20px -4px rgba(0,0,0,0.05); }
        .shadow-bento { box-shadow: 0 10px 30px -5px rgba(115, 115, 115, 0.08); }
        .font-display { font-family: 'Inter', sans-serif; }
      `}</style>
      <Toaster position="top-right" richColors />

      {/* Human-Centric Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-white/50 backdrop-blur-xl border-r border-[#E8E4DB] flex flex-col z-50">
        <div className="p-10">
          <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
            <div className="w-3 h-3 rounded-full bg-blue-500 ring-8 ring-blue-50"></div>
            <span className="font-display font-bold text-2xl tracking-tighter text-stone-900">Stag<span className="text-blue-500 italic">.io</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          <div className="pb-6 px-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Management</p>
          </div>
          
          {[
            { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Overview' },
            { to: '/admin/companies', icon: <Building2 size={18} />, label: 'Partner Hub' },
            { to: '/admin/students', icon: <Users size={18} />, label: 'Talent Pool' },
            { to: '/admin/applications', icon: <ClipboardList size={18} />, label: 'Applications', active: true },
            { to: '/admin/agreements', icon: <FileText size={18} />, label: 'Legal Vault' },
          ].map((item) => (
            <Link 
              key={item.label}
              to={item.to} 
              className={`flex items-center gap-4 px-5 py-4 rounded-[2rem] text-[13px] font-bold tracking-tight transition-all group ${
                item.active 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                : 'text-stone-400 hover:text-stone-900 hover:bg-[#F3F0E9]'
              }`}
            >
              <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-8 border-t border-[#E8E4DB]">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 py-4 bg-paper hover:bg-stone-200 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all text-stone-500 hover:text-stone-900 border border-transparent hover:border-stone-300"
          >
            <LogOut size={16} />
            Security Exit
          </button>
        </div>
      </aside>

      {/* Main Experience */}
      <main className="flex-1 ml-72 min-h-screen flex flex-col">
        <header className="h-28 bg-[#FBFAF7]/80 backdrop-blur-xl flex items-center justify-between px-12 sticky top-0 z-40">
          <div className="flex flex-col">
            <h2 className="text-3xl font-display font-bold text-stone-900 tracking-tighter">Student Journeys</h2>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#B4ADA3]">Curation Engine</span>
              {adminDept && (
                <div className="flex items-center gap-2 px-3 py-1 bg-paper rounded-full border border-[#E8E4DB]">
                  <div className={`w-1.5 h-1.5 rounded-full ${getDeptColor(adminDept)}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-stone-500">
                    {adminDept === 'DEAN' ? 'University Dean' : `${adminDept} Department`}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group w-96">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-blue-500 transition-colors">
                <Search size={18} />
              </div>
              <input 
                type="text"
                placeholder="Lookup student, company or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E8E4DB] rounded-[2rem] py-4 pl-16 pr-8 outline-none focus:border-blue-500/20 focus:ring-8 focus:ring-blue-500/5 transition-all font-medium text-stone-900 shadow-soft"
              />
            </div>
          </div>
        </header>

        <div className="p-12 space-y-10 flex-1">
          {/* Bento Filter & Stats */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 bg-paper p-2.5 rounded-[3rem] border border-[#E8E4DB] flex items-center gap-2 w-fit overflow-x-auto">
              {[
                { id: 'ALL', label: 'Overview', icon: <ClipboardList size={14} /> },
                { id: 'PENDING', label: 'Action Required', icon: <Clock size={14} /> },
                { id: 'ACCEPTED', label: 'Approved', icon: <CheckCircle2 size={14} /> },
                { id: 'PENDING_CERT', label: 'Pending Cert', icon: <FileText size={14} /> },
                { id: 'COMPLETED', label: 'Completed', icon: <CheckCircle2 size={14} /> },
                { id: 'REFUSED', label: 'Archived', icon: <XCircle size={14} /> }
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-8 py-3.5 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.1em] transition-all flex items-center gap-2.5 shrink-0 ${
                    statusFilter === tab.id 
                    ? 'bg-white text-stone-900 shadow-bento border border-white' 
                    : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="col-span-12 lg:col-span-4 bg-blue-50 p-6 rounded-[3rem] border border-blue-100 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Total Pipeline</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-display font-bold text-blue-700">{filteredApplications.length}</p>
                  <p className="text-xs font-bold text-blue-400">active</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white shadow-soft flex items-center justify-center text-blue-600">
                <BarChart3 size={24} />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-white rounded-[3.5rem] border border-[#E8E4DB] animate-pulse" />
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-white p-32 rounded-[4rem] border border-[#E8E4DB] text-center border-dashed">
              <div className="w-24 h-24 bg-paper rounded-[3rem] shadow-soft flex items-center justify-center mx-auto mb-8 text-stone-200">
                <ClipboardList size={48} />
              </div>
              <h4 className="text-2xl font-display font-bold text-stone-900 mb-2">Workspace Empty</h4>
              <p className="text-stone-400 font-medium max-w-sm mx-auto">No student applications match your current refinement.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredApplications.map((app, i) => {
                const status = getStatusInfo(app.status);
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.6 }}
                    className="bg-white p-8 rounded-[3.5rem] border border-[#E8E4DB] shadow-soft hover:shadow-bento hover:border-blue-500/10 transition-all group relative overflow-hidden"
                  >
                    {/* Status Glow Overlay */}
                    <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] opacity-20 -mr-16 -mt-16 transition-colors ${
                      app.status === 'ACCEPTED' ? 'bg-sage-400' : app.status === 'PENDING' ? 'bg-amber-400' : 'bg-clay-400'
                    }`} />
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-8">
                        <div className="w-16 h-16 rounded-[2.2rem] bg-paper overflow-hidden border border-[#E8E4DB] transition-transform group-hover:scale-110 flex-shrink-0">
                          {app.student.photo ? (
                            <img 
                              src={app.student.photo} 
                              alt={app.student.firstName} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-400 font-bold text-xl uppercase">
                              {app.student.firstName[0]}{app.student.lastName[0]}
                            </div>
                          )}
                        </div>
                        <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-colors ${status.color}`}>
                          {status.label}
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-xl font-display font-bold text-stone-900 truncate">
                            {app.student.firstName} {app.student.lastName}
                          </h4>
                          <div className={`w-2 h-2 rounded-full ${getDeptColor(app.student.department)} shadow-sm`} />
                        </div>
                        <p className="text-[12px] font-bold text-stone-400 uppercase tracking-widest">
                          {app.student.department} Student
                        </p>
                      </div>

                      <div className="p-6 bg-paper rounded-[2.5rem] border border-[#E8E4DB] mb-8 grow">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 rounded-xl bg-white shadow-soft flex items-center justify-center text-blue-500">
                            <Briefcase size={16} />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-widest text-stone-900/60">Position Details</span>
                        </div>
                        <h5 className="font-bold text-stone-900 leading-tight mb-1">{app.offer.title}</h5>
                        <p className="text-sm font-medium text-blue-600">@ {app.offer.companyName}</p>
                        
                        <div className="mt-4 pt-4 border-t border-[#E8E4DB]/50 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Score</span>
                          <span className="text-lg font-display font-bold text-stone-900">{app.matchingScore}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <a 
                          href={app.student.cvLink || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-4 bg-white text-stone-400 rounded-3xl hover:bg-stone-900 hover:text-white transition-all shadow-soft border border-[#E8E4DB] flex-1 flex items-center justify-center gap-2 group"
                        >
                          <FileText size={18} className="group-hover:rotate-12 transition-transform" />
                          <span className="text-[11px] font-black uppercase tracking-widest">Portfolio</span>
                        </a>
                        {(app.status === 'ACCEPTED') && (
                          <button 
                            onClick={() => handleAutoValidate(app)}
                            disabled={isActionLoading === app.id}
                            className="p-4 bg-blue-600 text-white rounded-3xl hover:bg-stone-900 transition-all shadow-xl shadow-blue-600/20 flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isActionLoading === app.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 size={18} />
                                <span className="text-[11px] font-black uppercase tracking-widest">Authorize</span>
                              </>
                            )}
                          </button>
                        )}
                        {app.status === 'PENDING_CERT' && (
                          <button 
                            onClick={() => handleIssueCertificate(app)}
                            disabled={isActionLoading === app.id}
                            className="p-4 bg-green-600 text-white rounded-3xl hover:bg-stone-900 transition-all shadow-xl shadow-green-600/20 flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isActionLoading === app.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 size={18} />
                                <span className="text-[11px] font-black uppercase tracking-widest">Issue Cert</span>
                              </>
                            )}
                          </button>
                        )}
                        <Link 
                          to={`/admin/students/${app.student.id}`}
                          className="p-4 bg-paper text-stone-600 rounded-3xl hover:bg-blue-600 hover:text-white transition-all border border-[#E8E4DB]"
                        >
                          <ArrowRight size={18} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Warm AI Validation Modal */}
      <AnimatePresence>
        {validationResult.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setValidationResult(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-lg bg-[#FBFAF7] rounded-[4rem] shadow-2xl p-12 flex flex-col items-center text-center space-y-8 overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />
              
              <div className="w-24 h-24 rounded-[3rem] bg-sage-50 text-sage-700 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-[3rem] bg-sage-400/20 blur-xl animate-pulse" />
                <CheckCircle2 size={48} className="relative z-10" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-3xl font-display font-bold text-stone-900 tracking-tight leading-tight">Agreement Published</h3>
                <p className="text-[11px] font-black uppercase tracking-widest text-stone-400 italic">Smart System generated document for {validationResult.studentName}</p>
              </div>

              {validationResult.pdfUrl && (
                <div className="w-full space-y-3">
                  <a 
                    href={validationResult.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-5 bg-stone-900 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-stone-900/10 flex items-center justify-center gap-3 group"
                  >
                    <FileText size={20} className="group-hover:scale-110 transition-transform" />
                    Secure Download
                  </a>
                  <button 
                    onClick={() => setValidationResult(prev => ({ ...prev, isOpen: false }))}
                    className="w-full py-5 bg-paper text-stone-500 rounded-[2rem] font-black text-[11px] uppercase tracking-widest border border-[#E8E4DB] hover:bg-stone-200 transition-all"
                  >
                    Dismiss Workspace
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminApplications;