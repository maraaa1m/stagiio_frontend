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
  Lock
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
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

const calculateCompletion = (p: any) => {
  const fields = [
    p.firstName, p.lastName, p.email, p.phoneNumber, 
    p.universityWilaya, p.department, p.socialSecurityNumber, 
    p.idCardNumber, p.githubLink, p.portfolioLink,
    p.photoUrl, p.cvUrl
  ];
  // Count how many of these are NOT empty strings/null/undefined
  const filledFields = fields.filter(f => f && f !== '').length;
  
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
    department: pData.department || '',
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
    universityWilaya: '',
    githubLink: '',
    portfolioLink: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      
      try {
        const [profileRes, skillsRes] = await Promise.all([
          axios.get('/api/student/profile/', { headers }),
          axios.get('/api/skills/', { headers })
        ]);
        
        const pData = profileRes.data;
        
        // Normalize profile mapping
        const normalizedProfile = normalizeProfile(pData);
        
        setProfile(normalizedProfile);
        setFormData({
          phoneNumber: normalizedProfile.phoneNumber,
          universityWilaya: normalizedProfile.universityWilaya,
          githubLink: normalizedProfile.githubLink,
          portfolioLink: normalizedProfile.portfolioLink
        });
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
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };
    
    try {
      await axios.put('/api/student/update/', {
        phoneNumber: formData.phoneNumber,
        univWillaya: formData.universityWilaya,
        githubLink: formData.githubLink,
        portfolioLink: formData.portfolioLink,
        skills: selectedSkills
      }, { headers });
      toast.success('Profile updated successfully!');
      // Refresh profile to get new completion percentage
      const profileRes = await axios.get('/api/student/profile/', { headers });
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
    
    const token = localStorage.getItem('access_token');
    try {
      await axios.post('/api/student/profile/photo/', photoFormData, {
        headers: { 
          Authorization: `Bearer ${token}`,
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
    
    const token = localStorage.getItem('access_token');
    try {
      await axios.post('/api/student/cv/upload/', cvFormData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('CV uploaded successfully!');
      // Refresh profile to show new CV link
      const profileRes = await axios.get('/api/student/profile/', {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-black selection:bg-blue-600/10 selection:text-blue-600">
      <Toaster position="top-right" richColors />
      
      {/* Sidebar */}
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
          
          <Link to="/student/dashboard" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
            Dashboard
          </Link>
          <Link to="/student/offers" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <Search size={18} className="group-hover:scale-110 transition-transform" />
            Search Offers
          </Link>
          <Link to="/student/applications" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <ClipboardList size={18} className="group-hover:scale-110 transition-transform" />
            My Applications
          </Link>
          
          <div className="pt-8 pb-4 px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Quick Actions</p>
          </div>
          
          <button 
            onClick={() => navigate('/student/offers')}
            className="w-full flex items-center gap-4 px-4 py-3 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-all">
              <Plus size={16} />
            </div>
            New Search
          </button>
          
          <div className="pt-8 pb-4 px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Account</p>
          </div>
          
          <Link to="/student/profile" className="flex items-center gap-4 px-4 py-3.5 bg-blue-600 rounded-2xl text-[13px] font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 group">
            <User size={18} className="group-hover:scale-110 transition-transform" />
            My Profile
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
      <main className="flex-1 ml-72 min-h-screen">
        {/* Top Bar */}
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-40">
          <div>
            <h2 className="text-2xl font-display font-bold text-black tracking-tight">My Profile</h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mt-1">Manage your professional identity</p>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-3 bg-paper rounded-2xl text-black/40 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

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
                <p className="text-black/40 font-bold uppercase tracking-widest text-[11px] mt-1">{profile?.email}</p>
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
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/30 ml-4">University Wilaya</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-blue-600 transition-colors">
                      <MapPin size={16} />
                    </div>
                    <select 
                      value={formData.universityWilaya}
                      onChange={(e) => setFormData({...formData, universityWilaya: e.target.value})}
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-black appearance-none cursor-pointer"
                    >
                      <option value="">Select Wilaya</option>
                      {ALGERIA_WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                    </select>
                  </div>
                </div>

                {/* --- READ-ONLY DEPARTMENT --- */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/30 ml-4">Department</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600/30">
                      <Lock size={16} />
                    </div>
                    <div className="w-full bg-blue-50/40 border border-blue-600/10 rounded-2xl py-4 pl-14 pr-6 font-bold text-black cursor-not-allowed select-none">
                      {profile?.department || 'Not Assigned'}
                    </div>
                  </div>
                </div>

                {/* --- READ-ONLY SOCIAL SECURITY --- */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/30 ml-4">Social Security Number</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600/30">
                      <Lock size={16} />
                    </div>
                    <div className="w-full bg-blue-50/40 border border-blue-600/10 rounded-2xl py-4 pl-14 pr-6 font-bold text-black cursor-not-allowed select-none tracking-widest">
                      {profile?.socialSecurityNumber || 'Not Verified'}
                    </div>
                  </div>
                </div>

                {/* --- READ-ONLY ID CARD NUMBER --- */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-black/30 ml-4">ID Card Number</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-600/30">
                      <Lock size={16} />
                    </div>
                    <div className="w-full bg-blue-50/40 border border-blue-600/10 rounded-2xl py-4 pl-14 pr-6 font-bold text-black cursor-not-allowed select-none">
                      {profile?.idCardNumber || 'Not Verified'}
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