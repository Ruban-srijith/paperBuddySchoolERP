"use client";

import { useState } from "react";
import { 
  FileText, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Download, 
  Sparkles, 
  X,
  Upload,
  BookOpen
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/Toast";

interface AssignmentItem {
  id: string;
  title: string;
  subject: string;
  grade: string;
  due_date: string;
  max_marks: number;
  description: string;
  submissions_count: number;
  total_students: number;
}

export default function AssignmentsPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isTeacher = user?.role === "teacher" || ['super_admin', 'admin', 'principal', 'vice_principal'].includes(user?.role || '');

  const [assignments, setAssignments] = useState<AssignmentItem[]>([
    {
      id: "as-1",
      title: "Ray Optics & Wave Theory Term Paper",
      subject: "Physics",
      grade: "10-A",
      due_date: "2026-08-20",
      max_marks: 50,
      description: "Comprehensive 5-page assignment covering Snell's law derivation, telescope optics, and Huygens' principle proofs.",
      submissions_count: 26,
      total_students: 30,
    },
    {
      id: "as-2",
      title: "Python Data Structures: Stacks, Queues & Trees",
      subject: "Computer Science",
      grade: "11-A",
      due_date: "2026-08-18",
      max_marks: 40,
      description: "Write Python classes for dynamic stacks and double-ended queues with unit test suites.",
      submissions_count: 28,
      total_students: 32,
    },
    {
      id: "as-3",
      title: "Chemical Equilibrium & Le Chatelier's Principle",
      subject: "Chemistry",
      grade: "12-A",
      due_date: "2026-08-22",
      max_marks: 50,
      description: "Solve numerical equilibrium constants Kp and Kc under varying temperature conditions.",
      submissions_count: 15,
      total_students: 30,
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newAs, setNewAs] = useState({
    title: "",
    subject: "Physics",
    grade: "10-A",
    due_date: "2026-08-25",
    max_marks: 50,
    description: "",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setAssignments(prev => [{
      id: `as-${Date.now()}`,
      ...newAs,
      submissions_count: 0,
      total_students: 30,
    }, ...prev]);
    toast.success(`Published assignment: ${newAs.title}`, "Assignment Published");
    setShowModal(false);
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                Academic Coursework
              </span>
              <span className="text-xs text-gray-600">• Term Project Assignments</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight mt-1">
              Class Assignments & Project Specifications
            </h1>
            <p className="text-xs text-gray-600">
              {isTeacher
                ? "Create structured assignments, upload PDF rubrics, and monitor class submission rates."
                : "Review upcoming term assignments, download project specifications, and track evaluation scores."}
            </p>
          </div>

          {isTeacher && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-brand-black font-semibold text-xs shadow-lg shadow-cyan-600/25 hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Assignment</span>
            </button>
          )}
        </div>

        {/* Assignments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assignments.map(a => (
            <div
              key={a.id}
              className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200 space-y-4 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {a.subject} • {a.grade}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600">
                    Max {a.max_marks} Pts
                  </span>
                </div>

                <h3 className="text-base font-bold text-brand-black leading-snug">{a.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{a.description}</p>
              </div>

              <div className="pt-3 border-t border-gray-200 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-600 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                    Due: {a.due_date}
                  </span>
                  <span className="text-cyan-300 font-semibold">
                    {a.submissions_count} / {a.total_students} Submitted
                  </span>
                </div>

                <button
                  onClick={() => toast.info(`Downloading rubric for ${a.title}`, "Download Rubric")}
                  className="w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-700 text-gray-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-brand-blue" />
                  <span>Download Spec Sheet (PDF)</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm border border-gray-200 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-base font-bold text-brand-black">Create New Assignment</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-brand-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Assignment Title</label>
                  <input
                    type="text"
                    value={newAs.title}
                    onChange={e => setNewAs({ ...newAs, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-700 font-semibold block mb-1">Subject</label>
                    <select
                      value={newAs.subject}
                      onChange={e => setNewAs({ ...newAs, subject: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-700 font-semibold block mb-1">Max Marks</label>
                    <input
                      type="number"
                      value={newAs.max_marks}
                      onChange={e => setNewAs({ ...newAs, max_marks: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-700 font-semibold block mb-1">Grade</label>
                    <input
                      type="text"
                      value={newAs.grade}
                      onChange={e => setNewAs({ ...newAs, grade: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 font-semibold block mb-1">Submission Deadline</label>
                    <input
                      type="date"
                      value={newAs.due_date}
                      onChange={e => setNewAs({ ...newAs, due_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Assignment Problem Statement</label>
                  <textarea
                    rows={3}
                    value={newAs.description}
                    onChange={e => setNewAs({ ...newAs, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-700 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-cyan-600 text-brand-black font-semibold text-xs shadow-md shadow-cyan-600/30 hover:bg-cyan-500"
                  >
                    Publish Assignment
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
