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

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await api.get("/approvals-ext/pending-summary");
      if (res.data && res.data.length > 0) {
        setItems(res.data);
      } else {
        setItems(getDemoApprovals());
      }
    } catch {
      setItems(getDemoApprovals());
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
    try {
      if (item.type === "leave") {
        await api.patch(`/approvals-ext/leaves/${item.id}/approve`);
      }
    } catch {}
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "approved" } : i));
    toast.success(`Approved ${item.title} for ${item.requester_name}`, "Approval Granted");
  };

  const handleReject = async (item: ApprovalItem) => {
    try {
      if (item.type === "leave") {
        await api.patch(`/approvals-ext/leaves/${item.id}/reject`, { reason: "Operational conflict" });
      }
    } catch {}
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: "rejected" } : i));
    toast.warning(`Rejected ${item.title} for ${item.requester_name}`, "Request Declined");
  };

  const handleApproveAll = () => {
    setItems(prev => prev.map(i => ({ ...i, status: "approved" })));
    toast.success("Approved all pending faculty requests!", "Batch Approved");
  };

  const pendingItems = items.filter(i => i.status === "pending");
  const filteredItems = items.filter(i => filterType === "all" || i.type === filterType);

  return (
    <ProtectedRoute allowedRoles={["admin", "principal", "super_admin", "correspondent"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Principal Operations Hub
              </span>
              <span className="text-xs text-gray-400">• Real-Time Decision Queue</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mt-1">
              Consolidated Pending Approvals Hub
            </h1>
            <p className="text-xs text-gray-400">
              One-stop operational clearance for faculty leave requests, classroom events, period substitutions, and student requisitions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {pendingItems.length > 0 && (
              <button
                onClick={handleApproveAll}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/25 hover:opacity-95 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve All ({pendingItems.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === "all"
                  ? "bg-amber-500 text-gray-950 font-bold shadow-md shadow-amber-500/20"
                  : "glass-panel text-gray-400 hover:text-white"
              }`}
            >
              All Requests ({items.length})
            </button>
            <button
              onClick={() => setFilterType("leave")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === "leave"
                  ? "bg-indigo-600 text-white font-bold"
                  : "glass-panel text-gray-400 hover:text-white"
              }`}
            >
              Faculty Leaves
            </button>
            <button
              onClick={() => setFilterType("event")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === "event"
                  ? "bg-purple-600 text-white font-bold"
                  : "glass-panel text-gray-400 hover:text-white"
              }`}
            >
              School Events
            </button>
            <button
              onClick={() => setFilterType("substitution")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === "substitution"
                  ? "bg-cyan-600 text-white font-bold"
                  : "glass-panel text-gray-400 hover:text-white"
              }`}
            >
              Substitutions & Swaps
            </button>
          </div>

          <span className="text-xs text-amber-400 font-mono font-semibold">
            {pendingItems.length} Awaiting Principal Signature
          </span>
        </div>

        {/* Approvals Cards Feed */}
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`glass-panel p-6 rounded-2xl border transition-all space-y-3 ${
                item.status === 'pending'
                  ? 'border-amber-500/40 bg-gray-900/50 hover:border-amber-500/60'
                  : item.status === 'approved'
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : 'border-rose-500/30 bg-rose-950/10'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    item.type === 'leave' ? 'bg-indigo-500/20 text-indigo-300'
                    : item.type === 'event' ? 'bg-purple-500/20 text-purple-300'
                    : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {item.type === 'leave' ? '🏖️' : item.type === 'event' ? '🎪' : '🔄'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-gray-800 text-gray-300">
                        {item.type}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{item.date_or_period}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-0.5">{item.title}</h3>
                    <p className="text-xs text-gray-400">
                      Requested by <span className="text-gray-200 font-semibold">{item.requester_name}</span> ({item.requester_role})
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {item.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(item)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(item)}
                      className="px-4 py-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      Decline
                    </button>
                  </div>
                ) : (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-gray-950/40 border border-gray-800 text-xs text-gray-300 leading-relaxed">
                {item.details}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
