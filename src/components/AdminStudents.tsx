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
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'sonner';
import { jwtDecode } from 'jwt-decode';

interface AdminStudent {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  isPlaced: boolean;
  cvLink?: string;
  photo?: string;
  universityWilaya?: string;
}

const AdminStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PLACED' | 'SEEKING'>('ALL');
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
      const response = await axios.get('/api/admin/students/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(response.data) ? response.data : (response.data?.students || response.data?.results || []);
      
      let mapped = data.map((s: any) => {
        const studentObj = s.student || s.user || s || {};
        const studentName = (typeof studentObj === 'object' ? `${studentObj.firstName || studentObj.first_name || ''} ${studentObj.lastName || studentObj.last_name || ''}`.trim() : studentObj) || '';
        
        return {
          id: s.id || studentObj.id,
          firstName: studentObj.firstName || studentObj.first_name || studentName.split(' ')[0] || '',
          lastName: studentObj.lastName || studentObj.last_name || studentName.split(' ')[1] || '',
          email: studentObj.email || '',
          department: studentObj.department || studentObj.student_department || s.student_department || s.department || extractDeptFromName(studentName) || '',
          isPlaced: s.isPlaced || s.is_placed || studentObj.isPlaced || studentObj.is_placed || false,
          cvLink: s.cvFile || s.cv_file || s.cv || studentObj.cvFile || studentObj.cv_file || studentObj.cv || '',
          photo: studentObj.profile_photo?.url || studentObj.profile_photo || studentObj.photo || studentObj.profilePhoto || s.photo || '',
          universityWilaya: s.universityWilaya || s.wilaya || studentObj.wilaya || studentObj.universityWilaya || ''
        };
      });

      // Frontend scoping: If not DEAN, only show students for the admin's department
      const tokenCached = localStorage.getItem('access_token');
      if (tokenCached) {
        try {
          const decoded: any = jwtDecode(tokenCached);
          const deptHead = String(decoded.department || 'DEAN').toUpperCase().trim();
          if (deptHead !== 'DEAN') {
            mapped = mapped.filter((s: any) => {
              const sDept = String(s.department || '').toUpperCase().trim();
              return sDept === deptHead;
            });
          }
        } catch (e) {
          console.error("Students filter error:", e);
        }
      }

      setStudents(mapped);
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Failed to load student directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'PLACED' ? s.isPlaced :
      !s.isPlaced;

    return matchesSearch && matchesStatus;
  });

  const getDeptStyle = (dept: string) => {
    const d = dept?.toUpperCase();
    if (d === 'TLSI') return 'bg-emerald-50 text-emerald-600 border-emerald-100/50';
    if (d === 'IFA') return 'bg-blue-50 text-blue-600 border-blue-100/50';
    if (d === 'MI') return 'bg-amber-50 text-amber-600 border-amber-100/50';
    return 'bg-gray-50 text-gray-500 border-gray-100';
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
          <Link to="/admin/students" className="flex items-center gap-4 px-4 py-3.5 bg-blue-600 rounded-2xl text-[13px] font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 group">
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
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-40">
          <div>
            <h2 className="text-2xl font-display font-bold text-black tracking-tight">Student Directory</h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mt-1">Manage and track student placements</p>
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
                placeholder="Search students, departments..."
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

        <div className="p-12 space-y-8 max-w-5xl mx-auto">
          {/* Filter Bar */}
          <div className="flex items-center gap-3 p-1.5 bg-paper rounded-2xl w-fit border border-gray-100">
            <button 
              onClick={() => setStatusFilter('ALL')}
              className={`px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                statusFilter === 'ALL' ? 'bg-black text-white shadow-lg' : 'text-black/40 hover:text-black'
              }`}
            >
              All Students
            </button>
            <button 
              onClick={() => setStatusFilter('PLACED')}
              className={`px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                statusFilter === 'PLACED' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-black/40 hover:text-emerald-600'
              }`}
            >
              <CheckCircle2 size={14} />
              Placed
            </button>
            <button 
              onClick={() => setStatusFilter('SEEKING')}
              className={`px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                statusFilter === 'SEEKING' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-black/40 hover:text-blue-600'
              }`}
            >
              <Clock size={14} />
              Seeking
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-24 bg-white rounded-[2rem] border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-white p-20 rounded-[3.5rem] border border-gray-100 text-center border-dashed">
              <div className="w-20 h-20 bg-paper rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-black/10">
                <Users size={40} />
              </div>
              <h4 className="text-xl font-display font-bold text-black mb-2">No students found</h4>
              <p className="text-black/40 font-medium max-w-xs mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStudents.map((student, i) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group flex items-center justify-between gap-6"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-black overflow-hidden border border-gray-100 shrink-0 flex items-center justify-center">
                      {student.photo && student.photo !== 'null' && student.photo !== 'undefined' ? (
                        <img 
                          src={student.photo} 
                          alt={student.firstName} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-white font-bold text-xl uppercase">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="text-lg font-display font-bold text-black leading-tight group-hover:text-blue-600 transition-colors truncate">
                          {student.firstName} {student.lastName}
                        </h4>
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border ${getDeptStyle(student.department)}`}>
                          {student.department}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-black/40 truncate mt-1">
                        {student.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 shrink-0">
                    <div className="hidden md:block">
                      {student.isPlaced ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/50">
                          <CheckCircle2 size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Placed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100/50">
                          <Clock size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Seeking</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {student.cvLink ? (
                        <a 
                          href={student.cvLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          title="View Official CV"
                        >
                          <FileText size={18} />
                        </a>
                      ) : (
                        <div 
                          className="p-3 bg-paper text-black/10 rounded-xl cursor-not-allowed border border-gray-100"
                          title="No CV Uploaded"
                        >
                          <FileText size={18} />
                        </div>
                      )}
                      <Link 
                        to={`/admin/students/${student.id}`}
                        className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="View Profile"
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
    </div>
  );
};

export default AdminStudents;