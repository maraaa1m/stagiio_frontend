import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Building2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  Loader2,
  CreditCard,
  Github,
  Globe,
  ClipboardList
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/api';
import { toast, Toaster } from 'sonner';

interface StudentDetail {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  university: string;
  faculty: string;
  department: string;
  universityWilaya: string;
  isPlaced: boolean;
  cvUrl?: string;
  photoUrl?: string;
  socialSecurityNumber?: string;
  idCardNumber?: string;
  githubLink?: string;
  portfolioLink?: string;
  skills: { id: number; skillName: string }[];
  applications: any[];
}

const AdminStudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await api.get(`/api/admin/students/${id}/`);
        const s = response.data;
        const studentObj = s.student || s.user || s || {};
        
        setStudent({
          id: s.id || studentObj.id,
          firstName: studentObj.firstName || studentObj.first_name || '',
          lastName: studentObj.lastName || studentObj.last_name || '',
          email: studentObj.email || '',
          phoneNumber: studentObj.phoneNumber || studentObj.phone_number || '',
          university: studentObj.university?.name || studentObj.university || '',
          faculty: studentObj.faculty?.name || studentObj.faculty || '',
          department: studentObj.department?.name || studentObj.department || '',
          universityWilaya: studentObj.univWillaya || studentObj.univ_willaya || studentObj.university_wilaya || studentObj.wilaya || '',
          isPlaced: s.isPlaced || s.is_placed || false,
          cvUrl: studentObj.cv_url || studentObj.cvFile || studentObj.cv || '',
          photoUrl: studentObj.profile_photo?.url || studentObj.photo || '',
          socialSecurityNumber: studentObj.social_security_number || studentObj.socialSecurityNumber || '',
          idCardNumber: studentObj.idCardNumber || studentObj.id_card_number || studentObj.IDCardNumber || '',
          githubLink: studentObj.github_link || studentObj.githubLink || '',
          portfolioLink: studentObj.portfolio_link || studentObj.portfolioLink || '',
          skills: studentObj.skills || [],
          applications: s.applications || []
        });
      } catch (err) {
        console.error('Error fetching student:', err);
        toast.error('Failed to load student details.');
        navigate('/admin/students');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudent();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!student) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-20">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center px-12 sticky top-0 z-40">
        <button 
          onClick={() => navigate('/admin/students')}
          className="mr-8 p-3 hover:bg-gray-50 rounded-2xl transition-all text-black/40 hover:text-black"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-display font-bold text-black tracking-tight">Student Profile</h2>
          <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mt-1">Verification and placement details</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-12 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Essential Info */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm text-center">
              <div className="w-32 h-32 rounded-[2.5rem] bg-black mx-auto mb-6 shadow-2xl shadow-black/20 overflow-hidden flex items-center justify-center text-white text-4xl font-bold">
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                ) : (
                  student.firstName[0]
                )}
              </div>
              <h3 className="text-2xl font-display font-bold text-black">{student.firstName} {student.lastName}</h3>
              <p className="text-black/40 font-bold uppercase tracking-widest text-[11px] mt-1">{student.email}</p>
              
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                  {student.department}
                </span>
                {student.isPlaced ? (
                  <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
                    Placed
                  </span>
                ) : (
                  <span className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-amber-100">
                    Seeking
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-black/20">Contact Info</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-black/60">
                  <Phone size={18} className="text-blue-600" />
                  <span className="font-medium">{student.phoneNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-4 text-black/60">
                  <MapPin size={18} className="text-blue-600" />
                  <span className="font-medium">{student.universityWilaya}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-black/20">Verified Identity</h4>
              <div className="space-y-4">
                <div className="p-4 bg-paper rounded-2xl border border-gray-100 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 flex items-center gap-2">
                    <CreditCard size={12} /> SSN
                  </p>
                  <p className="font-mono text-xs font-bold text-black">{student.socialSecurityNumber || 'Not Provided'}</p>
                </div>
                <div className="p-4 bg-paper rounded-2xl border border-gray-100 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 flex items-center gap-2">
                    <CreditCard size={12} /> ID Card
                  </p>
                  <p className="font-mono text-xs font-bold text-black">{student.idCardNumber || 'Not Provided'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Academic and Professional */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-10">
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-black/20">University Details</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">University</p>
                        <p className="font-bold text-black">{student.university}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Faculty</p>
                        <p className="font-bold text-black">{student.faculty}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-black/20">Professional Links</h4>
                  <div className="flex gap-4">
                    {student.cvUrl && (
                      <a 
                        href={student.cvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 p-4 bg-paper hover:bg-blue-600 hover:text-white transition-all rounded-3xl border border-gray-100 text-center"
                      >
                        <FileText className="mx-auto mb-2" size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Resume</span>
                      </a>
                    )}
                    {student.githubLink && (
                      <a 
                        href={student.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 p-4 bg-paper hover:bg-blue-600 hover:text-white transition-all rounded-3xl border border-gray-100 text-center"
                      >
                        <Github className="mx-auto mb-2" size={20} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">GitHub</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <h4 className="text-sm font-bold uppercase tracking-widest text-black/20">Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {student.skills?.length > 0 ? (
                    student.skills.map((skill) => (
                      <span key={skill.id} className="px-4 py-2 bg-paper text-black rounded-full text-[11px] font-bold border border-gray-100">
                        {skill.skillName}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs font-medium text-black/30 italic">No skills listed</p>
                  )}
                </div>
              </div>
            </div>

            {/* Applications History */}
            <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-8">
              <h4 className="text-sm font-bold uppercase tracking-widest text-black/20">Application History</h4>
              <div className="space-y-4">
                {student.applications?.length > 0 ? (
                  student.applications.map((app: any) => (
                    <div key={app.id} className="p-6 bg-paper rounded-[2.5rem] border border-gray-100 flex items-center justify-between group">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                          <ClipboardList size={22} />
                        </div>
                        <div>
                          <p className="font-bold text-black group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                            {app.offer?.title || 'Internship Offer'}
                          </p>
                          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                            {app.company_name || 'Company'} • Applied {new Date(app.created_at || app.applied_at || Date.now()).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest ${
                        app.status === 'ACCEPTED' || app.status === 'VALIDATED' || app.status === 'COMPLETED' ? 'bg-green-50 text-green-600' :
                        app.status === 'REFUSED' ? 'bg-red-50 text-red-500' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {app.status}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-black/30 font-medium italic border-2 border-dashed border-gray-100 rounded-[2.5rem]">
                    No applications found for this student.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStudentDetail;