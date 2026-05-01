import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Search, 
  ClipboardList, 
  User, 
  LogOut, 
  Bell, 
  MapPin, 
  Clock, 
  TrendingUp, 
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Briefcase
} from 'lucide-react';
import api from '@/api';
import { toast, Toaster } from 'sonner';

interface OfferDetailData {
  id: number;
  title: string;
  company: string;
  description: string;
  wilaya: string;
  type: string;
  skills: string[];
  deadline: string;
  startDate: string;
  remainingSpots: number;
}

interface MatchReport {
  matchingScore: number;
  matchedSkills: string[];
  missingSkills: string[];
}

import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';

const OfferDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ firstName: string; lastName: string; photoUrl?: string } | null>(null);
  const [offer, setOffer] = useState<OfferDetailData | null>(null);
  const [matchReport, setMatchReport] = useState<MatchReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const [profileRes, offerRes, reportRes, appsRes] = await Promise.all([
          api.get('/api/student/profile/'),
          api.get(`/api/offers/${id}/`),
          api.get(`/api/offers/${id}/match-report/`),
          api.get('/api/student/my-applications/')
        ]);

        const pData = profileRes.data;
        setProfile({
          firstName: pData.firstName || pData.first_name,
          lastName: pData.lastName || pData.last_name,
          photoUrl: pData.profile_photo || pData.profilePhoto || pData.photoUrl || pData.photo_url || pData.photo || ''
        });

        const offerData = offerRes.data;
        const rawSkills = offerData.skills || offerData.required_skills || offerData.requiredSkills || [];
        const skillsArray = Array.isArray(rawSkills) 
          ? rawSkills.map((s: any) => typeof s === 'string' ? s : s.skillName || s.name || String(s))
          : [];

        setOffer({
          id: offerData.id,
          title: offerData.title,
          company: offerData.company || offerData.companyName || offerData.company_name,
          description: offerData.description,
          wilaya: offerData.wilaya || offerData.willaya,
          type: offerData.type,
          skills: skillsArray,
          deadline: offerData.deadline || offerData.applicationDeadline,
          startDate: offerData.startDate || offerData.internshipStartDate || offerData.start_date,
          remainingSpots: offerData.remainingSpots !== undefined ? offerData.remainingSpots : (offerData.remaining_spots || 0)
        });

        const reportData = reportRes.data;
        setMatchReport({
          matchingScore: reportData.matchingScore || reportData.matching_score || 0,
          matchedSkills: reportData.matchedSkills || reportData.matched_skills || [],
          missingSkills: reportData.missingSkills || reportData.missing_skills || []
        });
        
        const applications = Array.isArray(appsRes.data) ? appsRes.data : (appsRes.data?.applications || appsRes.data?.results || []);
        const alreadyApplied = applications.some((app: any) => {
          const appOfferId = app.offerId || app.offer_id || app.offer?.id || (app.id && !app.offer ? app.id : null);
          return (appOfferId && Number(appOfferId) === Number(id)) || 
                 (app.offerTitle || app.offer_title || app.offer?.title) === offerData.title;
        });
        setHasApplied(alreadyApplied);

      } catch (err) {
        console.error('Error fetching offer details:', err);
        toast.error('Failed to load offer details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleApply = async () => {
    if (hasApplied) return;
    setIsApplying(true);
    try {
      await api.post('/api/applications/apply/', { offer_id: id });
      toast.success('Application submitted successfully!');
      setHasApplied(true);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to apply.';
      toast.error(msg);
    } finally {
      setIsApplying(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
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
        <button onClick={() => navigate('/student/offers')} className="text-blue-600 font-bold">Back to Search</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-navy-900 selection:bg-blue-600/10 selection:text-blue-600">
      <Toaster position="top-right" richColors />
      
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen pb-32">
        {/* Header */}
        <StudentHeader 
          title="Offer Details" 
          subtitle={`Reference #${offer.id}`}
          profile={profile}
        />

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
          {/* Top Section */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div className="flex items-center gap-8">
              <div className="w-24 h-24 rounded-[2rem] bg-navy-900 text-white flex items-center justify-center font-bold text-4xl shadow-2xl shadow-navy-900/20">
                {offer.company[0]}
              </div>
              <div>
                <h1 className="text-4xl font-display font-bold text-navy-900 tracking-tight mb-2">{offer.title}</h1>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-blue-600">{offer.company}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                  <div className="flex items-center gap-2 text-navy-900/40 font-bold uppercase tracking-widest text-[10px]">
                    <MapPin size={14} />
                    {offer.wilaya}
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
                Ends {offer.deadline}
              </div>
            </div>
          </div>

          {/* Match Report Card */}
          {matchReport && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden bg-white rounded-[3rem] p-10 border-2 border-blue-600/10 shadow-premium"
            >
              <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/5 to-transparent pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="relative w-32 h-32 shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className="text-gray-100"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={364.4}
                      strokeDashoffset={364.4 - (364.4 * matchReport.matchingScore) / 100}
                      className="text-blue-600 transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-display font-bold text-navy-900">{matchReport.matchingScore}%</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-navy-900/40">Match</span>
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-navy-900 mb-2 tracking-tight">Your Match Report</h3>
                    <p className="text-navy-900/40 font-medium">Based on your profile skills and the offer requirements.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 w-full mb-1">Matched Skills</span>
                      {matchReport.matchedSkills.map(skill => (
                        <span key={skill} className="px-4 py-2 bg-green-50 text-green-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-green-100/30 flex items-center gap-2">
                          <CheckCircle2 size={12} />
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-red-500 w-full mb-1">Missing Skills</span>
                      {matchReport.missingSkills.map(skill => (
                        <span key={skill} className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-red-100/30 flex items-center gap-2">
                          <AlertCircle size={12} />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {matchReport.missingSkills.length > 0 && (
                    <div className="pt-4 border-t border-gray-50">
                      <p className="text-sm font-bold text-navy-900">
                        Pro Tip: <span className="text-blue-600">Add {matchReport.missingSkills[0]}</span> to your profile to reach 100% match!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Offer Details */}
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
                      <p className="text-sm font-bold text-navy-900">{offer.startDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 mb-1">Deadline</p>
                      <p className="text-sm font-bold text-navy-900">{offer.deadline}</p>
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
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${offer.remainingSpots > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 mb-1">Availability</p>
                      <p className="text-sm font-bold text-navy-900">{offer.remainingSpots} Spots Left</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-72 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 p-6 z-40">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 mb-1">Ready to apply?</p>
              <h4 className="text-lg font-display font-bold text-navy-900 tracking-tight">{offer.title}</h4>
            </div>
            
            <button 
              onClick={handleApply}
              disabled={isApplying || hasApplied || offer.remainingSpots === 0}
              className={`px-12 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 ${
                hasApplied 
                  ? 'bg-green-500 text-white cursor-not-allowed shadow-green-500/20' 
                  : offer.remainingSpots === 0
                  ? 'bg-red-500 text-white cursor-not-allowed shadow-red-500/20'
                  : 'bg-blue-600 text-white hover:bg-navy-900 shadow-blue-600/20 active:scale-95'
              }`}
            >
              {isApplying ? (
                <Loader2 size={18} className="animate-spin" />
              ) : hasApplied ? (
                <>
                  <CheckCircle2 size={18} />
                  Applied
                </>
              ) : offer.remainingSpots === 0 ? (
                'Saturated'
              ) : (
                'Apply Now'
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OfferDetail;