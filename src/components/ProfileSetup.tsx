import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Github, 
  Link as LinkIcon, 
  CreditCard, 
  ArrowRight, 
  Loader2, 
  Check,
  Plus
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Skill {
  id: number;
  skillName: string;
}

const ProfileSetup = () => {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [github, setGithub] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [idCard, setIdCard] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSkills = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await axios.get('/api/skills/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Ensure we set an array even if the API returns something else
        const skillsData = Array.isArray(response.data) ? response.data : [];
        setAvailableSkills(skillsData);
      } catch (err) {
        console.error('Failed to fetch skills:', err);
        setError('Failed to load skills. Please check your connection.');
      } finally {
        setIsFetching(false);
      }
    };
    fetchSkills();
  }, []);

  const toggleSkill = (id: number) => {
    setSelectedSkills(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSkills.length === 0) {
      setError('Please select at least one technical skill.');
      return;
    }
    if (!idCard) {
      setError('Student ID Card Number is required.');
      return;
    }

    setIsLoading(true);
    setError('');

    const token = localStorage.getItem('access_token');

    try {
      await axios.put('/api/student/update/', {
        skills: selectedSkills,
        githubLink: github,
        portfolioLink: portfolio,
        IDCardNumber: idCard
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      localStorage.setItem('profileComplete', 'true');
      navigate('/profile/media');
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.detail || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('profileComplete', 'false');
    navigate('/profile/media');
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6 py-20 relative overflow-hidden">
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
          <h1 className="text-3xl font-display font-bold text-navy-900 mb-2">Complete Your Profile</h1>
          <p className="text-navy-900/40 font-medium">Help us find your perfect match</p>
          
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
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-navy-900">Profile Setup</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-premium border border-white relative">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Skills Section */}
            <div className="space-y-4">
              <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">
                Your Technical Skills <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3 p-2">
                {isFetching ? (
                  <div className="flex items-center gap-2 text-navy-900/30 py-4">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-widest">Loading skills...</span>
                  </div>
                ) : (
                  Array.isArray(availableSkills) && availableSkills.map((skill) => {
                    const isSelected = selectedSkills.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => toggleSkill(skill.id)}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${
                          isSelected 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                            : 'bg-transparent border-blue-600/20 text-blue-600 hover:border-blue-600/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {skill.skillName}
                          {isSelected ? <Check size={12} /> : <Plus size={12} />}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* GitHub Link */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">GitHub Link</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                    <Github size={18} />
                  </div>
                  <input 
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                  />
                </div>
              </div>

              {/* Portfolio Link */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">Portfolio Link</label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                    <LinkIcon size={18} />
                  </div>
                  <input 
                    type="url"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="https://yourportfolio.com"
                    className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                  />
                </div>
              </div>

              {/* ID Card Number */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-navy-900/40 ml-4">
                  ID Card Number <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-navy-900/30 group-focus-within:text-blue-600 transition-colors">
                    <CreditCard size={18} />
                  </div>
                  <input 
                    required
                    type="text"
                    value={idCard}
                    onChange={(e) => setIdCard(e.target.value)}
                    placeholder="Enter your student ID"
                    className="w-full bg-paper border border-gray-100 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                  />
                </div>
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
                    Complete Profile
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              
              <button 
                type="button"
                onClick={handleSkip}
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

export default ProfileSetup;
