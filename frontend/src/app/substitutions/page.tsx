"use client";

import { useEffect, useState } from "react";
import { RefreshCw, UserX, UserCheck, Calendar, ShieldCheck, CheckCircle2, Zap } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface SubstitutionItem {
  id: string;
  timetable_id: string;
  class_name: string;
  subject_name: string;
  day_of_week: string;
  time_slot: string;
  original_teacher_name: string;
  substitute_teacher_name: string;
  date: string;
  status: string;
  created_at: string;
}

function SubstitutionsContent() {
  const [substitutions, setSubstitutions] = useState<SubstitutionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoAssigning, setAutoAssigning] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Demo active timetable slot for quick auto-assign test
  const demoTimetableId = "c1111111-1111-1111-1111-111111111111"; // Class 10-A slot
  const demoAbsentTeacherId = "t1111111-1111-1111-1111-111111111111"; // Dr. Sarah Connor

  const fetchSubstitutions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/substitutions/list");
      setSubstitutions(res.data);
    } catch (err) {
      console.error("Failed to fetch substitutions:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubstitutions();
  }, []);

  const handleAutoAssign = async () => {
    setAutoAssigning(true);
    setMsg(null);
    try {
      // First fetch all timetables to get an active slot
      const ttRes = await api.get("/timetable/all");
      const slots = ttRes.data;
      if (!slots || slots.length === 0) {
        setMsg("No active timetable slots found to reallocate.");
        setAutoAssigning(false);
        return;
      }
      const targetSlot = slots[0];

      const res = await api.post("/substitutions/auto-assign", {
        timetable_id: targetSlot.id,
        original_teacher_id: "t1111111-1111-1111-1111-111111111111",
        date: new Date().toISOString().split("T")[0],
      });

      setMsg(`Reallocated ${res.data.subject_name} (${res.data.class_name}) to ${res.data.substitute_teacher_name}`);
      fetchSubstitutions();
    } catch (err: any) {
      setMsg(`Auto-assign failed: ${err.response?.data?.detail || "Error"}`);
    }
    setAutoAssigning(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-brand-black flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-cyan-600" />
            </div>
            Vice Principal Teacher Substitution Control Center
          </h1>
          <p className="text-sm text-gray-600">Reallocate absent teacher timetable slots dynamically without scheduling conflicts</p>
        </div>

        <button
          onClick={handleAutoAssign}
          disabled={autoAssigning}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-500 text-brand-black text-sm font-medium shadow-lg shadow-cyan-500/25 hover:opacity-90 transition-all disabled:opacity-50 w-full md:w-auto shrink-0"
        >
          <Zap className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="whitespace-nowrap">{autoAssigning ? "Querying Free Teachers..." : "Auto-Assign Substitute"}</span>
        </button>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-600 flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border-l-4 border-cyan-500 space-y-2">
          <div className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Teacher Absences Today</div>
          <div className="text-2xl font-bold text-brand-black">1 Teacher</div>
          <div className="text-xs text-cyan-600 font-medium">Dr. Sarah Connor (Physics)</div>
        </div>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border-l-4 border-indigo-500 space-y-2">
          <div className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Reallocated Slots</div>
          <div className="text-2xl font-bold text-brand-black">{substitutions.length} Assigned</div>
          <div className="text-xs text-indigo-300 font-medium">Zero Class Conflict</div>
        </div>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border-l-4 border-emerald-500 space-y-2">
          <div className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Available Free Faculty</div>
          <div className="text-2xl font-bold text-brand-black">2 Teachers Free</div>
          <div className="text-xs text-emerald-600 font-medium">Prof. Alan Turing, Dr. Marie Curie</div>
        </div>
      </div>

      {/* Substitutions Table */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl space-y-4">
        <h2 className="text-lg font-bold text-brand-black flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-600" />
          Assigned Substitutions Log
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : substitutions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">No teacher substitutions assigned today</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200/60 text-xs font-semibold text-gray-600 uppercase tracking-wider text-left">
                  <th className="py-3 px-4">Class & Subject</th>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Absent Teacher</th>
                  <th className="py-3 px-4">Assigned Substitute</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {substitutions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-100/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-brand-black">{s.subject_name}</div>
                      <div className="text-xs text-cyan-600">Class {s.class_name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-700">
                      <div>{s.day_of_week}</div>
                      <div className="font-mono text-[10px] text-gray-600">{s.time_slot}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-red-300 flex items-center gap-1.5 pt-4">
                      <UserX className="w-3.5 h-3.5 text-red-400" />
                      <span>{s.original_teacher_name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-emerald-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{s.substitute_teacher_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="capitalize">{s.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubstitutionsPage() {
  return (
    <ProtectedRoute allowedRoles={["super_admin", "correspondent", "admin", "principal", "vice_principal"]}>
      <SubstitutionsContent />
    </ProtectedRoute>
  );
}
