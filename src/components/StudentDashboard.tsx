import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Search, 
  ClipboardList, 
  User, 
  Bell, 
  LogOut, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MapPin,
  Briefcase,
  ChevronRight,
  Loader2,
  ExternalLink,
  Plus
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'sonner';

interface StudentProfile {
  firstName: string;
  lastName: string;
  email: string;
  photoUrl?: string;
}

interface ApplicationStats {
  sent: number;
  pending: number;
  accepted: number;
  avgMatchScore: number;
}

interface Offer {
  id: number;
  title: string;
  companyName: string;
  wilaya: string;
  type: 'Online' | 'On-site';
  skills: string[];
  matchScore: number;
  daysLeft?: number;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [recommendedOffers, setRecommendedOffers] = useState<Offer[]>([]);
  const [expiringOffers, setExpiringOffers] = useState<Offer[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState<number | null>(null);
  const [profileComplete, setProfileComplete] = useState(localStorage.getItem('profileComplete') !== 'false');

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
        // Parallel fetching
        const [profileRes, statsRes, recommendedRes, expiringRes, notificationsRes] = await Promise.allSettled([
          axios.get('/api/student/profile/', { headers }),
          axios.get('/api/student/my-applications/', { headers }),
          axios.get('/api/offers/recommended/', { headers }),
          axios.get('/api/offers/expiring-soon/', { headers }),
          axios.get('/api/notifications/', { headers })
        ]);

        if (profileRes.status === 'fulfilled') {
          const pData = profileRes.value.data;
          setProfile({
            firstName: pData.firstName || pData.first_name,
            lastName: pData.lastName || pData.last_name,
            email: pData.email,
            photoUrl: pData.profile_photo || pData.profilePhoto || pData.photoUrl || pData.photo_url || pData.photo || ''
          });
        }
        
        if (statsRes.status === 'fulfilled') {
          const apps = Array.isArray(statsRes.value.data) ? statsRes.value.data : [];
          const sent = apps.length;
          const pending = apps.filter((a: any) => (a.status || '').toUpperCase() === 'PENDING').length;
          const accepted = apps.filter((a: any) => (a.status || '').toUpperCase() === 'ACCEPTED').length;
          const avgMatchScore = apps.length > 0
            ? Math.round(apps.reduce((sum: number, a: any) => sum + (a.matchingScore || a.matching_score || 0), 0) / apps.length)
            : 0;
          setStats({ sent, pending, accepted, avgMatchScore });
        }

        if (recommendedRes.status === 'fulfilled') {
          const data = recommendedRes.value.data;
          const offersArray = Array.isArray(data) ? data : (data?.offers || []);
          const mapped = offersArray.map((o: any) => ({
            id: o.offer_id || o.id,
            title: o.title,
            companyName: o.company || o.company_name,
            wilaya: o.willaya || o.wilaya,
            type: o.type,
            skills: o.requiredSkills || o.required_skills || [],
            matchScore: o.matchingScore || o.matching_score || 0
          }));
          setRecommendedOffers(mapped);
        }

        if (expiringRes.status === 'fulfilled') {
          const data = expiringRes.value.data;
          const offersArray = Array.isArray(data) ? data : (data?.offers || []);
          const mapped = offersArray.map((o: any) => ({
            id: o.offer_id || o.id,
            title: o.title,
            companyName: o.company || o.company_name,
            daysLeft: o.daysLeft || o.days_left || 0
          }));
          setExpiringOffers(mapped);
        }

        if (notificationsRes.status === 'fulfilled') setUnreadNotifications(notificationsRes.value.data.count || 0);

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        toast.error('Failed to load dashboard data. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const handleApply = async (offerId: number) => {
    const token = localStorage.getItem('access_token');
    setIsApplying(offerId);
    try {
      await axios.post('/api/applications/apply/', { offer_id: offerId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Application sent successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to apply. Please try again.');
    } finally {
      setIsApplying(null);
    }
  };

  const getInitials = () => {
    if (!profile || !profile.firstName || !profile.lastName) return 'S';
    return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  };

  const getInitialsBadge = (large = false) => {
    return (
      <div className={`${large ? 'w-24 h-24 text-3xl' : 'w-12 h-12 text-sm'} rounded-2xl bg-black text-white flex items-center justify-center font-bold shadow-xl shadow-black/10 overflow-hidden`}>
        {profile?.photoUrl ? (
          <img src={profile.photoUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          getInitials()
        )}
      </div>
    );
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
          
          <Link to="/student/dashboard" className="flex items-center gap-4 px-4 py-3.5 bg-blue-600 rounded-2xl text-[13px] font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 group">
            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
            Dashboard
          </Link>
          <Link to="/student/offers" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <Search size={18} className="group-hover:scale-110 transition-transform" />
            Search Offers
          </Link>
          <Link to="/student/applications" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
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
          <Link to="/student/notifications" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all relative group">
            <Bell size={18} className="group-hover:scale-110 transition-transform" />
            Notifications
            {unreadNotifications > 0 && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-blue-600 rounded-full text-[10px] flex items-center justify-center font-bold">
                {unreadNotifications}
              </span>
            )}
          </Link>
        </nav>

        <div className="p-8 border-t border-white/5">
          <div className="bg-white/5 rounded-[2rem] p-5 mb-6 border border-white/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-black overflow-hidden flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-black/10">
                {profile?.photoUrl ? (
                  <img src={profile.photoUrl} alt="Me" className="w-full h-full object-cover" />
                ) : (
                  getInitials()
                )}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-sm truncate leading-tight">{profile?.firstName} {profile?.lastName}</p>
                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest truncate mt-1">Student Account</p>
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
              Welcome back, {profile?.firstName || 'Student'}
            </h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-4 px-5 py-2.5 bg-paper rounded-2xl border border-gray-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-black/40">System Online</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-3 bg-paper rounded-2xl text-black/40 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100">
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
                )}
              </button>
              {getInitialsBadge()}
            </div>
          </div>
        </header>

        <div className="p-12 space-y-12 max-w-7xl mx-auto">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Applications', value: stats?.sent || 0, icon: <TrendingUp size={20} />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
              { label: 'Pending', value: stats?.pending || 0, icon: <Clock size={20} />, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
              { label: 'Accepted', value: stats?.accepted || 0, icon: <CheckCircle2 size={20} />, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-100' },
              { label: 'Match Rate', value: `${stats?.avgMatchScore || 0}%`, icon: <TrendingUp size={20} />, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
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
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-2">{stat.label}</p>
                  <h4 className="text-3xl font-display font-bold text-black tracking-tighter">{stat.value}</h4>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Skill Gap Alert */}
          {!profileComplete && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden bg-black rounded-[3rem] p-10 text-white"
            >
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shrink-0">
                    <AlertCircle size={36} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold mb-2 tracking-tight">Optimize Your Matching Engine</h3>
                    <p className="text-white/50 font-medium max-w-md leading-relaxed">Your profile is currently incomplete. Add your technical skills to unlock personalized internship recommendations.</p>
                  </div>
                </div>
                <Link 
                  to="/profile/setup"
                  className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-[12px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/20 active:scale-95 whitespace-nowrap"
                >
                  Complete Profile
                </Link>
              </div>
            </motion.div>
          )}

          {/* Recommended Offers */}
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <div>
                <h3 className="text-3xl font-display font-bold text-black tracking-tight">Neural Matches</h3>
                <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mt-1">Based on your technical profile and preferences</p>
              </div>
              <Link to="/student/offers" className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-[11px] font-bold uppercase tracking-widest text-black hover:bg-paper transition-all flex items-center gap-3">
                Explore All <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-72 bg-white rounded-[3rem] border border-gray-100 animate-pulse" />
                ))
              ) : recommendedOffers.length === 0 ? (
                <div className="lg:col-span-2 bg-white p-20 rounded-[3rem] border border-gray-100 text-center border-dashed">
                  <div className="w-20 h-20 bg-paper rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-black/10">
                    <Briefcase size={40} />
                  </div>
                  <h4 className="text-xl font-display font-bold text-black mb-2">No recommendations yet</h4>
                  <p className="text-black/40 font-medium max-w-xs mx-auto">Complete your profile and add skills to see internships tailored for you.</p>
                </div>
              ) : (
                recommendedOffers.map((offer, i) => (
                  <motion.div 
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-premium transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    
                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-black flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-black/10 group-hover:bg-blue-600 transition-colors duration-500">
                          {offer.companyName[0]}
                        </div>
                        <div>
                          <h4 className="text-xl font-display font-bold text-black leading-tight mb-1">{offer.title}</h4>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-black/30">{offer.companyName}</p>
                        </div>
                      </div>
                      <div className={`px-5 py-2.5 rounded-2xl border text-[11px] font-bold uppercase tracking-widest flex items-center gap-2.5 shadow-sm ${getMatchScoreColor(offer.matchScore)}`}>
                        <TrendingUp size={14} />
                        {offer.matchScore}% Match
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-10 relative z-10">
                      <div className="flex items-center gap-2.5 px-4 py-2 bg-paper rounded-xl text-[10px] font-bold text-black/40 uppercase tracking-widest border border-gray-50">
                        <MapPin size={14} />
                        {offer.wilaya}
                      </div>
                      <div className="flex items-center gap-2.5 px-4 py-2 bg-paper rounded-xl text-[10px] font-bold text-black/40 uppercase tracking-widest border border-gray-100">
                        <Briefcase size={14} />
                        {offer.type}
                      </div>
                      {offer.skills.slice(0, 3).map(skill => (
                        <div key={skill} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-blue-100/30">
                          {skill}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4 relative z-10">
                      <Link 
                        to={`/student/offers/${offer.id}`}
                        className="flex-1 py-4.5 bg-paper text-black rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-3 border border-gray-100"
                      >
                        Details
                        <ExternalLink size={14} />
                      </Link>
                      <button 
                        onClick={() => handleApply(offer.id)}
                        disabled={isApplying === offer.id}
                        className="flex-1 py-4.5 bg-black text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-black/10 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
                      >
                        {isApplying === offer.id ? <Loader2 size={16} className="animate-spin" /> : 'Apply Now'}
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          {/* Expiring Soon */}
          <section className="space-y-8">
            <div className="px-2">
              <h3 className="text-2xl font-display font-bold text-black tracking-tight">Expiring Soon</h3>
              <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mt-1">Last chance to apply for these opportunities</p>
            </div>
            
            <div className="flex gap-8 overflow-x-auto pb-8 no-scrollbar -mx-2 px-2">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="min-w-[340px] h-48 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
                ))
              ) : expiringOffers.length === 0 ? (
                <div className="w-full bg-white p-12 rounded-[2.5rem] border border-gray-100 text-center border-dashed">
                  <p className="text-black/30 font-bold uppercase tracking-widest text-[11px]">No urgent deadlines found</p>
                </div>
              ) : (
                expiringOffers.map((offer, i) => (
                  <motion.div 
                    key={offer.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="min-w-[360px] bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-premium transition-all group"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-red-100/50">
                        {offer.daysLeft} days left
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-paper flex items-center justify-center text-black/20 group-hover:text-red-500 transition-colors">
                        <Clock size={18} />
                      </div>
                    </div>
                    <h4 className="text-lg font-display font-bold text-black mb-2 truncate group-hover:text-blue-600 transition-colors">{offer.title}</h4>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mb-6">{offer.companyName}</p>
                    <Link to={`/student/offers/${offer.id}`} className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-blue-600 hover:text-black transition-colors">
                      View Opportunity <ChevronRight size={14} />
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;

