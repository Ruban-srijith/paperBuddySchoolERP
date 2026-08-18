"use client";

import { useState, useEffect } from "react";
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
import api from "@/lib/api";

interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  grade: string;
  due_date: string;
  description: string;
  status: string;
}

export default function HomeworkPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const isTeacher = user?.role === "teacher" || ['super_admin', 'principal', 'vice_principal'].includes(user?.role || '');

  const [homeworkList, setHomeworkList] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);

  const getDemoHomework = (): HomeworkItem[] => [
    {
      id: "hw-1",
      title: "Exercise 4.3 — Quadratic Equations & Word Problems",
      subject: "Mathematics",
      grade: "10-A",
      due_date: "2026-08-14",
      description: "Complete Questions 1 through 10 on page 84. Show complete step-by-step factorization.",
      status: "pending"
    },
    {
      id: "hw-2",
      title: "Ray Optics: Convex & Concave Lens Calculations",
      subject: "Physics",
      grade: "10-A",
      due_date: "2026-08-15",
      description: "Draw ray diagrams for object at 2F, F, and between F and Optical Center.",
      status: "pending"
    },
    {
      id: "hw-3",
      title: "Python Dictionary & Tuple Practice Problems",
      subject: "Computer Science",
      grade: "10-A",
      due_date: "2026-08-12",
      description: "Write Python script to count word frequency in a paragraph and save output as dict.",
      status: "submitted"
    },
    {
      id: "hw-4",
      title: "Chemical Bonding & Ionic Lattice Structures",
      subject: "Chemistry",
      grade: "10-A",
      due_date: "2026-08-16",
      description: "Answer review questions at chapter end. Highlight dot-and-cross diagram for NaCl.",
      status: "pending"
    }
  ];

  useEffect(() => {
    async function fetchHomework() {
      try {
        const res = await api.get("/academics/homework");
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map((h: any) => ({
            id: h.id || `hw-${Math.random()}`,
            title: h.title,
            subject: h.subject || "General",
            grade: h.grade || "10-A",
            due_date: h.due_date,
            description: h.description,
            status: (h.status === 'completed' || h.status === 'submitted') ? 'submitted' : 'pending'
          }));
          setHomeworkList(mapped);
        } else {
          setHomeworkList(getDemoHomework());
        }
      } catch (err) {
        setHomeworkList(getDemoHomework());
      } finally {
        setLoading(false);
      }
    }
    fetchHomework();
  }, []);

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
              <span className="text-xs text-gray-600">• Daily Homework & Tasks</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight mt-1">
              Homework & Daily Study Assignments
            </h1>
            <p className="text-xs text-gray-600">
              {isTeacher
                ? "Create and distribute daily homework exercises, reading assignments, and worksheets."
                : "Review your daily homework assignments, track due dates, and mark completed tasks."}
            </p>
          </div>

          {isTeacher && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-brand-black font-semibold text-xs shadow-lg shadow-emerald-600/25 hover:opacity-95 transition-all"
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
              className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200 space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
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

                <h3 className="text-base font-bold text-brand-black">{h.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{h.description}</p>
              </div>

              <div className="pt-3 border-t border-gray-200 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-600 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Due: {h.due_date}
                  </span>
                </div>

                {!isTeacher && h.status === 'pending' && (
                  <button
                    onClick={() => handleMarkSubmitted(h.id, h.title)}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-brand-black font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
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
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm border border-gray-200 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-base font-bold text-brand-black">Create Homework Assignment</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-brand-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Assignment Title</label>
                  <input
                    type="text"
                    value={newHw.title}
                    onChange={e => setNewHw({ ...newHw, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-700 font-semibold block mb-1">Subject</label>
                    <select
                      value={newHw.subject}
                      onChange={e => setNewHw({ ...newHw, subject: e.target.value })}
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
                    <label className="text-gray-700 font-semibold block mb-1">Target Grade</label>
                    <input
                      type="text"
                      value={newHw.grade}
                      onChange={e => setNewHw({ ...newHw, grade: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Submission Due Date</label>
                  <input
                    type="date"
                    value={newHw.due_date}
                    onChange={e => setNewHw({ ...newHw, due_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Assignment Details & Instructions</label>
                  <textarea
                    rows={3}
                    value={newHw.description}
                    onChange={e => setNewHw({ ...newHw, description: e.target.value })}
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
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-brand-black font-semibold text-xs shadow-md shadow-emerald-600/30 hover:bg-emerald-500"
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
