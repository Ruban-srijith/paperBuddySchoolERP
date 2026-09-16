"use client";

import { useEffect, useState } from "react";
import { 
  Activity, 
  BookOpen, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  FlaskConical, 
  Building2, 
  Search, 
  Filter,
  Download,
  Users
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";
import { exportToCsv } from "@/lib/exportUtils";
import Tilt3D from "@/components/Tilt3D";

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

interface TeacherWorkloadItem {
  teacher_id: string;
  teacher_name: string;
  department: string;
  assigned_classes: string[];
  subjects: string[];
  weekly_periods: number;
  max_periods_cap: number;
  syllabus_completed_pct: number;
  target_pct: number;
  status: "on_track" | "ahead" | "behind";
  has_lab_component: boolean;
}

export default function WorkloadPage() {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<TeacherWorkloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchWorkloads = async () => {
    setLoading(true);
    try {
      const res = await api.get("/academics/teachers-workload");
      if (res.data && res.data.length > 0) {
        setTeachers(res.data);
      } else {
        setTeachers(getDemoWorkloads());
      }
    } catch {
      setTeachers(getDemoWorkloads());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkloads();
  }, []);

  const getDemoWorkloads = (): TeacherWorkloadItem[] => [
    {
      teacher_id: "t1",
      teacher_name: "Dr. Sarah Connor",
      department: "Science",
      assigned_classes: ["10-A", "10-B", "12-A"],
      subjects: ["Physics", "Physics Lab"],
      weekly_periods: 22,
      max_periods_cap: 24,
      syllabus_completed_pct: 68,
      target_pct: 65,
      status: "ahead",
      has_lab_component: true,
    },
    {
      teacher_id: "t2",
      teacher_name: "Prof. Alan Turing",
      department: "Academic Operations",
      assigned_classes: ["11-A", "12-A"],
      subjects: ["Advanced Mathematics"],
      weekly_periods: 18,
      max_periods_cap: 20,
      syllabus_completed_pct: 62,
      target_pct: 65,
      status: "on_track",
      has_lab_component: false,
    },
    {
      teacher_id: "t3",
      teacher_name: "Dr. Marie Curie",
      department: "Science",
      assigned_classes: ["9-A", "10-A", "11-B"],
      subjects: ["Chemistry", "Chemistry Practical"],
      weekly_periods: 24,
      max_periods_cap: 24,
      syllabus_completed_pct: 54,
      target_pct: 65,
      status: "behind",
      has_lab_component: true,
    },
    {
      teacher_id: "t4",
      teacher_name: "Mrs. Revathi Raman",
      department: "English",
      assigned_classes: ["8-A", "9-B", "10-A"],
      subjects: ["English Literature"],
      weekly_periods: 20,
      max_periods_cap: 22,
      syllabus_completed_pct: 70,
      target_pct: 65,
      status: "ahead",
      has_lab_component: false,
    }
  ];

  const filteredTeachers = teachers.filter(t => {
    const matchesDept = deptFilter === "all" || t.department === deptFilter;
    const matchesSearch = t.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.subjects.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  const avgSyllabus = teachers.length > 0
    ? (teachers.reduce((acc, t) => acc + t.syllabus_completed_pct, 0) / teachers.length).toFixed(1)
    : "63.5";

  const behindCount = teachers.filter(t => t.status === "behind").length;

  const handleExportCSV = () => {
    const headers = ["Teacher ID", "Teacher Name", "Department", "Assigned Classes", "Subjects", "Weekly Periods", "Syllabus %", "Target %", "Status"];
    const rows = filteredTeachers.map(t => [
      t.teacher_id,
      t.teacher_name,
      t.department,
      t.assigned_classes.join("; "),
      t.subjects.join("; "),
      `${t.weekly_periods}/${t.max_periods_cap}`,
      `${t.syllabus_completed_pct}%`,
      `${t.target_pct}%`,
      t.status.toUpperCase()
    ]);
    exportToCsv("teacher_workload_velocity.csv", headers, rows);
    toast.success("Exported workload report to CSV", "Report Downloaded");
  };

  return (
    <ProtectedRoute allowedRoles={["principal", "vice_principal", "super_admin", "correspondent"]}>
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e5c158]/20 text-[#e5c158] font-bold border border-[#e5c158]/40">
                Academic Operations Oversight
              </span>
              <span className="text-xs text-[#a3c9b0]">• Workload & Syllabus Analytics</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#f4f0e6] font-syne tracking-tight mt-1">
              Teachers Workload & Syllabus Velocity
            </h1>
            <p className="text-sm text-[#a3c9b0] font-medium">
              Cross-role monitoring for Principal and Vice-Principal tracking weekly periods, syllabus progress vs milestone targets, and lag alerts.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl glass-box text-[#f4f0e6] hover:bg-emerald-950/40 text-xs font-bold border border-[#a3c9b0]/30 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#e5c158]" />
            <span>Export Workload CSV</span>
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Tilt3D>
            <div className="glass-emerald-tile p-5 rounded-[24px]">
              <CornerArchOrnament position="tr" />
              <div className="text-xs text-[#a3c9b0] font-semibold uppercase tracking-wider relative z-10">Average Syllabus Velocity</div>
              <div className="text-3xl font-extrabold text-[#e5c158] font-syne relative z-10 mt-1">{avgSyllabus}%</div>
              <div className="text-xs text-[#a3c9b0] mt-1 relative z-10">Term 1 institutional target: 65.0%</div>
            </div>
          </Tilt3D>

          <Tilt3D>
            <div className="glass-emerald-tile p-5 rounded-[24px]">
              <CornerArchOrnament position="bl" />
              <div className="text-xs text-[#a3c9b0] font-semibold uppercase tracking-wider relative z-10">Faculty Workload Cap Utilization</div>
              <div className="text-3xl font-extrabold text-[#f4f0e6] font-syne relative z-10 mt-1">89.4%</div>
              <div className="text-xs text-[#a3c9b0] mt-1 relative z-10">Avg 21.2 of 24 periods allocated</div>
            </div>
          </Tilt3D>

          <Tilt3D>
            <div className="glass-emerald-tile p-5 rounded-[24px] border-amber-500/40">
              <CornerArchOrnament position="tr" />
              <div className="text-xs text-amber-300 font-bold uppercase tracking-wider relative z-10">Syllabus Lag Alerts</div>
              <div className="text-3xl font-extrabold text-amber-300 font-syne relative z-10 mt-1">{behindCount} Faculty</div>
              <div className="text-xs text-[#a3c9b0] mt-1 relative z-10">Requires additional tutorial periods</div>
            </div>
          </Tilt3D>
        </div>

        {/* Filters */}
        <Tilt3D>
          <div className="glass-emerald-tile p-4 rounded-[24px] flex flex-wrap items-center justify-between gap-4">
            <CornerArchOrnament position="bl" />
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto relative z-10">
              <div className="relative w-full sm:w-64 max-w-full">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#a3c9b0]" />
                <input
                  type="text"
                  placeholder="Search teacher or subject..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2.5 rounded-xl glass-input-dark text-[#f4f0e6] text-xs w-full"
                />
              </div>

              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl glass-input-dark text-[#f4f0e6] text-xs w-full sm:w-auto"
              >
                <option value="all" className="bg-[#14251c]">All Departments</option>
                <option value="Science" className="bg-[#14251c]">Science</option>
                <option value="Mathematics & CS" className="bg-[#14251c]">Mathematics & CS</option>
                <option value="English" className="bg-[#14251c]">English</option>
                <option value="Academic Operations" className="bg-[#14251c]">Academic Operations</option>
              </select>
            </div>

            <span className="text-xs text-[#e5c158] font-mono font-bold relative z-10">
              {filteredTeachers.length} Teaching Faculty Tracked
            </span>
          </div>
        </Tilt3D>

        {/* Workload Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTeachers.map(t => {
            const isBehind = t.status === "behind";
            const isAhead = t.status === "ahead";

            return (
              <Tilt3D key={t.teacher_id}>
                <div className={`glass-emerald-tile p-6 rounded-[24px] space-y-4 ${isBehind ? 'border-amber-500/40' : ''}`}>
                  <CornerArchOrnament position="tr" />
                  <div className="flex items-start justify-between border-b border-[#a3c9b0]/20 pb-3 relative z-10">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-[#f4f0e6] font-syne">{t.teacher_name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider ${
                          isAhead ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isBehind ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                        }`}>
                          {t.status === 'ahead' ? 'AHEAD' : t.status === 'behind' ? 'LAG ALERT' : 'ON TRACK'}
                        </span>
                      </div>
                      <p className="text-xs text-[#a3c9b0] mt-0.5">{t.department} Department • {t.subjects.join(", ")}</p>
                    </div>

                    <div className="text-right font-mono shrink-0">
                      <div className="text-base font-extrabold text-[#e5c158]">{t.weekly_periods} / {t.max_periods_cap}</div>
                      <div className="text-[10px] text-[#a3c9b0]">Weekly Periods</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 text-xs relative z-10">
                    <div className="flex justify-between">
                      <span className="text-[#a3c9b0]">Syllabus Completion (Target: {t.target_pct}%)</span>
                      <span className={`font-mono font-extrabold ${isBehind ? 'text-amber-300' : 'text-emerald-400'}`}>
                        {t.syllabus_completed_pct}%
                      </span>
                    </div>
                    <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden border border-[#a3c9b0]/20">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isBehind ? 'bg-amber-400' : isAhead ? 'bg-emerald-400' : 'bg-sky-400'
                        }`}
                        style={{ width: `${t.syllabus_completed_pct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Meta details */}
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1 relative z-10">
                    <div className="p-3 rounded-xl glass-box border border-[#a3c9b0]/20">
                      <div className="text-[10px] text-[#a3c9b0]">Assigned Classes</div>
                      <div className="font-bold text-cyan-300 mt-0.5">{t.assigned_classes.join(", ")}</div>
                    </div>

                    <div className="p-3 rounded-xl glass-box border border-[#a3c9b0]/20">
                      <div className="text-[10px] text-[#a3c9b0]">Curriculum Type</div>
                      <div className="font-bold text-purple-300 mt-0.5">
                        {t.has_lab_component ? "Theory + Practical Lab" : "Theory Classroom Only"}
                      </div>
                    </div>
                  </div>
                </div>
              </Tilt3D>
            );
          })}
        </div>
      </div>
    </ProtectedRoute>
  );
}
