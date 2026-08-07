"use client";

import { useState } from "react";
import { 
  FileCheck, 
  Download, 
  Calendar, 
  Clock, 
  Building2, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck,
  CheckCircle2,
  X
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/Toast";

export default function StudentExamSchedulePage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [showHallTicketModal, setShowHallTicketModal] = useState(false);

  const studentExams = [
    { subject: "Physics (Theory)", code: "PHY-101", date: "Aug 18, 2026", time: "09:00 AM - 12:00 PM", hall: "Hall A (Room 301)", seat: "A-14", max_marks: 80 },
    { subject: "Mathematics", code: "MAT-101", date: "Aug 20, 2026", time: "09:00 AM - 12:00 PM", hall: "Hall A (Room 301)", seat: "A-14", max_marks: 80 },
    { subject: "Computer Science (Practical)", code: "CSC-102", date: "Aug 22, 2026", time: "01:30 PM - 04:30 PM", hall: "CS Lab 1", seat: "Terminal-08", max_marks: 30 },
    { subject: "Chemistry (Theory)", code: "CHE-101", date: "Aug 25, 2026", time: "09:00 AM - 12:00 PM", hall: "Hall A (Room 301)", seat: "A-14", max_marks: 70 },
  ];

  return (
    <ProtectedRoute allowedRoles={["student", "parent", "super_admin", "admin", "principal", "vice_principal"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Term 1 Examination Schedule
              </span>
              <span className="text-xs text-gray-400">• Official Timetable</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mt-1">
              Examination Timetable & Hall Ticket
            </h1>
            <p className="text-xs text-gray-400">
              Exam dates, allocated examination halls, seat numbers, and certified digital Hall Ticket.
            </p>
          </div>

          <button
            onClick={() => {
              setShowHallTicketModal(true);
              toast.info("Generated digital Hall Ticket", "Hall Ticket Ready");
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-950 font-bold text-xs shadow-lg shadow-amber-500/25 hover:opacity-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Hall Ticket (PDF)</span>
          </button>
        </div>

        {/* Timetable Table */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-amber-400" />
              <span>Term 1 Examination Schedule</span>
            </h2>
            <span className="text-xs text-gray-400 font-mono">Grade 10-A • Student ID: PB-2024-089</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-900/90 text-gray-400 uppercase text-[10px] font-semibold border-b border-gray-800">
                <tr>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Subject Paper</th>
                  <th className="p-3.5">Course Code</th>
                  <th className="p-3.5">Examination Hall</th>
                  <th className="p-3.5">Seat #</th>
                  <th className="p-3.5 text-right font-bold text-white">Max Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {studentExams.map((e, idx) => (
                  <tr key={idx} className="hover:bg-gray-900/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{e.date}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{e.time}</div>
                    </td>
                    <td className="p-3.5 font-bold text-cyan-300">{e.subject}</td>
                    <td className="p-3.5 font-mono text-gray-400">{e.code}</td>
                    <td className="p-3.5 text-gray-300">{e.hall}</td>
                    <td className="p-3.5 font-mono font-bold text-amber-400">{e.seat}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400 text-sm">{e.max_marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-2">
          <div className="text-xs font-bold uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Important Examination Hall Guidelines</span>
          </div>
          <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside">
            <li>Students must be seated in the examination hall 15 minutes prior to the commencement of the exam.</li>
            <li>Possession of digital smartwatches or unauthorized electronic calculators in the hall is strictly prohibited.</li>
            <li>Carry your physical printed Hall Ticket and PaperBuddy student ID badge to all sessions.</li>
          </ul>
        </div>

        {/* Digital Hall Ticket Modal */}
        {showHallTicketModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="glass-panel border border-gray-700 max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">PaperBuddy Certified Hall Ticket</h3>
                    <p className="text-[10px] text-gray-400">CBSE Affiliation No: 1930281 • Term 1 2026</p>
                  </div>
                </div>
                <button onClick={() => setShowHallTicketModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-gray-950/60 border border-gray-800 space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500">Student Name:</span>
                    <div className="font-bold text-white">{user?.full_name || "Kishor Kumar"}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Admission No:</span>
                    <div className="font-mono text-cyan-300 font-bold">PB-2024-089</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Grade & Section:</span>
                    <div className="text-white">Grade 10 - Section A</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Assigned Exam Hall:</span>
                    <div className="text-amber-300 font-semibold">Hall A (Room 301)</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                <button
                  onClick={() => setShowHallTicketModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                    toast.success("Hall Ticket sent to printer spooler", "Printing");
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-gray-950 font-bold text-xs hover:bg-amber-400 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Print Hall Ticket
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
