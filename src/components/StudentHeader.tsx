import React from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StudentHeaderProps {
  title: string;
  subtitle?: string;
  profile: {
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
  } | null;
  unreadNotifications?: number;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({ title, subtitle, profile, unreadNotifications }) => {
  const getInitials = () => {
    if (!profile) return 'S';
    return `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-40">
      <div>
        <h2 className="text-2xl font-bold text-black tracking-tight font-display">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-8">
        <div className="hidden md:flex items-center gap-4 px-5 py-2.5 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-black/40">System Online</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            to="/notifications" 
            className="relative p-3 bg-gray-50 rounded-2xl text-black/40 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100 group"
          >
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            {unreadNotifications !== undefined && unreadNotifications > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
            )}
          </Link>
          
          <Link to="/student/profile" className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-xl shadow-black/10 overflow-hidden ring-2 ring-transparent hover:ring-blue-600/20 transition-all">
            {profile?.photoUrl ? (
              <img src={profile.photoUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              getInitials()
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default StudentHeader;