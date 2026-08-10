"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { GraduationCap, Eye, EyeOff, ChevronRight, ArrowLeft, BookOpen, Users, BarChart3, Globe, Shield, Building2 } from 'lucide-react';
import api from '@/lib/api';

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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);
  const [isSuccessMorphing, setIsSuccessMorphing] = useState(false);
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
  const [isLoadingSchools, setIsLoadingSchools] = useState(true);

  useEffect(() => {
    checkAuth();
    setHasChecked(true);
    
    // Fetch schools
    api.get('/schools')
      .then(res => {
        setSchools(res.data);
        setIsLoadingSchools(false);
      })
      .catch(err => {
        console.error("Failed to fetch schools:", err);
        setIsLoadingSchools(false);
      });
  }, [checkAuth]);

  useEffect(() => {
    if (hasChecked && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, hasChecked, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      setIsSuccessMorphing(true);
      setTimeout(() => {
        router.push('/dashboard');
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
        router.push('/dashboard');
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
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD] p-4 font-sans overflow-hidden">
      
      {/* Background Animated Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[30%] -right-[10%] w-[800px] h-[800px] rounded-full bg-brand-blue/5 blur-3xl"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-3xl"
        />
        
        {/* Floating Icons Left Side */}
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[15%] hidden lg:flex items-center justify-center w-16 h-16 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl border border-white"
        >
          <GraduationCap className="w-8 h-8 text-brand-blue/60" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[30%] left-[10%] hidden lg:flex items-center justify-center w-20 h-20 bg-white/40 backdrop-blur-sm rounded-full shadow-lg border border-white"
        >
          <BookOpen className="w-10 h-10 text-indigo-400/50" />
        </motion.div>

        <motion.div 
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[60%] left-[25%] hidden xl:flex items-center justify-center w-12 h-12 bg-white/50 backdrop-blur-md rounded-xl shadow-md border border-white"
        >
          <Users className="w-6 h-6 text-emerald-400/60" />
        </motion.div>

        {/* Floating Icons Right Side */}
        <motion.div 
          animate={{ y: [0, 25, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-[25%] right-[15%] hidden lg:flex items-center justify-center w-20 h-20 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl border border-white"
        >
          <BarChart3 className="w-10 h-10 text-brand-blue/60" />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, -35, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute bottom-[25%] right-[10%] hidden lg:flex items-center justify-center w-16 h-16 bg-white/40 backdrop-blur-sm rounded-full shadow-lg border border-white"
        >
          <Globe className="w-8 h-8 text-indigo-400/50" />
        </motion.div>

        <motion.div 
          animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
          className="absolute top-[55%] right-[25%] hidden xl:flex items-center justify-center w-14 h-14 bg-white/50 backdrop-blur-md rounded-xl shadow-md border border-white"
        >
          <Shield className="w-7 h-7 text-emerald-400/60" />
        </motion.div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate={isSuccessMorphing ? { scale: 0.2, opacity: 0, borderRadius: "100%" } : "visible"}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col pt-12 pb-8 px-8 min-h-[750px] border border-white z-10"
      >
        
        {/* Back Button */}
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-xs font-semibold text-brand-blue hover:opacity-80 transition-opacity">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>

        <div className="flex-1 flex flex-col justify-center max-w-xs mx-auto w-full mt-8">
          {/* Logo & Branding */}
          <motion.div variants={itemVariants} className="flex flex-col items-center mb-10 space-y-4">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="w-24 h-24 flex items-center justify-center"
            >
              <img src="/logo.png" alt="PaperBuddy Logo" className="w-full h-full object-contain drop-shadow-md" />
            </motion.div>
            <div className="text-center">
              <h1 className="text-[26px] font-extrabold text-[#111827] tracking-tight">
                {selectedSchool ? selectedSchool.name : "Select Your School"}
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">
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
                <p className="text-center text-sm text-gray-500">No schools available.</p>
              ) : (
                schools.map(school => (
                  <motion.button
                    key={school.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedSchool(school)}
                    className="p-4 rounded-2xl border border-gray-200 bg-white shadow-sm hover:border-brand-blue cursor-pointer transition-colors flex items-center gap-4 text-left w-full group"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center group-hover:bg-brand-blue/20 transition-colors">
                      <Building2 className="w-5 h-5 text-brand-blue" />
                    </div>
                    <div>
                      <div className="font-bold text-brand-black">{school.name}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{school.address}</div>
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
              <motion.form 
                animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                onSubmit={handleSubmit} 
                className="space-y-5 w-full"
              >
                <div className="flex justify-between items-center px-1">
                   <button 
                     type="button" 
                     onClick={() => { setSelectedSchool(null); setEmail(''); setPassword(''); }} 
                     className="text-xs font-bold text-gray-400 hover:text-brand-blue flex items-center gap-1 transition-colors"
                   >
                     <ArrowLeft className="w-3 h-3" /> Change School
                   </button>
                </div>

                {/* Email Field */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-[11px] font-bold text-gray-800 uppercase tracking-wide px-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className={`w-full px-5 py-4 rounded-full bg-[#F3F4F6] text-gray-900 placeholder-gray-400 text-[15px] font-medium focus:outline-none focus:ring-2 transition-all border ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-transparent focus:ring-brand-blue/50'}`}
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-[11px] font-bold text-gray-800 uppercase tracking-wide px-1">
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
                      className={`w-full px-5 py-4 rounded-full bg-[#F3F4F6] text-gray-900 placeholder-gray-400 text-[15px] font-medium focus:outline-none focus:ring-2 transition-all border pr-12 ${error ? 'border-red-500 focus:ring-red-500/50' : 'border-transparent focus:ring-brand-blue/50'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                    className="px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-medium text-center"
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
                    className="group relative w-full h-14 rounded-full bg-brand-blue text-white font-bold text-base shadow-lg shadow-brand-blue/30 hover:bg-brand-blue/90 disabled:opacity-70 transition-colors flex items-center mt-8 overflow-hidden"
                  >
                    <div className="absolute left-1.5 w-11 h-11 bg-white rounded-full flex items-center justify-center">
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <ChevronRight className="w-5 h-5 text-brand-blue" />
                      )}
                    </div>
                    <span className="flex-1 text-center pr-8">
                      {isLoading ? 'Authenticating...' : 'Sign In'}
                    </span>
                    {!isLoading && (
                      <div className="absolute right-5 flex items-center space-x-[-8px] opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                        <ChevronRight className="w-4 h-4" />
                        <ChevronRight className="w-4 h-4" />
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </motion.button>
                </div>
              </motion.form>

              {/* Forgot Password Link */}
              <div className="mt-6 text-center">
                <Link href="#" className="text-xs font-bold text-brand-blue hover:underline">
                  Forgot your password ?
                </Link>
              </div>
              
              {/* Demo Logins */}
              <div className="mt-12 flex flex-col items-center opacity-50 hover:opacity-100 transition-opacity">
                <p className="text-[10px] text-gray-400 font-medium mb-3 uppercase tracking-wider">Demo Access</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {quickLogins.map((ql, i) => (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      key={ql.email}
                      type="button"
                      onClick={() => handleQuickLogin(ql.email, ql.password)}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-50"
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
    </div>
  );
}
