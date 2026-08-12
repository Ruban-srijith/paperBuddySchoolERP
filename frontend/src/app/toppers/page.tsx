"use client";

import { useEffect, useState } from "react";
import { 
  Trophy, 
  Award, 
  GraduationCap, 
  Star, 
  Search, 
  Filter, 
  Download,
  Sparkles,
  Medal,
  CheckCircle2
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";

interface TopperStudent {
  rank: number;
  student_name: string;
  grade: string;
  section: string;
  total_marks: number;
  gpa: number;
  percentage: number;
  top_subjects: string[];
  attendance_pct: number;
}



export default function ClassToppersPage() {
  const { toast } = useToast();
  const [toppers, setToppers] = useState<TopperStudent[]>([]);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const ALL_GRADES = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

  useEffect(() => {
    async function fetchToppers() {
      try {
        setLoading(true);
        const res = await api.get("/academics/toppers");
        const flatToppers: TopperStudent[] = [];
        res.data.forEach((gObj: any) => {
          gObj.toppers.forEach((t: any) => {
            flatToppers.push({
               rank: t.rank,
               student_name: t.student_name,
               grade: t.grade,
               section: t.section,
               total_marks: t.total_marks || 0,
               gpa: t.gpa,
               percentage: t.percentage,
               top_subjects: t.top_subjects || [],
               attendance_pct: t.attendance_rate || t.attendance_pct || 0
            });
          });
        });
        setToppers(flatToppers);
      } catch (err) {
        console.error("Failed to fetch toppers", err);
      } finally {
        setLoading(false);
      }
    }
    fetchToppers();
  }, []);

  const filteredToppers = toppers.filter(t => (selectedGradeFilter === "all" || t.grade === selectedGradeFilter) && t.rank <= 3);

  return (
    <ProtectedRoute allowedRoles={["super_admin", "correspondent", "admin", "principal"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-semibold border border-yellow-500/30">
                Academic Excellence Honors
              </span>
              <span className="text-xs text-gray-600">• Institutional Hall of Fame</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight mt-1">
              Class Toppers & Merit Honors List
            </h1>
            <p className="text-xs text-gray-600">
              Top rank students across LKG through 12th Standard based on cumulative GPA, term examination results, and consistent attendance.
            </p>
          </div>

          <button
            onClick={() => toast.info("Exporting certified Toppers Roll of Honor PDF", "Exporting")}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-500 text-brand-black font-semibold text-xs shadow-lg shadow-yellow-500/25 hover:opacity-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Honors Roll (PDF)</span>
          </button>
        </div>

        {/* Grade Filter Bar */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 space-y-2">
          <label className="text-[11px] font-bold uppercase text-gray-600 tracking-wider">Filter by Grade Tier</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGradeFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedGradeFilter === "all"
                  ? "bg-yellow-500 text-gray-950 font-bold shadow-md shadow-yellow-500/20"
                  : "bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-700 hover:text-brand-black"
              }`}
            >
              All Grades (LKG–12th)
            </button>
            {ALL_GRADES.map(g => (
              <button
                key={g}
                onClick={() => setSelectedGradeFilter(g)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedGradeFilter === g
                    ? "bg-yellow-500 text-gray-950 font-bold shadow-md shadow-yellow-500/20"
                    : "bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-700 hover:text-brand-black"
                }`}
              >
                Grade {g}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading toppers data...</div>
        ) : filteredToppers.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            No toppers assigned for this selection yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredToppers.map((t, idx) => (
              <div
                key={`${t.grade}-${t.rank}-${idx}`}
                className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200 space-y-4 hover:border-yellow-500/50 hover:bg-gray-50/40 transition-all relative overflow-hidden group"
              >
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-md ${
                      t.rank === 1 ? 'bg-gradient-to-tr from-yellow-500 to-amber-300 text-gray-950'
                      : t.rank === 2 ? 'bg-gradient-to-tr from-slate-300 to-gray-400 text-gray-950'
                      : 'bg-gradient-to-tr from-amber-700 to-yellow-800 text-brand-black'
                    }`}>
                      {t.rank === 1 ? '🥇' : t.rank === 2 ? '🥈' : '🥉'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-brand-black group-hover:text-yellow-400 transition-colors">
                        {t.student_name}
                      </h3>
                      <p className="text-xs text-gray-600">Grade {t.grade} • Section {t.section}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-yellow-400 font-mono">{(t.gpa || 0).toFixed(2)}</div>
                    <div className="text-[10px] text-gray-600 font-semibold uppercase">GPA Rating</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-100 border border-gray-200">
                    <div className="text-[10px] text-gray-600">Total Marks</div>
                    <div className="text-base font-bold text-blue-600 font-mono mt-0.5">{t.total_marks}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-100 border border-gray-200">
                    <div className="text-[10px] text-gray-600">Exam Aggregate</div>
                    <div className="text-base font-bold text-emerald-600 font-mono mt-0.5">{t.percentage}%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-100 border border-gray-200">
                    <div className="text-[10px] text-gray-600">Attendance</div>
                    <div className="text-base font-bold text-cyan-600 font-mono mt-0.5">{t.attendance_pct}%</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="text-[10px] font-bold uppercase text-gray-600 tracking-wider">Top Subject Mastery</div>
                  <div className="flex flex-wrap gap-1.5">
                    {t.top_subjects.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 text-[10px] font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
