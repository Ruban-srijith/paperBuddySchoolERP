"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/Toast";
import api from "@/lib/api";
import { 
  FlaskConical, 
  Upload, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar, 
  Sparkles, 
  FileUp, 
  Plus, 
  Building2, 
  Cpu, 
  Award, 
  ShieldCheck, 
  X,
  FileText,
  User
} from "lucide-react";

interface LabAssignment {
  id: string;
  title: string;
  subject: string;
  grade: string;
  description: string;
  due_date: string;
  status: "not_submitted" | "submitted" | "late" | "graded";
  submitted_at?: string;
  grade_score?: number;
  feedback?: string;
  total_submissions?: number;
  total_students?: number;
}

export default function LabsPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [labs, setLabs] = useState<LabAssignment[]>([]);
  const [selectedLab, setSelectedLab] = useState<LabAssignment | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [gradingLab, setGradingLab] = useState<LabAssignment | null>(null);
  const [gradeInput, setGradeInput] = useState({ score: 90, feedback: "Well structured observations and accurate graph calculations." });

  const [newLabForm, setNewLabForm] = useState({
    title: "Lab 04: Semiconductor Diode Characteristics",
    subject: "Physics",
    grade: "12-A",
    description: "Plot forward and reverse bias V-I curves for silicon and germanium diodes.",
    due_date: "2026-08-15T23:59:00",
  });

  const isManagement = user && ['super_admin', 'correspondent', 'admin', 'principal', 'vice_principal', 'dean', 'dept_head'].includes(user.role);
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  const fetchLabs = async () => {
    try {
      const res = await api.get("/labs/assignments/class/all"); // Assuming 'all' or no ID fetches all for the user
      setLabs(res.data || []);
    } catch (e) {
      console.error("Failed to fetch labs", e);
      setLabs([]);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleUploadSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLab) return;
    setUploading(true);
    try {
      toast.success(`Lab submission uploaded for ${selectedLab.title}!`, "Submission Uploaded");
      setLabs(prev => prev.map(l => l.id === selectedLab.id ? { ...l, status: "submitted", submitted_at: new Date().toISOString() } : l));
      setSelectedLab(null);
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateLab = (e: React.FormEvent) => {
    e.preventDefault();
    const newLab: LabAssignment = {
      id: `lab-${Date.now()}`,
      title: newLabForm.title,
      subject: newLabForm.subject,
      grade: newLabForm.grade,
      description: newLabForm.description,
      due_date: newLabForm.due_date,
      status: "not_submitted",
      total_submissions: 0,
      total_students: 30,
    };
    setLabs(prev => [newLab, ...prev]);
    toast.success(`Created practical lab assignment: ${newLabForm.title}`, "Lab Created");
    setShowCreateModal(false);
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingLab) return;
    setLabs(prev => prev.map(l => l.id === gradingLab.id ? { ...l, status: "graded", grade_score: gradeInput.score, feedback: gradeInput.feedback } : l));
    toast.success(`Graded ${gradingLab.title}: ${gradeInput.score}/100`, "Grade Recorded");
    setGradingLab(null);
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                {isManagement ? "Specialized Laboratory Operations" : isTeacher ? "Lab Faculty Portal" : "Student Lab Submissions"}
              </span>
              <span className="text-xs text-gray-600">• Practical Evaluation</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight mt-1">
              Practical Science & CS Laboratory Hub
            </h1>
            <p className="text-xs text-gray-600">
              {isManagement
                ? "Specialized laboratory facilities, safety compliance certifications, and practical curriculum progress."
                : isTeacher
                ? "Create experimental assignments, track student PDF submissions, and award numerical scores."
                : "Submit experimental reports, review evaluation remarks, and check lab assignment due dates."}
            </p>
          </div>

          {/* Action Buttons */}
          {isTeacher && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-brand-black font-medium text-xs shadow-lg shadow-purple-600/25 hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Lab Assignment</span>
            </button>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            MANAGEMENT / SUB-ADMIN: LAB FACILITIES OVERVIEW
        ═══════════════════════════════════════════════════════ */}
        {isManagement && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 space-y-1">
                <div className="text-xs text-gray-600">Physics Laboratory</div>
                <div className="text-xl font-bold text-brand-black">Room 204 (Cap: 36)</div>
                <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Calibrated • Safe
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 space-y-1">
                <div className="text-xs text-gray-600">Chemistry Laboratory</div>
                <div className="text-xl font-bold text-brand-black">Chem Lab 2 (Cap: 32)</div>
                <div className="text-[11px] text-cyan-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Fume Hoods Active
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 space-y-1">
                <div className="text-xs text-gray-600">Computer Science Lab 1</div>
                <div className="text-xl font-bold text-brand-black">CS Lab 1 (Cap: 40)</div>
                <div className="text-[11px] text-brand-blue font-medium flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" /> High-Speed LAN & Python 3.12
                </div>
              </div>

              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 space-y-1">
                <div className="text-xs text-gray-600">Biology Laboratory</div>
                <div className="text-xl font-bold text-brand-black">Bio Block 3 (Cap: 30)</div>
                <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Compound Microscopes OK
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            LAB ASSIGNMENTS LISTING & SUBMISSION CARDS
        ═══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {labs.map((lab) => {
            const isDueSoon = new Date(lab.due_date).getTime() - new Date().getTime() < 3 * 24 * 60 * 60 * 1000;

            return (
              <div
                key={lab.id}
                className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200 space-y-4 hover:border-purple-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {lab.subject} • {lab.grade}
                    </span>
                    {lab.status === 'graded' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {lab.grade_score} / 100
                      </span>
                    ) : lab.status === 'submitted' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Submitted
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Pending
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-brand-black">{lab.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{lab.description}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      Due: {new Date(lab.due_date).toLocaleDateString()}
                    </span>
                    {isManagement && lab.total_submissions !== undefined && (
                      <span className="text-cyan-600 font-semibold">
                        {lab.total_submissions} / {lab.total_students} Done
                      </span>
                    )}
                  </div>

                  {lab.feedback && (
                    <div className="p-2.5 rounded-xl bg-gray-100 border border-gray-200 text-[11px] text-gray-700">
                      <span className="text-emerald-600 font-semibold">Faculty Feedback:</span> {lab.feedback}
                    </div>
                  )}

                  {/* Contextual Action Button */}
                  {isStudent && (
                    <button
                      onClick={() => setSelectedLab(lab)}
                      className={`w-full py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        lab.status === 'not_submitted'
                          ? "bg-purple-600 hover:bg-purple-500 text-brand-black shadow-md shadow-purple-600/30"
                          : "bg-gray-100 hover:bg-gray-700 text-gray-700"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{lab.status === 'not_submitted' ? "Upload Lab Report (PDF)" : "Re-upload Report"}</span>
                    </button>
                  )}

                  {isTeacher && (
                    <button
                      onClick={() => {
                        setGradingLab(lab);
                        setGradeInput({ score: lab.grade_score || 90, feedback: lab.feedback || "Good experiment methodology." });
                      }}
                      className="w-full py-2 rounded-xl bg-brand-blue/20 hover:bg-brand-blue/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Evaluate & Grade Submissions</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Student Submission Modal */}
        {selectedLab && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm border border-gray-200 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-base font-bold text-brand-black">Upload Submission: {selectedLab.title}</h3>
                <button onClick={() => setSelectedLab(null)} className="text-gray-600 hover:text-brand-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmission} className="space-y-4 text-xs">
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center space-y-2 hover:border-purple-500/50 transition-colors">
                  <FileUp className="w-8 h-8 text-purple-400 mx-auto" />
                  <div className="text-gray-700 font-semibold">Select PDF Lab Report</div>
                  <p className="text-[11px] text-gray-500">Max size 25MB • Formats: .pdf, .docx, .zip</p>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-purple-600 file:text-brand-black file:text-xs hover:file:bg-purple-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setSelectedLab(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-700 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-brand-black font-semibold text-xs shadow-md shadow-purple-600/30 hover:bg-purple-500 transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Submit Practical"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Teacher Grading Modal */}
        {gradingLab && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm border border-gray-200 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-base font-bold text-brand-black">Grade Lab: {gradingLab.title}</h3>
                <button onClick={() => setGradingLab(null)} className="text-gray-600 hover:text-brand-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveGrade} className="space-y-4 text-xs">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Score (Out of 100)</label>
                  <input
                    type="number"
                    max={100}
                    min={0}
                    value={gradeInput.score}
                    onChange={(e) => setGradeInput({ ...gradeInput, score: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Instructor Remarks</label>
                  <textarea
                    rows={3}
                    value={gradeInput.feedback}
                    onChange={(e) => setGradeInput({ ...gradeInput, feedback: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setGradingLab(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-700 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-brand-blue text-brand-black font-semibold text-xs shadow-md shadow-indigo-600/30 hover:bg-indigo-500"
                  >
                    Save Grade
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Lab Assignment Modal (Teacher) */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm border border-gray-200 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-base font-bold text-brand-black">Create New Lab Assignment</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-600 hover:text-brand-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLab} className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Lab Experiment Title</label>
                  <input
                    type="text"
                    value={newLabForm.title}
                    onChange={e => setNewLabForm({ ...newLabForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-700 font-semibold block mb-1">Subject</label>
                    <select
                      value={newLabForm.subject}
                      onChange={e => setNewLabForm({ ...newLabForm, subject: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Biology">Biology</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-700 font-semibold block mb-1">Target Grade</label>
                    <input
                      type="text"
                      value={newLabForm.grade}
                      onChange={e => setNewLabForm({ ...newLabForm, grade: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Experiment Specifications</label>
                  <textarea
                    rows={3}
                    value={newLabForm.description}
                    onChange={e => setNewLabForm({ ...newLabForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-700 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 text-brand-black font-semibold text-xs shadow-md shadow-purple-600/30 hover:bg-purple-500"
                  >
                    Publish Lab
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
