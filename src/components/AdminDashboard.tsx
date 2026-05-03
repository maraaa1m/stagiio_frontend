import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Building2, 
  ClipboardList, 
  BarChart3, 
  LogOut, 
  Bell, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  X, 
  Loader2, 
  AlertCircle,
  MapPin,
  Clock,
  TrendingUp,
  FileText,
  User,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/api';
import { toast, Toaster } from 'sonner';
import { jwtDecode } from 'jwt-decode';

interface AdminStats {
  totalStudents: number;
  placedStudents: number;
  unplacedStudents: number;
  totalCompanies: number;
  totalOffers: number;
  pendingAgreements: number;
  acceptedApplications?: number;
}

interface PendingCompany {
  id: number;
  companyName: string;
  email: string;
  wilaya: string;
  registreCommerce?: string;
}

interface PendingAgreement {
  id: number;
  student: string;
  studentId?: number;
  studentEmail: string;
  studentPhoto?: string;
  studentDepartment?: string;
  company: string;
  offer: string;
  score: number;
  startDate?: string;
  endDate?: string;
  topic?: string;
  supervisorName?: string;
}

interface PendingCertification {
  id: number;
  studentName: string;
  studentEmail: string;
  studentPhoto?: string;
  companyName: string;
  offerTitle: string;
  endDate: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingCompanies, setPendingCompanies] = useState<PendingCompany[]>([]);
  const [pendingAgreements, setPendingAgreements] = useState<PendingAgreement[]>([]);
  const [pendingCerts, setPendingCerts] = useState<PendingCertification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  
  const [companyModal, setCompanyModal] = useState<{ isOpen: boolean; company: PendingCompany | null }>({
    isOpen: false,
    company: null
  });

  const [validationModal, setValidationModal] = useState<{ isOpen: boolean; agreement: PendingAgreement | null }>({
    isOpen: false,
    agreement: null
  });
  const [validationData, setValidationData] = useState({
    startDate: '',
    endDate: '',
    topic: '',
    supervisorName: ''
  });
  const [adminDept, setAdminDept] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedDeptId = localStorage.getItem('department_id');
    
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        // Dean Mode: If department_id is null or 'DEAN', it unlocks restricted view
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
    
    // Extract dept from string like "Name (DEPT)"
    const extractDeptFromName = (name: string) => {
      if (!name || typeof name !== 'string') return '';
      const match = name.match(/\(([^)]+)\)/);
      return match ? match[1].toUpperCase().trim() : '';
    };

    const fetchStats = async () => {
      try {
        const statsRes = await api.get('/api/admin/statistics/');
        const sData = statsRes.data;
        setStats({
          totalStudents: sData.total_students || sData.totalStudents || 0,
          placedStudents: sData.placed_students || sData.placedStudents || 0,
          unplacedStudents: sData.unplaced_students || sData.unplacedStudents || 0,
          totalCompanies: sData.total_companies || sData.totalCompanies || 0,
          totalOffers: sData.total_offers || sData.totalOffers || 0,
          pendingAgreements: sData.pending_agreements || sData.pendingAgreements || 0,
          acceptedApplications: sData.accepted_applications || sData.acceptedApplications || 0
        });
      } catch (err) {
        console.error('Error fetching statistics:', err);
      }
    };

    const fetchCompanies = async () => {
      try {
        const companiesRes = await api.get('/api/admin/companies/pending/');
        setPendingCompanies(Array.isArray(companiesRes.data) ? companiesRes.data.map((c: any) => ({
          id: c.id,
          companyName: c.companyName || c.company_name || '',
          email: c.email || '',
          wilaya: c.location || c.wilaya || '',
          registreCommerce: c.registreCommerce || c.registre_commerce || c.photo || ''
        })) : (companiesRes.data?.companies || []));
      } catch (err) {
        console.error('Error fetching companies:', err);
      }
    };

    const fetchAgreements = async () => {
      try {
        const agreementsRes = await api.get('/api/admin/pending-validations/');
        const data = Array.isArray(agreementsRes.data) ? agreementsRes.data : (agreementsRes.data?.agreements || agreementsRes.data?.results || agreementsRes.data?.applications || []);

        setPendingAgreements(data.map((a: any) => {
          const studentObj = a.student || a.user || {};
          const companyObj = a.company || {};
          const offerObj = a.offer || {};
          
          const studentName = (typeof studentObj === 'object' ? `${studentObj.firstName || studentObj.first_name || ''} ${studentObj.lastName || studentObj.last_name || ''}`.trim() : String(studentObj || '')) || 
                   a.studentName || 
                   `${a.student_first_name || ''} ${a.student_last_name || ''}`.trim() || 
                   'Student';

          const dept = (typeof studentObj === 'object' ? (studentObj.department?.name || studentObj.department || studentObj.dept) : null) || a.student_department || a.department || a.dept || '';

          return {
            id: a.id,
            student: studentName,
            studentId: studentObj.id || a.student_id || a.studentId || 0,
            studentEmail: (typeof studentObj === 'object' ? studentObj.email : null) || a.studentEmail || a.student_email || a.email || '',
            studentPhoto: (typeof studentObj === 'object' ? (studentObj.profile_photo?.url || studentObj.photo) : null) || a.student_photo || a.photo || '',
            studentDepartment: typeof dept === 'object' ? (dept.name || '') : String(dept || ''),
            company: (typeof companyObj === 'object' ? (companyObj.name || companyObj.companyName || companyObj.company_name) : String(companyObj || '')) || a.companyName || a.company_name || '',
            offer: (typeof offerObj === 'object' ? (offerObj.title || offerObj.offerTitle || offerObj.offer_title) : String(offerObj || '')) || a.offerTitle || a.offer_title || '',
            score: a.score || a.matchingScore || a.matching_score || 0,
            startDate: a.startDate || a.start_date || '',
            endDate: a.endDate || a.end_date || '',
            topic: a.topic || '',
            supervisorName: a.supervisorName || a.supervisor_name || ''
          };
        }).filter((a: any) => {
          const storedDeptId = localStorage.getItem('department_id');
          // Dean Mode Rule: If department_id is null or 'DEAN', unlock full view
          if (!storedDeptId || storedDeptId === 'DEAN') return true;
          
          const deptHead = storedDeptId.toUpperCase().trim();
          const sDept = String(a.studentDepartment || '').toUpperCase().trim();
          
          // Check if student belongs to the admin's department
          return sDept === deptHead || a.student.toUpperCase().includes(`(${deptHead})`);
        }));
      } catch (err) {
        console.error('Error fetching agreements:', err);
      }
    };

    const fetchPendingCertifications = async () => {
      try {
        const certsRes = await api.get('/api/admin/pending-certifications/');
        const data = Array.isArray(certsRes.data) ? certsRes.data : (certsRes.data?.results || []);
        setPendingCerts(data.map((c: any) => ({
          id: c.internship?.id || c.internshipId || c.internship_id || c.id,
          studentName: `${c.student?.firstName || c.student?.first_name || ''} ${c.student?.lastName || c.student?.last_name || ''}`.trim() || c.student || 'Student',
          studentEmail: c.student?.email || c.studentEmail || '',
          studentPhoto: c.student?.profile_photo || c.student?.photo || '',
          companyName: c.company_name || c.company?.companyName || c.company || '',
          offerTitle: c.offer?.title || c.offerTitle || c.offer || '',
          endDate: c.internship?.endDate || c.internship?.end_date || c.end_date || c.endDate || '',
        })));
      } catch (err) {
        console.error('Error fetching pending certs:', err);
      }
    };

    try {
      await Promise.allSettled([
        fetchStats(),
        fetchCompanies(),
        fetchAgreements(),
        fetchPendingCertifications()
      ]);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toast.error('Failed to load dashboard components.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveCompany = async (id: number) => {
    setIsActionLoading(id);
    try {
      await api.put(`/api/admin/companies/${id}/approve/`, {});
      toast.success('Company approved!');
      setPendingCompanies(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      toast.error('Failed to approve company.');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleRefuseCompany = async (id: number) => {
    setIsActionLoading(id);
    try {
      await api.put(`/api/admin/companies/${id}/refuse/`, {});
      toast.success('Company refused.');
      setPendingCompanies(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      toast.error('Failed to refuse company.');
    } finally {
      setIsActionLoading(null);
    }
  };

  const [validationResult, setValidationResult] = useState<{ isOpen: boolean; pdfUrl: string | null; studentName: string }>({
    isOpen: false,
    pdfUrl: null,
    studentName: ''
  });

  const handleAutoValidate = async (agreement: PendingAgreement) => {
    const id = agreement.id;
    setIsActionLoading(id);
    
    // Auto-generate defaults
    const now = new Date();
    const future = new Date();
    future.setMonth(now.getMonth() + 4);
    
    const payload = {
      start_date: now.toISOString().split('T')[0],
      end_date: future.toISOString().split('T')[0],
      internshipTopic: agreement.topic || `Internship at ${agreement.company}`,
      supervisor_name: agreement.supervisorName || 'Department Head'
    };

    try {
      const response = await api.post(`/api/admin/validate/${id}/`, payload);
      
      const pdfUrl = response.data.pdf_url || response.data.pdfUrl || response.data.url;
      
      toast.success('Agreement validated automatically!');
      setPendingAgreements(prev => prev.filter(a => a.id !== id));

      if (pdfUrl) {
        setValidationResult({ 
          isOpen: true, 
          pdfUrl, 
          studentName: agreement.student 
        });
      }
    } catch (err) {
      toast.error('Failed to validate agreement.');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleIssueCertificate = async (internshipId: number) => {
    setIsActionLoading(internshipId);
    try {
      const response = await api.post(`/api/admin/internships/${internshipId}/issue-certificate/`, {});
      const pdfUrl = response.data.pdf_certificate || response.data.pdfUrl || response.data.url;
      toast.success('Certificate issued successfully!');
      setPendingCerts(prev => prev.filter(c => c.id !== internshipId));
      
      if (pdfUrl) {
        window.open(pdfUrl, '_blank');
      }
    } catch (err) {
      toast.error('Failed to issue certificate.');
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
          
          <Link to="/admin/dashboard" className="flex items-center gap-4 px-4 py-3.5 bg-blue-600 rounded-2xl text-[13px] font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 group">
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
          <Link to="/admin/applications" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
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
        {/* Top Bar */}
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-40">
          <div>
            <h2 className="text-2xl font-display font-bold text-black tracking-tight">University Admin</h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mt-1">Platform management and validation</p>
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
            <Link to="/notifications" className="relative p-3 bg-paper rounded-2xl text-black/40 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
            </Link>
          </div>
        </header>

        <div className="p-12 space-y-12 max-w-7xl mx-auto">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {[
              { label: 'Total Students', value: stats?.totalStudents || 0, icon: <Users size={18} />, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Placed', value: stats?.placedStudents || 0, icon: <CheckCircle2 size={18} />, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Unplaced', value: stats?.unplacedStudents || 0, icon: <AlertCircle size={18} />, color: 'text-orange-500', bg: 'bg-orange-50' },
              { label: 'Companies', value: stats?.totalCompanies || 0, icon: <Building2 size={18} />, color: 'text-purple-500', bg: 'bg-purple-50' },
              { label: 'Total Offers', value: stats?.totalOffers || 0, icon: <Briefcase size={18} />, color: 'text-black', bg: 'bg-paper' },
              { label: 'Agreements', value: stats?.pendingAgreements || 0, icon: <ClipboardList size={18} />, color: 'text-red-500', bg: 'bg-red-50' },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm"
              >
                <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 mb-1">{stat.label}</p>
                  <h4 className="text-xl font-display font-bold text-black tracking-tight">{stat.value}</h4>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-12">
            {/* Pending Companies - Dean Mode Only */}
            {(!adminDept || adminDept === 'DEAN') && (
              <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-black tracking-tight">Awaiting Approval</h3>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mt-1">New company registrations</p>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  {isLoading ? (
                    Array(2).fill(0).map((_, i) => (
                      <div key={i} className="h-32 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
                    ))
                  ) : pendingCompanies.length === 0 ? (
                    <div className="bg-white p-12 rounded-[3rem] border border-gray-100 text-center border-dashed">
                      <p className="text-black/30 font-bold uppercase tracking-widest text-[11px]">No pending companies</p>
                    </div>
                  ) : (
                    pendingCompanies.map((company, i) => (
                      <motion.div 
                        key={company.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-premium transition-all group"
                      >
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-paper text-black flex items-center justify-center font-bold text-xl">
                              {company.companyName[0]}
                            </div>
                            <div>
                              <h4 className="text-lg font-display font-bold text-black leading-tight mb-1">{company.companyName}</h4>
                              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-black/30">
                                <span className="flex items-center gap-1.5"><MapPin size={12} /> {company.wilaya}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-200" />
                                <span>{company.email}</span>
                              </div>
                              {company.registreCommerce && (
                                <div className="mt-2.5">
                                  <a 
                                    href={company.registreCommerce}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-bold uppercase tracking-widest border border-blue-100/30 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 inline-flex"
                                  >
                                    <FileText size={12} />
                                    Verify License
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setCompanyModal({ isOpen: true, company })}
                              className="px-5 py-2.5 bg-navy-900 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2"
                            >
                              Verify
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Pending Validations - Dept Head & Dean Mode */}
            {adminDept && (
              <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-black tracking-tight">Pending Validations</h3>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mt-1">Internship agreements to generate</p>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  {isLoading ? (
                    Array(2).fill(0).map((_, i) => (
                      <div key={i} className="h-40 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
                    ))
                  ) : pendingAgreements.length === 0 ? (
                    <div className="bg-white p-12 rounded-[3rem] border border-gray-100 text-center border-dashed">
                      <p className="text-black/30 font-bold uppercase tracking-widest text-[11px]">No pending validations</p>
                    </div>
                  ) : (
                    pendingAgreements.map((agreement, i) => (
                      <motion.div 
                        key={agreement.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-premium transition-all group"
                      >
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-black overflow-hidden flex items-center justify-center text-white font-bold">
                                {agreement.studentPhoto ? (
                                  <img src={agreement.studentPhoto} alt={agreement.student} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  agreement.student[0]
                                )}
                              </div>
                              <div>
                                <Link to={`/admin/students/${agreement.studentId || agreement.id}`} className="hover:text-blue-600 transition-colors">
                                  <h4 className="font-bold text-black">{agreement.student}</h4>
                                </Link>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">{agreement.studentEmail}</p>
                              </div>
                            </div>
                            <div className="px-3 py-1.5 bg-green-50 text-green-600 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                              {agreement.score}% Match
                            </div>
                          </div>

                          <div className="p-4 bg-paper rounded-2xl space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Internship at</p>
                            <p className="text-sm font-bold text-black">{agreement.company}</p>
                            <p className="text-xs font-medium text-black/60">{agreement.offer}</p>
                          </div>

                          <button 
                            onClick={() => handleAutoValidate(agreement)}
                            disabled={isActionLoading === agreement.id}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-navy-900 transition-all shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isActionLoading === agreement.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <>
                                <FileText size={16} />
                                Validate (Quick)
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Awaiting Certification - All Admins */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h3 className="text-2xl font-display font-bold text-navy-900 tracking-tight">Awaiting Certification</h3>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 mt-1">Completed internships waiting for final documents</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoading ? (
                  Array(2).fill(0).map((_, i) => (
                    <div key={i} className="h-40 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
                  ))
                ) : pendingCerts.length === 0 ? (
                  <div className="md:col-span-2 bg-white p-12 rounded-[3rem] border border-gray-100 text-center border-dashed">
                    <p className="text-navy-900/30 font-bold uppercase tracking-widest text-[11px]">No pending certifications</p>
                  </div>
                ) : (
                  pendingCerts.map((cert, i) => (
                    <motion.div 
                      key={cert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm transition-all"
                    >
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-black overflow-hidden flex items-center justify-center text-white font-bold">
                            {cert.studentPhoto ? (
                              <img src={cert.studentPhoto} alt={cert.studentName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              cert.studentName[0]
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-navy-900">{cert.studentName}</h4>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30">{cert.studentEmail}</p>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-navy-900/40">Internship Details</p>
                          <p className="text-sm font-bold text-navy-900">{cert.companyName}</p>
                          <p className="text-xs text-navy-900/60">{cert.offerTitle}</p>
                        </div>

                        <button 
                          onClick={() => handleIssueCertificate(cert.id)}
                          disabled={isActionLoading === cert.id}
                          className="w-full py-4 bg-navy-900 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-navy-900/10"
                        >
                          {isActionLoading === cert.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                          Issue Final Certificate
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </div>
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

      {/* Company Verification Modal */}
      <AnimatePresence>
        {companyModal.isOpen && companyModal.company && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCompanyModal({ isOpen: false, company: null })}
              className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] p-10 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <Building2 size={32} />
              </div>
              
              <h3 className="text-2xl font-display font-bold text-navy-900 mb-2">Legal Audit: {companyModal.company.companyName}</h3>
              <p className="text-navy-900/50 font-medium mb-8">
                Perform a legal check on this company registration before allowing them to post internship offers.
              </p>

              <div className="space-y-6">
                <div className="p-6 bg-paper rounded-[2rem] space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-900/30">Primary Verification</p>
                  <a 
                    href={companyModal.company.registreCommerce}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-between p-4 bg-white border border-blue-100 rounded-2xl hover:border-blue-600 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-navy-900">Registre de Commerce (PDF)</p>
                        <p className="text-[10px] text-navy-900/30 font-bold uppercase tracking-widest">Legal Document Proof</p>
                      </div>
                    </div>
                    <ArrowRight size={20} className="text-blue-600" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      handleApproveCompany(companyModal.company!.id);
                      setCompanyModal({ isOpen: false, company: null });
                    }}
                    disabled={isActionLoading === companyModal.company.id}
                    className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-navy-900 transition-all shadow-xl shadow-green-600/20 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    Approve Company
                  </button>
                  <button
                    onClick={() => {
                      handleRefuseCompany(companyModal.company!.id);
                      setCompanyModal({ isOpen: false, company: null });
                    }}
                    disabled={isActionLoading === companyModal.company.id}
                    className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-red-50 transition-all border border-red-100 flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;