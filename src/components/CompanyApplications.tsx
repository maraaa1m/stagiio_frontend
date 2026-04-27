import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Briefcase, 
  User, 
  LogOut, 
  Bell, 
  TrendingUp, 
  Github, 
  Globe, 
  Mail, 
  CheckCircle2, 
  X, 
  Loader2, 
  AlertCircle,
  MessageSquare,
  Search,
  Filter,
  ArrowRight,
  FileText
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'sonner';

interface Application {
  id: number;
  status: 'PENDING' | 'ACCEPTED' | 'REFUSED';
  matchingScore: number;
  student: {
    firstName: string;
    lastName: string;
    email: string;
    photo?: string;
    skills: string[];
    githubLink?: string;
    portfolioLink?: string;
    cv?: string;
  };
  offer: string; // Offer title
}

const CompanyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  const [reviewModal, setReviewModal] = useState<{ isOpen: boolean; app: Application | null }>({
    isOpen: false,
    app: null
  });
  const [refuseModal, setRefuseModal] = useState<{ isOpen: boolean; appId: number | null }>({
    isOpen: false,
    appId: null
  });
  const [refuseReason, setRefuseReason] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      try {
        const response = await axios.get('/api/company/applications/', { headers });
        const data = Array.isArray(response.data) ? response.data : (response.data?.applications || []);
        
        // Map backend fields to handle snake_case from Django
        const mapped = data.map((a: any) => ({
          id: a.id,
          status: a.status,
          matchingScore: a.matchingScore || a.matching_score || 0,
          student: {
            firstName: a.student?.firstName || a.student?.first_name || '',
            lastName: a.student?.lastName || a.student?.last_name || '',
            email: a.student?.email || '',
            photo: a.student?.profile_photo || a.student?.profilePhoto || a.student?.photo || '',
            skills: a.student?.skills || [],
            githubLink: a.student?.githubLink || a.student?.github_link || '',
            portfolioLink: a.student?.portfolioLink || a.student?.portfolio_link || '',
            cv: a.student?.cv || a.student?.resume || a.student?.cv_url || a.student?.cv_file || ''
          },
          offer: a.offer_title || a.offer || ''
        }));

        setApplications(mapped.sort((a: any, b: any) => b.matchingScore - a.matchingScore));
      } catch (err) {
        console.error('Error fetching applications:', err);
        toast.error('Failed to load applications.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleAccept = async (id: number) => {
    setIsActionLoading(id);
    const token = localStorage.getItem('access_token');
    try {
      await axios.put(`/api/company/applications/${id}/accept/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Application accepted!');
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status: 'ACCEPTED' } : app));
    } catch (err) {
      toast.error('Failed to accept application.');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleRefuse = async () => {
    if (!refuseModal.appId) return;
    const id = refuseModal.appId;
    setIsActionLoading(id);
    const token = localStorage.getItem('access_token');
    try {
      await axios.put(`/api/company/applications/${id}/refuse/`, { reason: refuseReason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Application refused.');
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status: 'REFUSED' } : app));
      setRefuseModal({ isOpen: false, appId: null });
      setRefuseReason('');
    } catch (err) {
      toast.error('Failed to refuse application.');
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

  const filteredApps = activeTab === 'ALL' 
    ? applications 
    : applications.filter(app => app.status === activeTab);

  const getMatchScoreColor = (score: number) => {
    if (score > 70) return 'text-green-500 border-green-500 bg-green-50';
    if (score >= 50) return 'text-orange-500 border-orange-500 bg-orange-50';
    return 'text-red-500 border-red-500 bg-red-50';
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
          
          <Link to="/company/dashboard" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
            Dashboard
          </Link>
          <Link to="/company/applications" className="flex items-center gap-4 px-4 py-3.5 bg-blue-600 rounded-2xl text-[13px] font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 group">
            <ClipboardList size={18} className="group-hover:scale-110 transition-transform" />
            Applications
          </Link>
          <Link to="/company/offers" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <Briefcase size={18} className="group-hover:scale-110 transition-transform" />
            Manage Offers
          </Link>
          
          <div className="pt-8 pb-4 px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Account</p>
          </div>
          
          <Link to="/company/profile" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <User size={18} className="group-hover:scale-110 transition-transform" />
            Company Profile
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
            <h2 className="text-2xl font-display font-bold text-navy-900 tracking-tight">Applications</h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 mt-1">Review and manage candidate applications</p>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-3 bg-paper rounded-2xl text-navy-900/40 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        <div className="p-12 space-y-10 max-w-7xl mx-auto">
          {/* Filter Tabs */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 p-1.5 bg-paper rounded-2xl w-fit border border-gray-100">
              {['ALL', 'PENDING', 'ACCEPTED', 'REFUSED'].map(tab => (
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
            
            <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30">
              {filteredApps.length} candidates found
            </p>
          </div>

          {/* Applicant Cards */}
          <div className="space-y-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-40 bg-white rounded-[3rem] border border-gray-100 animate-pulse" />
              ))
            ) : filteredApps.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center border-dashed"
              >
                <div className="w-20 h-20 bg-paper rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-navy-900/10">
                  <User size={40} />
                </div>
                <h4 className="text-xl font-display font-bold text-navy-900 mb-2">No applications found</h4>
                <p className="text-navy-900/40 font-medium max-w-xs mx-auto">Applications from students will appear here once they apply to your offers.</p>
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
                      <div className="w-16 h-16 rounded-2xl bg-black overflow-hidden flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-black/10 group-hover:scale-105 transition-all duration-500">
                        {app.student.photo ? (
                          <img src={app.student.photo} alt={app.student.firstName} className="w-full h-full object-cover" />
                        ) : (
                          app.student.firstName[0]
                        )}
                      </div>
                      <div>
                        <h4 className="text-xl font-display font-bold text-black leading-tight mb-1 group-hover:text-blue-600 transition-colors">{app.student.firstName} {app.student.lastName}</h4>
                        <a href={`mailto:${app.student.email}`} className="text-[11px] font-bold uppercase tracking-widest text-black/30 hover:text-blue-600 flex items-center gap-2">
                          <Mail size={12} />
                          {app.student.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-900/30 mb-2">Applied For</p>
                      <p className="text-sm font-bold text-navy-900 tracking-tight">{app.offer}</p>
                    </div>

                    <div className={`px-5 py-2.5 rounded-2xl border text-[11px] font-bold uppercase tracking-widest flex items-center gap-2.5 shadow-sm ${getMatchScoreColor(app.matchingScore)}`}>
                      <TrendingUp size={14} />
                      {app.matchingScore}% Match
                    </div>

                    <div className="flex-1 flex flex-wrap gap-2">
                      {app.student.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="px-3 py-1.5 bg-paper rounded-lg text-[10px] font-bold text-navy-900/40 uppercase tracking-widest">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      {app.student.githubLink && (
                        <a href={app.student.githubLink} target="_blank" rel="noopener noreferrer" className="p-3 bg-paper text-navy-900/40 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <Github size={18} />
                        </a>
                      )}
                      {app.student.portfolioLink && (
                        <a href={app.student.portfolioLink} target="_blank" rel="noopener noreferrer" className="p-3 bg-paper text-navy-900/40 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <Globe size={18} />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setReviewModal({ isOpen: true, app: app })}
                        className="px-8 py-4 bg-navy-900 text-white rounded-[1.5rem] hover:bg-blue-600 transition-all font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-navy-900/10 flex items-center gap-3 mx-auto"
                      >
                        Review Candidate
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Refuse Modal */}
      <AnimatePresence>
        {refuseModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRefuseModal({ isOpen: false, appId: null })}
              className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-6">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-2xl font-display font-bold text-navy-900 mb-2">Refuse Application</h3>
              <p className="text-navy-900/50 font-medium mb-8">Please provide a reason for the refusal. This will be shared with the student.</p>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">Reason (Optional)</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-5 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                      <MessageSquare size={18} />
                    </div>
                    <textarea 
                      value={refuseReason}
                      onChange={(e) => setRefuseReason(e.target.value)}
                      placeholder="e.g. Skills mismatch, position filled..."
                      rows={4}
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setRefuseModal({ isOpen: false, appId: null })}
                    className="flex-1 py-4 bg-paper text-navy-900 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleRefuse}
                    disabled={isActionLoading !== null}
                    className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/10 active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isActionLoading !== null ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Refusal'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Review Candidate Modal */}
      <AnimatePresence>
        {reviewModal.isOpen && reviewModal.app && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewModal({ isOpen: false, app: null })}
              className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-10 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-black overflow-hidden flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-black/10 transition-all duration-500">
                    {reviewModal.app.student.photo ? (
                      <img src={reviewModal.app.student.photo} alt={reviewModal.app.student.firstName} className="w-full h-full object-cover" />
                    ) : (
                      reviewModal.app.student.firstName[0]
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-black tracking-tight">
                      {reviewModal.app.student.firstName} {reviewModal.app.student.lastName}
                    </h3>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mt-1">
                      {reviewModal.app.student.email}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setReviewModal({ isOpen: false, app: null })}
                  className="p-3 bg-paper rounded-2xl text-navy-900/40 hover:text-navy-900 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-10 space-y-10 overflow-y-auto max-h-[70vh]">
                {/* Technical Skills */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-900/30">Technical Expertise</p>
                  <div className="flex flex-wrap gap-2.5">
                    {reviewModal.app.student.skills.map((skill: string) => (
                      <span key={skill} className="px-5 py-2.5 bg-paper rounded-[1rem] text-[11px] font-bold text-navy-900/60 uppercase tracking-widest border border-gray-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Evidence & Resources */}
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-900/30">Candidate Evidence</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a 
                      href={reviewModal.app.student.cv}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-6 bg-blue-50 text-blue-600 rounded-[2rem] border border-blue-100/50 hover:bg-blue-600 hover:text-white transition-all group"
                    >
                      <FileText size={24} className="mb-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Official CV</span>
                    </a>
                    <a 
                      href={reviewModal.app.student.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-6 bg-paper text-navy-900/40 rounded-[2rem] border border-gray-100 hover:border-navy-900 hover:text-navy-900 transition-all"
                    >
                      <Github size={24} className="mb-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">GitHub</span>
                    </a>
                    <a 
                      href={reviewModal.app.student.portfolioLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-6 bg-paper text-navy-900/40 rounded-[2rem] border border-gray-100 hover:border-navy-900 hover:text-navy-900 transition-all"
                    >
                      <Globe size={24} className="mb-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Portfolio</span>
                    </a>
                  </div>
                </div>

                {/* Decision Area */}
                <div className="pt-10 border-t border-gray-50 flex flex-col md:flex-row gap-4">
                  {reviewModal.app.status === 'PENDING' ? (
                    <>
                      <button 
                        onClick={() => {
                          handleAccept(reviewModal.app!.id);
                          setReviewModal({ isOpen: false, app: null });
                        }}
                        disabled={isActionLoading === reviewModal.app.id}
                        className="flex-1 py-5 bg-green-600 text-white rounded-[1.5rem] font-bold text-[11px] uppercase tracking-widest hover:bg-navy-900 transition-all shadow-xl shadow-green-600/20 flex items-center justify-center gap-3"
                      >
                        {isActionLoading === reviewModal.app.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                        Accept Application
                      </button>
                      <button 
                        onClick={() => {
                          setRefuseModal({ isOpen: true, appId: reviewModal.app!.id });
                          setReviewModal({ isOpen: false, app: null });
                        }}
                        disabled={isActionLoading === reviewModal.app.id}
                        className="flex-1 py-5 bg-paper text-red-500 rounded-[1.5rem] font-bold text-[11px] uppercase tracking-widest hover:bg-red-50 transition-all border border-gray-100 flex items-center justify-center gap-3"
                      >
                        <X size={18} />
                        Refuse Candidate
                      </button>
                    </>
                  ) : (
                    <div className={`w-full py-5 rounded-[1.5rem] text-center font-bold text-[11px] uppercase tracking-widest border ${
                      reviewModal.app.status === 'ACCEPTED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'
                    }`}>
                      Application Status: {reviewModal.app.status}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompanyApplications;

