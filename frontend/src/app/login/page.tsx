"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import Tilt3D from '@/components/Tilt3D';
import BackgroundWallpaper from '@/components/BackgroundWallpaper';
import { 
  Eye, EyeOff, ArrowLeft, ArrowRight, Lock, Mail,
  Crown, Laptop, UserCheck, GraduationCap, BarChart2, BookOpen, 
  Users, User, Coins, Home, Book, Bus, Shield, Flame, Sparkles, Check
} from 'lucide-react';

function CornerArchOrnament({ position = "tr" }: { position?: "tr" | "bl" }) {
  if (position === "tr") {
    return (
      <svg className="corner-arch-tr" viewBox="0 0 100 100" fill="none" stroke="#43634e" strokeWidth="1.5">
        <path d="M 100 0 A 100 100 0 0 0 0 100" />
        <path d="M 100 20 A 80 80 0 0 0 20 100" />
        <path d="M 100 40 A 60 60 0 0 0 40 100" />
        <path d="M 100 60 A 40 40 0 0 0 60 100" />
      </svg>
    );
  }
  return (
    <svg className="corner-arch-bl" viewBox="0 0 100 100" fill="none" stroke="#43634e" strokeWidth="1.5">
      <path d="M 0 100 A 100 100 0 0 1 100 0" />
      <path d="M 0 80 A 80 80 0 0 1 80 0" />
      <path d="M 0 60 A 60 60 0 0 1 60 0" />
      <path d="M 0 40 A 40 40 0 0 1 40 0" />
    </svg>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 15 }
  },
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeLoggingRole, setActiveLoggingRole] = useState<string | null>(null);

  const { login, isLoading, error, checkAuth } = useAuthStore();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      const currentUser = useAuthStore.getState().user;
      router.replace(getRoleDestination(currentUser?.role));
    }
  };

  const handleQuickLogin = async (demoEmail: string, roleLabel: string, demoPassword?: string) => {
    setActiveLoggingRole(roleLabel);
    const pw = demoPassword || 'school@123';
    setEmail(demoEmail);
    setPassword(pw);
    const success = await login(demoEmail, pw);
    if (success) {
      const currentUser = useAuthStore.getState().user;
      router.replace(getRoleDestination(currentUser?.role));
    } else {
      setActiveLoggingRole(null);
    }
  };

  const quickLogins = [
    { label: 'Super Admin',    email: 'superadmin@bharathischool.edu',   icon: Crown,          color: 'text-[#16281e]', bg: 'bg-amber-100 border-amber-300' },
    { label: 'Correspondent',  email: 'correspondent@bharathischool.edu',icon: UserCheck,      color: 'text-[#16281e]', bg: 'bg-purple-100 border-purple-300' },
    { label: 'Principal',      email: 'principal@bharathischool.edu',    icon: GraduationCap,  color: 'text-[#16281e]', bg: 'bg-rose-100 border-rose-300' },
    { label: 'VP',             email: 'vp@bharathischool.edu',           icon: BarChart2,      color: 'text-[#16281e]', bg: 'bg-blue-100 border-blue-300' },
    { label: 'Teacher',        email: 'teacher.annapoorani.emp1021@bharathischool.edu', icon: BookOpen, color: 'text-[#16281e]', bg: 'bg-emerald-100 border-emerald-300' },
    { label: 'Student',        email: 'student.adm2024001@bharathischool.edu',          icon: User,    color: 'text-[#16281e]', bg: 'bg-indigo-100 border-indigo-300' },
    { label: 'Finance',        email: 'finance@bharathischool.edu',      icon: Coins,          color: 'text-[#16281e]', bg: 'bg-amber-100 border-amber-300' },
    { label: 'Warden',         email: 'warden@bharathischool.edu',       icon: Home,           color: 'text-[#16281e]', bg: 'bg-sky-100 border-sky-300' },
    { label: 'Librarian',      email: 'librarian@bharathischool.edu',    icon: Book,           color: 'text-[#16281e]', bg: 'bg-violet-100 border-violet-300' },
    { label: 'Transport',      email: 'transport@bharathischool.edu',    icon: Bus,            color: 'text-[#16281e]', bg: 'bg-emerald-100 border-emerald-300' },
  ];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-2.5 sm:p-6 relative overflow-hidden bg-[#14251c] text-[#f4f0e6]">
      {/* Background Architectural & Line-Art Wallpaper Designs */}
      <BackgroundWallpaper />

      {/* Main Brutalist Concrete Chassis Outer Frame */}
      <div className="w-full max-w-[560px] relative z-10 brutal-concrete-chassis p-2 sm:p-4 md:p-6">
        
        {/* Inner 3D Emerald Glass Card */}
        <div className="glass-emerald-tile p-4 sm:p-8 flex flex-col rounded-[22px] sm:rounded-[28px] relative">
          <CornerArchOrnament position="tr" />

          {/* Top Back Link */}
          <div className="mb-4 relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-[#a3c9b0] hover:text-[#f4f0e6] transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </Link>
          </div>

          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-5 relative z-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#182e22] text-[#f4f0e6] border-2 border-[#e8e2d3]/30 shadow-2xl mb-3 flex items-center justify-center relative overflow-hidden">
              <Shield className="w-9 h-9 stroke-[1.5] text-[#e8e2d3]" />
              <Flame className="w-4 h-4 absolute text-[#f4f0e6] fill-[#e8e2d3]" />
            </div>

            <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#f4f0e6] font-syne tracking-tight leading-tight">
              Bharathi Matriculation
            </h1>
            <h2 className="text-xl sm:text-[22px] font-bold text-[#a3c9b0] font-syne tracking-tight leading-tight mt-0.5">
              Hr. Sec. School
            </h2>
            <p className="text-xs font-semibold text-[#e8e2d3]/80 mt-1">
              PaperBuddy School ERP Portal
            </p>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 w-full relative z-10">
            {/* EMAIL Field */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-[10px] font-bold text-[#a3c9b0] uppercase tracking-wider px-1">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-4 h-4 text-[#a3c9b0] pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. kishork@school.edu"
                  required
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#12281b]/90 text-[#f4f0e6] border border-[#a3c9b0]/30 text-xs font-medium focus:outline-none focus:border-[#e8e2d3] transition-all placeholder:text-[#a3c9b0]/50"
                />
              </div>
            </div>

            {/* PASSWORD Field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label htmlFor="password" className="block text-[10px] font-bold text-[#a3c9b0] uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[10px] text-[#e8e2d3]/70 font-normal">Default: school@123</span>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-4 h-4 text-[#a3c9b0] pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full pl-11 pr-12 py-2.5 rounded-xl bg-[#12281b]/90 text-[#f4f0e6] border border-[#a3c9b0]/30 text-xs font-medium focus:outline-none focus:border-[#e8e2d3] transition-all placeholder:text-[#a3c9b0]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[#a3c9b0] hover:text-[#f4f0e6]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-medium text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#2b4c37] hover:bg-[#345c43] text-[#f4f0e6] font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer btn-3d border border-[#e8e2d3]/30"
            >
              {isLoading && !activeLoggingRole ? (
                <div className="w-4 h-4 border-2 border-[#f4f0e6] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Portal
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 3D ANIMATED 1-CLICK ROLE SELECTOR SECTION */}
          <div className="mt-5 pt-3 flex flex-col items-center relative z-10">
            <div className="w-full flex items-center gap-3 mb-3">
              <div className="h-px bg-[#a3c9b0]/25 flex-1" />
              <span className="text-[10px] font-extrabold text-[#f4f0e6] uppercase tracking-widest flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#12281b]/80 border border-[#a3c9b0]/30 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                1-Click Role Portals
              </span>
              <div className="h-px bg-[#a3c9b0]/25 flex-1" />
            </div>

            {/* Staggered Animated 3D Glass Badge Grid */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-3 sm:grid-cols-4 gap-2 w-full"
            >
              {quickLogins.map((ql) => {
                const IconComponent = ql.icon;
                const isRoleActive = activeLoggingRole === ql.label;

                return (
                  <motion.div key={ql.email} variants={badgeVariants}>
                    <Tilt3D maxTilt={10} scale={1.04} className="rounded-xl">
                      <button
                        type="button"
                        onClick={() => handleQuickLogin(ql.email, ql.label)}
                        disabled={isLoading}
                        className={`w-full p-2.5 rounded-xl bg-[#14291e]/90 hover:bg-[#1b3527] border border-[#a3c9b0]/25 text-[11px] font-bold text-[#f4f0e6] flex flex-col items-center justify-center text-center gap-1.5 shadow-md transition-all cursor-pointer relative group ${
                          isRoleActive ? 'ring-2 ring-[#e8e2d3] bg-[#1b3527] scale-95 shadow-lg' : ''
                        }`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#2b4c37] text-[#f4f0e6] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform border border-[#e8e2d3]/20">
                          {isRoleActive ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <IconComponent className="w-3.5 h-3.5 text-[#e8e2d3]" />
                          )}
                        </div>
                        <span className="truncate leading-tight font-syne">{ql.label}</span>
                      </button>
                    </Tilt3D>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
