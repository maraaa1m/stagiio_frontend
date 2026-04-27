import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, ArrowRight, X } from 'lucide-react';

interface ProfileGuardContextType {
  checkProfileComplete: (skills: any[]) => boolean;
}

const ProfileGuardContext = createContext<ProfileGuardContextType | undefined>(undefined);

export const useProfileGuard = () => {
  const context = useContext(ProfileGuardContext);
  if (!context) {
    throw new Error('useProfileGuard must be used within a ProfileGuardProvider');
  }
  return context;
};

export const ProfileGuardProvider = ({ children }: { children: ReactNode }) => {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const checkProfileComplete = (skills: any[]) => {
    const isComplete = Array.isArray(skills) && skills.length > 0;
    if (!isComplete) {
      setShowModal(true);
      return false;
    }
    return true;
  };

  return (
    <ProfileGuardContext.Provider value={{ checkProfileComplete }}>
      {children}
      
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
            >
              {/* Decorative background */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-blue-50 rounded-full -z-10" />
              
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 text-navy-900/20 hover:text-navy-900 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                  <AlertCircle size={32} />
                </div>
                
                <h3 className="text-2xl font-display font-bold text-navy-900 mb-3">
                  Complete Your Profile
                </h3>
                <p className="text-navy-900/40 font-medium mb-8">
                  You need to complete your profile to unlock this feature and start applying for internships.
                </p>

                <div className="w-full space-y-3">
                  <button 
                    onClick={() => {
                      setShowModal(false);
                      navigate('/profile/setup');
                    }}
                    className="w-full py-4 bg-navy-900 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3"
                  >
                    Complete Now
                    <ArrowRight size={16} />
                  </button>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="w-full py-4 text-[11px] font-bold uppercase tracking-widest text-navy-900/40 hover:text-navy-900 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ProfileGuardContext.Provider>
  );
};
