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

  if (!user) return null;

  const roleLabel = ROLE_LABELS[user.role];
  const roleColor = ROLE_COLORS[user.role];
  const navItems = ROLE_NAV_ITEMS[user.role] || [];
  
  const isSuperAdmin = ['super_admin', 'correspondent'].includes(user.role);
  const isAdmin = ['admin', 'principal'].includes(user.role);
  const isVicePrincipal = ['vice_principal', 'dean', 'dept_head'].includes(user.role);
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
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* Hero Banner */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
        className="glass-panel-glow p-8 rounded-2xl relative overflow-hidden"
      >
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs border border-indigo-400/30">
            <Shield className="w-3.5 h-3.5" />
            <span>Welcome, {roleLabel}</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
            {isStudent ? (
              <>Hello, <span className="text-brand-blue">{user.full_name}</span></>
            ) : isTeacher ? (
              <>Welcome, <span className="text-brand-blue">{user.full_name}</span></>
            ) : (
              <>Welcome to <span className="text-brand-blue">PaperBuddy</span></>
            )}
          </h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            {isStudent 
              ? `Check your timetable, homework assignments, exam schedules, and attendance for Grade ${user.assigned_grade || '10'}.`
              : isTeacher 
              ? 'Manage your class roster, assign homework, mark student attendance, and answer subject queries.'
              : isSuperAdmin
              ? 'Institutional governance portal with salary approvals, major event clearances, revenue analytics, and class topper rankings.'
              : isVicePrincipal
              ? 'Academic operations center: OR-Tools timetable optimizer, exam schedules, classroom allocation, and teacher workload tracking.'
              : 'Complete school operations hub: staff management, pending approvals, operational reports, and grade oversight.'
            }
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-4">
            {isSuperAdmin && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link href="/salary-approvals" className="inline-flex items-center justify-center w-full sm:w-auto space-x-2 px-6 py-3 rounded-full bg-brand-blue text-white font-bold text-sm shadow-md hover:bg-brand-blue/90 transition-all">
                  <DollarSign className="w-4 h-4" />
                  <span>Salary Approvals</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </motion.div>
            )}
            {isAdmin && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link href="/pending-approvals" className="inline-flex items-center justify-center w-full sm:w-auto space-x-2 px-6 py-3 rounded-full bg-brand-blue text-white font-bold text-sm shadow-md hover:bg-brand-blue/90 transition-all">
                  <Clock className="w-4 h-4" />
                  <span>Pending Approvals</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </motion.div>
            )}
            {isVicePrincipal && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link href="/timetable" className="inline-flex items-center justify-center w-full sm:w-auto space-x-2 px-6 py-3 rounded-full bg-brand-blue text-white font-bold text-sm shadow-md hover:bg-brand-blue/90 transition-all">
                  <Calendar className="w-4 h-4" />
                  <span>Timetable Solver</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </motion.div>
            )}
            {isTeacher && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link href="/my-class" className="inline-flex items-center justify-center w-full sm:w-auto space-x-2 px-6 py-3 rounded-full bg-brand-blue text-white font-bold text-sm shadow-md hover:bg-brand-blue/90 transition-all">
                  <GraduationCap className="w-4 h-4" />
                  <span>My Class View</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </motion.div>
            )}
            {isStudent && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link href="/homework" className="inline-flex items-center justify-center w-full sm:w-auto space-x-2 px-6 py-3 rounded-full bg-brand-blue text-white font-bold text-sm shadow-md hover:bg-brand-blue/90 transition-all">
                  <ClipboardList className="w-4 h-4" />
                  <span>My Homework</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </motion.div>
            )}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Link href="/calendar" className="inline-flex items-center justify-center w-full space-x-2 px-6 py-3 rounded-full bg-white text-brand-black font-bold text-sm shadow-sm hover:bg-gray-50 transition-all">
                <CalendarDays className="w-4 h-4 text-brand-blue" />
                <span>Academic Calendar</span>
              </Link>
            </motion.div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </motion.div>

      {/* Grade Levels Overview — Interactive for Superadmin, Admin, and Sub-admin */}
      {isManagement && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div>
              <h2 className="text-lg font-bold text-brand-black">Active Grade Levels</h2>
              <p className="text-xs text-gray-400">Click any grade card to view student roster, class teacher, and today's schedule</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 whitespace-nowrap flex-shrink-0">
              {activeClasses.length} Grade Tiers • {totalSections} Sections
            </span>
          </div>

          {activeClasses.length === 0 ? (
            <div className="py-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">No classes have been created yet.</p>
              <Link href="/classes" className="inline-block mt-3 text-brand-blue font-bold text-xs hover:underline">
                Go to Manage Classes
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {activeClasses.map((cls) => {
                const grade = cls.grade;
                const sectionsText = cls.sections.length > 0 
                  ? (cls.sections.length <= 3 ? `Sec ${cls.sections.join(' & ')}` : `${cls.sections.length} Sections`)
                  : "No Sections";
                  
                return (
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    key={grade}
                    onClick={() => handleGradeClick(grade)}
                    className={`glass-panel p-3.5 rounded-xl text-center hover:border-indigo-500/50 hover:bg-indigo-600/10 transition-colors cursor-pointer group ${
                      selectedGrade === grade ? 'border-indigo-500 bg-indigo-600/20 shadow-lg shadow-indigo-500/10' : ''
                    }`}
                  >
                    <div className="text-xl font-bold text-brand-black group-hover:text-indigo-600 transition-colors">{grade}</div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {['LKG', 'UKG'].includes(grade) ? 'Pre-Primary' 
                        : parseInt(grade) <= 5 ? 'Primary' 
                        : parseInt(grade) <= 8 ? 'Middle' 
                        : parseInt(grade) <= 10 ? 'Secondary' 
                        : 'Sr. Secondary'}
                    </div>
                    <div className="text-[10px] text-cyan-400 mt-0.5 font-medium">{sectionsText}</div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Class Detail Modal / Drawer */}
      {selectedGrade && classDetail && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-gray-200 max-w-4xl w-full max-h-[85vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-gray-50/80">
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue font-bold text-lg flex-shrink-0">
                  {classDetail.grade}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-brand-black flex flex-wrap items-center gap-2">
                    <span>Grade {classDetail.grade} Class Detail</span>
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
                  <p className="text-xs text-gray-500 mt-2 truncate">
                    Class Teacher: <span className="text-brand-black font-semibold">{classDetail.class_teacher}</span> ({classDetail.class_teacher_email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGrade(null)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-black transition-colors flex-shrink-0 ml-4"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-100 bg-gray-50/50 text-center">
              <div className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 font-medium">Total Strength</div>
                <div className="text-xl font-bold text-brand-black mt-1">{classDetail.total_strength} <span className="text-xs text-gray-400 font-medium">Students</span></div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 font-medium">Class Attendance</div>
                <div className="text-xl font-bold text-emerald-600 mt-1">{classDetail.attendance_rate}%</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 font-medium">Syllabus Completion</div>
                <div className="text-xl font-bold text-brand-blue mt-1">{classDetail.syllabus_coverage}%</div>
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
                  {classDetail.schedule_today.length > 0 ? (
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
                        <div className="text-sm font-bold text-brand-black truncate">{s.subject}</div>
                        <div className={`text-[11px] font-medium truncate ${s.isOngoing ? 'text-brand-blue font-bold' : 'text-gray-500'}`}>{s.teacher}</div>
                        <div className="text-[10px] font-bold text-gray-400">{s.room}</div>
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
                  <span>Enrolled Student Roster ({classDetail.students.length})</span>
                </h4>
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                  {classDetail.students.length > 0 ? (
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
                              <div className="w-7 h-7 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center text-[11px] font-bold border border-brand-blue/20">
                                {stu.full_name[0]}
                              </div>
                              {stu.full_name}
                            </td>
                            <td className="p-3.5 font-mono font-semibold text-gray-500 whitespace-nowrap">{stu.admission_number}</td>
                            <td className="p-3.5 font-medium text-gray-700 whitespace-nowrap">{stu.father_name}</td>
                            <td className="p-3.5 text-gray-600 flex items-center gap-1.5 font-mono font-medium whitespace-nowrap">
                              <Phone className="w-3.5 h-3.5 text-brand-blue" />
                              {stu.guardian_phone}
                            </td>
                            <td className="p-3.5 whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                {stu.attendance_pct}%
                              </span>
                            </td>
                            <td className="p-3.5 text-right font-bold text-brand-black whitespace-nowrap">{stu.gpa}</td>
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
                onClick={() => setSelectedGrade(null)}
                className="px-6 py-2.5 w-full sm:w-auto rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
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
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-emerald-500/50 hover:bg-gray-50 transition-all">
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
                <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-emerald-500/50 hover:bg-gray-50 transition-all">
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
            <div className="bg-white p-6 rounded-[24px] h-full space-y-3 border border-gray-100 shadow-sm hover:border-emerald-500/50 hover:bg-gray-50 transition-all">
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
