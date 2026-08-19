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
  Clock
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

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/approvals-ext/events");
      if (res.data && res.data.length > 0) {
        const mappedEvents = res.data.map((e: any) => ({
          ...e,
          category: "General Event",
          proposed_by_name: e.organizer_name || "Unknown Staff",
          event_date: e.start_date,
          end_date: e.end_date,
          budget_estimate: e.budget || 0,
          expected_participants: 250, // Default estimate
          venue: "Main Campus",
          rejection_reason: e.feedback,
          approved_at: e.status === "approved" ? new Date().toISOString() : undefined
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
      toast.error(`Failed to approve event: ${title}`);
    }
  };

  const handleReject = async (id: string, title: string) => {
    try {
      await api.post(`/approvals-ext/events/${id}/decision`, { status: "rejected", remarks: "Budget revision required" });
      await fetchEvents();
      toast.warning(`Proposal rejected for budget revision: ${title}`, "Event Rejected");
    } catch (err) {
      toast.error(`Failed to reject event: ${title}`);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["super_admin", "correspondent"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
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

        {/* Events Grid */}
        <div className="space-y-5">
          {events.map((ev) => (
            <div
              key={ev.id}
              className={`rounded-[24px] border border-gray-100 dark:border-gray-800 shadow-sm p-6 transition-all space-y-4 ${
                ev.status === 'pending'
                  ? 'bg-white dark:bg-[#151d30] border-amber-500/40 hover:border-amber-500/60'
                  : ev.status === 'approved'
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-rose-50 dark:bg-rose-950/20 border-rose-500/30'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {ev.category}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      ev.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : ev.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {ev.status.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-brand-black">{ev.title}</h2>
                  <p className="text-xs text-gray-600">Proposed by: <span className="text-gray-800 font-semibold">{ev.proposed_by_name}</span></p>
                </div>

                {/* Status / Actions */}
                {ev.status === 'pending' ? (
                  <div className="flex items-center gap-2 self-start">
                    <button
                      onClick={() => handleApprove(ev.id, ev.title)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-brand-black font-semibold text-xs shadow-md shadow-emerald-600/30 hover:opacity-95 transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Sanction & Approve
                    </button>
                    <button
                      onClick={() => handleReject(ev.id, ev.title)}
                      className="px-4 py-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 font-semibold text-xs transition-all flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      Decline
                    </button>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-xs text-gray-600 font-mono">
                      {ev.approved_at ? `Approved on ${new Date(ev.approved_at).toLocaleDateString()}` : "Declined"}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 dark:bg-gray-950/40 p-3.5 rounded-xl border border-gray-200 dark:border-gray-800">
                {ev.description}
              </p>

              {/* Event Metadata Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-blue flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-gray-600">Event Date</div>
                    <div className="font-semibold text-brand-black mt-0.5">{new Date(ev.event_date).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-gray-600">Budget Requested</div>
                    <div className="font-semibold text-emerald-600 mt-0.5 font-mono">₹{(ev.budget_estimate || 0).toLocaleString()}</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-gray-600">Capacity / Headcount</div>
                    <div className="font-semibold text-brand-black mt-0.5">{ev.expected_participants} Students</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50/70 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-gray-600">Campus Venue</div>
                    <div className="font-semibold text-brand-black mt-0.5 truncate">{ev.venue}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
