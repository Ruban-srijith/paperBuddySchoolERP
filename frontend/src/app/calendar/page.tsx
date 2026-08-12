"use client";

import { useEffect, useState } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  Tag, 
  Sparkles, 
  X,
  CheckCircle2,
  CalendarDays,
  Filter,
  UserCheck
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/Toast";

interface CalendarEvent {
  id: string;
  title: string;
  category: "holiday" | "exam" | "event" | "meeting" | "celebration";
  start_date: string;
  end_date?: string;
  description: string;
  target_audience: string;
  is_all_day: boolean;
}

const CATEGORY_COLORS = {
  holiday: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50",
  exam: "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/50",
  event: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50",
  meeting: "bg-cyan-50 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/50",
  celebration: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/50",
};

export default function AcademicCalendarPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "Mid-Term Examination Week",
    category: "exam",
    start_date: "2026-08-18",
    end_date: "2026-08-25",
    description: "Term 1 examinations for Grades 6 through 12. Morning session 9:00 - 12:00 PM.",
    target_audience: "all",
  });

  const canAddEvents = user && ['super_admin', 'correspondent', 'admin', 'principal', 'vice_principal'].includes(user.role);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/calendar/events");
      setEvents(res.data || []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const created: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: newEvent.title,
      category: newEvent.category as any,
      start_date: newEvent.start_date,
      end_date: newEvent.end_date,
      description: newEvent.description,
      target_audience: newEvent.target_audience,
      is_all_day: true,
    };
    setEvents(prev => [created, ...prev]);
    toast.success(`Published calendar event: ${newEvent.title}`, "Calendar Updated");
    setShowAddModal(false);
  };

  const filteredEvents = events.filter(e => categoryFilter === "all" || e.category === categoryFilter);

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                Academic Master Calendar
              </span>
              <span className="text-xs text-gray-600">• Academic Year 2026-27</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight mt-1">
              School Academic Calendar & Event Schedule
            </h1>
            <p className="text-xs text-gray-600">
              Master schedule for holidays, midterm examinations, sports meets, staff council meetings, and exhibitions.
            </p>
          </div>

          {canAddEvents && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-brand-black font-semibold text-xs shadow-lg shadow-indigo-600/25 hover:opacity-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Calendar Event</span>
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                categoryFilter === "all"
                  ? "bg-brand-blue text-brand-black shadow-md shadow-indigo-600/30"
                  : "bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-600 hover:text-gray-800"
              }`}
            >
              All Events
            </button>
            <button
              onClick={() => setCategoryFilter("holiday")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                categoryFilter === "holiday"
                  ? "bg-rose-600 text-brand-black"
                  : "bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-600 hover:text-gray-800"
              }`}
            >
              Holidays
            </button>
            <button
              onClick={() => setCategoryFilter("exam")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                categoryFilter === "exam"
                  ? "bg-amber-600 text-brand-black"
                  : "bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-600 hover:text-gray-800"
              }`}
            >
              Examinations
            </button>
            <button
              onClick={() => setCategoryFilter("event")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                categoryFilter === "event"
                  ? "bg-cyan-600 text-brand-black"
                  : "bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-600 hover:text-gray-800"
              }`}
            >
              Inter-School Events
            </button>
            <button
              onClick={() => setCategoryFilter("meeting")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                categoryFilter === "meeting"
                  ? "bg-brand-blue text-brand-black"
                  : "bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-600 hover:text-gray-800"
              }`}
            >
              Staff Meetings
            </button>
            <button
              onClick={() => setCategoryFilter("celebration")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                categoryFilter === "celebration"
                  ? "bg-purple-600 text-brand-black"
                  : "bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-600 hover:text-gray-800"
              }`}
            >
              Celebrations
            </button>
          </div>

          <span className="text-xs text-gray-600 font-mono">
            {filteredEvents.length} Events Listed
          </span>
        </div>

        {/* Events Cards Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200 space-y-4 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${CATEGORY_COLORS[ev.category] || CATEGORY_COLORS.event}`}>
                    {ev.category}
                  </span>
                  <span className="text-[11px] text-gray-600 font-mono flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-brand-blue" />
                    {ev.start_date} {ev.end_date ? `to ${ev.end_date}` : ''}
                  </span>
                </div>

                <h3 className="text-base font-bold text-brand-black leading-snug">{ev.title}</h3>
                <p className="text-xs text-gray-700 leading-relaxed">{ev.description}</p>
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-cyan-600" />
                  Target: <span className="text-gray-800 capitalize font-medium">{ev.target_audience}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-50 text-indigo-300">
                  {ev.is_all_day ? "Full Day" : "Scheduled"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Add Event Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm border border-gray-200 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-base font-bold text-brand-black">Create Academic Calendar Event</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-600 hover:text-brand-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Event Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-700 font-semibold block mb-1">Category</label>
                    <select
                      value={newEvent.category}
                      onChange={e => setNewEvent({ ...newEvent, category: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    >
                      <option value="exam">Examination</option>
                      <option value="holiday">Holiday</option>
                      <option value="event">Inter-School Event</option>
                      <option value="meeting">Staff Meeting</option>
                      <option value="celebration">Celebration</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-700 font-semibold block mb-1">Target Audience</label>
                    <select
                      value={newEvent.target_audience}
                      onChange={e => setNewEvent({ ...newEvent, target_audience: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    >
                      <option value="all">All School</option>
                      <option value="students">Students Only</option>
                      <option value="teachers">Teaching Staff</option>
                      <option value="parents">Parents</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-700 font-semibold block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newEvent.start_date}
                      onChange={e => setNewEvent({ ...newEvent, start_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 font-semibold block mb-1">End Date (Optional)</label>
                    <input
                      type="date"
                      value={newEvent.end_date}
                      onChange={e => setNewEvent({ ...newEvent, end_date: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={newEvent.description}
                    onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-700 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-brand-blue text-brand-black font-semibold text-xs shadow-md shadow-indigo-600/30 hover:bg-indigo-500"
                  >
                    Publish to Calendar
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
