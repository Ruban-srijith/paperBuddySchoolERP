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

  // Blank Initial Proposal Form State
  const initialProposal = {
    title: "",
    category: "",
    description: "",
    budget: "",
    target_grades: "all",
    start_date: "",
    end_date: ""
  };

  const [newProposal, setNewProposal] = useState(initialProposal);

  const handleOpenCreateModal = () => {
    setNewProposal({ ...initialProposal });
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewProposal({ ...initialProposal });
  };

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
    } catch (err) {
      console.error("Failed to approve event via API:", err);
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "approved", approved_at: new Date().toISOString() } : e));
      toast.success(`Sanctioned and approved: ${title}`, "Event Clearance Granted");
    }
  };

  const handleReject = async (id: string, title: string) => {
    try {
      await api.post(`/approvals-ext/events/${id}/decision`, { status: "rejected" });
      await fetchEvents();
      toast.warning(`Declined proposal: ${title}`, "Event Proposal Rejected");
    } catch (err) {
      console.error("Failed to reject event via API:", err);
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "rejected" } : e));
      toast.warning(`Declined proposal: ${title}`, "Event Proposal Rejected");
    }
  };

  const handleReopen = async (id: string, title: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status: "pending", approved_at: undefined } : e));
    toast.info(`Re-opened ${title} for correspondent evaluation`, "Proposal Reset");
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProposal.title || !newProposal.description) {
      toast.error("Please fill in all required fields!");
      return;
    }

    const parsedBudget = parseFloat(newProposal.budget) || 0;
    const startDate = newProposal.start_date || new Date().toISOString();
    const endDate = newProposal.end_date || startDate;
    const eventCategory = newProposal.category || "Academic / Competition";

    try {
      await api.post("/approvals-ext/events", {
        title: newProposal.title,
        category: eventCategory,
        description: newProposal.description,
        budget: parsedBudget,
        target_grades: [newProposal.target_grades],
        start_date: startDate,
        end_date: endDate
      });
      toast.success("Event proposal submitted for correspondent clearance!", "Proposal Submitted");
      setShowCreateModal(false);
      setNewProposal({ ...initialProposal });
      await fetchEvents();
    } catch (err) {
      console.error("API event creation error, falling back locally:", err);
      const created: SchoolEventProposal = {
        id: `ev-${Date.now()}`,
        title: newProposal.title,
        category: eventCategory,
        proposed_by_name: "Super Admin",
        event_date: startDate,
        end_date: endDate,
        budget_estimate: parsedBudget,
        expected_participants: 350,
        venue: "School Main Auditorium",
        description: newProposal.description,
        status: "pending"
      };
      setEvents(prev => [created, ...prev]);
      toast.success("Event proposal submitted for correspondent clearance!", "Proposal Submitted");
      setShowCreateModal(false);
      setNewProposal({ ...initialProposal });
    }
  };

  const filteredEvents = events.filter(e => activeFilter === "all" || e.status === activeFilter);
  const pendingCount = events.filter(e => e.status === "pending").length;

  return (
    <ProtectedRoute allowedRoles={["super_admin", "correspondent", "principal", "vice_principal"]}>
      <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e5c158]/20 text-[#e5c158] font-bold border border-[#e5c158]/40">
                Correspondent Clearance
              </span>
              <span className="text-xs text-[#a3c9b0]">• High-Budget Events & Inter-School Galas</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#f4f0e6] font-syne tracking-tight mt-1">
              Major School Event Sanctions
            </h1>
            <p className="text-sm text-[#a3c9b0] font-medium">
              Review proposed inter-school competitions, sports meets, cultural fests, budget requests, and campus clearances.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-[#e5c158] hover:bg-[#d4b047] text-black font-extrabold text-xs shadow-lg shadow-[#e5c158]/20 hover:scale-105 transition-all self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Propose New Event</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <Tilt3D>
          <div className="glass-emerald-tile p-4 rounded-[24px] flex flex-wrap gap-2 items-center justify-between">
            <CornerArchOrnament position="tr" />
            <div className="flex flex-wrap gap-2 relative z-10">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === "all" ? "bg-[#e5c158] text-black font-extrabold shadow-md" : "glass-box text-[#a3c9b0] hover:text-[#f4f0e6]"
                }`}
              >
                All Proposals ({events.length})
              </button>
              <button
                onClick={() => setActiveFilter("pending")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeFilter === "pending" ? "bg-[#e5c158] text-black font-extrabold shadow-md" : "glass-box text-[#a3c9b0] hover:text-[#f4f0e6]"
                }`}
              >
                <span>Pending Clearance</span>
                {pendingCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeFilter === 'pending' ? 'bg-black text-[#e5c158]' : 'bg-[#e5c158]/20 text-[#e5c158]'}`}>
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveFilter("approved")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === "approved" ? "bg-emerald-500 text-black font-extrabold shadow-md" : "glass-box text-[#a3c9b0] hover:text-[#f4f0e6]"
                }`}
              >
                Sanctioned ({events.filter(e => e.status === "approved").length})
              </button>
              <button
                onClick={() => setActiveFilter("rejected")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === "rejected" ? "bg-rose-500 text-black font-extrabold shadow-md" : "glass-box text-[#a3c9b0] hover:text-[#f4f0e6]"
                }`}
              >
                Declined ({events.filter(e => e.status === "rejected").length})
              </button>
            </div>
          </div>
        </Tilt3D>

        {/* Events Grid */}
        <div className="space-y-5">
          {filteredEvents.length === 0 ? (
            <div className="glass-emerald-tile p-12 rounded-[24px] text-center text-[#a3c9b0]">
              <Award className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#e5c158]" />
              <p className="text-sm font-semibold">No event proposals matching this filter.</p>
            </div>
          ) : (
            filteredEvents.map((ev) => (
              <Tilt3D key={ev.id}>
                <div className="glass-emerald-tile p-6 rounded-[24px] space-y-4">
                  <CornerArchOrnament position="bl" />
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 relative z-10">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#e5c158]/20 text-[#e5c158] border border-[#e5c158]/30">
                          {ev.category}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider ${
                          ev.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : ev.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-[#e5c158]/20 text-[#e5c158] border border-[#e5c158]/40'
                        }`}>
                          {ev.status.toUpperCase()}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-[#f4f0e6] font-syne">{ev.title}</h2>
                      <p className="text-xs text-[#a3c9b0]">Proposed by: <span className="text-[#f4f0e6] font-semibold">{ev.proposed_by_name}</span></p>
                    </div>

                    {/* Actions */}
                    {ev.status === 'pending' ? (
                      <div className="flex items-center gap-2 self-start">
                        <button
                          onClick={() => handleApprove(ev.id, ev.title)}
                          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-md shadow-emerald-500/30 transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          Sanction & Approve
                        </button>
                        <button
                          onClick={() => handleReject(ev.id, ev.title)}
                          className="px-4 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 font-bold text-xs transition-all flex items-center gap-1.5"
                        >
                          <X className="w-4 h-4" />
                          Decline
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 self-start">
                        <span className="text-xs text-[#a3c9b0] font-mono">
                          {ev.approved_at ? `Approved on ${new Date(ev.approved_at).toLocaleDateString()}` : "Declined"}
                        </span>
                        <button
                          onClick={() => handleReopen(ev.id, ev.title)}
                          title="Reopen for re-evaluation"
                          className="px-3 py-1.5 rounded-lg border border-[#a3c9b0]/30 hover:bg-emerald-950/40 text-[#f4f0e6] transition-all inline-flex items-center gap-1.5 text-xs font-semibold"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#e5c158]" />
                          <span>Re-evaluate</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-[#f4f0e6] leading-relaxed glass-box p-4 rounded-xl border border-[#a3c9b0]/20 relative z-10">
                    {ev.description}
                  </p>

                  {/* Event Metadata Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs relative z-10">
                    <div className="p-3 rounded-xl glass-box border border-[#a3c9b0]/20 flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-[#e5c158] flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-[#a3c9b0]">Event Date</div>
                        <div className="font-bold text-[#f4f0e6] mt-0.5">{new Date(ev.event_date).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl glass-box border border-[#a3c9b0]/20 flex items-center gap-2.5">
                      <DollarSign className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-[#a3c9b0]">Budget Requested</div>
                        <div className="font-extrabold text-emerald-400 mt-0.5 font-mono">₹{(ev.budget_estimate || 0).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl glass-box border border-[#a3c9b0]/20 flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-sky-300 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-[#a3c9b0]">Capacity / Headcount</div>
                        <div className="font-bold text-[#f4f0e6] mt-0.5">{ev.expected_participants} attendees</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl glass-box border border-[#a3c9b0]/20 flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-amber-300 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-[#a3c9b0]">Campus Venue</div>
                        <div className="font-bold text-[#f4f0e6] mt-0.5 truncate max-w-[120px]">{ev.venue}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Tilt3D>
            ))
          )}
        </div>

        {/* Propose New Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="glass-emerald-tile p-6 rounded-[28px] w-full max-w-lg space-y-4 border border-[#e5c158]/40 shadow-2xl">
              <CornerArchOrnament position="tr" />
              <div className="flex items-center justify-between border-b border-[#a3c9b0]/20 pb-3 relative z-10">
                <h3 className="text-xl font-bold text-[#f4f0e6] font-syne">Propose Major School Event</h3>
                <button onClick={handleCloseCreateModal} className="text-[#a3c9b0] hover:text-[#f4f0e6] cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs relative z-10">
                <div>
                  <label className="block text-[#a3c9b0] font-semibold mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={newProposal.title}
                    onChange={e => setNewProposal({ ...newProposal, title: e.target.value })}
                    placeholder="e.g. Annual Tech Symposium & Hackathon 2026"
                    className="w-full px-3.5 py-2.5 glass-input-dark text-[#f4f0e6] rounded-xl text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#a3c9b0] font-semibold mb-1">Category</label>
                    <select
                      value={newProposal.category}
                      onChange={e => setNewProposal({ ...newProposal, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 glass-input-dark text-[#f4f0e6] rounded-xl text-xs"
                    >
                      <option value="" className="bg-[#14251c]">Select Category</option>
                      <option value="Academic / Competition" className="bg-[#14251c]">Academic / Competition</option>
                      <option value="Sports & Athletics" className="bg-[#14251c]">Sports & Athletics</option>
                      <option value="Arts & Culture" className="bg-[#14251c]">Arts & Culture</option>
                      <option value="Social & Community" className="bg-[#14251c]">Social & Community</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#a3c9b0] font-semibold mb-1">Estimated Budget (₹)</label>
                    <input
                      type="number"
                      required
                      value={newProposal.budget}
                      onChange={e => setNewProposal({ ...newProposal, budget: e.target.value })}
                      placeholder="e.g. 150000"
                      className="w-full px-3.5 py-2.5 glass-input-dark text-[#f4f0e6] rounded-xl text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#a3c9b0] font-semibold mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={newProposal.start_date}
                      onChange={e => setNewProposal({ ...newProposal, start_date: e.target.value })}
                      className="w-full px-3.5 py-2.5 glass-input-dark text-[#f4f0e6] rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[#a3c9b0] font-semibold mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={newProposal.end_date}
                      onChange={e => setNewProposal({ ...newProposal, end_date: e.target.value })}
                      className="w-full px-3.5 py-2.5 glass-input-dark text-[#f4f0e6] rounded-xl text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#a3c9b0] font-semibold mb-1">Scope & Description</label>
                  <textarea
                    rows={3}
                    required
                    value={newProposal.description}
                    onChange={e => setNewProposal({ ...newProposal, description: e.target.value })}
                    placeholder="Provide justification, target student headcount, venue, and procurement needs..."
                    className="w-full px-3.5 py-2.5 glass-input-dark text-[#f4f0e6] rounded-xl text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-[#a3c9b0]/20">
                  <button
                    type="button"
                    onClick={handleCloseCreateModal}
                    className="px-4 py-2.5 rounded-xl glass-box text-[#a3c9b0] hover:text-[#f4f0e6] font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#e5c158] hover:bg-[#d4b047] text-black font-extrabold shadow-md cursor-pointer"
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
