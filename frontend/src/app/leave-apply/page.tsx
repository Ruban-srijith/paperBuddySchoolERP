"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, 
  Send, 
  CheckCircle2, 
  Clock, 
  FileText, 
  UserCheck, 
  AlertCircle,
  Plus,
  ShieldCheck
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/Toast";
import api from "@/lib/api";

interface LeaveApplication {
  id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  substitute_teacher: string;
  status: "pending" | "approved" | "rejected";
  applied_on: string;
}

export default function LeaveApplyPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [leaveHistory, setLeaveHistory] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaveHistory() {
      try {
        const res = await api.get("/approvals/leave");
        setLeaveHistory(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch leave history", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaveHistory();
  }, []);

  const [form, setForm] = useState({
    leave_type: "Casual Leave",
    start_date: "2026-08-20",
    end_date: "2026-08-21",
    reason: "",
    substitute_teacher: "Prof. Alan Turing",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newApp: LeaveApplication = {
      id: `lv-${Date.now()}`,
      leave_type: form.leave_type,
      start_date: form.start_date,
      end_date: form.end_date,
      days: 2,
      reason: form.reason,
      substitute_teacher: form.substitute_teacher,
      status: "pending",
      applied_on: "Today",
    };
    setLeaveHistory(prev => [newApp, ...prev]);
    toast.success("Leave application submitted to Principal for clearance!", "Application Submitted");
    setForm({ ...form, reason: "" });
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
              Faculty Self-Service Portal
            </span>
            <span className="text-xs text-gray-600">• Leave Requisitions</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight mt-1">
            Apply for Faculty Leave & Duty Off
          </h1>
          <p className="text-xs text-gray-600">
            Submit casual, medical, or duty leave requests with substitute teacher class coverage arrangements.
          </p>
        </div>

        {/* Leave Balance Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-xs text-gray-600">Casual Leave (CL)</div>
            <div className="text-2xl font-bold text-emerald-600">8 / 12 Days</div>
            <div className="text-[11px] text-gray-600">Available balance</div>
          </div>
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-xs text-gray-600">Medical Leave (ML)</div>
            <div className="text-2xl font-bold text-cyan-600">9 / 10 Days</div>
            <div className="text-[11px] text-gray-600">Available balance</div>
          </div>
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-xs text-gray-600">Duty Leave (DL)</div>
            <div className="text-2xl font-bold text-purple-400">5 / 5 Days</div>
            <div className="text-[11px] text-gray-600">Available balance</div>
          </div>
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-xs text-gray-600">Pending Clearances</div>
            <div className="text-2xl font-bold text-amber-400">1 Request</div>
            <div className="text-[11px] text-amber-300">With Principal</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Form */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200 space-y-4 lg:col-span-1">
            <h2 className="text-base font-bold text-brand-black flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-blue" />
              <span>New Leave Request</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-700 font-semibold block mb-1">Leave Category</label>
                <select
                  value={form.leave_type}
                  onChange={e => setForm({ ...form, leave_type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                >
                  <option value="Casual Leave">Casual Leave (CL)</option>
                  <option value="Medical Leave">Medical Leave (ML)</option>
                  <option value="Duty Leave">On-Duty / Conference (DL)</option>
                  <option value="Maternity / Paternity">Maternity / Paternity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">From Date</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">To Date</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={e => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-700 font-semibold block mb-1">Substitute Faculty Assigned</label>
                <select
                  value={form.substitute_teacher}
                  onChange={e => setForm({ ...form, substitute_teacher: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                >
                  <option value="Prof. Alan Turing">Prof. Alan Turing</option>
                  <option value="Dr. Marie Curie">Dr. Marie Curie</option>
                  <option value="Alex Mercer">Alex Mercer</option>
                  <option value="Mrs. Revathi Raman">Mrs. Revathi Raman</option>
                </select>
              </div>

              <div>
                <label className="text-gray-700 font-semibold block mb-1">Detailed Reason</label>
                <textarea
                  rows={3}
                  value={form.reason}
                  placeholder="Provide context and notes for substitute teacher..."
                  onChange={e => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-brand-black font-semibold text-xs shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Leave Request</span>
              </button>
            </form>
          </div>

          {/* History Feed */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200 space-y-4 lg:col-span-2">
            <h2 className="text-base font-bold text-brand-black flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-600" />
              <span>Leave Application History</span>
            </h2>

            <div className="space-y-3">
              {leaveHistory.map(l => (
                <div
                  key={l.id}
                  className={`p-4 rounded-xl border space-y-2 transition-all ${
                    l.status === 'approved' ? 'bg-emerald-950/10 border-emerald-500/30'
                    : l.status === 'pending' ? 'bg-amber-950/10 border-amber-500/30'
                    : 'bg-rose-950/10 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-brand-black text-xs">{l.leave_type}</span>
                      <span className="text-[11px] text-gray-600 font-mono">({l.days} Days)</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      l.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300'
                      : l.status === 'pending' ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {l.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs text-gray-700">
                    <span className="text-gray-600">Duration: </span>
                    <span className="font-mono text-cyan-300 font-semibold">{l.start_date} to {l.end_date}</span>
                  </div>

                  <p className="text-xs text-gray-800 dark:text-slate-100 bg-gray-50 dark:bg-slate-800 p-2.5 rounded-lg border border-gray-150 dark:border-slate-700">
                    "{l.reason}"
                  </p>

                  <div className="flex justify-between text-[11px] text-gray-600 dark:text-slate-400 pt-1">
                    <span>Substitute: <span className="text-indigo-600 dark:text-indigo-300 font-semibold">{l.substitute_teacher}</span></span>
                    <span className="font-mono">Applied: {l.applied_on}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
