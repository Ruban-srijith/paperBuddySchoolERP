"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Clock, 
  CheckSquare, 
  Plus, 
  FileText, 
  Mail, 
  Phone,
  Building2,
  CheckCircle2,
  X,
  Search
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/components/Toast";
import api from "@/lib/api";
import Tilt3D from "@/components/Tilt3D";

function CornerArchOrnament({ position = "tr" }: { position?: "tr" | "bl" | "br" }) {
  if (position === "tr") {
    return (
      <svg className="corner-arch-tr" viewBox="0 0 100 100" fill="none" stroke="#43634e" strokeWidth="1.5">
        <path d="M 100 0 A 100 100 0 0 0 0 100" />
        <path d="M 100 20 A 80 80 0 0 0 20 100" />
        <path d="M 100 40 A 60 60 0 0 0 40 100" />
        <path d="M 100 60 A 40 40 0 0 0 60 100" />
      </svg>
    );
  }
  return (
    <svg className="corner-arch-bl" viewBox="0 0 100 100" fill="none" stroke="#43634e" strokeWidth="1.5">
      <path d="M 0 100 A 100 100 0 0 1 100 0" />
      <path d="M 0 80 A 80 80 0 0 1 80 0" />
      <path d="M 0 60 A 60 60 0 0 1 60 0" />
      <path d="M 0 40 A 40 40 0 0 1 40 0" />
    </svg>
  );
}

interface CouncilMeeting {
  id: string;
  title: string;
  date: string;
  venue: string;
  attendees: string;
  status: string;
}

const defaultMeetings: CouncilMeeting[] = [
  { id: "m1", title: "Term 1 Syllabus Review & Midterm Exam Logistics", date: "14 Aug 2026", venue: "Faculty Conference Room", attendees: "All Department Heads & Deans", status: "Scheduled" },
  { id: "m2", title: "Inter-School Science Olympiad Planning Committee", date: "19 Aug 2026", venue: "Science Lab Complex", attendees: "Science & CS Faculty", status: "Scheduled" },
  { id: "m3", title: "Disciplinary & Student Council Meeting", date: "02 Aug 2026", venue: "Principal's Boardroom", attendees: "Vice-Principal & Class Teachers", status: "Completed" },
];

const initialMeetingState = {
  title: "",
  date: "",
  venue: "Faculty Conference Room",
  attendees: "All Teaching Faculty",
};

export default function StaffManagementPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"attendance" | "council" | "directory">("attendance");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  const [staffList, setStaffList] = useState([
    { id: "t1", name: "Dr. Sarah Connor", role: "Class Teacher (10-A)", department: "Science", email: "sarah.connor@school.edu", phone: "+91 98401 22331", status: "present", checkin: "08:15 AM", periods: 4 },
    { id: "t2", name: "Prof. Alan Turing", role: "Dean of Operations", department: "Academic Operations", email: "alan.turing@school.edu", phone: "+91 98401 22332", status: "present", checkin: "08:05 AM", periods: 3 },
    { id: "t3", name: "Dr. Marie Curie", role: "Head of Chemistry", department: "Science", email: "marie.curie@school.edu", phone: "+91 98401 22333", status: "on_leave", checkin: "-", periods: 0 },
    { id: "t4", name: "Alex Mercer", role: "CS Faculty", department: "Mathematics & CS", email: "alex.mercer@school.edu", phone: "+91 98401 22334", status: "present", checkin: "08:20 AM", periods: 5 },
    { id: "t5", name: "Mrs. Revathi Raman", role: "Class Teacher (12-A)", department: "English", email: "revathi.raman@school.edu", phone: "+91 98401 22335", status: "late", checkin: "08:45 AM", periods: 4 },
  ]);

  const [meetings, setMeetings] = useState<CouncilMeeting[]>(defaultMeetings);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pb_staff_council_meetings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMeetings(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const [newMeeting, setNewMeeting] = useState(initialMeetingState);

  const handleOpenMeetingModal = () => {
    setNewMeeting(initialMeetingState);
    setShowMeetingModal(true);
  };

  const handleCloseMeetingModal = () => {
    setShowMeetingModal(false);
    setNewMeeting(initialMeetingState);
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title.trim() || !newMeeting.date) {
      toast.error("Please fill in meeting title and date", "Validation Error");
      return;
    }
    const formattedDate = dayjs(newMeeting.date).isValid()
      ? dayjs(newMeeting.date).format("DD MMM YYYY")
      : newMeeting.date;

    const newEntry: CouncilMeeting = {
      id: `m-${Date.now()}`,
      title: newMeeting.title.trim(),
      date: formattedDate,
      venue: newMeeting.venue.trim() || "Faculty Conference Room",
      attendees: newMeeting.attendees.trim() || "All Teaching Faculty",
      status: "Scheduled"
    };

    setMeetings(prev => {
      const updated = [newEntry, ...prev];
      try {
        localStorage.setItem("pb_staff_council_meetings", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    try {
      if (dayjs(newMeeting.date).isValid()) {
        await api.post("/calendar/events", {
          title: `[Council] ${newMeeting.title.trim()}`,
          description: `Venue: ${newMeeting.venue.trim() || "Faculty Conference Room"} | Attendees: ${newMeeting.attendees.trim() || "All Teaching Faculty"}`,
          start_date: dayjs(newMeeting.date).format("YYYY-MM-DD"),
          end_date: dayjs(newMeeting.date).format("YYYY-MM-DD"),
          event_type: "Meeting",
          grade_scope: "all"
        });
      }
    } catch {
      // Optional calendar sync
    }

    toast.success(`Scheduled staff council meeting: ${newMeeting.title.trim()}`, "Meeting Scheduled");
    handleCloseMeetingModal();
  };

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={["principal", "super_admin", "correspondent"]}>
      <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e5c158]/20 text-[#e5c158] font-bold border border-[#e5c158]/40">
                Principal Faculty Administration
              </span>
              <span className="text-xs text-[#a3c9b0]">• Staff Duty & Council Operations</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#f4f0e6] font-syne tracking-tight mt-1">
              Staff Management Hub
            </h1>
            <p className="text-sm text-[#a3c9b0] font-medium">
              Daily staff duty attendance tracking, staff council meeting schedules, and faculty department directories.
            </p>
          </div>

          {activeTab === "council" && (
            <button
              onClick={handleOpenMeetingModal}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-[#e5c158] hover:bg-[#d4b047] text-black font-extrabold text-xs shadow-lg shadow-[#e5c158]/20 hover:scale-105 transition-all self-start md:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Council Meeting</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="w-full overflow-x-auto pb-2 -mb-2">
          <div className="inline-flex rounded-xl glass-box p-1 border border-[#e5c158]/30 min-w-max">
            <button
              onClick={() => setActiveTab("attendance")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "attendance"
                  ? "bg-[#e5c158] text-black shadow-md"
                  : "text-[#a3c9b0] hover:text-[#f4f0e6]"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 shrink-0" />
              Daily Staff Attendance (65/68)
            </button>
            <button
              onClick={() => setActiveTab("council")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "council"
                  ? "bg-[#e5c158] text-black shadow-md"
                  : "text-[#a3c9b0] hover:text-[#f4f0e6]"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              Staff Council Meetings ({meetings.length})
            </button>
            <button
              onClick={() => setActiveTab("directory")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "directory"
                  ? "bg-[#e5c158] text-black shadow-md"
                  : "text-[#a3c9b0] hover:text-[#f4f0e6]"
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              Faculty Directory ({staffList.length})
            </button>
          </div>
        </div>

        {/* TAB 1: DAILY STAFF ATTENDANCE */}
        {activeTab === "attendance" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Tilt3D>
                <div className="glass-emerald-tile p-5 rounded-[22px] space-y-1">
                  <CornerArchOrnament position="tr" />
                  <div className="text-xs text-[#a3c9b0] font-semibold relative z-10">Present on Campus</div>
                  <div className="text-2xl font-extrabold text-emerald-400 font-syne relative z-10">65 Faculty</div>
                  <div className="text-[11px] text-emerald-400 font-semibold relative z-10">95.6% attendance compliance today</div>
                </div>
              </Tilt3D>

              <Tilt3D>
                <div className="glass-emerald-tile p-5 rounded-[22px] space-y-1">
                  <CornerArchOrnament position="bl" />
                  <div className="text-xs text-[#a3c9b0] font-semibold relative z-10">Approved Leave / Off-Duty</div>
                  <div className="text-2xl font-extrabold text-amber-300 font-syne relative z-10">3 Faculty</div>
                  <div className="text-[11px] text-[#a3c9b0] relative z-10">Covered by substitute teachers</div>
                </div>
              </Tilt3D>

              <Tilt3D>
                <div className="glass-emerald-tile p-5 rounded-[22px] space-y-1">
                  <CornerArchOrnament position="tr" />
                  <div className="text-xs text-[#a3c9b0] font-semibold relative z-10">Late Punch-ins</div>
                  <div className="text-2xl font-extrabold text-sky-300 font-syne relative z-10">1 Faculty</div>
                  <div className="text-[11px] text-[#a3c9b0] relative z-10">Marked before morning assembly</div>
                </div>
              </Tilt3D>
            </div>

            <Tilt3D>
              <div className="glass-emerald-tile p-6 rounded-[24px] space-y-4">
                <CornerArchOrnament position="tr" />
                <h2 className="text-base font-extrabold text-[#f4f0e6] font-syne relative z-10">Daily Faculty Attendance Ledger</h2>
                <div className="overflow-x-auto relative z-10">
                  <table>
                    <thead>
                      <tr>
                        <th>Staff Name & Designation</th>
                        <th>Department</th>
                        <th>Punch-In Time</th>
                        <th className="text-center">Assigned Periods Today</th>
                        <th className="text-right">Attendance Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map(s => (
                        <tr key={s.id}>
                          <td>
                            <div className="font-extrabold text-[#f4f0e6]">{s.name}</div>
                            <div className="text-[11px] text-[#a3c9b0] font-semibold">{s.role}</div>
                          </td>
                          <td className="text-[#f4f0e6]">{s.department}</td>
                          <td className="font-mono text-[#a3c9b0]">{s.checkin}</td>
                          <td className="text-center font-mono text-[#e5c158] font-bold">{s.periods} Periods</td>
                          <td className="text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                              s.status === 'present' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : s.status === 'late' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}>
                              {s.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Tilt3D>
          </div>
        )}

        {/* TAB 2: STAFF COUNCIL MEETINGS */}
        {activeTab === "council" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {meetings.map(m => (
                <Tilt3D key={m.id}>
                  <div className="glass-emerald-tile p-5 rounded-[22px] space-y-3 flex flex-col justify-between h-full">
                    <CornerArchOrnament position="tr" />
                    <div className="space-y-2 relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#e5c158]/20 text-[#e5c158] border border-[#e5c158]/40">
                          {m.status}
                        </span>
                        <span className="text-xs text-[#a3c9b0] font-mono">{m.date}</span>
                      </div>
                      <h3 className="text-base font-extrabold text-[#f4f0e6] font-syne leading-snug">{m.title}</h3>
                      <p className="text-xs text-[#a3c9b0]">Venue: <span className="text-[#f4f0e6] font-semibold">{m.venue}</span></p>
                    </div>
                    <div className="pt-2 border-t border-[#a3c9b0]/20 text-xs text-[#a3c9b0] relative z-10">
                      Attendees: <span className="text-[#e5c158] font-bold">{m.attendees}</span>
                    </div>
                  </div>
                </Tilt3D>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FACULTY DIRECTORY */}
        {activeTab === "directory" && (
          <div className="space-y-4">
            <div className="glass-emerald-tile p-4 rounded-[22px] flex items-center justify-between">
              <div className="relative z-10 flex items-center gap-2">
                <Search className="w-4 h-4 text-[#e5c158]" />
                <input
                  type="text"
                  placeholder="Search faculty..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="px-3.5 py-2 rounded-xl glass-input-dark text-[#f4f0e6] text-xs w-64 border border-[#e5c158]/30"
                />
              </div>
              <span className="text-xs text-[#e5c158] font-mono font-bold relative z-10">{filteredStaff.length} Faculty Members</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map(s => (
                <Tilt3D key={s.id}>
                  <div className="glass-emerald-tile p-5 rounded-[22px] space-y-3">
                    <CornerArchOrnament position="tr" />
                    <div className="flex items-center gap-3 border-b border-[#a3c9b0]/20 pb-3 relative z-10">
                      <div className="w-10 h-10 rounded-full bg-[#e5c158] text-black flex items-center justify-center font-extrabold font-syne">
                        {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#f4f0e6] font-syne">{s.name}</h3>
                        <p className="text-xs text-[#a3c9b0]">{s.role}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-[#a3c9b0] relative z-10">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-[#e5c158]" />
                        <span className="text-[#f4f0e6] font-medium">{s.department} Department</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-sky-300" />
                        <span className="font-mono text-[#a3c9b0]">{s.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-mono text-[#a3c9b0]">{s.phone}</span>
                      </div>
                    </div>
                  </div>
                </Tilt3D>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Meeting Modal */}
        {showMeetingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="glass-emerald-tile border-2 border-[#e5c158]/40 max-w-md w-full rounded-[28px] p-6 space-y-4 shadow-2xl relative">
              <CornerArchOrnament position="tr" />
              <div className="flex items-center justify-between border-b border-[#a3c9b0]/20 pb-3 relative z-10">
                <h3 className="text-base font-extrabold text-[#f4f0e6] font-syne">Schedule Staff Council Meeting</h3>
                <button onClick={handleCloseMeetingModal} className="text-[#a3c9b0] hover:text-[#f4f0e6] cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateMeeting} className="space-y-3.5 text-xs relative z-10">
                <div>
                  <label className="text-[#a3c9b0] font-semibold block mb-1">Meeting Agenda / Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Term 2 Examination Logistics"
                    value={newMeeting.title}
                    onChange={e => setNewMeeting({ ...newMeeting, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input-dark text-[#f4f0e6]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#a3c9b0] font-semibold block mb-1">Meeting Date</label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={e => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input-dark text-[#f4f0e6]"
                    required
                  />
                </div>

                <div>
                  <label className="text-[#a3c9b0] font-semibold block mb-1">Campus Venue</label>
                  <input
                    type="text"
                    value={newMeeting.venue}
                    onChange={e => setNewMeeting({ ...newMeeting, venue: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input-dark text-[#f4f0e6]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-[#a3c9b0]/20">
                  <button
                    type="button"
                    onClick={handleCloseMeetingModal}
                    className="px-4 py-2.5 rounded-xl glass-box text-[#a3c9b0] hover:text-[#f4f0e6] text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#e5c158] hover:bg-[#d4b047] text-black font-extrabold text-xs shadow-md cursor-pointer"
                  >
                    Schedule Meeting
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

