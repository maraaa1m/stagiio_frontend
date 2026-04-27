import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Building2, ClipboardList, BarChart3, LogOut, Bell,
  CheckCircle2, X, Loader2, MapPin, Globe, Phone, ShieldX, Search,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'sonner';

interface Company {
  id: number;
  companyName: string;
  email: string;
  location: string;
  website: string;
  phoneNumber: string;
  isBlacklisted: boolean;
  totalOffers: number;
}

const AdminCompanies = () => {
  const navigate = useNavigate();
  const [companies, setCompanies]           = useState<Company[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  const [search, setSearch]                 = useState('');
  const [activeTab, setActiveTab]           = useState<'APPROVED' | 'BLACKLISTED'>('APPROVED');

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('access_token')}` });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [approvedRes, blacklistRes] = await Promise.all([
        axios.get('/api/admin/companies/', { headers: headers() }),
        axios.get('/api/admin/companies/blacklisted/', { headers: headers() }),
      ]);
      const approved    = (Array.isArray(approvedRes.data) ? approvedRes.data : []).map((c: any) => ({ ...c, isBlacklisted: false }));
      const blacklisted = (Array.isArray(blacklistRes.data) ? blacklistRes.data : []).map((c: any) => ({ ...c, isBlacklisted: true, totalOffers: 0 }));
      setCompanies([...approved, ...blacklisted]);
    } catch {
      toast.error('Failed to load companies.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBlacklist = async (id: number) => {
    setIsActionLoading(id);
    try {
      await axios.put(`/api/admin/companies/${id}/blacklist/`, {}, { headers: headers() });
      toast.success('Company blacklisted.');
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, isBlacklisted: true } : c));
    } catch {
      toast.error('Action failed.');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleSignOut = () => { localStorage.clear(); navigate('/login'); };

  const displayed = companies
    .filter(c => activeTab === 'APPROVED' ? !c.isBlacklisted : c.isBlacklisted)
    .filter(c =>
      !search || c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-navy-900">
      <Toaster position="top-right" richColors />

      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#060D1F] text-white flex flex-col z-50 border-r border-white/5">
        <div className="p-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-3 h-3 rounded-full bg-blue-600 group-hover:scale-125 transition-transform duration-500" />
            <span className="font-bold text-2xl tracking-tighter">Stag<span className="text-blue-600">.io</span></span>
          </Link>
        </div>
        <nav className="flex-1 px-6 space-y-1.5">
          <div className="pb-4 px-4"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Main Menu</p></div>
          <Link to="/admin/dashboard" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />Dashboard
          </Link>
          <Link to="/admin/companies" className="flex items-center gap-4 px-4 py-3.5 bg-blue-600 rounded-2xl text-[13px] font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 group">
            <Building2 size={18} className="group-hover:scale-110 transition-transform" />Companies
          </Link>
          <Link to="/admin/agreements" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <ClipboardList size={18} className="group-hover:scale-110 transition-transform" />Agreements
          </Link>
          <Link to="/admin/statistics" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <BarChart3 size={18} className="group-hover:scale-110 transition-transform" />Statistics
          </Link>
        </nav>
        <div className="p-8 border-t border-white/5">
          <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-3 py-3.5 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5">
            <LogOut size={16} />Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 min-h-screen">
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-40">
          <div>
            <h2 className="text-2xl font-display font-bold text-navy-900 tracking-tight">Companies</h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 mt-1">Manage partner organizations</p>
          </div>
          <button className="relative p-3 bg-paper rounded-2xl text-navy-900/40 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100">
            <Bell size={20} /><span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
          </button>
        </header>

        <div className="p-12 space-y-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-2 p-1.5 bg-paper rounded-2xl w-fit border border-gray-100">
              {(['APPROVED', 'BLACKLISTED'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-navy-900/40 hover:text-navy-900'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors"><Search size={16} /></div>
              <input type="text" placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)}
                className="bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900 w-72" />
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <div key={i} className="h-28 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />)
            ) : displayed.length === 0 ? (
              <div className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center border-dashed">
                <Building2 size={40} className="mx-auto mb-4 text-navy-900/10" />
                <h4 className="text-xl font-display font-bold text-navy-900 mb-2">No companies found</h4>
              </div>
            ) : (
              displayed.map((company, i) => (
                <motion.div key={company.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-premium transition-all group">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-navy-900 text-white flex items-center justify-center font-bold text-xl shadow-xl shadow-navy-900/10 group-hover:bg-blue-600 transition-colors duration-500">
                        {company.companyName[0]}
                      </div>
                      <div>
                        <h4 className="text-lg font-display font-bold text-navy-900 mb-1">{company.companyName}</h4>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30">{company.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-[11px] font-bold uppercase tracking-widest text-navy-900/40">
                      <span className="flex items-center gap-1.5"><MapPin size={12} />{company.location}</span>
                      {company.website && <span className="flex items-center gap-1.5"><Globe size={12} />{company.website}</span>}
                      {company.phoneNumber && <span className="flex items-center gap-1.5"><Phone size={12} />{company.phoneNumber}</span>}
                      {!company.isBlacklisted && (
                        <span className="flex items-center gap-1.5 text-blue-600">{company.totalOffers} offers</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {company.isBlacklisted ? (
                        <span className="px-5 py-2.5 bg-red-50 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-red-100">Blacklisted</span>
                      ) : (
                        <>
                          <span className="px-5 py-2.5 bg-green-50 text-green-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-green-100 flex items-center gap-2">
                            <CheckCircle2 size={12} />Approved
                          </span>
                          <button onClick={() => handleBlacklist(company.id)} disabled={isActionLoading === company.id}
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-50">
                            {isActionLoading === company.id ? <Loader2 size={14} className="animate-spin" /> : <ShieldX size={14} />}
                            Blacklist
                          </button>
                        </>
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

export default AdminCompanies;