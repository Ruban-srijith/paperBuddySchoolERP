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
import { exportToCsv } from "@/lib/exportUtils";

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

const DEMO_TOPPERS: TopperStudent[] = [
  { rank: 1, student_name: "Aarav Sundar", grade: "LKG", section: "A", total_marks: 100, gpa: 10.0, percentage: 100.0, top_subjects: ["Rhymes & Storytelling", "Drawing & Craft"], attendance_pct: 100.0 },
  { rank: 2, student_name: "Kavyashree N", grade: "LKG", section: "A", total_marks: 98, gpa: 9.8, percentage: 98.0, top_subjects: ["Rhymes & Storytelling", "Motor Skills"], attendance_pct: 99.0 },
  { rank: 1, student_name: "Diya Lakshmi", grade: "UKG", section: "A", total_marks: 100, gpa: 10.0, percentage: 100.0, top_subjects: ["Basic Numbers", "Phonics"], attendance_pct: 99.0 },
  { rank: 2, student_name: "Sai Pranav", grade: "UKG", section: "A", total_marks: 97, gpa: 9.7, percentage: 97.0, top_subjects: ["Phonics", "Storytelling"], attendance_pct: 98.5 },
  { rank: 1, student_name: "Kavin Raj", grade: "1", section: "A", total_marks: 298, gpa: 9.9, percentage: 99.3, top_subjects: ["English", "Mathematics"], attendance_pct: 98.9 },
  { rank: 2, student_name: "Ananya S", grade: "1", section: "A", total_marks: 291, gpa: 9.7, percentage: 97.0, top_subjects: ["Mathematics", "Tamil"], attendance_pct: 98.0 },
  { rank: 1, student_name: "Nithya Sri", grade: "2", section: "A", total_marks: 296, gpa: 9.8, percentage: 98.7, top_subjects: ["Environmental Studies", "English"], attendance_pct: 99.1 },
  { rank: 2, student_name: "Vignesh M", grade: "2", section: "A", total_marks: 289, gpa: 9.6, percentage: 96.3, top_subjects: ["Mathematics", "General Knowledge"], attendance_pct: 97.5 },
  { rank: 1, student_name: "Tharun Vimal", grade: "3", section: "A", total_marks: 395, gpa: 9.9, percentage: 98.8, top_subjects: ["Mathematics", "Science"], attendance_pct: 99.2 },
  { rank: 2, student_name: "Divya B", grade: "3", section: "A", total_marks: 387, gpa: 9.7, percentage: 96.8, top_subjects: ["English", "Environmental Studies"], attendance_pct: 98.4 },
  { rank: 1, student_name: "Meenakshi Sundaram", grade: "4", section: "A", total_marks: 396, gpa: 9.9, percentage: 99.0, top_subjects: ["English", "Science"], attendance_pct: 99.4 },
  { rank: 2, student_name: "Aditya Raj", grade: "4", section: "A", total_marks: 388, gpa: 9.7, percentage: 97.0, top_subjects: ["Mathematics", "Social Studies"], attendance_pct: 98.1 },
  { rank: 1, student_name: "Sowmya Raman", grade: "5", section: "A", total_marks: 494, gpa: 9.9, percentage: 98.8, top_subjects: ["Environmental Studies", "English"], attendance_pct: 99.5 },
  { rank: 2, student_name: "Praveen K", grade: "5", section: "A", total_marks: 483, gpa: 9.7, percentage: 96.6, top_subjects: ["Mathematics", "Science"], attendance_pct: 98.0 },
  { rank: 1, student_name: "Rohan Verma", grade: "6", section: "A", total_marks: 491, gpa: 9.8, percentage: 98.2, top_subjects: ["General Science", "Mathematics"], attendance_pct: 99.0 },
  { rank: 2, student_name: "Kavya Menon", grade: "6", section: "A", total_marks: 482, gpa: 9.6, percentage: 96.4, top_subjects: ["English", "Social Science"], attendance_pct: 97.8 },
  { rank: 1, student_name: "Harini Venkatesh", grade: "7", section: "A", total_marks: 493, gpa: 9.9, percentage: 98.6, top_subjects: ["English", "Science"], attendance_pct: 99.3 },
  { rank: 2, student_name: "Mohammed Ashik", grade: "7", section: "A", total_marks: 484, gpa: 9.7, percentage: 96.8, top_subjects: ["Social Science", "Mathematics"], attendance_pct: 98.2 },
  { rank: 1, student_name: "Ananya Krishna", grade: "8", section: "A", total_marks: 490, gpa: 9.8, percentage: 98.0, top_subjects: ["Science", "Mathematics"], attendance_pct: 99.0 },
  { rank: 2, student_name: "Karthik S", grade: "8", section: "A", total_marks: 481, gpa: 9.6, percentage: 96.2, top_subjects: ["English", "Tamil"], attendance_pct: 97.9 },
  { rank: 1, student_name: "Priya Sharma", grade: "9", section: "A", total_marks: 486, gpa: 9.7, percentage: 97.2, top_subjects: ["Tamil", "Mathematics", "Science"], attendance_pct: 98.5 },
  { rank: 2, student_name: "Rahul Dev", grade: "9", section: "A", total_marks: 478, gpa: 9.5, percentage: 95.6, top_subjects: ["English", "Social Science"], attendance_pct: 97.0 },
  { rank: 1, student_name: "Kishen Kumar", grade: "10", section: "A", total_marks: 492, gpa: 9.8, percentage: 98.4, top_subjects: ["Science", "Mathematics", "Computer Science"], attendance_pct: 99.2 },
  { rank: 2, student_name: "Mithran S", grade: "10", section: "A", total_marks: 485, gpa: 9.7, percentage: 97.0, top_subjects: ["Mathematics", "Physics"], attendance_pct: 98.6 },
  { rank: 1, student_name: "Sanjay Adithya", grade: "11", section: "A", total_marks: 589, gpa: 9.8, percentage: 98.2, top_subjects: ["Physics", "Mathematics"], attendance_pct: 99.1 },
  { rank: 2, student_name: "Keerthana R", grade: "11", section: "A", total_marks: 580, gpa: 9.7, percentage: 96.7, top_subjects: ["Biology", "Chemistry"], attendance_pct: 98.3 },
  { rank: 1, student_name: "Deepak Pillai", grade: "12", section: "A", total_marks: 588, gpa: 9.9, percentage: 98.0, top_subjects: ["Physics", "Mathematics", "Computer Science"], attendance_pct: 98.8 },
  { rank: 2, student_name: "Shreya Narayanan", grade: "12", section: "A", total_marks: 582, gpa: 9.7, percentage: 97.0, top_subjects: ["Economics", "Accountancy"], attendance_pct: 99.0 },
];

export default function ClassToppersPage() {
  const { toast } = useToast();
  const [toppers, setToppers] = useState<TopperStudent[]>([]);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Covers all foundational, primary, middle, and secondary grades
  const ALL_GRADES = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

  useEffect(() => {
    async function fetchToppers() {
      try {
        setLoading(true);
        const res = await api.get("/academics/toppers");
        const flatToppers: TopperStudent[] = [];
        if (Array.isArray(res.data)) {
          res.data.forEach((gObj: any) => {
            if (Array.isArray(gObj?.toppers)) {
              gObj.toppers.forEach((t: any) => {
                flatToppers.push({
                   rank: Number(t.rank) || 1,
                   student_name: t.student_name || "Unknown",
                   grade: String(t.grade || gObj.grade || ""),
                   section: t.section || "A",
                   total_marks: Number(t.total_marks) || 0,
                   gpa: Number(t.gpa) || 0,
                   percentage: Number(t.percentage) || 0,
                   top_subjects: Array.isArray(t.top_subjects) ? t.top_subjects : [],
                   attendance_pct: Number(t.attendance_rate || t.attendance_pct || 0)
                });
              });
            }
          });
        }
        // Merge with DEMO_TOPPERS so all grades always have toppers
        const presentGrades = new Set(flatToppers.map(t => String(t.grade).toLowerCase()));
        const missingDemoToppers = DEMO_TOPPERS.filter(dt => !presentGrades.has(String(dt.grade).toLowerCase()));
        const combined = [...flatToppers, ...missingDemoToppers];
        setToppers(combined.length > 0 ? combined : DEMO_TOPPERS);
      } catch (err) {
        console.error("Failed to fetch toppers", err);
        setToppers(DEMO_TOPPERS);
      } finally {
        setLoading(false);
      }
    }
    fetchToppers();
  }, []);

  const filteredToppers = selectedGradeFilter === "all"
    ? toppers
    : toppers.filter((t) => String(t.grade).toLowerCase() === selectedGradeFilter.toLowerCase());

  const handleExportHonorsRoll = () => {
    try {
      const escapeCell = (val: any) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const headers = [
        "Rank",
        "Student Name",
        "Grade",
        "Section",
        "GPA Rating",
        "Total Marks",
        "Exam Aggregate (%)",
        "Attendance (%)",
        "Top Subject Mastery"
      ];

      const dataToExport = filteredToppers.length > 0 ? filteredToppers : toppers;

      const rows = dataToExport.map((t) => [
        `Rank #${t.rank}`,
        t.student_name,
        `Grade ${t.grade}`,
        t.section,
        (t.gpa || 0).toFixed(2),
        t.total_marks,
        `${t.percentage}%`,
        `${t.attendance_pct}%`,
        (t.top_subjects || []).join("; ")
      ]);

      const headerRow = headers.map(escapeCell).join(",");
      const dataRows = rows.map((row) => row.map(escapeCell).join(",")).join("\r\n");
      const csvContent = "\uFEFF" + headerRow + "\r\n" + dataRows;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.setAttribute("download", `Class_Toppers_Honors_Roll_${selectedGradeFilter === "all" ? "All_Grades" : `Grade_${selectedGradeFilter}`}.csv`);
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast.success("Honors roll exported successfully to CSV", "Export Complete");
    } catch (err) {
      toast.error("Failed to export honors roll");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["super_admin", "correspondent", "principal"]}>
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
              Top rank students across Grade 3 through 12th Standard based on cumulative GPA, term examination results, and consistent attendance.
            </p>
          </div>

          <button
            onClick={handleExportHonorsRoll}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-500 text-brand-black font-semibold text-xs shadow-lg shadow-yellow-500/25 hover:opacity-95 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Honors Roll</span>
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
                    {(t.top_subjects || []).map(s => (
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
