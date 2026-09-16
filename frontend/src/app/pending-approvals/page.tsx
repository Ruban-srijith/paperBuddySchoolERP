"use client";

import { useEffect, useState } from "react";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  UserCheck, 
  FileText, 
  Check, 
  X,
  Sparkles,
  Award,
  Layers,
  ArrowRight
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

interface ApprovalItem {
  id: string;
  type: "leave" | "event" | "substitution";
  title: string;
  requester_name: string;
  requester_role: string;
  date_or_period: string;
  details: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export default function PendingApprovalsPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "leave" | "event" | "substitution">("all");

  const getStoredStatuses = (): Record<string, "pending" | "approved" | "rejected"> => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("paperbuddy_pending_approvals_status");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const saveStoredStatus = (id: string, status: "approved" | "rejected") => {
    if (typeof window === "undefined") return;
    try {
      const current = getStoredStatuses();
      current[id] = status;
      localStorage.setItem("paperbuddy_pending_approvals_status", JSON.stringify(current));
    } catch (e) {
      console.error("Failed to save status locally", e);
    }
  };

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const stored = getStoredStatuses();

      const [leavesRes, eventsRes] = await Promise.allSettled([
        api.get("/approvals/leave"),
        api.get("/approvals-ext/events")
      ]);

      const backendLeaves: ApprovalItem[] = (leavesRes.status === "fulfilled" && leavesRes.value.data)
        ? leavesRes.value.data.map((l: any) => ({
            id: l.id,
            type: "leave" as const,
            title: `${l.leave_type} Request`,
            requester_name: l.applicant_name || "Unknown Faculty",
            requester_role: l.applicant_role || "Staff",
            date_or_period: `${l.start_date} to ${l.end_date}`,
            details: l.reason,
            status: stored[l.id] || (l.status as "pending" | "approved" | "rejected"),
            created_at: l.created_at
          }))
        : [];

      const backendEvents: ApprovalItem[] = (eventsRes.status === "fulfilled" && eventsRes.value.data)
        ? eventsRes.value.data.map((e: any) => ({
            id: e.id,
            type: "event" as const,
            title: e.title,
            requester_name: e.organizer_name || "Staff Organizer",
            requester_role: "Faculty",
            date_or_period: `${e.start_date} to ${e.end_date}`,
            details: e.description || `Target Grades: ${e.target_grades?.join(", ") || "All"}. Budget: ₹${e.budget || 0}`,
            status: stored[e.id] || (e.status as "pending" | "approved" | "rejected"),
            created_at: e.created_at
          }))
        : [];

      const demoItems = getDemoApprovals()
        .filter(d => !backendLeaves.some(b => b.id === d.id) && !backendEvents.some(b => b.id === d.id))
        .map(d => ({
          ...d,
          status: stored[d.id] || d.status
        }));

      setItems([...backendLeaves, ...backendEvents, ...demoItems]);
    } catch {
      const stored = getStoredStatuses();
      setItems(getDemoApprovals().map(d => ({ ...d, status: stored[d.id] || d.status })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const getDemoApprovals = (): ApprovalItem[] => [
    {
      id: "app-1",
      type: "leave",
      title: "Casual Leave Request (2 Days)",
      requester_name: "Dr. Sarah Connor",
      requester_role: "Physics Senior Faculty",
      date_or_period: "Aug 12 - Aug 13, 2026",
      details: "Attending Regional Science Educator Symposium. Substitute faculty (Prof. Alan) assigned for Grade 10-A.",
      status: "pending",
      created_at: "2026-08-06T08:00:00Z"
    },
    {
      id: "app-2",
      type: "event",
      title: "Inter-House Debate Championship 2026",
      requester_name: "Mrs. Revathi Raman",
      requester_role: "English Department Head",
      date_or_period: "Aug 22, 2026 (02:00 PM)",
      details: "Auditorium booking for 120 students across Grade 9 to 12. Budget: ₹15,000 for mementos & certificates.",
      status: "pending",
      created_at: "2026-08-05T14:30:00Z"
    },
    {
      id: "app-3",
      type: "substitution",
      title: "Period Swap & Lab Rescheduling",
      requester_name: "Alex Mercer",
      requester_role: "CS Faculty",
      date_or_period: "Aug 07, 2026 (Period 3 & 4)",
      details: "Requesting CS Lab 1 slot swap with Chemistry Lab for practical batch compilation testing.",
      status: "pending",
      created_at: "2026-08-06T09:15:00Z"
    },
    {
      id: "app-4",
      type: "leave",
      title: "Medical Duty Leave (1 Day)",
      requester_name: "Dr. Marie Curie",
      requester_role: "Chemistry Head",
      date_or_period: "Aug 10, 2026",
      details: "Routine health checkup. Pre-recorded lab instruction notes shared with class prefects.",
      status: "pending",
      created_at: "2026-08-04T16:00:00Z"
    }
  ];

  const handleApprove = async (item: ApprovalItem) => {
    saveStoredStatus(item.id, "approved");
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "approved" } : i));
    try {
      if (item.type === "leave") {
        await api.post(`/approvals/leave/${item.id}`, { status: "approved" });
      } else if (item.type === "event") {
        await api.post(`/approvals-ext/events/${item.id}/decision`, { status: "approved" });
      }
    } catch (err) {
      console.warn("Backend sync notice:", err);
    }
    toast.success(`Approved ${item.title} for ${item.requester_name}`, "Approval Granted");
  };

  const handleReject = async (item: ApprovalItem) => {
    saveStoredStatus(item.id, "rejected");
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "rejected" } : i));
    try {
      if (item.type === "leave") {
        await api.post(`/approvals/leave/${item.id}`, { status: "rejected" });
      } else if (item.type === "event") {
        await api.post(`/approvals-ext/events/${item.id}/decision`, { status: "rejected" });
      }
    } catch (err) {
      console.warn("Backend sync notice:", err);
    }
    toast.warning(`Rejected ${item.title} for ${item.requester_name}`, "Request Declined");
  };

  const handleApproveAll = async () => {
    const toApprove = items.filter(i => i.status === "pending");
    toApprove.forEach(i => saveStoredStatus(i.id, "approved"));
    setItems(prev => prev.map(i => ({ ...i, status: "approved" })));
    try {
      await Promise.allSettled(
        toApprove.map(i => {
          if (i.type === "leave") return api.post(`/approvals/leave/${i.id}`, { status: "approved" });
          if (i.type === "event") return api.post(`/approvals-ext/events/${i.id}/decision`, { status: "approved" });
          return Promise.resolve();
        })
      );
    } catch (err) {
      console.warn("Batch sync notice:", err);
    }
    toast.success("Approved all pending faculty requests!", "Batch Approved");
  };

  const pendingItems = items.filter(i => i.status === "pending");
  const filteredItems = items.filter(i => filterType === "all" || i.type === filterType);

  return (
    <ProtectedRoute allowedRoles={["principal", "super_admin", "correspondent"]}>
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e5c158]/20 text-[#e5c158] font-bold border border-[#e5c158]/40">
                Principal Operations Hub
              </span>
              <span className="text-xs text-[#a3c9b0]">• Real-Time Decision Queue</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#f4f0e6] font-syne tracking-tight mt-1">
              Consolidated Pending Approvals Hub
            </h1>
            <p className="text-sm text-[#a3c9b0] mt-1 font-medium">
              One-stop operational clearance for faculty leave requests, classroom events, period substitutions, and student requisitions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {pendingItems.length > 0 && (
              <button
                onClick={handleApproveAll}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-600/30 hover:scale-105 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve All ({pendingItems.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <Tilt3D>
          <div className="glass-emerald-tile p-4 rounded-[24px] flex flex-wrap items-center justify-between gap-3">
            <CornerArchOrnament position="tr" />
            <div className="flex flex-wrap gap-2 relative z-10">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterType === "all"
                    ? "bg-[#e5c158] text-black font-extrabold shadow-md shadow-[#e5c158]/20"
                    : "glass-box text-[#a3c9b0] hover:text-[#f4f0e6]"
                }`}
              >
                All Requests ({items.length})
              </button>
              <button
                onClick={() => setFilterType("leave")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterType === "leave"
                    ? "bg-emerald-500 text-black font-extrabold"
                    : "glass-box text-[#a3c9b0] hover:text-[#f4f0e6]"
                }`}
              >
                Faculty Leaves
              </button>
              <button
                onClick={() => setFilterType("event")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterType === "event"
                    ? "bg-purple-500 text-black font-extrabold"
                    : "glass-box text-[#a3c9b0] hover:text-[#f4f0e6]"
                }`}
              >
                School Events
              </button>
              <button
                onClick={() => setFilterType("substitution")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filterType === "substitution"
                    ? "bg-cyan-500 text-black font-extrabold"
                    : "glass-box text-[#a3c9b0] hover:text-[#f4f0e6]"
                }`}
              >
                Substitutions & Swaps
              </button>
            </div>

            <span className="text-xs text-[#e5c158] font-mono font-bold relative z-10">
              {pendingItems.length} Awaiting Principal Signature
            </span>
          </div>
        </Tilt3D>

        {/* Approvals Cards Feed */}
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <Tilt3D key={item.id}>
              <div className="glass-emerald-tile p-6 rounded-[24px] space-y-4">
                <CornerArchOrnament position="bl" />
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 relative z-10">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base ${
                      item.type === 'leave' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : item.type === 'event' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      {item.type === 'leave' ? '🏖️' : item.type === 'event' ? '🎪' : '🔄'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-[#e5c158]/20 text-[#e5c158] border border-[#e5c158]/30">
                          {item.type}
                        </span>
                        <span className="text-xs text-[#a3c9b0] font-mono">{item.date_or_period}</span>
                      </div>
                      <h3 className="text-lg font-bold text-[#f4f0e6] font-syne mt-1">{item.title}</h3>
                      <p className="text-xs text-[#a3c9b0] mt-0.5">
                        Requested by <span className="text-[#f4f0e6] font-semibold">{item.requester_name}</span> ({item.requester_role})
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  {item.status === 'pending' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(item)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold transition-all shadow-md shadow-emerald-500/30 flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(item)}
                        className="px-4 py-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        Decline
                      </button>
                    </div>
                  ) : (
                    <span className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold tracking-wider ${
                      item.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="glass-box p-3.5 rounded-xl border border-[#a3c9b0]/20 text-xs text-[#f4f0e6] leading-relaxed relative z-10">
                  {item.details}
                </div>
              </div>
            </Tilt3D>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}

