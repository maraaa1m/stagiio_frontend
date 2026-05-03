import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Search, 
  ClipboardList, 
  User, 
  LogOut, 
  Bell, 
  Camera, 
  FileText, 
  Github, 
  Globe, 
  Phone, 
  MapPin, 
  Save, 
  Loader2,
  Plus,
  X,
  GraduationCap,
  CreditCard,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/api';
import { toast, Toaster } from 'sonner';
import { ALGERIA_WILAYAS } from '../constants';

interface StudentProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  universityWilaya: string;
  department?: string;
  socialSecurityNumber?: string;
  idCardNumber?: string;
  githubLink: string;
  portfolioLink: string;
  skills: { id: number; skillName: string }[];
  photoUrl?: string;
  cvUrl?: string;
  completionPercentage: number;
}

import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';

const calculateCompletion = (p: any) => {
  const fields = [
    p.firstName, p.lastName, p.email, p.phoneNumber, 
    p.universityWilaya, p.department, p.socialSecurityNumber, 
    p.idCardNumber, p.githubLink, p.portfolioLink,
    p.photoUrl, p.cvUrl
  ];
  // Count how many of these are NOT empty strings/null/undefined AND not "Not Provided"
  const filledFields = fields.filter(f => f && f !== '' && f !== 'Not Provided').length;
  
  // Also check if skills exist and is a non-empty list
  const hasSkills = Array.isArray(p.skills) && p.skills.length > 0;
  
  const totalWeight = fields.length + 1; // +1 for skills
  const currentWeight = filledFields + (hasSkills ? 1 : 0);
  
  return Math.round((currentWeight / totalWeight) * 100);
};

const normalizeProfile = (pData: any): StudentProfileData => {
  const normalized = {
    ...pData,
    phoneNumber: pData.phoneNumber || pData.phone_number || '',
    universityWilaya: pData.univWillaya || pData.univ_willaya || pData.universityWilaya || '',
    department: (typeof pData.department === 'object' ? pData.department?.name : pData.department) || '',
    departmentId: pData.department?.id || (typeof pData.department !== 'object' ? pData.department : ''),
    departmentName: pData.department?.name || (typeof pData.department === 'string' ? pData.department : ''),
    universityName: (typeof pData.university === 'object' ? pData.university?.name : (typeof pData.university === 'string' ? pData.university : '')) || pData.university_name || pData.department?.faculty?.university?.name || '',
    socialSecurityNumber: pData.socialSecurityNumber || pData.social_security_number || '',
    idCardNumber: pData.IDCardNumber || pData.id_card_number || pData.idCardNumber || '',
    githubLink: pData.githubLink || pData.github_link || '',
    portfolioLink: pData.portfolioLink || pData.portfolio_link || '',
    photoUrl: pData.photoUrl || pData.photo_url || pData.photo || pData.profile_photo || pData.profilePhoto || '',
    cvUrl: pData.cvUrl || pData.cv_url || pData.cv || pData.cvFile || pData.cv_file || '',
    completionPercentage: 0
  };
  
  // Recalculate completion percentage locally to ensure accuracy
  normalized.completionPercentage = calculateCompletion(normalized);
  
  return normalized;
};

const StudentProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [allSkills, setAllSkills] = useState<{ id: number; skillName: string }[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    githubLink: '',
    portfolioLink: ''
  });
  const [universities, setUniversities] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedUniv, setSelectedUniv] = useState<string | number>('');
  const [selectedFaculty, setSelectedFaculty] = useState<string | number>('');
  const [selectedDept, setSelectedDept] = useState<string | number>('');

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const res = await api.get('/api/universities/');
        setUniversities(res.data.results || res.data || []);
      } catch (err) {
        console.error('Error fetching universities:', err);
      }
    };
    fetchUniversities();
  }, []);

  useEffect(() => {
    if (selectedUniv) {
      const fetchFaculties = async () => {
        try {
          const res = await api.get(`/api/faculties/${selectedUniv}/`);
          setFaculties(res.data.results || res.data || []);
          setDepartments([]);
        } catch (err) {
          console.error('Error fetching faculties:', err);
        }
      };
      fetchFaculties();
    } else {
      setFaculties([]);
      setDepartments([]);
    }
  }, [selectedUniv]);

  useEffect(() => {
    if (selectedFaculty) {
      const fetchDepartments = async () => {
        try {
          const res = await api.get(`/api/departments/${selectedFaculty}/`);
          setDepartments(res.data.results || res.data || []);
        } catch (err) {
          console.error('Error fetching departments:', err);
        }
      };
      fetchDepartments();
    } else {
      setDepartments([]);
    }
  }, [selectedFaculty]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const [profileRes, skillsRes] = await Promise.all([
          api.get('/api/student/profile/'),
          api.get('/api/skills/')
        ]);
        
        const pData = profileRes.data;
        const normalizedProfile = normalizeProfile(pData);
        
        setProfile(normalizedProfile);
        setFormData({
          phoneNumber: normalizedProfile.phoneNumber,
          githubLink: normalizedProfile.githubLink,
          portfolioLink: normalizedProfile.portfolioLink
        });
        
        // Handle department object or ID
        if (pData.department) {
          const dept = pData.department;
          setSelectedDept(dept.id || dept);
          if (dept.faculty) {
            setSelectedFaculty(dept.faculty.id || dept.faculty);
            if (dept.faculty.university) {
              setSelectedUniv(dept.faculty.university.id || dept.faculty.university);
            }
          }
        }

        setSelectedSkills(Array.isArray(pData.skills) ? pData.skills.map((s: any) => typeof s === 'object' ? s.id : s) : []);
        setAllSkills(Array.isArray(skillsRes.data) ? skillsRes.data : (skillsRes.data?.skills || []));
      } catch (err) {
        console.error('Error fetching profile:', err);
        toast.error('Failed to load profile data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const payload = {
        phoneNumber: formData.phoneNumber,
        univWillaya: profile?.universityWilaya,
        university_wilaya: profile?.universityWilaya,
        univ_willaya: profile?.universityWilaya,
        githubLink: formData.githubLink,
        portfolioLink: formData.portfolioLink,
        skills: selectedSkills,
        university: selectedUniv, // primary key ID
        faculty: selectedFaculty,   // primary key ID
        department: selectedDept,   // primary key ID
        socialSecurityNumber: profile?.socialSecurityNumber,
        social_security_number: profile?.socialSecurityNumber,
        IDCardNumber: profile?.idCardNumber,
        id_card_number: profile?.idCardNumber,
        idCardNumber: profile?.idCardNumber
      };
      await api.put('/api/student/update/', payload);
      toast.success('Profile updated successfully!');
      const profileRes = await api.get('/api/student/profile/');
      setProfile(normalizeProfile(profileRes.data));
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const photoFormData = new FormData();
    photoFormData.append('photo', file);
    
    try {
      await api.post('/api/student/profile/photo/', photoFormData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Photo updated!');
      window.location.reload();
    } catch (err) {
      toast.error('Failed to upload photo.');
    }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const cvFormData = new FormData();
    cvFormData.append('cv', file);
    
    try {
      await api.post('/api/student/cv/upload/', cvFormData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('CV uploaded successfully!');
      // Refresh profile to show new CV link
      const profileRes = await api.get('/api/student/profile/');
      setProfile(normalizeProfile(profileRes.data));
    } catch (err) {
      toast.error('Failed to upload CV.');
    }
  };

  const toggleSkill = (skillId: number) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
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

  // Read-Only Display: Institutional fields should be locked once they have values.
  const isInstitutionalVerified = !!(profile?.department || profile?.department);
  const isIdentityVerified = !!(profile?.socialSecurityNumber || profile?.idCardNumber);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-black selection:bg-blue-600/10 selection:text-blue-600">
      <Toaster position="top-right" richColors />
      
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen">
        {/* Header */}
        <StudentHeader 
          title="My Profile" 
          subtitle="Manage your professional identity"
          profile={profile}
        />

        <div className="p-12 space-y-12 max-w-5xl mx-auto">
          {/* Top Section */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-premium flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/5 to-transparent pointer-events-none" />
            
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-black text-white flex items-center justify-center font-bold text-4xl shadow-2xl shadow-black/20 overflow-hidden">
                {profile?.photoUrl ? (
                  <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  profile?.firstName?.[0] || '?'
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center cursor-pointer hover:bg-black transition-all shadow-lg shadow-blue-600/20 border-2 border-white">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-display font-bold text-black tracking-tight">{profile?.firstName} {profile?.lastName}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-black/40 font-bold uppercase tracking-widest text-[11px]">{profile?.email}</p>
                  {isInstitutionalVerified && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-blue-100/50">
                      <CheckCircle2 size={10} />
                      Verified Student
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-black/40">
                  <span>Profile Completion</span>
                  <span className="text-blue-600">{(profile?.completionPercentage ?? 0)}%</span>
                </div>
                <div className="h-2.5 bg-paper rounded-full overflow-hidden border border-gray-50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${profile?.completionPercentage || 0}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="px-6 py-3 bg-paper text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-all cursor-pointer flex items-center gap-3 border border-gray-100">
                <FileText size={16} className="text-blue-600" />
                {profile?.cvUrl ? 'View / Update CV' : 'Upload CV'}
                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleCVUpload} />
              </label>
              {profile?.cvUrl && (
                <a 
                  href={profile.cvUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-6 py-2 text-center text-[9px] font-bold uppercase tracking-widest text-blue-600 hover:text-black transition-all"
                >
                  View Current CV
                </a>
              )}
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
              <h3 className="text-xl font-display font-bold text-black tracking-tight">Personal Details</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/30 ml-4">Phone Number</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-blue-600 transition-colors">
                      <Phone size={16} />
                    </div>
                    <input 
                      type="text"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      placeholder="+213..."
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/30 ml-4">University</label>
                  <div className="relative group">
                    <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isInstitutionalVerified ? 'text-blue-600/30' : 'text-black/30 group-focus-within:text-blue-600'}`}>
                      <GraduationCap size={18} />
                    </div>
                    {isInstitutionalVerified ? (
                      <div className="w-full bg-blue-50/40 border border-blue-600/10 rounded-2xl py-4 pl-14 pr-12 font-bold text-black cursor-not-allowed select-none relative group">
                        {(profile as any).universityName || 'University Locked'}
                        <Lock size={14} className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20" />
                      </div>
                    ) : (
                      <select 
                        value={selectedUniv}
                        onChange={(e) => {
                          setSelectedUniv(e.target.value);
                          setSelectedFaculty('');
                          setSelectedDept('');
                        }}
                        className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-black appearance-none cursor-pointer"
                      >
                        <option value="">Select University</option>
                        {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/30 ml-4">Department</label>
                  <div className="relative group">
                    <div className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isInstitutionalVerified ? 'text-blue-600/30' : 'text-black/30 group-focus-within:text-blue-600'}`}>
                      <ClipboardList size={18} />
                    </div>
                    {isInstitutionalVerified ? (
                      <div className="w-full bg-blue-50/40 border border-blue-600/10 rounded-2xl py-4 pl-14 pr-12 font-bold text-black cursor-not-allowed select-none relative group">
                        {(profile as any).departmentName || (profile as any).department || 'Department Locked'}
                        <Lock size={14} className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20" />
                      </div>
                    ) : (
                      <select 
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-black appearance-none cursor-pointer"
                      >
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    )}
                  </div>
                </div>

                {/* --- READ-ONLY SOCIAL SECURITY NUMBER --- */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/30 ml-4">Social Security Number</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600/30 group-focus-within:text-blue-600 transition-colors">
                      <Lock size={16} />
                    </div>
                    <div className="w-full bg-blue-50/40 border border-blue-600/10 rounded-2xl py-4 pl-14 pr-12 font-bold text-black cursor-not-allowed select-none tracking-widest relative">
                      {profile?.socialSecurityNumber || 'Not Provided'}
                      <Lock size={14} className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20" />
                    </div>
                  </div>
                </div>

                {/* --- READ-ONLY ID CARD NUMBER --- */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/30 ml-4">ID Card Number</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600/30 group-focus-within:text-blue-600 transition-colors">
                      <CreditCard size={16} />
                    </div>
                    <div className="w-full bg-blue-50/40 border border-blue-600/10 rounded-2xl py-4 pl-14 pr-12 font-bold text-black cursor-not-allowed select-none relative">
                      {profile?.idCardNumber || 'Not Provided'}
                      <Lock size={14} className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
              <h3 className="text-xl font-display font-bold text-black tracking-tight">Online Presence</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/30 ml-4">GitHub Profile</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-blue-600 transition-colors">
                      <Github size={16} />
                    </div>
                    <input 
                      type="text"
                      value={formData.githubLink}
                      onChange={(e) => setFormData({...formData, githubLink: e.target.value})}
                      placeholder="https://github.com/..."
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-black"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/30 ml-4">Portfolio Link</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-blue-600 transition-colors">
                      <Globe size={16} />
                    </div>
                    <input 
                      type="text"
                      value={formData.portfolioLink}
                      onChange={(e) => setFormData({...formData, portfolioLink: e.target.value})}
                      placeholder="https://yourportfolio.com"
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-display font-bold text-black tracking-tight">Skills & Expertise</h3>
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{selectedSkills.length} selected</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {allSkills.map(skill => (
                <button
                  key={skill.id}
                  onClick={() => toggleSkill(skill.id)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border ${
                    selectedSkills.includes(skill.id)
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                      : 'bg-paper text-black/40 border-gray-100 hover:border-blue-600/30'
                  }`}
                >
                  {skill.skillName}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-12 py-4 bg-[#060D1F] text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-navy-900/10 flex items-center gap-3 active:scale-95"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentProfile;