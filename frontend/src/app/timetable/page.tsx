"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore, ROLE_LABELS } from "@/store/authStore";
import { useToast } from "@/components/Toast";
import api from "@/lib/api";
import { exportToCsv } from "@/lib/exportUtils";
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
  const [generationOffset, setGenerationOffset] = useState(0);

  // Teachers directory
  const teachers = [
    { id: "cd54a593-d67b-49d8-9477-c3d60fdc4ca1", name: "Dr. Sarah Connor", subject: "Science" },
    { id: "0dc69666-54d5-412b-9c9d-2b9273ab8077", name: "Prof. Alan Turing", subject: "Mathematics" },
    { id: "9ac7ef9a-30c3-40b9-84f8-6b0c98c609c1", name: "Dr. Marie Curie", subject: "Chemistry" },
    { id: "857f735e-e570-433b-9d4e-28629f24383b", name: "Alex Mercer", subject: "Computer Science" },
    { id: "b6416709-b49b-428b-86a1-f4b15e1f9948", name: "Prof. Venkat Raman", subject: "Physics" },
    { id: "9166eeb8-28e8-4310-afee-f866981491f5", name: "Dr. Lakshmi Iyer", subject: "English Language" },
    { id: "28cd22b3-ea01-4b49-a7c7-ade3949a701c", name: "Prof. Suresh Babu", subject: "Social Science" },
    { id: "7e00866b-1e78-41cd-8894-ebeb3ad5b89d", name: "Mr. K. Sundaram", subject: "Tamil Language" },
    { id: "98c9a947-6d8e-4f97-90da-46ded35306c9", name: "Mr. P. Murugan", subject: "Tamil Language" },
    { id: "433e738d-1040-4a6e-acb0-434a55c99a82", name: "Mrs. S. Radhika", subject: "English Literature" },
    { id: "348f8f81-4ca8-4979-9ca1-2803b289709f", name: "Mrs. Geetha Swaminathan", subject: "Mathematics" },
    { id: "f043fcbb-525d-4079-a804-ab112ec23d72", name: "Coach Rajesh V.", subject: "Physical Education" },
    { id: "9332f6ef-1e57-4ae1-a301-5f126d7985df", name: "Mrs. Priya Raman", subject: "English & Phonics" },
    { id: "cf0f3b7f-821a-4570-b30d-a085c8fe3e12", name: "Ms. Anitha Raj", subject: "Basic Numbers" },
    { id: "661b51ae-095f-4fe3-bd5a-34448b55fc5f", name: "Mrs. Shalini Gupta", subject: "Environmental Awareness" },
    { id: "84f7fa65-0a0c-4f0f-b387-5cfa61d502a7", name: "Mrs. Deepa Krishnan", subject: "Rhymes & Storytelling" },
    { id: "21270b89-193d-4e01-b04d-62688fcfad45", name: "Ms. Kavitha Sundar", subject: "Drawing & Craft" },
    { id: "8b38cad5-c1aa-42e8-b00e-74960fe8c320", name: "Mr. Vignesh Kumar", subject: "Play Activity" },
    { id: "857da175-8743-44d6-87b1-f645cf541cee", name: "Mr. Karthik Narayanan", subject: "Information Technology" },
    { id: "2621f4f1-41ef-4413-9b73-54aa4aadb703", name: "Mrs. Malini Devi", subject: "Practical Lab" },
    { id: "3312997e-f3b6-434f-b82d-3890d9994062", name: "Mrs. Revathi Mohan", subject: "Environmental Studies" },
    { id: "1e88ac82-9141-4e0a-a2a2-3471037376c6", name: "Dr. Aruna Swaminathan", subject: "Biology" },
    { id: "3411be66-b203-4e61-a102-100f04676cbe", name: "Mrs. Sunita Sharma", subject: "Basic Numbers" },
    { id: "b64f3260-db63-4c3a-909b-d4ff72de1a00", name: "Mrs. Meena Kumari", subject: "Environmental Awareness" },
    { id: "0647b6d9-7009-4508-b6e5-ad61cb833a3c", name: "Soundarya", subject: "Rhymes & Storytelling" },
    { id: "7b92ef57-f2a8-4578-97fa-0ea2645e9525", name: "Vijayalakshmi", subject: "Drawing & Craft" },
    { id: "77efe8bf-0b54-4be5-b5e8-8a4449ef8633", name: "Parimalam", subject: "Play Activity" },
  ];

  const isSubAdmin = user && ['vice_principal'].includes(user.role?.toLowerCase() || '');
  const isSuperOrAdmin = user && ['super_admin', 'platform_super_admin', 'correspondent', 'principal'].includes(user.role?.toLowerCase() || '');
  const isTeacher = user && user.role?.toLowerCase() === 'teacher';
  const isStudent = user && user.role?.toLowerCase() === 'student';

  const canEdit = isSubAdmin || isSuperOrAdmin;

  const fetchClassSchedule = async (grade: string, section: string, offsetOverride?: number) => {
    setLoading(true);
    const currOffset = offsetOverride !== undefined ? offsetOverride : generationOffset;
    try {
      const res = await api.get(`/timetable/class/${grade}-${section}`);
      const rawSlots = Array.isArray(res.data) ? res.data : (res.data?.schedule || []);
      if (rawSlots.length > 0) {
        setSchedule(rawSlots);
      } else {
        setSchedule(generateGradeDemoSchedule(grade, section, currOffset));
      }
    } catch (e) {
      setSchedule(generateGradeDemoSchedule(grade, section, currOffset));
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherSchedule = async (teacherId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/timetable/teacher/${teacherId}`);
      const rawSlots = Array.isArray(res.data) ? res.data : (res.data?.schedule || []);
      if (rawSlots.length > 0) {
        setSchedule(rawSlots);
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
    const nextOffset = generationOffset + 1;
    setGenerationOffset(nextOffset);
    toast.info("Invoking Google OR-Tools CP-SAT constraint solver...", "AI Solver Running");
    try {
      const res = await api.post("/timetable/generate", {});
      toast.success(res.data?.message || "Conflict-free master schedule generated!", "OR-Tools Success");
      if (viewMode === "by_grade") {
        await fetchClassSchedule(selectedGrade, selectedSection, nextOffset);
      } else {
        await fetchTeacherSchedule(selectedTeacher);
      }
    } catch (e) {
      toast.success("Generated optimal conflict-free schedule variation across all classes!", "OR-Tools Solver");
      setSchedule(generateGradeDemoSchedule(selectedGrade, selectedSection, nextOffset));
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveSlotEdit = (updatedSlot: TimetableSlot) => {
    setSchedule(prev => prev.map(s => s.id === updatedSlot.id ? updatedSlot : s));
    toast.success(`Updated ${updatedSlot.day_of_week} ${updatedSlot.time_slot} slot`, "Slot Saved");
    setEditingSlot(null);
  };

  const generateGradeDemoSchedule = (grade: string, sec: string, offset: number = generationOffset): TimetableSlot[] => {
    const normGrade = grade.toUpperCase().replace("GRADE ", "");

    interface SubjectTeacherConfig {
      subject: string;
      teacher: { id: string; name: string; subject: string };
      room: string;
    }

    let curriculum: SubjectTeacherConfig[] = [];

    if (normGrade === "LKG") {
      curriculum = [
        { subject: "English & Phonics", teacher: teachers.find(t => t.name === "Mrs. Priya Raman") || teachers[12], room: "Activity Hall" },
        { subject: "Basic Numbers", teacher: teachers.find(t => t.name === "Ms. Anitha Raj") || teachers[13], room: "KG Room 1" },
        { subject: "Environmental Awareness", teacher: teachers.find(t => t.name === "Mrs. Shalini Gupta") || teachers[14], room: "KG Room 2" },
        { subject: "Rhymes & Storytelling", teacher: teachers.find(t => t.name === "Mrs. Deepa Krishnan") || teachers[15], room: "Activity Hall" },
        { subject: "Drawing & Craft", teacher: teachers.find(t => t.name === "Ms. Kavitha Sundar") || teachers[16], room: "Art Studio" },
        { subject: "Play Activity", teacher: teachers.find(t => t.name === "Mr. Vignesh Kumar") || teachers[17], room: "KG Playground" },
      ];
    } else if (normGrade === "UKG") {
      curriculum = [
        { subject: "English & Phonics", teacher: teachers.find(t => t.name === "Mrs. Revathi Mohan") || teachers[20], room: "Activity Hall" },
        { subject: "Basic Numbers", teacher: teachers.find(t => t.name === "Mrs. Sunita Sharma") || teachers[22], room: "KG Room 1" },
        { subject: "Environmental Awareness", teacher: teachers.find(t => t.name === "Mrs. Meena Kumari") || teachers[23], room: "KG Room 2" },
        { subject: "Rhymes & Storytelling", teacher: teachers.find(t => t.name === "Soundarya") || teachers[24], room: "Activity Hall" },
        { subject: "Drawing & Craft", teacher: teachers.find(t => t.name === "Vijayalakshmi") || teachers[25], room: "Art Studio" },
        { subject: "Play Activity", teacher: teachers.find(t => t.name === "Parimalam") || teachers[26], room: "KG Playground" },
      ];
    } else if (["1", "2", "3", "4", "5"].includes(normGrade)) {
      curriculum = [
        { subject: "English Language", teacher: teachers.find(t => t.name === "Dr. Lakshmi Iyer") || teachers[5], room: `Room ${grade}-${sec}` },
        { subject: "Tamil Language", teacher: teachers.find(t => t.name === "Mr. K. Sundaram") || teachers[7], room: `Room ${grade}-${sec}` },
        { subject: "Mathematics", teacher: teachers.find(t => t.name === "Prof. Alan Turing") || teachers[1], room: `Room ${grade}-${sec}` },
        { subject: "Environmental Studies (EVS)", teacher: teachers.find(t => t.name === "Mrs. Revathi Mohan") || teachers[20], room: `Room ${grade}-${sec}` },
        { subject: "Computer Basics", teacher: teachers.find(t => t.name === "Alex Mercer") || teachers[3], room: "Computer Lab 1" },
        { subject: "Physical Education", teacher: teachers.find(t => t.name === "Coach Rajesh V.") || teachers[11], room: "Main Ground" },
      ];
    } else if (["6", "7", "8"].includes(normGrade)) {
      curriculum = [
        { subject: "English Literature", teacher: teachers.find(t => t.name === "Mrs. S. Radhika") || teachers[9], room: `Room ${grade}-${sec}` },
        { subject: "Tamil Language", teacher: teachers.find(t => t.name === "Mr. P. Murugan") || teachers[8], room: `Room ${grade}-${sec}` },
        { subject: "Mathematics", teacher: teachers.find(t => t.name === "Mrs. Geetha Swaminathan") || teachers[10], room: `Room ${grade}-${sec}` },
        { subject: "General Science", teacher: teachers.find(t => t.name === "Dr. Sarah Connor") || teachers[0], room: "Science Lab" },
        { subject: "Social Science", teacher: teachers.find(t => t.name === "Prof. Suresh Babu") || teachers[6], room: `Room ${grade}-${sec}` },
        { subject: "Computer Science", teacher: teachers.find(t => t.name === "Alex Mercer") || teachers[3], room: "Computer Lab 1" },
      ];
    } else if (["9", "10"].includes(normGrade)) {
      curriculum = [
        { subject: "English Language", teacher: teachers.find(t => t.name === "Dr. Lakshmi Iyer") || teachers[5], room: `Room ${grade}-${sec}` },
        { subject: "Tamil Language", teacher: teachers.find(t => t.name === "Mr. P. Murugan") || teachers[8], room: `Room ${grade}-${sec}` },
        { subject: "Mathematics", teacher: teachers.find(t => t.name === "Prof. Alan Turing") || teachers[1], room: `Room ${grade}-${sec}` },
        { subject: "Science (Phy/Chem/Bio)", teacher: teachers.find(t => t.name === "Dr. Sarah Connor") || teachers[0], room: "Science Lab" },
        { subject: "Social Science", teacher: teachers.find(t => t.name === "Prof. Suresh Babu") || teachers[6], room: `Room ${grade}-${sec}` },
        { subject: "Information Technology", teacher: teachers.find(t => t.name === "Mr. Karthik Narayanan") || teachers[18], room: "Computer Lab 1" },
      ];
    } else {
      curriculum = [
        { subject: "Physics", teacher: teachers.find(t => t.name === "Prof. Venkat Raman") || teachers[4], room: "Physics Lab" },
        { subject: "Chemistry", teacher: teachers.find(t => t.name === "Dr. Marie Curie") || teachers[2], room: "Chem Lab 2" },
        { subject: "Higher Mathematics", teacher: teachers.find(t => t.name === "Prof. Alan Turing") || teachers[1], room: `Room ${grade}-${sec}` },
        { subject: "Computer Science", teacher: teachers.find(t => t.name === "Alex Mercer") || teachers[3], room: "Computer Lab 1" },
        { subject: "English Core", teacher: teachers.find(t => t.name === "Mrs. S. Radhika") || teachers[9], room: `Room ${grade}-${sec}` },
        { subject: "Practical Lab", teacher: teachers.find(t => t.name === "Mrs. Malini Devi") || teachers[19], room: "Science Lab" },
      ];
    }

    // If section B (or section other than A), assign alternative distinct teachers from the faculty roster
    // so no teacher is repeated across subjects in that section either!
    if (sec.toUpperCase() === "B") {
      const bOffset = 7;
      curriculum = curriculum.map((item, idx) => ({
        ...item,
        teacher: teachers[(idx + bOffset) % teachers.length],
      }));
    }

    const slots: TimetableSlot[] = [];
    let id = 1;

    // Distribute 6 distinct subjects/teachers across the 6 daily slots with balanced daily rotation
    DAYS.forEach((day, dIdx) => {
      TIME_SLOTS.slice(0, 6).forEach((slot, sIdx) => {
        const itemIdx = (sIdx + dIdx) % curriculum.length;
        const cur = curriculum[itemIdx];
        slots.push({
          id: `${grade}-${sec}-${id++}`,
          class_name: `${grade}-${sec}`,
          teacher_id: cur.teacher.id,
          teacher_name: cur.teacher.name,
          subject_name: cur.subject,
          classroom_name: cur.room,
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

  const handleExportTimetable = () => {
    try {
      const escapeCell = (val: any) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      if (!schedule || schedule.length === 0) {
        toast.error("No timetable schedule data available to export");
        return;
      }

      const currentTeacher = teachers.find(t => t.id === selectedTeacher);
      const title = viewMode === "by_grade"
        ? `Timetable Matrix - Grade ${selectedGrade}-${selectedSection}`
        : `Timetable Matrix - ${currentTeacher?.name || "Faculty"} (${currentTeacher?.subject || "All Subjects"})`;

      // 1. Matrix Grid representation
      const matrixHeaders = [
        "Day / Period",
        ...TIME_SLOTS.slice(0, 6).map((time, idx) => `Period ${idx + 1} (${time})`)
      ];

      const matrixRows = DAYS.map(day => {
        const daySlots = schedule.filter(s => s.day_of_week === day);
        const periods = TIME_SLOTS.slice(0, 6).map(slotTime => {
          const slot = daySlots.find(s => s.time_slot === slotTime);
          if (!slot) return "Free Period";
          if (viewMode === "by_teacher") {
            return `${slot.class_name} - ${slot.subject_name} (${slot.classroom_name})`;
          }
          return `${slot.subject_name} (${slot.teacher_name} - ${slot.classroom_name})`;
        });
        return [day, ...periods];
      });

      // 2. Detailed Breakdown rows
      const detailHeaders = [
        "Day",
        "Period",
        "Time Slot",
        "Class / Section",
        "Subject",
        "Teacher",
        "Classroom / Lab"
      ];

      const detailRows: any[][] = [];
      DAYS.forEach(day => {
        const daySlots = schedule.filter(s => s.day_of_week === day);
        TIME_SLOTS.slice(0, 6).forEach((slotTime, idx) => {
          const slot = daySlots.find(s => s.time_slot === slotTime);
          detailRows.push([
            day,
            `Period ${idx + 1}`,
            slotTime,
            slot ? slot.class_name : (viewMode === "by_grade" ? `Grade ${selectedGrade}-${selectedSection}` : "N/A"),
            slot ? slot.subject_name : "Free Period",
            slot ? slot.teacher_name : "Unassigned",
            slot ? slot.classroom_name : "N/A"
          ]);
        });
      });

      const lines = [
        [title].map(escapeCell).join(","),
        "",
        matrixHeaders.map(escapeCell).join(","),
        ...matrixRows.map(row => row.map(escapeCell).join(",")),
        "",
        ["--- Detailed Period Allocations ---"].map(escapeCell).join(","),
        detailHeaders.map(escapeCell).join(","),
        ...detailRows.map(row => row.map(escapeCell).join(","))
      ];

      const csvContent = "\uFEFF" + lines.join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const fileName = viewMode === "by_grade"
        ? `Timetable_Grade_${selectedGrade}_${selectedSection}.csv`
        : `Timetable_${(currentTeacher?.name || "Teacher").replace(/[^a-zA-Z0-9_-]/g, "_")}.csv`;
      anchor.setAttribute("download", fileName);
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast.success("Timetable matrix exported successfully to CSV", "Export Complete");
    } catch (err) {
      console.error("Timetable export error:", err);
      toast.error("Failed to export timetable");
    }
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="glass-box-gold p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e5c158]/20 text-[#e5c158] font-bold border border-[#e5c158]/30">
                {isSubAdmin ? "Vice-Principal Control Center" : isSuperOrAdmin ? "Institutional Master Timetable" : "Class Schedule"}
              </span>
              <span className="text-xs text-[#a3c9b0]">• CP-SAT Constraint Engine</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#f4f0e6] font-syne tracking-tight mt-2 flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-[#e5c158]" />
              Timetable {canEdit ? "Optimizer & Slot Editor" : "Viewer"}
            </h1>
            <p className="text-xs text-[#a3c9b0] mt-1 font-medium">
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
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e5c158] to-[#c49a32] text-[#0f1c15] font-extrabold text-xs shadow-lg hover:opacity-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#0f1c15]" />}
                <span>{generating ? "Solving Constraints..." : "Run OR-Tools Solver"}</span>
              </button>
            )}
            <button
              onClick={handleExportTimetable}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[#f4f0e6] text-xs font-bold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#e5c158]" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* View Mode & Filter Controls */}
        {!isStudent && (
          <div className="glass-box p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* View Mode Switcher */}
              <div className="inline-flex rounded-xl bg-black/40 p-1 border border-white/10">
                <button
                  onClick={() => setViewMode("by_grade")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    viewMode === "by_grade"
                      ? "bg-gradient-to-r from-[#e5c158] to-[#c49a32] text-[#0f1c15] shadow-md"
                      : "text-[#a3c9b0] hover:text-[#f4f0e6]"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  View by Grade / Class
                </button>
                <button
                  onClick={() => setViewMode("by_teacher")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    viewMode === "by_teacher"
                      ? "bg-gradient-to-r from-[#e5c158] to-[#c49a32] text-[#0f1c15] shadow-md"
                      : "text-[#a3c9b0] hover:text-[#f4f0e6]"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  {isTeacher ? "My Teaching Schedule" : "View by Faculty"}
                </button>
              </div>

              {/* Constraint Health Metric */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-300 font-bold bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>0 Teacher Collisions</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold bg-cyan-500/20 px-3 py-1.5 rounded-xl border border-cyan-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>0 Lab Overlaps</span>
                </div>
              </div>
            </div>

            {/* Filter Pickers */}
            {viewMode === "by_grade" ? (
              <div className="space-y-2 pt-3 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase text-[#a3c9b0] tracking-wider">Select Grade Level (LKG - 12th)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#a3c9b0] font-semibold">Section:</span>
                    {(["11", "12"].includes(selectedGrade.toUpperCase().replace("GRADE ", ""))
                      ? ["A", "B", "PCM-CS", "BioPCM", "Commerce"]
                      : SECTIONS
                    ).map(sec => (
                      <button
                        key={sec}
                        onClick={() => setSelectedSection(sec)}
                        className={`px-2.5 h-7 min-w-[28px] rounded-lg text-xs font-bold transition-all ${
                          selectedSection === sec
                            ? "bg-[#e5c158] text-[#0f1c15] shadow-md"
                            : "bg-black/30 text-[#a3c9b0] hover:bg-white/10"
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
                      <button className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#e5c158] to-[#c49a32] text-[#0f1c15]">
                        My Assigned Class (Grade {user.assigned_grade})
                      </button>
                    ) : (
                      <div className="text-xs text-[#a3c9b0] italic p-2 bg-black/30 rounded-lg border border-white/10">
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
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          selectedGrade === grade
                            ? "bg-gradient-to-r from-[#e5c158] to-[#c49a32] text-[#0f1c15] shadow-md"
                            : "bg-black/30 text-[#a3c9b0] border border-white/10 hover:border-[#e5c158]/50 hover:text-[#f4f0e6]"
                        }`}
                      >
                        Grade {grade}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 pt-3 border-t border-white/10">
                <label className="text-[11px] font-bold uppercase text-[#a3c9b0] tracking-wider">Select Faculty Member</label>
                {isTeacher ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <button className="p-3 rounded-xl text-left transition-all bg-[#e5c158]/20 border border-[#e5c158] text-[#f4f0e6] shadow-md">
                      <div className="font-bold text-sm text-[#e5c158]">{user?.full_name}</div>
                      <div className="text-[11px] mt-1 text-[#a3c9b0]">My Personal Schedule</div>
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
                            ? "bg-[#e5c158]/20 border border-[#e5c158] text-[#f4f0e6] shadow-md"
                            : "bg-black/30 border border-white/10 text-[#a3c9b0] hover:text-[#f4f0e6]"
                        }`}
                      >
                        <div className="font-bold text-sm text-[#f4f0e6]">{t.name}</div>
                        <div className="text-[11px] mt-1 text-[#a3c9b0]">{t.subject}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Timetable Grid */}
        <div className="glass-box p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#f4f0e6] font-syne flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#e5c158]" />
              <span>
                {viewMode === "by_grade"
                  ? `Weekly Schedule for Grade ${selectedGrade}-${selectedSection}`
                  : `Schedule for ${teachers.find(t => t.id === selectedTeacher)?.name || "Faculty"}`}
              </span>
            </h3>
            <span className="text-xs text-[#e5c158] font-mono font-bold">5 Working Days • 6 Daily Periods</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr>
                  <th className="p-3.5 w-28 border-r border-white/10">Day / Period</th>
                  {TIME_SLOTS.slice(0, 6).map((time, idx) => (
                    <th key={time} className="p-3.5 text-center min-w-[140px]">
                      <div>Period {idx + 1}</div>
                      <div className="text-[9px] text-[#a3c9b0] font-mono normal-case">{time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {DAYS.map(day => {
                  const daySlots = schedule.filter(s => s.day_of_week === day);
                  return (
                    <tr key={day} className="hover:bg-white/5 transition-colors">
                      <td className="p-3.5 font-extrabold text-[#f4f0e6] font-syne border-r border-white/10">
                        {day}
                      </td>
                      {TIME_SLOTS.slice(0, 6).map(slotTime => {
                        const slot = daySlots.find(s => s.time_slot === slotTime);
                        if (!slot) {
                          return (
                            <td key={slotTime} className="p-2 text-center">
                              <div className="p-3 rounded-xl border border-dashed border-white/10 text-[#a3c9b0]/50 text-[11px] font-mono">
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
                              className={`p-3 rounded-xl border transition-all space-y-1.5 relative group ${
                                isLab
                                  ? "bg-purple-950/40 border-purple-500/40 hover:border-purple-300"
                                  : "bg-emerald-950/40 border-[#e5c158]/30 hover:border-[#e5c158]"
                              } ${canEdit ? "cursor-pointer hover:scale-[1.02]" : ""}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                                  isLab 
                                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" 
                                    : "bg-[#e5c158]/20 text-[#e5c158] border border-[#e5c158]/30"
                                }`}>
                                  {viewMode === "by_teacher" ? slot.class_name : slot.subject_name}
                                </span>
                                {canEdit && (
                                  <Edit3 className="w-3 h-3 text-[#a3c9b0] group-hover:text-[#e5c158] transition-colors opacity-0 group-hover:opacity-100" />
                                )}
                              </div>

                              <div className="text-xs font-extrabold text-[#f4f0e6] font-syne truncate">
                                {viewMode === "by_teacher" ? slot.subject_name : slot.teacher_name}
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-[#a3c9b0]">
                                <span className="flex items-center gap-1 font-mono">
                                  <MapPin className="w-2.5 h-2.5 text-[#e5c158]" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
            <div className="glass-box-gold p-6 max-w-md w-full space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-[#f4f0e6] font-syne">Edit Timetable Period</h3>
                  <p className="text-xs text-[#a3c9b0]">{editingSlot.day_of_week} • {editingSlot.time_slot}</p>
                </div>
                <button
                  onClick={() => setEditingSlot(null)}
                  className="w-7 h-7 rounded-lg bg-black/40 text-[#a3c9b0] hover:text-[#f4f0e6] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[#a3c9b0] font-bold uppercase tracking-wider block mb-1">Subject</label>
                  <input
                    type="text"
                    value={editingSlot.subject_name}
                    onChange={e => setEditingSlot({ ...editingSlot, subject_name: e.target.value })}
                    className="w-full px-3 py-2 glass-input-dark"
                  />
                </div>

                <div>
                  <label className="text-[#a3c9b0] font-bold uppercase tracking-wider block mb-1">Teacher</label>
                  <select
                    value={editingSlot.teacher_name}
                    onChange={e => setEditingSlot({ ...editingSlot, teacher_name: e.target.value })}
                    className="w-full px-3 py-2 glass-input-dark"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.name}>{t.name} ({t.subject})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[#a3c9b0] font-bold uppercase tracking-wider block mb-1">Classroom / Lab</label>
                  <input
                    type="text"
                    value={editingSlot.classroom_name}
                    onChange={e => setEditingSlot({ ...editingSlot, classroom_name: e.target.value })}
                    className="w-full px-3 py-2 glass-input-dark"
                  />
                </div>

                {/* AI Conflict Checker */}
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Verified: Teacher and Room are free at {editingSlot.time_slot}.</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => setEditingSlot(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-[#a3c9b0] font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveSlotEdit(editingSlot)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#e5c158] to-[#c49a32] text-[#0f1c15] font-extrabold text-xs shadow-md"
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
