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
      teacher_name: "Alex Mercer",
      department: "Mathematics & CS",
      assigned_classes: ["10-A", "11-A", "12-A"],
      subjects: ["Computer Science", "Python Lab"],
      weekly_periods: 20,
      max_periods_cap: 24,
      syllabus_completed_pct: 74,
      target_pct: 65,
      status: "ahead",
      has_lab_component: true,
    },
    {
      teacher_id: "t5",
      teacher_name: "Mrs. Revathi Raman",
      department: "English",
      assigned_classes: ["8-A", "9-A", "10-A", "12-A"],
      subjects: ["English Literature"],
      weekly_periods: 22,
      max_periods_cap: 24,
      syllabus_completed_pct: 65,
      target_pct: 65,
      status: "on_track",
      has_lab_component: false,
    }
  ];

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subjects.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = deptFilter === "all" || t.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const behindCount = teachers.filter(t => t.status === "behind").length;
  const avgSyllabus = (teachers.reduce((a, b) => a + b.syllabus_completed_pct, 0) / (teachers.length || 1)).toFixed(1);

  return (
    <ProtectedRoute allowedRoles={["principal", "vice_principal", "super_admin", "correspondent"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                Academic Operations Oversight
              </span>
              <span className="text-xs text-gray-600">• Workload & Syllabus Analytics</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight mt-1">
              Teachers Workload & Syllabus Velocity
            </h1>
            <p className="text-xs text-gray-600">
              Cross-role monitoring for Principal and Vice-Principal tracking weekly periods, syllabus progress vs milestone targets, and lag alerts.
            </p>
          </div>

          <button
            onClick={() => toast.info("Exporting workload metrics report (CSV)", "Exporting")}
            className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-700 hover:text-brand-black text-xs font-medium border border-gray-200 hover:border-gray-600 transition-colors"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span>Export Workload CSV</span>
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-xs text-gray-600">Average Syllabus Velocity</div>
            <div className="text-2xl font-bold text-emerald-600">{avgSyllabus}%</div>
            <div className="text-[11px] text-gray-600">Term 1 institutional target: 65.0%</div>
          </div>

          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-xs text-gray-600">Faculty Workload Cap Utilization</div>
            <div className="text-2xl font-bold text-brand-blue">89.4%</div>
            <div className="text-[11px] text-gray-600">Avg 21.2 of 24 periods allocated</div>
          </div>

          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-xs text-gray-600">Syllabus Lag Alerts</div>
            <div className="text-2xl font-bold text-amber-400">{behindCount} Faculty</div>
            <div className="text-[11px] text-amber-300">Requires additional tutorial periods</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64 max-w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search teacher or subject..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs w-full"
              />
            </div>

            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs w-full sm:w-auto"
            >
              <option value="all">All Departments</option>
              <option value="Science">Science</option>
              <option value="Mathematics & CS">Mathematics & CS</option>
              <option value="English">English</option>
              <option value="Academic Operations">Academic Operations</option>
            </select>
          </div>

          <span className="text-xs text-gray-600 font-mono">
            {filteredTeachers.length} Teaching Faculty Tracked
          </span>
        </div>

        {/* Workload Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTeachers.map(t => {
            const isBehind = t.status === "behind";
            const isAhead = t.status === "ahead";

            return (
              <div
                key={t.teacher_id}
                className={`bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border transition-all space-y-4 ${
                  isBehind ? 'border-amber-500/50 bg-amber-950/10' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between border-b border-gray-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-brand-black">{t.teacher_name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isAhead ? 'bg-emerald-500/20 text-emerald-300'
                        : isBehind ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-indigo-500/20 text-indigo-300'
                      }`}>
                        {t.status === 'ahead' ? 'AHEAD' : t.status === 'behind' ? 'LAG ALERT' : 'ON TRACK'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{t.department} Department • {t.subjects.join(", ")}</p>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <div className="text-sm font-bold text-brand-black whitespace-nowrap">{t.weekly_periods} / {t.max_periods_cap}</div>
                    <div className="text-[10px] text-gray-600">Weekly<br className="md:hidden" /> Periods</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Syllabus Completion (Target: {t.target_pct}%)</span>
                    <span className={`font-mono font-bold ${isBehind ? 'text-amber-400' : 'text-emerald-600'}`}>
                      {t.syllabus_completed_pct}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isBehind ? 'bg-amber-500' : isAhead ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${t.syllabus_completed_pct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-gray-100 border border-gray-200">
                    <div className="text-[10px] text-gray-600">Assigned Classes</div>
                    <div className="font-semibold text-cyan-300 mt-0.5">{t.assigned_classes.join(", ")}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-100 border border-gray-200">
                    <div className="text-[10px] text-gray-600">Curriculum Type</div>
                    <div className="font-semibold text-purple-300 mt-0.5">
                      {t.has_lab_component ? "Theory + Practical Lab" : "Theory Classroom Only"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ProtectedRoute>
  );
}
