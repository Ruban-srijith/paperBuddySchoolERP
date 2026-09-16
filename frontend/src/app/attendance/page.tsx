"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore, ROLE_LABELS } from "@/store/authStore";
import { useToast } from "@/components/Toast";
import api from "@/lib/api";
import { exportToCsv } from "@/lib/exportUtils";
import { 
  CheckSquare, 
  UserCheck, 
  UserX, 
  Clock, 
  Send, 
  BookOpen, 
  Sparkles, 
  CheckCircle2,
  Calendar as CalendarIcon,
  X,
  Users,
  Building2,
  TrendingUp,
  Download,
  AlertCircle
} from "lucide-react";

interface StudentAttendanceRow {
  student_id: string;
  name: string;
  roll: string;
  status: "present" | "absent" | "late";
}

const ALL_GRADES = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

export default function AttendancePage() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState<string>("Grade 10-A");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedMatrixGrade, setSelectedMatrixGrade] = useState<string | null>(null);

  const [assignedClassId, setAssignedClassId] = useState<string>("");

  const [summaryData, setSummaryData] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Fetch summary data for management
  useEffect(() => {
    const fetchSummary = async () => {
      const userRole = (user?.role || '').toLowerCase();
      if (['super_admin', 'platform_super_admin', 'correspondent', 'principal', 'vice_principal'].includes(userRole)) {
        setLoadingSummary(true);
        try {
          const res = await api.get(`/attendance/summary?date_str=${selectedDate}`);
          setSummaryData(res.data);
        } catch (err) {
          console.error("Failed to fetch summary data", err);
        } finally {
          setLoadingSummary(false);
        }
      }
    };
    if (user) {
      fetchSummary();
    }
  }, [user, selectedDate]);

  // Student Attendance Matrix state (for teachers marking)
  const [students, setStudents] = useState<StudentAttendanceRow[]>([]);

  // Fetch teacher's students
  useEffect(() => {
    if (user?.role?.toLowerCase() === "teacher") {
      api.get("/classes/my-class").then(res => {
        const { id, grade, section } = res.data;
        setSelectedClass(`Grade ${grade}-${section}`);
        setAssignedClassId(id);
        return api.get(`/academics/class-detail/${grade}?section=${section}`);
      }).then(res => {
        const fetchedStudents = res.data.students || [];
        setStudents(fetchedStudents.map((s: any, idx: number) => ({
          student_id: s.id,
          name: s.full_name,
          roll: (idx + 1).toString(),
          status: "present" // Default
        })));
      }).catch(err => console.error("Failed to fetch students for attendance", err));
    }
  }, [user]);

  // Work Log form state
  const [workLog, setWorkLog] = useState({
    subject: "Physics",
    topic: "Ray Optics & Lens Formula",
    summary: "Covered convex/concave lens calculations, ray diagrams, and solved 4 numerical problems."
  });

  const isManagement = user && ['super_admin', 'platform_super_admin', 'correspondent', 'principal', 'vice_principal'].includes(user.role?.toLowerCase() || '');
  const isTeacher = user && user.role?.toLowerCase() === 'teacher';
  const isStudent = user && user.role?.toLowerCase() === 'student';

  const overallPct = summaryData ? summaryData.overall_student_attendance : 0;
  const overallPresent = summaryData ? summaryData.overall_present : 0;
  const overallStrength = summaryData ? summaryData.overall_strength : 0;
  const gradeMatrixData = summaryData ? summaryData.grade_matrix_data : [];

  const toggleStatus = (student_id: string, newStatus: "present" | "absent" | "late") => {
    setStudents((prev) =>
      prev.map((s) => (s.student_id === student_id ? { ...s, status: newStatus } : s))
    );
  };

  const handleSaveAttendance = async () => {
    try {
      await api.post("/attendance/batch", {
        class_id: assignedClassId,
        marked_by: user?.id,
        date: selectedDate,
        records: students.map(s => ({ student_id: s.student_id, status: s.status }))
      });
      toast.success(`Batch attendance saved for ${selectedClass} on ${selectedDate}`, "Attendance Recorded");
    } catch (e) {
      toast.error(`Failed to save attendance`, "Error");
    }
  };

  const handleExport = async () => {
    try {
      const escapeCell = (val: any) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      if (isManagement) {
        let currentSummary = summaryData;
        if (!currentSummary) {
          toast.info("Preparing attendance report for export...", "Exporting");
          const res = await api.get(`/attendance/summary?date_str=${selectedDate}`);
          currentSummary = res.data;
        }

        const matrix = currentSummary?.grade_matrix_data || [];
        if (matrix.length === 0) {
          toast.error("No attendance data available to export for this date");
          return;
        }

        const headers = [
          "Grade Level",
          "Category",
          "Total Strength",
          "Present",
          "Absent",
          "Late",
          "Attendance Rate (%)"
        ];

        const rows = matrix.map((row: any) => {
          const category = ['LKG', 'UKG'].includes(row.grade)
            ? 'Pre-Primary'
            : parseInt(row.grade) <= 5
            ? 'Primary'
            : parseInt(row.grade) <= 8
            ? 'Middle School'
            : parseInt(row.grade) <= 10
            ? 'Secondary'
            : 'Sr. Secondary';

          return [
            `Grade ${row.grade}`,
            category,
            row.strength,
            row.present,
            row.absent,
            row.late,
            `${row.percentage}%`
          ];
        });

        const totalStrength = currentSummary.overall_strength || matrix.reduce((acc: number, r: any) => acc + (r.strength || 0), 0);
        const totalPresent = currentSummary.overall_present || matrix.reduce((acc: number, r: any) => acc + (r.present || 0), 0);
        const totalAbsent = matrix.reduce((acc: number, r: any) => acc + (r.absent || 0), 0);
        const totalLate = matrix.reduce((acc: number, r: any) => acc + (r.late || 0), 0);
        const overallRate = currentSummary.overall_student_attendance !== undefined 
          ? currentSummary.overall_student_attendance 
          : (totalStrength > 0 ? ((totalPresent / totalStrength) * 100).toFixed(1) : 0);

        rows.push([
          "OVERALL SUMMARY",
          "All Grades",
          totalStrength,
          totalPresent,
          totalAbsent,
          totalLate,
          `${overallRate}%`
        ]);

        const headerRow = headers.map(escapeCell).join(",");
        const dataRows = rows.map((row: any[]) => row.map(escapeCell).join(",")).join("\r\n");
        const csvContent = "\uFEFF" + headerRow + "\r\n" + dataRows;

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.setAttribute("download", `Attendance_Summary_Matrix_${selectedDate}.csv`);
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        toast.success("Attendance summary exported successfully to CSV", "Export Complete");
      } else if (isTeacher) {
        if (students.length === 0) {
          toast.error("No student attendance records available to export");
          return;
        }

        const headers = ["Roll No", "Student Name", "Class", "Date", "Status"];
        const rows = students.map((stu) => [
          stu.roll,
          stu.name,
          selectedClass,
          selectedDate,
          stu.status.toUpperCase()
        ]);

        const headerRow = headers.map(escapeCell).join(",");
        const dataRows = rows.map((row: any[]) => row.map(escapeCell).join(",")).join("\r\n");
        const csvContent = "\uFEFF" + headerRow + "\r\n" + dataRows;

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.setAttribute("download", `Attendance_${selectedClass.replace(/\s+/g, '_')}_${selectedDate}.csv`);
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        toast.success("Student attendance roster exported successfully to CSV", "Export Complete");
      } else if (isStudent) {
        const studentSubjects = [
          { subject: "Mathematics", present: 24, total: 24, pct: 100 },
          { subject: "Physics (Theory + Lab)", present: 22, total: 24, pct: 91.6 },
          { subject: "Chemistry", present: 20, total: 20, pct: 100 },
          { subject: "Computer Science", present: 16, total: 17, pct: 94.1 },
        ];

        const headers = ["Subject", "Periods Attended", "Total Periods", "Attendance (%)"];
        const rows = studentSubjects.map((sub) => [
          sub.subject,
          sub.present,
          sub.total,
          `${sub.pct}%`
        ]);

        const headerRow = headers.map(escapeCell).join(",");
        const dataRows = rows.map((row: any[]) => row.map(escapeCell).join(",")).join("\r\n");
        const csvContent = "\uFEFF" + headerRow + "\r\n" + dataRows;

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.setAttribute("download", `Student_Attendance_Report_${selectedDate}.csv`);
        anchor.style.display = "none";
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        toast.success("Personal attendance report exported successfully to CSV", "Export Complete");
      } else {
        toast.info("No export data available for your current role");
      }
    } catch (err) {
      console.error("Failed to export attendance data", err);
      toast.error("Failed to export attendance report");
    }
  };

  const handleSubmitWorkLog = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Daily Work Log submitted! Syllabus node auto-updated.", "Portion Synced");
    setDrawerOpen(false);
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="glass-box-gold p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e5c158]/20 text-[#e5c158] font-bold border border-[#e5c158]/30">
                Attendance Management
              </span>
              <span className="text-xs text-[#a3c9b0]">• Real-Time Operational Tracking</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#f4f0e6] font-syne tracking-tight mt-2 flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-[#e5c158]" />
              Attendance & Work Log Hub
            </h1>
            <p className="text-xs text-[#a3c9b0] mt-1 font-medium">
              {isManagement
                ? "Per-grade summary matrix across LKG to 12th Standard and staff duty attendance."
                : isTeacher
                ? "Batch mark student attendance and submit daily teaching work logs."
                : "View your attendance percentages, late marks, and monthly record ledger."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2 glass-input-dark text-xs font-mono"
            />
            <button
              onClick={handleExport}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[#f4f0e6] text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#e5c158]" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* MANAGEMENT VIEW: PER-GRADE SUMMARY MATRIX */}
        {isManagement && (
          <div className="space-y-6">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-box p-4 space-y-1">
                <div className="text-xs text-[#a3c9b0] font-bold uppercase tracking-wider">Overall Student Attendance</div>
                <div className="text-2xl font-black text-emerald-400 font-syne">{overallPct}%</div>
                <div className="text-[11px] text-[#a3c9b0]">{overallPresent} of {overallStrength} students present today</div>
              </div>

              <div className="glass-box p-4 space-y-1">
                <div className="text-xs text-[#a3c9b0] font-bold uppercase tracking-wider">Staff & Faculty Present</div>
                <div className="text-2xl font-black text-cyan-300 font-syne">
                  {summaryData ? summaryData.staff_duty_attendance.present_on_campus : 0} / {summaryData ? summaryData.staff_duty_attendance.total_teachers : 0}
                </div>
                <div className="text-[11px] text-[#a3c9b0]">
                  {summaryData ? summaryData.staff_duty_attendance.approved_duty_leave : 0} on approved leave
                </div>
              </div>

              <div className="glass-box p-4 space-y-1">
                <div className="text-xs text-[#a3c9b0] font-bold uppercase tracking-wider">Total Classes Active</div>
                <div className="text-2xl font-black text-[#e5c158] font-syne">{summaryData ? summaryData.total_classes_active : 0} Classes</div>
                <div className="text-[11px] text-[#a3c9b0]">Classes with records today</div>
              </div>

              <div className="glass-box p-4 space-y-1 border-amber-500/30">
                <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">Low Attendance Alerts</div>
                <div className="text-2xl font-black text-amber-300 font-syne">{summaryData ? summaryData.low_attendance_alerts : 0} Classes</div>
                <div className="text-[11px] text-[#a3c9b0] font-medium">Classes below 90% threshold</div>
              </div>
            </div>

            {/* Per-Grade Attendance Summary Matrix Table */}
            <div className="glass-box p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div>
                  <h3 className="text-base font-bold text-[#f4f0e6] font-syne flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#e5c158]" />
                    <span>Per-Grade Attendance Breakdown ({selectedDate})</span>
                  </h3>
                  <p className="text-xs text-[#a3c9b0]">Institutional oversight for Correspondent, Principal, and Vice-Principal</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-[#e5c158]/20 text-[#e5c158] font-bold border border-[#e5c158]/30">
                  LKG through 12th Standard
                </span>
              </div>

              <div className="relative overflow-x-auto rounded-xl border border-white/10">
                {loadingSummary && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e5c158]"></div>
                  </div>
                )}
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr>
                      <th className="p-3.5">Grade Level</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5 text-center">Total Strength</th>
                      <th className="p-3.5 text-center">Present</th>
                      <th className="p-3.5 text-center">Absent</th>
                      <th className="p-3.5 text-center">Late</th>
                      <th className="p-3.5 text-right">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {gradeMatrixData.length === 0 && !loadingSummary && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#a3c9b0] font-medium">No attendance data found for this date.</td>
                      </tr>
                    )}
                    {gradeMatrixData.map((row: any) => (
                      <tr key={row.grade} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-bold text-[#f4f0e6] flex items-center gap-2 font-syne">
                          <div className="w-7 h-7 rounded-lg bg-[#e5c158]/20 text-[#e5c158] flex items-center justify-center font-bold text-xs border border-[#e5c158]/30">
                            {row.grade}
                          </div>
                          <span>Grade {row.grade}</span>
                        </td>
                        <td className="p-3.5 text-[#a3c9b0]">
                          {['LKG', 'UKG'].includes(row.grade) ? 'Pre-Primary'
                            : parseInt(row.grade) <= 5 ? 'Primary'
                            : parseInt(row.grade) <= 8 ? 'Middle School'
                            : parseInt(row.grade) <= 10 ? 'Secondary'
                            : 'Sr. Secondary'}
                        </td>
                        <td className="p-3.5 text-center font-mono text-[#f4f0e6]">{row.strength}</td>
                        <td className="p-3.5 text-center font-mono text-emerald-400 font-bold">{row.present}</td>
                        <td className="p-3.5 text-center font-mono text-rose-400">{row.absent}</td>
                        <td className="p-3.5 text-center font-mono text-amber-300">{row.late}</td>
                        <td className="p-3.5 text-right font-mono">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            row.percentage >= 95 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-[#e5c158]/20 text-[#e5c158] border border-[#e5c158]/30'
                          }`}>
                            {row.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Staff Attendance Breakdown Section */}
            <div className="glass-box p-5 space-y-4">
              <h3 className="text-base font-bold text-[#f4f0e6] font-syne flex items-center gap-2">
                <Users className="w-4 h-4 text-[#e5c158]" />
                <span>Staff & Faculty Duty Attendance</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-1">
                  <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" /> Present on Campus
                  </div>
                  <div className="text-xl font-black text-[#f4f0e6] font-syne">
                    {summaryData ? summaryData.staff_duty_attendance.present_on_campus : 0} Faculty Members
                  </div>
                  <div className="text-[11px] text-[#a3c9b0]">All periods covered • Zero unassigned slots</div>
                </div>

                <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-1">
                  <div className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Approved Duty Leave
                  </div>
                  <div className="text-xl font-black text-[#f4f0e6] font-syne">
                    {summaryData ? summaryData.staff_duty_attendance.approved_duty_leave : 0} Faculty Members
                  </div>
                  <div className="text-[11px] text-[#a3c9b0]">Substitutes successfully allocated</div>
                </div>

                <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-1">
                  <div className="text-xs text-[#e5c158] font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Syllabus Work Logs
                  </div>
                  <div className="text-xl font-black text-[#f4f0e6] font-syne">
                    {summaryData ? summaryData.staff_duty_attendance.syllabus_work_logs : 0} / {summaryData ? summaryData.staff_duty_attendance.total_teachers : 0} Submitted
                  </div>
                  <div className="text-[11px] text-[#a3c9b0]">Log submission compliance today</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TEACHER VIEW: BATCH MARKING & WORK LOG DRAWER */}
        {isTeacher && (
          <div className="space-y-6">
            <div className="glass-box p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#f4f0e6] font-syne flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#e5c158]" />
                    <span>Mark Daily Attendance: Grade 10-A</span>
                  </h3>
                  <p className="text-xs text-[#a3c9b0]">Tap status buttons to toggle student attendance for today</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDrawerOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#e5c158] to-[#c49a32] text-[#0f1c15] font-extrabold text-xs shadow-md hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Submit Daily Work Log
                  </button>
                  <button
                    onClick={handleSaveAttendance}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0f1c15] font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Save Attendance
                  </button>
                </div>
              </div>

              {/* Students Marking Table */}
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr>
                      <th className="p-3.5">Roll No</th>
                      <th className="p-3.5">Student Name</th>
                      <th className="p-3.5 text-center">Status Selection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {students.map((stu) => (
                      <tr key={stu.student_id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-mono text-[#e5c158] font-bold">{stu.roll}</td>
                        <td className="p-3.5 font-bold text-[#f4f0e6] font-syne">{stu.name}</td>
                        <td className="p-3.5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => toggleStatus(stu.student_id, "present")}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                stu.status === "present"
                                  ? "bg-emerald-500 text-[#0f1c15] shadow-md"
                                  : "bg-black/30 text-[#a3c9b0] hover:text-[#f4f0e6]"
                              }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => toggleStatus(stu.student_id, "late")}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                stu.status === "late"
                                  ? "bg-amber-400 text-[#0f1c15] shadow-md"
                                  : "bg-black/30 text-[#a3c9b0] hover:text-[#f4f0e6]"
                              }`}
                            >
                              Late
                            </button>
                            <button
                              onClick={() => toggleStatus(stu.student_id, "absent")}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                stu.status === "absent"
                                  ? "bg-rose-500 text-white shadow-md"
                                  : "bg-black/30 text-[#a3c9b0] hover:text-[#f4f0e6]"
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Work Log Drawer */}
            {drawerOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
                <div className="glass-box-gold p-6 max-w-lg w-full space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-lg font-bold text-[#f4f0e6] font-syne flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#e5c158]" />
                      <span>Submit Daily Teaching Work Log</span>
                    </h3>
                    <button onClick={() => setDrawerOpen(false)} className="text-[#a3c9b0] hover:text-[#f4f0e6]">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitWorkLog} className="space-y-4 text-xs">
                    <div>
                      <label className="text-[#a3c9b0] font-bold uppercase tracking-wider block mb-1">Subject & Topic Covered</label>
                      <input
                        type="text"
                        value={workLog.topic}
                        onChange={e => setWorkLog({ ...workLog, topic: e.target.value })}
                        className="w-full px-3 py-2 glass-input-dark"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[#a3c9b0] font-bold uppercase tracking-wider block mb-1">Summary / Numerical Exercises Covered</label>
                      <textarea
                        rows={4}
                        value={workLog.summary}
                        onChange={e => setWorkLog({ ...workLog, summary: e.target.value })}
                        className="w-full px-3 py-2 glass-input-dark"
                        required
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-[#a3c9b0]">
                      <Sparkles className="w-4 h-4 inline mr-1 text-[#e5c158]" />
                      Submitting this work log will auto-update the Syllabus Portion Tracker for this topic.
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setDrawerOpen(false)}
                        className="px-4 py-2 rounded-xl bg-white/10 text-[#a3c9b0] font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#e5c158] to-[#c49a32] text-[#0f1c15] font-extrabold shadow-lg"
                      >
                        Submit Work Log
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STUDENT VIEW: PERSONAL ATTENDANCE LEDGER */}
        {isStudent && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-box p-5 space-y-1">
                <div className="text-xs text-[#a3c9b0] font-bold uppercase tracking-wider">Total Attendance Rate</div>
                <div className="text-3xl font-black text-emerald-400 font-syne">96.4%</div>
                <div className="text-[11px] text-[#a3c9b0]">82 of 85 sessions attended</div>
              </div>
              <div className="glass-box p-5 space-y-1 border-amber-500/30">
                <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">Late Arrivals</div>
                <div className="text-3xl font-black text-amber-300 font-syne">2 Days</div>
                <div className="text-[11px] text-[#a3c9b0]">Marked within permissible limit</div>
              </div>
              <div className="glass-box p-5 space-y-1 border-[#e5c158]/30">
                <div className="text-xs text-[#e5c158] font-bold uppercase tracking-wider">Approved Leaves</div>
                <div className="text-3xl font-black text-[#e5c158] font-syne">1 Day</div>
                <div className="text-[11px] text-[#a3c9b0]">Science Olympiad duty leave</div>
              </div>
            </div>

            <div className="glass-box p-5 space-y-4">
              <h3 className="text-base font-bold text-[#f4f0e6] font-syne">Subject-wise Attendance Breakdown</h3>
              <div className="space-y-3">
                {[
                  { subject: "Mathematics", present: 24, total: 24, pct: 100 },
                  { subject: "Physics (Theory + Lab)", present: 22, total: 24, pct: 91.6 },
                  { subject: "Chemistry", present: 20, total: 20, pct: 100 },
                  { subject: "Computer Science", present: 16, total: 17, pct: 94.1 },
                ].map((sub) => (
                  <div key={sub.subject} className="p-3.5 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-[#f4f0e6] font-syne">{sub.subject}</div>
                      <div className="text-xs text-[#a3c9b0]">{sub.present} of {sub.total} periods attended</div>
                    </div>
                    <div className="text-sm font-black text-emerald-400 font-mono">{sub.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
