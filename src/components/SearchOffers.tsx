import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Search,
  ClipboardList,
  User,
  LogOut,
  Bell,
  MapPin,
  Clock,
  TrendingUp,
  Filter,
  Loader2,
  Plus,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
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
}

const SearchOffers = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [sortBy, setSortBy] = useState('match');
  const [isApplying, setIsApplying] = useState<number | null>(null);

  const fetchOffers = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const response = await axios.get('/api/offers/recommended/', { headers });
      // Backend returns: { offer_id, title, company, willaya, type, deadline, matchingScore, requiredSkills }
      const data = Array.isArray(response.data) ? response.data : (response.data?.offers || []);

      let mapped: Offer[] = data.map((o: any) => ({
        id: o.offer_id || o.id,
        title: o.title,
        companyName: o.company || o.company_name || '',
        wilaya: o.willaya || o.wilaya || '',
        type: o.type,
        skills: Array.isArray(o.requiredSkills) ? o.requiredSkills : (o.required_skills || []),
        matchingScore: o.matchingScore || o.matching_score || 0,
        deadline: o.deadline,
      }));

      // Client-side filters (the recommended endpoint doesn't support query params natively)
      if (selectedWilaya !== 'ALL') {
        mapped = mapped.filter((o) => o.wilaya === selectedWilaya);
      }
      if (selectedType !== 'ALL') {
        mapped = mapped.filter((o) => o.type === selectedType);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        mapped = mapped.filter(
          (o) => o.title.toLowerCase().includes(q) || o.companyName.toLowerCase().includes(q)
        );
      }

      // Sort
      if (sortBy === 'match') mapped.sort((a, b) => b.matchingScore - a.matchingScore);
      else if (sortBy === 'newest') mapped.sort((a, b) => b.id - a.id);
      else if (sortBy === 'deadline') mapped.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

      setOffers(mapped);
    } catch (err) {
      console.error('Error fetching offers:', err);
      toast.error('Failed to load offers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWilaya, selectedType, sortBy]);

  const handleApply = async (offerId: number) => {
    setIsApplying(offerId);
    const token = localStorage.getItem('access_token');
    try {
      await axios.post(
        '/api/applications/apply/',
        { offer_id: offerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
          <Link to="/student/offers" className="flex items-center gap-4 px-4 py-3.5 bg-blue-600 rounded-2xl text-[13px] font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 group">
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
            <h2 className="text-2xl font-display font-bold text-navy-900 tracking-tight">Search Offers</h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 mt-1">Find your perfect internship match</p>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-3 bg-paper rounded-2xl text-navy-900/40 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

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
                  onKeyDown={(e) => e.key === 'Enter' && fetchOffers()}
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
                  {ALGERIA_WILAYAS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>

              <div className="lg:col-span-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-paper border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-bold text-[11px] uppercase tracking-widest text-navy-900 appearance-none cursor-pointer"
                >
                  {OFFER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
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
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-paper border border-gray-100 rounded-2xl px-6 outline-none focus:border-blue-600/30 transition-all font-bold text-[11px] uppercase tracking-widest text-navy-900 appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
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
                <h4 className="text-xl font-display font-bold text-navy-900 mb-2">No offers found</h4>
                <p className="text-navy-900/40 font-medium max-w-xs mx-auto">Try adjusting your filters or search terms.</p>
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
                        {(offer.companyName || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xl font-display font-bold text-navy-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">{offer.title}</h4>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30">{offer.companyName}</p>
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
                      {offer.skills.slice(0, 4).map((skill) => (
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
                            disabled={isApplying === offer.id}
                            className="px-5 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-navy-900 transition-all shadow-lg shadow-blue-600/10 flex items-center gap-2"
                          >
                            {isApplying === offer.id ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
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
