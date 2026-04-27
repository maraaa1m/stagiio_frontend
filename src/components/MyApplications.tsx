import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Search, 
  ClipboardList, 
  User, 
  LogOut, 
  Bell, 
  Clock, 
  TrendingUp, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
  Plus,
  Download,
  AlertCircle
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'sonner';

interface Application {
  id: number;
  offerTitle: string;
  company: string;
  status: 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'VALIDATED';
  matchingScore: number;
  appliedAt: string;
  pdfUrl?: string;
  refusalReason?: string;
}

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      try {
        const response = await axios.get('/api/student/applications/', { headers });
        const data = Array.isArray(response.data) ? response.data : (response.data?.applications || []);
        
        // Map data to handle snake_case from Django
        const mapped = data.map((a: any) => ({
          id: a.id,
          status: (a.status || '').toUpperCase(),
          matchingScore: a.matchingScore || a.matching_score || 0,
          offerTitle: a.offer_title || a.offerTitle || a.offer || '',
          company: a.company_name || a.companyName || a.company || '',
          appliedAt: a.applied_date || a.appliedDate || a.application_date || a.created_at || '',
          pdfUrl: a.pdf_url || a.pdfUrl,
          refusalReason: a.refusal_reason || a.refusalReason
        }));

        setApplications(mapped);
      } catch (err) {
        console.error('Error fetching applications:', err);
        toast.error('Failed to load applications.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  const filteredApps = activeTab === 'ALL' 
    ? applications 
    : applications.filter(app => app.status === activeTab);

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'PENDING').length,
    accepted: applications.filter(a => a.status === 'ACCEPTED').length,
    refused: applications.filter(a => a.status === 'REFUSED').length,
    validated: applications.filter(a => a.status === 'VALIDATED').length
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'ACCEPTED': return 'bg-green-50 text-green-600 border-green-100';
      case 'REFUSED': return 'bg-red-50 text-red-500 border-red-100';
      case 'VALIDATED': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-navy-900 selection:bg-blue-600/10 selection:text-blue-600">
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
          
          <Link to="/student/dashboard" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
            Dashboard
          </Link>
          <Link to="/student/offers" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <Search size={18} className="group-hover:scale-110 transition-transform" />
            Search Offers
          </Link>
          <Link to="/student/applications" className="flex items-center gap-4 px-4 py-3.5 bg-blue-600 rounded-2xl text-[13px] font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 group">
            <ClipboardList size={18} className="group-hover:scale-110 transition-transform" />
            My Applications
          </Link>
          
          <div className="pt-8 pb-4 px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Quick Actions</p>
          </div>
          
          <button 
            onClick={() => navigate('/student/offers')}
            className="w-full flex items-center gap-4 px-4 py-3 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all">
              <Plus size={16} />
            </div>
            New Search
          </button>
          
          <div className="pt-8 pb-4 px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Account</p>
          </div>
          
          <Link to="/student/profile" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <User size={18} className="group-hover:scale-110 transition-transform" />
            My Profile
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
            <h2 className="text-2xl font-display font-bold text-navy-900 tracking-tight">My Applications</h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 mt-1">Track your internship journey</p>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-3 bg-paper rounded-2xl text-navy-900/40 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        <div className="p-12 space-y-10 max-w-7xl mx-auto">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Applied', value: stats.total, icon: <ClipboardList size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Pending', value: stats.pending, icon: <Clock size={20} />, color: 'text-orange-500', bg: 'bg-orange-50' },
              { label: 'Accepted', value: stats.accepted, icon: <CheckCircle2 size={20} />, color: 'text-green-500', bg: 'bg-green-50' },
              { label: 'Refused', value: stats.refused, icon: <XCircle size={20} />, color: 'text-red-500', bg: 'bg-red-50' },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm"
              >
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-900/30 mb-2">{stat.label}</p>
                  <h4 className="text-3xl font-display font-bold text-navy-900 tracking-tighter">{stat.value}</h4>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-paper rounded-2xl w-fit border border-gray-100">
            {['ALL', 'PENDING', 'ACCEPTED', 'REFUSED', 'VALIDATED'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-navy-900/40 hover:text-navy-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Applications List */}
          <div className="space-y-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-[3rem] border border-gray-100 animate-pulse" />
              ))
            ) : filteredApps.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center border-dashed"
              >
                <div className="w-20 h-20 bg-paper rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-navy-900/10">
                  <FileText size={40} />
                </div>
                <h4 className="text-xl font-display font-bold text-navy-900 mb-2">No applications yet</h4>
                <p className="text-navy-900/40 font-medium max-w-xs mx-auto mb-8">Start by searching for offers that match your skills and interests.</p>
                <button 
                  onClick={() => navigate('/student/offers')}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-navy-900 transition-all shadow-xl shadow-blue-600/20"
                >
                  Search Offers
                </button>
              </motion.div>
            ) : (
              filteredApps.map((app, i) => (
                <motion.div 
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-premium transition-all group relative overflow-hidden"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-navy-900 text-white flex items-center justify-center font-bold text-2xl shadow-xl shadow-navy-900/10 group-hover:bg-blue-600 transition-colors duration-500">
                        {app.company[0]}
                      </div>
                      <div>
                        <h4 className="text-xl font-display font-bold text-navy-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">{app.offerTitle}</h4>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30">{app.company}</p>
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-900/30 mb-2">Applied On</p>
                      <p className="text-sm font-bold text-navy-900 tracking-tight">{app.appliedAt}</p>
                    </div>

                    <div className="px-5 py-2.5 rounded-2xl border border-gray-100 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2.5 text-navy-900/40">
                      <TrendingUp size={14} className="text-blue-600" />
                      {app.matchingScore}% Match
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`px-6 py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-widest shadow-sm ${getStatusStyles(app.status)}`}>
                        {app.status}
                      </div>

                      {app.status === 'VALIDATED' && app.pdfUrl && (
                        <a 
                          href={app.pdfUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 bg-blue-600 text-white rounded-xl hover:bg-navy-900 transition-all shadow-lg shadow-blue-600/10"
                          title="Download Agreement"
                        >
                          <Download size={18} />
                        </a>
                      )}

                      {app.status === 'REFUSED' && app.refusalReason && (
                        <div className="group relative">
                          <div className="p-3 bg-red-50 text-red-500 rounded-xl cursor-help">
                            <AlertCircle size={18} />
                          </div>
                          <div className="absolute bottom-full right-0 mb-4 w-64 bg-navy-900 text-white p-4 rounded-2xl text-[11px] font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl z-50">
                            <p className="font-bold uppercase tracking-widest text-[9px] text-white/40 mb-2">Reason for refusal</p>
                            {app.refusalReason}
                            <div className="absolute top-full right-4 w-3 h-3 bg-navy-900 transform rotate-45 -translate-y-1.5" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyApplications;
