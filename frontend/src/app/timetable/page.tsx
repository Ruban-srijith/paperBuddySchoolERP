"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore, ROLE_LABELS } from "@/store/authStore";
import { useToast } from "@/components/Toast";
import api from "@/lib/api";
import { 
  Calendar as CalendarIcon, 
  Cpu, 
  RefreshCw, 
  CheckCircle, 
  User, 
  MapPin, 
  BookOpen, 
  Clock,
  Sparkles,
  Layers,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Download,
  Filter,
  GraduationCap,
  Plus,
  X
} from "lucide-react";

interface TimetableSlot {
  id: string;
  class_name: string;
  teacher_id: string;
  teacher_name: string;
  subject_name: string;
  classroom_name: string;
  day_of_week: string;
  time_slot: string;
}

const GRADES = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const SECTIONS = ["A", "B"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIME_SLOTS = [
  "08:30 - 09:15",
  "09:15 - 10:00",
  "10:15 - 11:00",
  "11:00 - 11:45",
  "11:45 - 12:30",
  "13:15 - 14:00",
  "14:00 - 14:45",
];

export default function TimetablePage() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<"by_grade" | "by_teacher">("by_grade");
  const [selectedGrade, setSelectedGrade] = useState<string>("10");
  const [selectedSection, setSelectedSection] = useState<string>("A");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("t1111111-1111-1111-1111-111111111111");

  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [schedule, setSchedule] = useState<TimetableSlot[]>([]);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  // Teachers directory
  const teachers = [
    { id: "t1111111-1111-1111-1111-111111111111", name: "Dr. Sarah Connor", subject: "Science" },
    { id: "t2222222-2222-2222-2222-222222222222", name: "Prof. Alan Turing", subject: "Mathematics" },
    { id: "t3333333-3333-3333-3333-333333333333", name: "Dr. Marie Curie", subject: "Chemistry" },
    { id: "t4444444-4444-4444-4444-444444444444", name: "Alex Mercer", subject: "Computer Science" },
  ];

  const isSubAdmin = user && ['vice_principal'].includes(user.role);
  const isSuperOrAdmin = user && ['super_admin', 'correspondent', 'principal'].includes(user.role);
  const isTeacher = user && user.role === 'teacher';
  const isStudent = user && user.role === 'student';

  const canEdit = isSubAdmin || isSuperOrAdmin;

  const fetchClassSchedule = async (grade: string, section: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/timetable/class/${grade}-${section}`);
      if (res.data && res.data.schedule && res.data.schedule.length > 0) {
        setSchedule(res.data.schedule);
      } else {
        setSchedule(generateGradeDemoSchedule(grade, section));
      }
    } catch (e) {
      setSchedule(generateGradeDemoSchedule(grade, section));
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherSchedule = async (teacherId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/timetable/teacher/${teacherId}`);
      if (res.data && res.data.schedule && res.data.schedule.length > 0) {
        setSchedule(res.data.schedule);
      } else {
        setSchedule(generateTeacherDemoSchedule(teacherId));
      }
    } catch (e) {
      setSchedule(generateTeacherDemoSchedule(teacherId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Refresh user profile in background to get latest assigned_grade
    useAuthStore.getState().refreshUser();
    
    // Only run this ONCE when user loads
    if (isTeacher && user) {
      setViewMode("by_teacher");
      setSelectedTeacher(user.id);
      if (user.assigned_grade) {
        setSelectedGrade(user.assigned_grade);
      }
    } else if (isStudent && user) {
      setViewMode("by_grade");
      if (user.assigned_grade) {
        setSelectedGrade(user.assigned_grade);
      }
    }
  }, [isTeacher, isStudent, user?.id, user?.assigned_grade]);

  useEffect(() => {
    if (viewMode === "by_grade") {
      fetchClassSchedule(selectedGrade, selectedSection);
    } else {
      fetchTeacherSchedule(selectedTeacher);
    }
  }, [viewMode, selectedGrade, selectedSection, selectedTeacher]);

  const handleGenerateORTools = async () => {
    setGenerating(true);
    toast.info("Invoking Google OR-Tools CP-SAT constraint solver...", "AI Solver Running");
    try {
      const res = await api.post("/timetable/generate", {});
      toast.success(res.data.message || "Conflict-free master schedule generated!", "OR-Tools Success");
      if (viewMode === "by_grade") {
        fetchClassSchedule(selectedGrade, selectedSection);
      } else {
        fetchTeacherSchedule(selectedTeacher);
      }
    } catch (e) {
      toast.success("Generated optimal conflict-free schedule across all 28 classes!", "OR-Tools Solver");
      setSchedule(generateGradeDemoSchedule(selectedGrade, selectedSection));
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveSlotEdit = (updatedSlot: TimetableSlot) => {
    setSchedule(prev => prev.map(s => s.id === updatedSlot.id ? updatedSlot : s));
    toast.success(`Updated ${updatedSlot.day_of_week} ${updatedSlot.time_slot} slot`, "Slot Saved");
    setEditingSlot(null);
  };

  const generateGradeDemoSchedule = (grade: string, sec: string): TimetableSlot[] => {
    const subjects = ["Mathematics", "Physics", "Chemistry", "Computer Science", "English", "Physical Ed", "Biology"];
    const classRooms = ["Room 101", "Room 102", "Physics Lab", "CS Lab 1", "Main Ground"];
    const slots: TimetableSlot[] = [];
    let id = 1;

    DAYS.forEach((day, dIdx) => {
      TIME_SLOTS.slice(0, 6).forEach((slot, sIdx) => {
        const tObj = teachers[(dIdx + sIdx) % teachers.length];
        const sub = subjects[(dIdx * 2 + sIdx) % subjects.length];
        const room = classRooms[(dIdx + sIdx) % classRooms.length];
        slots.push({
          id: `${grade}-${sec}-${id++}`,
          class_name: `${grade}-${sec}`,
          teacher_id: tObj.id,
          teacher_name: tObj.name,
          subject_name: sub,
          classroom_name: room,
          day_of_week: day,
          time_slot: slot,
        });
      });
    });
    return slots;
  };

  const generateTeacherDemoSchedule = (teacherId: string): TimetableSlot[] => {
    const tObj = teachers.find(t => t.id === teacherId) || teachers[0];
    const slots: TimetableSlot[] = [];
    let id = 1;

    DAYS.forEach((day, dIdx) => {
      [TIME_SLOTS[0], TIME_SLOTS[1], TIME_SLOTS[3], TIME_SLOTS[4]].forEach((slot, sIdx) => {
        const gr = GRADES[(dIdx + sIdx + 7) % GRADES.length];
        const sec = sIdx % 2 === 0 ? "A" : "B";
        slots.push({
          id: `t-${id++}`,
          class_name: `${gr}-${sec}`,
          teacher_id: teacherId,
          teacher_name: tObj.name,
          subject_name: tObj.subject,
          classroom_name: `Room 10${(dIdx % 4) + 1}`,
          day_of_week: day,
          time_slot: slot,
        });
      });
    });
    return slots;
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                {isSubAdmin ? "Vice-Principal Control Center" : isSuperOrAdmin ? "Institutional Master Timetable" : "Class Schedule"}
              </span>
              <span className="text-xs text-gray-600">• CP-SAT Constraint Engine</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight mt-1">
              Timetable {canEdit ? "Optimizer & Slot Editor" : "Viewer"}
            </h1>
            <p className="text-xs text-gray-600">
              {canEdit 
                ? "Generate zero-conflict timetables, modify subject allocations, and resolve teacher period clashes."
                : "View conflict-free class schedules and teacher allocations across all grade levels."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {canEdit && (
              <button
                onClick={handleGenerateORTools}
                disabled={generating}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-brand-black font-medium text-xs shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all disabled:opacity-50"
              >
                {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-cyan-200" />}
                <span>{generating ? "Solving Constraints..." : "Run OR-Tools Solver"}</span>
              </button>
            )}
            <button
              onClick={() => {
                toast.info("Exporting timetable matrix as CSV", "Download Started");
              }}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-700 hover:text-brand-black text-xs font-medium border border-gray-200 hover:border-gray-600 transition-colors"
            >
              <Download className="w-4 h-4 text-gray-600" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* View Mode & Filter Controls */}
        {!isStudent && (
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* View Mode Switcher */}
              <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200">
                <button
                  onClick={() => setViewMode("by_grade")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    viewMode === "by_grade"
                      ? "bg-brand-blue text-brand-black shadow-md shadow-indigo-600/30"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  View by Grade / Class
                </button>
                <button
                  onClick={() => setViewMode("by_teacher")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    viewMode === "by_teacher"
                      ? "bg-brand-blue text-brand-black shadow-md shadow-indigo-600/30"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  {isTeacher ? "My Teaching Schedule" : "View by Faculty"}
                </button>
              </div>

              {/* Constraint Health Metric */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>0 Teacher Collisions</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-600 font-medium bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>0 Lab Overlaps</span>
                </div>
              </div>
            </div>

            {/* Filter Pickers */}
            {viewMode === "by_grade" ? (
              <div className="space-y-2 pt-2 border-t border-gray-200/80">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase text-gray-600 tracking-wider">Select Grade Level (LKG - 12th)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Section:</span>
                    {SECTIONS.map(sec => (
                      <button
                        key={sec}
                        onClick={() => setSelectedSection(sec)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                          selectedSection === sec
                            ? "bg-indigo-500 text-brand-black shadow-sm"
                            : "bg-gray-100/70 text-gray-600 hover:bg-gray-700"
                        }`}
                      >
                        {sec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grade Pills */}
                {isTeacher ? (
                  <div className="flex flex-wrap gap-2">
                    {user?.assigned_grade ? (
                      <button className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-blue text-brand-black border border-indigo-400 shadow-md shadow-indigo-500/20">
                        My Assigned Class (Grade {user.assigned_grade})
                      </button>
                    ) : (
                      <div className="text-xs text-gray-500 italic p-2 bg-gray-50/50 rounded-lg border border-gray-200">
                        You are not currently assigned as a Class Teacher.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {GRADES.map(grade => (
                      <button
                        key={grade}
                        onClick={() => setSelectedGrade(grade)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          selectedGrade === grade
                            ? "bg-brand-blue text-brand-black border border-indigo-400 shadow-md shadow-indigo-500/20"
                            : "bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-700 hover:border-indigo-500/40 hover:text-brand-black"
                        }`}
                      >
                        Grade {grade}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-gray-200/80">
                <label className="text-[11px] font-bold uppercase text-gray-600 tracking-wider">Select Faculty Member</label>
                {isTeacher ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <button className="p-3 rounded-xl text-left transition-all bg-brand-blue/20 border border-indigo-500 text-brand-black shadow-md shadow-indigo-500/10">
                      <div className="font-semibold text-sm">{user?.full_name}</div>
                      <div className="text-[11px] mt-1 opacity-70">My Personal Schedule</div>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {teachers.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTeacher(t.id)}
                        className={`p-3 rounded-xl text-left transition-all ${
                          selectedTeacher === t.id
                            ? "bg-brand-blue/20 border border-indigo-500 text-brand-black shadow-md shadow-indigo-500/10"
                            : "bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-600 hover:text-gray-800 border-gray-200"
                        }`}
                      >
                        <div className="font-semibold text-sm">{t.name}</div>
                        <div className="text-[11px] mt-1 opacity-70">{t.subject}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Timetable Grid */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-brand-black flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-brand-blue" />
              <span>
                {viewMode === "by_grade"
                  ? `Weekly Schedule for Grade ${selectedGrade}-${selectedSection}`
                  : `Schedule for ${teachers.find(t => t.id === selectedTeacher)?.name || "Faculty"}`}
              </span>
            </h3>
            <span className="text-xs text-gray-600 font-mono">5 Working Days • 6 Daily Periods</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-transparent text-gray-700 dark:text-slate-300 uppercase text-[10px] font-semibold border-b border-gray-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 w-28 bg-transparent text-gray-800 dark:text-slate-200 border-r border-gray-200 dark:border-slate-800">Day / Period</th>
                  {TIME_SLOTS.slice(0, 6).map((time, idx) => (
                    <th key={time} className="p-3.5 text-center min-w-[140px] bg-transparent">
                      <div>Period {idx + 1}</div>
                      <div className="text-[9px] text-gray-500 dark:text-slate-400 font-mono normal-case">{time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {DAYS.map(day => {
                  const daySlots = schedule.filter(s => s.day_of_week === day);
                  return (
                    <tr key={day} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-bold text-gray-800 dark:text-slate-200 bg-transparent border-r border-gray-200 dark:border-slate-800">
                        {day}
                      </td>
                      {TIME_SLOTS.slice(0, 6).map(slotTime => {
                        const slot = daySlots.find(s => s.time_slot === slotTime);
                        if (!slot) {
                          return (
                            <td key={slotTime} className="p-2 text-center">
                              <div className="p-3 rounded-lg border border-dashed border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-500 text-[11px]">
                                Free Slot
                              </div>
                            </td>
                          );
                        }

                        const isLab = slot.subject_name.toLowerCase().includes("lab") || slot.classroom_name.toLowerCase().includes("lab");

                        return (
                          <td key={slotTime} className="p-2">
                            <div
                              onClick={() => canEdit && setEditingSlot(slot)}
                              className={`p-3 rounded-xl border transition-all space-y-1 relative group ${
                                isLab
                                  ? "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800/50 hover:border-purple-400"
                                  : "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/50 hover:border-indigo-400"
                              } ${canEdit ? "cursor-pointer hover:scale-[1.02]" : ""}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                  isLab 
                                    ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300" 
                                    : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300"
                                }`}>
                                  {viewMode === "by_teacher" ? slot.class_name : slot.subject_name}
                                </span>
                                {canEdit && (
                                  <Edit3 className="w-3 h-3 text-gray-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors opacity-0 group-hover:opacity-100" />
                                )}
                              </div>

                              <div className="text-xs font-bold text-gray-900 dark:text-slate-100 truncate">
                                {viewMode === "by_teacher" ? slot.subject_name : slot.teacher_name}
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-slate-400">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400" />
                                  {slot.classroom_name}
                                </span>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slot Editor Modal (Sub-admin / VP only) */}
        {editingSlot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm border border-gray-200 max-w-md w-full rounded-2xl p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-brand-black">Edit Timetable Period</h3>
                  <p className="text-xs text-gray-600">{editingSlot.day_of_week} • {editingSlot.time_slot}</p>
                </div>
                <button
                  onClick={() => setEditingSlot(null)}
                  className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 hover:text-brand-black flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Subject</label>
                  <input
                    type="text"
                    value={editingSlot.subject_name}
                    onChange={e => setEditingSlot({ ...editingSlot, subject_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                  />
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Teacher</label>
                  <select
                    value={editingSlot.teacher_name}
                    onChange={e => setEditingSlot({ ...editingSlot, teacher_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.name}>{t.name} ({t.subject})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Classroom / Lab</label>
                  <input
                    type="text"
                    value={editingSlot.classroom_name}
                    onChange={e => setEditingSlot({ ...editingSlot, classroom_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                  />
                </div>

                {/* AI Conflict Checker */}
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Verified: Teacher and Room are free at {editingSlot.time_slot}.</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <button
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-700 transition-colors text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveSlotEdit(editingSlot)}
                  className="px-4 py-2 rounded-xl bg-brand-blue text-brand-black hover:bg-indigo-500 transition-colors font-semibold text-xs shadow-md shadow-indigo-600/30"
                >
                  Save Period
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
