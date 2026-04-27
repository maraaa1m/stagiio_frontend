import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  BarChart3,
  LogOut,
  Bell,
  Users,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  TrendingUp,
  FileText,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'sonner';

interface Stats {
  total_students: number;
  placed_students: number;
  unplaced_students: number;
  total_companies: number;
  pending_companies: number;
  total_offers: number;
  total_applications: number;
  pending_applications: number;
  accepted_applications: number;
  validated_applications: number;
  refused_applications: number;
}

const StatCard = ({
  label,
  value,
  icon,
  color,
  bg,
  delay = 0,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-premium transition-all group"
  >
    <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
      {icon}
    </div>
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-900/30 mb-2">{label}</p>
    <h4 className="text-4xl font-display font-bold text-navy-900 tracking-tighter">{value}</h4>
  </motion.div>
);

/* Minimal horizontal bar */
const Bar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-bold uppercase tracking-widest text-navy-900/50">{label}</span>
        <span className="text-[11px] font-bold text-navy-900">{value} <span className="text-navy-900/30">({pct}%)</span></span>
      </div>
      <div className="h-2.5 bg-paper rounded-full overflow-hidden border border-gray-50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
};

const AdminStatistics = () => {
  const navigate = useNavigate();
  const [stats, setStats]       = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      try {
        const res = await axios.get('/api/admin/statistics/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch {
        toast.error('Failed to load statistics.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleSignOut = () => {
    localStorage.clear();
    navigate('/login');
  };

  const placementRate = stats && stats.total_students > 0
    ? Math.round((stats.placed_students / stats.total_students) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-navy-900">
      <Toaster position="top-right" richColors />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#060D1F] text-white flex flex-col z-50 border-r border-white/5">
        <div className="p-10">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-3 h-3 rounded-full bg-blue-600 group-hover:scale-125 transition-transform duration-500" />
            <span className="font-bold text-2xl tracking-tighter">Stag<span className="text-blue-600">.io</span></span>
          </Link>
        </div>
        <nav className="flex-1 px-6 space-y-1.5">
          <div className="pb-4 px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Main Menu</p>
          </div>
          <Link to="/admin/dashboard" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
            Dashboard
          </Link>
          <Link to="/admin/companies" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <Building2 size={18} className="group-hover:scale-110 transition-transform" />
            Companies
          </Link>
          <Link to="/admin/agreements" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <ClipboardList size={18} className="group-hover:scale-110 transition-transform" />
            Agreements
          </Link>
          <Link to="/admin/statistics" className="flex items-center gap-4 px-4 py-3.5 bg-blue-600 rounded-2xl text-[13px] font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 group">
            <BarChart3 size={18} className="group-hover:scale-110 transition-transform" />
            Statistics
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

      <main className="flex-1 ml-72 min-h-screen">
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-40">
          <div>
            <h2 className="text-2xl font-display font-bold text-navy-900 tracking-tight">Statistics</h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 mt-1">Platform overview and analytics</p>
          </div>
          <button className="relative p-3 bg-paper rounded-2xl text-navy-900/40 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
          </button>
        </header>

        <div className="p-12 space-y-12 max-w-7xl mx-auto">

          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
          ) : !stats ? null : (
            <>
              {/* Placement hero */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden bg-[#060D1F] rounded-[3rem] p-12 text-white"
              >
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                  {/* Circular progress */}
                  <div className="relative w-40 h-40 shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="70" stroke="white" strokeOpacity="0.1" strokeWidth="14" fill="transparent" />
                      <motion.circle
                        cx="80" cy="80" r="70"
                        stroke="#2563EB" strokeWidth="14" fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={440}
                        initial={{ strokeDashoffset: 440 }}
                        animate={{ strokeDashoffset: 440 - (440 * placementRate) / 100 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-display font-bold">{placementRate}%</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Placed</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-3xl font-display font-bold tracking-tight mb-2">Student Placement Rate</h3>
                      <p className="text-white/50 font-medium">
                        {stats.placed_students} out of {stats.total_students} students have validated internships.
                      </p>
                    </div>
                    <div className="flex gap-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Placed</p>
                        <p className="text-2xl font-display font-bold text-green-400">{stats.placed_students}</p>
                      </div>
                      <div className="w-px bg-white/10" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Unplaced</p>
                        <p className="text-2xl font-display font-bold text-orange-400">{stats.unplaced_students}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Students"   value={stats.total_students}   icon={<Users size={20} />}       color="text-blue-600"   bg="bg-blue-50"   delay={0.05} />
                <StatCard label="Active Companies" value={stats.total_companies}  icon={<Building2 size={20} />}   color="text-purple-500" bg="bg-purple-50" delay={0.1}  />
                <StatCard label="Total Offers"     value={stats.total_offers}     icon={<Briefcase size={20} />}   color="text-navy-900"   bg="bg-paper"     delay={0.15} />
                <StatCard label="Total Applications" value={stats.total_applications} icon={<FileText size={20} />} color="text-teal-600" bg="bg-teal-50"   delay={0.2}  />
              </div>

              {/* Two panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Applications breakdown */}
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-display font-bold text-navy-900 tracking-tight">Applications Breakdown</h3>
                    <TrendingUp size={20} className="text-blue-600" />
                  </div>
                  <div className="space-y-6">
                    <Bar label="Pending"   value={stats.pending_applications}   max={stats.total_applications} color="bg-orange-400" />
                    <Bar label="Accepted"  value={stats.accepted_applications}  max={stats.total_applications} color="bg-blue-500"   />
                    <Bar label="Validated" value={stats.validated_applications} max={stats.total_applications} color="bg-green-500"  />
                    <Bar label="Refused"   value={stats.refused_applications}   max={stats.total_applications} color="bg-red-400"    />
                  </div>

                  {/* Mini legend */}
                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                    {[
                      { label: 'Pending',   value: stats.pending_applications,   color: 'bg-orange-400', icon: <Clock size={12} /> },
                      { label: 'Accepted',  value: stats.accepted_applications,  color: 'bg-blue-500',   icon: <CheckCircle2 size={12} /> },
                      { label: 'Validated', value: stats.validated_applications, color: 'bg-green-500',  icon: <FileText size={12} /> },
                      { label: 'Refused',   value: stats.refused_applications,   color: 'bg-red-400',    icon: <XCircle size={12} /> },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.color} shrink-0`} />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-navy-900/40">{item.label}</span>
                        <span className="ml-auto text-[11px] font-bold text-navy-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform health */}
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-display font-bold text-navy-900 tracking-tight">Platform Health</h3>
                    <AlertCircle size={20} className="text-navy-900/20" />
                  </div>

                  <div className="space-y-5">
                    {[
                      {
                        label:  'Placement Rate',
                        value:  `${placementRate}%`,
                        sub:    `${stats.placed_students} students placed`,
                        color:  placementRate >= 70 ? 'text-green-600' : placementRate >= 40 ? 'text-orange-500' : 'text-red-500',
                        bg:     placementRate >= 70 ? 'bg-green-50 border-green-100' : placementRate >= 40 ? 'bg-orange-50 border-orange-100' : 'bg-red-50 border-red-100',
                      },
                      {
                        label: 'Companies Awaiting Approval',
                        value: String(stats.pending_companies),
                        sub:   'Require admin review',
                        color: stats.pending_companies > 0 ? 'text-orange-500' : 'text-green-600',
                        bg:    stats.pending_companies > 0 ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100',
                      },
                      {
                        label: 'Pending Applications',
                        value: String(stats.pending_applications),
                        sub:   'Awaiting company review',
                        color: stats.pending_applications > 10 ? 'text-orange-500' : 'text-blue-600',
                        bg:    stats.pending_applications > 10 ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100',
                      },
                      {
                        label: 'Validated Internships',
                        value: String(stats.validated_applications),
                        sub:   'Agreements generated',
                        color: 'text-green-600',
                        bg:    'bg-green-50 border-green-100',
                      },
                    ].map(item => (
                      <div key={item.label} className={`flex items-center justify-between p-5 rounded-2xl border ${item.bg}`}>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-navy-900/40 mb-1">{item.label}</p>
                          <p className="text-[11px] font-medium text-navy-900/50">{item.sub}</p>
                        </div>
                        <span className={`text-2xl font-display font-bold ${item.color}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminStatistics;