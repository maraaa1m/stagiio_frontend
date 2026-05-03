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
import api from '@/api';
import { toast, Toaster } from 'sonner';

interface Notification {
  id: number;
  message: string;
  created_at: string;
  is_read: boolean;
}

import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ firstName: string; lastName: string; photoUrl?: string } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [filter, setFilter]               = useState<'ALL' | 'UNREAD'>('ALL');

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
        console.error('Error fetching profile in notifications:', err);
      }
    };

    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const res  = await api.get('/api/notifications/');
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data?.notifications || res.data?.results || []);
        setNotifications(list);
      } catch {
        toast.error('Failed to load notifications.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
    fetchNotifications();
  }, []);

  const markRead = async (id: number) => {
    try {
      await api.put(`/api/notifications/${id}/read/`, {});
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n),
      );
      window.dispatchEvent(new CustomEvent('notifications-updated'));
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.allSettled(
        unread.map(n => api.put(`/api/notifications/${n.id}/read/`, {}))
      );
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      window.dispatchEvent(new CustomEvent('notifications-updated'));
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to mark notifications as read.');
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
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-navy-900 selection:bg-blue-600/10 selection:text-blue-600">
      <Toaster position="top-right" richColors />

      {/* Sidebar */}
      <StudentSidebar unreadNotifications={unreadCount} />

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen">
        {/* Header */}
        <StudentHeader 
          title="Notifications" 
          subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          profile={profile}
          unreadNotifications={unreadCount}
        />

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