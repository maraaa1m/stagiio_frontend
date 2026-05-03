import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Search, 
  ClipboardList, 
  User, 
  LogOut, 
  Bell, 
  Clock, 
  TrendingUp, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
  Plus,
  Download,
  AlertCircle
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/api';
import { toast, Toaster } from 'sonner';

interface Application {
  id: number;
  offerTitle: string;
  company: string;
  status: 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'VALIDATED' | 'ONGOING' | 'PENDING_CERT' | 'COMPLETED';
  matchingScore: number;
  appliedAt: string;
  pdfUrl?: string;
  certificateUrl?: string;
  refusalReason?: string;
}

import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';

const MyApplications = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ firstName: string; lastName: string; photoUrl?: string } | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

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
        console.error('Error fetching profile in applications:', err);
      }
    };

    const fetchApplications = async () => {
      setIsLoading(true);
      
      try {
        const response = await api.get('/api/student/my-applications/');
        const data = Array.isArray(response.data) ? response.data : (response.data?.applications || []);
        
        // Map data to handle snake_case from Django
        const mapped = data.map((a: any) => ({
          id: a.id,
          status: (a.status || '').toUpperCase(),
          matchingScore: a.matchingScore || a.matching_score || 0,
          offerTitle: a.offer_title || a.offerTitle || a.offer || '',
          company: a.company_name || a.companyName || a.company || '',
          appliedAt: a.applied_date || a.appliedDate || a.application_date || a.created_at || '',
          pdfUrl: a.pdf_url || a.pdfUrl,
          certificateUrl: a.certificate_url || a.certificateUrl || a.pdfCertificate,
          refusalReason: a.refusal_reason || a.refusalReason
        }));

        setApplications(mapped);
      } catch (err) {
        console.error('Error fetching applications:', err);
        toast.error('Failed to load applications.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    fetchApplications();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    navigate('/login');
  };

  const filteredApps = activeTab === 'ALL' 
    ? applications 
    : applications.filter(app => app.status === activeTab);

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'PENDING').length,
    accepted: applications.filter(a => a.status === 'ACCEPTED' || a.status === 'VALIDATED').length,
    refused: applications.filter(a => a.status === 'REFUSED').length
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'ACCEPTED': return 'bg-green-50 text-green-600 border-green-100';
      case 'REFUSED': return 'bg-red-50 text-red-500 border-red-100';
      case 'VALIDATED': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'ONGOING': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'PENDING_CERT': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'COMPLETED': return 'bg-purple-50 text-purple-600 border-purple-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-black selection:bg-blue-600/10 selection:text-blue-600">
      <Toaster position="top-right" richColors />
      
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen">
        {/* Header */}
        <StudentHeader 
          title="My Applications" 
          subtitle="Keep track of your internship journey"
          profile={profile}
        />

        <div className="p-12 space-y-10 max-w-7xl mx-auto">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Applied', value: stats.total, icon: <ClipboardList size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Pending', value: stats.pending, icon: <Clock size={20} />, color: 'text-orange-500', bg: 'bg-orange-50' },
              { label: 'Accepted', value: stats.accepted, icon: <CheckCircle2 size={20} />, color: 'text-green-500', bg: 'bg-green-50' },
              { label: 'Refused', value: stats.refused, icon: <XCircle size={20} />, color: 'text-red-500', bg: 'bg-red-50' },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm"
              >
                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-6`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/30 mb-2">{stat.label}</p>
                  <h4 className="text-3xl font-display font-bold text-black tracking-tighter">{stat.value}</h4>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-paper rounded-2xl w-fit border border-gray-100 overflow-x-auto">
            {['ALL', 'PENDING', 'ACCEPTED', 'VALIDATED', 'ONGOING', 'PENDING_CERT', 'COMPLETED', 'REFUSED'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-navy-900/40 hover:text-navy-900'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Applications List */}
          <div className="space-y-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-[3rem] border border-gray-100 animate-pulse" />
              ))
            ) : filteredApps.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-20 rounded-[3rem] border border-gray-100 text-center border-dashed"
              >
                <div className="w-20 h-20 bg-paper rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-navy-900/10">
                  <FileText size={40} />
                </div>
                <h4 className="text-xl font-display font-bold text-navy-900 mb-2">No applications yet</h4>
                <p className="text-navy-900/40 font-medium max-w-xs mx-auto mb-8">Start by searching for offers that match your skills and interests.</p>
                <button 
                  onClick={() => navigate('/student/offers')}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-navy-900 transition-all shadow-xl shadow-blue-600/20"
                >
                  Search Offers
                </button>
              </motion.div>
            ) : (
              filteredApps.map((app, i) => (
                <motion.div 
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-premium transition-all group relative overflow-hidden"
                >
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-navy-900 text-white flex items-center justify-center font-bold text-2xl shadow-xl shadow-navy-900/10 group-hover:bg-blue-600 transition-colors duration-500">
                        {(app.company?.[0] ?? '?').toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xl font-display font-bold text-navy-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors">{app.offerTitle}</h4>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30">{app.company}</p>
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-900/30 mb-2">Applied On</p>
                      <p className="text-sm font-bold text-navy-900 tracking-tight">{app.appliedAt}</p>
                    </div>

                    <div className="px-5 py-2.5 rounded-2xl border border-gray-100 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2.5 text-navy-900/40">
                      <TrendingUp size={14} className="text-blue-600" />
                      {app.matchingScore}% Match
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`px-6 py-3 rounded-2xl border text-[10px] font-bold uppercase tracking-widest shadow-sm ${getStatusStyles(app.status)}`}>
                        {app.status}
                      </div>

                      {app.status === 'VALIDATED' && app.pdfUrl && (
                        <a 
                          href={app.pdfUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 bg-blue-600 text-white rounded-xl hover:bg-navy-900 transition-all shadow-lg shadow-blue-600/10"
                          title="Download Agreement"
                        >
                          <Download size={18} />
                        </a>
                      )}

                      {app.status === 'COMPLETED' && app.certificateUrl && (
                        <a 
                          href={app.certificateUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-navy-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3 shadow-lg shadow-navy-900/10"
                        >
                          <Download size={14} />
                          Download Certificate
                        </a>
                      )}

                      {app.status === 'REFUSED' && app.refusalReason && (
                        <div className="flex flex-col w-full xl:w-auto">
                          <details className="w-full bg-red-50 border border-red-100 rounded-2xl px-6 py-4 shadow-sm group/details">
                            <summary className="text-[10px] font-bold uppercase tracking-widest text-red-500 cursor-pointer flex items-center gap-2 list-none marker:content-none">
                              <AlertCircle size={14} className="group-hover:scale-110 transition-transform" /> 
                              View Refusal Reason
                            </summary>
                            <p className="mt-3 text-sm font-medium text-red-600 leading-relaxed">
                              {app.refusalReason}
                            </p>
                          </details>
                        </div>
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

export default MyApplications;
