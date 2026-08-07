"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { 
  ArrowRight, Sparkles, BrainCircuit, ShieldCheck, 
  LayoutDashboard, Users, GraduationCap, BarChart3, Clock, 
  Zap, Globe, ChevronRight, CheckCircle2
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
    <div className="min-h-screen bg-[#05080f] text-white overflow-x-hidden selection:bg-indigo-500/30 font-sans">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-20%] left-[30%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[150px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }}></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay"></div>
        
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto backdrop-blur-md border-b border-white/5 rounded-b-3xl">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] shrink-0 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <GraduationCap className="w-6 h-6 text-white relative z-10" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-gray-400 whitespace-nowrap">
            PaperBuddy
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#impact" className="hover:text-white transition-colors">Impact</a>
          <a href="#platform" className="hover:text-white transition-colors">Platform</a>
        </div>

        <div className="shrink-0">
          {isAuthenticated ? (
            <Link href="/dashboard" className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 border border-white/20 text-sm font-semibold hover:bg-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all whitespace-nowrap overflow-hidden">
              <span className="relative z-10">Go to Dashboard</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link href="/login" className="group relative inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 text-sm font-semibold hover:opacity-90 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all whitespace-nowrap">
              <span className="relative z-10">Sign In</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </nav>

      <main className="relative z-10">
        {/* Enhanced Hero Section */}
        <section className="pt-24 pb-32 px-4 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-[0_0_20px_rgba(99,102,241,0.15)] backdrop-blur-sm">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>v2.0 Next-Gen AI Release</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              Autonomous School <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 drop-shadow-lg">
                Operations Platform
              </span>
            </h1>

            <p className="mt-8 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              PaperBuddy transforms traditional school management with an 8-Role RBAC system, automated workflows, and intelligent analytics from LKG to 12th Standard.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              {isAuthenticated ? (
                <Link href="/dashboard" className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-lg shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] transition-all hover:-translate-y-1 flex items-center gap-3">
                  <LayoutDashboard className="w-5 h-5" />
                  Enter Workspace
                </Link>
              ) : (
                <Link href="/login" className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-lg shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] transition-all hover:-translate-y-1 flex items-center gap-3">
                  Get Started Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              <a href="#features" className="group px-8 py-4 rounded-xl bg-gray-900/50 border border-gray-700 hover:border-gray-500 hover:bg-gray-800/50 font-bold text-lg transition-all hover:-translate-y-1 flex items-center gap-2 backdrop-blur-sm">
                Explore Features
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
              </a>
            </div>
            
            <div className="mt-12 flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-500 font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 14-day free trial
              </div>
            </div>
          </div>

          <div className="flex-1 w-full max-w-2xl relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 rounded-3xl blur-3xl transform rotate-3"></div>
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] transform hover:scale-[1.02] hover:-rotate-1 transition-transform duration-500">
              <img src="/dashboard-mockup.png" alt="PaperBuddy Dashboard" className="w-full h-auto object-cover" />
              {/* Glass overlay shine */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>
            </div>
            
            {/* Floating badges */}
            <div className="absolute -top-6 -left-6 bg-gray-900/80 backdrop-blur-md border border-gray-700 p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-[bounce_4s_infinite]">
              <div className="bg-emerald-500/20 p-2 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium">Security</div>
                <div className="text-sm text-white font-bold">Enterprise Grade</div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 bg-gray-900/80 backdrop-blur-md border border-gray-700 p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-[bounce_5s_infinite_0.5s]">
              <div className="bg-indigo-500/20 p-2 rounded-lg">
                <BrainCircuit className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium">AI Processing</div>
                <div className="text-sm text-white font-bold">Live 24/7</div>
              </div>
            </div>
          </div>
        </section>

        {/* Impact/Statistics Section */}
        <section id="impact" className="py-20 border-y border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">50<span className="text-indigo-500">+</span></div>
              <div className="text-gray-400 font-medium uppercase tracking-wider text-xs md:text-sm">Partner Schools</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">1.2<span className="text-cyan-500">M</span></div>
              <div className="text-gray-400 font-medium uppercase tracking-wider text-xs md:text-sm">Students Managed</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">99.9<span className="text-emerald-500">%</span></div>
              <div className="text-gray-400 font-medium uppercase tracking-wider text-xs md:text-sm">System Uptime</div>
            </div>
            <div className="text-center px-4">
              <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">10<span className="text-purple-500">x</span></div>
              <div className="text-gray-400 font-medium uppercase tracking-wider text-xs md:text-sm">Faster Grading</div>
            </div>
          </div>
        </section>

        {/* Bento Grid Features Section */}
        <section id="features" className="py-32 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Everything you need, <br/><span className="text-gray-400">beautifully integrated.</span></h2>
            <p className="text-gray-400 text-lg">Stop juggling dozens of disjointed tools. PaperBuddy provides a unified, AI-driven ecosystem tailored perfectly for modern educational institutions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
            {/* Bento Box 1: AI */}
            <div className="md:col-span-2 glass-panel p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-900/20 to-transparent relative overflow-hidden group hover:border-indigo-500/50 transition-colors duration-500 flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30 text-indigo-400 group-hover:scale-110 transition-transform">
                  <BrainCircuit className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Intelligent Grading & OCR</h3>
                <p className="text-gray-400 text-lg max-w-md leading-relaxed">
                  Upload photos of subjective exam papers and let our proprietary AI models grade them instantly. Save thousands of teacher hours every semester.
                </p>
              </div>
              <div className="relative z-10 self-end opacity-50 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-6 h-6 text-indigo-400" />
              </div>
            </div>

            {/* Bento Box 2: RBAC */}
            <div className="md:col-span-1 glass-panel p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-900/20 to-transparent relative overflow-hidden group hover:border-cyan-500/50 transition-colors duration-500 flex flex-col justify-between">
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">8-Role Secure RBAC</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  From Super Admin to Student, everyone gets a highly tailored dashboard with strictly enforced security scopes.
                </p>
              </div>
            </div>

            {/* Bento Box 3: Ecosystem */}
            <div className="md:col-span-1 glass-panel p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-900/20 to-transparent relative overflow-hidden group hover:border-emerald-500/50 transition-colors duration-500 flex flex-col justify-between">
               <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center mb-6 border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Unified Platform</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Hostel, Library, Finance, Academics, and Transport—all connected in a single truth matrix.
                </p>
              </div>
            </div>

            {/* Bento Box 4: Analytics */}
            <div className="md:col-span-2 glass-panel p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-purple-900/20 to-transparent relative overflow-hidden group hover:border-purple-500/50 transition-colors duration-500 flex flex-col justify-between">
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-colors"></div>
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center h-full">
                <div className="flex-1">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30 text-purple-400 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Predictive Analytics</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Identify struggling students before they fail. Our models analyze attendance, past scores, and behavior to flag interventions.
                  </p>
                </div>
                
                {/* Mock Chart UI */}
                <div className="hidden md:flex flex-1 w-full h-full bg-gray-950/50 border border-gray-800 rounded-2xl p-4 flex-col justify-end gap-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
                  <div className="flex justify-between items-end h-full gap-2 px-2">
                    {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
                      <div key={i} className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-sm" style={{ height: `${height}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Sleek Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#03050a] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-xl text-white">PaperBuddy</span>
            </div>
            <p className="text-gray-400 max-w-sm mb-6 leading-relaxed">
              The world's most advanced autonomous school operations platform, designed to eliminate administrative friction.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors"><Globe className="w-4 h-4 text-gray-400" /></div>
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors"><Zap className="w-4 h-4 text-gray-400" /></div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Product</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Security</a></li>
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Case Studies</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">© 2026 PaperBuddy. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
