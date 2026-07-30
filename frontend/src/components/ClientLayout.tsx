"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileSearch, Calendar, CheckSquare, BookOpen, FlaskConical, 
  Mail, LayoutDashboard, GraduationCap, Sparkles, Users,
  Building2, LogOut, Shield, ChevronDown, UserCheck, CreditCard,
  CheckCircle2, RefreshCw, Heart
} from 'lucide-react';
import { useAuthStore, ROLE_LABELS, ROLE_COLORS, ROLE_NAV_ITEMS, UserRole } from '@/store/authStore';

// Map nav item keys to their config
const NAV_CONFIG: Record<string, { href: string; label: string; icon: any; badge?: string; color: string }> = {
  dashboard:     { href: '/',             label: 'Dashboard Overview',    icon: LayoutDashboard, color: 'group-hover:text-indigo-400' },
  users:         { href: '/users',        label: 'User Management',       icon: Users,           color: 'group-hover:text-pink-400' },
  departments:   { href: '/departments',  label: 'Departments',           icon: Building2,       color: 'group-hover:text-teal-400' },
  ocr:           { href: '/ocr',          label: 'Ensemble OCR Parser',   icon: FileSearch,      color: 'group-hover:text-cyan-400',   badge: 'AI' },
  timetable:     { href: '/timetable',    label: 'Timetable Optimizer',   icon: Calendar,        color: 'group-hover:text-indigo-400' },
  substitutions: { href: '/substitutions',label: 'Teacher Substitutions', icon: RefreshCw,       color: 'group-hover:text-cyan-400' },
  attendance:    { href: '/attendance',   label: 'Attendance & Logs',     icon: CheckSquare,     color: 'group-hover:text-emerald-400' },
  portion:       { href: '/portion',      label: 'Smart Portion Tracker', icon: BookOpen,        color: 'group-hover:text-amber-400' },
  labs:          { href: '/labs',         label: 'Lab Submissions',       icon: FlaskConical,    color: 'group-hover:text-purple-400' },
  emails:        { href: '/emails',       label: 'Email Intimations',     icon: Mail,            color: 'group-hover:text-rose-400' },
  mentorship:    { href: '/mentorship',   label: 'Mentorship System',     icon: UserCheck,       color: 'group-hover:text-violet-400' },
  fees:          { href: '/fees',         label: 'Fee Payment Portal',    icon: CreditCard,      color: 'group-hover:text-emerald-400' },
  approvals:     { href: '/approvals',    label: 'Leave Approvals',       icon: CheckCircle2,    color: 'group-hover:text-amber-400' },
  parent_portal: { href: '/parent',       label: 'Parent Portal',         icon: Heart,           color: 'group-hover:text-pink-400' },
};

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (pathname !== '/login' && !isAuthenticated) {
      router.push('/login');
    }
  }, [pathname, isAuthenticated, router]);

  // Don't show shell on login page
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // If not authenticated and not on login, show brief loading while redirecting
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#090d16' }}>
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mx-auto"></div>
          <p className="text-gray-400 text-sm">Redirecting to login...</p>
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
      <header className="h-16 glass-panel border-b border-gray-800/60 sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight gradient-text">PaperBuddy ERP</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                v2.0 RBAC
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>FastAPI & OR-Tools Active</span>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 pl-4 border-l border-gray-800 hover:bg-gray-800/30 rounded-lg px-3 py-1.5 transition-colors"
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${roleColor} flex items-center justify-center text-white font-semibold text-xs shadow-lg`}>
                {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
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
                <div className="absolute right-0 top-full mt-2 w-64 glass-panel rounded-xl border border-gray-700/60 shadow-2xl z-50 overflow-hidden">
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

      <div className="flex flex-1">
        {/* Left Sidebar — Dynamic by Role */}
        <aside className="w-64 glass-panel border-r border-gray-800/60 p-4 hidden lg:flex flex-col justify-between">
          <div className="space-y-6">
            <div className="px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              ERP Operations
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
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                      ${isActive 
                        ? 'text-white bg-indigo-600/20 border border-indigo-500/30' 
                        : 'text-gray-300 hover:text-white hover:bg-indigo-600/15'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : `text-gray-400 ${config.color}`}`} />
                    <span>{config.label}</span>
                    {config.badge && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                        {config.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Role Info Card */}
          <div className="p-3 glass-panel-glow rounded-xl text-xs space-y-2">
            <div className="flex items-center space-x-2 text-indigo-300 font-semibold">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>8-Role RBAC System</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Logged in as <span className="text-indigo-300 font-medium">{roleLabel}</span>. 
              {user.assigned_grade ? ` Grade ${user.assigned_grade} scope.` : ' Full system access.'}
            </p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
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

  return <AppShell>{children}</AppShell>;
}
