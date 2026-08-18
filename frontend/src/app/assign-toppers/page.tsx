"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Award, 
  CheckCircle2, 
  Save,
  Trophy
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/Toast";

import api from "@/lib/api";

interface StudentClassRecord {
  id: string;
  full_name: string;
  admission_number: string;
  gpa: string;
  attendance_pct: number;
}

interface TopperSelection {
  student_id: string;
  rank: number;
  total_marks: number;
  gpa: number;
  percentage: number;
  top_subjects: string[];
  attendance_pct: number;
}

export default function AssignToppersPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [assignedClass, setAssignedClass] = useState<string>("Loading...");
  const [classId, setClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentClassRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [toppers, setToppers] = useState<TopperSelection[]>([
    { student_id: "", rank: 1, total_marks: 0, gpa: 0, percentage: 0, top_subjects: [], attendance_pct: 0 },
    { student_id: "", rank: 2, total_marks: 0, gpa: 0, percentage: 0, top_subjects: [], attendance_pct: 0 },
    { student_id: "", rank: 3, total_marks: 0, gpa: 0, percentage: 0, top_subjects: [], attendance_pct: 0 },
  ]);

  useEffect(() => {
    async function fetchData() {
      try {
        const myClassRes = await api.get("/classes/my-class");
        const { id, grade, section } = myClassRes.data;
        setClassId(id);
        setAssignedClass(`Grade ${grade} - Section ${section}`);

        const detailRes = await api.get(`/academics/class-detail/${grade}?section=${section}`);
        setStudents(detailRes.data.students || []);
      } catch (err: any) {
        setAssignedClass("Unassigned");
        console.error("Failed to fetch class data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleTopperChange = (rankIndex: number, field: keyof TopperSelection, value: any) => {
    const updated = [...toppers];
    if (field === "top_subjects") {
      updated[rankIndex][field] = value.split(",").map((s: string) => s.trim()).filter((s: string) => s);
    } else if (field === "student_id") {
      updated[rankIndex][field] = value;
      // Auto-fill gpa and attendance from student data if available
      const stu = students.find(s => s.id === value);
      if (stu) {
        updated[rankIndex].gpa = parseFloat(stu.gpa) || 0;
        updated[rankIndex].attendance_pct = stu.attendance_pct || 0;
      }
    } else {
      updated[rankIndex][field] = value;
    }
    setToppers(updated);
  };

  const handleSave = async () => {
    if (!classId) return;

    // Filter out unassigned ranks
    const validToppers = toppers.filter(t => t.student_id !== "");
    if (validToppers.length === 0) {
      toast.error("Please select at least one student as a topper.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/academics/toppers", {
        class_id: classId,
        term: "Term 1 Final",
        toppers: validToppers
      });
      toast.success("Class toppers assigned successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to assign toppers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["teacher", "super_admin"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-semibold border border-fuchsia-500/30">
                Class Teacher Operations
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight mt-1">
              Assign Toppers for {assignedClass}
            </h1>
            <p className="text-xs text-gray-600">
              Select the top 3 performing students in your class for the academic term.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-500 text-white font-semibold text-xs shadow-lg hover:opacity-95 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Saving..." : "Save Toppers"}</span>
          </button>
        </div>

        {/* Assignment Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((rank, idx) => (
            <div key={rank} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-md ${
                  rank === 1 ? 'bg-gradient-to-tr from-yellow-500 to-amber-300 text-gray-950'
                  : rank === 2 ? 'bg-gradient-to-tr from-slate-300 to-gray-400 text-gray-950'
                  : 'bg-gradient-to-tr from-amber-700 to-yellow-800 text-brand-black'
                }`}>
                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                </div>
                <div>
                  <h3 className="font-bold text-brand-black">Rank {rank}</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Select Student</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Student</label>
                  <select 
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-brand-black bg-gray-50 focus:border-brand-blue outline-none"
                    value={toppers[idx].student_id}
                    onChange={(e) => handleTopperChange(idx, "student_id", e.target.value)}
                  >
                    <option value="">-- Select Student --</option>
                    {students
                      .filter(s => s.id === toppers[idx].student_id || !toppers.some(t => t.student_id === s.id))
                      .map(s => (
                        <option key={s.id} value={s.id}>{s.full_name} ({s.admission_number})</option>
                      ))
                    }
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block truncate">Total Marks</label>
                    <input 
                      type="number" step="1"
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-brand-black bg-gray-50 focus:border-brand-blue outline-none"
                      value={toppers[idx].total_marks || ""}
                      onChange={(e) => handleTopperChange(idx, "total_marks", e.target.value ? parseInt(e.target.value) : 0)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block truncate">GPA</label>
                    <input 
                      type="number" step="0.01"
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-brand-black bg-gray-50 focus:border-brand-blue outline-none"
                      value={toppers[idx].gpa || ""}
                      onChange={(e) => handleTopperChange(idx, "gpa", e.target.value ? parseFloat(e.target.value) : 0)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block truncate">Percentage</label>
                    <input 
                      type="number" step="0.1" max="100"
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-brand-black bg-gray-50 focus:border-brand-blue outline-none"
                      value={toppers[idx].percentage || ""}
                      onChange={(e) => handleTopperChange(idx, "percentage", e.target.value ? parseFloat(e.target.value) : 0)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700">Top Subjects (comma separated)</label>
                  <input 
                    type="text" placeholder="Maths, Science"
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-brand-black bg-gray-50 focus:border-brand-blue outline-none"
                    value={toppers[idx].top_subjects.join(", ")}
                    onChange={(e) => handleTopperChange(idx, "top_subjects", e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-gray-700">Attendance %</label>
                  <input 
                    type="number" step="0.1" max="100"
                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm text-brand-black bg-gray-50 focus:border-brand-blue outline-none"
                    value={toppers[idx].attendance_pct || ""}
                    onChange={(e) => handleTopperChange(idx, "attendance_pct", e.target.value ? parseFloat(e.target.value) : 0)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </ProtectedRoute>
  );
}
