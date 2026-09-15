"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { 
  Eye, EyeOff, ArrowLeft, ArrowRight, Lock, Mail,
  Crown, Laptop, UserCheck, GraduationCap, BarChart2, BookOpen, 
  Users, User, Coins, Home, Book, Bus
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, isAuthenticated, checkAuth, user } = useAuthStore();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);
  const [isSuccessMorphing, setIsSuccessMorphing] = useState(false);

  useEffect(() => {
    checkAuth();
    setHasChecked(true);
  }, [checkAuth]);

  const getRoleDestination = (role?: string) => {
    switch (role) {
      case 'super_admin': return '/superadmin';
      case 'student': return '/student/documents';
      case 'parent': return '/parent';
      case 'warden': return '/warden/rooms';
      case 'librarian': return '/librarian';
      case 'transport': return '/transport/fleet';
      default: return '/dashboard';
    }
  };

  // Always allow rendering the login form on /login


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      setIsSuccessMorphing(true);
      const currentUser = useAuthStore.getState().user;
      setTimeout(() => {
        router.replace(getRoleDestination(currentUser?.role));
      }, 300);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPassword?: string) => {
    const pw = demoPassword || 'school@123';
    setEmail(demoEmail);
    setPassword(pw);
    const success = await login(demoEmail, pw);
    if (success) {
      setIsSuccessMorphing(true);
      const currentUser = useAuthStore.getState().user;
      setTimeout(() => {
        router.replace(getRoleDestination(currentUser?.role));
      }, 300);
    }
  };

  const quickLogins = [
    { label: 'Super Admin', email: 'superadmin@school.edu', icon: Crown, color: 'text-amber-400' },
    { label: 'Platform Admin', email: 'platformadmin@paperbuddy.erp', icon: Laptop, color: 'text-cyan-400' },
    { label: 'Correspondent', email: 'correspondent@school.edu', icon: UserCheck, color: 'text-purple-400' },
    { label: 'Principal', email: 'principal@school.edu', icon: GraduationCap, color: 'text-pink-400' },
    { label: 'VP', email: 'vp@school.edu', icon: BarChart2, color: 'text-cyan-400' },
    { label: 'Teacher', email: 'sarah.connor@school.edu', icon: BookOpen, color: 'text-amber-400' },
    { label: 'Mentor', email: 'mentor.10a@school.edu', icon: Users, color: 'text-emerald-400' },
    { label: 'Student', email: 'kishor.k@school.edu', icon: User, color: 'text-indigo-400' },
    { label: 'Finance', email: 'finance@school.edu', icon: Coins, color: 'text-amber-300' },
    { label: 'Warden', email: 'warden@school.edu', icon: Home, color: 'text-cyan-300' },
    { label: 'Librarian', email: 'librarian@school.edu', icon: Book, color: 'text-purple-300' },
    { label: 'Transport', email: 'transport@school.edu', icon: Bus, color: 'text-cyan-400' },
  ];

  return (
    <div 
      style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#0c102a] selection:bg-cyan-500 selection:text-white"
    >
      {/* Background Multi-Color Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-Left Warm Orange / Amber Glow */}
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-amber-500/50 via-orange-600/40 to-pink-600/20 blur-[110px]" />
        
        {/* Bottom-Right Magenta / Orange Glow */}
        <div className="absolute -bottom-32 -right-32 w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-amber-500/40 via-purple-700/40 to-indigo-800/30 blur-[120px]" />
        
        {/* Center Vivid Electric Blue / Cyan Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full bg-gradient-to-r from-blue-600/40 via-indigo-600/35 to-cyan-500/30 blur-[130px]" />

        {/* Ambient Curved Light Rays (SVG Overlay matching Image 1) */}
        <svg className="absolute inset-0 w-full h-full opacity-45" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-200 950C250 650 650 350 1250 -50" stroke="url(#arcGlow1)" strokeWidth="3" strokeLinecap="round" />
          <path d="M-100 1050C350 750 750 450 1450 150" stroke="url(#arcGlow2)" strokeWidth="2" strokeLinecap="round" />
          <defs>
            <linearGradient id="arcGlow1" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="arcGlow2" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main Floating Glassmorphic Card Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={isSuccessMorphing ? { scale: 0.2, opacity: 0, borderRadius: "100%" } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 90 }}
        className="w-full max-w-[500px] relative z-10 backdrop-blur-2xl bg-gradient-to-b from-[#1a2456]/70 via-[#12193f]/75 to-[#161c47]/75 rounded-[36px] border border-cyan-400/30 shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(56,189,248,0.2)] p-7 sm:p-9 flex flex-col transition-all"
      >
        {/* Top Link */}
        <div className="mb-5">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back Home
          </Link>
        </div>

        {/* Logo & School Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 p-[1.5px] shadow-[0_0_25px_rgba(56,189,248,0.5)] mb-3 flex items-center justify-center">
            <div className="w-full h-full bg-[#0d1435]/80 backdrop-blur-md rounded-[14px] flex items-center justify-center p-2">
              <svg className="w-8 h-8 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="3" width="14" height="18" rx="2" />
                <path d="M9 7h6" />
                <path d="M9 11h6" />
                <path d="M9 15h4" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl sm:text-[30px] font-extrabold text-white text-center tracking-tight leading-tight drop-shadow-md">
            Bharathi Matriculation
          </h1>
          <h2 className="text-xl sm:text-[26px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-fuchsia-400 text-center tracking-tight leading-tight mt-0.5">
            Hr. Sec. School
          </h2>
          <p className="text-xs font-medium text-blue-200/80 mt-1.5 text-center">
            PaperBuddy School ERP Portal
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          {/* EMAIL Field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider px-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-4 h-4 text-blue-300/60 pointer-events-none" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. kishork@school.edu"
                required
                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl bg-[#0f1636]/80 border border-cyan-500/30 text-white placeholder-blue-300/40 text-sm font-medium focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 transition-all shadow-inner ${error ? 'border-red-500 focus:ring-red-500/50' : ''}`}
              />
            </div>
          </div>

          {/* PASSWORD Field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center px-1">
              <label htmlFor="password" className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider">
                Password
              </label>
              <span className="text-[10px] text-blue-300/60 font-normal">Default: school@123</span>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-4 h-4 text-blue-300/60 pointer-events-none" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className={`w-full pl-11 pr-12 py-3.5 rounded-2xl bg-[#0f1636]/80 border border-cyan-500/30 text-white placeholder-blue-300/40 text-sm font-medium focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 transition-all shadow-inner ${error ? 'border-red-500 focus:ring-red-500/50' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-blue-300/60 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-4 py-2.5 rounded-xl bg-red-950/70 text-red-200 text-xs font-medium text-center border border-red-500/50"
            >
              {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 hover:from-cyan-300 hover:via-blue-400 hover:to-purple-500 text-white font-extrabold text-sm sm:text-base shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(56,189,248,0.7)] transition-all flex items-center justify-center gap-2 border border-white/20 active:scale-[0.98] cursor-pointer mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Sign In to School Portal
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* 1-Click Role Login Section */}
        <div className="mt-6 pt-3 flex flex-col items-center">
          <div className="w-full flex items-center gap-3 mb-4">
            <div className="h-px bg-gradient-to-r from-transparent via-blue-300/30 to-transparent flex-1" />
            <span className="text-[10px] font-extrabold text-blue-200 uppercase tracking-widest flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              1-Click Role Login
            </span>
            <div className="h-px bg-gradient-to-r from-transparent via-blue-300/30 to-transparent flex-1" />
          </div>

          <div className="flex flex-wrap justify-center gap-2 max-w-lg">
            {quickLogins.map((ql) => {
              const IconComponent = ql.icon;
              return (
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(56, 189, 248, 0.25)" }}
                  whileTap={{ scale: 0.95 }}
                  key={ql.email}
                  type="button"
                  onClick={() => handleQuickLogin(ql.email)}
                  disabled={isLoading}
                  className="px-3.5 py-1.5 rounded-full bg-[#12193e]/90 hover:bg-cyan-500/20 border border-cyan-400/30 hover:border-cyan-300 text-[11px] font-semibold text-white transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <IconComponent className={`w-3.5 h-3.5 ${ql.color}`} />
                  <span>{ql.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
