"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  ArrowRight, Sparkles, BrainCircuit, ShieldCheck, 
  LayoutDashboard, Users, GraduationCap
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#090d16] text-white overflow-x-hidden selection:bg-indigo-500/30 font-sans">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[20%] right-[-10%] w-[30%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-6 max-w-7xl mx-auto gap-2">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="font-bold text-lg sm:text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 whitespace-nowrap">
            CampusCopilot AI
          </span>
        </div>
        
        <div className="shrink-0">
          {isAuthenticated ? (
            <Link href="/dashboard" className="group relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm font-medium hover:bg-white/10 transition-all whitespace-nowrap">
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link href="/login" className="group relative inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-xs sm:text-sm font-semibold hover:opacity-90 shadow-lg shadow-indigo-500/25 transition-all whitespace-nowrap">
              <span>Sign In</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center px-4">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles className="w-4 h-4" />
          <span>v2.0 Next-Gen AI Release</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Autonomous School <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
            Operations Platform
          </span>
        </h1>

        <p className="mt-8 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          CampusCopilot AI transforms traditional school management with an 8-Role RBAC system, automated workflows, and intelligent analytics from LKG to 12th Standard.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          {isAuthenticated ? (
            <Link href="/dashboard" className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:-translate-y-1 flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5" />
              Enter Workspace
            </Link>
          ) : (
            <Link href="/login" className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-lg hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:-translate-y-1 flex items-center gap-3">
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
          <a href="#features" className="px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 font-bold text-lg transition-all hover:-translate-y-1">
            Explore Features
          </a>
        </div>

        {/* Feature Highlights */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-24 pb-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <div className="glass-panel p-8 rounded-3xl text-left border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors"></div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">8-Role RBAC</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Granular access control spanning from Correspondents and Principals down to Students and Parents.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl text-left border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-colors"></div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 border border-cyan-500/30">
              <BrainCircuit className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI Powered</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Automated OCR grading, smart scheduling, and intelligent predictive analytics for student performance.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl text-left border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Unified Ecosystem</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Seamlessly integrates academics, attendance, fees, communication, and examinations in one platform.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
