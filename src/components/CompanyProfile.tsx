import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  FileText, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Camera,
  LayoutDashboard,
  ClipboardList,
  Briefcase,
  User,
  LogOut,
  Bell
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/api';
import { toast, Toaster } from 'sonner';

interface CompanyProfileData {
  companyName: string;
  email: string;
  phoneNumber: string;
  location: string;
  description: string;
  website: string;
  registreCommerce?: string;
  isApproved: boolean;
}

const CompanyProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CompanyProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<Partial<CompanyProfileData>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/api/company/profile/');
        const data = response.data;
        const mappedData = {
          companyName: data.companyName || data.company_name || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || data.phone_number || '',
          location: data.location || data.wilaya || '',
          description: data.description || '',
          website: data.website || '',
          registreCommerce: data.registreCommerce || data.registre_commerce || '',
          isApproved: data.isApproved || data.is_approved || false,
        };
        setProfile(mappedData);
        setFormData(mappedData);
      } catch (err) {
        toast.error('Failed to load profile.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/api/company/update/', {
        company_name: formData.companyName,
        phone_number: formData.phoneNumber,
        location: formData.location,
        description: formData.description,
        website: formData.website,
      });
      setProfile(prev => ({ ...prev!, ...formData }));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    const toastId = toast.loading('Uploading logo...');
    try {
      await api.post('/api/company/logo/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Logo uploaded successfully!', { id: toastId });
      // Refresh to show new logo
      window.location.reload();
    } catch (err) {
      toast.error('Failed to upload logo.', { id: toastId });
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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-navy-900">
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
          
          <Link to="/company/dashboard" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
            Dashboard
          </Link>
          <Link to="/company/applications" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <ClipboardList size={18} className="group-hover:scale-110 transition-transform" />
            Applications
          </Link>
          <Link to="/company/offers" className="flex items-center gap-4 px-4 py-3.5 text-white/40 hover:text-white hover:bg-white/5 rounded-2xl text-[13px] font-bold tracking-wide transition-all group">
            <Briefcase size={18} className="group-hover:scale-110 transition-transform" />
            Manage Offers
          </Link>
          
          <div className="pt-8 pb-4 px-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">Account</p>
          </div>
          
          <Link to="/company/profile" className="flex items-center gap-4 px-4 py-3.5 bg-blue-600 rounded-2xl text-[13px] font-bold tracking-wide transition-all shadow-lg shadow-blue-600/20 group">
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
      <main className="flex-1 ml-72 min-h-screen">
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-12 sticky top-0 z-40">
          <div>
            <h2 className="text-2xl font-display font-bold text-navy-900 tracking-tight">Company Profile</h2>
            <p className="text-[11px] font-bold uppercase tracking-widest text-navy-900/30 mt-1">Manage your identity and verification</p>
          </div>
          
          <div className="flex items-center gap-4">
            {profile?.isApproved ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl border border-green-100/50">
                <CheckCircle2 size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Verified Partner</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-xl border border-orange-100/50">
                <AlertCircle size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Pending Verification</span>
              </div>
            )}
            <button className="relative p-3 bg-paper rounded-2xl text-navy-900/40 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100">
              <Bell size={20} />
            </button>
          </div>
        </header>

        <div className="p-12 max-w-5xl mx-auto space-y-12">
          {/* Hero Profile Section */}
          <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
            
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative group">
                <div className="w-40 h-40 rounded-[2.5rem] bg-navy-900 overflow-hidden flex items-center justify-center text-white text-5xl font-bold shadow-2xl shadow-navy-900/20">
                  {profile?.companyName?.[0]}
                </div>
                <label className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer">
                  <Camera size={20} />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </label>
              </div>

              <div className="flex-1 space-y-4 text-center md:text-left">
                <div>
                  <h1 className="text-4xl font-display font-bold text-navy-900 tracking-tight">{profile?.companyName}</h1>
                  <p className="text-navy-900/40 font-medium flex items-center justify-center md:justify-start gap-2 mt-2">
                    <MapPin size={16} className="text-blue-600" /> {profile?.location}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                  <a href={profile?.website} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-paper rounded-xl text-[10px] font-bold uppercase tracking-widest text-navy-900 shadow-sm hover:bg-white hover:shadow-md transition-all flex items-center gap-2">
                    <Globe size={14} /> Website
                  </a>
                  <div className="px-4 py-2 bg-paper rounded-xl text-[10px] font-bold uppercase tracking-widest text-navy-900 shadow-sm flex items-center gap-2">
                    <Mail size={14} /> {profile?.email}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all ${
                  isEditing ? 'bg-paper text-navy-900' : 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 hover:bg-navy-900'
                }`}
              >
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-display font-bold text-navy-900">General Information</h3>
                  {isEditing && (
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 text-blue-600 font-bold text-[11px] uppercase tracking-widest active:scale-95 transition-all"
                    >
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      Save Changes
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 ml-4">Company Name</label>
                    <input 
                      disabled={!isEditing}
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900 disabled:opacity-60"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 ml-4">Phone Number</label>
                    <input 
                      disabled={!isEditing}
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 ml-4">Company Description</label>
                  <textarea 
                    disabled={!isEditing}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={5}
                    className="w-full bg-paper border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900 resize-none disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* Verification Items */}
            <div className="space-y-8">
              <div className="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm">
                <h3 className="text-xl font-display font-bold text-navy-900 mb-8 px-2">Verification Items</h3>
                
                <div className="space-y-4">
                  <div className={`p-6 rounded-[2rem] border transition-all ${profile?.registreCommerce ? 'bg-blue-50/40 border-blue-600/10' : 'bg-red-50/40 border-red-600/10'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${profile?.registreCommerce ? 'bg-blue-600 text-white' : 'bg-red-100 text-red-600'}`}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30">Commercial Register</p>
                        <p className="font-bold text-sm text-navy-900">RC Document (PDF)</p>
                      </div>
                    </div>
                    {profile?.registreCommerce ? (
                      <a 
                        href={profile.registreCommerce} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-white text-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-blue-600/20 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                        View Document
                      </a>
                    ) : (
                      <button className="w-full py-3 bg-red-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-navy-900 transition-all">
                        Upload Required
                      </button>
                    )}
                  </div>

                  <div className="p-6 bg-paper rounded-[2rem] border border-gray-50 opacity-60">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-navy-900/10 flex items-center justify-center text-navy-900/30">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30">Tax ID</p>
                        <p className="font-bold text-sm text-navy-900">NIF Verification</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-navy-900/30 uppercase tracking-[0.2em]">Optional for now</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-navy-900 rounded-[2.5rem] p-8 text-white">
                <h4 className="font-bold mb-2">Need Support?</h4>
                <p className="text-white/60 text-xs leading-relaxed mb-6">If you have issues with your verification or profile, contact our partner support team.</p>
                <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyProfile;