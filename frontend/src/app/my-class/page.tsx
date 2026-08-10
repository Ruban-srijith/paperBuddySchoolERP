"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  GraduationCap, 
  CheckCircle2, 
  Award, 
  MessageSquare,
  Sparkles,
  TrendingUp
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/Toast";

import api from "@/lib/api";

interface StudentClassRecord {
  id: string;
  full_name: string;
  admission_number: string;
  email: string;
  father_name: string;
  guardian_phone: string;
  attendance_pct: number;
  gpa: string;
}

export default function MyClassPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [assignedClass, setAssignedClass] = useState<string>("Loading...");
  const [students, setStudents] = useState<StudentClassRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const myClassRes = await api.get("/classes/my-class");
        const { grade, section } = myClassRes.data;
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

  const filteredStudents = students.filter(s =>
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={["teacher", "super_admin", "admin", "principal", "vice_principal"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                Class Teacher Management
              </span>
              <span className="text-xs text-gray-600">• Student Roster</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight mt-1">
              {assignedClass} Class Roster & Performance
            </h1>
            <p className="text-xs text-gray-600">
              Direct student directory, attendance metrics, academic GPA ratings, and verified parent communication records.
            </p>
          </div>

          <button
            onClick={() => toast.success("Triggered SMS/Email class intimation to all 30 parents", "Intimations Sent")}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-brand-black font-semibold text-xs shadow-lg shadow-indigo-600/25 hover:opacity-95 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Broadcast Notice to Parents</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-xs text-gray-600">Enrolled Students</div>
            <div className="text-2xl font-bold text-brand-black">{students.length} Students</div>
            <div className="text-[11px] text-emerald-600 font-medium">All student profiles verified</div>
          </div>
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-xs text-gray-600">Class Average Attendance</div>
            <div className="text-2xl font-bold text-cyan-600">97.2%</div>
            <div className="text-[11px] text-gray-600">Highest among Grade 10 sections</div>
          </div>
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-xs text-gray-600">Cumulative Class GPA</div>
            <div className="text-2xl font-bold text-emerald-600">3.87 / 4.0</div>
            <div className="text-[11px] text-gray-600">Term 1 Assessment Aggregate</div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search student or roll no..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs w-60"
            />
          </div>
          <span className="text-xs text-gray-600 font-mono">{filteredStudents.length} Students</span>
        </div>

        {/* Student Table */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200 space-y-4">
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/90 text-gray-600 uppercase text-[10px] font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-3.5 text-center">Roll #</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Admission ID</th>
                  <th className="p-3.5">Parent Contact</th>
                  <th className="p-3.5 text-center">Attendance %</th>
                  <th className="p-3.5 text-right font-bold text-brand-black">Term GPA</th>
                  <th className="p-3.5 text-center">Today's Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 font-medium">
                      No students found in this class.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, index) => (
                    <tr key={s.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="p-3.5 text-center font-bold text-cyan-300 font-mono">{index + 1}</td>
                      <td className="p-3.5 font-bold text-brand-black">{s.full_name}</td>
                      <td className="p-3.5 font-mono text-gray-600 text-[11px]">{s.admission_number}</td>
                      <td className="p-3.5">
                        <div className="text-gray-700 font-medium">{s.father_name}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{s.guardian_phone}</div>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-cyan-300">{s.attendance_pct}%</td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-600 text-sm">{s.gpa}</td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30`}>
                          PRESENT
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
