"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { 
  GraduationCap, Eye, EyeOff, ChevronRight, ArrowLeft, BookOpen, 
  Users, BarChart3, Globe, Shield, Building2, Sparkles, CheckCircle2,
  Lock, ArrowRight, ShieldCheck, School as SchoolIcon
} from 'lucide-react';
import api from '@/lib/api';
import PageLoader from '@/components/PageLoader';

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      type: "spring" as any, 
      stiffness: 100, 
      damping: 20,
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 100 } }
};

interface School {
  id: string;
  name: string;
  code?: string;
  address?: string;
  contact_email?: string;
}

const DEFAULT_SCHOOLS: School[] = [
  {
    id: "fcc6aea0-b378-4a72-808f-2cdbd361ed24",
    name: "Bharathi Matriculation Hr. Sec. School",
    code: "BMHSS",
    address: "104 Gandhi Road, Anna Nagar, Chennai, TN",
    contact_email: "admin@bharathischool.edu"
  },
  {
    id: "school22-2222-2222-2222-222222222222",
    name: "Delhi Public International School (DPS)",
    code: "DPIS",
    address: "Sector 4, Dwarka, New Delhi",
    contact_email: "contact@dpsinternational.edu"
  },
  {
    id: "school33-3333-3333-3333-333333333333",
    name: "St. Xavier's Model Academy",
    code: "SXMA",
    address: "30 Park Street, Kolkata, West Bengal",
    contact_email: "info@stxaviersacademy.edu"
  },
  {
    id: "school44-4444-4444-4444-444444444444",
    name: "PaperBuddy Demonstration Academy",
    code: "PBDA",
    address: "Tech Park Avenue, Bengaluru, Karnataka",
    contact_email: "demo@paperbuddy.erp"
  }
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [schools, setSchools] = useState<School[]>(DEFAULT_SCHOOLS);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);

  const { login, isLoading, error, isAuthenticated, checkAuth, user } = useAuthStore();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);
  const [isSuccessMorphing, setIsSuccessMorphing] = useState(false);

  useEffect(() => {
    checkAuth();
    setHasChecked(true);
    fetchSchools();
  }, [checkAuth]);

  const fetchSchools = async () => {
    try {
      const res = await api.get('/schools/public');
      if (res.data && res.data.length > 0) {
        setSchools(res.data);
      }
    } catch (err) {
      console.log("Using fallback seeded schools");
    } finally {
      setIsLoadingSchools(false);
    }
  };

  const getRoleDestination = (role?: string) => {
    switch (role) {
      case 'student': return '/student/documents';
      case 'parent': return '/parent';
      case 'warden': return '/warden/rooms';
      case 'librarian': return '/librarian';
      case 'transport': return '/transport/fleet';
      default: return '/dashboard';
    }
  };

  useEffect(() => {
    if (hasChecked && isAuthenticated && user) {
      window.location.replace(getRoleDestination(user.role));
    }
  }, [isAuthenticated, hasChecked, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      setIsSuccessMorphing(true);
      const currentUser = useAuthStore.getState().user;
      setTimeout(() => {
        window.location.replace(getRoleDestination(currentUser?.role));
      }, 300);
    }
  };
  const handleQuickLogin = async (demoEmail: string, demoPassword?: string) => {
    const pw = demoPassword || 'school@123';
    setEmail(demoEmail);
    setPassword(pw);
    if (!selectedSchool && schools.length > 0) {
      const otherSchool = schools.find(s => s.code !== 'BMHSS') || schools[0];
      setSelectedSchool(otherSchool);
    }
    const success = await login(demoEmail, pw);
    if (success) {
      setIsSuccessMorphing(true);
      const currentUser = useAuthStore.getState().user;
      setTimeout(() => {
        window.location.replace(getRoleDestination(currentUser?.role));
      }, 300);
    }
  };

  const quickLogins = [
    { label: '🌟 Founder', email: 'superadmin@school.edu' },
    { label: '💼 Correspondent', email: 'correspondent@school.edu' },
    { label: '🎓 Principal', email: 'principal@school.edu' },
    { label: '🏛️ VP', email: 'vp@school.edu' },
    { label: '👩‍🏫 Teacher', email: 'sarah.connor@school.edu' },
    { label: '🤝 Mentor', email: 'mentor.10a@school.edu' },
    { label: '👨‍🎓 Student', email: 'kishor.k@school.edu' },
    { label: '💰 Finance', email: 'finance@school.edu' },
    { label: '🏠 Warden', email: 'warden@school.edu' },
    { label: '📚 Librarian', email: 'librarian@school.edu' },
    { label: '🚌 Transport', email: 'transport@school.edu' },
  ];

  const isBharathi = selectedSchool?.code === 'BMHSS' || selectedSchool?.id === 'fcc6aea0-b378-4a72-808f-2cdbd361ed24' || selectedSchool?.name?.toLowerCase().includes('bharathi');



  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD] dark:bg-[#0b0f19] p-4 font-sans overflow-hidden transition-colors duration-300">
      {/* Background Animated Elements */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[30%] -right-[10%] w-[800px] h-[800px] rounded-full bg-brand-blue/5 dark:bg-brand-blue/10 blur-3xl"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-3xl"
            />
            
            {/* Floating Icons Left Side */}
            <motion.div 
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[20%] left-[15%] hidden lg:flex items-center justify-center w-16 h-16 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl shadow-xl border border-white dark:border-slate-700"
            >
              <GraduationCap className="w-8 h-8 text-brand-blue/60 dark:text-blue-400/80" />
            </motion.div>
            
            <motion.div 
              animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[30%] left-[10%] hidden lg:flex items-center justify-center w-20 h-20 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-full shadow-lg border border-white dark:border-slate-700"
            >
              <BookOpen className="w-10 h-10 text-indigo-400/50 dark:text-indigo-400/80" />
            </motion.div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate={isSuccessMorphing ? { scale: 0.2, opacity: 0, borderRadius: "100%" } : "visible"}
            transition={{ duration: 0.6, type: "spring" }}
            className="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[36px] shadow-2xl overflow-hidden relative flex flex-col pt-10 pb-8 px-8 min-h-[640px] border border-gray-100 dark:border-slate-800 z-10 transition-colors duration-300"
          >
            
            {/* Back / Change School Button */}
            {selectedSchool ? (
              <button 
                onClick={() => setSelectedSchool(null)} 
                className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold text-brand-blue dark:text-blue-400 hover:opacity-80 transition-opacity bg-brand-blue/10 dark:bg-blue-500/10 px-3 py-1.5 rounded-full"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Change School
              </button>
            ) : (
              <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-slate-400 hover:text-brand-blue dark:hover:text-blue-400 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back Home
              </Link>
            )}

            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full mt-4">
              {/* Logo & Branding */}
              <motion.div variants={itemVariants} className="flex flex-col items-center mb-5 space-y-2">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-16 h-16 flex items-center justify-center p-2 rounded-2xl bg-brand-blue/10 dark:bg-blue-500/10"
                >
                  <Building2 className="w-10 h-10 text-brand-blue dark:text-blue-400" />
                </motion.div>
                <div className="text-center">
                  <h1 className="text-2xl font-extrabold text-[#111827] dark:text-slate-100 tracking-tight">
                    {selectedSchool ? selectedSchool.name : "Select Your School"}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">
                    {selectedSchool ? "Enter your portal credentials to continue" : "Choose your school workspace to continue"}
                  </p>
                </div>
              </motion.div>

              {/* VIEW 1: SCHOOL SELECTION LIST */}
              {!selectedSchool ? (
                <motion.div variants={itemVariants} className="flex flex-col gap-3 w-full">
                  <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                    {schools.map(school => (
                      <motion.button
                        key={school.id}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedSchool(school)}
                        className="p-3.5 rounded-2xl border border-gray-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/70 shadow-sm hover:border-brand-blue dark:hover:border-blue-500 hover:shadow-md cursor-pointer transition-all flex items-center justify-between text-left w-full group"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 dark:bg-blue-500/15 flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-all shrink-0 text-brand-blue dark:text-blue-400">
                            <SchoolIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-slate-100 text-sm group-hover:text-brand-blue dark:group-hover:text-blue-400 transition-colors">
                              {school.name}
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {school.address || "Active CBSE/State Board Academic Campus"}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-blue dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                /* VIEW 2: SCHOOL CREDENTIALS LOGIN FORM */
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.3 }}
                  className="w-full flex flex-col"
                >
                  <form onSubmit={handleSubmit} className="space-y-3.5 w-full">
                    {/* Email Field */}
                    <div className="space-y-1">
                      <label htmlFor="email" className="text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide px-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. kishor.k@school.edu"
                        required
                        className={`w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/90 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 transition-all border ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 dark:border-slate-700 focus:ring-brand-blue/50'}`}
                      />
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center px-1">
                        <label htmlFor="password" className="text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wide">
                          Password
                        </label>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500">Default: school@123</span>
                      </div>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          required
                          className={`w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800/90 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 transition-all border pr-12 ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-gray-200 dark:border-slate-700 focus:ring-brand-blue/50'}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="px-3.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-xs font-medium text-center border border-red-200 dark:border-red-900/50"
                      >
                        {error}
                      </motion.div>
                    )}

                    {/* Login Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 rounded-2xl bg-brand-blue hover:bg-brand-blue/90 text-white font-bold text-sm shadow-md shadow-brand-blue/30 disabled:opacity-70 transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>Sign In to School Portal <ChevronRight className="w-4 h-4" /></>
                      )}
                    </motion.button>
                  </form>

                  {/* Quick Role Login for Demo/Other Schools */}
                  {!isBharathi && (
                    <div className="mt-5 pt-3.5 border-t border-gray-100 dark:border-slate-800 flex flex-col items-center">
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold mb-2 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" /> 1-Click Role Login
                      </p>
                      <div className="flex flex-wrap justify-center gap-1.5">
                        {quickLogins.map((ql) => (
                          <motion.button
                            whileHover={{ scale: 1.06 }}
                            whileTap={{ scale: 0.94 }}
                            key={ql.email}
                            type="button"
                            onClick={() => handleQuickLogin(ql.email)}
                            disabled={isLoading}
                            className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-[10px] font-bold text-gray-700 dark:text-slate-300 hover:bg-brand-blue hover:text-white dark:hover:bg-blue-600 border border-gray-200/60 dark:border-slate-700 transition-colors"
                          >
                            {ql.label}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
    </div>
  );
}
