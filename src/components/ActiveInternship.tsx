import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  User, 
  Mail, 
  ExternalLink, 
  Download, 
  FileText, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/api';
import { toast, Toaster } from 'sonner';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';

interface InternshipData {
  id: number;
  offerTitle: string;
  companyName: string;
  supervisorName: string;
  supervisorEmail: string;
  startDate: string;
  endDate: string;
  location: string;
  status: string;
  agreementUrl?: string;
  matchingScore: number;
}

const ActiveInternship = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [internship, setInternship] = useState<InternshipData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [profileRes, appsRes, notificationsRes] = await Promise.all([
          api.get('/api/student/profile/'),
          api.get('/api/student/my-applications/'),
          api.get('/api/notifications/')
        ]);

        const pData = profileRes.data;
        setProfile({
          firstName: pData.firstName || pData.first_name,
          lastName: pData.lastName || pData.last_name,
          photoUrl: pData.profile_photo || pData.profilePhoto || pData.photoUrl || pData.photo_url || pData.photo || ''
        });

        const apps = Array.isArray(appsRes.data) ? appsRes.data : (appsRes.data?.applications || []);
        // Find an ongoing or accepted internship
        const activeApp = apps.find((a: any) => 
          ['ONGOING', 'ACCEPTED', 'VALIDATED'].includes((a.status || '').toUpperCase())
        );

        if (activeApp) {
          // Standardize data from API
          setInternship({
            id: activeApp.id,
            offerTitle: activeApp.offer_title || activeApp.offerTitle || activeApp.offer || 'Internship Opportunity',
            companyName: activeApp.company_name || activeApp.companyName || activeApp.company || 'Host Company',
            supervisorName: activeApp.supervisor_name || activeApp.internship?.supervisor_name || 'Academic Supervisor',
            supervisorEmail: activeApp.supervisor_email || activeApp.internship?.supervisor_email || 'contact@company.dz',
            startDate: activeApp.internship?.startDate || activeApp.internship?.start_date || activeApp.start_date || '2026-06-01',
            endDate: activeApp.internship?.endDate || activeApp.internship?.end_date || activeApp.end_date || '2026-08-31',
            location: activeApp.internship?.location || activeApp.location || 'Algeria - In Person',
            status: activeApp.status || 'ONGOING',
            agreementUrl: activeApp.pdf_url || activeApp.pdfUrl || activeApp.internship?.agreement_url || activeApp.internship?.pdf_url,
            matchingScore: activeApp.matchingScore || 0
          });
        }

        // Handle notifications for activity feed
        const notifications = (notificationsRes.data?.results || notificationsRes.data || []).slice(0, 3);
        setRecentActivity(notifications.map((n: any) => ({
          label: n.title || n.message,
          time: new Date(n.created_at || Date.now()).toLocaleDateString(),
          status: 'completed'
        })));

      } catch (err) {
        console.error('Error fetching dynamic internship data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-paper flex font-sans text-navy-900">
        <StudentSidebar />
        <main className="flex-1 ml-72">
          <StudentHeader title="My Journey" profile={profile} />
          <div className="p-12 max-w-5xl mx-auto">
            <div className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center border-dashed">
              <div className="w-20 h-20 bg-paper rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-navy-900/10">
                <Zap size={40} />
              </div>
              <h4 className="text-xl font-display font-bold text-navy-900 mb-2">No Active Internship</h4>
              <p className="text-navy-900/40 font-medium max-w-xs mx-auto mb-8">Once you are accepted and your internship starts, your journey will appear here.</p>
              <button 
                onClick={() => navigate('/student/applications')}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-navy-900 transition-all shadow-xl shadow-blue-600/20"
              >
                View Applications
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Calculate progress
  const start = new Date(internship.startDate);
  const end = new Date(internship.endDate);
  const now = new Date();
  
  const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const elapsedDays = Math.max(0, Math.round((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const progressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));
  
  const daysRemaining = Math.max(0, totalDays - elapsedDays);
  const midTermDate = new Date(start.getTime() + (end.getTime() - start.getTime()) / 2);
  const daysToMidTerm = Math.max(0, Math.round((midTermDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen bg-paper flex font-sans text-navy-900 selection:bg-blue-600/10 selection:text-blue-600">
      <Toaster position="top-right" richColors />
      <StudentSidebar />

      <main className="flex-1 ml-72 min-h-screen">
        <StudentHeader 
          title="Current Internship" 
          subtitle="Your daily workspace and tracking"
          profile={profile}
        />

        <div className="p-12 space-y-10 max-w-7xl mx-auto">
          {/* Progress Hero */}
          <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-premium relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/[0.03] to-transparent pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row items-center gap-12 relative">
              {/* Activity Ring */}
              <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-blue-50"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={263.89}
                    initial={{ strokeDashoffset: 263.89 }}
                    animate={{ strokeDashoffset: 263.89 - (263.89 * progressPercent) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    className="text-blue-600"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-display font-black text-navy-900 tracking-tighter">{progressPercent}%</span>
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-navy-900/30">Completed</span>
                </div>
              </div>

              <div className="flex-1 text-center lg:text-left space-y-6">
                <div>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-4">
                    <span className="px-5 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Internship
                    </span>
                    <span className="px-5 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {totalDays} Days Total
                    </span>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-display font-bold text-navy-900 tracking-tight leading-tight">
                    {elapsedDays === 0 && now < start ? (
                      <>Starting in <span className="text-blue-600">{Math.round((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))}</span> Days</>
                    ) : (
                      <>Day <span className="text-blue-600">{elapsedDays}</span> of {totalDays}</>
                    )}
                  </h2>
                  <p className="text-navy-900/40 font-medium text-lg mt-2 max-w-md mx-auto lg:mx-0">
                    {elapsedDays === 0 && now < start 
                      ? `Your journey at ${internship.companyName} is about to begin. Get ready!`
                      : `You've successfully completed ${progressPercent}% of your training at ${internship.companyName}.`}
                  </p>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-4">
                  <div className="h-px w-12 bg-navy-900/10" />
                  <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30">Keep up the great work!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Info Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* Company & Supervisor Card */}
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-navy-900 text-white flex items-center justify-center font-bold text-2xl shadow-xl shadow-navy-900/10">
                      {internship.companyName[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-bold text-navy-900">{internship.companyName}</h3>
                      <Link to={`/company/${internship.id}`} className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-navy-900 transition-colors flex items-center gap-2 mt-1">
                        View Company Profile <ExternalLink size={12} />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-gray-50" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30">Academic Supervisor</p>
                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-navy-900/40 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-navy-900">{internship.supervisorName}</p>
                        <a href={`mailto:${internship.supervisorEmail}`} className="text-[11px] font-medium text-navy-900/40 hover:text-blue-600 flex items-center gap-2 mt-0.5">
                          <Mail size={12} /> {internship.supervisorEmail}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30">Location</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-navy-900/40">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-navy-900">{internship.location}</p>
                        <p className="text-[11px] font-medium text-navy-900/40 mt-0.5">Physical Presence Required</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documentation Quick-Access */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a 
                  href={internship.agreementUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-navy-900 text-white p-8 rounded-[2.5rem] hover:bg-blue-600 transition-all group shadow-xl shadow-navy-900/10 active:scale-[0.98]"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Download size={24} />
                  </div>
                  <h4 className="text-xl font-display font-bold mb-2">Download Signed Agreement</h4>
                  <p className="text-white/40 text-[11px] font-bold uppercase tracking-widest">PDF Format • Official Document</p>
                </a>

                <button className="bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:border-blue-600/30 transition-all group shadow-sm active:scale-[0.98]">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <FileText size={24} />
                  </div>
                  <h4 className="text-xl font-display font-bold text-navy-900 mb-2">Submit Weekly Report</h4>
                  <p className="text-navy-900/40 text-[11px] font-bold uppercase tracking-widest">Week 2 Due in 3 days</p>
                </button>
              </div>
            </div>

            {/* Sidebar Column */}
            <div className="lg:col-span-4 space-y-8">
              {/* Key Dates Widget */}
              <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-blue-600" />
                  <h4 className="font-display font-bold text-navy-900 tracking-tight text-lg">Key Dates</h4>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-navy-900/30">Start Date</p>
                      <p className="font-bold text-navy-900">{new Date(internship.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                      <CheckCircle2 size={18} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-navy-900/30">End Date</p>
                      <p className="font-bold text-navy-900">{new Date(internship.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                      <Clock size={18} />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-blue-600 rounded-[2rem] text-white space-y-4 shadow-xl shadow-blue-600/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                  <div className="flex items-center gap-3 relative">
                    <AlertCircle size={18} className="text-blue-200" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-100">Next Milestone</span>
                  </div>
                  <div className="relative">
                    <p className="text-xl font-display font-bold leading-tight">Mid-term Evaluation</p>
                    <p className="text-blue-100/50 text-[11px] font-medium mt-1 uppercase tracking-widest">In {daysToMidTerm} Days</p>
                  </div>
                </div>
              </div>

              {/* Status Feed */}
              <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
                <h4 className="font-display font-bold text-navy-900 tracking-tight text-lg">Recent Activity</h4>
                <div className="space-y-6">
                  {recentActivity.length === 0 ? (
                    <p className="text-[10px] text-navy-900/30 font-medium italic">No recent activity found.</p>
                  ) : (
                    recentActivity.map((item, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-navy-900">{item.label}</p>
                          <p className="text-[10px] text-navy-900/30 font-medium">{item.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActiveInternship;