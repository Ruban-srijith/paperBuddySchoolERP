"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileSearch, Calendar, CheckSquare, BookOpen, FlaskConical, 
  Mail, LayoutDashboard, GraduationCap, Sparkles, Users,
  Building2, LogOut, Shield, ChevronDown, UserCheck, CreditCard,
  CheckCircle2, RefreshCw, Heart, DollarSign, Award, TrendingUp,
  Clock, Activity, FileSpreadsheet, LayoutGrid, FileCheck,
  CalendarDays, ClipboardList, FileText, HelpCircle, CalendarPlus,
  Megaphone, Trophy, DoorOpen, UsersRound, Menu, X,
  Receipt, Wallet, PieChart, Home, Utensils, Settings, AlertTriangle,
  BookCopy, Library, MonitorSmartphone, UserCircle
} from 'lucide-react';
import { useAuthStore, ROLE_LABELS, ROLE_COLORS, ROLE_NAV_ITEMS, UserRole } from '@/store/authStore';
import { ToastProvider } from '@/components/Toast';

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#090d16' }}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mx-auto"></div>
          <p className="text-gray-400 text-sm">Loading application...</p>
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
    <div className="min-h-screen flex flex-col" style={{ background: '#090d16', color: '#f3f4f6' }}>
      {/* Top Navbar */}
      <header className="h-16 glass-panel border-b border-gray-800/60 sticky top-0 z-40 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMobileMenu(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="flex flex-col justify-center whitespace-nowrap">
              <span className="font-bold text-base sm:text-lg md:text-xl tracking-tight gradient-text">PaperBuddy</span>
              <span className="hidden md:inline-flex mt-0.5 text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 w-fit">
                v2.5 Multi-Role
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden lg:flex items-center space-x-2 text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/30 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>FastAPI & Live Engine Active</span>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 pl-4 border-l border-gray-800 hover:bg-gray-800/30 rounded-lg px-3 py-1.5 transition-colors"
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${roleColor} flex items-center justify-center text-white font-semibold text-xs shadow-lg`}>
                {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-gray-200">{user.full_name}</p>
                <div className="flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-indigo-400" />
                  <p className="text-[10px] text-gray-400">{roleLabel}</p>
                  {user.assigned_grade && (
                    <span className="text-[10px] text-cyan-400 ml-1">• Grade {user.assigned_grade}</span>
                  )}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#090d16] bg-opacity-95 backdrop-blur-2xl rounded-xl border border-gray-700/60 shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-800/60">
                    <p className="font-semibold text-sm text-white">{user.full_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r ${roleColor} text-white font-medium`}>
                        {roleLabel}
                      </span>
                      {user.assigned_grade && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Grade {user.assigned_grade}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-2">
                    <Link 
                      href="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors"
                    >
                      <UserCircle className="w-4 h-4" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
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
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass-panel border-r border-gray-800/60 p-4 flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto lg:max-h-[calc(100vh-4rem)] ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="space-y-6">
            <div className="flex items-center justify-between px-3">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                {roleLabel} Menu
              </div>
              <button 
                onClick={() => setShowMobileMenu(false)}
                className="lg:hidden p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <nav className="space-y-1">
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
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group
                      ${isActive 
                        ? 'text-white bg-indigo-600/20 border border-indigo-500/30 shadow-sm' 
                        : 'text-gray-300 hover:text-white hover:bg-indigo-600/15'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : `text-gray-400 ${config.color}`}`} />
                    <span>{config.label}</span>
                    {config.badge && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                        {config.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Role Info Card */}
          <div className="p-3 mt-6 glass-panel-glow rounded-xl text-xs space-y-2">
            <div className="flex items-center space-x-2 text-indigo-300 font-semibold">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Multi-Role RBAC</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Logged in as <span className="text-indigo-300 font-medium">{roleLabel}</span>.
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#090d16' }}>
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
