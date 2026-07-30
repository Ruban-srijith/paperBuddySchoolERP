"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  FileSearch, Calendar, CheckSquare, BookOpen, FlaskConical, 
  Mail, ArrowRight, TrendingUp, Users, Award, CheckCircle2,
  Building2, Shield, GraduationCap
} from "lucide-react";
import { useAuthStore, ROLE_LABELS, ROLE_COLORS, ROLE_NAV_ITEMS, UserRole } from "@/store/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

// Grade levels for the system
const ALL_GRADES = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

function DashboardContent() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 28,
    totalDepts: 3,
  });

  const [aiSummary, setAiSummary] = useState<any | null>(null);

  useEffect(() => {
    // Fetch basic stats and AI health summary
    const fetchStats = async () => {
      try {
        const [studentsRes, aiRes] = await Promise.allSettled([
          api.get('/users/by-role/student'),
          api.get('/ai/school-health-summary'),
        ]);
        if (studentsRes.status === 'fulfilled') {
          setStats(prev => ({ ...prev, totalStudents: studentsRes.value.data.length }));
        }
        if (aiRes.status === 'fulfilled') {
          setAiSummary(aiRes.value.data);
        }
      } catch {}
    };
    fetchStats();
  }, []);

  if (!user) return null;

  const roleLabel = ROLE_LABELS[user.role];
  const roleColor = ROLE_COLORS[user.role];
  const navItems = ROLE_NAV_ITEMS[user.role];
  const isAdmin = ['super_admin', 'admin'].includes(user.role);
  const isPrincipalUp = ['super_admin', 'admin', 'principal'].includes(user.role);
  const isTeacher = user.role === 'teacher';
  const isStudent = user.role === 'student';
  const isMentor = user.role === 'mentor';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero Banner */}
      <div className="glass-panel-glow p-8 rounded-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs border border-indigo-400/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Welcome, {roleLabel}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">
            {isStudent ? (
              <>Hello, <span className="gradient-text">{user.full_name}</span></>
            ) : isTeacher || isMentor ? (
              <>Welcome, <span className="gradient-text">{user.full_name}</span></>
            ) : (
              <>Welcome to <span className="gradient-text">PaperBuddy ERP</span></>
            )}
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            {isStudent 
              ? `Access your attendance, timetable, and lab submissions for Grade ${user.assigned_grade || 'N/A'}.`
              : isTeacher 
              ? 'Manage your classes, mark attendance, submit work logs, and track portion progress.'
              : isMentor
              ? `Monitor your assigned class attendance and portion progress for Grade ${user.assigned_grade || 'N/A'}.`
              : 'Full-stack school operations with 8-role RBAC, LKG to 12th Standard grade management.'
            }
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            {navItems.includes('ocr') && (
              <Link href="/ocr" className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all">
                <FileSearch className="w-4 h-4" />
                <span>Launch Ensemble OCR</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            )}
            <Link href={isStudent ? "/attendance" : "/timetable"} className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl glass-panel text-gray-200 font-medium text-sm hover:border-indigo-500/50 hover:text-white transition-all">
              {isStudent ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Calendar className="w-4 h-4 text-indigo-400" />}
              <span>{isStudent ? "My Attendance" : "Timetable"}</span>
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* AI Command Center Widget — For Management, Principal, and Admins */}
      {aiSummary && ['super_admin', 'correspondent', 'admin', 'principal'].includes(user.role) && (
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-lg">
                {aiSummary.health_score}
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Academic AI Command Center</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                    Health Index: {aiSummary.overall_status}
                  </span>
                </h3>
                <p className="text-xs text-gray-400">Real-time school operational analysis & executive briefing</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs text-gray-400 font-medium">Daily Attendance Rate</div>
              <div className="text-lg font-bold text-emerald-400">{aiSummary.metrics?.attendance_rate}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-800/60 text-xs">
            <div className="space-y-2">
              <div className="font-semibold text-indigo-300 uppercase tracking-wider text-[10px]">AI Executive Briefing</div>
              <ul className="space-y-1 text-gray-300">
                {aiSummary.ai_recommendations?.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {aiSummary.critical_alerts?.length > 0 && (
              <div className="space-y-2">
                <div className="font-semibold text-amber-400 uppercase tracking-wider text-[10px]">Critical Operational Alerts</div>
                <div className="space-y-1.5">
                  {aiSummary.critical_alerts?.map((alert: string, idx: number) => (
                    <div key={idx} className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
                      ⚠️ {alert}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Metrics Row — Adapted by Role */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Students/My Class */}
        <div className="glass-panel p-5 rounded-xl space-y-3 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isStudent ? 'My Grade' : 'Registered Students'}
            </span>
            {isStudent ? <GraduationCap className="w-4 h-4 text-indigo-400" /> : <Users className="w-4 h-4 text-indigo-400" />}
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">
              {isStudent ? `Grade ${user.assigned_grade || '10'}` : stats.totalStudents || '5+'}
            </span>
          </div>
          <p className="text-[11px] text-gray-400">
            {isStudent ? 'Your current class assignment' : 'LKG through 12th Standard'}
          </p>
        </div>

        {/* Metric 2: Roles/Grades */}
        <div className="glass-panel p-5 rounded-xl space-y-3 border-l-4 border-cyan-500">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isPrincipalUp ? 'Grade Levels' : 'Your Role'}
            </span>
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">
              {isPrincipalUp ? '14 Grades' : roleLabel}
            </span>
          </div>
          <p className="text-[11px] text-gray-400">
            {isPrincipalUp ? 'LKG to 12th Standard' : `8-Role RBAC System`}
          </p>
        </div>

        {/* Metric 3: Departments */}
        <div className="glass-panel p-5 rounded-xl space-y-3 border-l-4 border-amber-500">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isPrincipalUp ? 'Departments' : 'Portion Progress'}
            </span>
            {isPrincipalUp ? <Building2 className="w-4 h-4 text-amber-400" /> : <BookOpen className="w-4 h-4 text-amber-400" />}
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">
              {isPrincipalUp ? stats.totalDepts : '65.0%'}
            </span>
            {!isPrincipalUp && <span className="text-xs text-amber-400 font-medium">Target 70%</span>}
          </div>
          <p className="text-[11px] text-gray-400">
            {isPrincipalUp ? 'Science, CS, Humanities' : 'Current syllabus completion'}
          </p>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 rounded-xl space-y-3 border-l-4 border-rose-500">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {isAdmin ? 'Emails Dispatched' : 'RBAC System'}
            </span>
            {isAdmin ? <Mail className="w-4 h-4 text-rose-400" /> : <Shield className="w-4 h-4 text-rose-400" />}
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white">
              {isAdmin ? '100%' : '8 Roles'}
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-0.5" /> Active
            </span>
          </div>
          <p className="text-[11px] text-gray-400">
            {isAdmin ? 'Zero Duplicates Logged' : 'JWT Authentication'}
          </p>
        </div>
      </div>

      {/* Grade Levels Overview (Admin/Principal only) */}
      {isPrincipalUp && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-200">Grade Levels — LKG to 12th Standard</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {ALL_GRADES.map((grade) => (
              <div key={grade} className="glass-panel p-3 rounded-xl text-center hover:border-indigo-500/40 transition-all cursor-pointer">
                <div className="text-lg font-bold text-white">{grade}</div>
                <div className="text-[10px] text-gray-400 mt-1">
                  {['LKG', 'UKG'].includes(grade) ? 'Pre-Primary' 
                    : parseInt(grade) <= 5 ? 'Primary' 
                    : parseInt(grade) <= 8 ? 'Middle' 
                    : parseInt(grade) <= 10 ? 'Secondary' 
                    : 'Sr. Secondary'}
                </div>
                <div className="text-[10px] text-indigo-400 mt-0.5">Sec A & B</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Navigation Cards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-200">
          {isStudent ? 'My Modules' : isTeacher ? 'Teaching Modules' : 'Core Operations Modules'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navItems.includes('ocr') && (
            <Link href="/ocr" className="group">
              <div className="glass-panel p-6 rounded-2xl h-full space-y-3 hover:border-cyan-500/50 hover:bg-slate-900/80 transition-all">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <FileSearch className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">Ensemble OCR Parser</h3>
                <p className="text-xs text-gray-400 leading-relaxed">Multi-model vision pipeline for admission form verification.</p>
              </div>
            </Link>
          )}

          {navItems.includes('users') && (
            <Link href="/users" className="group">
              <div className="glass-panel p-6 rounded-2xl h-full space-y-3 hover:border-pink-500/50 hover:bg-slate-900/80 transition-all">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-pink-400 transition-colors">User Management</h3>
                <p className="text-xs text-gray-400 leading-relaxed">Manage users across all 8 roles with department and grade assignments.</p>
              </div>
            </Link>
          )}

          {navItems.includes('departments') && (
            <Link href="/departments" className="group">
              <div className="glass-panel p-6 rounded-2xl h-full space-y-3 hover:border-teal-500/50 hover:bg-slate-900/80 transition-all">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-teal-400 transition-colors">Departments</h3>
                <p className="text-xs text-gray-400 leading-relaxed">Department overview with dean assignment and teacher directory.</p>
              </div>
            </Link>
          )}

          {navItems.includes('timetable') && (
            <Link href="/timetable" className="group">
              <div className="glass-panel p-6 rounded-2xl h-full space-y-3 hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors">Timetable {isPrincipalUp ? 'Optimizer' : ''}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {isStudent ? 'View your class schedule.' : 'OR-Tools solver with conflict-free scheduling.'}
                </p>
              </div>
            </Link>
          )}

          {navItems.includes('attendance') && (
            <Link href="/attendance" className="group">
              <div className="glass-panel p-6 rounded-2xl h-full space-y-3 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {isStudent ? 'My Attendance' : 'Attendance & Logs'}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {isStudent ? 'View your attendance records.' : 'Batch marking with work log integration.'}
                </p>
              </div>
            </Link>
          )}

          {navItems.includes('portion') && (
            <Link href="/portion" className="group">
              <div className="glass-panel p-6 rounded-2xl h-full space-y-3 hover:border-amber-500/50 hover:bg-slate-900/80 transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">Portion Tracker</h3>
                <p className="text-xs text-gray-400 leading-relaxed">Real-time syllabus completion progress.</p>
              </div>
            </Link>
          )}

          {navItems.includes('labs') && (
            <Link href="/labs" className="group">
              <div className="glass-panel p-6 rounded-2xl h-full space-y-3 hover:border-purple-500/50 hover:bg-slate-900/80 transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">Lab {isStudent ? 'Submissions' : 'Portal'}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {isStudent ? 'Submit and track your lab assignments.' : 'Create assignments and track submissions.'}
                </p>
              </div>
            </Link>
          )}

          {navItems.includes('emails') && (
            <Link href="/emails" className="group">
              <div className="glass-panel p-6 rounded-2xl h-full space-y-3 hover:border-rose-500/50 hover:bg-slate-900/80 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors">Email System</h3>
                <p className="text-xs text-gray-400 leading-relaxed">Async email dispatch with deduplication.</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
