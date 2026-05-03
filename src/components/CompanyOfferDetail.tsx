import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Briefcase, 
  User, 
  LogOut, 
  Bell, 
  MapPin, 
  Clock, 
  ChevronLeft,
  Loader2,
  TrendingUp,
  Search
} from 'lucide-react';
import api from '@/api';
import { toast, Toaster } from 'sonner';

interface OfferData {
  id: number;
  title: string;
  company: string;
  description: string;
  willaya: string;
  type: string;
  skills: string[];
  applicationDeadline: string;
  internshipStartDate: string;
  internshipEndDate: string;
  maxParticipants: number;
  applicantCount: number;
}

const CompanyOfferDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [companyProfile, setCompanyProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [offerRes, profileRes, appsRes] = await Promise.all([
          api.get(`/api/offers/${id}/`),
          api.get('/api/company/profile/'),
          api.get('/api/company/applications/')
        ]);

        const o = offerRes.data;
        const appsData = Array.isArray(appsRes.data) ? appsRes.data : (appsRes.data?.applications || appsRes.data?.results || []);
        
        const count = appsData.filter((a: any) => {
          const appOffId = a.offer_id || (typeof a.offer === 'object' ? a.offer.id : null);
          const appOffTitle = a.offer_title || (typeof a.offer === 'object' ? a.offer.title : a.offer);
          return appOffId === o.id || appOffId === Number(id) || appOffTitle === o.title;
        }).length;

        const rawSkills = o.skills || o.requiredSkills || o.required_skills || [];
        const skillsArray = Array.isArray(rawSkills) 
          ? rawSkills.map((s: any) => typeof s === 'string' ? s : s.skillName || s.name || String(s))
          : [];

        setOffer({
          id: o.id,
          title: o.title,
          company: o.companyName || o.company || '',
          description: o.description,
          willaya: o.willaya || o.wilaya,
          type: o.type,
          skills: skillsArray,
          applicationDeadline: o.applicationDeadline || o.deadline,
          internshipStartDate: o.internshipStartDate || o.startDate || o.start_date,
          internshipEndDate: o.internshipEndDate || o.endDate || o.end_date || '',
          maxParticipants: o.maxParticipants || 1,
          applicantCount: count || o.applicantCount || o.applicant_count || 0
        });

        setCompanyProfile(profileRes.data);
      } catch (err) {
        console.error('Error fetching offer:', err);
        toast.error('Failed to load offer details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
        <p className="text-navy-900/40 font-bold uppercase tracking-widest">Offer not found</p>
        <button onClick={() => navigate('/company/offers')} className="text-blue-600 font-bold">Back to Manage Offers</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-navy-900 selection:bg-blue-600/10 selection:text-blue-600">
      <Toaster position="top-right" richColors />
      
      {/* Sidebar (Copy from ManageOffers for consistency) */}
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
          
          <Link to="/company/dashboard" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
            Dashboard
          </Link>
          <Link to="/company/applications" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <ClipboardList size={18} className="group-hover:scale-110 transition-transform" />
            Applications
          </Link>
          <Link to="/company/offers" className="flex items-center gap-4 px-4 py-3.5 bg-blue-600 rounded-2xl text-[13px] font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 group">
            <Briefcase size={18} className="group-hover:scale-110 transition-transform" />
            Manage Offers
          </Link>
          
          <div className="pt-8 pb-4 px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Account</p>
          </div>
          
          <Link to="/company/profile" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <User size={18} className="group-hover:scale-110 transition-transform" />
            Company Profile
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
      <main className="flex-1 ml-72 min-h-screen pb-32">
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-40">
          <div>
            <h2 className="text-2xl font-display font-bold text-navy-900 tracking-tight">Offer Preview</h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 mt-1">Reference #{offer.id}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-3 bg-paper rounded-2xl text-navy-900/40 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-xl shadow-black/10">
              {(companyProfile?.companyName?.[0] || 'C').toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-12 space-y-12 max-w-5xl mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-navy-900/40 hover:text-blue-600 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center group-hover:border-blue-600/20 group-hover:bg-blue-50 transition-all">
              <ChevronLeft size={16} />
            </div>
            Back
          </button>

          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 rounded-[2rem] bg-navy-900 text-white flex items-center justify-center font-bold text-4xl shadow-2xl shadow-navy-900/20">
                {(companyProfile?.companyName?.[0] || 'C').toUpperCase()}
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold text-navy-900 tracking-tight mb-2">{offer.title}</h1>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-blue-600">{companyProfile?.companyName}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                  <div className="flex items-center gap-2 text-navy-900/40 font-bold uppercase tracking-widest text-[10px]">
                    <MapPin size={14} />
                    {offer.willaya}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-2xl text-[11px] font-bold uppercase tracking-widest border border-blue-100/30">
                {offer.type}
              </div>
              <div className="px-5 py-2.5 bg-orange-50 text-orange-600 rounded-2xl text-[11px] font-bold uppercase tracking-widest border border-orange-100/30 flex items-center gap-2">
                <Clock size={14} />
                Deadline: {offer.applicationDeadline}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
              <section>
                <h3 className="text-2xl font-display font-bold text-navy-900 mb-6 tracking-tight">Description</h3>
                <div className="prose prose-navy max-w-none text-navy-900/60 font-medium leading-relaxed whitespace-pre-wrap">
                  {offer.description}
                </div>
              </section>

              <section>
                <h3 className="text-2xl font-display font-bold text-navy-900 mb-6 tracking-tight">Required Skills</h3>
                <div className="flex flex-wrap gap-3">
                  {offer.skills.map(skill => (
                    <span key={skill} className="px-6 py-3 bg-paper rounded-2xl text-[11px] font-bold text-navy-900 uppercase tracking-widest border border-gray-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                <h4 className="text-lg font-display font-bold text-navy-900 tracking-tight">Offer Overview</h4>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 mb-1">Start Date</p>
                      <p className="text-sm font-bold text-navy-900">{offer.internshipStartDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 mb-1">Type</p>
                      <p className="text-sm font-bold text-navy-900">{offer.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 mb-1">Applicants</p>
                      <p className="text-sm font-bold text-navy-900">{offer.applicantCount} / {offer.maxParticipants} Spots</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Link 
                to="/company/applications"
                className="block w-full py-5 bg-navy-900 text-white rounded-[2rem] text-center font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-navy-900/10 active:scale-95 flex items-center justify-center gap-3"
              >
                <ClipboardList size={18} />
                View Applications
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyOfferDetail;
