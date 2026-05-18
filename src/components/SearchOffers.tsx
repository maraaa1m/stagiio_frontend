import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Search,
  ClipboardList,
  User,
  LogOut,
  Bell,
  MoreVertical,
  MapPin,
  Clock,
  TrendingUp,
  Filter,
  Loader2,
  Plus,
  CheckCircle2,
  FileCheck,
  AlertTriangle,
  XCircle,
  PartyPopper,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/api';
import { toast, Toaster } from 'sonner';
import { ALGERIA_WILAYAS, OFFER_TYPES, SORT_OPTIONS } from '../constants';

interface Offer {
  id: number;
  title: string;
  companyName: string;
  wilaya: string;
  type: string;
  skills: string[];
  matchingScore: number;
  deadline: string;
  remainingSpots?: number;
  status?: string; // Application status
  applicationId?: number;
}

import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';

const SearchOffers = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [allOffers, setAllOffers] = useState<Offer[]>([]); // Original list
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]); // Filtered list
  const [userApplications, setUserApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [sortBy, setSortBy] = useState('match');
  const [isApplying, setIsApplying] = useState<number | null>(null);
  const [isDenying, setIsDenying] = useState<number | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [offersRes, profileRes, notificationsRes, appsRes] = await Promise.allSettled([
        api.get('/api/offers/recommended/'),
        api.get('/api/student/profile/'),
        api.get('/api/notifications/'),
        api.get('/api/student/my-applications/')
      ]);

      let applications: any[] = [];
      if (appsRes.status === 'fulfilled') {
        applications = Array.isArray(appsRes.value.data) ? appsRes.value.data : [];
        setUserApplications(applications);
      }

      if (offersRes.status === 'fulfilled') {
        const data = Array.isArray(offersRes.value.data) ? offersRes.value.data : (offersRes.value.data?.offers || offersRes.value.data?.results || []);
        const mapped: Offer[] = data.map((o: any) => {
          const offerId = o.offer_id || o.id;
          const app = applications.find((a: any) => (a.offer_id || a.offer) === offerId);
          
          return {
            id: offerId,
            title: o.title,
            companyName: o.company || o.company_name || o.companyName || '',
            wilaya: o.willaya || o.wilaya || '',
            type: o.type,
            skills: Array.isArray(o.requiredSkills) ? o.requiredSkills : 
                    (Array.isArray(o.required_skills) ? o.required_skills : 
                    (Array.isArray(o.skills) ? o.skills : [])),
            matchingScore: o.matchingScore || o.matching_score || 0,
            deadline: o.deadline || o.applicationDeadline || '',
            remainingSpots: o.remainingSpots !== undefined ? o.remainingSpots : o.remaining_spots,
            status: app?.status?.toUpperCase(),
            applicationId: app?.id
          };
        });

        // Filter out offers that are already accepted or validated
        const visibleOffers = mapped.filter(o => !['ACCEPTED', 'VALIDATED', 'ONGOING', 'COMPLETED'].includes(o.status || ''));
        setAllOffers(visibleOffers);
      }

      if (profileRes.status === 'fulfilled') {
        const pData = profileRes.value.data;
        const photoUrl = pData.profile_photo || pData.profilePhoto || pData.photoUrl || pData.photo_url || pData.photo || '';
        setProfile({
          firstName: pData.first_name || pData.firstName,
          lastName: pData.last_name || pData.lastName,
          photoUrl: photoUrl
        });
      }

      if (notificationsRes.status === 'fulfilled') {
        setUnreadNotifications(notificationsRes.value.data.count || 0);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtering Logic
  useEffect(() => {
    let filtered = [...allOffers];

    if (selectedWilaya !== 'ALL') {
      filtered = filtered.filter(o => (o.wilaya || '').toUpperCase() === selectedWilaya.toUpperCase());
    }

    if (selectedType !== 'ALL') {
      const type = (o: Offer) => (o.type || '').toUpperCase();
      filtered = filtered.filter(o => {
        const val = type(o);
        if (selectedType === 'REMOTE') return val === 'REMOTE' || val === 'ONLINE';
        return val === selectedType;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        o.title.toLowerCase().includes(q) || 
        o.companyName.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'match') {
      filtered.sort((a, b) => b.matchingScore - a.matchingScore);
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => b.id - a.id);
    } else if (sortBy === 'deadline') {
      filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }

    setFilteredOffers(filtered);
  }, [allOffers, searchQuery, selectedWilaya, selectedType, sortBy]);

  const handleApply = async (offerId: number) => {
    setIsApplying(offerId);
    try {
      await api.post('/api/applications/apply/', { offer_id: offerId });
      setShowConfirmModal(null);
      setShowSuccessModal(true);
      fetchData(); // Refresh to update status
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to apply.';
      toast.error(msg);
    } finally {
      setIsApplying(null);
    }
  };

  const handleDeny = async (applicationId: number) => {
    setIsDenying(applicationId);
    try {
      await api.delete(`/api/student/applications/${applicationId}/`);
      toast.success('Application withdrawn successfully.');
      fetchData(); // Refresh to update status
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to withdraw application.';
      toast.error(msg);
    } finally {
      setIsDenying(null);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  const getMatchScoreColor = (score: number) => {
    if (score > 70) return 'text-green-500 border-green-500 bg-green-50';
    if (score >= 50) return 'text-orange-500 border-orange-500 bg-orange-50';
    return 'text-red-500 border-red-500 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-navy-900 selection:bg-blue-600/10 selection:text-blue-600">
      <Toaster position="top-right" richColors />

      {/* Sidebar */}
      <StudentSidebar unreadNotifications={unreadNotifications} />

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen">
        <StudentHeader 
          title="Search Offers"
          subtitle="Find your perfect internship match"
          profile={profile}
          unreadNotifications={unreadNotifications}
        />

        <div className="p-12 space-y-10 max-w-7xl mx-auto">
          {/* Filter Bar */}
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-premium">
            <div className="flex flex-wrap lg:grid lg:grid-cols-12 gap-4 lg:gap-6">
              <div className="w-full lg:col-span-4 relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors pointer-events-none">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search by title or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900 shadow-sm"
                />
              </div>

              <div className="flex-1 min-w-[140px] lg:col-span-3">
                <select
                  value={selectedWilaya}
                  onChange={(e) => setSelectedWilaya(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-[11px] uppercase tracking-widest text-navy-900 appearance-none cursor-pointer shadow-sm"
                >
                  <option value="ALL">All Wilayas</option>
                  {ALGERIA_WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>

              <div className="flex-1 min-w-[140px] lg:col-span-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-2xl py-4 px-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-[11px] uppercase tracking-widest text-navy-900 appearance-none cursor-pointer shadow-sm"
                >
                  {OFFER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="w-full lg:col-span-3 flex gap-3">
                <button
                  onClick={fetchData}
                  className="flex-1 bg-blue-600 text-white h-[56px] rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-navy-900 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Search size={16} />
                  Search
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-slate-200 rounded-2xl grow lg:grow-0 px-6 outline-none focus:border-blue-600/30 transition-all font-bold text-[11px] uppercase tracking-widest text-navy-900 appearance-none cursor-pointer shadow-sm min-w-[140px]"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between px-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30">
                {filteredOffers.length} offers found
              </p>
            </div>
          </div>

          {/* Offers List */}
          <div className="space-y-6">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-40 bg-white rounded-[3rem] border border-gray-100 animate-pulse" />
              ))
            ) : filteredOffers.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center border-dashed"
              >
                <div className="w-20 h-20 bg-paper rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-navy-900/10">
                  <Filter size={40} />
                </div>
                <h4 className="text-xl font-display font-bold text-navy-900 mb-2">No offers found</h4>
                <p className="text-navy-900/40 font-medium max-w-xs mx-auto">Try adjusting your filters or search terms.</p>
              </motion.div>
            ) : (
              filteredOffers.map((offer, i) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-gray-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 group relative overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                    {/* Brand & Info Section */}
                    <div className="flex items-center gap-6 min-w-[350px]">
                      <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center border border-gray-100/50 group-hover:scale-105 transition-transform duration-500 shrink-0 shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-navy-900/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-2xl font-black text-navy-900/10">
                          {(offer.companyName || '?')[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-bold text-navy-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
                            {offer.title}
                          </h4>
                          {/* Work Mode Badge */}
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            ['REMOTE', 'ONLINE'].includes((offer.type || '').toUpperCase())
                              ? 'bg-purple-50 text-purple-600' 
                              : 'bg-blue-50 text-blue-600'
                          }`}>
                            {['REMOTE', 'ONLINE'].includes((offer.type || '').toUpperCase()) ? 'Remote / Online' : 'In-Person'}
                          </span>
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-gray-500 font-bold tracking-tight">
                            <span className="text-[13px]">{offer.companyName}</span>
                            <div className="w-1 h-1 rounded-full bg-gray-300" />
                            <div className="flex items-center gap-1">
                              <MapPin size={14} className="text-gray-400" />
                              <span className="text-[12px] uppercase tracking-tighter">{offer.wilaya}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-orange-500/80 font-bold tracking-tight">
                            <Clock size={12} />
                            <span className="text-[10px] uppercase">Ends {offer.deadline || 'Soon'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Skills Section */}
                    <div className="flex-1 flex flex-wrap gap-2 items-center justify-start lg:justify-center">
                      {Array.isArray(offer.skills) && offer.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-5 py-2 bg-gray-50 rounded-xl text-[11px] font-bold text-gray-400 tracking-wide border border-gray-100/50 hover:bg-white hover:shadow-sm transition-all duration-300">
                          {typeof skill === 'string' ? skill : (skill as any).skillName || (skill as any).name || 'Skill'}
                        </span>
                      ))}
                      {offer.skills && offer.skills.length > 3 && (
                        <span className="text-[11px] font-black text-gray-300 ml-2 tracking-widest">+{offer.skills.length - 3}</span>
                      )}
                    </div>

                    {/* Match & Actions Section */}
                    <div className="flex items-center gap-10 shrink-0">
                      {/* Match Circle */}
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90 transform">
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-gray-100"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="34"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={213.63}
                            strokeDashoffset={213.63 - (213.63 * offer.matchingScore) / 100}
                            strokeLinecap="round"
                            className={`transition-all duration-1000 ease-out ${
                              offer.matchingScore < 50 ? 'text-slate-400' : 
                              offer.matchingScore >= 80 ? 'text-emerald-500' : 'text-blue-500'
                            }`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
                          <span className={`text-[15px] font-display font-black ${
                            offer.matchingScore < 50 ? 'text-slate-600' : 
                            offer.matchingScore >= 80 ? 'text-emerald-600' : 'text-blue-600'
                          }`}>
                            {offer.matchingScore}%
                          </span>
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Match</span>
                        </div>
                      </div>

                      {/* Action Area */}
                      <div className="flex items-center gap-4 min-w-[300px]">
                        <button
                          onClick={() => navigate(`/student/offers/${offer.id}`)}
                          className="flex-1 h-[56px] px-8 bg-blue-600 text-white rounded-[1.25rem] text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-navy-900 transition-all shadow-[0_12px_24px_rgba(37,99,235,0.2)] active:scale-95"
                        >
                          View Details
                        </button>
                        
                        <div className="shrink-0 flex flex-col gap-2 min-w-[120px]">
                          {offer.status === 'PENDING' ? (
                            <>
                              <div className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-50 rounded-xl text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100/50">
                                <CheckCircle2 size={16} />
                                Applied
                              </div>
                              <button
                                onClick={() => offer.applicationId && handleDeny(offer.applicationId)}
                                disabled={isDenying === offer.applicationId}
                                className="flex items-center justify-center gap-2 py-3 px-4 bg-transparent text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all border border-red-200 active:scale-95"
                              >
                                {isDenying === offer.applicationId ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                Withdraw
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setShowConfirmModal(offer.id)}
                              disabled={isApplying === offer.id || offer.remainingSpots === 0}
                              className={`h-[56px] px-6 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                offer.remainingSpots === 0 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100/50 active:scale-95'
                              }`}
                            >
                              {isApplying === offer.id ? (
                                <Loader2 size={18} className="animate-spin" />
                              ) : offer.remainingSpots === 0 ? (
                                'Full'
                              ) : (
                                <>
                                  <Plus size={16} />
                                  Apply
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Refined Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy-900/30 backdrop-blur-[4px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <FileCheck size={24} />
                </div>
                
                <h3 className="text-xl font-bold text-navy-900 mb-2 tracking-tight">Confirm Application</h3>
                <p className="text-sm text-gray-500 font-medium mb-6 px-4">
                  Are you sure you want to apply for this position?
                </p>
                
                <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-2xl mb-8 border border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                    <AlertTriangle size={16} className="text-orange-600" />
                  </div>
                  <p className="text-[11px] font-semibold text-gray-400 text-left leading-tight">
                    <span className="text-navy-900 block font-bold uppercase tracking-widest text-[9px] mb-0.5">Important Notice</span>
                    Applications are final and cannot be withdrawn once accepted.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmModal(null)}
                    className="flex-1 py-3 text-gray-400 font-bold text-[11px] uppercase tracking-widest hover:text-navy-900 hover:bg-gray-50 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleApply(showConfirmModal)}
                    disabled={isApplying === showConfirmModal}
                    className="flex-[1.5] py-3 bg-blue-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-navy-900 transition-all shadow-lg shadow-blue-600/10 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    {isApplying === showConfirmModal ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      'Confirm & Apply'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Application Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-navy-900/60 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white w-full max-w-md rounded-[3.5rem] p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden relative border border-white/20"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/5 rounded-full -mt-32 blur-3xl" />
              
              <div className="relative z-10 text-center">
                <div className="w-28 h-28 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-emerald-100 relative">
                  <PartyPopper size={52} className="text-emerald-500" />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-2 -right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
                  >
                    <CheckCircle2 size={24} className="text-emerald-500" />
                  </motion.div>
                </div>

                <h3 className="text-3xl font-display font-bold text-navy-900 mb-2 tracking-tight">Application Sent!</h3>
                <p className="text-navy-900/50 font-medium mb-12 text-base leading-relaxed">
                  Your profile has been submitted to the company. We'll notify you as soon as they review it!
                </p>

                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-bold text-[13px] uppercase tracking-[0.2em] hover:bg-navy-900 transition-all shadow-[0_20px_40px_rgba(37,99,235,0.2)] active:scale-95"
                >
                  Great, thanks!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchOffers;