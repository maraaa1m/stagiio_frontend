import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Camera, 
  FileText, 
  Check, 
  ArrowRight, 
  Loader2, 
  Upload,
  X,
  File
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Toaster } from 'sonner';

interface StudentProfile {
  firstName: string;
  lastName: string;
}

const MediaSetup = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cv, setCv] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const navigate = useNavigate();
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get('/api/student/profile/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        toast.error('Failed to load profile data.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be less than 5MB');
        return;
      }
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('CV must be less than 10MB');
        return;
      }
      setCv(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem('access_token');
    
    try {
      // Upload Photo if selected
      if (photo) {
        const photoData = new FormData();
        photoData.append('photo', photo);
        await axios.post('/api/student/profile/photo/', photoData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      // Upload CV if selected
      if (cv) {
        const cvData = new FormData();
        cvData.append('cv', cv);
        await axios.post('/api/student/upload-cv/', cvData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      toast.success('Media updated successfully!');
      navigate('/student/dashboard');
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.detail || 'Failed to upload files. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = () => {
    if (!profile) return 'S';
    return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-20 relative overflow-hidden">
      <Toaster position="top-right" richColors />
      
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50/40 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
            <span className="font-bold text-xl text-navy-900">Stag<span className="text-blue-600">.io</span></span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-navy-900 mb-2 tracking-tight">Media Setup</h1>
          <p className="text-navy-900/40 font-medium">Add your visual identity and credentials</p>
          
          {/* Progress Indicator */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                <Check size={14} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-navy-900/40">Account Created</span>
            </div>
            <div className="w-12 h-[2px] bg-gray-100" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                <Check size={14} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-navy-900/40">Profile Setup</span>
            </div>
            <div className="w-12 h-[2px] bg-gray-100" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-navy-900">Media</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-premium border border-white relative">
          <form onSubmit={handleSubmit} className="space-y-12">
            
            {/* Profile Photo Section */}
            <div className="flex flex-col items-center space-y-6">
              <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40">Profile Photo</label>
              <div 
                onClick={() => photoInputRef.current?.click()}
                className="relative cursor-pointer group"
              >
                <div className="w-40 h-40 rounded-full border-2 border-dashed border-blue-600/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-600/40 group-hover:bg-blue-50/30">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-full h-full absolute inset-0 flex items-center justify-center bg-paper text-navy-900/10 text-4xl font-display font-bold">
                        {getInitials()}
                      </div>
                      <div className="relative z-10 flex flex-col items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={24} />
                        <span className="text-[10px] font-bold uppercase mt-2">Upload</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-1 right-1 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white group-hover:scale-110 transition-transform">
                  <Camera size={18} />
                </div>
                <input 
                  type="file" 
                  ref={photoInputRef}
                  onChange={handlePhotoChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <p className="text-[10px] text-navy-900/30 font-bold uppercase tracking-widest">JPG, PNG or GIF. Max 5MB.</p>
            </div>

            {/* CV Upload Section */}
            <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">Curriculum Vitae (CV)</label>
              <div 
                onClick={() => cvInputRef.current?.click()}
                className={`relative cursor-pointer group border-2 border-dashed rounded-[2rem] p-10 transition-all flex flex-col items-center justify-center gap-4 ${
                  cv ? 'border-green-500/20 bg-green-50/30' : 'border-blue-600/20 bg-paper hover:border-blue-600/40 hover:bg-blue-50/30'
                }`}
              >
                {cv ? (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/20">
                      <FileText size={32} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-navy-900 text-sm mb-1">{cv.name}</p>
                      <p className="text-[10px] font-bold text-navy-900/40 uppercase tracking-widest">{formatFileSize(cv.size)}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setCv(null);
                      }}
                      className="absolute top-4 right-4 p-2 text-navy-900/20 hover:text-red-500 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-navy-900 text-sm mb-1">Click to upload your CV</p>
                      <p className="text-[10px] font-bold text-navy-900/40 uppercase tracking-widest">PDF files only. Max 10MB.</p>
                    </div>
                  </>
                )}
                <input 
                  type="file" 
                  ref={cvInputRef}
                  onChange={handleCvChange}
                  accept=".pdf"
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <button 
                disabled={isLoading}
                type="submit"
                className="w-full py-5 bg-navy-900 text-white rounded-2xl font-bold text-[13px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-navy-900/10 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Save & Continue
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => navigate('/student/dashboard')}
                className="w-full py-4 text-[11px] font-bold uppercase tracking-widest text-navy-900/40 hover:text-navy-900 transition-colors"
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default MediaSetup;
