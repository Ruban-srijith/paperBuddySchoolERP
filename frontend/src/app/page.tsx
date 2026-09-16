"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  ArrowRight, Sparkles, ShieldCheck, 
  Users, GraduationCap, BarChart3, 
  Zap, Globe, Download, Building2,
  CheckCircle2, BookOpen, Bus, Layers,
  Shield, Flame, ChevronRight, Award, Trophy, Activity, Clock
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import Tilt3D from "@/components/Tilt3D";
<<<<<<< HEAD

=======
>>>>>>> main

// Corner Arch SVG Line Ornament
function CornerArchOrnament({ position = "tr" }: { position?: "tr" | "bl" | "br" }) {
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

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#14251c] text-[#f4f0e6] relative overflow-hidden selection:bg-[#43634e] selection:text-white font-sans">
      {/* BackgroundWallpaper is globally rendered in ClientLayout */}

      {/* ─── 1. NAVIGATION BAR ────────────────────────────────────────────── */}
      <nav className="relative z-50 w-full border-b border-[#f4f0e6]/10 backdrop-blur-md bg-[#122218]/85 py-4 px-6 sm:px-12 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo & Emblem */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#1b3527] border border-[#f4f0e6]/30 flex items-center justify-center shadow-lg shadow-black/40 relative overflow-hidden">
              <Shield className="w-6 h-6 stroke-[1.5] text-[#e8e2d3]" />
              <Flame className="w-3 h-3 absolute text-[#f4f0e6] fill-[#e8e2d3]" />
            </div>
            <span className="text-xl font-extrabold text-[#f4f0e6] tracking-tight font-syne">
              Genesis <span className="text-xs font-semibold text-[#e8e2d3] uppercase tracking-widest ml-1 bg-[#43634e]/40 border border-[#f4f0e6]/25 px-2 py-0.5 rounded-full">ERP</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#e8e2d3]/80">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#impact" className="hover:text-white transition-colors">Impact</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <a href="#platform" className="hover:text-white transition-colors">Platform</a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#43634e]/50 hover:bg-[#43634e]/80 border border-[#f4f0e6]/25 text-xs font-bold text-[#f4f0e6] shadow-sm transition-colors">
              <Download className="w-3.5 h-3.5 text-[#e8e2d3]" />
              Download App
            </button>
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#f4f0e6] hover:bg-white text-[#16281e] text-xs font-extrabold transition-colors shadow-md"
            >
              {isAuthenticated ? "Go to Dashboard" : "Sign In"} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── 2. HERO SECTION ──────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 pt-12 sm:pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Text Content */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Version Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1b3527] border border-[#a3c9b0]/30 text-[11px] font-bold text-[#e8e2d3] mb-6 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>v2.0 Next-Gen AI Release</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] text-white font-syne">
              Genesis
              <span className="block mt-1 text-[#e8e2d3]">
                Build the Future
              </span>
            </h1>

            {/* Description */}
            <p className="mt-5 text-sm sm:text-base text-[#a3c9b0] leading-relaxed max-w-xl font-normal">
              Genesis ERP transforms traditional school management with an 11-Role RBAC system, automated workflows, and intelligent analytics from LKG to 12th Standard.
            </p>

            {/* CTA Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={isAuthenticated ? "/dashboard" : "/login"}
                className="px-7 py-3.5 rounded-full bg-[#2b4c37] hover:bg-[#345c43] text-[#f4f0e6] text-sm font-extrabold shadow-xl transition-all flex items-center gap-2 border border-[#e8e2d3]/30 btn-3d"
              >
                {isAuthenticated ? "Open Dashboard" : "Sign In"} <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="px-7 py-3.5 rounded-full bg-[#1b3527]/80 hover:bg-[#1b3527] border border-[#a3c9b0]/30 text-sm font-bold text-[#f4f0e6] transition-all flex items-center gap-2 shadow-md"
              >
                Explore Features <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Micro proof points */}
            <div className="mt-6 flex items-center gap-6 text-xs font-semibold text-[#a3c9b0]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                14-day free trial
              </span>
            </div>
          </div>

          {/* Right Column Emerald Glass Hero Preview (Brutalist Concrete Rim Mount) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Ambient Background Radial Glow behind Graphic */}
            <div className="absolute w-[360px] h-[360px] rounded-full bg-[#2d503a]/40 blur-[90px] -z-10" />

            {/* Reference Brutalist Concrete Chassis Mount */}
            <div className="w-full max-w-[450px] brutal-concrete-chassis p-3">
              <Tilt3D className="w-full rounded-[24px]">
                <div className="glass-emerald-tile p-6 sm:p-8 rounded-[24px] w-full space-y-5 shadow-2xl relative">
                  <CornerArchOrnament position="tr" />

                  {/* Card Header Bar */}
                  <div className="flex items-center justify-between border-b border-[#a3c9b0]/25 pb-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#2b4c37]" />
                      <div className="w-3 h-3 rounded-full bg-[#a3c9b0]" />
                      <div className="w-3 h-3 rounded-full bg-[#e8e2d3]" />
                    </div>
                    <div className="text-[10px] font-bold text-[#e8e2d3] uppercase tracking-widest bg-[#12281b]/80 border border-[#a3c9b0]/30 px-2.5 py-0.5 rounded-full">
                      Genesis Cloud Hub
                    </div>
                  </div>

                  {/* Central Shield Graphic */}
                  <div className="flex-1 flex flex-col items-center justify-center py-6 relative z-10 text-center space-y-3">
                    <div className="w-20 h-20 rounded-2xl bg-[#182e22] text-[#f4f0e6] flex items-center justify-center shadow-lg border-2 border-[#e8e2d3]/30">
                      <GraduationCap className="w-10 h-10 text-[#e8e2d3]" />
                    </div>
                    <div className="text-lg font-bold text-[#f4f0e6]">Smart School Platform</div>
                    <p className="text-xs text-[#a3c9b0] max-w-xs font-medium">
                      Autonomous school operations, real-time attendance, and automated report cards.
                    </p>
                  </div>

                  {/* Card Footer Badges */}
                  <div className="grid grid-cols-2 gap-3 pt-2 relative z-10">
                    <div className="p-2.5 rounded-xl bg-[#14291e]/80 border border-[#a3c9b0]/25 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-emerald-400" />
                      <div className="text-[10px] font-bold text-[#f4f0e6]">99.9% Stats</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#14291e]/80 border border-[#a3c9b0]/25 flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <div className="text-[10px] font-bold text-[#f4f0e6]">11 Roles RBAC</div>
                    </div>
                  </div>
                </div>
              </Tilt3D>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. KEY METRICS BAR (BRUTALIST CONCRETE CHASSIS & GLASS TILE) ────── */}
      <section id="impact" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-6">
        <div className="brutal-concrete-chassis p-3">
          <div className="glass-emerald-tile p-6 sm:p-8 rounded-[24px]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#a3c9b0]/20">
              {/* Metric 1 */}
              <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-4 first:pl-0 first:pt-0">
                <div className="w-12 h-12 rounded-xl bg-[#182e22] text-[#f4f0e6] border border-[#e8e2d3]/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-[#e8e2d3]" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#f4f0e6]">50+</div>
                  <div className="text-[10px] font-bold text-[#a3c9b0] uppercase tracking-wider">Partner Schools</div>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
                <div className="w-12 h-12 rounded-xl bg-[#182e22] text-[#f4f0e6] border border-[#e8e2d3]/20 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-[#e8e2d3]" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#f4f0e6]">1.2M</div>
                  <div className="text-[10px] font-bold text-[#a3c9b0] uppercase tracking-wider">Students Managed</div>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
                <div className="w-12 h-12 rounded-xl bg-[#182e22] text-[#f4f0e6] border border-[#e8e2d3]/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-[#e8e2d3]" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#f4f0e6]">99.9%</div>
                  <div className="text-[10px] font-bold text-[#a3c9b0] uppercase tracking-wider">System Uptime</div>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
                <div className="w-12 h-12 rounded-xl bg-[#182e22] text-[#f4f0e6] border border-[#e8e2d3]/20 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6 text-[#e8e2d3]" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#f4f0e6]">10x</div>
                  <div className="text-[10px] font-bold text-[#a3c9b0] uppercase tracking-wider">Faster Grading</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. FEATURES SECTION ─────────────────────────────────────────── */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-12">
        <div className="brutal-concrete-chassis p-3">
          <div className="glass-emerald-tile p-8 sm:p-12 rounded-[28px]">
            <CornerArchOrnament position="tr" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
              {/* Left Header */}
              <div className="lg:col-span-5 flex flex-col items-start pr-0 lg:pr-4">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-[#f4f0e6] font-syne">
                  Everything you need,
                  <span className="block mt-1 text-[#a3c9b0]">
                    beautifully integrated.
                  </span>
                </h2>
                <p className="mt-4 text-sm text-[#a3c9b0] leading-relaxed font-medium">
                  Stop juggling dozens of disjointed tools. Genesis ERP provides a unified ecosystem tailored for modern educational institutions.
                </p>
              </div>

              {/* Right 2x2 Feature Cards Grid */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Feature 1 */}
                <div className="p-5 rounded-2xl bg-[#14291e]/90 border border-[#a3c9b0]/25 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#2b4c37] text-[#f4f0e6] flex items-center justify-center text-sm font-bold border border-[#e8e2d3]/20">
                    <Building2 className="w-5 h-5 text-[#e8e2d3]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#f4f0e6]">Intelligent Grading & OCR</h3>
                  <p className="text-xs text-[#a3c9b0] leading-relaxed font-medium">
                    Scan and grade exam papers instantly. Save thousands of teacher hours every semester.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-5 rounded-2xl bg-[#14291e]/90 border border-[#a3c9b0]/25 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#2b4c37] text-[#f4f0e6] flex items-center justify-center text-sm font-bold border border-[#e8e2d3]/20">
                    <ShieldCheck className="w-5 h-5 text-[#e8e2d3]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#f4f0e6]">11-Role Secure RBAC</h3>
                  <p className="text-xs text-[#a3c9b0] leading-relaxed font-medium">
                    From Super Admin to Student, everyone gets a tailored dashboard with strict security.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-5 rounded-2xl bg-[#14291e]/90 border border-[#a3c9b0]/25 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#2b4c37] text-[#f4f0e6] flex items-center justify-center text-sm font-bold border border-[#e8e2d3]/20">
                    <Globe className="w-5 h-5 text-[#e8e2d3]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#f4f0e6]">Unified Platform</h3>
                  <p className="text-xs text-[#a3c9b0] leading-relaxed font-medium">
                    Hostel, Library, Finance, Academics, and Transport—all connected in real-time.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="p-5 rounded-2xl bg-[#14291e]/90 border border-[#a3c9b0]/25 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#2b4c37] text-[#f4f0e6] flex items-center justify-center text-sm font-bold border border-[#e8e2d3]/20">
                    <BarChart3 className="w-5 h-5 text-[#e8e2d3]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#f4f0e6]">Predictive Analytics</h3>
                  <p className="text-xs text-[#a3c9b0] leading-relaxed font-medium">
                    Identify struggling students before they fail with automated lag alerts and attendance metrics.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. PLATFORM MODULES ─────────────────────────────────────────── */}
      <section id="platform" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-8">
        <div className="brutal-concrete-chassis p-3">
          <div className="glass-emerald-tile p-8 rounded-[28px]">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f4f0e6] font-syne">
                A Complete Platform
              </h2>
              <p className="text-xs text-[#a3c9b0] mt-1 font-medium">
                Every module you need to run your institution, seamlessly integrated.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-xl bg-[#14291e]/90 border border-[#a3c9b0]/25 text-center space-y-2">
                <GraduationCap className="w-6 h-6 text-[#e8e2d3] mx-auto" />
                <div className="text-xs font-bold text-[#f4f0e6]">Academics</div>
              </div>

              <div className="p-4 rounded-xl bg-[#14291e]/90 border border-[#a3c9b0]/25 text-center space-y-2">
                <Building2 className="w-6 h-6 text-[#e8e2d3] mx-auto" />
                <div className="text-xs font-bold text-[#f4f0e6]">Finance & Fees</div>
              </div>

              <div className="p-4 rounded-xl bg-[#14291e]/90 border border-[#a3c9b0]/25 text-center space-y-2">
                <Users className="w-6 h-6 text-[#e8e2d3] mx-auto" />
                <div className="text-xs font-bold text-[#f4f0e6]">HR & Payroll</div>
              </div>

              <div className="p-4 rounded-xl bg-[#14291e]/90 border border-[#a3c9b0]/25 text-center space-y-2">
                <BookOpen className="w-6 h-6 text-[#e8e2d3] mx-auto" />
                <div className="text-xs font-bold text-[#f4f0e6]">Library</div>
              </div>

              <div className="p-4 rounded-xl bg-[#14291e]/90 border border-[#a3c9b0]/25 text-center space-y-2 col-span-2 sm:col-span-1">
                <Bus className="w-6 h-6 text-[#e8e2d3] mx-auto" />
                <div className="text-xs font-bold text-[#f4f0e6]">Transport</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. TESTIMONIALS SECTION ─────────────────────────────────────── */}
      <section id="testimonials" className="relative z-10 max-w-7xl mx-auto px-6 sm:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 brutal-concrete-chassis p-3">
            <div className="glass-emerald-tile p-6 rounded-[24px]">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f4f0e6] font-syne">
                Trusted by the best.
              </h2>
              <p className="mt-3 text-xs text-[#a3c9b0] leading-relaxed font-medium">
                Hear from principals, teachers, and admins who have transformed their daily operations with Genesis ERP.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-emerald-tile p-5 rounded-[24px] space-y-3">
              <p className="text-xs text-[#f4f0e6] italic leading-relaxed">
                "Genesis ERP completely revolutionized how we handle our grading and timetable scheduling."
              </p>
              <div className="text-[11px] font-bold text-[#a3c9b0] border-t border-[#a3c9b0]/20 pt-2">
                Dr. Sarah Connor • Principal
              </div>
            </div>

            <div className="glass-emerald-tile p-5 rounded-[24px] space-y-3">
              <p className="text-xs text-[#f4f0e6] italic leading-relaxed">
                "The predictive analytics caught struggling students early so we could intervene."
              </p>
              <div className="text-[11px] font-bold text-[#a3c9b0] border-t border-[#a3c9b0]/20 pt-2">
                James Wilson • Academics Head
              </div>
            </div>

            <div className="glass-emerald-tile p-5 rounded-[24px] space-y-3">
              <p className="text-xs text-[#f4f0e6] italic leading-relaxed">
                "Fee collection tracking used to take a week. Now I get real-time snapshots every morning."
              </p>
              <div className="text-[11px] font-bold text-[#a3c9b0] border-t border-[#a3c9b0]/20 pt-2">
                Elena Rodriguez • Finance Director
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. FOOTER SECTION ───────────────────────────────────────────── */}
      <footer className="relative z-10 w-full border-t border-[#f4f0e6]/10 bg-[#122218]/90 pt-10 pb-8 px-6 sm:px-12 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-[#b5ad9b] font-medium gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#e8e2d3]" />
            <span>© {new Date().getFullYear()} Genesis ERP. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#impact" className="hover:text-white transition-colors">Impact</a>
            <a href="#platform" className="hover:text-white transition-colors">Platform</a>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
