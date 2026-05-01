import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Search, 
  Briefcase, 
  ClipboardList, 
  User, 
  LogOut, 
  Bell, 
  MapPin, 
  Clock, 
  TrendingUp, 
  ChevronRight, 
  Filter,
  Loader2,
  Plus,
  ExternalLink
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { toast, Toaster } from 'sonner';
import { ALGERIA_WILAYAS, OFFER_TYPES, SORT_OPTIONS } from '../constants';

interface Offer {
  id: number;
  title: string;
  company: string;
  wilaya: string;
  type: string;
  skills: string[];
  matchingScore: number;
  deadline: string;
  remainingSpots: number;
  applicationDate?: string;
}

import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';

const SearchOffers = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ firstName: string; lastName: string; photoUrl?: string } | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [sortBy, setSortBy] = useState('match');
  const [isApplying, setIsApplying] = useState<number | null>(null);

  const fetchOffers = async () => {
    setIsLoading(true);
    
    try {
      let url = '/api/offers/recommended/';
      const params = new URLSearchParams();
      if (selectedWilaya !== 'ALL') params.append('wilaya', selectedWilaya);
      if (selectedType !== 'ALL') params.append('type', selectedType);
      if (searchQuery) params.append('search', searchQuery);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await api.get(url);
      const data = Array.isArray(response.data) ? response.data : (response.data?.offers || []);
      
      // Map data to handle snake_case
      const mappedData = data.map((o: any) => ({
        id: o.id,
        title: o.title,
        companyName: o.company || o.company_name,
        wilaya: o.willaya || o.wilaya,
        type: o.type,
        skills: o.requiredSkills || o.required_skills || [],
        matchingScore: o.matchingScore || o.matching_score || 0,
        remainingSpots: o.remainingSpots !== undefined ? o.remainingSpots : o.remaining_spots,
        deadline: o.deadline
      }));

      // Sort data
      let sorted = [...mappedData];
      if (sortBy === 'match') sorted.sort((a, b) => b.matchingScore - a.matchingScore);
      else if (sortBy === 'newest') sorted.sort((a, b) => b.id - a.id);
      else if (sortBy === 'deadline') sorted.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

      setOffers(sorted);
    } catch (err) {
      console.error('Error fetching offers:', err);
      toast.error('Failed to load offers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/student/profile/');
        const pData = res.data;
        setProfile({
          firstName: pData.firstName || pData.first_name,
          lastName: pData.lastName || pData.last_name,
          photoUrl: pData.profile_photo || pData.profilePhoto || pData.photoUrl || pData.photo_url || pData.photo || ''
        });
      } catch (err) {
        console.error('Error fetching profile in SearchOffers:', err);
      }
    };
    fetchProfile();
    fetchOffers();
  }, [selectedWilaya, selectedType, sortBy]);

  const handleApply = async (offerId: number) => {
    setIsApplying(offerId);
    try {
      await api.post('/api/applications/apply/', { offer_id: offerId });
      toast.success('Application submitted successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to apply.';
      toast.error(msg);
    } finally {
      setIsApplying(null);
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
      <StudentSidebar />

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen">
        {/* Header */}
        <StudentHeader 
          title="Search Opportunities" 
          subtitle="Find the perfect internship for your skills"
          profile={profile}
        />

        <div className="p-12 space-y-10 max-w-7xl mx-auto">
          {/* Filter Bar */}
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-premium">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                  <Search size={18} />
                </div>
                <input 
                  type="text"
                  placeholder="Search by title or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                />
              </div>

              <div className="lg:col-span-3">
                <select 
                  value={selectedWilaya}
                  onChange={(e) => setSelectedWilaya(e.target.value)}
                  className="w-full bg-paper border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-[11px] uppercase tracking-widest text-navy-900 appearance-none cursor-pointer"
                >
                  <option value="ALL">All Wilayas</option>
                  {ALGERIA_WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>

              <div className="lg:col-span-2">
                <select 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-paper border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-[11px] uppercase tracking-widest text-navy-900 appearance-none cursor-pointer"
                >
                  {OFFER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="lg:col-span-3 flex gap-4">
                <button 
                  onClick={fetchOffers}
                  className="flex-1 bg-blue-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-navy-900 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Search size={16} />
                  Search
                </button>
                <div className="relative group">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="h-full bg-paper border border-gray-100 rounded-2xl px-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-[11px] uppercase tracking-widest text-navy-900 appearance-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between px-2">
              <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30">
                {offers.length} offers found
              </p>
            </div>
          </div>

          {/* Offers List */}
          <div className="space-y-6">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-40 bg-white rounded-[3rem] border border-gray-100 animate-pulse" />
              ))
            ) : offers.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center border-dashed"
              >
                <div className="w-20 h-20 bg-paper rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-navy-900/10">
                  <Filter size={40} />
                </div>
                <h4 className="text-xl font-display font-bold text-navy-900 mb-2">No offers found matching your criteria</h4>
                <p className="text-navy-900/40 font-medium max-w-xs mx-auto">Try adjusting your filters or search terms to find more opportunities.</p>
              </motion.div>
            ) : (
              offers.map((offer, i) => (
                <motion.div 
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-premium transition-all group relative overflow-hidden"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-navy-900 text-white flex items-center justify-center font-bold text-2xl shadow-xl shadow-navy-900/10 group-hover:bg-blue-600 transition-colors duration-500">
                        {offer.company[0]}
                      </div>
                      <div>
                        <h4 className="text-xl font-display font-bold text-navy-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">{offer.title}</h4>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30">{offer.company}</p>
                        {offer.remainingSpots !== undefined && (
                          <div className={`mt-2 inline-flex px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${offer.remainingSpots > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                            {offer.remainingSpots} {offer.remainingSpots === 1 ? 'Spot' : 'Spots'} Left
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <div className="px-4 py-2 bg-paper rounded-xl text-[10px] font-bold uppercase tracking-widest text-navy-900/60 flex items-center gap-2">
                        <MapPin size={12} />
                        {offer.wilaya}
                      </div>
                      <div className="px-4 py-2 bg-blue-50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-blue-600 border border-blue-100/30">
                        {offer.type}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-wrap gap-2">
                      {offer.skills.slice(0, 4).map(skill => (
                        <span key={skill} className="px-3 py-1.5 bg-paper rounded-lg text-[10px] font-bold text-navy-900/40 uppercase tracking-widest">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-8">
                      <div className={`w-16 h-16 rounded-full border-4 flex flex-col items-center justify-center ${getMatchScoreColor(offer.matchingScore)}`}>
                        <span className="text-lg font-display font-bold leading-none">{offer.matchingScore}%</span>
                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-60">Match</span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-orange-500">
                          <Clock size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Ends {offer.deadline}</span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => navigate(`/student/offers/${offer.id}`)}
                            className="px-5 py-3 bg-paper text-navy-900 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-navy-900 hover:text-white transition-all"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => handleApply(offer.id)}
                            disabled={isApplying === offer.id || offer.remainingSpots === 0}
                            className={`px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 ${
                              offer.remainingSpots === 0 
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                                : 'bg-blue-600 text-white hover:bg-navy-900 shadow-blue-600/10'
                            }`}
                          >
                            {isApplying === offer.id ? <Loader2 size={14} className="animate-spin" /> : offer.remainingSpots === 0 ? 'Offer Saturated' : 'Apply'}
                          </button>
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
    </div>
  );
};

export default SearchOffers;