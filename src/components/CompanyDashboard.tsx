import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Briefcase, 
  User, 
  Bell, 
  LogOut, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  ChevronRight,
  Loader2,
  X,
  MessageSquare,
  Search,
  ArrowRight,
  Github,
  Globe,
  FileText
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'sonner';

interface CompanyProfile {
  companyName: string;
  email: string;
  isApproved: boolean;
}

interface Application {
  id: number;
  studentName: string;
  studentEmail: string;
  studentPhoto?: string;
  offerTitle: string;
  matchingScore: number;
  status: 'PENDING' | 'ACCEPTED' | 'REFUSED';
  appliedAt: string;
  skills: string[];
  githubLink?: string;
  portfolioLink?: string;
  cv?: string;
}

interface CompanyOffer {
  id: number;
  title: string;
  wilaya: string;
  type: string;
  applicantCount: number;
  deadline: string;
}

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [offers, setOffers] = useState<CompanyOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [profileRes, appsRes, offersRes] = await Promise.allSettled([
          axios.get('/api/company/profile/', { headers }),
          axios.get('/api/company/applications/', { headers }),
          axios.get('/api/offers/', { headers })
        ]);

        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
        if (appsRes.status === 'fulfilled') {
          const data = Array.isArray(appsRes.value.data) ? appsRes.value.data : (appsRes.value.data?.applications || []);
          const mapped = data.map((a: any) => ({
            id: a.id,
            studentName: `${a.student?.firstName || a.student?.first_name || ''} ${a.student?.lastName || a.student?.last_name || ''}`,
            studentEmail: a.student?.email || '',
            studentPhoto: a.student?.profile_photo || a.student?.profilePhoto || a.student?.photo || '',
            offerTitle: a.offer_title || a.offer || '',
            matchingScore: a.matchingScore || a.matching_score || 0,
            status: a.status,
            appliedAt: a.applicationDate || a.application_date || a.applied_at || '',
            skills: a.student?.skills || [],
            githubLink: a.student?.githubLink || a.student?.github_link || '',
            portfolioLink: a.student?.portfolioLink || a.student?.portfolio_link || '',
            cv: a.student?.cv || a.student?.resume || a.student?.cv_url || a.student?.cv_file || ''
          }));
          setApplications(mapped.sort((a: any, b: any) => b.matchingScore - a.matchingScore));
        }
        if (offersRes.status === 'fulfilled') {
          const data = Array.isArray(offersRes.value.data) ? offersRes.value.data : (offersRes.value.data?.offers || []);
          setOffers(data.slice(0, 3));
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        toast.error('Failed to load dashboard data. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleAccept = async (id: number) => {
    setIsActionLoading(id);
    const token = localStorage.getItem('access_token');
    try {
      await axios.put(`/api/company/applications/${id}/accept/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Application accepted successfully!');
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status: 'ACCEPTED' } : app));
    } catch (err: any) {
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
    } catch (err: any) {
      toast.error('Failed to refuse application.');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const stats = {
    totalOffers: offers.length,
    totalApps: applications.length,
    pending: applications.filter(a => a.status === 'PENDING').length,
    accepted: applications.filter(a => a.status === 'ACCEPTED').length
  };

  const getMatchScoreColor = (score: number) => {
    if (score > 70) return 'text-green-500 border-green-500 bg-green-50';
    if (score >= 50) return 'text-orange-500 border-orange-500 bg-orange-50';
    return 'text-red-500 border-red-500 bg-red-50';
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
          
          <Link to="/company/dashboard" className="flex items-center gap-4 px-4 py-3.5 bg-blue-600 rounded-2xl text-[13px] font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 group">
            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
            Dashboard
          </Link>
          <Link to="/company/applications" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
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
          <div className="bg-white/5 rounded-[2rem] p-5 mb-6 border border-white/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-600/20">
                {profile?.companyName?.[0] || 'C'}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-sm truncate leading-tight">{profile?.companyName}</p>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest truncate mt-1">Company Partner</p>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-3 py-3 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen">
        {/* Top Bar */}
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-40">
          <div>
            <h2 className="text-2xl font-display font-bold text-black tracking-tight">
              Welcome back, {profile?.companyName || 'Company'}
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-4 px-5 py-2.5 bg-paper rounded-2xl border border-gray-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-black/40">Recruiter Portal</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-3 bg-paper rounded-2xl text-black/40 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100">
                <Bell size={20} />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-xl shadow-black/10">
                {profile?.companyName?.[0] || 'C'}
              </div>
            </div>
          </div>
        </header>

        <div className="p-12 space-y-12 max-w-7xl mx-auto">
          {/* Approval Alert */}
          {profile && !profile.isApproved && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden bg-orange-500 rounded-[3rem] p-10 text-white"
            >
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shrink-0">
                    <Clock size={36} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold mb-2 tracking-tight">Account Pending Approval</h3>
                    <p className="text-white/80 font-medium max-w-md leading-relaxed">The university admin is currently reviewing your company profile. You'll be notified once you can start posting offers.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Active Offers', value: stats.totalOffers, icon: <Briefcase size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Total Applicants', value: stats.totalApps, icon: <TrendingUp size={20} />, color: 'text-purple-500', bg: 'bg-purple-50' },
              { label: 'Pending Review', value: stats.pending, icon: <Clock size={20} />, color: 'text-orange-500', bg: 'bg-orange-50' },
              { label: 'Accepted', value: stats.accepted, icon: <CheckCircle2 size={20} />, color: 'text-green-500', bg: 'bg-green-50' },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-premium transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-900/30 mb-2">{stat.label}</p>
                  <h4 className="text-3xl font-display font-bold text-navy-900 tracking-tighter">{stat.value}</h4>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Recent Applications */}
            <div className="lg:col-span-2 space-y-8">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h3 className="text-2xl font-display font-bold text-black tracking-tight">Recent Applicants</h3>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mt-1">Candidates ranked by matching score</p>
                </div>
                <Link to="/company/applications" className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-[11px] font-bold uppercase tracking-widest text-black hover:bg-paper transition-all flex items-center gap-3">
                  View All <ChevronRight size={14} />
                </Link>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-32 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
                  ))
                ) : applications.length === 0 ? (
                  <div className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center border-dashed">
                    <div className="w-20 h-20 bg-paper rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-navy-900/10">
                      <ClipboardList size={40} />
                    </div>
                    <h4 className="text-xl font-display font-bold text-navy-900 mb-2">No applications yet</h4>
                    <p className="text-navy-900/40 font-medium max-w-xs mx-auto">Your internship offers will appear here once students start applying.</p>
                  </div>
                ) : (
                  applications.map((app, i) => (
                    <motion.div 
                      key={app.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-premium transition-all group relative overflow-hidden"
                    >
                      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-black overflow-hidden flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-black/10 transition-all duration-500">
                            {app.studentPhoto ? (
                              <img src={app.studentPhoto} alt={app.studentName} className="w-full h-full object-cover" />
                            ) : (
                              app.studentName[0]
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg font-display font-bold text-black leading-tight mb-1 group-hover:text-blue-600 transition-colors">{app.studentName}</h4>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-black/30">{app.studentEmail}</p>
                          </div>
                        </div>

                        <div className="flex-1">
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-900/30 mb-2">Applied For</p>
                          <p className="text-sm font-bold text-navy-900 tracking-tight">{app.offerTitle}</p>
                        </div>

                        <div className={`px-5 py-2.5 rounded-2xl border text-[11px] font-bold uppercase tracking-widest flex items-center gap-2.5 shadow-sm ${getMatchScoreColor(app.matchingScore)}`}>
                          <TrendingUp size={14} />
                          {app.matchingScore}% Match
                        </div>

                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setReviewModal({ isOpen: true, app: app })}
                            className="px-6 py-3 bg-navy-900 text-white rounded-2xl hover:bg-blue-600 transition-all font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-navy-900/10 flex items-center gap-2"
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Active Offers */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-2xl font-display font-bold text-navy-900 tracking-tight">Active Offers</h3>
                <Link to="/company/offers" className="text-[11px] font-bold uppercase tracking-widest text-blue-600 hover:text-navy-900 transition-colors">
                  Manage All
                </Link>
              </div>

              <div className="space-y-6">
                {isLoading ? (
                  Array(2).fill(0).map((_, i) => (
                    <div key={i} className="h-48 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
                  ))
                ) : offers.length === 0 ? (
                  <div className="bg-white p-12 rounded-[3rem] border border-gray-100 text-center border-dashed">
                    <p className="text-navy-900/30 font-bold uppercase tracking-widest text-[11px]">No active offers</p>
                    <Link to="/company/offers" className="mt-6 inline-flex px-6 py-3 bg-navy-900 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all">Post Now</Link>
                  </div>
                ) : (
                  offers.map((offer, i) => (
                    <motion.div 
                      key={offer.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-premium transition-all group"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <h4 className="text-lg font-display font-bold text-navy-900 leading-tight group-hover:text-blue-600 transition-colors">{offer.title}</h4>
                        <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-blue-100/30">
                          {offer.type}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-5 mb-8">
                        <div className="flex items-center gap-2 text-navy-900/30">
                          <MapPin size={14} />
                          <span className="text-[11px] font-bold uppercase tracking-widest">{offer.wilaya}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                        <div className="flex items-center gap-2.5 text-orange-500">
                          <Clock size={16} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Ends {offer.deadline}</span>
                        </div>
                        <Link to={`/company/offers/${offer.id}`} className="w-10 h-10 bg-paper rounded-xl text-navy-900 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-sm">
                          <ChevronRight size={18} />
                        </Link>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
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
                    {reviewModal.app.studentPhoto ? (
                      <img src={reviewModal.app.studentPhoto} alt={reviewModal.app.studentName} className="w-full h-full object-cover" />
                    ) : (
                      reviewModal.app.studentName[0]
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-black tracking-tight">
                      {reviewModal.app.studentName}
                    </h3>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mt-1">
                      {reviewModal.app.studentEmail}
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
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">Technical Expertise</p>
                  <div className="flex flex-wrap gap-2.5">
                    {reviewModal.app.skills.map((skill: string) => (
                      <span key={skill} className="px-5 py-2.5 bg-paper rounded-[1rem] text-[11px] font-bold text-black/60 uppercase tracking-widest border border-gray-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">Candidate Evidence</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a 
                      href={reviewModal.app.cv}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-6 bg-blue-50 text-blue-600 rounded-[2rem] border border-blue-100/50 hover:bg-blue-600 hover:text-white transition-all group"
                    >
                      <FileText size={24} className="mb-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Official CV</span>
                    </a>
                    <a 
                      href={reviewModal.app.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-6 bg-paper text-navy-900/40 rounded-[2rem] border border-gray-100 hover:border-navy-900 hover:text-navy-900 transition-all"
                    >
                      <Github size={24} className="mb-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">GitHub</span>
                    </a>
                    <a 
                      href={reviewModal.app.portfolioLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center p-6 bg-paper text-navy-900/40 rounded-[2rem] border border-gray-100 hover:border-navy-900 hover:text-navy-900 transition-all"
                    >
                      <Globe size={24} className="mb-3" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Portfolio</span>
                    </a>
                  </div>
                </div>

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

export default CompanyDashboard;
