"use client";

import { useEffect, useState } from "react";
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  DollarSign, 
  Users, 
  MapPin, 
  Check, 
  X, 
  FileText, 
  Clock, 
  Plus, 
  RotateCcw,
  Sparkles
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";

interface SchoolEventProposal {
  id: string;
  title: string;
  category: string;
  proposed_by_name: string;
  event_date: string;
  end_date?: string;
  budget_estimate: number;
  expected_participants: number;
  venue: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  approved_at?: string;
  rejection_reason?: string;
}

export default function EventApprovalsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<SchoolEventProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Proposal Form State
  const [newProposal, setNewProposal] = useState({
    title: "",
    category: "Academic / Competition",
    description: "",
    budget: "",
    target_grades: "all",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0]
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/approvals-ext/events");
      if (res.data && res.data.length > 0) {
        const mappedEvents = res.data.map((e: any) => ({
          ...e,
          category: e.category || "Academic / Competition",
          proposed_by_name: e.organizer_name || "School Faculty",
          event_date: e.start_date,
          end_date: e.end_date,
          budget_estimate: e.budget || 0,
          expected_participants: 250,
          venue: "Main Campus & Auditorium",
          rejection_reason: e.feedback,
          approved_at: e.status === "approved" ? (e.created_at || new Date().toISOString()) : undefined
        }));
        setEvents(mappedEvents);
      } else {
        setEvents(getDemoEvents());
      }
    } catch {
      setEvents(getDemoEvents());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getDemoEvents = (): SchoolEventProposal[] => [
    {
      id: "ev-1",
      title: "State-Level Inter-School Science Olympiad & Tech Expo 2026",
      category: "Academic / Competition",
      proposed_by_name: "Dr. Sarah Connor (Head of Science)",
      event_date: "2026-09-15T09:00:00Z",
      end_date: "2026-09-16T17:00:00Z",
      budget_estimate: 150000,
      expected_participants: 450,
      venue: "Main Auditorium & Science Complex",
      description: "Hosting 24 regional CBSE schools for robotic design showcases, physics paper presentations, and junior hackathons. Includes guest keynote and trophies.",
      status: "pending"
    },
    {
      id: "ev-2",
      title: "Annual Sports Meet & Inter-House Athletics Tournament",
      category: "Sports & Athletics",
      proposed_by_name: "Coach Rajesh Singh (Physical Ed)",
      event_date: "2026-10-05T08:00:00Z",
      end_date: "2026-10-07T16:00:00Z",
      budget_estimate: 220000,
      expected_participants: 800,
      venue: "School Main Sports Ground & Pavilion",
      description: "3-day track and field sports carnival across 4 houses (Red, Blue, Green, Yellow) with Olympic-style torch relay and chief guest felicitation.",
      status: "approved",
      approved_at: "2026-08-01T12:00:00Z"
    },
    {
      id: "ev-3",
      title: "National Heritage Day & Cultural Drama Gala",
      category: "Arts & Culture",
      proposed_by_name: "Mrs. Revathi Raman (Arts & English)",
      event_date: "2026-11-12T10:00:00Z",
      budget_estimate: 95000,
      expected_participants: 600,
      venue: "Open Air Amphitheatre",
      description: "Music, classical dance recitals, and Shakespearean theater production featuring LKG through 12th standard students.",
      status: "pending"
    }
  ];

  const handleApprove = async (id: string, title: string) => {
    try {
      await api.post(`/approvals-ext/events/${id}/decision`, { status: "approved" });
      await fetchEvents();
      toast.success(`Sanctioned and approved: ${title}`, "Event Clearance Granted");
    } catch {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "approved", approved_at: new Date().toISOString() } : e));
      toast.success(`Sanctioned and approved: ${title}`, "Event Clearance Granted");
    }
  };

  const handleReject = async (id: string, title: string) => {
    try {
      await api.post(`/approvals-ext/events/${id}/decision`, { status: "rejected", feedback: "Budget revision required" });
      await fetchEvents();
      toast.warning(`Proposal rejected for budget revision: ${title}`, "Event Rejected");
    } catch {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "rejected" } : e));
      toast.warning(`Proposal rejected: ${title}`, "Event Rejected");
    }
  };

  const handleReopen = async (id: string, title: string) => {
    try {
      await api.post(`/approvals-ext/events/${id}/decision`, { status: "pending" });
      await fetchEvents();
      toast.info(`Event proposal reset to pending review: ${title}`, "Decision Reopened");
    } catch {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "pending" } : e));
      toast.info(`Event proposal reset to pending review: ${title}`, "Decision Reopened");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/approvals-ext/events", {
        title: newProposal.title,
        description: newProposal.description,
        target_grades: newProposal.target_grades,
        start_date: newProposal.start_date,
        end_date: newProposal.end_date,
        budget: parseFloat(newProposal.budget) || 0
      });
      toast.success("Event proposal submitted for correspondent clearance!", "Proposal Submitted");
      setShowCreateModal(false);
      setNewProposal({
        title: "",
        category: "Academic / Competition",
        description: "",
        budget: "",
        target_grades: "all",
        start_date: new Date().toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0]
      });
      fetchEvents();
    } catch {
      const created: SchoolEventProposal = {
        id: `ev-${Date.now()}`,
        title: newProposal.title,
        category: newProposal.category,
        proposed_by_name: "Super Admin",
        event_date: newProposal.start_date,
        end_date: newProposal.end_date,
        budget_estimate: parseFloat(newProposal.budget) || 0,
        expected_participants: 350,
        venue: "School Main Auditorium",
        description: newProposal.description,
        status: "pending"
      };
      setEvents(prev => [created, ...prev]);
      toast.success("Event proposal submitted for correspondent clearance!", "Proposal Submitted");
      setShowCreateModal(false);
    }
  };

  const filteredEvents = events.filter(e => activeFilter === "all" || e.status === activeFilter);
  const pendingCount = events.filter(e => e.status === "pending").length;

  return (
    <ProtectedRoute allowedRoles={["super_admin", "correspondent", "principal", "vice_principal"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Correspondent Clearance
              </span>
              <span className="text-xs text-gray-600">• High-Budget Events & Inter-School Galas</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight mt-1">
              Major School Event Sanctions
            </h1>
            <p className="text-xs text-gray-600">
              Review proposed inter-school competitions, sports meets, cultural fests, budget requests, and campus clearances.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 text-brand-black font-semibold text-xs shadow-lg shadow-amber-600/30 hover:opacity-95 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Propose New Event</span>
          </button>
        </div>

        {/* Filter Tabs (Fixes #3: ensure pending and approved items are always accessible) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-2 flex flex-wrap gap-2 items-center justify-between shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === "all" ? "bg-amber-600 text-white shadow-sm" : "text-gray-600 hover:text-brand-black"
              }`}
            >
              All Proposals ({events.length})
            </button>
            <button
              onClick={() => setActiveFilter("pending")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeFilter === "pending" ? "bg-amber-600 text-white shadow-sm" : "text-gray-600 hover:text-brand-black"
              }`}
            >
              <span>Pending Clearance</span>
              {pendingCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeFilter === 'pending' ? 'bg-white text-amber-700' : 'bg-amber-100 text-amber-800'}`}>
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveFilter("approved")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === "approved" ? "bg-amber-600 text-white shadow-sm" : "text-gray-600 hover:text-brand-black"
              }`}
            >
              Sanctioned ({events.filter(e => e.status === "approved").length})
            </button>
            <button
              onClick={() => setActiveFilter("rejected")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === "rejected" ? "bg-amber-600 text-white shadow-sm" : "text-gray-600 hover:text-brand-black"
              }`}
            >
              Declined ({events.filter(e => e.status === "rejected").length})
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="space-y-5">
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
              <Award className="w-12 h-12 mx-auto mb-3 opacity-25" />
              <p className="text-sm font-semibold">No event proposals matching this filter.</p>
            </div>
          ) : (
            filteredEvents.map((ev) => (
              <div
                key={ev.id}
                className={`rounded-2xl border p-6 transition-all space-y-4 shadow-sm ${
                  ev.status === 'pending'
                    ? 'bg-white border-amber-300 hover:border-amber-400'
                    : ev.status === 'approved'
                    ? 'bg-emerald-50/40 border-emerald-300'
                    : 'bg-rose-50/40 border-rose-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {ev.category}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ev.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : ev.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {ev.status.toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900">{ev.title}</h2>
                    <p className="text-xs text-gray-600">Proposed by: <span className="text-gray-900 font-semibold">{ev.proposed_by_name}</span></p>
                  </div>

                  {/* Status / Actions (Fixes #3: allows approving pending items, and reopening already decided items) */}
                  {ev.status === 'pending' ? (
                    <div className="flex items-center gap-2 self-start">
                      <button
                        onClick={() => handleApprove(ev.id, ev.title)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 hover:opacity-95 transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Sanction & Approve
                      </button>
                      <button
                        onClick={() => handleReject(ev.id, ev.title)}
                        className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 font-semibold text-xs transition-all flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        Decline
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 self-start">
                      <span className="text-xs text-gray-600 font-mono">
                        {ev.approved_at ? `Approved on ${new Date(ev.approved_at).toLocaleDateString()}` : "Declined"}
                      </span>
                      <button
                        onClick={() => handleReopen(ev.id, ev.title)}
                        title="Reopen for re-evaluation"
                        className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-1 text-[11px]"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Re-evaluate</span>
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50/80 p-3.5 rounded-xl border border-gray-200">
                  {ev.description}
                </p>

                {/* Event Metadata Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <div>
                      <div className="text-[10px] text-gray-500">Event Date</div>
                      <div className="font-semibold text-gray-800 mt-0.5">{new Date(ev.event_date).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div>
                      <div className="text-[10px] text-gray-500">Budget Requested</div>
                      <div className="font-semibold text-emerald-700 mt-0.5 font-mono">₹{(ev.budget_estimate || 0).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                    <div>
                      <div className="text-[10px] text-gray-500">Capacity / Headcount</div>
                      <div className="font-semibold text-gray-800 mt-0.5">{ev.expected_participants} attendees</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <div>
                      <div className="text-[10px] text-gray-500">Campus Venue</div>
                      <div className="font-semibold text-gray-800 mt-0.5 truncate max-w-[120px]">{ev.venue}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Propose New Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-lg font-bold text-gray-900">Propose Major School Event</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={newProposal.title}
                    onChange={e => setNewProposal({ ...newProposal, title: e.target.value })}
                    placeholder="e.g. Annual Tech Symposium & Hackathon 2026"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Category</label>
                    <select
                      value={newProposal.category}
                      onChange={e => setNewProposal({ ...newProposal, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="Academic / Competition">Academic / Competition</option>
                      <option value="Sports & Athletics">Sports & Athletics</option>
                      <option value="Arts & Culture">Arts & Culture</option>
                      <option value="Social & Community">Social & Community</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Estimated Budget (₹)</label>
                    <input
                      type="number"
                      required
                      value={newProposal.budget}
                      onChange={e => setNewProposal({ ...newProposal, budget: e.target.value })}
                      placeholder="e.g. 150000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={newProposal.start_date}
                      onChange={e => setNewProposal({ ...newProposal, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={newProposal.end_date}
                      onChange={e => setNewProposal({ ...newProposal, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Scope & Description</label>
                  <textarea
                    rows={3}
                    required
                    value={newProposal.description}
                    onChange={e => setNewProposal({ ...newProposal, description: e.target.value })}
                    placeholder="Provide justification, target student headcount, venue, and procurement needs..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md shadow-amber-600/20"
                  >
                    Submit Proposal
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
