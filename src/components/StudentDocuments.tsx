import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Download, 
  Search, 
  Clock, 
  CheckCircle2, 
  FileCheck,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/api';
import { toast, Toaster } from 'sonner';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';

interface Document {
  id: number;
  type: 'AGREEMENT' | 'CERTIFICATE';
  title: string;
  companyName: string;
  date: string;
  url: string;
}

interface DocumentCardProps {
  doc: Document;
  i: number;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ doc, i }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.05 }}
    className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-premium transition-all group overflow-hidden relative"
  >
    <div className={`absolute top-0 left-0 w-1.5 h-full ${doc.type === 'AGREEMENT' ? 'bg-blue-600' : 'bg-emerald-600'}`} />
    
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
      <div className="flex items-center gap-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
          doc.type === 'AGREEMENT' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
        }`}>
          {doc.type === 'AGREEMENT' ? <FileCheck size={24} strokeWidth={2} /> : <Award size={24} strokeWidth={2} />}
        </div>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h4 className="text-xl font-display font-bold text-navy-900 group-hover:text-blue-600 transition-colors">{doc.title}</h4>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-bold uppercase tracking-widest text-navy-900/40">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={12} className={doc.type === 'AGREEMENT' ? 'text-blue-400' : 'text-emerald-400'} />
              {doc.companyName}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={12} />
              {(() => {
                const date = new Date(doc.date);
                if (isNaN(date.getTime())) {
                  return doc.type === 'AGREEMENT' ? 'Pending Signature' : 'Processing...';
                }
                return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
              })()}
            </span>
          </div>
        </div>
      </div>

      <a 
        href={doc.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full md:w-auto px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg ${
          doc.type === 'AGREEMENT' 
            ? 'bg-navy-900 text-white hover:bg-blue-600 shadow-navy-900/10 active:scale-95' 
            : 'bg-emerald-600 text-white hover:bg-navy-900 shadow-emerald-600/10 active:scale-95'
        }`}
      >
        <Download size={18} />
        Download PDF
      </a>
    </div>
  </motion.div>
);

const StudentDocuments = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [profileRes, appsRes, notificationsRes] = await Promise.allSettled([
          api.get('/api/student/profile/'),
          api.get('/api/student/my-applications/'),
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

        if (appsRes.status === 'fulfilled') {
          const apps = Array.isArray(appsRes.value.data) ? appsRes.value.data : [];
          const docs: Document[] = [];
          
          apps.forEach((app: any) => {
            // Check for agreement
            const agreementUrl = app.pdf_url || app.pdfUrl || app.internship?.pdf_url || app.internship?.agreement_url;
            if (agreementUrl) {
              docs.push({
                id: app.id * 10 + 1, // Unique ID for agreement
                type: 'AGREEMENT',
                title: `Internship Agreement - ${app.offer_title || app.offer || 'Internship'}`,
                companyName: app.company_name || app.company || 'Unknown Company',
                date: app.internship?.startDate || app.internship?.start_date || app.created_at || '',
                url: agreementUrl
              });
            }

            // Check for certificate
            const certUrl = app.certificate_url || app.certificateUrl || app.internship?.certificate_url || app.internship?.pdf_certificate;
            if (certUrl) {
              docs.push({
                id: app.id * 10 + 2, // Unique ID for certificate
                type: 'CERTIFICATE',
                title: `Internship Certificate - ${app.offer_title || app.offer || 'Internship'}`,
                companyName: app.company_name || app.company || 'Unknown Company',
                date: app.internship?.endDate || app.internship?.end_date || app.updated_at || '',
                url: certUrl
              });
            }
          });
          setDocuments(docs);
        }

        if (notificationsRes.status === 'fulfilled') {
          setUnreadNotifications(notificationsRes.value.data.count || 0);
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
        toast.error('Failed to load documents.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAgreements = documents.filter(doc => 
    doc.type === 'AGREEMENT' && 
    (doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     doc.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCertificates = documents.filter(doc => 
    doc.type === 'CERTIFICATE' && 
    (doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     doc.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-paper flex font-sans text-navy-900 selection:bg-blue-600/10 selection:text-blue-600">
      <Toaster position="top-right" richColors />
      
      <StudentSidebar unreadNotifications={unreadNotifications} />

      <main className="flex-1 ml-72 min-h-screen">
        <StudentHeader 
          title="Internship Documents"
          subtitle="Agreements and completion certificates"
          profile={profile}
          unreadNotifications={unreadNotifications}
        />

        <div className="p-12 space-y-12 max-w-7xl mx-auto">
          {/* Search bar */}
          <div className="relative group max-w-md">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search by title or company..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900 shadow-sm"
            />
          </div>

          {/* Agreements Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 px-4">
              <FileCheck size={20} className="text-blue-600" />
              <h3 className="text-2xl font-display font-bold text-navy-900">Internship Agreements</h3>
              <div className="h-px flex-1 bg-navy-900/5" />
            </div>
            {isLoading ? (
              <div className="h-32 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
            ) : filteredAgreements.length === 0 ? (
              <EmptyState message="No internship agreements available yet." />
            ) : (
              <div className="grid gap-4">
                {filteredAgreements.map((doc: Document, i: number) => <DocumentCard key={doc.id} doc={doc} i={i} />)}
              </div>
            )}
          </div>

          {/* Certificates Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 px-4 pt-8">
              <Award size={20} className="text-emerald-600" />
              <h3 className="text-2xl font-display font-bold text-navy-900">Completion Certificates</h3>
              <div className="h-px flex-1 bg-navy-900/5" />
            </div>
            {isLoading ? (
              <div className="h-32 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
            ) : filteredCertificates.length === 0 ? (
              <EmptyState message="No certificates have been issued yet." />
            ) : (
              <div className="grid gap-4">
                {filteredCertificates.map((doc: Document, i: number) => <DocumentCard key={doc.id} doc={doc} i={i} />)}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="bg-white/40 backdrop-blur-sm min-h-[300px] flex flex-col items-center justify-center p-12 rounded-[2.5rem] border border-white/20 text-center border-dashed">
    <div className="w-20 h-20 bg-blue-50/50 rounded-3xl flex items-center justify-center mb-6 text-blue-600/20">
      <FileText size={40} strokeWidth={1.5} />
    </div>
    <div className="space-y-1">
      <p className="text-navy-900/60 font-bold text-sm tracking-tight">{message}</p>
      <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/20">No documents found matching your search</p>
    </div>
  </div>
);

export default StudentDocuments;