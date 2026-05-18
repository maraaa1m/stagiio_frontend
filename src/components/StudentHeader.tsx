import React, { useState, useEffect } from 'react';
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getInitials = () => {
    if (!profile) return 'S';
    return `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="sticky top-0 z-40 px-12 pt-4 pointer-events-none">
      <header className={`pointer-events-auto transition-all duration-500 ease-in-out border flex items-center justify-between ${
        isScrolled 
          ? 'bg-white/40 backdrop-blur-md shadow-xl border-white/20 py-3 px-8 rounded-full' 
          : 'bg-transparent border-transparent py-4 px-0'
      }`}>
        <div>
          <h2 className={`font-bold text-black tracking-tight font-display transition-all ${isScrolled ? 'text-lg' : 'text-2xl'}`}>
            {title}
          </h2>
          {!isScrolled && subtitle && (
            <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-6">
          {!isScrolled && (
            <div className="hidden md:flex items-center gap-4 px-5 py-2.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-black/40">System Online</span>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <Link 
              to="/notifications" 
              className={`relative bg-gray-50 text-black/40 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100 group ${isScrolled ? 'p-2.5 rounded-full' : 'p-3 rounded-2xl'}`}
            >
              <Bell size={isScrolled ? 18 : 20} className="group-hover:rotate-12 transition-transform" />
              {unreadNotifications !== undefined && unreadNotifications > 0 && (
                <span className={`absolute bg-blue-600 rounded-full border-2 border-white shadow-sm ${isScrolled ? 'top-1 right-1 w-2 h-2' : 'top-2.5 right-2.5 w-2.5 h-2.5'}`} />
              )}
            </Link>
            
            <Link to="/student/profile" className={`${isScrolled ? 'w-10 h-10' : 'w-12 h-12'} rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shadow-xl shadow-black/10 overflow-hidden ring-2 ring-transparent hover:ring-blue-600/20 transition-all`}>
              {profile?.photoUrl ? (
                <img src={profile.photoUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                getInitials()
              )}
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
};

export default StudentHeader;