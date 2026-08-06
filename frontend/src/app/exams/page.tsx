"use client";

import { useState } from "react";
import { 
  FileCheck, 
  Calendar, 
  Clock, 
  Users, 
  Award, 
  Plus, 
  CheckCircle2, 
  Sparkles,
  Download,
  Building2,
  X
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/components/Toast";

interface ExamScheduleItem {
  id: string;
  subject: string;
  grade: string;
  date: string;
  time: string;
  hall: string;
  invigilator: string;
  max_marks: number;
  status: "scheduled" | "completed" | "evaluating";
}

export default function ExamManagerPage() {
  const { toast } = useToast();
  const [selectedTerm, setSelectedTerm] = useState("Term 1 Mid-Terms (Aug 2026)");
  const [showAddModal, setShowAddModal] = useState(false);

  const [exams, setExams] = useState<ExamScheduleItem[]>([
    { id: "e1", subject: "Physics (Theory)", grade: "10-A", date: "Aug 18, 2026", time: "09:00 AM - 12:00 PM", hall: "Hall A (Room 301)", invigilator: "Prof. Alan Turing", max_marks: 80, status: "scheduled" },
    { id: "e2", subject: "Mathematics", grade: "10-A", date: "Aug 20, 2026", time: "09:00 AM - 12:00 PM", hall: "Hall A (Room 301)", invigilator: "Dr. Marie Curie", max_marks: 80, status: "scheduled" },
    { id: "e3", subject: "Chemistry (Theory)", grade: "12-A", date: "Aug 18, 2026", time: "09:00 AM - 12:00 PM", hall: "Hall B (Room 302)", invigilator: "Mrs. Revathi Raman", max_marks: 70, status: "scheduled" },
    { id: "e4", subject: "Computer Science (Practical)", grade: "11-A", date: "Aug 22, 2026", time: "01:30 PM - 04:30 PM", hall: "CS Lab 1", invigilator: "Alex Mercer", max_marks: 30, status: "scheduled" },
  ]);

  const [newExam, setNewExam] = useState({
    subject: "",
    grade: "10-A",
    date: "2026-08-24",
    time: "09:00 AM - 12:00 PM",
    hall: "Hall A (Room 301)",
    invigilator: "Dr. Sarah Connor",
    max_marks: 80,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setExams(prev => [{ id: `e-${Date.now()}`, ...newExam, status: "scheduled" }, ...prev]);
    toast.success(`Scheduled ${newExam.subject} examination for ${newExam.grade}`, "Exam Scheduled");
    setShowAddModal(false);
  };

  const handleReleaseHallTickets = () => {
    toast.success("Hall tickets published to all student portals!", "Hall Tickets Released");
  };

  return (
    <ProtectedRoute allowedRoles={["vice_principal", "dean", "dept_head", "super_admin", "admin", "principal"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 whitespace-nowrap">
                Vice-Principal Academics
              </span>
              <span className="text-xs text-gray-400 whitespace-nowrap">• Institutional Examinations</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mt-1">
              Examination Administration & Invigilation
            </h1>
            <p className="text-xs text-gray-400">
              Manage centralized examination dates, room seating plans, invigilator teacher duties, and hall ticket dispatches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleReleaseHallTickets}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 text-gray-950 font-bold text-xs shadow-lg shadow-amber-500/25 hover:opacity-95 transition-all w-full sm:w-auto flex-1"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Release Hall Tickets</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all w-full sm:w-auto flex-1"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Schedule Paper</span>
            </button>
          </div>
        </div>

        {/* Exams Table */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-gray-800 space-y-4 w-full overflow-hidden">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-amber-400" />
              <span>{selectedTerm} Timetable</span>
            </h2>
            <span className="text-xs text-gray-400 font-mono">{exams.length} Examination Papers</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-900/90 text-gray-400 uppercase text-[10px] font-semibold border-b border-gray-800">
                <tr>
                  <th className="p-3.5">Date & Slot</th>
                  <th className="p-3.5">Subject Paper</th>
                  <th className="p-3.5">Grade</th>
                  <th className="p-3.5">Assigned Hall</th>
                  <th className="p-3.5">Invigilator Staff</th>
                  <th className="p-3.5 text-right">Max Marks</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {exams.map(e => (
                  <tr key={e.id} className="hover:bg-gray-900/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{e.date}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{e.time}</div>
                    </td>
                    <td className="p-3.5 font-bold text-cyan-300">{e.subject}</td>
                    <td className="p-3.5 text-gray-300 font-semibold">{e.grade}</td>
                    <td className="p-3.5 text-gray-300">{e.hall}</td>
                    <td className="p-3.5 text-indigo-300">{e.invigilator}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">{e.max_marks}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {e.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="glass-panel border border-gray-700 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h3 className="text-base font-bold text-white">Schedule Examination Paper</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Subject Name</label>
                  <input
                    type="text"
                    value={newExam.subject}
                    onChange={e => setNewExam({ ...newExam, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-300 font-semibold block mb-1">Grade</label>
                    <input
                      type="text"
                      value={newExam.grade}
                      onChange={e => setNewExam({ ...newExam, grade: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 font-semibold block mb-1">Max Marks</label>
                    <input
                      type="number"
                      value={newExam.max_marks}
                      onChange={e => setNewExam({ ...newExam, max_marks: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-300 font-semibold block mb-1">Exam Date</label>
                    <input
                      type="date"
                      value={newExam.date}
                      onChange={e => setNewExam({ ...newExam, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 font-semibold block mb-1">Assigned Hall</label>
                    <input
                      type="text"
                      value={newExam.hall}
                      onChange={e => setNewExam({ ...newExam, hall: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Invigilator Staff</label>
                  <input
                    type="text"
                    value={newExam.invigilator}
                    onChange={e => setNewExam({ ...newExam, invigilator: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-600 text-gray-950 font-bold text-xs shadow-md shadow-amber-600/30 hover:bg-amber-500"
                  >
                    Publish Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
