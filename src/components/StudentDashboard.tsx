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
  RefreshCw,
  MoreVertical,
  MessageSquare,
  FileText,
  Plus,
  Download
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/api';
import { toast, Toaster } from 'sonner';

import { useProfileGuard } from '@/lib/profileGuard';

interface StudentProfile {
  firstName: string;
  lastName: string;
  email: string;
  photoUrl?: string;
  skills?: any[];
}

interface ApplicationStats {
  sent: number;
  pending: number;
  accepted: number;
  interviews: number;
  avgMatchScore: number;
}

interface ActiveInternship {
  id: number;
  offerTitle: string;
  companyName: string;
  status: string;
  startDate: string;
  endDate: string;
  pdfUrl?: string;
  certificateUrl?: string;
}

interface Offer {
  id: number;
  title: string;
  companyName: string;
  willaya: string;
  type: string;
  skills: string[];
  matchScore: number;
  daysLeft?: number;
}

import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { checkProfileComplete } = useProfileGuard();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [activeInternship, setActiveInternship] = useState<ActiveInternship | null>(null);
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

      try {
        // Parallel fetching
        const [profileRes, statsRes, recommendedRes, expiringRes, notificationsRes] = await Promise.allSettled([
          api.get('/api/student/profile/'),
          api.get('/api/student/my-applications/'),
          api.get('/api/offers/recommended/'),
          api.get('/api/offers/expiring-soon/'),
          api.get('/api/notifications/')
        ]);

        if (profileRes.status === 'fulfilled') {
          const pData = profileRes.value.data;
          const isComplete = (pData.skills && pData.skills.length > 0) || false;
          setProfileComplete(isComplete);
          localStorage.setItem('profileComplete', String(isComplete));
          setProfile({
            firstName: pData.firstName || pData.first_name,
            lastName: pData.lastName || pData.last_name,
            email: pData.email,
            photoUrl: pData.profile_photo || pData.profilePhoto || pData.photoUrl || pData.photo_url || pData.photo || '',
            skills: pData.skills || []
          });
        }
        
        if (statsRes.status === 'fulfilled') {
          const apps = Array.isArray(statsRes.value.data) ? statsRes.value.data : [];
          const sent = apps.length;
          const pending = apps.filter((a: any) => (a.status || '').toUpperCase() === 'PENDING').length;
          const accepted = apps.filter((a: any) => ['ACCEPTED', 'VALIDATED', 'ONGOING', 'PENDING_CERT', 'COMPLETED'].includes((a.status || '').toUpperCase())).length;
          const interviews = apps.filter((a: any) => (a.status || '').toUpperCase() === 'INTERVIEW' || (a.status || '').toUpperCase() === 'INTERVIEWING').length;
          const avgMatchScore = apps.length > 0
            ? Math.round(apps.reduce((sum: number, a: any) => sum + (a.matchingScore || a.matching_score || 0), 0) / apps.length)
            : 0;
          setStats({ sent, pending, accepted, interviews, avgMatchScore });

          // Find active internship
          const active = apps.find((a: any) => ['VALIDATED', 'ONGOING', 'PENDING_CERT', 'COMPLETED'].includes((a.status || '').toUpperCase()));
          if (active) {
            setActiveInternship({
              id: active.id,
              offerTitle: active.offer_title || active.offer || '',
              companyName: active.company_name || active.company || '',
              status: active.status,
              startDate: active.internship?.startDate || active.internship?.start_date || '',
              endDate: active.internship?.endDate || active.internship?.end_date || '',
              pdfUrl: active.pdf_url || active.pdfUrl || active.internship?.pdf_url || active.internship?.agreement_url,
              certificateUrl: active.certificate_url || active.certificateUrl || active.internship?.certificate_url || active.internship?.pdf_certificate,
            });
          }
        }

        if (recommendedRes.status === 'fulfilled') {
          const data = recommendedRes.value.data;
          const offersArray = Array.isArray(data) ? data : (data?.offers || []);
          const mapped = offersArray.map((o: any) => {
            const rawSkills = o.skills || o.requiredSkills || o.required_skills || [];
            const skillsArray = Array.isArray(rawSkills) 
              ? rawSkills.map((s: any) => typeof s === 'string' ? s : s.skillName || s.name || String(s))
              : [];
            
            return {
              id: o.offer_id || o.id,
              title: o.title,
              companyName: typeof o.company === 'string' ? o.company : (o.companyName || o.company_name || 'Unknown Company'),
              willaya: o.willaya || o.wilaya,
              type: o.type,
              skills: skillsArray,
              matchScore: o.matchingScore || o.matching_score || 0
            };
          });
          setRecommendedOffers(mapped);
        }

        if (expiringRes.status === 'fulfilled') {
          const data = expiringRes.value.data;
          const offersArray = Array.isArray(data) ? data : (data?.offers || []);
          const mapped = offersArray.map((o: any) => ({
            id: o.offer_id || o.id,
            title: o.title,
            companyName: typeof o.company === 'string' ? o.company : (o.company_name || o.companyName || 'Unknown Company'),
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
    if (!checkProfileComplete(profile?.skills || [])) return;
    setIsApplying(offerId);
    try {
      await api.post('/api/applications/apply/', { offer_id: offerId });
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
      <StudentSidebar unreadNotifications={unreadNotifications} />

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen">
        {/* Top Bar */}
        <StudentHeader 
          title={`Welcome back, ${profile?.firstName || 'Student'}`}
          subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          profile={profile}
          unreadNotifications={unreadNotifications}
        />

        <div className="px-12 py-8 space-y-8 max-w-7xl mx-auto">
          {/* Slim Stat Bar */}
          <div className="flex items-center gap-8 py-3 px-8 bg-black/[0.02] backdrop-blur-sm rounded-2xl border border-black/[0.05] w-fit shadow-sm">
            <div className="flex items-center gap-2.5">
              <FileText size={14} className="text-navy-900/40" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black text-navy-900 leading-none">{stats?.sent || 0}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Applied</span>
              </div>
            </div>
            <div className="w-px h-3 bg-gray-200" />
            <div className="flex items-center gap-2.5">
              <MessageSquare size={14} className="text-navy-900/40" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black text-navy-900 leading-none">{stats?.interviews || 0}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Interviews</span>
              </div>
            </div>
            <div className="w-px h-3 bg-gray-200" />
            <div className="flex items-center gap-2.5 text-emerald-600">
              <CheckCircle2 size={14} className="text-emerald-500/50" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-black leading-none">{stats?.accepted || 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none opacity-60">Accepted</span>
              </div>
            </div>
          </div>

          {/* Active Internship Row */}
          {activeInternship && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 rounded-[3rem] border border-blue-100 shadow-premium group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-32 -mt-32 pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                <div className="flex items-center gap-8">
                  <div className="w-20 h-20 rounded-[2rem] bg-navy-900 flex items-center justify-center text-white shadow-2xl shadow-navy-900/20 group-hover:bg-blue-600 transition-colors duration-500">
                    <Briefcase size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-display font-bold text-navy-900 tracking-tight">{activeInternship.companyName}</h3>
                      <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-bold uppercase tracking-widest border border-blue-100/50">
                        {['VALIDATED', 'ACCEPTED', 'ONGOING'].includes(activeInternship.status.toUpperCase()) ? 'ONGOING' : activeInternship.status}
                      </div>
                    </div>
                    <p className="text-lg font-medium text-navy-900/60">{activeInternship.offerTitle}</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4">
                  {activeInternship.pdfUrl && (
                    <a 
                      href={activeInternship.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full md:w-auto px-8 py-4 bg-navy-900 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-navy-900/10 flex items-center justify-center gap-3"
                    >
                      <Download size={18} />
                      Download Agreement
                    </a>
                  )}
                  {activeInternship.certificateUrl && (
                    <a 
                      href={activeInternship.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full md:w-auto px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-navy-900 transition-all shadow-xl shadow-emerald-600/10 flex items-center justify-center gap-3"
                    >
                      <Download size={18} />
                      Download Certificate
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Neural Matches */}

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

          {/* Expiring Soon */}
          <section className="space-y-6">
            <div className="px-2">
              <h3 className="text-xl font-display font-bold text-black tracking-tight">Expiring Soon</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mt-1 uppercase">Opportunities closing soon</p>
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                Array(2).fill(0).map((_, i) => (
                  <div key={i} className="h-64 bg-white rounded-[3rem] border border-gray-100 animate-pulse" />
                ))
              ) : expiringOffers.length === 0 ? (
                <div className="bg-white/40 backdrop-blur-sm p-12 rounded-[2.5rem] border border-gray-100/50 text-center border-dashed">
                  <p className="text-black/40 font-medium text-sm italic">No internships closing soon. Keep exploring!</p>
                </div>
              ) : (
                expiringOffers.map((offer, i) => (
                  <motion.div 
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-premium transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-paper flex items-center justify-center text-black/20 group-hover:text-red-500 transition-colors duration-500 shrink-0">
                          <Clock size={32} />
                        </div>
                        <div>
                          <h4 className="text-xl font-display font-bold text-black leading-tight mb-1">{offer.title}</h4>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-black/30">{offer.companyName}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <div className="px-5 py-2.5 bg-red-50 text-red-600 rounded-2xl border border-red-100/50 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2.5 shadow-sm">
                          <Clock size={14} />
                          {offer.daysLeft} days left
                        </div>
                        
                        <div className="flex gap-3">
                          <Link 
                            to={`/student/offers/${offer.id}`}
                            className="px-8 py-4 bg-navy-900 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-navy-900/10 flex items-center justify-center gap-3"
                          >
                            View Opportunity
                            <ChevronRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>

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

            <div className="space-y-6">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-64 bg-white rounded-[3rem] border border-gray-100 animate-pulse" />
                ))
              ) : recommendedOffers.length === 0 ? (
                <div className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center border-dashed">
                  <div className="w-20 h-20 bg-paper rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-black/10">
                    <Briefcase size={40} />
                  </div>
                  <h4 className="text-xl font-display font-bold text-black mb-2">No recommendations yet</h4>
                  <p className="text-black/40 font-medium max-w-xs mx-auto">Complete your profile and add skills to see internships tailored for you.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {recommendedOffers.slice(0, 4).map((offer, i) => (
                      <motion.div 
                        key={offer.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-premium transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                        
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-black flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-black/10 group-hover:bg-blue-600 transition-colors duration-500 shrink-0">
                              {offer.companyName[0]}
                            </div>
                            <div>
                              <h4 className="text-xl font-display font-bold text-black leading-tight mb-1">{offer.title}</h4>
                              <div className="flex items-center gap-3">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-black/30">{offer.companyName}</p>
                                <span className="w-1 h-1 rounded-full bg-black/10" />
                                <p className="text-[11px] font-bold uppercase tracking-widest text-black/30">{offer.willaya}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                            <div className={`px-5 py-2.5 rounded-2xl border text-[11px] font-bold uppercase tracking-widest flex items-center gap-2.5 shadow-sm ${getMatchScoreColor(offer.matchScore)}`}>
                              <TrendingUp size={14} />
                              {offer.matchScore}% Match
                            </div>
                            
                            <div className="flex gap-3">
                              <Link 
                                to={`/student/offers/${offer.id}`}
                                className="px-6 py-4 bg-paper text-black rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100"
                              >
                                Details
                              </Link>
                              <button 
                                onClick={() => handleApply(offer.id)}
                                disabled={isApplying === offer.id}
                                className="px-8 py-4 bg-black text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-black/10 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
                              >
                                {isApplying === offer.id ? <Loader2 size={16} className="animate-spin" /> : 'Apply Now'}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-6 relative z-10">
                          {(offer.skills || []).slice(0, 5).map(skill => (
                            <div key={skill} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-bold uppercase tracking-widest border border-blue-100/30">
                              {skill}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {recommendedOffers.length > 4 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      className="flex justify-center pt-4"
                    >
                      <Link 
                        to="/student/offers"
                        className="group flex flex-col items-center gap-4 py-8 px-12 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-premium transition-all w-full max-w-md text-center"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                          <Plus size={24} />
                        </div>
                        <div>
                          <h4 className="text-lg font-display font-bold text-black tracking-tight">Explore More Opportunities</h4>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 mt-1">View our full catalog of neural matches</p>
                        </div>
                      </Link>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;