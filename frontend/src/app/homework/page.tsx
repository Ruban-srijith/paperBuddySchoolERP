"use client";

import { useState } from "react";
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Upload, 
  X,
  Sparkles,
  AlertCircle
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/Toast";

interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  grade: string;
  due_date: string;
  description: string;
  status: "pending" | "submitted" | "reviewed";
}

export default function HomeworkPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isTeacher = user?.role === "teacher" || ['super_admin', 'admin', 'principal', 'vice_principal'].includes(user?.role || '');

  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([
    {
      id: "hw-1",
      title: "Electromagnetic Induction Practice Problems (Exercise 4.2)",
      subject: "Physics",
      grade: "10-A",
      due_date: "2026-08-10",
      description: "Solve questions 1 through 15 from Chapter 4. Draw neat ray diagrams for Faraday's law of induction.",
      status: "pending"
    },
    {
      id: "hw-2",
      title: "Quadratic Equations Word Problems",
      subject: "Mathematics",
      grade: "10-A",
      due_date: "2026-08-09",
      description: "Complete NCERT exercise 3.4 on nature of roots and discriminant analysis.",
      status: "submitted"
    },
    {
      id: "hw-3",
      title: "Python Dictionary & Tuple Comprehensions",
      subject: "Computer Science",
      grade: "10-A",
      due_date: "2026-08-12",
      description: "Write code snippets for word frequency counting and nested dictionary inversion.",
      status: "pending"
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newHw, setNewHw] = useState({
    title: "",
    subject: "Physics",
    grade: "10-A",
    due_date: "2026-08-14",
    description: "",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setHomeworkList(prev => [{ id: `hw-${Date.now()}`, ...newHw, status: "pending" }, ...prev]);
    toast.success(`Assigned homework: ${newHw.title}`, "Homework Assigned");
    setShowModal(false);
  };

  const handleMarkSubmitted = (id: string, title: string) => {
    setHomeworkList(prev => prev.map(h => h.id === id ? { ...h, status: "submitted" } : h));
    toast.success(`Marked "${title}" as submitted!`, "Homework Submitted");
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Academic Curriculum
              </span>
              <span className="text-xs text-gray-400">• Daily Homework & Tasks</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mt-1">
              Homework & Daily Study Assignments
            </h1>
            <p className="text-xs text-gray-400">
              {isTeacher
                ? "Create and distribute daily homework exercises, reading assignments, and worksheets."
                : "Review your daily homework assignments, track due dates, and mark completed tasks."}
            </p>
          </div>

          {isTeacher && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Assign New Homework</span>
            </button>
          )}
        </div>

        {/* Homework Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {homeworkList.map(h => (
            <div
              key={h.id}
              className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {h.subject} • {h.grade}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    h.status === 'submitted'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {h.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{h.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{h.description}</p>
              </div>

              <div className="pt-3 border-t border-gray-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    Due: {h.due_date}
                  </span>
                </div>

                {!isTeacher && h.status === 'pending' && (
                  <button
                    onClick={() => handleMarkSubmitted(h.id, h.title)}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Completed</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="glass-panel border border-gray-700 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h3 className="text-base font-bold text-white">Create Homework Assignment</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Assignment Title</label>
                  <input
                    type="text"
                    value={newHw.title}
                    onChange={e => setNewHw({ ...newHw, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-300 font-semibold block mb-1">Subject</label>
                    <select
                      value={newHw.subject}
                      onChange={e => setNewHw({ ...newHw, subject: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-300 font-semibold block mb-1">Target Grade</label>
                    <input
                      type="text"
                      value={newHw.grade}
                      onChange={e => setNewHw({ ...newHw, grade: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Submission Due Date</label>
                  <input
                    type="date"
                    value={newHw.due_date}
                    onChange={e => setNewHw({ ...newHw, due_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Assignment Details & Instructions</label>
                  <textarea
                    rows={3}
                    value={newHw.description}
                    onChange={e => setNewHw({ ...newHw, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 hover:bg-emerald-500"
                  >
                    Assign Homework
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
