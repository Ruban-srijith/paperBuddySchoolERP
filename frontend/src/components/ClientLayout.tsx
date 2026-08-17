"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FileSearch, Calendar, CheckSquare, BookOpen, FlaskConical, 
  Mail, LayoutDashboard, GraduationCap, Sparkles, Users,
  Building2, LogOut, Shield, ChevronDown, UserCheck, CreditCard,
  CheckCircle2, RefreshCw, Heart, DollarSign, Award, TrendingUp,
  Clock, Activity, FileSpreadsheet, LayoutGrid, FileCheck,
  CalendarDays, ClipboardList, FileText, HelpCircle, CalendarPlus,
  Megaphone, Trophy, DoorOpen, UsersRound, Menu, X,
  Receipt, Wallet, PieChart, Home, Utensils, Settings, AlertTriangle,
  BookCopy, Library, MonitorSmartphone, UserCircle, UserPlus, Sun, Moon, ShieldCheck, Bus, MapPin
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
  dashboard:            { href: '/dashboard',                     label: 'Dashboard Overview',         icon: LayoutDashboard, color: 'group-hover:text-indigo-400' },
  scans:                { href: '/scans',                         label: 'Universal OCR Scanner',      icon: FileSearch,      color: 'group-hover:text-amber-400', badge: 'OCR' },
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
      window.location.replace('/login');
    }
  }, [pathname, isAuthenticated, hasChecked]);

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
    window.location.href = '/login';
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#EEF2F6] dark:bg-[#0b0f19] text-[#131313] dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="h-16 flex-none bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800/80 shadow-sm px-4 md:px-6 flex items-center justify-between transition-colors duration-200 z-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMobileMenu(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-brand-black dark:hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/" className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center flex-shrink-0">
              <img src="/logo.png" alt="Genesis ERP Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col justify-center whitespace-nowrap">
              <span className="font-bold text-base sm:text-lg md:text-xl tracking-tight text-brand-blue dark:text-blue-400">Genesis ERP</span>
              <span className="hidden md:inline-flex mt-0.5 text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-brand-blue/10 dark:bg-blue-500/20 text-brand-blue dark:text-blue-400 font-medium w-fit">
                v2.5 Multi-Role
              </span>
            </div>
            </Link>
          </motion.div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Dark Mode Switch */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            aria-label="Toggle Dark Mode"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            className="relative flex items-center justify-between w-14 h-8 p-1 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 shadow-inner group"
          >
            <Sun className={`w-3.5 h-3.5 ml-1 text-amber-500 transition-opacity duration-200 ${theme === 'dark' ? 'opacity-40' : 'opacity-100'}`} />
            <Moon className={`w-3.5 h-3.5 mr-1 text-indigo-400 transition-opacity duration-200 ${theme === 'dark' ? 'opacity-100' : 'opacity-40'}`} />
            <motion.div
              className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 shadow-md flex items-center justify-center border border-slate-200 dark:border-slate-700"
              animate={{ x: theme === 'dark' ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {theme === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              )}
            </motion.div>
          </motion.button>

          <div className="hidden lg:flex items-center space-x-2 text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/50 whitespace-nowrap font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>FastAPI & Live Engine Active</span>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/60 rounded-lg px-3 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${roleColor} flex items-center justify-center text-white font-semibold text-xs shadow-md overflow-hidden`}>
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'
                )}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-brand-black dark:text-slate-100">{user.full_name}</p>
                <div className="flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-brand-blue dark:text-blue-400" />
                  <p className="text-[10px] text-gray-500 dark:text-slate-400 font-medium">{roleLabel}</p>
                  {user.assigned_grade && (
                    <span className="text-[10px] text-brand-blue dark:text-blue-400 ml-1 font-medium">• Grade {user.assigned_grade}</span>
                  )}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
            </motion.button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-[24px] border border-gray-100 dark:border-slate-800 shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-slate-800">
                    <p className="font-semibold text-sm text-brand-black dark:text-slate-100">{user.full_name}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{user.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r ${roleColor} text-white font-medium`}>
                        {roleLabel}
                      </span>
                      {user.assigned_grade && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-blue/10 dark:bg-blue-500/20 text-brand-blue dark:text-blue-400 font-medium">
                          Grade {user.assigned_grade}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-2">
                    <Link 
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-brand-black dark:hover:text-white transition-colors"
                    >
                      <UserCircle className="w-4 h-4" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          ></div>
        )}

        {/* Left Sidebar — Dynamic by Role */}
        <aside className={`absolute lg:relative z-40 lg:z-10 w-64 h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 p-4 flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="space-y-6">
            <div className="flex items-center justify-between px-3">
              <div className="text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                {roleLabel} Menu
              </div>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="lg:hidden p-1 rounded-md text-gray-400 dark:text-slate-500 hover:text-brand-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <motion.nav 
              className="space-y-1 relative"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {navItems.map((key) => {
                const config = NAV_CONFIG[key];
                if (!config) return null;
                const isActive = pathname === config.href;
                const Icon = config.icon;
                return (
                  <motion.div 
                    key={key} 
                    variants={fadeLeftVariant}
                    whileHover={{ x: 6 }} 
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Link
                      href={config.href}
                      onClick={() => setShowMobileMenu(false)}
                      className={`relative z-10 flex items-center space-x-3 px-4 py-3 rounded-full text-sm font-medium transition-colors group
                        ${isActive 
                          ? 'text-white' 
                          : 'text-gray-500 dark:text-slate-400 hover:text-brand-blue dark:hover:text-blue-400 hover:bg-brand-blue/5 dark:hover:bg-slate-800/60'
                        }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeSidebarTab"
                          className="absolute inset-0 bg-brand-blue dark:bg-blue-600 rounded-full shadow-md"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          style={{ zIndex: -1 }}
                        />
                      )}
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : `text-gray-400 dark:text-slate-500 group-hover:text-brand-blue dark:group-hover:text-blue-400`}`} />
                      <span>{config.label}</span>
                      {config.badge && (
                        <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-brand-blue dark:text-blue-400 font-bold shadow-sm border border-transparent dark:border-slate-700">
                          {config.badge}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>
          </div>

          {/* Role Info Card */}
          <div className="p-4 mt-6 bg-gray-50 dark:bg-slate-800/50 rounded-[24px] border border-gray-100 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-brand-blue dark:text-blue-400 font-semibold">
              <Shield className="w-4 h-4 text-brand-blue dark:text-blue-400" />
              <span>Multi-Role RBAC</span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-relaxed font-medium">
              Logged in as <span className="text-brand-blue dark:text-blue-400 font-bold">{roleLabel}</span>.
              {user.assigned_grade ? ` Grade ${user.assigned_grade} scope.` : ' Operational scope active.'}
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full p-4 md:p-6 overflow-y-auto">
          {children}
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
