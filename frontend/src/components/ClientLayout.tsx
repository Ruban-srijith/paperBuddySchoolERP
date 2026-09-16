"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileSearch, Calendar, CheckSquare, BookOpen, FlaskConical, 
  Mail, LayoutDashboard, GraduationCap, Sparkles, Users,
  Building2, LogOut, Shield, ChevronDown, UserCheck, CreditCard, History,
  CheckCircle2, RefreshCw, Heart, DollarSign, Award, TrendingUp,
  Clock, Activity, FileSpreadsheet, LayoutGrid, FileCheck,
  CalendarDays, ClipboardList, FileText, HelpCircle, CalendarPlus,
  Megaphone, Trophy, DoorOpen, UsersRound, Menu, X,
  Receipt, Wallet, PieChart, Home, Utensils, Settings, AlertTriangle,
  BookCopy, Library, MonitorSmartphone, ShieldCheck, Bus, MapPin, Download,
  Search, Bell, Flame, User
} from 'lucide-react';
import { useAuthStore, ROLE_LABELS, ROLE_COLORS, ROLE_NAV_ITEMS, UserRole } from '@/store/authStore';
import { ToastProvider } from '@/components/Toast';
import PageLoader from '@/components/PageLoader';
import dynamic from 'next/dynamic';

const BackgroundWallpaper = dynamic(() => import('@/components/BackgroundWallpaper'), { 
  ssr: false 
});
import CommandPalette from '@/components/CommandPalette';
import InstallPWA from '@/components/InstallPWA';

// Map nav item keys to their config
const NAV_CONFIG: Record<string, { href: string; label: string; icon: any; badge?: string }> = {
  superadmin_analytics: { href: '/superadmin?tab=analytics',       label: 'Global Analytics',           icon: Activity },
  superadmin_colleges:  { href: '/superadmin?tab=colleges',        label: 'Manage Schools',             icon: Building2 },
  superadmin_admins:    { href: '/superadmin?tab=admins',          label: 'Manage Admins',              icon: Users },
  superadmin_logs:      { href: '/superadmin?tab=logs',            label: 'Audit Ledgers',              icon: History },
  superadmin_payments:  { href: '/superadmin?tab=payments',        label: 'Payments & Ledger',          icon: CreditCard },
  superadmin_broadcasts: { href: '/superadmin?tab=broadcasts',      label: 'System Broadcasts',          icon: Megaphone },
  superadmin_aiconfig:  { href: '/superadmin?tab=aiconfig',        label: 'AI Core Config',             icon: Sparkles },
  superadmin_addschool: { href: '/superadmin?tab=addschool',       label: 'Add School Client',          icon: Users },
  dashboard:            { href: '/dashboard',                     label: 'Dashboard',                  icon: LayoutDashboard },
  student_documents:    { href: '/student/documents',            label: 'Student Records',            icon: UsersRound, badge: 'AI' },
  admin_documents:      { href: '/admin/documents',              label: 'Document Audit',             icon: ShieldCheck, badge: 'AI' },
  salary_approvals:     { href: '/salary-approvals',     label: 'Salary Approvals',          icon: DollarSign },
  event_approvals:      { href: '/event-approvals',      label: 'Approve Major Events',      icon: Award },
  revenue:              { href: '/revenue',              label: 'Monthly Revenue',           icon: TrendingUp },
  toppers:              { href: '/toppers',              label: 'Class Toppers List',        icon: Trophy },
  assign_toppers:       { href: '/assign-toppers',       label: 'Assign Toppers',            icon: Award },
  pending_approvals:    { href: '/pending-approvals',    label: 'Pending Approvals',         icon: Clock },
  workload:             { href: '/workload',             label: 'Teachers Workload',         icon: Activity },
  staff_management:     { href: '/staff-management',     label: 'Staff Management',          icon: UsersRound },
  reports:              { href: '/reports',              label: 'Reports & Analytics',       icon: FileSpreadsheet },
  classroom_allocation: { href: '/classroom-allocation', label: 'Classroom Allocation',     icon: LayoutGrid, badge: 'AI' },
  exams:                { href: '/exams',                label: 'Examination Center',        icon: FileCheck },
  calendar:             { href: '/calendar',             label: 'Academic Calendar',         icon: CalendarDays },
  my_class:             { href: '/my-class',             label: 'Academics View',            icon: GraduationCap },
  'class-fees':         { href: '/my-class/fees',        label: 'Class Fees',                icon: CreditCard },
  'teacher-requests':   { href: '/my-class/requests',    label: 'Dept Fund Requests',        icon: FileText },
  homework:             { href: '/homework',             label: 'Homework Tracker',          icon: ClipboardList },
  assignments:          { href: '/assignments',          label: 'Assignments',               icon: FileText },
  doubts:               { href: '/doubts',               label: 'Doubts & Approvals',        icon: HelpCircle },
  leave_apply:          { href: '/leave-apply',          label: 'Apply for Leave',           icon: CalendarPlus },
  announcements:        { href: '/announcements',        label: 'Class Announcements',       icon: Megaphone },
  exam_schedule:        { href: '/exam-schedule',        label: 'Exam Schedule',             icon: FileCheck },
  queries:              { href: '/queries',              label: 'Communications',            icon: Mail },
  users:                { href: '/users',                label: 'User Management',           icon: Users },
  departments:          { href: '/departments',          label: 'Departments',               icon: Building2 },
  class_roster:         { href: '/class-roster',         label: 'Class Roster',              icon: UsersRound },
  classes:              { href: '/classes',              label: 'Manage Classes',            icon: Building2 },
  assign_students:      { href: '/class-allotments',     label: 'Assign Students',           icon: Users },
  class_allotments:     { href: '/class-allotments',     label: 'Class Allotments',          icon: Users },
  timetable:            { href: '/timetable',            label: 'Timetable Grid',            icon: Calendar },
  substitutions:        { href: '/substitutions',        label: 'Teacher Substitutions',     icon: RefreshCw },
  attendance:           { href: '/attendance',           label: 'Attendance',                icon: CheckSquare },
  portion:              { href: '/portion',              label: 'Portion Tracker',           icon: BookOpen },
  labs:                 { href: '/labs',                 label: 'Lab Submissions',           icon: FlaskConical },
  emails:               { href: '/emails',               label: 'Communications',            icon: Mail },
  mentorship:           { href: '/mentorship',           label: 'Mentorship System',         icon: UserCheck },
  fees:                 { href: '/fees',                 label: 'Fee Payment Portal',        icon: CreditCard },
  approvals:            { href: '/pending-approvals',    label: 'Pending Approvals',         icon: CheckCircle2 },
  parent_portal:        { href: '/parent',               label: 'Parent Portal',             icon: Heart },
  teacher_leave:        { href: '/leave-apply',          label: 'Apply for Leave',           icon: CalendarPlus },
  student_settings:     { href: '/profile',              label: 'Account Profile',           icon: Settings },
  finance_dashboard:    { href: '/finance',              label: 'Finance Dashboard',         icon: LayoutDashboard },
  expenses:             { href: '/finance/expenses',     label: 'Expenses',                  icon: Receipt },
  payroll:              { href: '/finance/payroll',      label: 'Staff Payroll',             icon: Wallet },
  finance_reports:      { href: '/finance/reports',      label: 'Financial Reports',         icon: PieChart },
  finance_approvals:    { href: '/finance/approvals',    label: 'Approval Center',           icon: CheckCircle2 },
  budgets:              { href: '/finance/budgets',      label: 'Department Budgets',        icon: PieChart },
  vendors:              { href: '/finance/vendors',      label: 'Vendor Management',         icon: Building2 },
  scholarships:         { href: '/finance/scholarships', label: 'Financial Aid',             icon: GraduationCap },
  'fee-config':         { href: '/finance/fee-config',   label: 'Fee Configurator',          icon: Settings },
  warden_dashboard:     { href: '/warden',               label: 'Hostel Dashboard',          icon: LayoutDashboard },
  hostel_rooms:         { href: '/warden/rooms',         label: 'Room Allocation',           icon: Home },
  outpasses:            { href: '/warden/outpasses',     label: 'Outpass System',            icon: LogOut },
  hostel_attendance:    { href: '/warden/attendance',    label: 'Hostel Roll Call',          icon: Users },
  mess:                 { href: '/warden/mess',          label: 'Mess & Cafeteria',          icon: Utensils },
  'warden-finance':     { href: '/warden/finance',       label: 'Funding Requests',          icon: Building2 },
  warden_incidents:     { href: '/warden/incidents',     label: 'Incident Reports',          icon: AlertTriangle },
  warden_visitors:      { href: '/warden/visitors',      label: 'Visitor Logbook',           icon: Users },
  student_hostel:       { href: '/student/hostel',       label: 'Hostel Services',           icon: Home },
  librarian_dashboard:  { href: '/librarian',            label: 'Library Dashboard',         icon: LayoutDashboard },
  librarian_inventory:  { href: '/librarian/inventory',  label: 'Book Inventory',            icon: BookCopy },
  librarian_issues:     { href: '/librarian/issues',     label: 'Issue & Returns',           icon: CheckSquare },
  librarian_digital:    { href: '/librarian/digital',    label: 'Digital Library',           icon: MonitorSmartphone },
  librarian_requests:   { href: '/librarian/requests',   label: 'Book Requests',             icon: FileSearch },
  student_library:      { href: '/student/library',      label: 'Digital Library',           icon: Library },
  teacher_library:      { href: '/teacher/library',      label: 'Library & Resources',       icon: Library },
  transport_dashboard:  { href: '/transport/dashboard',  label: 'Transport Overview',        icon: LayoutDashboard },
  transport_fleet:      { href: '/transport/fleet',      label: 'Fleet Management',          icon: Bus },
  transport_routes:     { href: '/transport/routes',     label: 'Routes & Stops',            icon: MapPin },
  transport_staff:      { href: '/transport/staff',      label: 'Transport Staff',           icon: Users },
  transport_allocations:{ href: '/transport/allocations',label: 'Student Allocations',       icon: Users },
};

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [hasChecked, setHasChecked] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('pb_token');
    }
    return false;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  useEffect(() => {
    checkAuth();
    setHasChecked(true);
  }, [checkAuth]);

  useEffect(() => {
    if (hasChecked && pathname !== '/login' && pathname !== '/' && pathname !== '/register' && !isAuthenticated) {
      router.replace('/login');
    }
  }, [pathname, isAuthenticated, hasChecked, router]);

  // ⚠️ All hooks MUST be before any early returns (Rules of Hooks)
  const navItems = useMemo(() => ROLE_NAV_ITEMS[user?.role || 'student'] || ['dashboard'], [user?.role]);
  const roleLabel = useMemo(() => ROLE_LABELS[user?.role || 'student'], [user?.role]);

  const handleLogout = useCallback(() => {
    logout();
    router.replace('/login');
  }, [logout, router]);

  const openMobileMenu = useCallback(() => setShowMobileMenu(true), []);
  const closeMobileMenu = useCallback(() => setShowMobileMenu(false), []);
  const toggleUserDropdown = useCallback(() => setShowUserDropdown(v => !v), []);

  if (pathname === '/login' || pathname === '/' || pathname === '/register') {
    return <>{children}</>;
  }

  if (!hasChecked || !isAuthenticated || !user) {
    return <PageLoader />;
  }

  return (
    <div className="h-[100dvh] w-full max-w-full overflow-hidden flex flex-col relative bg-[#14251c] text-[#f4f0e6]">
      {/* Background Architectural & Line-Art Wallpaper Designs */}
      <BackgroundWallpaper />

      {/* Global Interactive Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* Main Brutalist Concrete Frame Chassis */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0 h-full max-w-[1720px] w-full mx-auto p-1 sm:p-2.5 md:p-4 overflow-hidden">
        <div className="flex-1 flex flex-col lg:flex-row brutal-concrete-chassis overflow-hidden relative min-h-0 w-full max-w-full">
          
          {/* Mobile Sidebar Overlay */}
          {showMobileMenu && (
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={closeMobileMenu}
            />
          )}

          {/* SIDEBAR - BRUTALIST CONCRETE RIM & GLASS CREST MOUNT */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] lg:static lg:w-[245px] h-full brutal-stone-sidebar p-2.5 sm:p-3 flex flex-col justify-between overflow-x-clip overflow-y-hidden transform transition-transform duration-200 ease-out lg:translate-x-0 ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex-1 flex flex-col space-y-2 overflow-x-clip overflow-y-hidden min-h-0 w-full max-w-full">
              
              {/* Shield & Torch Crest Emblem inside Carved Concrete Mount (Reference Top Left Badge) */}
              <div className="flex-none flex flex-col items-center justify-center pt-1 pb-2 border-b border-[#e5c158]/20 relative">
                <Link href="/" className="flex flex-col items-center text-center group">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#243a2c] to-[#122218] border-2 border-[#e5c158]/50 flex items-center justify-center shadow-[0_8px_25px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.3)] mb-1.5 relative overflow-hidden group-hover:border-[#e5c158] transition-colors">
                    {/* Torch & Shield Icon Emblem */}
                    <div className="relative z-10 flex items-center justify-center text-[#e5c158]">
                      <Shield className="w-8 h-8 stroke-[1.6]" />
                      <Flame className="w-3.5 h-3.5 absolute text-[#fff] fill-[#e5c158]" />
                    </div>
                  </div>
                  <span className="font-extrabold text-xs tracking-tight text-[#f4f0e6] font-syne group-hover:text-[#e5c158] transition-colors">PaperBuddy ERP</span>
                  <span className="text-[9px] text-[#a3c9b0] tracking-widest uppercase font-semibold">School Operations</span>
                </Link>

                <button 
                  onClick={closeMobileMenu}
                  className="lg:hidden absolute top-3 right-3 p-2 rounded-lg text-[#b5ad9b] hover:text-white touch-target"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links Container with Sleek Custom Y-Axis Scrollbar */}
              <div className="flex-1 min-h-0 rounded-2xl sidebar-glass-nav flex flex-col relative overflow-hidden border border-[#e5c158]/35 shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
                <nav 
                  data-lenis-prevent="true"
                  className="flex-1 min-h-0 overflow-y-auto overflow-x-clip custom-sidebar-scroll space-y-1.5 p-2 pr-2.5 relative w-full min-w-0 max-w-full"
                >
                  {/* Vertical Y-Axis Guide Line with Gold Accents */}
                  <div className="absolute left-2.5 top-3 bottom-3 w-[1.5px] bg-gradient-to-b from-[#e5c158]/50 via-[#43634e]/30 to-transparent pointer-events-none z-0 hidden sm:block" />

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
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all relative overflow-hidden z-10
                          ${isActive 
                            ? 'sidebar-item-active' 
                            : 'sidebar-item-hover text-[#e8e2d3]/90 font-semibold'
                          }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-[#e5c158]' : 'text-[#a3c9b0]'}`} />
                        <span className="truncate font-syne tracking-tight">{config.label}</span>
                        {config.badge && (
                          <span className="ml-auto sidebar-badge-ai">
                            {config.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}

                  {/* Always include Settings */}
                  <Link
                    href="/profile"
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all z-10 ${
                      pathname === '/profile' 
                        ? 'sidebar-item-active' 
                        : 'sidebar-item-hover text-[#e8e2d3]/90 font-semibold'
                    }`}
                  >
                    <Settings className={`w-4 h-4 shrink-0 ${pathname === '/profile' ? 'text-[#e5c158]' : 'text-[#a3c9b0]'}`} />
                    <span className="truncate font-syne tracking-tight">Settings</span>
                  </Link>
                </nav>
              </div>
            </div>

            {/* Sidebar User Info (Matching Reference Image 4) */}
            <div className="flex-none pt-3 border-t border-[#43634e]/30 mt-2">
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-black/40 border border-[#e5c158]/35 text-xs text-[#a3c9b0] shadow-[0_4px_15px_rgba(0,0,0,0.6)]">
                <User className="w-4 h-4 text-[#e5c158]" />
                <span className="truncate font-extrabold text-[#f4f0e6] font-syne">{roleLabel}</span>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT WORKSPACE */}
          <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden min-w-0">
            
            {/* TOP NAVBAR - CONCRETE STONE HEADER MATCHING REFERENCE IMAGE */}
            <header className="h-14 flex-none brutal-stone-header px-3 sm:px-6 flex items-center justify-between z-30">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <button
                  onClick={openMobileMenu}
                  className="lg:hidden p-2 rounded-lg text-[#e8e2d3] hover:bg-white/10 touch-target shrink-0"
                  aria-label="Open navigation"
                >
                  <Menu className="w-5 h-5" />
                </button>
                {/* Role and Name Display (Reference Image: Teacher: Mrs. Sarah Jensen) */}
                <div className="text-xs sm:text-sm font-bold text-[#f4f0e6] tracking-tight font-syne flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <span className="text-[#e5c158] font-bold shrink-0">{roleLabel}:</span>
                  <span className="text-[#f4f0e6] font-medium truncate max-w-[110px] sm:max-w-[240px]">{user.full_name}</span>
                </div>
              </div>

              {/* Right Header Controls matching reference image */}
              <div className="flex items-center gap-3">
                
                {/* Install App Button */}
                <InstallPWA />

                {/* Global Command Palette Trigger Button (Search Box with Gold Accent) */}
                <button
                  onClick={() => {
                    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true });
                    window.dispatchEvent(event);
                  }}
                  className="hidden sm:flex items-center gap-2.5 text-xs px-3.5 py-1.5 rounded-full bg-[#16271c] text-[#a3c9b0] hover:text-[#f4f0e6] border border-[#e5c158]/35 transition-all cursor-pointer hover:border-[#e5c158]/70 shadow-[0_2px_10px_rgba(0,0,0,0.4)]"
                >
                  <Search className="w-3.5 h-3.5 text-[#e5c158]" />
                  <span className="text-[#d8d2c2]">Search...</span>
                  <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-[#0d1811] text-[#e5c158] border border-[#e5c158]/30 ml-1">
                    ⌘K
                  </span>
                </button>

                {/* User Settings Dropdown matching reference image */}
                <div className="relative">
                  <button
                  onClick={toggleUserDropdown}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-[#1b3224] border border-[#e5c158]/40 text-xs font-semibold text-[#f4f0e6] hover:border-[#e5c158]/70 transition-colors shadow-sm touch-target"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#e5c158]" />
                    <span className="hidden sm:inline">User Settings</span>
                    <span className="sm:hidden text-[11px]">Settings</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#e5c158]" />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#14251c] border border-[#e5c158]/40 shadow-2xl p-1.5 z-50 backdrop-blur-xl">
                      <Link
                        href="/profile"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#e8e2d3] hover:bg-[#f4f0e6]/10"
                      >
                        <User className="w-3.5 h-3.5 text-[#e5c158]" />
                        <span>My Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-rose-300 hover:bg-rose-500/10"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Scrollable Main View Area */}
            <main data-lenis-prevent="true" className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-4 sm:space-y-5">
              {children}
            </main>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AppShell>{children}</AppShell>
    </ToastProvider>
  );
}
