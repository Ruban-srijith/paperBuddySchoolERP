"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { GraduationCap, Eye, EyeOff, ChevronRight, ArrowLeft, BookOpen, Users, BarChart3, Globe, Shield, Building2 } from 'lucide-react';
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
  code: string;
  address?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [isLoadingSchools, setIsLoadingSchools] = useState(true);

  const { login, isLoading, error, isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);
  const [isSuccessMorphing, setIsSuccessMorphing] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    setHasChecked(true);
    fetchSchools();
    
    // Simulate a brief reload effect
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [checkAuth]);

  const fetchSchools = async () => {
    try {
      const res = await api.get('/schools/public');
      setSchools(res.data);
      // Removed automatic selection to force user to pick a school
    } catch (err) {
      console.error("Failed to fetch schools", err);
    } finally {
      setIsLoadingSchools(false);
    }
  };

  useEffect(() => {
    if (hasChecked && isAuthenticated) {
      // already authenticated on mount -> redirect to dashboard
      // Next.js router is fine here, or you can use window.location
      router.push('/dashboard');
    }
  }, [isAuthenticated, hasChecked, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      setIsSuccessMorphing(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 600);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPassword?: string) => {
    const pw = demoPassword || 'school@123';
    setEmail(demoEmail);
    setPassword(pw);
    const success = await login(demoEmail, pw);
    if (success) {
      setIsSuccessMorphing(true);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 600);
    }
  };

  const quickLogins = [
    { label: 'Correspondent', email: 'correspondent@school.edu' },
    { label: 'Principal', email: 'principal@school.edu' },
    { label: 'Vice-Principal', email: 'vp@school.edu' },
    { label: 'Teacher', email: 'sarah.connor@school.edu' },
    { label: 'Student', email: 'kishor.k@school.edu' },
    { label: 'Finance', email: 'finance@school.edu' },
    { label: 'Warden', email: 'warden@school.edu' },
    { label: 'Librarian', email: 'librarian@school.edu' },
    { label: 'Mentor', email: 'mentor.10a@school.edu' },
    { label: 'Transport', email: 'transport@school.edu', password: 'password123' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD] dark:bg-[#0b0f19] p-4 font-sans overflow-hidden transition-colors duration-300">
      
      {isPageLoading ? (
        <PageLoader />
      ) : (
        <>
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

        <motion.div 
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[60%] left-[25%] hidden xl:flex items-center justify-center w-12 h-12 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl shadow-md border border-white dark:border-slate-700"
        >
          <Users className="w-6 h-6 text-emerald-400/60 dark:text-emerald-400/80" />
        </motion.div>

        {/* Floating Icons Right Side */}
        <motion.div 
          animate={{ y: [0, 25, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-[25%] right-[15%] hidden lg:flex items-center justify-center w-20 h-20 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl shadow-xl border border-white dark:border-slate-700"
        >
          <BarChart3 className="w-10 h-10 text-brand-blue/60 dark:text-blue-400/80" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, -35, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute bottom-[25%] right-[10%] hidden lg:flex items-center justify-center w-16 h-16 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-full shadow-lg border border-white dark:border-slate-700"
        >
          <Globe className="w-8 h-8 text-indigo-400/50 dark:text-indigo-400/80" />
        </motion.div>

        <motion.div 
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          className="absolute top-[55%] right-[25%] hidden xl:flex items-center justify-center w-14 h-14 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl shadow-md border border-white dark:border-slate-700"
        >
          <Shield className="w-7 h-7 text-emerald-400/60 dark:text-emerald-400/80" />
        </motion.div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isSuccessMorphing ? { scale: 0.2, opacity: 0, borderRadius: "100%" } : "visible"}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col pt-12 pb-8 px-8 min-h-[750px] border border-white dark:border-slate-800 z-10 transition-colors duration-300"
      >
        
        {/* Back / Change School Button */}
        {selectedSchool ? (
          <button 
            onClick={() => setSelectedSchool(null)} 
            className="absolute top-8 left-8 flex items-center gap-2 text-xs font-semibold text-brand-blue dark:text-blue-400 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Change School
          </button>
        ) : (
          <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-xs font-semibold text-brand-blue dark:text-blue-400 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
        )}

        <div className="flex-1 flex flex-col justify-center max-w-xs mx-auto w-full mt-8">
          {/* Logo & Branding */}
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-6 space-y-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="w-20 h-20 flex items-center justify-center"
            >
              <img src="/logo.png" alt="Genesis ERP Logo" className="w-full h-full object-contain drop-shadow-md" />
            </motion.div>
            <div className="text-center">
              <h1 className="text-[24px] font-extrabold text-[#111827] dark:text-slate-100 tracking-tight">
                {selectedSchool ? selectedSchool.name : "Select Your School"}
              </h1>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-1">
                {selectedSchool ? "Enter your credentials to continue" : "Choose your workspace to login"}
              </p>
            </div>
          </motion.div>

          {!selectedSchool ? (
            <motion.div variants={itemVariants} className="flex flex-col gap-3 w-full">
              {isLoadingSchools ? (
                <div className="flex justify-center p-8">
                  <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : schools.length === 0 ? (
                <p className="text-center text-sm text-gray-500 dark:text-slate-400">No schools available.</p>
              ) : (
                schools.map(school => (
                  <motion.button
                    key={school.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedSchool(school)}
                    className="p-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-sm hover:border-brand-blue cursor-pointer transition-colors flex items-center gap-4 text-left w-full group"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center group-hover:bg-brand-blue/20 transition-colors shrink-0">
                      <Building2 className="w-5 h-5 text-brand-blue dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-slate-100 text-sm">{school.name}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400 line-clamp-1">{school.address}</div>
                    </div>
                  </motion.button>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col"
            >
              <div className="flex justify-between items-center mb-4 px-1">
                <button 
                  type="button" 
                  onClick={() => { setSelectedSchool(null); setEmail(''); setPassword(''); }} 
                  className="text-xs font-bold text-gray-500 dark:text-slate-400 hover:text-brand-blue dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Change School
                </button>
              </div>

              <form 
                onSubmit={handleSubmit} 
                className="space-y-4 w-full"
              >
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-[11px] font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wide px-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className={`w-full px-5 py-3.5 rounded-full bg-[#F3F4F6] dark:bg-slate-800/90 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-[14px] font-medium focus:outline-none focus:ring-2 transition-all border ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-transparent dark:border-slate-700/60 focus:ring-brand-blue/50'}`}
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-[11px] font-bold text-gray-800 dark:text-slate-200 uppercase tracking-wide px-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className={`w-full px-5 py-3.5 rounded-full bg-[#F3F4F6] dark:bg-slate-800/90 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-[14px] font-medium focus:outline-none focus:ring-2 transition-all border pr-12 ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-transparent dark:border-slate-700/60 focus:ring-brand-blue/50'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 text-xs font-medium text-center border border-red-200 dark:border-red-900/50"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Login Button */}
                <div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full h-13 rounded-full bg-brand-blue text-white font-bold text-sm shadow-lg shadow-brand-blue/30 hover:bg-brand-blue/90 disabled:opacity-70 transition-colors flex items-center mt-6 overflow-hidden py-3"
                  >
                    <div className="absolute left-1.5 w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm">
                      {isLoading ? (
                         <div className="w-4 h-4 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                         <ChevronRight className="w-5 h-5 text-brand-blue dark:text-blue-400" />
                      )}
                    </div>
                    <span className="flex-1 text-center pr-6">
                      {isLoading ? 'Authenticating...' : 'Sign In'}
                    </span>
                  </motion.button>
                </div>
              </form>

              {/* Forgot Password Link */}
              <div className="mt-4 text-center">
                <Link href="#" className="text-xs font-bold text-brand-blue dark:text-blue-400 hover:underline">
                  Forgot your password ?
                </Link>
              </div>
              
              {/* Demo Logins */}
              <div className="mt-8 flex flex-col items-center opacity-80 hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-gray-400 dark:text-slate-400 font-medium mb-2 uppercase tracking-wider">Demo Access</p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {quickLogins.map((ql) => (
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      key={ql.email}
                      type="button"
                      onClick={() => handleQuickLogin(ql.email, ql.password)}
                      disabled={isLoading}
                      className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-[10px] font-bold text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200/60 dark:border-slate-700/60 disabled:opacity-50 transition-colors"
                    >
                      {ql.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </motion.div>
      </>)}
    </div>
  );
}
