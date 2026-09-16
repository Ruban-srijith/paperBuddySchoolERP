"use client";

import { useEffect, useState } from "react";
import { RefreshCw, UserX, UserCheck, Calendar, ShieldCheck, CheckCircle2, Zap } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
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
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e5c158]/20 text-[#e5c158] font-bold border border-[#e5c158]/40">
              Vice Principal Academic Operations
            </span>
            <span className="text-xs text-[#a3c9b0]">• AI Automated Reallocation</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#f4f0e6] font-syne flex items-center gap-3 tracking-tight mt-1">
            <div className="w-10 h-10 rounded-xl bg-[#e5c158]/20 border border-[#e5c158]/40 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5 text-[#e5c158]" />
            </div>
            Teacher Substitution Control Center
          </h1>
          <p className="text-sm text-[#a3c9b0] font-medium">Reallocate absent teacher timetable slots dynamically without scheduling conflicts.</p>
        </div>

        <button
          onClick={handleAutoAssign}
          disabled={autoAssigning}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#e5c158] hover:bg-[#d4b047] text-black text-xs font-extrabold shadow-lg shadow-[#e5c158]/20 transition-all disabled:opacity-50 w-full md:w-auto shrink-0 cursor-pointer"
        >
          <Zap className="w-4 h-4 text-black shrink-0 fill-black" />
          <span className="whitespace-nowrap">{autoAssigning ? "Querying Free Teachers..." : "Auto-Assign Substitute"}</span>
        </button>
      </div>

      {msg && (
        <div className="p-4 rounded-xl glass-box border border-[#e5c158]/40 text-[#e5c158] text-xs flex items-center gap-2 font-bold">
          <ShieldCheck className="w-4 h-4 text-[#e5c158] flex-shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Tilt3D>
          <div className="glass-emerald-tile p-5 rounded-[22px] space-y-2">
            <CornerArchOrnament position="tr" />
            <div className="text-xs text-[#a3c9b0] font-bold uppercase tracking-wider relative z-10">Teacher Absences Today</div>
            <div className="text-2xl font-extrabold text-[#f4f0e6] font-syne relative z-10">1 Teacher</div>
            <div className="text-xs text-[#e5c158] font-semibold relative z-10">Dr. Sarah Connor (Physics)</div>
          </div>
        </Tilt3D>

        <Tilt3D>
          <div className="glass-emerald-tile p-5 rounded-[22px] space-y-2">
            <CornerArchOrnament position="bl" />
            <div className="text-xs text-[#a3c9b0] font-bold uppercase tracking-wider relative z-10">Reallocated Slots</div>
            <div className="text-2xl font-extrabold text-[#f4f0e6] font-syne relative z-10">{substitutions.length} Assigned</div>
            <div className="text-xs text-emerald-400 font-semibold relative z-10">Zero Class Conflict</div>
          </div>
        </Tilt3D>

        <Tilt3D>
          <div className="glass-emerald-tile p-5 rounded-[22px] space-y-2">
            <CornerArchOrnament position="tr" />
            <div className="text-xs text-[#a3c9b0] font-bold uppercase tracking-wider relative z-10">Available Free Faculty</div>
            <div className="text-2xl font-extrabold text-sky-300 font-syne relative z-10">2 Teachers Free</div>
            <div className="text-xs text-[#a3c9b0] relative z-10">Prof. Alan Turing, Dr. Marie Curie</div>
          </div>
        </Tilt3D>
      </div>

      {/* Substitutions Table */}
      <Tilt3D>
        <div className="glass-emerald-tile p-6 rounded-[24px] space-y-4">
          <CornerArchOrnament position="tr" />
          <h2 className="text-lg font-extrabold text-[#f4f0e6] font-syne flex items-center gap-2 relative z-10">
            <Calendar className="w-5 h-5 text-[#e5c158]" />
            Assigned Substitutions Log
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-[#e5c158]/30 border-t-[#e5c158] rounded-full animate-spin"></div>
            </div>
          ) : substitutions.length === 0 ? (
            <div className="text-center py-12 text-[#a3c9b0] text-sm relative z-10">No teacher substitutions assigned today</div>
          ) : (
            <div className="overflow-x-auto relative z-10">
              <table>
                <thead>
                  <tr>
                    <th>Class & Subject</th>
                    <th>Time Slot</th>
                    <th>Absent Teacher</th>
                    <th>Assigned Substitute</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {substitutions.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="font-extrabold text-[#f4f0e6]">{s.subject_name}</div>
                        <div className="text-xs text-[#e5c158] font-bold">Class {s.class_name}</div>
                      </td>
                      <td className="text-xs text-[#a3c9b0]">
                        <div>{s.day_of_week}</div>
                        <div className="font-mono text-[10px] text-[#a3c9b0]">{s.time_slot}</div>
                      </td>
                      <td className="text-xs text-rose-300">
                        <div className="flex items-center gap-1.5 font-bold">
                          <UserX className="w-3.5 h-3.5 text-rose-400" />
                          <span>{s.original_teacher_name}</span>
                        </div>
                      </td>
                      <td className="text-xs text-emerald-300 font-bold">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{s.substitute_teacher_name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-extrabold">
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
      </Tilt3D>
    </div>
  );
}

export default function SubstitutionsPage() {
  return (
    <ProtectedRoute allowedRoles={["super_admin", "correspondent", "principal", "vice_principal"]}>
      <SubstitutionsContent />
    </ProtectedRoute>
  );
}

