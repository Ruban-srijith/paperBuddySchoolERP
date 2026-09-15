"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, Sparkles, ShieldCheck, 
  Users, GraduationCap, BarChart3, 
  Zap, Globe, Download, Building2,
  CheckCircle2, BookOpen, Bus, Layers
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div 
      style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
      className="min-h-screen w-full bg-[#06091d] text-white relative overflow-hidden selection:bg-cyan-500 selection:text-white"
    >
      {/* ─── BACKGROUND MESH GRADIENTS & LIGHT ARCS ─────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top-Left Electric Warm Amber / Pink Glow */}
        <div className="absolute -top-32 -left-32 w-[850px] h-[850px] rounded-full bg-gradient-to-br from-indigo-600/50 via-purple-600/40 to-pink-600/30 blur-[120px]" />
        
        {/* Top-Right Electric Fuchsia / Magenta Glow */}
        <div className="absolute -top-32 -right-32 w-[900px] h-[900px] rounded-full bg-gradient-to-bl from-fuchsia-600/60 via-purple-700/50 to-blue-600/40 blur-[130px]" />
        
        {/* Center Vivid Electric Blue & Cyan Mesh */}
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-to-r from-blue-600/45 via-indigo-600/40 to-cyan-400/35 blur-[140px]" />

        {/* Mid-Page Orbital Gradient Lights */}
        <div className="absolute top-[45%] -left-40 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-fuchsia-600/40 via-purple-600/30 to-transparent blur-[130px]" />
        <div className="absolute top-[50%] -right-40 w-[850px] h-[850px] rounded-full bg-gradient-to-l from-cyan-500/45 via-blue-600/35 to-transparent blur-[140px]" />

        {/* Bottom Ambient Mesh Glows */}
        <div className="absolute -bottom-40 -left-40 w-[850px] h-[850px] rounded-full bg-gradient-to-tr from-purple-700/50 via-pink-600/35 to-transparent blur-[130px]" />
        <div className="absolute -bottom-40 -right-40 w-[850px] h-[850px] rounded-full bg-gradient-to-tl from-fuchsia-600/50 via-blue-600/40 to-transparent blur-[130px]" />

        {/* High-Intensity Glowing Background Light Arcs */}
        <svg className="absolute inset-0 w-full h-full opacity-65" viewBox="0 0 1440 1200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g filter="url(#glowFilter)">
            <path d="M-200 650C300 380 800 180 1500 -80" stroke="url(#heroArc1)" strokeWidth="4" strokeLinecap="round" />
            <path d="M-100 1050C400 750 900 450 1600 150" stroke="url(#heroArc2)" strokeWidth="3" strokeLinecap="round" />
          </g>
          <defs>
            <filter id="glowFilter" x="-300" y="-200" width="2000" height="1500" filterUnits="userSpaceOnUse">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="heroArc1" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#c084fc" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="heroArc2" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ─── 1. NAVIGATION BAR ────────────────────────────────────────────── */}
      <nav className="relative z-50 w-full border-b border-white/10 backdrop-blur-xl bg-[#070b24]/80 py-4 px-6 sm:px-12 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-cyan-400 p-[1.5px] shadow-[0_0_20px_rgba(217,70,239,0.5)] transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#0d1333] rounded-[10.5px] flex items-center justify-center">
                <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-300">G</span>
              </div>
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">
              Genesis <span className="text-xs font-semibold text-cyan-300 uppercase tracking-widest ml-1 bg-cyan-500/10 border border-cyan-400/30 px-2 py-0.5 rounded-full">ERP</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-cyan-300 transition-colors">Features</a>
            <a href="#impact" className="hover:text-cyan-300 transition-colors">Impact</a>
            <a href="#testimonials" className="hover:text-cyan-300 transition-colors">Testimonials</a>
            <a href="#platform" className="hover:text-cyan-300 transition-colors">Platform</a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all active:scale-95">
              <Download className="w-3.5 h-3.5 text-purple-200" />
              Download App
            </button>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#11173d]/90 hover:bg-white/10 border border-cyan-400/35 hover:border-cyan-300 text-xs font-extrabold text-white transition-all active:scale-95 shadow-sm"
            >
              Sign In <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── 2. HERO SECTION ──────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pt-12 sm:pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 flex flex-col items-start"
          >
            {/* Version Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121a42]/80 border border-cyan-400/40 text-[11px] font-bold text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.25)] mb-6">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>v2.0 Next-Gen AI Release</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Genesis
              <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400">
                Build the Future
              </span>
            </h1>

            {/* Description */}
            <p className="mt-5 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-normal">
              Genesis ERP transforms traditional school management with an 11-Role RBAC system, automated workflows, and intelligent analytics from LKG to 12th Standard.
            </p>

            {/* CTA Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/login"
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 hover:from-purple-400 hover:via-fuchsia-400 hover:to-pink-400 text-sm font-extrabold text-white shadow-[0_0_30px_rgba(217,70,239,0.5)] hover:shadow-[0_0_40px_rgba(217,70,239,0.7)] transition-all flex items-center gap-2 active:scale-95"
              >
                Sign In <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="px-7 py-3.5 rounded-full bg-[#12193e]/80 hover:bg-cyan-500/20 border border-cyan-400/40 hover:border-cyan-300 text-sm font-bold text-slate-200 hover:text-white transition-all flex items-center gap-2 backdrop-blur-md active:scale-95"
              >
                Explore Features <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Micro proof points */}
            <div className="mt-6 flex items-center gap-6 text-xs font-semibold text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                14-day free trial
              </span>
            </div>
          </motion.div>

          {/* Right Column 3D Floating Graphic Illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            {/* Ambient Background Radial Glow behind Graphic */}
            <div className="absolute w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-cyan-500/40 via-purple-600/50 to-pink-500/40 blur-[90px] -z-10" />

            {/* 3D Glass Laptop Card Illustration */}
            <div className="relative w-full max-w-[440px] aspect-[4/3] rounded-3xl bg-gradient-to-br from-white/15 via-blue-900/30 to-purple-900/30 backdrop-blur-2xl border border-cyan-400/40 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_40px_rgba(56,189,248,0.3)] p-6 flex flex-col justify-between transform rotate-1 hover:rotate-0 transition-transform duration-500">
              {/* Laptop Header Bar */}
              <div className="flex items-center justify-between border-b border-cyan-400/20 pb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest bg-cyan-950/60 border border-cyan-400/30 px-2.5 py-0.5 rounded-full">
                  Genesis Cloud Hub
                </div>
              </div>

              {/* Central Screen Graphic */}
              <div className="flex-1 flex items-center justify-center my-4 relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 p-0.5 shadow-[0_0_30px_rgba(56,189,248,0.6)] flex items-center justify-center">
                  <div className="w-full h-full bg-[#0d1435] rounded-[14px] flex items-center justify-center">
                    <GraduationCap className="w-10 h-10 text-cyan-300" />
                  </div>
                </div>

                {/* Floating Widget Badges */}
                <motion.div 
                  animate={{ y: [0, -8, 0] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-2 -right-2 px-3 py-2 rounded-xl bg-[#121940]/90 border border-cyan-400/30 backdrop-blur-md shadow-lg flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <div className="text-[10px] font-bold text-white">99.9% Stats</div>
                </motion.div>

                <motion.div 
                  animate={{ y: [0, 8, 0] }} 
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute -bottom-2 -left-2 px-3 py-2 rounded-xl bg-[#121940]/90 border border-purple-400/30 backdrop-blur-md shadow-lg flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-purple-400" />
                  <div className="text-[10px] font-bold text-white">11 Roles RBAC</div>
                </motion.div>
              </div>

              {/* Laptop Footer Dock */}
              <div className="bg-[#0b102b]/80 border border-cyan-400/20 rounded-xl p-2.5 flex items-center justify-around">
                <div className="h-1.5 w-16 bg-cyan-400/40 rounded-full" />
                <div className="h-1.5 w-10 bg-purple-400/40 rounded-full" />
                <div className="h-1.5 w-12 bg-blue-400/40 rounded-full" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── 3. KEY METRICS BAR (UNIFIED FLOATING GLASS CONTAINER) ───────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#17204c]/85 via-[#12173e]/85 to-[#161c47]/85 backdrop-blur-2xl border border-cyan-400/25 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-cyan-400/15">
            {/* Card 1 */}
            <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-4 first:pl-0 first:pt-0">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">50+</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Partner Schools</div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">1.2M</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Students Managed</div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6 text-cyan-300" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">99.9%</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Uptime</div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white">10x</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faster Grading</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. FEATURES SECTION ("Everything you need, beautifully integrated.") ─ */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-12 sm:py-20">
        <div className="p-8 sm:p-12 rounded-[36px] bg-gradient-to-b from-[#182354]/85 via-[#10173d]/85 to-[#151c48]/85 backdrop-blur-2xl border border-cyan-400/30 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column Heading */}
            <div className="lg:col-span-5 flex flex-col items-start pr-0 lg:pr-4">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
                Everything you need,
                <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400">
                  beautifully integrated.
                </span>
              </h2>
              <p className="mt-5 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                Stop juggling dozens of disjointed tools. Genesis ERP provides a unified, AI-driven ecosystem tailored perfectly for modern educational institutions.
              </p>
            </div>

            {/* Right Column 2x2 Feature Cards Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-3xl bg-[#0f163c]/90 border border-cyan-400/30 hover:border-cyan-300 shadow-xl transition-all group cursor-pointer hover:bg-cyan-500/10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mb-4 text-cyan-300 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Intelligent Grading & OCR</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Upload photos of subjective exam papers and let our proprietary AI models grade them instantly. Save thousands of teacher hours every semester.
                </p>
                <div className="text-xs font-bold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-3xl bg-[#0f163c]/90 border border-cyan-400/30 hover:border-cyan-300 shadow-xl transition-all group cursor-pointer hover:bg-cyan-500/10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mb-4 text-cyan-300 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">9-Role Secure RBAC</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  From Super Admin to Student, everyone gets a highly tailored dashboard with strictly enforced security scopes.
                </p>
                <div className="text-xs font-bold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-3xl bg-[#0f163c]/90 border border-cyan-400/30 hover:border-cyan-300 shadow-xl transition-all group cursor-pointer hover:bg-cyan-500/10">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center mb-4 text-cyan-300 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Unified Platform</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Hostel, Library, Finance, Academics, and Transport—all connected in a single truth matrix.
                </p>
                <div className="text-xs font-bold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-3xl bg-[#0f163c]/90 border border-cyan-400/30 hover:border-cyan-300 shadow-xl transition-all group cursor-pointer hover:bg-cyan-500/10">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center mb-4 text-purple-300 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Predictive Analytics</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Identify struggling students before they fail. Our models analyze attendance, past scores, and behavior to flag interventions.
                </p>
                <div className="text-xs font-bold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. "A COMPLETE PLATFORM" MODULE SELECTOR ────────────────────── */}
      <section id="platform" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-8 sm:py-16">
        {/* Container Glass Box */}
        <div className="p-8 sm:p-12 rounded-[36px] bg-gradient-to-b from-[#17204f]/80 via-[#10163b]/80 to-[#141a45]/80 backdrop-blur-2xl border border-cyan-400/30 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              A Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">Platform</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 font-normal">
              Every module you need to run your institution, seamlessly talking to each other in real-time.
            </p>
          </div>

          {/* 5 Module Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {/* Module 1 */}
            <div className="p-5 rounded-2xl bg-[#0f1638]/90 border border-purple-400/30 hover:border-purple-300 flex flex-col items-center justify-center text-center group cursor-pointer transition-all hover:bg-purple-500/10">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 mb-3 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-white">Academics</span>
            </div>

            {/* Module 2 */}
            <div className="p-5 rounded-2xl bg-[#0f1638]/90 border border-blue-400/30 hover:border-blue-300 flex flex-col items-center justify-center text-center group cursor-pointer transition-all hover:bg-blue-500/10">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-300 mb-3 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-white">Finance & Fees</span>
            </div>

            {/* Module 3 */}
            <div className="p-5 rounded-2xl bg-[#0f1638]/90 border border-emerald-400/30 hover:border-emerald-300 flex flex-col items-center justify-center text-center group cursor-pointer transition-all hover:bg-emerald-500/10">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-white">HR & Payroll</span>
            </div>

            {/* Module 4 */}
            <div className="p-5 rounded-2xl bg-[#0f1638]/90 border border-amber-400/30 hover:border-amber-300 flex flex-col items-center justify-center text-center group cursor-pointer transition-all hover:bg-amber-500/10">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 mb-3 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-white">Library</span>
            </div>

            {/* Module 5 */}
            <div className="p-5 rounded-2xl bg-[#0f1638]/90 border border-cyan-400/30 hover:border-cyan-300 flex flex-col items-center justify-center text-center group cursor-pointer transition-all col-span-2 sm:col-span-1 hover:bg-cyan-500/10">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 mb-3 group-hover:scale-110 transition-transform">
                <Bus className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-white">Transport</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. TESTIMONIALS SECTION ("Trusted by the best.") ────────────── */}
      <section id="testimonials" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column Header Card */}
          <div className="lg:col-span-4 p-8 rounded-3xl bg-gradient-to-b from-[#182252]/80 to-[#10163a]/80 backdrop-blur-xl border border-cyan-400/30 shadow-xl flex flex-col justify-between min-h-[320px]">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Trusted by the
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400">
                  best.
                </span>
              </h2>
              <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
                Hear from principals, teachers, and admins who have transformed their daily operations with Genesis ERP.
              </p>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#090d25] flex items-center justify-center text-[10px] font-bold text-white">SC</div>
                <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-[#090d25] flex items-center justify-center text-[10px] font-bold text-white">JW</div>
                <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-[#090d25] flex items-center justify-center text-[10px] font-bold text-white">ER</div>
              </div>
              <span className="text-xs font-bold text-cyan-300 hover:underline cursor-pointer flex items-center gap-1">
                500+ Happy Institutions <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Right Column (3 Testimonial Cards) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {/* Testimonial 1 */}
            <div className="p-6 rounded-3xl bg-[#0f163b]/80 border border-cyan-400/25 flex flex-col justify-between min-h-[300px]">
              <div>
                <span className="text-2xl text-purple-400 font-serif block mb-2">“</span>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "Genesis ERP completely revolutionized how we handle our grading and timetable scheduling. It's like having an extra admin team."
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-cyan-400/15">
                <div className="w-9 h-9 rounded-full bg-blue-600/40 border border-blue-400/40 flex items-center justify-center text-xs font-bold text-white">
                  D
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Dr. Sarah Connor</div>
                  <div className="text-[10px] text-slate-400">Principal, Lincoln High</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="p-6 rounded-3xl bg-[#0f163b]/80 border border-cyan-400/25 flex flex-col justify-between min-h-[300px]">
              <div>
                <span className="text-2xl text-cyan-400 font-serif block mb-2">“</span>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "The AI predictive analytics caught 15 students who were silently struggling. We intervened early and saved their semester."
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-cyan-400/15">
                <div className="w-9 h-9 rounded-full bg-purple-600/40 border border-purple-400/40 flex items-center justify-center text-xs font-bold text-white">
                  J
                </div>
                <div>
                  <div className="text-xs font-bold text-white">James Wilson</div>
                  <div className="text-[10px] text-slate-400">Head of Academics</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="p-6 rounded-3xl bg-[#0f163b]/80 border border-cyan-400/25 flex flex-col justify-between min-h-[300px]">
              <div>
                <span className="text-2xl text-pink-400 font-serif block mb-2">“</span>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "Fee collection tracking used to take a week. Now I get a real-time snapshot on my dashboard every morning. Absolutely brilliant."
                </p>
              </div>
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-cyan-400/15">
                <div className="w-9 h-9 rounded-full bg-pink-600/40 border border-pink-400/40 flex items-center justify-center text-xs font-bold text-white">
                  E
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Elena Rodriguez</div>
                  <div className="text-[10px] text-slate-400">Finance Director</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. FOOTER SECTION ───────────────────────────────────────────── */}
      <footer className="relative z-10 w-full border-t border-cyan-400/15 bg-[#070a1e]/90 pt-12 pb-8 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start pb-8 border-b border-cyan-400/10">
          {/* Brand Col */}
          <div className="md:col-span-5 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-3 group mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-cyan-400 p-[1.5px]">
                <div className="w-full h-full bg-[#0d1333] rounded-[10.5px] flex items-center justify-center">
                  <span className="font-extrabold text-base text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-300">G</span>
                </div>
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">Genesis ERP</span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
              The world's most advanced autonomous school operations platform, designed to eliminate administrative friction.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <Globe className="w-4 h-4 hover:text-cyan-300 cursor-pointer transition-colors" />
              <span className="text-xs hover:text-cyan-300 cursor-pointer font-bold">X</span>
              <span className="text-xs hover:text-cyan-300 cursor-pointer font-bold">in</span>
              <span className="text-xs hover:text-cyan-300 cursor-pointer font-bold">yt</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="md:col-span-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Product</div>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><a href="#features" className="hover:text-cyan-300 transition-colors">Features</a></li>
              <li><a href="#security" className="hover:text-cyan-300 transition-colors">Security</a></li>
              <li><a href="#pricing" className="hover:text-cyan-300 transition-colors">Pricing</a></li>
              <li><a href="#casestudies" className="hover:text-cyan-300 transition-colors">Case Studies</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="md:col-span-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Company</div>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><a href="#about" className="hover:text-cyan-300 transition-colors">About Us</a></li>
              <li><a href="#careers" className="hover:text-cyan-300 transition-colors">Careers</a></li>
              <li><a href="#contact" className="hover:text-cyan-300 transition-colors">Contact</a></li>
              <li><a href="#privacy" className="hover:text-cyan-300 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Handwritten Cursive Quote */}
          <div className="md:col-span-2 flex items-center justify-end">
            <span className="font-serif italic text-lg sm:text-xl text-cyan-300/80 tracking-wide -rotate-6">
              Better Schools,<br />Brighter Futures
            </span>
          </div>
        </div>

        {/* Copyright */}
        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-medium">
          <div>© {new Date().getFullYear()} Genesis ERP / PaperBuddy Inc. All rights reserved.</div>
          <div className="mt-2 sm:mt-0 flex gap-4">
            <a href="#" className="hover:text-slate-400">Terms</a>
            <a href="#" className="hover:text-slate-400">Privacy</a>
            <a href="#" className="hover:text-slate-400">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
