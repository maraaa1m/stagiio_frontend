import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import { 
  Search, 
  ChevronDown, 
  GraduationCap, 
  Target, 
  FileCheck,
  Briefcase,
  Users,
  Globe,
  User,
  LogOut,
  LayoutDashboard,
  ArrowRight,
  ChevronRight,
  Building2,
  Mail,
  Send,
  MessageSquare
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from '@/api';
import { toast, Toaster } from 'sonner';

const Navbar = ({ user, handleLogout, getDashboardLink, getProfileLink }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const navigate = useNavigate();
  
  // Floating effect values
  const width = useTransform(scrollY, [0, 100], ["100%", "95%"]);
  const top = useTransform(scrollY, [0, 100], ["0px", "20px"]);
  const borderRadius = useTransform(scrollY, [0, 100], ["0px", "32px"]);
  const boxShadow = useTransform(scrollY, [0, 100], ["none", "0 20px 50px -12px rgba(0, 0, 0, 0.08)"]);
  const backgroundColor = useTransform(scrollY, [0, 100], ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.9)"]);
  const border = useTransform(scrollY, [0, 100], ["1px solid rgba(255,255,255,0)", "1px solid rgba(255,255,255,0.2)"]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <motion.nav 
        style={{ 
          width, 
          top, 
          borderRadius, 
          boxShadow, 
          backgroundColor,
          border,
          backdropFilter: "blur(12px)" 
        }}
        className="h-16 md:h-20 flex items-center transition-all duration-300 pointer-events-auto relative"
      >
        <div className="container mx-auto px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
            <span className="font-bold text-xl text-navy-900">Stag<span className="text-blue-600">.io</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <Link 
              to="/register?type=student" 
              className="text-[13px] font-bold uppercase tracking-widest text-navy-900/60 hover:text-blue-600 transition-colors"
            >
              Find Internships
            </Link>
            <Link 
              to="/register?type=company" 
              className="text-[13px] font-bold uppercase tracking-widest text-navy-900/60 hover:text-blue-600 transition-colors"
            >
              Add Internship Offer
            </Link>
            <a 
              href="#about-us" 
              className="text-[13px] font-bold uppercase tracking-widest text-navy-900/60 hover:text-blue-600 transition-colors"
            >
              About Us
            </a>
            <a 
              href="#contact" 
              className="text-[13px] font-bold uppercase tracking-widest text-navy-900/60 hover:text-blue-600 transition-colors"
            >
              Contact
            </a>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {!user ? (
              <>
                <button 
                  onClick={() => navigate('/login')}
                  className="text-[13px] font-bold uppercase tracking-widest text-navy-900 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-7 py-3 text-[13px] font-bold uppercase tracking-widest text-white bg-navy-900 rounded-full hover:bg-blue-600 transition-all shadow-xl shadow-navy-900/10 hover:shadow-blue-600/20 active:scale-95"
                >
                  Get Started
                </button>
              </>
            ) : (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 p-1.5 pr-4 bg-white border border-gray-100 rounded-full hover:shadow-lg transition-all active:scale-95"
                >
                  <div className="w-9 h-9 rounded-full bg-navy-900 flex items-center justify-center overflow-hidden border border-gray-50 shrink-0">
                    {user.photo ? (
                      <img 
                        src={user.photo} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-white text-[10px] font-bold uppercase">
                        {user.firstName?.[0] || user.role[0]}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-navy-900 truncate max-w-[100px]">
                    {user.firstName || 'User'}
                  </span>
                  <ChevronDown size={14} className={`text-navy-900/30 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl border border-gray-100 p-3 z-[110] overflow-hidden"
                    >
                      <div className="flex flex-col gap-1">
                        <Link 
                          to={getDashboardLink()}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-4 px-5 py-4 hover:bg-blue-50 text-navy-900 hover:text-blue-600 rounded-2xl transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <LayoutDashboard size={18} />
                          </div>
                          <span className="text-[13px] font-bold uppercase tracking-widest">Dashboard</span>
                        </Link>
                        
                        <Link 
                          to={getProfileLink()}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-4 px-5 py-4 hover:bg-blue-50 text-navy-900 hover:text-blue-600 rounded-2xl transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <User size={18} />
                          </div>
                          <span className="text-[13px] font-bold uppercase tracking-widest text-nowrap">My Profile</span>
                        </Link>

                        <div className="h-px bg-gray-50 my-2 mx-5" />

                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-4 px-5 py-4 w-full hover:bg-red-50 text-navy-900 hover:text-red-500 rounded-2xl transition-all group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                            <LogOut size={18} />
                          </div>
                          <span className="text-[13px] font-bold uppercase tracking-widest">Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <button className="md:hidden p-2 text-navy-900" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <div className="w-6 h-6 flex items-center justify-center">✕</div> : <div className="w-6 h-6 flex items-center justify-center">☰</div>}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-full mt-4 left-0 right-0 bg-white rounded-3xl p-6 md:hidden flex flex-col gap-6 shadow-2xl border border-gray-100"
          >
            <Link 
              to="/register?type=student" 
              className="text-lg font-bold text-navy-900"
              onClick={() => setIsOpen(false)}
            >
              Find Internships
            </Link>
            <Link 
              to="/register?type=company" 
              className="text-lg font-bold text-navy-900"
              onClick={() => setIsOpen(false)}
            >
              Add Internship Offer
            </Link>
            <a 
              href="#about-us" 
              className="text-lg font-bold text-navy-900"
              onClick={() => setIsOpen(false)}
            >
              About Us
            </a>
            <a 
              href="#contact" 
              className="text-lg font-bold text-navy-900"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </a>
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-50">
              {!user ? (
                <>
                  <button 
                    onClick={() => { navigate('/login'); setIsOpen(false); }}
                    className="w-full py-4 text-sm font-bold uppercase tracking-widest text-navy-900 border border-navy-900/10 rounded-2xl"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => { navigate('/register'); setIsOpen(false); }}
                    className="w-full py-4 text-sm font-bold uppercase tracking-widest text-white bg-navy-900 rounded-2xl"
                  >
                    Get Started
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => { navigate(getDashboardLink()); setIsOpen(false); }}
                    className="w-full py-4 text-sm font-bold uppercase tracking-widest text-navy-900 border border-navy-900/10 rounded-2xl flex items-center justify-center gap-3"
                  >
                    <LayoutDashboard size={18} />
                    Dashboard
                  </button>
                  <button 
                    onClick={() => { handleLogout(); setIsOpen(false); }}
                    className="w-full py-4 text-sm font-bold uppercase tracking-widest text-white bg-red-500 rounded-2xl flex items-center justify-center gap-3"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </motion.nav>
    </div>
  );
};

const Hero = ({ user, getDashboardLink }: any) => {
  const navigate = useNavigate();
  return (
    <section className="relative pt-32 pb-20 md:pt-56 md:pb-40 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50/40 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
           
            <h1 className="text-6xl md:text-8xl font-display font-extrabold leading-[0.95] mb-8 text-navy-900 tracking-tighter text-balance">
              {user ? (
                <>
                  Welcome Back, <br />
                  <span className="text-blue-600 italic"> {user.firstName || user.role} </span> 
                </>
              ) : (
                <>
                  Find The Perfect <br />
                  <span className="text-blue-600 italic"> Internship </span> <br /> In Minute
                </>
              )}
            </h1>
            
            <p className="text-xl text-navy-900/70 mb-12 max-w-xl leading-relaxed font-medium">
              {user 
                ? `You're signed in as a ${user.role.toLowerCase()}. Ready to continue your journey?`
                : "We connect the brightest Algerian minds with industry leaders through an intelligent, data-driven matching ecosystem."
              }
            </p>

            {user ? (
               <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => navigate(getDashboardLink())}
                    className="bg-navy-900 text-white px-10 py-5 rounded-3xl font-bold text-[13px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-navy-900/20 active:scale-95 flex items-center gap-3"
                  >
                    Go To Dashboard
                    <ArrowRight size={18} />
                  </button>
                  {user.role === 'STUDENT' && (
                    <button 
                      onClick={() => navigate('/student/offers')}
                      className="bg-white text-navy-900 px-10 py-5 rounded-3xl font-bold text-[13px] uppercase tracking-widest hover:bg-gray-50 transition-all border border-gray-100 active:scale-95"
                    >
                      Browse More Offers
                    </button>
                  )}
               </div>
            ) : (
              <div className="flex flex-wrap gap-6 mt-12">
                <button 
                  onClick={() => navigate('/register?type=student')}
                  className="bg-navy-900 text-white px-10 py-5 rounded-3xl font-bold text-[13px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-navy-900/20 active:scale-95 flex items-center gap-3 group"
                >
                  Find Internships
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate('/register?type=company')}
                  className="bg-white text-navy-900 px-10 py-5 rounded-3xl font-bold text-[13px] uppercase tracking-widest hover:bg-gray-50 transition-all border border-gray-100 active:scale-95"
                >
                  Post an Offer
                </button>
              </div>
            )}

          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* Hero Image with Premium Styling */}
            <div className="relative z-10 group">
              <div className="absolute -inset-4 bg-blue-600/10 rounded-[3rem] blur-2xl group-hover:bg-blue-600/20 transition-all duration-700" />
              <div className="relative aspect-[4/5] md:aspect-square rounded-[2.5rem] overflow-hidden shadow-premium border border-white">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200" 
                  alt="Algerian students collaborating" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent opacity-60" />
              </div>
            </div>

            
 
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const BentoStats = () => {
  return (
    <section className="py-24 bg-paper">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100 flex flex-col justify-between group hover:border-blue-600/20 transition-colors">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mb-8">
                <Users size={28} />
              </div>
              <h3 className="text-4xl font-display font-bold text-navy-900 mb-2">12,400+</h3>
              <p className="text-navy-900/60 font-bold uppercase tracking-widest text-[11px]">Registered Students</p>
            </div>
            <p className="mt-8 text-navy-900/70 font-medium leading-relaxed">
              The largest network of academic talent in Algeria, spanning across all 58 Wilayas.
            </p>
          </div>
          
          <div className="bg-navy-900 p-10 rounded-[2.5rem] flex flex-col justify-between text-white">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
              <Briefcase size={28} />
            </div>
            <div>
              <h3 className="text-4xl font-display font-bold mb-2">840+</h3>
              <p className="text-white/40 font-bold uppercase tracking-widest text-[11px]">Partner Companies</p>
            </div>
          </div>

          <div className="bg-blue-600 p-10 rounded-[2.5rem] flex flex-col justify-between text-white">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
              <Globe size={28} />
            </div>
            <div>
              <h3 className="text-4xl font-display font-bold mb-2">58</h3>
              <p className="text-white/40 font-bold uppercase tracking-widest text-[11px]">Wilaya Coverage</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Process = () => {
  const steps = [
    {
      title: "Digital Identity",
      desc: "Create a professional profile that highlights your academic excellence and technical projects.",
      icon: <GraduationCap size={32} />
    },
    {
      title: "Smart Matching",
      desc: "Our neural engine analyzes thousands of data points to find your optimal career trajectory.",
      icon: <Target size={32} />
    },
    {
      title: "Seamless Integration",
      desc: "Automated internship agreements and digital onboarding for a frictionless experience.",
      icon: <FileCheck size={32} />
    }
  ];

  return (
    <section id="university-network" className="py-32 bg-paper">
      <div className="container mx-auto px-6">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-navy-900 mb-6 tracking-tighter">Engineered for Excellence</h2>
          <p className="text-navy-900/60 font-medium max-w-2xl mx-auto text-lg">We've redesigned the internship lifecycle from the ground up.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <div key={step.title} className="relative group">
              <div className="mb-10 relative">
                <div className="w-20 h-20 rounded-3xl bg-white shadow-premium flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-500">
                  {step.icon}
                </div>
                <div className="absolute -top-4 -right-4 text-7xl font-display font-black text-navy-900/[0.03] select-none">0{i + 1}</div>
              </div>
              <h3 className="text-2xl font-display font-bold text-navy-900 mb-4">{step.title}</h3>
              <p className="text-navy-900/60 leading-relaxed font-medium">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-32 bg-paper">
      <div className="container mx-auto px-6">
        <div className="relative bg-navy-900 rounded-[4rem] p-16 md:p-32 overflow-hidden text-center shadow-2xl shadow-navy-900/20">
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#2563EB,transparent_70%)]" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          </div>

          <div className="relative z-10">
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-4xl md:text-7xl font-display font-bold text-white mb-10 tracking-tighter leading-none"
            >
            Find The Perfect Internship Now.
            </motion.h2>
            <p className="text-white/40 text-xl mb-16 max-w-2xl mx-auto font-medium">
              Join the ecosystem that's powering the next generation of Algerian innovators.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button 
                onClick={() => navigate('/register?type=student')}
                className="w-full sm:w-auto px-12 py-6 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-[13px] uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-3 group"
              >
                Join as a Student
              </button>
              <button 
                onClick={() => navigate('/register?type=company')}
                className="w-full sm:w-auto px-12 py-6 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-[13px] uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-3 group"
              >
                Join as a Company
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="pb-8 px-6 bg-paper">
      <div className="bg-navy-900 rounded-[40px] p-12 md:p-24 relative overflow-hidden shadow-2xl shadow-navy-900/20">
        {/* Match CTA section decorative background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#2563EB,transparent_70%)]" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        </div>
        
        <div className="relative z-10">
          <div className="grid md:grid-cols-4 gap-16 mb-24">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                  <span className="font-bold text-xl text-white">Stag<span className="text-blue-600">.io</span></span>
                </div>
              </div>
              <p className="text-white/70 font-medium max-w-sm leading-relaxed">
                Empowering the Algerian academic community by bridging the gap between education and industry.
              </p>
            </div>
            
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-8">Platform</h4>
              <ul className="space-y-4">
                {["Find Internships", "For Companies", "University Portal", "Success Stories"].map(item => (
                  <li key={item}><a href="#" className="text-sm font-bold text-white/70 hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white mb-8">Company</h4>
              <ul className="space-y-4">
                {["About Us", "Careers", "Privacy Policy", "Contact"].map(item => (
                  <li key={item}><a href="#" className="text-sm font-bold text-white/70 hover:text-white transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/10 gap-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">© 2026 Stag.io — Constantine, Algeria</p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">Crafted for Algerian Excellence</span>
              <div className="w-4 h-4 rounded-full bg-blue-600/10 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const AboutUs = () => {
  // Point to local files the user says are in src/components
  const getImg = (name: string) => `/src/components/${name}`;

  return (
    <section id="about-us" className="bg-paper py-24 space-y-32">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* ROW 1: Image LEFT, Text RIGHT */}
        <div className="grid gap-16 md:grid-cols-2 md:items-center mb-32">
          <div className="order-1 flex justify-center">
            <div className="aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl border border-navy-900/5">
               <img src={getImg('stage.jpg')} className="h-full w-full object-cover" alt="Recruitment" />
            </div>
          </div>
          <div className="order-2">
            <span className="text-xs font-bold tracking-[0.2em] text-blue-600 uppercase">For Students</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy-900 md:text-5xl">Find Your Opportunity</h2>
            <p className="mt-6 text-lg leading-relaxed text-navy-900/60">
  Stag.io helps you easily discover internships that match your field through a wide network of companies across Algeria.
With a smart system, it recommends the best opportunities based on your skills and increases your chances of getting accepted quickly.            </p>
            <button className="mt-8 flex items-center gap-2 rounded-full border-2 border-blue-600 px-8 py-2.5 text-sm font-bold text-blue-600 transition-all hover:bg-blue-600 hover:text-white">
              Learn more <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ROW 2: Text LEFT, Image RIGHT */}
        <div className="grid gap-16 md:grid-cols-2 md:items-center mb-32">
          <div className="order-2 md:order-1">
            <span className="text-xs font-bold tracking-[0.2em] text-blue-600 uppercase">For Companies</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy-900 md:text-5xl">Search thousands of CVs</h2>
            <p className="mt-6 text-lg leading-relaxed text-navy-900/60">
              Get in direct contact with thousands of qualified student candidates via our premium talent pool. Effortlessly find the right talent for every sector and every locality in minutes.
            </p>
            <button className="mt-8 flex items-center gap-2 rounded-full border-2 border-blue-600 px-8 py-2.5 text-sm font-bold text-blue-600 transition-all hover:bg-blue-600 hover:text-white">
              Learn more <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="order-1 md:order-2 flex justify-center">
            <div className="aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl border border-navy-900/5">
               <img src={getImg('cv.jpg')} alt="Talent database" />
            </div>
          </div>
        </div>

        {/* ROW 3: Image LEFT, Text RIGHT */}
        <div className="grid gap-16 md:grid-cols-2 md:items-center">
          <div className="order-1 flex justify-center">
            <div className="aspect-square w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl border border-navy-900/5">
               <img src={getImg('interview.jpg')} className="h-full w-full object-cover" alt="ATS Integrations" />
            </div>
          </div>
          <div className="order-2">
            <span className="text-xs font-bold tracking-[0.2em] text-blue-600 uppercase">Modern Solutions</span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-navy-900 md:text-5xl">Smart Talent Matching</h2>
            <p className="mt-6 text-lg leading-relaxed text-navy-900/60">
We are a platform that simplifies finding the most suitable students and interns for your needs using an advanced Matching Score system.
It analyzes your requirements and connects you with top candidates who best fit your criteria, saving time and improving hiring efficiency.            </p>
            <button className="mt-8 flex items-center gap-2 rounded-full border-2 border-blue-600 px-8 py-2.5 text-sm font-bold text-blue-600 transition-all hover:bg-blue-600 hover:text-white">
              Learn more <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast.success("Message sent successfully! We'll get back to you soon.");
    }, 1500);
  };

  return (
    <section id="contact" className="py-32 bg-paper relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-16 items-start">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600 mb-4">Contact Us</p>
                <h2 className="text-4xl font-display font-bold text-navy-900 tracking-tighter leading-tight">
                  Have Questions? <br />
                  <span className="text-blue-600 italic">Get In Touch</span>
                </h2>
              </div>
              
              <p className="text-navy-900/50 font-medium leading-relaxed">
                Whether you're a student looking for guidance or a company seeking talent, our team is here to support you in every step of the journey.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-5 group">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-navy-900/20">Email Us</p>
                    <p className="font-bold text-navy-900">contact@stag.io</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 group">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Globe size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-navy-900/20">Headquarters</p>
                    <p className="font-bold text-navy-900">Algiers, Algeria</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 group">
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-navy-900/20">Support</p>
                    <p className="font-bold text-navy-900">Available 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 bg-white p-10 md:p-12 rounded-[3rem] shadow-premium border border-white">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 ml-4">Your Name</label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Jane Doe"
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 ml-4">Email Address</label>
                    <input 
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="jane@example.com"
                      className="w-full bg-paper border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 ml-4">Subject</label>
                  <input 
                    required
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="How can we help?"
                    className="w-full bg-paper border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-navy-900/30 ml-4">Message</label>
                  <textarea 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Describe your inquiry..."
                    rows={5}
                    className="w-full bg-paper border border-gray-100 rounded-2xl py-4 px-6 outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all font-medium text-navy-900 resize-none"
                  />
                </div>

                <button 
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full py-5 bg-navy-900 text-white rounded-2xl font-bold text-[13px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-navy-900/10 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {isSubmitting ? "Sending..." : <>Send Message <Send size={18} /></>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function LandingPage() {
  const [user, setUser] = useState<{ role: string; photo?: string; firstName?: string; lastName?: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    
    if (token && role) {
      setUser({ role });
      // Fetch minimal profile info for the photo
      if (role === 'STUDENT') {
        api.get('/api/student/profile/').then(res => {
          const data = res.data;
          setUser({
            role,
            firstName: data.firstName || data.first_name,
            lastName: data.lastName || data.last_name,
            photo: data.photoUrl || data.photo_url || data.profile_photo?.url || data.profile_photo || data.photo
          });
        }).catch(() => {
          // If profile fetch fails, we still have the role
        });
      } else if (role === 'COMPANY') {
        api.get('/api/company/profile/').then(res => {
          const data = res.data;
          setUser({
            role,
            firstName: data.companyName || data.name,
            photo: data.logo || data.photo
          });
        }).catch(() => {});
      } else if (role === 'ADMIN') {
        // For admin, we might not have a specific profile endpoint but we have the role
        setUser({ role, firstName: 'Admin' });
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    setUser(null);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'COMPANY') return '/company/dashboard';
    return '/student/dashboard';
  };

  const getProfileLink = () => {
    if (!user) return '/';
    if (user.role === 'COMPANY') return '/company/profile';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    return '/student/profile';
  };

  return (
    <div className="min-h-screen bg-paper font-sans text-navy-900 selection:bg-blue-600/10 selection:text-blue-600">
      <Toaster position="top-right" richColors />
      <Navbar 
        user={user} 
        handleLogout={handleLogout} 
        getDashboardLink={getDashboardLink} 
        getProfileLink={getProfileLink} 
      />
      <main>
        <Hero user={user} getDashboardLink={getDashboardLink} />

        <AboutUs /> 
        <h2 className="text-2xl md:text-6xl text-center font-display font-bold text-navy-900 mt-16 mb-6 tracking-tighter"> Stag.io by the Numbers</h2>
          <p className="text-navy-900/60 font-medium max-w-2xl mx-auto text-lg mb-10">  An overview of our platform’s reach and growing community across Algeria.</p>
        <BentoStats />
        <Process />
        <ContactSection /> 
        <CTA />
      </main>
      <Footer />
    </div>
  );
}



