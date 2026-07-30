"use client";

import { useEffect, useState } from "react";
import { UserCheck, BookOpen, CheckSquare, FlaskConical, Plus, MessageSquare, ShieldCheck, X, Check } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface MenteeInsight {
  student_id: string;
  student_name: string;
  email: string;
  grade?: string;
  section?: string;
  attendance_rate: number;
  portion_progress: number;
  submitted_labs_count: number;
  pending_labs_count: number;
  latest_mentor_notes: {
    id: string;
    mentor_name: string;
    category: string;
    notes: string;
    created_at: string;
  }[];
}

function MentorshipContent() {
  const [mentees, setMentees] = useState<MenteeInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState<MenteeInsight | null>(null);

  const [logForm, setLogForm] = useState({
    category: "academic",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchMentees = async () => {
    setLoading(true);
    try {
      const res = await api.get("/mentorship/mentees");
      setMentees(res.data);
    } catch (err) {
      console.error("Failed to fetch mentees:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMentees();
  }, []);

  const handleAddLog = (mentee: MenteeInsight) => {
    setSelectedMentee(mentee);
    setLogForm({ category: "academic", notes: "" });
    setMsg(null);
    setShowLogModal(true);
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentee) return;
    setSubmitting(true);
    try {
      await api.post("/mentorship/logs", {
        student_id: selectedMentee.student_id,
        category: logForm.category,
        notes: logForm.notes,
      });
      setMsg("Mentorship activity log created successfully.");
      fetchMentees();
      setShowLogModal(false);
    } catch (err: any) {
      setMsg(`Failed to save log: ${err.response?.data?.detail || "Error"}`);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-violet-400" />
          </div>
          Mentorship Activity & Holistic Insights
        </h1>
        <p className="text-sm text-gray-400">Monitor mentee progress across attendance, portion completion, lab work, and log academic notes</p>
      </div>

      {/* Mentees Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : mentees.length === 0 ? (
        <div className="glass-panel p-8 text-center text-gray-500 text-sm rounded-2xl">
          No mentees assigned to your group currently.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mentees.map((m) => (
            <div key={m.student_id} className="glass-panel p-6 rounded-2xl space-y-5 border border-gray-800/60 hover:border-violet-500/40 transition-all">
              {/* Student Header */}
              <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {m.student_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{m.student_name}</h3>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium">
                    Grade {m.grade}-{m.section}
                  </span>
                </div>
              </div>

              {/* Holistic Metrics Progress Bars */}
              <div className="grid grid-cols-3 gap-4">
                {/* Attendance Rate */}
                <div className="glass-panel p-3 rounded-xl space-y-1 text-center">
                  <div className="text-[10px] text-gray-400 font-semibold uppercase flex items-center justify-center gap-1">
                    <CheckSquare className="w-3 h-3 text-emerald-400" /> Attendance
                  </div>
                  <div className="text-lg font-bold text-emerald-400">{m.attendance_rate}%</div>
                </div>

                {/* Portion Progress */}
                <div className="glass-panel p-3 rounded-xl space-y-1 text-center">
                  <div className="text-[10px] text-gray-400 font-semibold uppercase flex items-center justify-center gap-1">
                    <BookOpen className="w-3 h-3 text-amber-400" /> Portion
                  </div>
                  <div className="text-lg font-bold text-amber-400">{m.portion_progress}%</div>
                </div>

                {/* Labs Status */}
                <div className="glass-panel p-3 rounded-xl space-y-1 text-center">
                  <div className="text-[10px] text-gray-400 font-semibold uppercase flex items-center justify-center gap-1">
                    <FlaskConical className="w-3 h-3 text-purple-400" /> Labs Done
                  </div>
                  <div className="text-lg font-bold text-purple-400">{m.submitted_labs_count}</div>
                </div>
              </div>

              {/* Recent Mentorship Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-violet-400" /> Mentorship Notes
                  </span>
                  <button
                    onClick={() => handleAddLog(m)}
                    className="text-violet-300 hover:text-white flex items-center gap-1 text-[11px] font-medium"
                  >
                    <Plus className="w-3 h-3" /> Log Note
                  </button>
                </div>

                {m.latest_mentor_notes.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No notes logged yet.</p>
                ) : (
                  <div className="space-y-2">
                    {m.latest_mentor_notes.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800/60 text-xs space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span className="uppercase px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-medium">{n.category}</span>
                          <span>{new Date(n.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed">{n.notes}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Log Modal */}
      {showLogModal && selectedMentee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowLogModal(false)}></div>
          <div className="relative glass-panel-glow rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
              <h3 className="text-base font-bold text-white">Log Activity for {selectedMentee.student_name}</h3>
              <button onClick={() => setShowLogModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Category</label>
                <select
                  value={logForm.category}
                  onChange={(e) => setLogForm({ ...logForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900/70 border border-gray-700/60 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="academic">Academic Progress</option>
                  <option value="behavioral">Behavioral Observation</option>
                  <option value="general">General Mentorship Note</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Notes & Feedback</label>
                <textarea
                  rows={4}
                  value={logForm.notes}
                  onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                  placeholder="Enter detailed mentorship feedback..."
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-900/70 border border-gray-700/60 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2 rounded-xl glass-panel text-gray-300 text-xs font-medium hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-xs font-medium shadow-lg hover:opacity-90 flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MentorshipPage() {
  return (
    <ProtectedRoute allowedRoles={["super_admin", "admin", "principal", "dean", "dept_head", "mentor"]}>
      <MentorshipContent />
    </ProtectedRoute>
  );
}
