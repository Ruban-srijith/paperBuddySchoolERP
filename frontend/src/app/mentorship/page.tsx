"use client";

import { useEffect, useState } from "react";
import { 
  UserCheck, 
  BookOpen, 
  CheckSquare, 
  FlaskConical, 
  Plus, 
  MessageSquare, 
  ShieldCheck, 
  X, 
  Check,
  Users,
  Activity,
  Calendar,
  Clock,
  ChevronRight
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/Toast";

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

interface TeacherWorkloadItem {
  teacher_id: string;
  teacher_name: string;
  department: string;
  assigned_classes: string[];
  subjects: string[];
  weekly_periods: number;
  max_periods_cap: number;
  syllabus_completed_pct: number;
  target_pct: number;
  status: string;
  has_lab_component: boolean;
}

function MentorshipContent() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"mentees" | "teachers">("mentees");
  const [mentees, setMentees] = useState<MenteeInsight[]>([]);
  const [teachers, setTeachers] = useState<TeacherWorkloadItem[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWorkloadItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedMentee, setSelectedMentee] = useState<MenteeInsight | null>(null);

  const [logForm, setLogForm] = useState({
    category: "academic",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const isManagement = user && ['super_admin', 'correspondent', 'admin', 'principal', 'vice_principal', 'dean', 'dept_head'].includes(user.role);

  const getMockMentees = (): MenteeInsight[] => {
    return Array.from({ length: 6 }).map((_, i) => ({
      student_id: `stu_${i}`,
      student_name: `Student ${11 + i}`,
      email: `student${11 + i}@school.edu`,
      grade: `Grade ${Math.floor(Math.random() * 5) + 8}`,
      section: ["A", "B", "C"][i % 3],
      attendance_rate: Math.floor(Math.random() * 20) + 80,
      portion_progress: Math.floor(Math.random() * 40) + 50,
      submitted_labs_count: Math.floor(Math.random() * 5) + 2,
      pending_labs_count: Math.floor(Math.random() * 3),
      latest_mentor_notes: i % 2 === 0 ? [{
        id: `note_${i}`,
        mentor_name: "Mentor Guide",
        category: "academic",
        notes: "Student is progressing well but needs to focus more on upcoming lab assessments.",
        created_at: new Date(Date.now() - 86400000).toISOString()
      }] : []
    }));
  };

  const fetchMentees = async () => {
    setLoading(true);
    try {
      const res = await api.get("/mentorship/mentees");
      if (res.data && res.data.length > 0) {
        setMentees(res.data);
      } else {
        setMentees(getMockMentees());
      }
    } catch (err) {
      setMentees(getMockMentees());
    }
    setLoading(false);
  };

  const getMockTeachers = (): TeacherWorkloadItem[] => {
    const depts = ["Science", "Maths", "English", "Computer Science"];
    return Array.from({ length: 6 }).map((_, i) => {
      const target = 100;
      const completed = Math.floor(Math.random() * 40) + 40;
      return {
        teacher_id: `tch_${i}`,
        teacher_name: `Faculty Member ${i + 1}`,
        department: depts[i % depts.length],
        assigned_classes: [`Grade ${10 + (i % 3)} A`, `Grade ${10 + (i % 3)} B`],
        subjects: [`${depts[i % depts.length]} 101`],
        weekly_periods: Math.floor(Math.random() * 10) + 15,
        max_periods_cap: 30,
        syllabus_completed_pct: completed,
        target_pct: target,
        status: completed < 50 ? "Behind Schedule" : "On Track",
        has_lab_component: i % 2 === 0
      };
    });
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get("/academics/teachers-workload");
      if (res.data && res.data.length > 0) {
        setTeachers(res.data);
      } else {
        setTeachers(getMockTeachers());
      }
    } catch (err) {
      setTeachers(getMockTeachers());
    }
  };

  useEffect(() => {
    fetchMentees();
    if (isManagement) {
      fetchTeachers();
    }
  }, [user]);

  const handleAddLog = (mentee: MenteeInsight) => {
    setSelectedMentee(mentee);
    setLogForm({ category: "academic", notes: "" });
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
      toast.success("Mentorship activity log created successfully", "Log Recorded");
      fetchMentees();
      setShowLogModal(false);
    } catch (err: any) {
      toast.error(`Failed to save log: ${err.response?.data?.detail || "Error"}`);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-violet-400" />
            </div>
            Mentorship Activity & Faculty Oversight
          </h1>
          <p className="text-sm text-gray-400">
            Monitor mentee attendance & holistic progress, and review teacher workload & syllabus completion.
          </p>
        </div>

        {/* Management Tab Switcher */}
        {isManagement && (
          <div className="inline-flex rounded-xl bg-gray-900/80 p-1 border border-gray-800 self-start">
            <button
              onClick={() => setActiveTab("mentees")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "mentees"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Mentees Insights
            </button>
            <button
              onClick={() => setActiveTab("teachers")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "teachers"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Faculty Oversight
            </button>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════
          TAB 1: MENTEES HOLISTIC INSIGHTS (MENTOR / ADMIN)
      ═══════════════════════════════════════════════════════ */}
      {activeTab === "mentees" && (
        <>
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
                  <div className="flex items-center justify-between gap-2 border-b border-gray-800/60 pb-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-400 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                        {m.student_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="text-base font-bold text-white truncate">{m.student_name}</h3>
                        <p className="text-xs text-gray-400 truncate">{m.email}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium whitespace-nowrap">
                        {m.grade}-{m.section}
                      </span>
                    </div>
                  </div>

                  {/* Holistic Metrics Progress Bars */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="glass-panel p-3 rounded-xl space-y-1 text-center">
                      <div className="text-[10px] text-gray-400 font-semibold uppercase flex items-center justify-center gap-1">
                        <CheckSquare className="w-3 h-3 text-emerald-400" /> Attendance
                      </div>
                      <div className="text-lg font-bold text-emerald-400">{m.attendance_rate}%</div>
                    </div>

                    <div className="glass-panel p-3 rounded-xl space-y-1 text-center">
                      <div className="text-[10px] text-gray-400 font-semibold uppercase flex items-center justify-center gap-1">
                        <BookOpen className="w-3 h-3 text-amber-400" /> Portion
                      </div>
                      <div className="text-lg font-bold text-amber-400">{m.portion_progress}%</div>
                    </div>

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
        </>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 2: FACULTY & TEACHERS OVERSIGHT (ADMIN / SUB-ADMIN)
      ═══════════════════════════════════════════════════════ */}
      {activeTab === "teachers" && isManagement && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teachers.map((t) => (
              <div
                key={t.teacher_id}
                onClick={() => setSelectedTeacher(t)}
                className="glass-panel p-6 rounded-2xl space-y-4 border border-gray-800 hover:border-violet-500/50 hover:bg-gray-900/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-violet-400 transition-colors">
                      {t.teacher_name}
                    </h3>
                    <p className="text-xs text-gray-400">{t.department} • {t.subjects.join(", ")}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800">
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Weekly Load</div>
                    <div className="text-base font-bold text-white mt-0.5">{t.weekly_periods} / {t.max_periods_cap}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800">
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Syllabus %</div>
                    <div className="text-base font-bold text-emerald-400 mt-0.5">{t.syllabus_completed_pct}%</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-900/80 border border-gray-800">
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Assigned Classes</div>
                    <div className="text-xs font-bold text-cyan-400 mt-1">{t.assigned_classes.join(", ")}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Teacher Drill-down Modal */}
          {selectedTeacher && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
              <div className="glass-panel border border-gray-700 max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedTeacher.teacher_name}</h3>
                    <p className="text-xs text-gray-400">{selectedTeacher.department}</p>
                  </div>
                  <button onClick={() => setSelectedTeacher(null)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2">
                    <div className="flex justify-between text-gray-300">
                      <span>Syllabus Target: {selectedTeacher.target_pct}%</span>
                      <span className="font-bold text-emerald-400">Actual: {selectedTeacher.syllabus_completed_pct}%</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${selectedTeacher.syllabus_completed_pct}%` }}></div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
                    <div className="font-semibold text-white">Assigned Classes & Subjects</div>
                    <div className="text-gray-300">Classes: {selectedTeacher.assigned_classes.join(", ")}</div>
                    <div className="text-gray-300">Subjects: {selectedTeacher.subjects.join(", ")}</div>
                    <div className="text-cyan-300 mt-1">Lab Component: {selectedTeacher.has_lab_component ? "Included (Practical Lab)" : "Theory Only"}</div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedTeacher(null)}
                    className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
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
    <ProtectedRoute allowedRoles={["super_admin", "correspondent", "admin", "principal", "vice_principal", "dean", "dept_head", "mentor"]}>
      <MentorshipContent />
    </ProtectedRoute>
  );
}
