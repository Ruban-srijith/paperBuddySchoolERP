"use client";

import { useState } from "react";
import { 
  HelpCircle, 
  Send, 
  CheckCircle2, 
  Clock, 
  Plus, 
  BookOpen, 
  Sparkles,
  X
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/Toast";

interface StudentQuery {
  id: string;
  subject: string;
  topic: string;
  question: string;
  date: string;
  status: "open" | "answered";
  answer?: string;
  teacher_name?: string;
}

export default function StudentQueriesPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [showAskModal, setShowAskModal] = useState(false);

  const [queries, setQueries] = useState<StudentQuery[]>([
    {
      id: "q1",
      subject: "Physics",
      topic: "Electromagnetic Induction",
      question: "In Lenz's Law, why is the induced current always in a direction that opposes the change in magnetic flux?",
      date: "Aug 06, 2026",
      status: "open",
    },
    {
      id: "q2",
      subject: "Mathematics",
      topic: "Quadratic Equations",
      question: "How do we geometrically interpret imaginary roots when the discriminant D < 0?",
      date: "Aug 04, 2026",
      status: "answered",
      teacher_name: "Prof. Alan Turing",
      answer: "Geometrically, if D < 0, the parabola defined by y = ax^2 + bx + c never touches or crosses the x-axis. It remains entirely above or below the x-axis.",
    }
  ]);

  const [newQuery, setNewQuery] = useState({
    subject: "Physics",
    topic: "",
    question: "",
  });

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    setQueries(prev => [{
      id: `q-${Date.now()}`,
      subject: newQuery.subject,
      topic: newQuery.topic,
      question: newQuery.question,
      date: "Today",
      status: "open"
    }, ...prev]);
    toast.success("Your doubt has been submitted to your subject teacher!", "Doubt Submitted");
    setShowAskModal(false);
    setNewQuery({ subject: "Physics", topic: "", question: "" });
  };

  return (
    <ProtectedRoute allowedRoles={["student", "super_admin", "principal", "vice_principal"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                Academic Helpdesk
              </span>
              <span className="text-xs text-gray-600">• Direct Teacher Assistance</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight mt-1">
              Ask Teacher Doubts & Subject Questions
            </h1>
            <p className="text-xs text-gray-600">
              Submit your academic questions directly to subject teachers and review personalized feedback.
            </p>
          </div>

          <button
            onClick={() => setShowAskModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-brand-black font-semibold text-xs shadow-lg shadow-cyan-600/25 hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Ask New Doubt</span>
          </button>
        </div>

        {/* Queries List */}
        <div className="space-y-4">
          {queries.map(q => (
            <div
              key={q.id}
              className={`bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border space-y-3 transition-all ${
                q.status === 'open' ? 'border-cyan-500/40 bg-gray-50/50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {q.subject}
                  </span>
                  <span className="text-xs font-semibold text-gray-700">• {q.topic}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  q.status === 'answered'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {q.status.toUpperCase()}
                </span>
              </div>

              <p className="text-sm font-bold text-brand-black leading-relaxed">
                {q.question}
              </p>

              {q.answer && (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1 text-xs text-emerald-200 leading-relaxed">
                  <div className="text-[10px] font-bold uppercase text-emerald-600">
                    Teacher's Solution ({q.teacher_name}):
                  </div>
                  <p>{q.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Ask Doubt Modal */}
        {showAskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm border border-gray-200 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-base font-bold text-brand-black">Ask Academic Doubt</h3>
                <button onClick={() => setShowAskModal(false)} className="text-gray-600 hover:text-brand-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAsk} className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Subject</label>
                  <select
                    value={newQuery.subject}
                    onChange={e => setNewQuery({ ...newQuery, subject: e.target.value })}
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
                  <label className="text-gray-700 font-semibold block mb-1">Chapter / Topic</label>
                  <input
                    type="text"
                    placeholder="e.g. Chapter 4 - Electromagnetic Induction"
                    value={newQuery.topic}
                    onChange={e => setNewQuery({ ...newQuery, topic: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Your Question / Doubt</label>
                  <textarea
                    rows={4}
                    placeholder="Explain what concept or exercise problem you need help with..."
                    value={newQuery.question}
                    onChange={e => setNewQuery({ ...newQuery, question: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAskModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-700 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-cyan-600 text-brand-black font-semibold text-xs shadow-md shadow-cyan-600/30 hover:bg-cyan-500 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Doubt
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
