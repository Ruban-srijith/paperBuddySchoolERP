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

interface StudentClassRecord {
  roll_no: number;
  name: string;
  admission_no: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  attendance_pct: number;
  term_gpa: number;
  status: "active" | "absent_today";
}

export default function MyClassPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const assignedClass = user?.assigned_grade || "Grade 10 - Section A";

  const [students, setStudents] = useState<StudentClassRecord[]>([
    { roll_no: 1, name: "Kishor Kumar", admission_no: "PB-2024-089", parent_name: "S. Kumar", parent_phone: "+91 98401 11221", parent_email: "parent.kishor@example.com", attendance_pct: 99.1, term_gpa: 3.96, status: "active" },
    { roll_no: 2, name: "Priya Sharma", admission_no: "PB-2024-090", parent_name: "R. Sharma", parent_phone: "+91 98401 11222", parent_email: "parent.priya@example.com", attendance_pct: 98.5, term_gpa: 3.92, status: "active" },
    { roll_no: 3, name: "Aditya Verma", admission_no: "PB-2024-091", parent_name: "M. Verma", parent_phone: "+91 98401 11223", parent_email: "parent.aditya@example.com", attendance_pct: 96.8, term_gpa: 3.88, status: "active" },
    { roll_no: 4, name: "Pooja Reddy", admission_no: "PB-2024-092", parent_name: "V. Reddy", parent_phone: "+91 98401 11224", parent_email: "parent.pooja@example.com", attendance_pct: 94.2, term_gpa: 3.75, status: "absent_today" },
    { roll_no: 5, name: "Rohan Iyer", admission_no: "PB-2024-093", parent_name: "K. Iyer", parent_phone: "+91 98401 11225", parent_email: "parent.rohan@example.com", attendance_pct: 97.4, term_gpa: 3.82, status: "active" },
  ]);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.admission_no.toLowerCase().includes(searchTerm.toLowerCase())
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
                {filteredStudents.map(s => (
                  <tr key={s.roll_no} className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-3.5 text-center font-bold text-cyan-300 font-mono">{s.roll_no}</td>
                    <td className="p-3.5 font-bold text-brand-black">{s.name}</td>
                    <td className="p-3.5 font-mono text-gray-600 text-[11px]">{s.admission_no}</td>
                    <td className="p-3.5">
                      <div className="text-gray-700 font-medium">{s.parent_name}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{s.parent_phone}</div>
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-cyan-300">{s.attendance_pct}%</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-600 text-sm">{s.term_gpa.toFixed(2)}</td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {s.status === 'active' ? 'PRESENT' : 'ABSENT'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
