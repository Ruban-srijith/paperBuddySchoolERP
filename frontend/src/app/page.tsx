"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Users, CheckSquare, GraduationCap, DollarSign, FileSpreadsheet, 
  Shield, CalendarDays, Clock, Award, CheckCircle2, ChevronRight,
  ArrowRight, Download, Building2, BookOpen, UserCheck, HelpCircle,
  FileCheck, Wallet, Activity, Phone, Megaphone, Moon, Sun
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import PageLoader from "@/components/PageLoader";

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'timetable' | 'finance'>('overview');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Restore dark mode preference from localStorage
    const saved = localStorage.getItem('genesis-theme');
    if (saved === 'dark') setDarkMode(true);

    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('genesis-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  if (!mounted) return <PageLoader />;

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen font-sans antialiased selection:bg-blue-600 selection:text-white`}>
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-300">

      {/* Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Install Genesis ERP</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Add this app to your device for quick access</p>
              </div>
              <button
                onClick={() => setShowInstallGuide(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none font-bold ml-4"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/50">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-sm shrink-0 mt-0.5">1</span>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Look for the <strong>install icon</strong> (⊕ or a download arrow) in your browser&apos;s address bar on the right side.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400 font-bold text-sm shrink-0 mt-0.5">2</span>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  In <strong>Chrome / Edge</strong>: Click the address bar install icon → click <em>Install</em>.
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400 font-bold text-sm shrink-0 mt-0.5">3</span>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  In <strong>Brave</strong>: Click the 3-dot menu (⋮) → <em>Install Genesis ERP…</em>
                </p>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400 font-bold text-sm shrink-0 mt-0.5">4</span>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  On <strong>mobile</strong>: Tap the browser menu → <em>Add to Home Screen</em>.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
              Once installed, Genesis ERP will open as a standalone app.
            </p>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
      
      {/* 1. STICKY NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/60 px-4 lg:px-8 py-3 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Genesis ERP Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">Genesis ERP</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-black dark:text-white">
            <a href="#features" className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#platform" className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors">Platform</a>
            <a href="#roles" className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors">Roles</a>
            <a href="#workflow" className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors">Workflow</a>
            <a href="#why-us" className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors">Why Genesis</a>
          </nav>

          {/* Header Action CTAs */}
          <div className="flex items-center space-x-2">
            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
              className="p-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode 
                ? <Sun className="w-4 h-4 text-amber-500" />
                : <Moon className="w-4 h-4 text-slate-600" />
              }
            </button>

            {!isInstalled && (
              <button
                onClick={async () => {
                  if (installPrompt) {
                    installPrompt.prompt();
                    const { outcome } = await installPrompt.userChoice;
                    if (outcome === 'accepted') {
                      setInstallPrompt(null);
                      setIsInstalled(true);
                    }
                  } else {
                    setShowInstallGuide(true);
                  }
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-black dark:text-white font-medium text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Download App</span>
              </button>
            )}

            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>

            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <span>{isAuthenticated ? "Go to Dashboard" : "Explore Platform"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="py-12 md:py-20 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-700/50">
              <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>School Management Platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
              Everything your school needs, <span className="text-blue-700 dark:text-blue-400">in one place.</span>
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed max-w-xl">
              Genesis ERP brings students, teachers, academics, attendance, fees, and school administration together in one simple, connected platform.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href={isAuthenticated ? "/dashboard" : "/login"}
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm shadow-sm transition-all text-center"
              >
                <span>{isAuthenticated ? "Open School Dashboard" : "Explore Platform"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all text-center shadow-2xs"
              >
                <span>Sign In to Account</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>LKG to Grade 12</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Multi-Role Access</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Real-Time Reports</span>
              </span>
            </div>
          </div>

          {/* Right Column: Polished Product UI Mockup */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900 rounded-lg border border-slate-800 shadow-xl overflow-hidden">
              {/* Browser Device Bar */}
              <div className="bg-slate-800/90 px-4 py-2.5 flex items-center justify-between border-b border-slate-700/80">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <div className="text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-0.5 rounded border border-slate-700/50">
                  app.paperbuddy.erp / dashboard
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Live ERP System</span>
                </div>
              </div>

              {/* Dashboard Preview Body */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 space-y-4">
                
                {/* Header Mock */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Genesis ERP — School Overview</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Academic Year 2026–27 • Central Administration</div>
                  </div>
                  <span className="text-[10px] bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-semibold border border-blue-200 dark:border-blue-700/50">
                    Grade 1 to 12 Active
                  </span>
                </div>

                {/* 4 Metric Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-white dark:bg-slate-700 p-3 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">
                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Total Students</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">2,450</div>
                    <div className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">+3.2% this year</div>
                  </div>

                  <div className="bg-white dark:bg-slate-700 p-3 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">
                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Attendance Rate</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">94.8%</div>
                    <div className="text-[9px] font-semibold text-blue-600 dark:text-blue-400">Daily Roll Call</div>
                  </div>

                  <div className="bg-white dark:bg-slate-700 p-3 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">
                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Fees Collected</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">₹14.2 Lakhs</div>
                    <div className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">92% Term Clearance</div>
                  </div>

                  <div className="bg-white dark:bg-slate-700 p-3 rounded border border-slate-200 dark:border-slate-600 shadow-2xs">
                    <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Pending Approvals</div>
                    <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">12 Items</div>
                    <div className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">Requires Clearance</div>
                  </div>
                </div>

                {/* Main Schedule & Activity Panel */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2 bg-white dark:bg-slate-700 p-3 rounded border border-slate-200 dark:border-slate-600 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-600 pb-1.5">
                      <span>Today's Grade Schedule (Grade 10-A)</span>
                      <span className="text-blue-600 dark:text-blue-400 font-normal text-[10px]">4 Periods Scheduled</span>
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between p-1.5 bg-slate-50 dark:bg-slate-600 rounded border border-slate-100 dark:border-slate-500">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">Period 1: Mathematics</span>
                        <span className="font-mono text-slate-500 dark:text-slate-300 text-[10px]">09:00 - 09:45 AM</span>
                      </div>
                      <div className="flex justify-between p-1.5 bg-blue-50 dark:bg-blue-900/50 rounded border border-blue-100 dark:border-blue-700/50">
                        <span className="font-semibold text-blue-800 dark:text-blue-300">Period 2: Physics (Ongoing)</span>
                        <span className="font-mono text-blue-700 dark:text-blue-300 text-[10px]">09:45 - 10:30 AM</span>
                      </div>
                      <div className="flex justify-between p-1.5 bg-slate-50 dark:bg-slate-600 rounded border border-slate-100 dark:border-slate-500">
                        <span className="font-semibold text-slate-800 dark:text-slate-100">Period 3: Chemistry</span>
                        <span className="font-mono text-slate-500 dark:text-slate-300 text-[10px]">10:45 - 11:30 AM</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-700 p-3 rounded border border-slate-200 dark:border-slate-600 space-y-2">
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-600 pb-1.5">
                      Recent Activity
                    </div>
                    <div className="space-y-2 text-[10px] text-slate-600 dark:text-slate-300">
                      <div className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                        <span>Grade 8 attendance verified</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0"></span>
                        <span>Salary approval cleared</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                        <span>Exam schedule published</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. TRUST & CREDIBILITY SECTION */}
      <section className="py-8 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-700/60 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Built for the everyday needs of modern schools
          </p>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 pt-2">
            <div className="p-3 rounded border border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 text-center space-y-1">
              <Users className="w-5 h-5 text-blue-700 dark:text-blue-400 mx-auto" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Student Records</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Profiles & Rosters</div>
            </div>

            <div className="p-3 rounded border border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 text-center space-y-1">
              <GraduationCap className="w-5 h-5 text-indigo-700 dark:text-indigo-400 mx-auto" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Academics</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Classes & Timetables</div>
            </div>

            <div className="p-3 rounded border border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 text-center space-y-1">
              <CheckSquare className="w-5 h-5 text-emerald-700 dark:text-emerald-400 mx-auto" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Attendance</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Daily Student & Staff</div>
            </div>

            <div className="p-3 rounded border border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 text-center space-y-1">
              <DollarSign className="w-5 h-5 text-amber-700 dark:text-amber-400 mx-auto" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Fee Management</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Tuition & Dues</div>
            </div>

            <div className="p-3 rounded border border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 text-center space-y-1">
              <UserCheck className="w-5 h-5 text-purple-700 dark:text-purple-400 mx-auto" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Staff & Payroll</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Faculty Workload</div>
            </div>

            <div className="p-3 rounded border border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 text-center space-y-1">
              <FileSpreadsheet className="w-5 h-5 text-teal-700 dark:text-teal-400 mx-auto" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Reports</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Real-Time Insights</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION */}
      <section id="features" className="py-16 md:py-24 px-4 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Everything your school needs to run smoothly
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Manage daily operations, academic workflows, and communication from one connected platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-700/60 shadow-2xs hover:border-blue-600 dark:hover:border-blue-500 transition-colors space-y-3">
            <div className="w-10 h-10 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">1. Student Management</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Manage admissions, student profiles, class rosters, guardian contact information, and academic histories across all grade tiers.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-700/60 shadow-2xs hover:border-blue-600 dark:hover:border-blue-500 transition-colors space-y-3">
            <div className="w-10 h-10 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">2. Attendance</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Track student and staff attendance with clear daily roll call logs, monthly attendance matrices, and automated absent notifications.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-700/60 shadow-2xs hover:border-blue-600 dark:hover:border-blue-500 transition-colors space-y-3">
            <div className="w-10 h-10 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">3. Academics</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Manage classes, sections, subjects, period timetables, academic calendars, and learning portion completion logs.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-700/60 shadow-2xs hover:border-blue-600 dark:hover:border-blue-500 transition-colors space-y-3">
            <div className="w-10 h-10 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">4. Fees & Finance</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Track fee collections, pending payments, digital receipts, staff payroll approvals, and department procurement budgets.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-700/60 shadow-2xs hover:border-blue-600 dark:hover:border-blue-500 transition-colors space-y-3">
            <div className="w-10 h-10 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">5. Examinations</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Schedule midterm and final examinations, assign invigilators, manage marks entry, and publish class topper rankings.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-700/60 shadow-2xs hover:border-blue-600 dark:hover:border-blue-500 transition-colors space-y-3">
            <div className="w-10 h-10 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">6. Reports & Analytics</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Generate structured reports for administrative oversight, academic progress audits, attendance trends, and financial summaries.
            </p>
          </div>

        </div>
      </section>

      {/* 5. PRODUCT SHOWCASE SECTION */}
      <section id="platform" className="py-16 md:py-24 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-700/60 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              One platform for the entire school
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Give administrators, teachers, and management a clear view of the information they need every day.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center border-b border-slate-200 dark:border-slate-700/60 max-w-xl mx-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'overview' 
                  ? 'border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-400' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Administration Overview
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'attendance' 
                  ? 'border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-400' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Attendance Matrix
            </button>
            <button
              onClick={() => setActiveTab('timetable')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'timetable' 
                  ? 'border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-400' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Timetable Grid
            </button>
            <button
              onClick={() => setActiveTab('finance')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'finance' 
                  ? 'border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-400' 
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Fee Ledger
            </button>
          </div>

          {/* Tab Preview Display */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60 p-6 max-w-5xl mx-auto shadow-sm">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/60 pb-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Institutional Governance Portal</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Real-time overview of active grade tiers and staff clearances</div>
                  </div>
                  <span className="text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-700/50">
                    All Systems Operational
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700/60 space-y-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Active Students</span>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">2,450</div>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400">LKG to 12th Standard</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700/60 space-y-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Teaching Faculty</span>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">68</div>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400">Full-time Staff</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700/60 space-y-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Pending Approvals</span>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">12</div>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400">Clearances Pending</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/60 pb-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Daily Attendance Breakdown</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Class-wise present/absent roll call status</div>
                  </div>
                  <span className="text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold px-2.5 py-1 rounded border border-blue-200 dark:border-blue-700/50">
                    94.8% Today
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-900 dark:text-white">Grade 10-A Attendance Status</span>
                    <span className="text-emerald-600 dark:text-emerald-400">38 Present / 2 Absent</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: '95%' }}></div>
                    <div className="bg-rose-500 h-full" style={{ width: '5%' }}></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'timetable' && (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/60 pb-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Academic Timetable Matrix</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Conflict-free schedule solver for grades and period allotments</div>
                  </div>
                  <span className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-semibold px-2.5 py-1 rounded border border-indigo-200 dark:border-indigo-700/50">
                    OR-Tools Solved
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="grid grid-cols-4 gap-2 font-semibold text-center bg-slate-50 dark:bg-slate-700/60 p-2 rounded text-slate-700 dark:text-slate-300">
                    <span>Period 1 (09:00)</span>
                    <span>Period 2 (09:45)</span>
                    <span>Period 3 (10:45)</span>
                    <span>Period 4 (11:30)</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center p-2 text-slate-800 dark:text-slate-200 font-medium">
                    <span className="bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 p-2 rounded">Mathematics</span>
                    <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 p-2 rounded">Physics Lab</span>
                    <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 p-2 rounded">English Lit</span>
                    <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 p-2 rounded">Chemistry</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'finance' && (
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700/60 pb-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">Fee Collection & Dues Ledger</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Tuition, bus, hostel receipts, and pending balance tracking</div>
                  </div>
                  <span className="text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-700/50">
                    ₹14.2L Collected
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/60 rounded font-semibold text-slate-700 dark:text-slate-300">
                    <span>Category</span>
                    <span>Collection Progress</span>
                    <span>Status</span>
                  </div>
                  <div className="flex justify-between items-center p-2 border-b border-slate-100 dark:border-slate-700/60 text-slate-800 dark:text-slate-200">
                    <span>Tuition Fees (Term 2)</span>
                    <span className="font-bold">₹10,50,000 / ₹11,20,000</span>
                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold px-2 py-0.5 rounded">93% Paid</span>
                  </div>
                  <div className="flex justify-between items-center p-2 border-b border-slate-100 dark:border-slate-700/60 text-slate-800 dark:text-slate-200">
                    <span>Transport Fees</span>
                    <span className="font-bold">₹2,80,000 / ₹3,00,000</span>
                    <span className="text-[10px] bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold px-2 py-0.5 rounded">90% Paid</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. ROLE-BASED SECTION */}
      <section id="roles" className="py-16 md:py-24 px-4 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Built for every role in your school
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Designed to streamline daily workflows for every stakeholder in your institution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Role 1: Correspondent */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-md border border-slate-200 dark:border-slate-700/60 shadow-2xs space-y-2">
            <div className="flex items-center space-x-2.5 text-blue-800 dark:text-blue-300 font-bold text-sm">
              <Building2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>Correspondent / Trustee</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Monitor institutional performance, salary clearances, major event approvals, and monthly revenue analytics.
            </p>
          </div>

          {/* Role 2: Principal */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-md border border-slate-200 dark:border-slate-700/60 shadow-2xs space-y-2">
            <div className="flex items-center space-x-2.5 text-blue-800 dark:text-blue-300 font-bold text-sm">
              <Shield className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>Principal & Vice-Principal</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Oversee academic operations, staff attendance, timetable solver, classroom allocations, and pending approvals.
            </p>
          </div>

          {/* Role 3: Teacher */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-md border border-slate-200 dark:border-slate-700/60 shadow-2xs space-y-2">
            <div className="flex items-center space-x-2.5 text-blue-800 dark:text-blue-300 font-bold text-sm">
              <GraduationCap className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>Teacher / Educator</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Manage assigned classes, mark student attendance, assign homework, record marks, and resolve student subject doubts.
            </p>
          </div>

          {/* Role 4: Accountant / Finance */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-md border border-slate-200 dark:border-slate-700/60 shadow-2xs space-y-2">
            <div className="flex items-center space-x-2.5 text-blue-800 dark:text-blue-300 font-bold text-sm">
              <Wallet className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>Accountant / Finance</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Collect tuition and bus fees, issue digital receipts, manage staff payroll, and review department procurement budgets.
            </p>
          </div>

          {/* Role 5: Student */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-md border border-slate-200 dark:border-slate-700/60 shadow-2xs space-y-2">
            <div className="flex items-center space-x-2.5 text-blue-800 dark:text-blue-300 font-bold text-sm">
              <BookOpen className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>Student</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Access daily class timetables, homework assignments, exam schedules, attendance logs, and digital library resources.
            </p>
          </div>

          {/* Role 6: Parent */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-md border border-slate-200 dark:border-slate-700/60 shadow-2xs space-y-2">
            <div className="flex items-center space-x-2.5 text-blue-800 dark:text-blue-300 font-bold text-sm">
              <Users className="w-4 h-4 text-blue-700 dark:text-blue-400" />
              <span>Parent / Guardian</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Stay informed on student daily attendance, pending fee dues, exam results, and official school announcements.
            </p>
          </div>

        </div>
      </section>

      {/* 7. SCHOOL WORKFLOW SECTION */}
      <section id="workflow" className="py-16 md:py-24 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-700/60 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              From admission to academic performance
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              A connected end-to-end operational pipeline for school administration.
            </p>
          </div>

          {/* Horizontal Process Steps */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="p-4 rounded border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 space-y-2 text-center">
              <div className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">01. ADMISSION</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Student Intake</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Student registration & class allotment</p>
            </div>

            <div className="p-4 rounded border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 space-y-2 text-center">
              <div className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">02. ROSTER</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Class Assign</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Sections & class teacher allotment</p>
            </div>

            <div className="p-4 rounded border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 space-y-2 text-center">
              <div className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">03. DAILY OPS</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Attendance</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Roll call & period timetable solver</p>
            </div>

            <div className="p-4 rounded border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 space-y-2 text-center">
              <div className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">04. EXAMS</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Examinations</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Hall seating, marks & toppers</p>
            </div>

            <div className="p-4 rounded border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 space-y-2 text-center">
              <div className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">05. FINANCE</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Fees & Dues</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Tuition receipts & staff payroll</p>
            </div>

            <div className="p-4 rounded border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60 space-y-2 text-center">
              <div className="text-xs font-mono font-bold text-blue-700 dark:text-blue-400">06. INSIGHTS</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">Reports</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Management & academic summaries</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. WHY GENESIS ERP */}
      <section id="why-us" className="py-16 md:py-24 px-4 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Why schools choose Genesis ERP
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            Built specifically for the operational demands of K-12 school administration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-700/60 space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Centralized School Information</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Eliminate disconnected spreadsheets by maintaining all student records, academic timetables, and financial data in a single secure system.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-700/60 space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Multi-Role Security</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Enforce role-based permission boundaries ensuring correspondents, principals, teachers, and students access only relevant data.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-700/60 space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Faster Administration</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Accelerate daily tasks with automated attendance roll calls, instant fee receipt generation, and swift leave clearances.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-700/60 space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Academic Visibility</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Gain full transparency into syllabus completion rates, period substitutions, teacher workload, and student GPA trends.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-700/60 space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Transparent Fee Management</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Clear breakdown of tuition, bus, and hostel dues with digital receipt issuance and pending fee reminders.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-md border border-slate-200 dark:border-slate-700/60 space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Organized Reporting</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Structured administrative, academic, and financial reports ready for board reviews, council meetings, and audits.
            </p>
          </div>
        </div>
      </section>

      {/* 9. CTA SECTION */}
      <section className="py-16 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#0F172A] dark:bg-slate-800 rounded-lg border border-slate-800 dark:border-slate-600/60 p-8 md:p-12 text-center text-white space-y-6 shadow-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-blue-900/60 dark:bg-blue-900/40 text-blue-300 text-xs font-semibold border border-blue-700/50">
            <span>School ERP Platform</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-white">
            Bring your school&apos;s operations together.
          </h2>

          <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
            Manage academics, administration, attendance, and finance from one connected platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className="px-6 py-3 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-colors shadow-sm w-full sm:w-auto"
            >
              {isAuthenticated ? "Go to Dashboard" : "Explore Genesis ERP"}
            </Link>

            <Link
              href="/login"
              className="px-6 py-3 rounded-md bg-white dark:bg-slate-700 border border-white/20 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-200 font-semibold text-sm transition-colors w-full sm:w-auto"
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700/60 pt-12 pb-8 px-4 lg:px-8 text-xs text-slate-600 dark:text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 pb-10 border-b border-slate-200 dark:border-slate-700/60">
          
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
              <span className="font-bold text-sm text-slate-900 dark:text-white">Genesis ERP</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              School management made simple. Comprehensive management system for K-12 school operations.
            </p>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Platform</div>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><a href="#features" className="hover:text-blue-700 dark:hover:text-blue-400">Features</a></li>
              <li><a href="#platform" className="hover:text-blue-700 dark:hover:text-blue-400">Dashboard Preview</a></li>
              <li><a href="#roles" className="hover:text-blue-700 dark:hover:text-blue-400">User Roles</a></li>
              <li><a href="#workflow" className="hover:text-blue-700 dark:hover:text-blue-400">Workflow Pipeline</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Solutions</div>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><span className="text-slate-500 dark:text-slate-500">Administration</span></li>
              <li><span className="text-slate-500 dark:text-slate-500">Academics & Timetable</span></li>
              <li><span className="text-slate-500 dark:text-slate-500">Daily Attendance</span></li>
              <li><span className="text-slate-500 dark:text-slate-500">Fees & Payroll</span></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">Account</div>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><Link href="/login" className="hover:text-blue-700 dark:hover:text-blue-400 font-semibold text-blue-700 dark:text-blue-400">Sign In</Link></li>
              <li><Link href="/login" className="hover:text-blue-700 dark:hover:text-blue-400">Portal Login</Link></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-500 dark:text-slate-500 gap-3">
          <div>
            © 2026 Genesis ERP. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span>K-12 School Management System</span>
          </div>
        </div>
      </footer>

    </div>
    </div>
  );
}
