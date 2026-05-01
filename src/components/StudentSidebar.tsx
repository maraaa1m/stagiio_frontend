import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  ClipboardList, 
  User, 
  Bell, 
  LogOut
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api';

interface StudentSidebarProps {
  unreadNotifications?: number;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ unreadNotifications: initialUnreadCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadNotifications, setUnreadNotifications] = useState(initialUnreadCount || 0);
  const [profile, setProfile] = useState<{ firstName: string; lastName: string; photoUrl?: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, notificationsRes] = await Promise.allSettled([
          api.get('/api/student/profile/'),
          api.get('/api/notifications/')
        ]);

        if (profileRes.status === 'fulfilled') {
          const pData = profileRes.value.data;
          setProfile({
            firstName: pData.firstName || pData.first_name,
            lastName: pData.lastName || pData.last_name,
            photoUrl: pData.profile_photo || pData.profilePhoto || pData.photoUrl || pData.photo_url || pData.photo || ''
          });
        }

        if (notificationsRes.status === 'fulfilled') {
          setUnreadNotifications(notificationsRes.value.data.count || 0);
        }
      } catch (err) {
        console.error('Error fetching sidebar data:', err);
      }
    };

    fetchData();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const getInitials = () => {
    if (!profile) return 'S';
    return `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();
  };

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children, badge }: any) => (
    <Link 
      to={to} 
      className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group relative ${
        isActive(to) 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
          : 'text-white/40 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={18} className={`${isActive(to) ? '' : 'group-hover:scale-110'} transition-transform`} />
      {children}
      {badge !== undefined && badge > 0 && (
        <span className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
          isActive(to) ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
        }`}>
          {badge}
        </span>
      )}
    </Link>
  );

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 bg-[#060D1F] text-white flex flex-col z-50 border-r border-white/5">
      <div className="p-10">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-3 h-3 rounded-full bg-blue-600 group-hover:scale-125 transition-transform duration-500 shadow-lg shadow-blue-600/50"></div>
          <span className="font-bold text-2xl tracking-tighter">Stag<span className="text-blue-600">.io</span></span>
        </Link>
      </div>

      <nav className="flex-1 px-6 space-y-1.5">
        <div className="pb-4 px-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Main Menu</p>
        </div>
        
        <NavLink to="/student/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>
        <NavLink to="/student/offers" icon={Search}>Search Offers</NavLink>
        <NavLink to="/student/applications" icon={ClipboardList}>My Applications</NavLink>
        
        <div className="pt-8 pb-4 px-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Account</p>
        </div>
        
        <NavLink to="/student/profile" icon={User}>My Profile</NavLink>
        <NavLink to="/notifications" icon={Bell} badge={unreadNotifications}>Notifications</NavLink>
      </nav>

      <div className="p-8 border-t border-white/5">
        <div className="bg-white/5 rounded-[2.5rem] p-5 border border-white/5 backdrop-blur-sm shadow-2xl shadow-black/20">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-600/20">
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                getInitials()
              )}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-sm truncate leading-tight">{profile?.firstName} {profile?.lastName}</p>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest truncate mt-1">Student</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white/5 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/5 group"
          >
            <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default StudentSidebar;