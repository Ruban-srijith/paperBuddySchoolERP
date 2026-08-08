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
  BookCopy, Library, MonitorSmartphone, UserCircle, UserPlus, Bus, MapPin
} from 'lucide-react';
import { useAuthStore, ROLE_LABELS, ROLE_COLORS, ROLE_NAV_ITEMS, UserRole } from '@/store/authStore';
import { ToastProvider } from '@/components/Toast';

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
  salary_approvals:     { href: '/salary-approvals',     label: 'Salary Approvals',          icon: DollarSign,      color: 'group-hover:text-emerald-400' },
  event_approvals:      { href: '/event-approvals',      label: 'Approve Major Events',      icon: Award,           color: 'group-hover:text-amber-400' },
  revenue:              { href: '/revenue',              label: 'Monthly Revenue',           icon: TrendingUp,      color: 'group-hover:text-cyan-400' },
  toppers:              { href: '/toppers',              label: 'Class Toppers List',        icon: Trophy,          color: 'group-hover:text-yellow-400' },
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
  ocr:                  { href: '/ocr',                  label: 'Ensemble OCR Parser',       icon: FileSearch,      color: 'group-hover:text-cyan-400',   badge: 'AI' },
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

  useEffect(() => {
    checkAuth();
    setHasChecked(true);
  }, [checkAuth]);

  useEffect(() => {
    if (hasChecked && pathname !== '/login' && pathname !== '/' && !isAuthenticated) {
      router.push('/login');
    }
  }, [pathname, isAuthenticated, hasChecked, router]);

  // Don't show shell on login page or landing page
  if (pathname === '/login' || pathname === '/') {
    return <>{children}</>;
  }

  // If not authenticated and not on login, show brief loading while redirecting
  if (!hasChecked || (!isAuthenticated || !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#EEF2F6' }}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-blue/30 border-t-brand-blue animate-spin mx-auto"></div>
          <p className="text-gray-500 text-sm">Loading application...</p>
        </div>
      </div>
    );
  }

  const navItems = ROLE_NAV_ITEMS[user.role] || ['dashboard'];
  const roleLabel = ROLE_LABELS[user.role];
  const roleColor = ROLE_COLORS[user.role];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#EEF2F6', color: '#131313' }}>
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMobileMenu(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-brand-black transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/" className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center flex-shrink-0">
              <img src="/logo.png" alt="PaperBuddy Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col justify-center whitespace-nowrap">
              <span className="font-bold text-base sm:text-lg md:text-xl tracking-tight text-brand-blue">PaperBuddy</span>
              <span className="hidden md:inline-flex mt-0.5 text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue font-medium w-fit">
                v2.5 Multi-Role
              </span>
            </div>
            </Link>
          </motion.div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden lg:flex items-center space-x-2 text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100 whitespace-nowrap font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>FastAPI & Live Engine Active</span>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 pl-4 border-l border-gray-200 hover:bg-gray-50 rounded-lg px-3 py-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${roleColor} flex items-center justify-center text-white font-semibold text-xs shadow-md overflow-hidden`}>
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'
                )}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-brand-black">{user.full_name}</p>
                <div className="flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-brand-blue" />
                  <p className="text-[10px] text-gray-500 font-medium">{roleLabel}</p>
                  {user.assigned_grade && (
                    <span className="text-[10px] text-brand-blue ml-1 font-medium">• Grade {user.assigned_grade}</span>
                  )}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </motion.button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-[24px] border border-gray-100 shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-semibold text-sm text-brand-black">{user.full_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r ${roleColor} text-white font-medium`}>
                        {roleLabel}
                      </span>
                      {user.assigned_grade && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-blue font-medium">
                          Grade {user.assigned_grade}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-2">
                    <Link 
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-brand-black transition-colors"
                    >
                      <UserCircle className="w-4 h-4" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
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

      <div className="flex flex-1 relative">
        {/* Mobile Sidebar Overlay Backdrop */}
        {showMobileMenu && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          ></div>
        )}

        {/* Left Sidebar — Dynamic by Role */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 p-4 flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto lg:max-h-[calc(100vh-4rem)] ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="space-y-6">
            <div className="flex items-center justify-between px-3">
              <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                {roleLabel} Menu
              </div>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="lg:hidden p-1 rounded-md text-gray-400 hover:text-brand-black hover:bg-gray-100"
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
                          : 'text-gray-500 hover:text-brand-blue hover:bg-brand-blue/5'
                        }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeSidebarTab"
                          className="absolute inset-0 bg-brand-blue rounded-full shadow-md"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                          style={{ zIndex: -1 }}
                        />
                      )}
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : `text-gray-400 group-hover:text-brand-blue`}`} />
                      <span>{config.label}</span>
                      {config.badge && (
                        <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full bg-white text-brand-blue font-bold shadow-sm">
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
          <div className="p-4 mt-6 bg-gray-50 rounded-[24px] border border-gray-100 text-xs space-y-2">
            <div className="flex items-center space-x-2 text-brand-blue font-semibold">
              <Shield className="w-4 h-4 text-brand-blue" />
              <span>Multi-Role RBAC</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
              Logged in as <span className="text-brand-blue font-bold">{roleLabel}</span>.
              {user.assigned_grade ? ` Grade ${user.assigned_grade} scope.` : ' Operational scope active.'}
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
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
