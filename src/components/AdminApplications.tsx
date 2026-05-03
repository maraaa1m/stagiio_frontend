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
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedDeptId = localStorage.getItem('department_id');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const dept = storedDeptId || decoded.department_id || decoded.department;
        setAdminDept(dept ? dept.toString() : 'DEAN');
        setIsSuperAdmin(!dept || dept === 'DEAN' || dept === 'null');
      } catch (e) {
        console.error('Error decoding token:', e);
        setAdminDept('DEAN');
        setIsSuperAdmin(true);
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
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-black selection:bg-blue-600/10 selection:text-blue-600">
      <Toaster position="top-right" richColors />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#060D1F] text-white flex flex-col z-50 border-r border-white/5">
        <div className="p-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-3 h-3 rounded-full bg-blue-600 group-hover:scale-125 transition-transform duration-500"></div>
            <span className="font-bold text-2xl tracking-tighter">Stag<span className="text-blue-600">.io</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-6 space-y-1.5">
          <div className="pb-4 px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Main Menu</p>
          </div>
          
          <Link to="/admin/dashboard" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
            Dashboard
          </Link>
          {isSuperAdmin && (
            <Link to="/admin/companies" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
              <Building2 size={18} className="group-hover:scale-110 transition-transform" />
              Companies
            </Link>
          )}
          <Link to="/admin/students" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <Users size={18} className="group-hover:scale-110 transition-transform" />
            Student Directory
          </Link>
          <Link to="/admin/applications" className="flex items-center gap-4 px-4 py-3.5 bg-blue-600 rounded-2xl text-[13px] font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 group">
            <ClipboardList size={18} className="group-hover:scale-110 transition-transform" />
            Student Applications
          </Link>
          <Link to="/admin/agreements" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <FileText size={18} className="group-hover:scale-110 transition-transform" />
            Agreements
          </Link>
          <Link to="/admin/statistics" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <BarChart3 size={18} className="group-hover:scale-110 transition-transform" />
            Statistics
          </Link>
        </nav>

        <div className="p-8 border-t border-white/5">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen">
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-40">
          <div>
            <h2 className="text-2xl font-display font-bold text-black tracking-tight">Student Applications</h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mt-1">Review and manage internship requests</p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Department Indicator */}
            {adminDept && (
              <div className="flex items-center gap-3 px-4 py-2 bg-paper border border-gray-100 rounded-2xl shadow-sm">
                <div className={`w-2 h-2 rounded-full ${adminDept === 'TLSI' ? 'bg-emerald-500' : adminDept === 'IFA' ? 'bg-blue-500' : adminDept === 'MI' ? 'bg-amber-500' : 'bg-gray-400'} shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">
                  {adminDept === 'DEAN' ? 'Dean Office' : `${adminDept} Department`}
                </span>
              </div>
            )}
            <div className="relative group w-96">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-blue-600 transition-colors">
                <Search size={18} />
              </div>
              <input 
                type="text"
                placeholder="Search students, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-paper border border-gray-100 rounded-2xl py-3.5 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-black"
              />
            </div>
            <button className="relative p-3 bg-paper rounded-2xl text-black/40 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100">
              <Bell size={20} />
            </button>
          </div>
        </header>

        <div className="p-12 space-y-10">
          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-3 p-1.5 bg-paper rounded-2xl w-fit border border-gray-100 overflow-x-auto">
              {[
                { id: 'ALL', label: 'All Applications' },
                { id: 'PENDING', label: 'Actions' },
                { id: 'ACCEPTED', label: 'Validated' },
                { id: 'PENDING_CERT', label: 'Pending Cert' },
                { id: 'COMPLETED', label: 'Completed' },
                { id: 'REFUSED', label: 'Archived' }
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    statusFilter === tab.id 
                    ? 'bg-black text-white shadow-lg' 
                    : 'text-black/40 hover:text-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-400">Total Entries</span>
                <span className="text-xl font-display font-bold text-blue-700">{filteredApplications.length}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600">
                <BarChart3 size={20} />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center border-dashed border-2">
              <div className="w-20 h-20 bg-paper rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-black/10">
                <ClipboardList size={40} />
              </div>
              <h4 className="text-xl font-display font-bold text-black mb-2">Workspace Empty</h4>
              <p className="text-black/40 font-medium max-w-sm mx-auto">No applications match your current filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app, i) => {
                const status = getStatusInfo(app.status);
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-premium transition-all group flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-paper overflow-hidden border border-gray-100 shrink-0 flex items-center justify-center transition-transform group-hover:scale-110">
                        {app.student.photo ? (
                          <img 
                            src={app.student.photo} 
                            alt={app.student.firstName} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-black/20 font-bold text-xl uppercase">
                            {(app.student.firstName?.[0] ?? '?')}{(app.student.lastName?.[0] ?? '')}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-display font-bold text-black leading-tight group-hover:text-blue-600 transition-colors">
                            {app.student.firstName} {app.student.lastName}
                          </h4>
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${
                             app.student.department?.toUpperCase() === 'TLSI' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                             app.student.department?.toUpperCase() === 'IFA' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                             'bg-gray-50 text-gray-400 border-gray-100'
                          }`}>
                            {app.student.department || 'DEPT'}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-black/40 mt-1 uppercase tracking-widest">
                          {app.offer.title} <span className="mx-1.5 opacity-30">•</span> <span className="text-blue-600">@ {app.offer.companyName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest mb-1">Matching</span>
                        <span className="text-lg font-display font-bold text-black">{app.matchingScore}%</span>
                      </div>

                      <div className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${status.color}`}>
                        {status.label}
                      </div>

                      <div className="flex items-center gap-2">
                        {app.status === 'ACCEPTED' && (
                          <button 
                            onClick={() => handleAutoValidate(app)}
                            disabled={isActionLoading === app.id}
                            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-black transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50"
                            title="Validate Agreement"
                          >
                            {isActionLoading === app.id ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                          </button>
                        )}
                        {app.status === 'PENDING_CERT' && (
                          <button 
                            onClick={() => handleIssueCertificate(app)}
                            disabled={isActionLoading === app.id}
                            className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-black transition-all shadow-lg shadow-emerald-600/10 disabled:opacity-50"
                            title="Issue Certificate"
                          >
                            {isActionLoading === app.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                          </button>
                        )}
                        <Link 
                          to={`/admin/students/${app.student.id}`}
                          className="p-3 bg-paper text-black/40 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-gray-100"
                          title="View Profile"
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