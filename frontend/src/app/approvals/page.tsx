"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle, FileText, Check, X, Shield, Plus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface LeaveItem {
  id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_role: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  approved_by_name: string | null;
  created_at: string;
}

function ApprovalsContent() {
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [actioningId, setActioningId] = useState<string | null>(null);

  // New leave modal for staff
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leave_type: "Casual",
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: "",
  });
  const [applying, setApplying] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get("/approvals/leave");
      setLeaves(res.data);
    } catch (err) {
      console.error("Failed to fetch leave requests:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAction = async (requestId: string, status: "approved" | "rejected") => {
    setActioningId(requestId);
    try {
      await api.post(`/approvals/leave/${requestId}`, { status });
      fetchLeaves();
    } catch (err) {
      console.error("Failed to process approval:", err);
    }
    setActioningId(null);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    try {
      await api.post("/approvals/leave", applyForm);
      setShowApplyModal(false);
      setApplyForm({ leave_type: "Casual", start_date: new Date().toISOString().split('T')[0], end_date: new Date().toISOString().split('T')[0], reason: "" });
      fetchLeaves();
    } catch (err) {
      console.error("Failed to submit leave:", err);
    }
    setApplying(false);
  };

  const filteredLeaves = filterStatus === "all" ? leaves : leaves.filter((l) => l.status === filterStatus);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-amber-400" />
            </div>
            Staff Leave & Approval Workflows
          </h1>
          <p className="text-sm text-gray-400">Review, approve, or reject staff leave applications</p>
        </div>

        <button
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-white text-sm font-medium shadow-lg hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Apply for Leave
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2">
        {["all", "pending", "approved", "rejected"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
              filterStatus === st
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "glass-panel text-gray-400 hover:text-white"
            }`}
          >
            {st} ({st === "all" ? leaves.length : leaves.filter((l) => l.status === st).length})
          </button>
        ))}
      </div>

      {/* Leave Requests Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">No leave requests found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800/60 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left">
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions / Approver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {filteredLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-white">{l.applicant_name}</div>
                      <div className="text-xs text-gray-400 capitalize">{l.applicant_role}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                        {l.leave_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-300">
                      {l.start_date} to {l.end_date}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-gray-300 max-w-xs truncate">{l.reason}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                          l.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : l.status === "rejected"
                            ? "bg-red-500/10 text-red-400 border border-red-500/30"
                            : "bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse"
                        }`}
                      >
                        {l.status === "approved" ? <CheckCircle2 className="w-3 h-3" /> : l.status === "rejected" ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span className="capitalize">{l.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {l.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(l.id, "approved")}
                            disabled={actioningId === l.id}
                            className="px-3 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30 text-xs font-medium transition-all"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(l.id, "rejected")}
                            disabled={actioningId === l.id}
                            className="px-3 py-1 rounded-lg bg-red-600/20 text-red-300 border border-red-500/40 hover:bg-red-600/30 text-xs font-medium transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">{l.approved_by_name || "Processed"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowApplyModal(false)}></div>
          <div className="relative glass-panel-glow rounded-2xl p-6 w-full max-w-md space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
              <h3 className="text-base font-bold text-white">Submit Staff Leave Request</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Leave Type</label>
                <select
                  value={applyForm.leave_type}
                  onChange={(e) => setApplyForm({ ...applyForm, leave_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900/70 border border-gray-700/60 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Casual">Casual Leave</option>
                  <option value="Medical">Medical Leave</option>
                  <option value="Academic">Academic Conference / Duty</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={applyForm.start_date}
                    onChange={(e) => setApplyForm({ ...applyForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900/70 border border-gray-700/60 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={applyForm.end_date}
                    onChange={(e) => setApplyForm({ ...applyForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900/70 border border-gray-700/60 text-sm text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Reason</label>
                <textarea
                  rows={3}
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  placeholder="State reason for leave request..."
                  required
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-900/70 border border-gray-700/60 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-2 rounded-xl glass-panel text-gray-300 text-xs font-medium hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-white text-xs font-medium shadow-lg hover:opacity-90 flex items-center justify-center gap-1 disabled:opacity-50"
                >
                  {applying ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApprovalsPage() {
  return (
    <ProtectedRoute allowedRoles={["super_admin", "correspondent", "admin", "principal", "teacher", "mentor"]}>
      <ApprovalsContent />
    </ProtectedRoute>
  );
}
