import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Search,
  ClipboardList,
  User,
  LogOut,
  Bell,
  CheckCircle2,
  CheckCheck,
  Plus,
  Loader2,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'sonner';

interface Notification {
  id: number;
  message: string;
  created_at: string;
  is_read: boolean;
}

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [filter, setFilter]               = useState<'ALL' | 'UNREAD'>('ALL');

  const headers = () => ({
    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const res  = await axios.get('/api/student/notifications/', { headers: headers() });
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data?.notifications || []);
        setNotifications(list);
      } catch {
        toast.error('Failed to load notifications.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markRead = async (id: number) => {
    try {
      await axios.put(`/api/notifications/${id}/read/`, {}, { headers: headers() });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n),
      );
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      // FIX: correct endpoint — student-scoped mark-all-read
      await axios.put('/api/student/notifications/read-all/', {}, { headers: headers() });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read.');
    } catch {
      // Fallback: mark each unread notification individually
      const unread = notifications.filter(n => !n.is_read);
      await Promise.allSettled(
        unread.map(n => axios.put(`/api/notifications/${n.id}/read/`, {}, { headers: headers() }))
      );
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read.');
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate('/login');
  };

  const displayed = filter === 'ALL'
    ? notifications
    : notifications.filter(n => !n.is_read);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

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
          <Link to="/student/dashboard" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
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
          <button onClick={() => navigate('/student/offers')} className="w-full flex items-center gap-4 px-4 py-3 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all"><Plus size={16} /></div>
            New Search
          </button>
          <div className="pt-8 pb-4 px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Account</p>
          </div>
          <Link to="/student/profile" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <User size={18} className="group-hover:scale-110 transition-transform" />
            My Profile
          </Link>
          <Link to="/student/notifications" className="flex items-center gap-4 px-4 py-3.5 bg-blue-600 rounded-2xl text-[13px] font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 group relative">
            <Bell size={18} className="group-hover:scale-110 transition-transform" />
            Notifications
            {unreadCount > 0 && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-white text-blue-600 rounded-full text-[10px] flex items-center justify-center font-bold">{unreadCount}</span>
            )}
          </Link>
        </nav>
        <div className="p-8 border-t border-white/5">
          <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-3 py-3.5 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-72 min-h-screen">
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-40">
          <div>
            <h2 className="text-2xl font-display font-bold text-navy-900 tracking-tight">Notifications</h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 px-6 py-3 bg-paper border border-gray-100 rounded-xl text-[11px] font-bold uppercase tracking-widest text-navy-900 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
              <CheckCheck size={16} />
              Mark All Read
            </button>
          )}
        </header>

        <div className="p-12 space-y-8 max-w-3xl mx-auto">
          {/* Filter */}
          <div className="flex items-center gap-2 p-1.5 bg-paper rounded-2xl w-fit border border-gray-100">
            {(['ALL', 'UNREAD'] as const).map(tab => (
              <button key={tab} onClick={() => setFilter(tab)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-navy-900/40 hover:text-navy-900'}`}>
                {tab} {tab === 'UNREAD' && unreadCount > 0 && `(${unreadCount})`}
              </button>
            ))}
          </div>

          {/* List */}
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
            ))
          ) : displayed.length === 0 ? (
            <div className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center border-dashed">
              <div className="w-20 h-20 bg-paper rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-navy-900/10">
                <Bell size={40} />
              </div>
              <h4 className="text-xl font-display font-bold text-navy-900 mb-2">
                {filter === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
              </h4>
              <p className="text-navy-900/40 font-medium">Updates about your applications will appear here.</p>
            </div>
          ) : (
            <AnimatePresence>
              {displayed.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => !n.is_read && markRead(n.id)}
                  className={`bg-white p-8 rounded-[2.5rem] border transition-all cursor-pointer hover:shadow-premium group ${
                    n.is_read ? 'border-gray-100' : 'border-blue-600/20 shadow-sm shadow-blue-600/5'
                  }`}
                >
                  <div className="flex items-start gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                      n.is_read ? 'bg-paper text-navy-900/20' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {n.is_read
                        ? <CheckCircle2 size={20} />
                        : <Bell size={20} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium leading-relaxed ${n.is_read ? 'text-navy-900/50' : 'text-navy-900'}`}>
                        {n.message}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 mt-2">
                        {formatDate(n.created_at)}
                      </p>
                    </div>
                    {!n.is_read && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-2" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>
    </div>
  );
};

export default NotificationsPage;