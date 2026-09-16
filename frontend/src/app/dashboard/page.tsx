"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { 
  FileSearch, Calendar, CheckSquare, BookOpen, FlaskConical, 
  Mail, ArrowRight, TrendingUp, Users, Award, CheckCircle2,
  Building2, Shield, GraduationCap, DollarSign, Clock, Activity,
  FileSpreadsheet, LayoutGrid, FileCheck, UserCheck, CalendarDays,
  ClipboardList, FileText, HelpCircle, Megaphone, Trophy, X,
  Phone, Sparkles, Bell, ChevronRight, ArrowUpRight
} from "lucide-react";
import { useAuthStore, ROLE_LABELS, ROLE_COLORS, ROLE_NAV_ITEMS } from "@/store/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageLoader from "@/components/PageLoader";
import api from "@/lib/api";
import Tilt3D from "@/components/Tilt3D";

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

// SVG Quarter-Circle Corner Arch Ornament
function CornerArchOrnament({ position = "tr" }: { position?: "tr" | "bl" | "br" }) {
  if (position === "tr") {
    return (
      <svg className="corner-arch-tr" viewBox="0 0 100 100" fill="none" stroke="#43634e" strokeWidth="1.5">
        <path d="M 100 0 A 100 100 0 0 0 0 100" />
        <path d="M 100 20 A 80 80 0 0 0 20 100" />
        <path d="M 100 40 A 60 60 0 0 0 40 100" />
        <path d="M 100 60 A 40 40 0 0 0 60 100" />
      </svg>
    );
  }
  return (
    <svg className="corner-arch-bl" viewBox="0 0 100 100" fill="none" stroke="#43634e" strokeWidth="1.5">
      <path d="M 0 100 A 100 100 0 0 1 100 0" />
      <path d="M 0 80 A 80 80 0 0 1 80 0" />
      <path d="M 0 60 A 60 60 0 0 1 60 0" />
      <path d="M 0 40 A 40 40 0 0 1 40 0" />
    </svg>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [stats, setStats] = useState({
    totalStudents: 1420,
    totalTeachers: 68,
    totalClasses: 28,
    totalDepts: 3,
  });

  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>("A");
  const [classDetail, setClassDetail] = useState<ClassDetailModalData | null>(null);
  const [loadingClass, setLoadingClass] = useState(false);
  const [activeClasses, setActiveClasses] = useState<{grade: string, sections: string[]}[]>([]);
  const [totalSections, setTotalSections] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, classesRes] = await Promise.allSettled([
          api.get('/users/by-role/student'),
          api.get('/classes')
        ]);
        if (studentsRes.status === 'fulfilled' && studentsRes.value.data.length > 0) {
          setStats(prev => ({ ...prev, totalStudents: studentsRes.value.data.length }));
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

  const handleSectionClick = (sec: string) => {
    if (selectedGrade && sec !== selectedSection) {
      setSelectedSection(sec);
      fetchClassDetail(selectedGrade, sec);
    }
  };

  if (!user) return <PageLoader />;

  const roleLabel = ROLE_LABELS[user.role];
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

  // Attendance Stacked Bar Data (Matching Reference UI)
  const attendanceBars = [
    { grade: "G1", h1: 35, h2: 30, h3: 25 }, // 90%
    { grade: "G2", h1: 45, h2: 25, h3: 20 }, // 90%
    { grade: "G3", h1: 30, h2: 35, h3: 25 }, // 90%
    { grade: "G4", h1: 40, h2: 30, h3: 20 }, // 90%
    { grade: "G5", h1: 25, h2: 40, h3: 25 }, // 90%
  ];

  // Grades Multi-line Chart Data (Matching Reference UI)
  const gradesMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Sep", "Oct"];
  const lineSeries1 = [54, 74, 70, 83, 80, 75, 95]; // Emerald line
  const lineSeries2 = [65, 74, 77, 65, 80, 90, 78]; // Sage line

  // Assignments Data (Matching Reference UI)
  const assignmentRows = [
    { name: "Upcoming Assignment", deadline: "May 11, 2026", date: "May 17, 2026" },
    { name: "Assignment Plan", deadline: "May 15, 2026", date: "May 18, 2026" },
    { name: "Assignment Plan", deadline: "May 19, 2026", date: "May 27, 2026" },
    { name: "Assignment Plan", deadline: "May 23, 2026", date: "May 23, 2026" },
  ];

  // Notifications List (Matching Reference UI)
  const notificationItems = [
    { title: "School Alerts", desc: "School alerts notification: Attendance log published for Grade 10." },
    { title: "School Alerts Notification", desc: "Campus hackathon registration closes tomorrow at 5:00 PM." },
    { title: "School Diploma Present", desc: "Official digital signatures and transcript releases available now." },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8">
      
      {/* 4 MAIN REFERENCE CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* 1. ATTENDANCE CARD (Top Left - 6 Cols) */}
        <Tilt3D className="lg:col-span-6 rounded-[24px]">
          <div className="glass-emerald-tile p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] h-full">
            <CornerArchOrnament position="tr" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 relative z-10">
              <h2 className="text-lg sm:text-xl font-bold text-[#f4f0e6] font-syne">Attendance</h2>
              <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-semibold text-[#a3c9b0]">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#e8e2d3]" /> 90%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#4e8260]" /> 70%</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#12281b]" /> 50%</span>
              </div>
            </div>

            <div className="pt-2 pb-1 relative z-10">
              <div className="h-56 flex items-end justify-between gap-2 sm:gap-3 px-1 sm:px-4">
                {/* Y-Axis Labels */}
                <div className="flex flex-col justify-between h-full text-[11px] font-bold text-[#a3c9b0] pr-2 border-r border-[#a3c9b0]/25">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>

                {/* Stacked Bars */}
                {attendanceBars.map((b) => (
                  <div key={b.grade} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full max-w-[48px] h-44 flex flex-col justify-end gap-0.5">
                      {/* Top segment 90% */}
                      <div className="w-full bg-[#e8e2d3] rounded-t-md" style={{ height: `${b.h3}%` }} />
                      {/* Mid segment 70% */}
                      <div className="w-full bg-[#4e8260]" style={{ height: `${b.h2}%` }} />
                      {/* Bottom segment 50% */}
                      <div className="w-full bg-[#12281b] rounded-b-md" style={{ height: `${b.h1}%` }} />
                    </div>
                    <span className="text-xs font-bold text-[#e8e2d3]">{b.grade}</span>
                  </div>
                ))}
              </div>
              <div className="text-center text-xs font-bold text-[#a3c9b0] mt-2">Grades</div>
            </div>
          </div>
        </Tilt3D>

        {/* 2. GRADES CARD (Top Right - 6 Cols) */}
        <Tilt3D className="lg:col-span-6 rounded-[24px]">
          <div className="glass-emerald-tile p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] h-full">
            <CornerArchOrnament position="bl" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h2 className="text-lg sm:text-xl font-bold text-[#f4f0e6] font-syne">Grades</h2>
              <span className="text-xs font-bold text-[#a3c9b0]">Class Average Score</span>
            </div>

            <div className="pt-2 pb-1 relative z-10">
              <div className="h-56 w-full flex flex-col justify-between relative px-2">
                {/* Grid Lines */}
                <div className="absolute inset-x-0 inset-y-0 flex flex-col justify-between pointer-events-none opacity-25">
                  <div className="border-b border-[#a3c9b0]" />
                  <div className="border-b border-[#a3c9b0]" />
                  <div className="border-b border-[#a3c9b0]" />
                  <div className="border-b border-[#a3c9b0]" />
                  <div className="border-b border-[#a3c9b0]" />
                  <div className="border-b border-[#a3c9b0]" />
                </div>

                {/* Line Chart SVG Overlay */}
                <svg className="absolute inset-0 w-full h-44 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  {/* Series 1 Gold/Cream Line */}
                  <polyline
                    fill="none"
                    stroke="#e8e2d3"
                    strokeWidth="2.5"
                    points="0,92 16.6,52 33.3,60 50,34 66.6,40 83.3,50 100,10"
                  />
                  {/* Series 2 Sage/Emerald Line */}
                  <polyline
                    fill="none"
                    stroke="#4e8260"
                    strokeWidth="2.5"
                    points="0,70 16.6,52 33.3,46 50,70 66.6,40 83.3,20 100,44"
                  />
                </svg>

                {/* Data Nodes & Axis */}
                <div className="h-44 flex items-end justify-between relative z-10 text-[11px] font-bold text-[#a3c9b0]">
                  {gradesMonths.map((m) => (
                    <div key={m} className="flex flex-col items-center justify-end h-full">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#e8e2d3] border-2 border-[#12281b] mb-auto" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Tilt3D>

        {/* 3. ASSIGNMENTS CARD (Bottom Left - 6 Cols) */}
        <Tilt3D className="lg:col-span-6 rounded-[24px]">
          <div className="glass-emerald-tile p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] h-full">
            <CornerArchOrnament position="tr" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <h2 className="text-lg sm:text-xl font-bold text-[#f4f0e6] font-syne">Assignments</h2>
              <Link href="/assignments" className="text-xs font-bold text-[#a3c9b0] hover:text-[#f4f0e6] flex items-center gap-1">
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto relative z-10">
              <table>
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Deadline</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {assignmentRows.map((row, i) => (
                    <tr key={i}>
                      <td className="font-bold text-[#f4f0e6]">{row.name}</td>
                      <td className="text-[#a3c9b0]">{row.deadline}</td>
                      <td className="text-[#a3c9b0]">{row.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Tilt3D>

        {/* 4. NOTIFICATIONS CARD (Bottom Right - 6 Cols) */}
        <Tilt3D className="lg:col-span-6 rounded-[24px]">
          <div className="glass-emerald-tile p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] h-full">
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#182e22] text-[#e8e2d3] border border-[#e8e2d3]/20 flex items-center justify-center shrink-0 shadow-md">
                  <Bell className="w-5 h-5 text-[#e8e2d3]" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-[#f4f0e6] font-syne">Notifications</h2>
              </div>
            </div>

            <div className="space-y-3.5 relative z-10">
              {notificationItems.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#14291e]/80 border border-[#a3c9b0]/20">
                  <h4 className="text-sm font-bold text-[#f4f0e6]">{item.title}</h4>
                  <p className="text-xs text-[#a3c9b0] mt-1 font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Tilt3D>

      </div>

      {/* PRESERVED: Active Grade Tiers Selector & Modal for Management Roles */}
      {isManagement && (
        <div className="glass-emerald-tile p-6 rounded-[24px] space-y-4">
          <CornerArchOrnament position="tr" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 relative z-10">
            <div>
              <h3 className="text-base font-bold text-[#f4f0e6] font-syne">Active Grade Levels Overview</h3>
              <p className="text-xs text-[#a3c9b0]">Select any grade tier to inspect student roster, class teacher & daily schedule</p>
            </div>
            <span className="text-xs px-3.5 py-1 rounded-full bg-[#12281b] text-[#e5c158] font-bold border border-[#e5c158]/30">
              {activeClasses.length} Grade Tiers • {totalSections} Sections
            </span>
          </div>

          {activeClasses.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#a3c9b0] relative z-10">
              No classes configured yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 relative z-10">
              {activeClasses.map((cls) => {
                const grade = cls.grade;
                const sectionsText = cls.sections.length > 0 
                  ? (cls.sections.length <= 3 ? `Sec ${cls.sections.join(' & ')}` : `${cls.sections.length} Secs`)
                  : "No Sec";
                  
                return (
                  <button
                    key={grade}
                    onClick={() => handleGradeClick(grade)}
                    className={`p-3.5 rounded-xl text-center cursor-pointer transition-all border ${
                      selectedGrade === grade 
                        ? 'bg-[#2b4c37] border-[#e5c158] text-white shadow-[0_4px_15px_rgba(0,0,0,0.5)]' 
                        : 'bg-black/30 border-white/10 text-[#e8e2d3] hover:bg-white/10 hover:border-[#e5c158]/50'
                    }`}
                  >
                    <div className="text-lg font-bold text-[#f4f0e6] font-syne">{grade}</div>
                    <div className="text-[10px] text-[#a3c9b0] font-semibold mt-0.5">{sectionsText}</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Class Detail Modal / Drawer */}
      {selectedGrade && (loadingClass || classDetail) && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-emerald-tile max-w-4xl w-full max-h-[85vh] rounded-[24px] overflow-hidden flex flex-col shadow-2xl border-2 border-[#e5c158]/40">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#e5c158]/20 flex items-start justify-between bg-black/40">
              <div>
                <h3 className="text-lg font-bold text-[#f4f0e6] font-syne">Grade {selectedGrade} Class Details</h3>
                <div className="flex items-center gap-2 mt-2">
                  {activeClasses.find(c => c.grade === selectedGrade)?.sections.map(sec => (
                    <button
                      key={sec}
                      onClick={() => handleSectionClick(sec)}
                      className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all ${
                        selectedSection === sec 
                          ? 'bg-[#e5c158] text-[#12281b] font-bold' 
                          : 'bg-black/40 border border-[#e5c158]/30 text-[#e8e2d3] hover:bg-white/10'
                      }`}
                    >
                      Section {sec}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => { setSelectedGrade(null); setClassDetail(null); }}
                className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-[#e8e2d3] border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingClass ? (
              <div className="p-12 text-center text-xs text-[#a3c9b0] font-semibold">Loading class roster...</div>
            ) : classDetail ? (
              <div className="p-6 overflow-y-auto space-y-6 flex-1 relative z-10">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-black/30 rounded-xl border border-[#e5c158]/20">
                    <div className="text-xs text-[#a3c9b0]">Total Strength</div>
                    <div className="text-base font-bold text-[#f4f0e6] font-syne">{classDetail.total_strength || 0} Students</div>
                  </div>
                  <div className="p-3 bg-black/30 rounded-xl border border-[#e5c158]/20">
                    <div className="text-xs text-[#a3c9b0]">Attendance Rate</div>
                    <div className="text-base font-bold text-[#e5c158] font-syne">{classDetail.attendance_rate || 0}%</div>
                  </div>
                  <div className="p-3 bg-black/30 rounded-xl border border-[#e5c158]/20">
                    <div className="text-xs text-[#a3c9b0]">Syllabus Coverage</div>
                    <div className="text-base font-bold text-[#f4f0e6] font-syne">{classDetail.syllabus_coverage || 0}%</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#e5c158]">Enrolled Students</h4>
                  <div className="overflow-x-auto rounded-xl border border-[#e5c158]/20 bg-black/30 p-2">
                    <table>
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Admission No</th>
                          <th>Guardian Phone</th>
                          <th>Attendance</th>
                          <th className="text-right">GPA</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(classDetail.students || []).map((s) => (
                          <tr key={s.id}>
                            <td className="font-bold text-[#f4f0e6]">{s.full_name}</td>
                            <td className="text-[#a3c9b0]">{s.admission_number || '-'}</td>
                            <td className="text-[#a3c9b0]">{s.guardian_phone || '-'}</td>
                            <td className="text-[#e5c158] font-semibold">{s.attendance_pct || 0}%</td>
                            <td className="text-right font-bold text-[#f4f0e6]">{s.gpa || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>,
        document.body
      )}

      {/* PRESERVED: Role Portals rendered in 3D Emerald Glass Slabs */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[#f4f0e6] font-syne flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e5c158] shadow-[0_0_8px_#e5c158]" />
          {isStudent ? 'Student Operations' : isTeacher ? 'Teaching Portals' : `${roleLabel} Operational Portals`}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {isSuperAdmin && (
            <>
              <Link href="/salary-approvals" className="glass-emerald-tile p-4.5 rounded-2xl block hover:border-[#e5c158] transition-all">
                <h4 className="font-bold text-sm text-[#f4f0e6] font-syne">Salary Approvals</h4>
                <p className="text-xs text-[#a3c9b0] mt-1.5 leading-relaxed">Payroll clearance & allowance management.</p>
              </Link>
              <Link href="/event-approvals" className="glass-emerald-tile p-4.5 rounded-2xl block hover:border-[#e5c158] transition-all">
                <h4 className="font-bold text-sm text-[#f4f0e6] font-syne">Approve Major Events</h4>
                <p className="text-xs text-[#a3c9b0] mt-1.5 leading-relaxed">Inter-school events & budget reviews.</p>
              </Link>
              <Link href="/revenue" className="glass-emerald-tile p-4.5 rounded-2xl block hover:border-[#e5c158] transition-all">
                <h4 className="font-bold text-sm text-[#f4f0e6] font-syne">Monthly Revenue</h4>
                <p className="text-xs text-[#a3c9b0] mt-1.5 leading-relaxed">Tuition, bus, hostel collections breakdown.</p>
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link href="/pending-approvals" className="glass-emerald-tile p-4.5 rounded-2xl block hover:border-[#e5c158] transition-all">
                <h4 className="font-bold text-sm text-[#f4f0e6] font-syne">Pending Approvals</h4>
                <p className="text-xs text-[#a3c9b0] mt-1.5 leading-relaxed">Consolidated leave & substitution requests.</p>
              </Link>
              <Link href="/staff-management" className="glass-emerald-tile p-4.5 rounded-2xl block hover:border-[#e5c158] transition-all">
                <h4 className="font-bold text-sm text-[#f4f0e6] font-syne">Staff Management</h4>
                <p className="text-xs text-[#a3c9b0] mt-1.5 leading-relaxed">Faculty attendance & administration.</p>
              </Link>
              <Link href="/reports" className="glass-emerald-tile p-4.5 rounded-2xl block hover:border-[#e5c158] transition-all">
                <h4 className="font-bold text-sm text-[#f4f0e6] font-syne">Operational Reports</h4>
                <p className="text-xs text-[#a3c9b0] mt-1.5 leading-relaxed">Attendance and financial reports.</p>
              </Link>
            </>
          )}

          {isVicePrincipal && (
            <>
              <Link href="/timetable" className="glass-emerald-tile p-4.5 rounded-2xl block hover:border-[#e5c158] transition-all">
                <h4 className="font-bold text-sm text-[#f4f0e6] font-syne">Timetable Solver</h4>
                <p className="text-xs text-[#a3c9b0] mt-1.5 leading-relaxed">Schedules & AI substitution solver.</p>
              </Link>
              <Link href="/classroom-allocation" className="glass-emerald-tile p-4.5 rounded-2xl block hover:border-[#e5c158] transition-all">
                <h4 className="font-bold text-sm text-[#f4f0e6] font-syne">Classroom Allocation</h4>
                <p className="text-xs text-[#a3c9b0] mt-1.5 leading-relaxed">Laboratory & room capacity planner.</p>
              </Link>
              <Link href="/exams" className="glass-emerald-tile p-4.5 rounded-2xl block hover:border-[#e5c158] transition-all">
                <h4 className="font-bold text-sm text-[#f4f0e6] font-syne">Examination Center</h4>
                <p className="text-xs text-[#a3c9b0] mt-1.5 leading-relaxed">Exams, invigilators, and hall seating.</p>
              </Link>
            </>
          )}

          {isTeacher && (
            <>
              <Link href="/my-class" className="glass-emerald-tile p-4.5 rounded-2xl block hover:border-[#e5c158] transition-all">
                <h4 className="font-bold text-sm text-[#f4f0e6] font-syne">My Class View</h4>
                <p className="text-xs text-[#a3c9b0] mt-1.5 leading-relaxed">Student roster & guardian contacts.</p>
              </Link>
              <Link href="/homework" className="glass-emerald-tile p-4.5 rounded-2xl block hover:border-[#e5c158] transition-all">
                <h4 className="font-bold text-sm text-[#f4f0e6] font-syne">Homework Tracker</h4>
                <p className="text-xs text-[#a3c9b0] mt-1.5 leading-relaxed">Homework assignments & submission logs.</p>
              </Link>
              <Link href="/doubts" className="glass-emerald-tile p-4.5 rounded-2xl block hover:border-[#e5c158] transition-all">
                <h4 className="font-bold text-sm text-[#f4f0e6] font-syne">Doubts & Approvals</h4>
                <p className="text-xs text-[#a3c9b0] mt-1.5 leading-relaxed">Subject doubts & student leave requests.</p>
              </Link>
            </>
          )}

          {isStudent && (
            <>
              <Link href="/homework" className="glass-emerald-tile p-4.5 rounded-2xl block hover:border-[#e5c158] transition-all">
                <h4 className="font-bold text-sm text-[#f4f0e6] font-syne">My Homework</h4>
                <p className="text-xs text-[#a3c9b0] mt-1.5 leading-relaxed">Homework assignments & deadlines.</p>
              </Link>
              <Link href="/exam-schedule" className="glass-emerald-tile p-4.5 rounded-2xl block hover:border-[#e5c158] transition-all">
                <h4 className="font-bold text-sm text-[#f4f0e6] font-syne">Exam Schedule</h4>
                <p className="text-xs text-[#a3c9b0] mt-1.5 leading-relaxed">Midterm & final examination timetables.</p>
              </Link>
              <Link href="/fees" className="glass-emerald-tile p-4.5 rounded-2xl block hover:border-[#e5c158] transition-all">
                <h4 className="font-bold text-sm text-[#f4f0e6] font-syne">Fee Payment Portal</h4>
                <p className="text-xs text-[#a3c9b0] mt-1.5 leading-relaxed">Pay tuition, bus, or hostel dues.</p>
              </Link>
            </>
          )}
        </div>
      </div>

    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
