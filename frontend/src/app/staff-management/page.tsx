"use client";

import { useState } from "react";
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

  const [meetings, setMeetings] = useState([
    { id: "m1", title: "Term 1 Syllabus Review & Midterm Exam Logistics", date: "Aug 14, 2026 (03:30 PM)", venue: "Faculty Conference Room", attendees: "All Department Heads & Deans", status: "Scheduled" },
    { id: "m2", title: "Inter-School Science Olympiad Planning Committee", date: "Aug 19, 2026 (04:00 PM)", venue: "Science Lab Complex", attendees: "Science & CS Faculty", status: "Scheduled" },
    { id: "m3", title: "Disciplinary & Student Council Meeting", date: "Aug 02, 2026", venue: "Principal's Boardroom", attendees: "Vice-Principal & Class Teachers", status: "Completed" },
  ]);

  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    venue: "Faculty Conference Room",
    attendees: "All Teaching Faculty",
  });

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    setMeetings(prev => [{ id: `m-${Date.now()}`, ...newMeeting, status: "Scheduled" }, ...prev]);
    toast.success(`Scheduled staff council meeting: ${newMeeting.title}`, "Meeting Scheduled");
    setShowMeetingModal(false);
  };

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={["admin", "principal", "super_admin", "correspondent"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                Principal Faculty Administration
              </span>
              <span className="text-xs text-gray-600">• Staff Hub</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight mt-1">
              Staff Management Hub
            </h1>
            <p className="text-xs text-gray-600">
              Daily staff duty attendance tracking, staff council meeting schedules, and faculty department directories.
            </p>
          </div>

          {activeTab === "council" && (
            <button
              onClick={() => setShowMeetingModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-brand-black font-semibold text-xs shadow-lg shadow-indigo-600/25 hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Council Meeting</span>
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="w-full overflow-x-auto pb-2 -mb-2">
          <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200 min-w-max">
            <button
              onClick={() => setActiveTab("attendance")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === "attendance"
                  ? "bg-brand-blue text-brand-black shadow-md shadow-indigo-600/30"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 shrink-0" />
              Daily Staff Attendance (65/68)
            </button>
            <button
              onClick={() => setActiveTab("council")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === "council"
                  ? "bg-brand-blue text-brand-black shadow-md shadow-indigo-600/30"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              Staff Council Meetings ({meetings.length})
            </button>
            <button
              onClick={() => setActiveTab("directory")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === "directory"
                  ? "bg-brand-blue text-brand-black shadow-md shadow-indigo-600/30"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              Faculty Directory ({staffList.length})
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            TAB 1: DAILY STAFF ATTENDANCE
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "attendance" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 space-y-1">
                <div className="text-xs text-gray-600">Present on Campus</div>
                <div className="text-2xl font-bold text-emerald-600">65 Faculty</div>
                <div className="text-[11px] text-gray-600">95.6% attendance compliance today</div>
              </div>
              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 space-y-1">
                <div className="text-xs text-gray-600">Approved Leave / Off-Duty</div>
                <div className="text-2xl font-bold text-amber-400">3 Faculty</div>
                <div className="text-[11px] text-gray-600">Covered by substitute teachers</div>
              </div>
              <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 space-y-1">
                <div className="text-xs text-gray-600">Late Punch-ins</div>
                <div className="text-2xl font-bold text-cyan-600">1 Faculty</div>
                <div className="text-[11px] text-gray-600">Marked before morning assembly</div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200 space-y-4">
              <h2 className="text-base font-bold text-brand-black">Daily Faculty Attendance Ledger</h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/90 text-gray-600 uppercase text-[10px] font-semibold border-b border-gray-200">
                    <tr>
                      <th className="p-3.5">Staff Name & Designation</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Punch-In Time</th>
                      <th className="p-3.5 text-center">Assigned Periods Today</th>
                      <th className="p-3.5 text-right">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {staffList.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50/40 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-brand-black">{s.name}</div>
                          <div className="text-[11px] text-gray-600">{s.role}</div>
                        </td>
                        <td className="p-3.5 text-gray-700">{s.department}</td>
                        <td className="p-3.5 font-mono text-gray-700">{s.checkin}</td>
                        <td className="p-3.5 text-center font-mono text-cyan-300 font-semibold">{s.periods} Periods</td>
                        <td className="p-3.5 text-right">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'present' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : s.status === 'late' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
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
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 2: STAFF COUNCIL MEETINGS
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "council" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {meetings.map(m => (
                <div key={m.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300">
                        {m.status}
                      </span>
                      <span className="text-xs text-gray-600 font-mono">{m.date}</span>
                    </div>
                    <h3 className="text-base font-bold text-brand-black leading-snug">{m.title}</h3>
                    <p className="text-xs text-gray-600">Venue: <span className="text-gray-800">{m.venue}</span></p>
                  </div>
                  <div className="pt-2 border-t border-gray-200 text-xs text-gray-600">
                    Attendees: <span className="text-cyan-300">{m.attendees}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TAB 3: FACULTY DIRECTORY
        ═══════════════════════════════════════════════════════ */}
        {activeTab === "directory" && (
          <div className="space-y-4">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search faculty..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs w-64"
                />
              </div>
              <span className="text-xs text-gray-600 font-mono">{filteredStaff.length} Faculty Members</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map(s => (
                <div key={s.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center font-bold text-brand-black">
                      {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-brand-black">{s.name}</h3>
                      <p className="text-xs text-gray-600">{s.role}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-700">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-brand-blue" />
                      <span>{s.department} Department</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-cyan-600" />
                      <span className="font-mono text-gray-600">{s.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-mono text-gray-600">{s.phone}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Meeting Modal */}
        {showMeetingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm border border-gray-200 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-base font-bold text-brand-black">Schedule Staff Council Meeting</h3>
                <button onClick={() => setShowMeetingModal(false)} className="text-gray-600 hover:text-brand-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateMeeting} className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Meeting Agenda / Title</label>
                  <input
                    type="text"
                    value={newMeeting.title}
                    onChange={e => setNewMeeting({ ...newMeeting, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Date & Time</label>
                  <input
                    type="text"
                    placeholder="e.g. Aug 25, 2026 (03:30 PM)"
                    value={newMeeting.date}
                    onChange={e => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Campus Venue</label>
                  <input
                    type="text"
                    value={newMeeting.venue}
                    onChange={e => setNewMeeting({ ...newMeeting, venue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowMeetingModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-700 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-brand-blue text-brand-black font-semibold text-xs shadow-md shadow-indigo-600/30 hover:bg-indigo-500"
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
