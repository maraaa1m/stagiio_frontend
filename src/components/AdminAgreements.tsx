import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard, Building2, ClipboardList, BarChart3, LogOut, Bell,
  FileText, Download, Search, User, Briefcase, Calendar,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'sonner';

interface Agreement {
  id: number;
  student: string;
  company: string;
  offer: string;
  generatedOn: string;
  pdfUrl: string | null;
}

const AdminAgreements = () => {
  const navigate = useNavigate();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [search, setSearch]         = useState('');

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('access_token')}` });

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get('/api/admin/agreements/', { headers: headers() });
        setAgreements(Array.isArray(res.data) ? res.data : []);
      } catch {
        toast.error('Failed to load agreements.');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSignOut = () => { localStorage.clear(); navigate('/login'); };

  const displayed = search
    ? agreements.filter(a =>
        a.student.toLowerCase().includes(search.toLowerCase()) ||
        a.company.toLowerCase().includes(search.toLowerCase()) ||
        a.offer.toLowerCase().includes(search.toLowerCase()),
      )
    : agreements;

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
          <Link to="/admin/companies" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <Building2 size={18} className="group-hover:scale-110 transition-transform" />Companies
          </Link>
          <Link to="/admin/agreements" className="flex items-center gap-4 px-4 py-3.5 bg-blue-600 rounded-2xl text-[13px] font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 group">
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
            <h2 className="text-2xl font-display font-bold text-navy-900 tracking-tight">Agreements</h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 mt-1">Validated internship conventions de stage</p>
          </div>
          <button className="relative p-3 bg-paper rounded-2xl text-navy-900/40 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100">
            <Bell size={20} /><span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
          </button>
        </header>

        <div className="p-12 space-y-10 max-w-7xl mx-auto">
          {/* Summary */}
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm flex items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><FileText size={24} /></div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-900/30 mb-1">Total Agreements</p>
                <h3 className="text-3xl font-display font-bold text-navy-900">{agreements.length}</h3>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors"><Search size={16} /></div>
              <input type="text" placeholder="Search by student, company or offer..." value={search} onChange={e => setSearch(e.target.value)}
                className="bg-paper border border-gray-100 rounded-2xl py-3.5 pl-12 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900 w-96" />
            </div>
          </div>

          {/* List */}
          <div className="space-y-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />)
            ) : displayed.length === 0 ? (
              <div className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center border-dashed">
                <FileText size={40} className="mx-auto mb-4 text-navy-900/10" />
                <h4 className="text-xl font-display font-bold text-navy-900 mb-2">No agreements yet</h4>
                <p className="text-navy-900/40 font-medium">Validated internships will appear here.</p>
              </div>
            ) : (
              displayed.map((ag, i) => (
                <motion.div key={ag.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-premium transition-all group">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl">
                        {ag.student[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User size={12} className="text-navy-900/30" />
                          <h4 className="font-display font-bold text-navy-900">{ag.student}</h4>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-navy-900/30">
                          <span className="flex items-center gap-1.5"><Building2 size={10} />{ag.company}</span>
                          <span className="flex items-center gap-1.5"><Briefcase size={10} />{ag.offer}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-navy-900/40">
                      <Calendar size={14} />
                      <span className="text-[11px] font-bold uppercase tracking-widest">{ag.generatedOn}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-5 py-2.5 bg-green-50 text-green-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-green-100">
                        Validated
                      </span>
                      {ag.pdfUrl ? (
                        <a href={ag.pdfUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-navy-900 transition-all shadow-lg shadow-blue-600/10">
                          <Download size={14} />Download PDF
                        </a>
                      ) : (
                        <span className="px-5 py-2.5 bg-paper text-navy-900/30 rounded-xl text-[10px] font-bold uppercase tracking-widest">No PDF</span>
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

export default AdminAgreements;