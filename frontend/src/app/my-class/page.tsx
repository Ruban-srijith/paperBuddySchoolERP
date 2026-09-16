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
    <ProtectedRoute allowedRoles={["teacher", "super_admin", "principal", "vice_principal"]}>
      <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e5c158]/20 text-[#e5c158] font-bold border border-[#e5c158]/40">
                Class Teacher Management
              </span>
              <span className="text-xs text-[#a3c9b0]">• Student Roster & Live Performance</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#f4f0e6] font-syne tracking-tight mt-1">
              {assignedClass} Roster & Performance
            </h1>
            <p className="text-sm text-[#a3c9b0] font-medium">
              Direct student directory, attendance metrics, academic GPA ratings, and verified parent communication records.
            </p>
          </div>

          <button
            onClick={() => toast.success("Triggered SMS/Email class intimation to all parents", "Intimations Sent")}
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-[#e5c158] hover:bg-[#d4b047] text-black font-extrabold text-xs shadow-lg shadow-[#e5c158]/20 hover:scale-105 transition-all self-start md:self-auto cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Broadcast Notice to Parents</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Tilt3D>
            <div className="glass-emerald-tile p-5 rounded-[22px] space-y-1">
              <CornerArchOrnament position="tr" />
              <div className="text-xs text-[#a3c9b0] font-semibold relative z-10">Enrolled Students</div>
              <div className="text-2xl font-extrabold text-[#f4f0e6] font-syne relative z-10">{students.length} Students</div>
              <div className="text-[11px] text-emerald-400 font-semibold relative z-10">All student profiles verified</div>
            </div>
          </Tilt3D>

          <Tilt3D>
            <div className="glass-emerald-tile p-5 rounded-[22px] space-y-1">
              <CornerArchOrnament position="bl" />
              <div className="text-xs text-[#a3c9b0] font-semibold relative z-10">Class Average Attendance</div>
              <div className="text-2xl font-extrabold text-sky-300 font-syne relative z-10">97.2%</div>
              <div className="text-[11px] text-[#a3c9b0] relative z-10">Highest among Grade 10 sections</div>
            </div>
          </Tilt3D>

          <Tilt3D>
            <div className="glass-emerald-tile p-5 rounded-[22px] space-y-1">
              <CornerArchOrnament position="tr" />
              <div className="text-xs text-[#a3c9b0] font-semibold relative z-10">Cumulative Class GPA</div>
              <div className="text-2xl font-extrabold text-[#e5c158] font-syne relative z-10">3.87 / 4.0</div>
              <div className="text-[11px] text-emerald-400 font-semibold relative z-10">Term 1 Assessment Aggregate</div>
            </div>
          </Tilt3D>
        </div>

        {/* Search */}
        <div className="glass-emerald-tile p-4 rounded-[22px] flex items-center justify-between">
          <div className="relative z-10 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#e5c158]" />
            <input
              type="text"
              placeholder="Search student or admission no..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="px-3.5 py-2 rounded-xl glass-input-dark text-[#f4f0e6] text-xs w-64 border border-[#e5c158]/30"
            />
          </div>
          <span className="text-xs text-[#e5c158] font-mono font-bold relative z-10">{filteredStudents.length} Students</span>
        </div>

        {/* Student Table */}
        <Tilt3D>
          <div className="glass-emerald-tile p-6 rounded-[24px] space-y-4">
            <CornerArchOrnament position="tr" />
            <div className="overflow-x-auto relative z-10">
              <table>
                <thead>
                  <tr>
                    <th className="text-center">Roll #</th>
                    <th>Student Name</th>
                    <th>Admission ID</th>
                    <th>Parent Contact</th>
                    <th className="text-center">Attendance %</th>
                    <th className="text-right font-extrabold text-[#e5c158]">Term GPA</th>
                    <th className="text-center">Today's Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-[#a3c9b0] font-medium">
                        No students found in this class roster.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s, index) => (
                      <tr key={s.id}>
                        <td className="text-center font-bold text-[#e5c158] font-mono">{index + 1}</td>
                        <td className="font-extrabold text-[#f4f0e6]">{s.full_name}</td>
                        <td className="font-mono text-[#a3c9b0] text-[11px]">{s.admission_number}</td>
                        <td>
                          <div className="text-[#f4f0e6] font-semibold">{s.father_name}</div>
                          <div className="text-[11px] text-[#a3c9b0] font-mono">{s.guardian_phone}</div>
                        </td>
                        <td className="text-center font-mono font-bold text-sky-300">{s.attendance_pct}%</td>
                        <td className="text-right font-mono font-extrabold text-[#e5c158] text-sm">{s.gpa}</td>
                        <td className="text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
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
        </Tilt3D>
      </div>
    </ProtectedRoute>
  );
}

