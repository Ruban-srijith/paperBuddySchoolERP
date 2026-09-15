"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { 
  FileSearch, Calendar, CheckSquare, BookOpen, FlaskConical, 
  Mail, ArrowRight, TrendingUp, Users, Award, CheckCircle2,
  Building2, Shield, GraduationCap, DollarSign, Clock, Activity,
  FileSpreadsheet, LayoutGrid, FileCheck, UserCheck, CalendarDays,
  ClipboardList, FileText, HelpCircle, Megaphone, Trophy, X,
  Phone, Sparkles, UserRound
} from "lucide-react";
import { useAuthStore, ROLE_LABELS, ROLE_COLORS, ROLE_NAV_ITEMS, UserRole } from "@/store/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageLoader from "@/components/PageLoader";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";

// Dynamic grade levels will be fetched from the backend

interface ClassDetailModalData {
  grade: string;
  section: string;
  class_name: string;
  class_teacher: string;
  class_teacher_email: string;
  total_strength: number;
  attendance_rate: number;
  syllabus_coverage: number;
  students: Array<{
    id: string;
    full_name: string;
    admission_number: string;
    email: string;
    father_name: string;
    guardian_phone: string;
    attendance_pct: number;
    gpa: string;
  }>;
  schedule_today: Array<{
    period: number;
    time: string;
    subject: string;
    teacher: string;
    room: string;
    isOngoing?: boolean;
  }>;
}

function DashboardContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [stats, setStats] = useState({
    totalStudents: 1420,
    totalTeachers: 68,
    totalClasses: 28,
    totalDepts: 3,
  });

  const [aiSummary, setAiSummary] = useState<any | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("A");
  const [classDetail, setClassDetail] = useState<ClassDetailModalData | null>(null);
  const [loadingClass, setLoadingClass] = useState(false);
  const [activeClasses, setActiveClasses] = useState<{grade: string, sections: string[]}[]>([]);
  const [totalSections, setTotalSections] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, aiRes, classesRes] = await Promise.allSettled([
          api.get('/users/by-role/student'),
          api.get('/ai/school-health-summary'),
          api.get('/classes')
        ]);
        if (studentsRes.status === 'fulfilled' && studentsRes.value.data.length > 0) {
          setStats(prev => ({ ...prev, totalStudents: studentsRes.value.data.length }));
        }
        if (aiRes.status === 'fulfilled') {
          setAiSummary(aiRes.value.data);
        }
        if (classesRes.status === 'fulfilled') {
          const classesData = classesRes.value.data;
          setTotalSections(classesData.length);
          setStats(prev => ({ ...prev, totalClasses: classesData.length }));
          
          const grouped: Record<string, string[]> = {};
          classesData.forEach((c: any) => {
            if (!grouped[c.grade]) grouped[c.grade] = [];
            if (!grouped[c.grade].includes(c.section)) {
              grouped[c.grade].push(c.section);
            }
          });
          
          const gradeOrder = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
          const formattedClasses = Object.keys(grouped)
            .sort((a, b) => {
              const aIndex = gradeOrder.indexOf(a);
              const bIndex = gradeOrder.indexOf(b);
              if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
              if (aIndex !== -1) return -1;
              if (bIndex !== -1) return 1;
              return a.localeCompare(b);
            })
            .map(grade => ({
              grade,
              sections: grouped[grade].sort()
            }));
            
          setActiveClasses(formattedClasses);
        }
      } catch {}
    };
    fetchStats();
  }, []);

  const fetchClassDetail = async (grade: string, section: string) => {
    setLoadingClass(true);
    try {
      const res = await api.get(`/academics/class-detail/${grade}?section=${section}`);
      setClassDetail(res.data);
    } catch (err) {
      setClassDetail(null);
    }
    setLoadingClass(false);
  };

  const handleGradeClick = (grade: string) => {
    setSelectedGrade(grade);
    const classInfo = activeClasses.find(c => c.grade === grade);
    const firstSection = classInfo && classInfo.sections.length > 0 ? classInfo.sections[0] : "A";
    setSelectedSection(firstSection);
    fetchClassDetail(grade, firstSection);
  };

  // When selected section changes from the modal tabs
  const handleSectionClick = (sec: string) => {
    if (selectedGrade && sec !== selectedSection) {
      setSelectedSection(sec);
      fetchClassDetail(selectedGrade, sec);
    }
  };

  if (!user) return <PageLoader />;

  const roleLabel = ROLE_LABELS[user.role];
  const roleColor = ROLE_COLORS[user.role];
  const navItems = ROLE_NAV_ITEMS[user.role] || [];
  
  const isSuperAdmin = ['super_admin', 'correspondent'].includes(user.role);
  const isAdmin = ['principal'].includes(user.role);
  const isVicePrincipal = ['vice_principal'].includes(user.role);
  const isTeacher = user.role === 'teacher';
  const isStudent = user.role === 'student';
  const isManagement = isSuperAdmin || isAdmin || isVicePrincipal;
  const isFinance = user.role === 'finance';
  const isWarden = user.role === 'warden';
  const isLibrarian = user.role === 'librarian';

  useEffect(() => {
    if (isFinance) {
      router.push('/finance');
    } else if (isWarden) {
      router.push('/warden');
    } else if (isLibrarian) {
      router.push('/librarian');
    }
  }, [isFinance, isWarden, isLibrarian, router]);

  if (isFinance || isWarden || isLibrarian) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Enterprise ERP Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Good morning, <span className="font-semibold text-slate-800 dark:text-slate-200">{user.full_name || 'Mr. Sundaram'}</span>. Here is today's school overview.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-md shadow-sm">
          <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Academic Year 2026–27</span>
        </div>
      </div>

      {/* KPI Statistic Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Students */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Students</span>
            <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalStudents || 2450}</span>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">+3.2% this year</span>
          </div>
        </div>

        {/* Card 2: Teachers & Staff */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Teachers & Staff</span>
            <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalTeachers || 68}</span>
            <span className="text-[11px] font-medium text-slate-500">Active Faculty</span>
          </div>
        </div>

        {/* Card 3: Today's Attendance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Today's Attendance</span>
            <div className="p-2 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">94.8%</span>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Normal Range</span>
          </div>
        </div>

        {/* Card 4: Pending Fees */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Fees</span>
            <div className="p-2 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">₹1,25,000</span>
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">28 Students</span>
          </div>
        </div>

        {/* Card 5: Pending Approvals */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Approvals</span>
            <div className="p-2 rounded bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">12</span>
            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">Requires Action</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column ERP Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance Overview Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Attendance Overview</h2>
                <p className="text-xs text-slate-500">Daily student & staff attendance status</p>
              </div>
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300">
                <button className="px-2.5 py-1 rounded bg-white dark:bg-slate-700 shadow-sm text-blue-700 dark:text-blue-400 font-semibold">Today</button>
                <button className="px-2.5 py-1 hover:text-slate-900">This Week</button>
                <button className="px-2.5 py-1 hover:text-slate-900">This Month</button>
              </div>
            </div>

            {/* Attendance Progress Visual */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: '94.8%' }}></div>
                <div className="bg-amber-400 h-full" style={{ width: '3.4%' }}></div>
                <div className="bg-rose-500 h-full" style={{ width: '1.8%' }}></div>
              </div>
              <div className="flex flex-wrap items-center justify-between text-xs pt-1 gap-2">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Present (94.8%) — 2,323</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Absent (3.4%) — 83</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">On Leave (1.8%) — 44</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Collection Overview & Recent Activity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fee Collection Overview */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Fee Collection Overview</h3>
                <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">₹14.2L Collected</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>Tuition Fees (Term 2)</span>
                    <span className="font-bold">₹10,50,000 / ₹11,20,000</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '93%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>Transport & Bus Fees</span>
                    <span className="font-bold">₹2,80,000 / ₹3,00,000</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <span>Hostel & Mess Charges</span>
                    <span className="font-bold">₹90,000 / ₹1,25,000</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Activity</h3>
                <span className="text-[11px] text-slate-400 font-medium">Real-time log</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-start space-x-2.5">
                  <span className="font-mono text-slate-400 shrink-0 text-[11px]">09:42 AM</span>
                  <span className="text-slate-700 dark:text-slate-300">Student admission completed <span className="font-semibold text-slate-900 dark:text-slate-100">(Admit #2026-842)</span></span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="font-mono text-slate-400 shrink-0 text-[11px]">09:30 AM</span>
                  <span className="text-slate-700 dark:text-slate-300">Grade 8 attendance updated by Class Teacher</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="font-mono text-slate-400 shrink-0 text-[11px]">09:15 AM</span>
                  <span className="text-slate-700 dark:text-slate-300">Salary approval submitted for Q3 Staff Payroll</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="font-mono text-slate-400 shrink-0 text-[11px]">08:55 AM</span>
                  <span className="text-slate-700 dark:text-slate-300">Examination timetable published for Mid-Term Exams</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1 Col) */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Upcoming Events</h3>
              <Link href="/calendar" className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">View All</Link>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="bg-blue-600 text-white font-bold text-center p-1.5 rounded shrink-0 w-10">
                  <span className="block text-[9px] uppercase tracking-wide">OCT</span>
                  <span className="text-sm leading-none">18</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Parent–Teacher Meeting</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Grades 1 to 12 • Main Auditorium</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="bg-emerald-600 text-white font-bold text-center p-1.5 rounded shrink-0 w-10">
                  <span className="block text-[9px] uppercase tracking-wide">OCT</span>
                  <span className="text-sm leading-none">22</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Unit Test – Grade 10</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Mathematics & Physical Science</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="bg-indigo-600 text-white font-bold text-center p-1.5 rounded shrink-0 w-10">
                  <span className="block text-[9px] uppercase tracking-wide">OCT</span>
                  <span className="text-sm leading-none">25</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Staff Council Meeting</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Conference Room A • 03:30 PM</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="bg-amber-600 text-white font-bold text-center p-1.5 rounded shrink-0 w-10">
                  <span className="block text-[9px] uppercase tracking-wide">NOV</span>
                  <span className="text-sm leading-none">05</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Annual Sports Day</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">School Sports Complex & Field</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Approvals List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Pending Approvals</h3>
              <Link href="/pending-approvals" className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">Manage (12)</Link>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">Salary approval</span>
                  <span className="text-[11px] text-slate-500">Q3 Staff Payroll Clearance</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">Event approval</span>
                  <span className="text-[11px] text-slate-500">Inter-School Tech Fest Budget</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">Leave approval</span>
                  <span className="text-[11px] text-slate-500">3 Faculty Leave Applications</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded border border-slate-100 dark:border-slate-800">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">Document verification</span>
                  <span className="text-[11px] text-slate-500">Grade 11 Admissions Audit</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">Review</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Levels Overview — Interactive for Superadmin, Admin, and Sub-admin */}
      {isManagement && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Active Grade Levels</h2>
              <p className="text-xs text-slate-500">Click any grade card to view student roster, class teacher, and schedule</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-semibold">
              {activeClasses.length} Grade Tiers • {totalSections} Sections
            </span>
          </div>

          {activeClasses.length === 0 ? (
            <div className="py-6 text-center bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500">No classes configured.</p>
              <Link href="/classes" className="inline-block mt-2 text-blue-600 font-bold text-xs hover:underline">
                Go to Manage Classes
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {activeClasses.map((cls) => {
                const grade = cls.grade;
                const sectionsText = cls.sections.length > 0 
                  ? (cls.sections.length <= 3 ? `Sec ${cls.sections.join(' & ')}` : `${cls.sections.length} Sec`)
                  : "No Sec";
                  
                return (
                  <button
                    key={grade}
                    onClick={() => handleGradeClick(grade)}
                    className={`bg-white dark:bg-slate-900 border rounded-md p-3 text-center hover:border-blue-500 transition-colors ${
                      selectedGrade === grade ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 ring-1 ring-blue-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="text-base font-bold text-slate-900 dark:text-slate-100">{grade}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {['LKG', 'UKG'].includes(grade) ? 'Pre-Primary' 
                        : parseInt(grade) <= 5 ? 'Primary' 
                        : parseInt(grade) <= 8 ? 'Middle' 
                        : parseInt(grade) <= 10 ? 'Secondary' 
                        : 'Sr. Secondary'}
                    </div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{sectionsText}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Class Detail Modal / Drawer */}
      {selectedGrade && (loadingClass || classDetail) && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-gray-200 max-w-4xl w-full max-h-[85vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/80">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue font-bold text-lg flex-shrink-0">
                  {selectedGrade}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-brand-black flex flex-wrap items-center gap-2">
                    <span>Grade {selectedGrade} Class Detail</span>
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    {activeClasses.find(c => c.grade === selectedGrade)?.sections.map(sec => (
                      <button
                        key={sec}
                        onClick={() => handleSectionClick(sec)}
                        className={`text-xs px-3 py-1 rounded-full whitespace-nowrap font-semibold transition-all ${
                          selectedSection === sec 
                            ? 'bg-brand-blue text-white shadow-md' 
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        Section {sec}
                      </button>
                    ))}
                  </div>
                  {classDetail && (
                    <p className="text-xs text-gray-500 mt-2 truncate">
                      Class Teacher: <span className="text-brand-black font-semibold">{classDetail.class_teacher || 'Unassigned'}</span> ({classDetail.class_teacher_email || '-'})
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => { setSelectedGrade(null); setClassDetail(null); }}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-black transition-colors flex-shrink-0 ml-4"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingClass ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
                 <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-gray-500 font-medium">Loading class details...</p>
              </div>
            ) : classDetail ? (
              <>

            {/* Modal Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-100 bg-gray-50/50 text-center">
              <div className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 font-medium">Total Strength</div>
                <div className="text-xl font-bold text-brand-black mt-1">{classDetail.total_strength || 0} <span className="text-xs text-gray-400 font-medium">Students</span></div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 font-medium">Class Attendance</div>
                <div className="text-xl font-bold text-emerald-600 mt-1">{classDetail.attendance_rate || 0}%</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 font-medium">Syllabus Completion</div>
                <div className="text-xl font-bold text-brand-blue mt-1">{classDetail.syllabus_coverage || 0}%</div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-8 flex-1 min-h-0 bg-white">
              {/* Today's Schedule */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-blue" />
                  <span>Today's Class Schedule</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {classDetail.schedule_today && classDetail.schedule_today.length > 0 ? (
                    classDetail.schedule_today.map((s: any) => (
                      <div key={s.period} className={`p-4 rounded-xl border transition-colors shadow-sm space-y-1.5 relative overflow-hidden ${
                        s.isOngoing ? 'bg-brand-blue/5 border-brand-blue/50 ring-1 ring-brand-blue/30' : 'bg-gray-50 border-gray-100 hover:border-brand-blue/30'
                      }`}>
                        {s.isOngoing && (
                          <div className="absolute top-0 right-0 bg-brand-blue text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider animate-pulse">
                            Ongoing Now
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[11px] font-medium">
                          <span className={s.isOngoing ? 'text-brand-blue font-bold' : 'text-gray-500'}>Period {s.period}</span>
                          <span className={`font-mono font-bold ${s.isOngoing ? 'text-brand-blue' : 'text-brand-blue'}`}>{s.time}</span>
                        </div>
                        <div className="text-sm font-bold text-brand-black truncate">{s.subject || 'Unknown'}</div>
                        <div className={`text-[11px] font-medium truncate ${s.isOngoing ? 'text-brand-blue font-bold' : 'text-gray-500'}`}>{s.teacher || 'Unassigned'}</div>
                        <div className="text-[10px] font-bold text-gray-400">{s.room || 'TBD'}</div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-6 text-center text-gray-500 text-sm border border-dashed rounded-xl border-gray-200 bg-gray-50/50">
                      No timetable configured for this class yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Student Roster */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-blue" />
                  <span>Enrolled Student Roster ({(classDetail.students || []).length})</span>
                </h4>
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                  {classDetail.students && classDetail.students.length > 0 ? (
                    <table className="w-full text-left text-xs min-w-[600px]">
                      <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider border-b border-gray-200">
                        <tr>
                          <th className="p-3.5">Student Name</th>
                          <th className="p-3.5">Admission No</th>
                          <th className="p-3.5">Father / Guardian</th>
                          <th className="p-3.5">Contact</th>
                          <th className="p-3.5">Attendance</th>
                          <th className="p-3.5 text-right">Academic GPA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {classDetail.students.map((stu) => (
                          <tr key={stu.id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="p-3.5 font-bold text-brand-black flex items-center gap-2.5 whitespace-nowrap">
                              <div className="w-7 h-7 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-[11px] font-bold border border-brand-blue/20 uppercase">
                                {stu.full_name ? stu.full_name[0] : '?'}
                              </div>
                              {stu.full_name || 'Unknown Student'}
                            </td>
                            <td className="p-3.5 font-mono font-semibold text-gray-500 whitespace-nowrap">{stu.admission_number || '-'}</td>
                            <td className="p-3.5 font-medium text-gray-700 whitespace-nowrap">{stu.father_name || '-'}</td>
                            <td className="p-3.5 text-gray-600 flex items-center gap-1.5 font-mono font-medium whitespace-nowrap">
                              <Phone className="w-3.5 h-3.5 text-brand-blue" />
                              {stu.guardian_phone || '-'}
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                {stu.attendance_pct || 0}%
                              </span>
                            </td>
                            <td className="p-3.5 text-right font-bold text-brand-black whitespace-nowrap">{stu.gpa || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-gray-500 text-sm bg-gray-50">
                      No students have been assigned to this class yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 rounded-b-2xl">
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                <Link
                  href="/timetable"
                  className="px-4 py-2.5 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-bold hover:bg-brand-blue/20 transition-colors flex items-center justify-center gap-1.5 shadow-sm w-full sm:w-auto"
                >
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Grade Timetable</span>
                </Link>
                <Link
                  href="/attendance"
                  className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5 shadow-sm w-full sm:w-auto"
                >
                  <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Attendance</span>
                </Link>
              </div>
              <button
                onClick={() => { setSelectedGrade(null); setClassDetail(null); }}
                className="px-6 py-2.5 w-full sm:w-auto rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
            </>
            ) : null}

          </div>
        </div>,
        document.body
      )}

      {/* Dynamic Role Navigation Cards */}
      <motion.div 
        initial={{ y: 30, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-bold text-brand-black">
          {isStudent ? 'Student Portals' : isTeacher ? 'Teaching & Class Management' : `${roleLabel} Operational Portals`}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Superadmin Specific Cards */}
          {isSuperAdmin && (
            <>
              <Link href="/salary-approvals" className="group">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-md h-full space-y-2 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-emerald-600 transition-colors">Salary Approvals</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Monthly staff payroll clearance and allowance review.</p>
                </div>
              </Link>

              <Link href="/event-approvals" className="group">
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-amber-500/50 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-amber-600 transition-colors">Approve Major Events</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Review proposed inter-school events, budgets, and schedules.</p>
                </div>
              </Link>

              <Link href="/revenue" className="group">
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-cyan-500/50 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-cyan-600 transition-colors">Monthly Revenue</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Fee collections breakdown by tuition, bus, hostel, and kit fees.</p>
                </div>
              </Link>

              <Link href="/toppers" className="group">
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-yellow-500/50 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-yellow-600 transition-colors">Class Toppers List</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Top performing students across LKG–12th with GPA and subjects.</p>
                </div>
              </Link>
            </>
          )}

          {/* Admin Specific Cards */}
          {isAdmin && (
            <>
              <Link href="/pending-approvals" className="group">
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-amber-500/50 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-amber-600 transition-colors">Pending Approvals Hub</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Consolidated staff leave requests, event proposals, and substitutions.</p>
                </div>
              </Link>

              <Link href="/staff-management" className="group">
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-indigo-500/50 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-indigo-600 transition-colors">Staff Management Hub</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Teacher attendance, staff council meetings, and faculty administration.</p>
                </div>
              </Link>

              <Link href="/workload" className="group">
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-blue-500/50 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-blue-600 transition-colors">Teachers Workload</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Monitor syllabus progress, teaching periods, and lag alerts.</p>
                </div>
              </Link>

              <Link href="/reports" className="group">
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-teal-500/50 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-teal-600 transition-colors">Operational Reports</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Daily, monthly, and annual attendance, fee, and administrative summaries.</p>
                </div>
              </Link>
            </>
          )}

          {/* Sub-admin Specific Cards */}
          {isVicePrincipal && (
            <>
              <Link href="/timetable" className="group">
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-cyan-500/50 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-cyan-600 transition-colors">Timetable Solver (Full Control)</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Generate schedules, resolve conflicts, and run AI substitution auto-assign.</p>
                </div>
              </Link>

              <Link href="/classroom-allocation" className="group">
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-purple-500/50 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <LayoutGrid className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-purple-600 transition-colors">Classroom Allocation</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">AI-assisted classroom and specialized laboratory capacity planner.</p>
                </div>
              </Link>

              <Link href="/exams" className="group">
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-rose-500/50 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-rose-600 transition-colors">Examination Center</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Manage exam timetables, invigilator assignments, and hall seating.</p>
                </div>
              </Link>
            </>
          )}

          {/* Teacher Specific Cards */}
          {isTeacher && (
            <>
              <Link href="/my-class" className="group">
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-cyan-500/50 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-cyan-600 transition-colors">My Class Teacher View</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Student roster, guardian contacts, and attendance rates for your assigned class.</p>
                </div>
              </Link>

              <Link href="/homework" className="group">
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-amber-500/50 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-amber-600 transition-colors">Homework Tracker</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Assign daily homework with due dates and submission logs.</p>
                </div>
              </Link>

              <Link href="/doubts" className="group">
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-violet-500/50 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-violet-600 transition-colors">Doubts & Leave Approvals</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Answer student subject doubts and approve/reject leave requests.</p>
                </div>
              </Link>

              <Link href="/announcements" className="group">
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-yellow-500/50 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-yellow-600 transition-colors">Class Announcements</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Post notices, circulars, and test alerts to specific classes.</p>
                </div>
              </Link>

              <Link href="/assign-toppers" className="group">
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-fuchsia-500/50 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-fuchsia-600 transition-colors">Assign Class Toppers</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Assign the academic toppers for your assigned class.</p>
                </div>
              </Link>
            </>
          )}

          {/* Student Specific Cards */}
          {isStudent && (
            <>
              <Link href="/homework" className="group">
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-amber-500/50 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-amber-600 transition-colors">My Homework</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">View homework assignments and due dates for your subjects.</p>
                </div>
              </Link>

              <Link href="/exam-schedule" className="group">
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-indigo-500/50 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-indigo-600 transition-colors">Exam Schedule</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Upcoming midterm & final timetables and exam hall seats.</p>
                </div>
              </Link>

              <Link href="/queries" className="group">
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-violet-500/50 hover:bg-gray-50 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-violet-600 transition-colors">Ask Doubts & Apply Leave</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Ask questions to subject teachers or submit a leave request.</p>
                </div>
              </Link>

              <Link href="/fees" className="group">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-md h-full space-y-2 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-brand-black group-hover:text-emerald-600 transition-colors">Fee Payments</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Pay tuition, bus, or hostel dues with instant digital receipts.</p>
                </div>
              </Link>
            </>
          )}

          {/* Shared Standard Operations */}
          <Link href="/calendar" className="group">
            <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-indigo-500/50 hover:bg-gray-50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-brand-black group-hover:text-indigo-600 transition-colors">Academic Calendar</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Master school calendar for holidays, exams, tech fests, and meetings.</p>
            </div>
          </Link>

          <Link href="/attendance" className="group">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-md h-full space-y-2 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-brand-black group-hover:text-emerald-600 transition-colors">
                {isStudent ? 'My Attendance' : 'Attendance & Logs'}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {isStudent ? 'Track personal attendance percentage.' : isManagement ? 'Per-grade present/absent matrix & staff stats.' : 'Batch marking & daily syllabus work log.'}
              </p>
            </div>
          </Link>

          <Link href="/timetable" className="group">
            <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-indigo-500/50 hover:bg-gray-50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-brand-black group-hover:text-indigo-600 transition-colors">Timetable Grid</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Grade selector LKG–12th and period schedule.</p>
            </div>
          </Link>

          <Link href="/portion" className="group">
            <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-amber-500/50 hover:bg-gray-50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-brand-black group-hover:text-amber-600 transition-colors">Portion Tracker</h3>
              <p className="text-xs text-gray-500 leading-relaxed">Syllabus node hierarchy and real-time completion tracking.</p>
            </div>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DashboardHome() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
