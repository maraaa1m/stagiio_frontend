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
import axios from 'axios';
import { toast, Toaster } from 'sonner';
import { jwtDecode } from 'jwt-decode';

interface AdminApplication {
  id: number;
  status: 'PENDING' | 'ACCEPTED' | 'REFUSED';
  matchingScore: number;
  appliedAt: string;
  student: {
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    photo?: string;
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
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REFUSED'>('ALL');
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
    const token = localStorage.getItem('access_token');

    // Extract dept from string like "Name (DEPT)"
    const extractDeptFromName = (name: string) => {
      if (!name || typeof name !== 'string') return '';
      const match = name.match(/\(([^)]+)\)/);
      return match ? match[1].toUpperCase().trim() : '';
    };

    try {
      // Assuming this endpoint exists or will be added to the backend
      const response = await axios.get('/api/admin/applications/', {
        headers: { Authorization: `Bearer ${token}` }
      });
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
          status: rawStatus,
          matchingScore: a.score || a.matchingScore || a.matching_score || 0,
          appliedAt: a.appliedAt || a.applied_date || a.created_at || a.date_applied || '',
          student: {
            firstName: (typeof studentObj === 'object' ? (studentObj.firstName || studentObj.first_name) : null) || a.student_first_name || a.first_name || studentName.split(' ')[0] || '',
            lastName: (typeof studentObj === 'object' ? (studentObj.lastName || studentObj.last_name) : null) || a.student_last_name || a.last_name || studentName.split(' ')[1] || '',
            email: (typeof studentObj === 'object' ? studentObj.email : null) || a.studentEmail || a.student_email || a.email || '',
            department: (typeof studentObj === 'object' ? (studentObj.department || studentObj.dept) : null) || a.student_department || a.department || a.dept || extractDeptFromName(studentName) || '',
            photo: (typeof studentObj === 'object' ? (studentObj.profile_photo?.url || studentObj.photo) : null) || a.profile_photo || a.student_photo || a.photo || ''
          },
          offer: {
            title: (typeof offerObj === 'object' ? (offerObj.title || offerObj.title) : null) || a.offerTitle || a.offer_title || a.title || 'Internship',
            companyName: (typeof companyObj === 'object' ? (companyObj.companyName || companyObj.company_name || companyObj.name) : null) || 
                         a.companyName || a.company_name || a.company || a.offer?.company_name || ''
          }
        };
      });

      // Frontend scoping: If not DEAN, only show applications for the admin's department
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

  const handleAutoValidate = async (app: AdminApplication) => {
    const id = app.id;
    setIsActionLoading(id);
    const token = localStorage.getItem('access_token');
    
    // Auto-generate defaults
    const now = new Date();
    const future = new Date();
    future.setMonth(now.getMonth() + 4);
    
    const payload = {
      start_date: now.toISOString().split('T')[0],
      end_date: future.toISOString().split('T')[0],
      topic: `Internship at ${app.offer.companyName}`,
      supervisor_name: 'Department Head'
    };

    try {
      const response = await axios.post(`/api/admin/validate/${id}/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const pdfUrl = response.data.pdf_url || response.data.pdfUrl || response.data.url;
      
      toast.success('Agreement validated automatically!');
      // Update local status or remove if we want it to leave the "Pending" view
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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-emerald-50 text-emerald-600 border-emerald-100/50';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100/50';
      case 'REFUSED': return 'bg-red-50 text-red-600 border-red-100/50';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const getDeptColor = (dept: string) => {
    const d = dept?.toUpperCase();
    if (d === 'TLSI') return 'bg-emerald-500';
    if (d === 'IFA') return 'bg-blue-500';
    if (d === 'MI') return 'bg-amber-500';
    return 'bg-gray-400';
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
          <Link to="/admin/companies" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <Building2 size={18} className="group-hover:scale-110 transition-transform" />
            Companies
          </Link>
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
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-black tracking-tight">Student Applications</h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mt-1">Review internships applications status</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Department Indicator */}
            {adminDept && (
              <div className="flex items-center gap-3 px-4 py-2 bg-paper border border-gray-100 rounded-2xl shadow-sm">
                <div className={`w-2 h-2 rounded-full ${getDeptColor(adminDept)} shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/60">
                  {adminDept === 'DEAN' ? 'Dean Office' : `${adminDept} Department`}
                </span>
              </div>
            )}

            <div className="relative group w-80">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-blue-600 transition-colors">
                <Search size={18} />
              </div>
              <input 
                type="text"
                placeholder="Search students, offers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-paper border border-gray-100 rounded-2xl py-3 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-black"
              />
            </div>
            <button className="relative p-3 bg-paper rounded-2xl text-black/40 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100">
              <Bell size={20} />
            </button>
          </div>
        </header>

        <div className="p-12 space-y-8 max-w-5xl mx-auto">
          {/* Filter Bar */}
          <div className="flex items-center gap-3 p-1.5 bg-paper rounded-2xl w-fit border border-gray-100">
            {[
              { id: 'ALL', label: 'All', icon: <ClipboardList size={14} /> },
              { id: 'PENDING', label: 'Pending', icon: <Clock size={14} /> },
              { id: 'ACCEPTED', label: 'Accepted', icon: <CheckCircle2 size={14} /> },
              { id: 'REFUSED', label: 'Rejected', icon: <XCircle size={14} /> }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                  statusFilter === tab.id ? 'bg-black text-white shadow-lg' : 'text-black/40 hover:text-black'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-24 bg-white rounded-[2rem] border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-white p-20 rounded-[3.5rem] border border-gray-100 text-center border-dashed">
              <div className="w-20 h-20 bg-paper rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-black/10">
                <ClipboardList size={40} />
              </div>
              <h4 className="text-xl font-display font-bold text-black mb-2">No applications found</h4>
              <p className="text-black/40 font-medium max-w-xs mx-auto">Try adjusting your filters or search query.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApplications.map((app, i) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group flex items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-5 min-w-0 flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-black overflow-hidden border border-gray-100 shrink-0 flex items-center justify-center">
                      {app.student.photo ? (
                        <img 
                          src={app.student.photo} 
                          alt={app.student.firstName} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-white font-bold text-xl uppercase">
                          {app.student.firstName[0]}{app.student.lastName[0]}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <h4 className="text-lg font-display font-bold text-black leading-tight group-hover:text-blue-600 transition-colors truncate">
                          {app.student.firstName} {app.student.lastName}
                        </h4>
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border bg-blue-50 text-blue-600 border-blue-100/50`}>
                          {app.student.department}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Briefcase size={12} className="text-black/30" />
                        <p className="text-[12px] font-bold text-black/60 truncate">
                          {app.offer.title} at <span className="text-blue-600">{app.offer.companyName}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-1">Status</p>
                      <div className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(app.status)}`}>
                        {app.status}
                      </div>
                    </div>
                    
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-1">Matching</p>
                      <p className="text-lg font-display font-bold text-black">{app.matchingScore}%</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {(app.status === 'ACCEPTED' || app.status === 'PENDING') && (
                        <button 
                          onClick={() => handleAutoValidate(app)}
                          disabled={isActionLoading === app.id}
                          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-navy-900 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isActionLoading === app.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <>
                              <FileText size={14} />
                              Validate
                            </>
                          )}
                        </button>
                      )}
                      <Link 
                        to={`/admin/students/${app.id}`} // Or a specific application view if available
                        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Validation Result Modal (Success only) */}
      <AnimatePresence>
        {validationResult.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setValidationResult(prev => ({ ...prev, isOpen: false }))}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 flex flex-col items-center text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2">
                <CheckCircle2 size={40} />
              </div>
              
              <div>
                <h3 className="text-2xl font-display font-bold text-navy-900 tracking-tight">Validation Complete</h3>
                <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 mt-1">Agreement generated for {validationResult.studentName}</p>
              </div>

              {validationResult.pdfUrl && (
                <a 
                  href={validationResult.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-navy-900 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  <FileText size={18} />
                  Download Generated PDF
                </a>
              )}

              <button 
                onClick={() => setValidationResult(prev => ({ ...prev, isOpen: false }))}
                className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 hover:text-navy-900 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminApplications;