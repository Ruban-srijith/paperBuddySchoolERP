"use client";

import { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FileSearch, Calendar, CheckSquare, BookOpen, FlaskConical, 
  Mail, LayoutDashboard, GraduationCap, Sparkles, Users,
  Building2, LogOut, Shield, ChevronDown, UserCheck, CreditCard, History,
  CheckCircle2, RefreshCw, Heart, DollarSign, Award, TrendingUp,
  Clock, Activity, FileSpreadsheet, LayoutGrid, FileCheck,
  CalendarDays, ClipboardList, FileText, HelpCircle, CalendarPlus,
  Megaphone, Trophy, DoorOpen, UsersRound, Menu, X,
  Receipt, Wallet, PieChart, Home, Utensils, Settings, AlertTriangle,
  BookCopy, Library, MonitorSmartphone, UserCircle, UserPlus, Sun, Moon, ShieldCheck, Bus, MapPin, Download
} from 'lucide-react';
import { useAuthStore, ROLE_LABELS, ROLE_COLORS, ROLE_NAV_ITEMS, UserRole } from '@/store/authStore';
import { ToastProvider } from '@/components/Toast';
import PageLoader from '@/components/PageLoader';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeLeftVariant = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: "spring" as any, stiffness: 100, damping: 20 } }
};

// Map nav item keys to their config
const NAV_CONFIG: Record<string, { href: string; label: string; icon: any; badge?: string; color: string }> = {
  superadmin_analytics: { href: '/superadmin?tab=analytics',       label: 'Global Analytics',           icon: Activity,        color: 'group-hover:text-fuchsia-400' },
  superadmin_colleges:  { href: '/superadmin?tab=colleges',        label: 'Manage Schools',             icon: Building2,       color: 'group-hover:text-fuchsia-400' },
  superadmin_admins:    { href: '/superadmin?tab=admins',          label: 'Manage Admins',              icon: Users,           color: 'group-hover:text-fuchsia-400' },
  superadmin_logs:      { href: '/superadmin?tab=logs',            label: 'Audit Ledgers',              icon: History,         color: 'group-hover:text-fuchsia-400' },
  superadmin_payments:  { href: '/superadmin?tab=payments',        label: 'Payments & Ledger',          icon: CreditCard,      color: 'group-hover:text-fuchsia-400' },
  superadmin_broadcasts: { href: '/superadmin?tab=broadcasts',      label: 'System Broadcasts',          icon: Megaphone,       color: 'group-hover:text-fuchsia-400' },
  superadmin_aiconfig:  { href: '/superadmin?tab=aiconfig',        label: 'AI Core Config',             icon: Sparkles,        color: 'group-hover:text-fuchsia-400' },
  superadmin_addschool: { href: '/superadmin?tab=addschool',       label: 'Add School Client',          icon: UserPlus,        color: 'group-hover:text-fuchsia-400' },
  dashboard:            { href: '/dashboard',                     label: 'Dashboard Overview',         icon: LayoutDashboard, color: 'group-hover:text-indigo-400' },
  student_documents:    { href: '/student/documents',            label: 'Profile Documents',         icon: ShieldCheck,     color: 'group-hover:text-sky-400', badge: 'AI' },
  admin_documents:      { href: '/admin/documents',              label: 'Document Audit Panel',      icon: ShieldCheck,     color: 'group-hover:text-indigo-400', badge: 'AI' },
  salary_approvals:     { href: '/salary-approvals',     label: 'Salary Approvals',          icon: DollarSign,      color: 'group-hover:text-emerald-400' },
  event_approvals:      { href: '/event-approvals',      label: 'Approve Major Events',      icon: Award,           color: 'group-hover:text-amber-400' },
  revenue:              { href: '/revenue',              label: 'Monthly Revenue',           icon: TrendingUp,      color: 'group-hover:text-cyan-400' },
  toppers:              { href: '/toppers',              label: 'Class Toppers List',        icon: Trophy,          color: 'group-hover:text-yellow-400' },
  assign_toppers:       { href: '/assign-toppers',       label: 'Assign Toppers',            icon: Award,           color: 'group-hover:text-fuchsia-400' },
  pending_approvals:    { href: '/pending-approvals',    label: 'Pending Approvals',         icon: Clock,           color: 'group-hover:text-amber-400' },
  workload:             { href: '/workload',             label: 'Teachers Workload',         icon: Activity,        color: 'group-hover:text-blue-400' },
  staff_management:     { href: '/staff-management',     label: 'Staff Management Hub',      icon: UsersRound,      color: 'group-hover:text-indigo-400' },
  reports:              { href: '/reports',              label: 'Reports & Analytics',       icon: FileSpreadsheet, color: 'group-hover:text-teal-400' },
  classroom_allocation: { href: '/classroom-allocation', label: 'Classroom Allocation',     icon: LayoutGrid,      color: 'group-hover:text-purple-400', badge: 'AI' },
  exams:                { href: '/exams',                label: 'Examination Center',        icon: FileCheck,       color: 'group-hover:text-rose-400' },
  calendar:             { href: '/calendar',             label: 'Academic Calendar',         icon: CalendarDays,    color: 'group-hover:text-indigo-400' },
  my_class:             { href: '/my-class',             label: 'My Class View',             icon: GraduationCap,   color: 'group-hover:text-cyan-400' },
  'class-fees':         { href: '/my-class/fees',        label: 'Class Fees',                icon: CreditCard,      color: 'group-hover:text-cyan-400' },
  'teacher-requests':   { href: '/my-class/requests',    label: 'Dept Fund Requests',        icon: FileText,        color: 'group-hover:text-emerald-400' },
  homework:             { href: '/homework',             label: 'Homework Tracker',          icon: ClipboardList,   color: 'group-hover:text-amber-400' },
  assignments:          { href: '/assignments',          label: 'Assignments',               icon: FileText,        color: 'group-hover:text-emerald-400' },
  doubts:               { href: '/doubts',               label: 'Doubts & Leave Approvals',  icon: HelpCircle,      color: 'group-hover:text-violet-400' },
  leave_apply:          { href: '/leave-apply',          label: 'Apply for Leave',           icon: CalendarPlus,    color: 'group-hover:text-rose-400' },
  announcements:        { href: '/announcements',        label: 'Class Announcements',       icon: Megaphone,       color: 'group-hover:text-yellow-400' },
  exam_schedule:        { href: '/exam-schedule',        label: 'Exam Schedule',             icon: FileCheck,       color: 'group-hover:text-indigo-400' },
  queries:              { href: '/queries',              label: 'Doubts & Leave Queries',    icon: HelpCircle,      color: 'group-hover:text-violet-400' },
  users:                { href: '/users',                label: 'User Management',           icon: Users,           color: 'group-hover:text-pink-400' },
  departments:          { href: '/departments',          label: 'Departments',               icon: Building2,       color: 'group-hover:text-teal-400' },
  class_roster:         { href: '/class-roster',         label: 'Class Roster & Assign',     icon: UsersRound,      color: 'group-hover:text-fuchsia-400' },
  classes:              { href: '/classes',              label: 'Manage Classes',            icon: Building2,       color: 'group-hover:text-pink-400' },
  class_allotments:     { href: '/class-allotments',     label: 'Class Teachers Allotments', icon: Users,           color: 'group-hover:text-amber-400' },
  timetable:            { href: '/timetable',            label: 'Timetable Grid',            icon: Calendar,        color: 'group-hover:text-indigo-400' },
  substitutions:        { href: '/substitutions',        label: 'Teacher Substitutions',     icon: RefreshCw,       color: 'group-hover:text-cyan-400' },
  attendance:           { href: '/attendance',           label: 'Attendance & Logs',         icon: CheckSquare,     color: 'group-hover:text-emerald-400' },
  portion:              { href: '/portion',              label: 'Smart Portion Tracker',     icon: BookOpen,        color: 'group-hover:text-amber-400' },
  labs:                 { href: '/labs',                 label: 'Lab Submissions',           icon: FlaskConical,    color: 'group-hover:text-purple-400' },
  emails:               { href: '/emails',               label: 'Email Intimations',         icon: Mail,            color: 'group-hover:text-rose-400' },
  mentorship:           { href: '/mentorship',           label: 'Mentorship System',         icon: UserCheck,       color: 'group-hover:text-violet-400' },
  fees:                 { href: '/fees',                 label: 'Fee Payment Portal',        icon: CreditCard,      color: 'group-hover:text-emerald-400' },
  approvals:            { href: '/approvals',            label: 'Leave Approvals',           icon: CheckCircle2,    color: 'group-hover:text-amber-400' },
  parent_portal:        { href: '/parent',               label: 'Parent Portal',             icon: Heart,           color: 'group-hover:text-pink-400' },
  expenses:             { href: '/finance/expenses',     label: 'Expenses & Procurement',    icon: Receipt,         color: 'group-hover:text-rose-400' },
  payroll:              { href: '/finance/payroll',      label: 'Staff Payroll',             icon: Wallet,          color: 'group-hover:text-teal-400' },
  finance_reports:      { href: '/finance/reports',      label: 'Financial Reports',         icon: PieChart,        color: 'group-hover:text-blue-400' },
  finance_approvals:    { href: '/finance/approvals',    label: 'Approval Center',           icon: CheckCircle2,    color: 'group-hover:text-emerald-400' },
  budgets:              { href: '/finance/budgets',      label: 'Department Budgets',        icon: PieChart,        color: 'group-hover:text-indigo-400' },
  vendors:              { href: '/finance/vendors',      label: 'Vendor Management',         icon: Building2,       color: 'group-hover:text-amber-400' },
  scholarships:         { href: '/finance/scholarships', label: 'Financial Aid',             icon: GraduationCap,   color: 'group-hover:text-violet-400' },
  'fee-config':         { href: '/finance/fee-config',   label: 'Fee Configurator',          icon: Settings,        color: 'group-hover:text-amber-400' },
  hostel_rooms:         { href: '/warden/rooms',         label: 'Room Allocation',           icon: Home,            color: 'group-hover:text-amber-400' },
  outpasses:            { href: '/warden/outpasses',     label: 'Outpass System',            icon: LogOut,          color: 'group-hover:text-rose-400' },
  hostel_attendance:    { href: '/warden/attendance',    label: 'Hostel Roll Call',          icon: Users,           color: 'group-hover:text-emerald-400' },
  mess:                 { href: '/warden/mess',          label: 'Mess & Cafeteria',          icon: Utensils,        color: 'group-hover:text-orange-400' },
  'warden-finance':     { href: '/warden/finance',       label: 'Funding Requests',          icon: Building2,       color: 'group-hover:text-cyan-400' },
  warden_incidents:     { href: '/warden/incidents',     label: 'Incident Reports',          icon: AlertTriangle,   color: 'group-hover:text-rose-400' },
  warden_visitors:      { href: '/warden/visitors',      label: 'Visitor Logbook',           icon: Users,           color: 'group-hover:text-cyan-400' },
  student_hostel:       { href: '/student/hostel',       label: 'Hostel Services',           icon: Home,            color: 'group-hover:text-indigo-400' },
  librarian_dashboard:  { href: '/librarian',            label: 'Library Dashboard',         icon: LayoutDashboard, color: 'group-hover:text-sky-400' },
  librarian_inventory:  { href: '/librarian/inventory',  label: 'Book Inventory',            icon: BookCopy,        color: 'group-hover:text-indigo-400' },
  librarian_issues:     { href: '/librarian/issues',     label: 'Issue & Returns',           icon: CheckSquare,     color: 'group-hover:text-emerald-400' },
  librarian_digital:    { href: '/librarian/digital',    label: 'Digital Library',           icon: MonitorSmartphone,color: 'group-hover:text-violet-400' },
  librarian_requests:   { href: '/librarian/requests',   label: 'Book Requests',             icon: FileSearch,      color: 'group-hover:text-pink-400' },
  student_library:      { href: '/student/library',      label: 'Digital Library',           icon: Library,         color: 'group-hover:text-sky-400' },
  teacher_library:      { href: '/teacher/library',      label: 'Library & Resources',       icon: Library,         color: 'group-hover:text-sky-400' },
  transport_dashboard:  { href: '/transport/dashboard',  label: 'Transport Overview',        icon: LayoutDashboard, color: 'group-hover:text-blue-400' },
  transport_fleet:      { href: '/transport/fleet',      label: 'Fleet Management',          icon: Bus,             color: 'group-hover:text-indigo-400' },
  transport_routes:     { href: '/transport/routes',     label: 'Routes & Stops',            icon: MapPin,          color: 'group-hover:text-emerald-400' },
  transport_staff:      { href: '/transport/staff',      label: 'Transport Staff',           icon: Users,           color: 'group-hover:text-amber-400' },
  transport_allocations:{ href: '/transport/allocations',label: 'Student Allocations',       icon: UserPlus,        color: 'group-hover:text-fuchsia-400' },
};

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Hardware-accelerated native smooth scroll is applied via CSS

  useEffect(() => {
    checkAuth();
    setHasChecked(true);
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    }
  }, [checkAuth]);

  useEffect(() => {
    if (hasChecked && pathname !== '/login' && pathname !== '/' && pathname !== '/register' && !isAuthenticated) {
      router.replace('/login');
    }
  }, [pathname, isAuthenticated, hasChecked, router]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });
    // Check if already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pb_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pb_theme', 'light');
    }
  };

  // Don't show shell on public pages
  if (pathname === '/login' || pathname === '/' || pathname === '/register') {
    return <>{children}</>;
  }

  // If not authenticated and not on login, redirect immediately
  if (!hasChecked || !isAuthenticated || !user) {
    return <PageLoader />;
  }

  const navItems = ROLE_NAV_ITEMS[user.role] || ['dashboard'];
  const roleLabel = ROLE_LABELS[user.role];
  const roleColor = ROLE_COLORS[user.role];

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#EEF2F6] dark:bg-[#0b0f19] text-[#131313] dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="h-16 flex-none bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-3 sm:px-5 flex items-center justify-between z-50">
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setShowMobileMenu(true)}
            className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Genesis ERP Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-blue-900 dark:text-blue-400">Genesis ERP</span>
            </div>
          </Link>
        </div>

        {/* Header Center Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <FileSearch className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Search students, teachers, classes..." 
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {/* Academic Year Selector */}
          <div className="hidden sm:flex items-center text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
            <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
            <span>2026–27</span>
          </div>

          {/* Notifications Icon */}
          <button 
            aria-label="Notifications"
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            <Megaphone className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
          </button>

          {/* PWA Download App Button */}
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
                  alert("To install the app, look for the install icon in your browser's address bar, or use 'Add to Home Screen' in your browser menu.");
                }
              }}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 text-white font-medium text-xs hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download App</span>
            </button>
          )}

          {/* Dark Mode Switch */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2.5 pl-3 border-l border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md px-2 py-1 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center overflow-hidden shrink-0">
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'
                )}
              </div>
              <div className="text-left hidden md:block leading-tight">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{user.full_name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{roleLabel}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 shadow-lg z-50 overflow-hidden">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">{user.full_name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-semibold border border-blue-100 dark:border-blue-800">
                        {roleLabel}
                      </span>
                      {user.assigned_grade && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                          Grade {user.assigned_grade}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-1.5">
                    <Link 
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <UserCircle className="w-4 h-4 text-slate-500" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay Backdrop */}
        {showMobileMenu && (
          <div 
            className="absolute inset-0 bg-slate-900/50 z-40 lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          ></div>
        )}

        {/* Left Sidebar — Clean Enterprise Design */}
        <aside className={`absolute lg:relative z-40 lg:z-10 w-60 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-3 flex flex-col justify-between overflow-y-auto transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {roleLabel} Navigation
              </div>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="lg:hidden p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="space-y-0.5">
              {navItems.map((key) => {
                const config = NAV_CONFIG[key];
                if (!config) return null;
                const isActive = pathname === config.href;
                const Icon = config.icon;
                return (
                  <Link
                    key={key}
                    href={config.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold border-l-4 border-blue-600' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="truncate">{config.label}</span>
                    {config.badge && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold border border-slate-200 dark:border-slate-700">
                        {config.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Role Scope Footer Badge */}
          <div className="p-3 mt-4 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <div className="flex items-center space-x-1.5 text-blue-700 dark:text-blue-400 font-semibold text-[11px]">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>{roleLabel} Mode</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              {user.assigned_grade ? `Assigned Scope: Grade ${user.assigned_grade}` : 'Full School Operational Scope'}
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full p-4 md:p-6 overflow-y-auto scroll-smooth bg-[#f7f8fa] dark:bg-[#0b0f19]">
          <div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#EEF2F6' }}>
        <div className="w-12 h-12 rounded-full border-4 border-brand-blue/30 border-t-brand-blue animate-spin"></div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
