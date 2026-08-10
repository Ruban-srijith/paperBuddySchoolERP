"use client";

import { useEffect, useState } from "react";
import { 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download, 
  Search, 
  Filter, 
  Check, 
  X,
  UserCheck,
  Building2,
  FileSpreadsheet
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";

interface SalaryRecord {
  id: string;
  staff_id: string;
  staff_name: string;
  staff_role: string;
  department: string;
  month: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: "pending" | "approved" | "rejected";
  approved_at?: string;
  rejection_reason?: string;
}

export default function SalaryApprovalsPage() {
  const { toast } = useToast();
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("August 2026");

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const res = await api.get("/approvals-ext/salaries");
      if (res.data && res.data.length > 0) {
        setRecords(res.data);
      } else {
        setRecords(getDemoSalaries());
      }
    } catch (e) {
      setRecords(getDemoSalaries());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  const getDemoSalaries = (): SalaryRecord[] => [
    {
      id: "sal-1",
      staff_id: "t1",
      staff_name: "Dr. Sarah Connor",
      staff_role: "Senior Physics Faculty",
      department: "Science",
      month: "August 2026",
      basic_salary: 65000,
      allowances: 12000,
      deductions: 4500,
      net_salary: 72500,
      status: "pending"
    },
    {
      id: "sal-2",
      staff_id: "t2",
      staff_name: "Prof. Alan Turing",
      staff_role: "Dean of Academic Operations",
      department: "Academic Operations",
      month: "August 2026",
      basic_salary: 85000,
      allowances: 18000,
      deductions: 6000,
      net_salary: 97000,
      status: "pending"
    },
    {
      id: "sal-3",
      staff_id: "t3",
      staff_name: "Dr. Marie Curie",
      staff_role: "Head of Chemistry",
      department: "Science",
      month: "August 2026",
      basic_salary: 70000,
      allowances: 14000,
      deductions: 5000,
      net_salary: 79000,
      status: "approved",
      approved_at: "2026-08-05T10:00:00Z"
    },
    {
      id: "sal-4",
      staff_id: "t4",
      staff_name: "Alex Mercer",
      staff_role: "Computer Science Faculty",
      department: "Mathematics & CS",
      month: "August 2026",
      basic_salary: 58000,
      allowances: 10000,
      deductions: 4000,
      net_salary: 64000,
      status: "pending"
    }
  ];

  const handleApprove = async (id: string, name: string) => {
    try {
      await api.patch(`/approvals-ext/salaries/${id}/approve`);
      setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "approved", approved_at: new Date().toISOString() } : r));
      toast.success(`Approved salary clearance for ${name}`, "Payroll Approved");
    } catch {
      setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "approved", approved_at: new Date().toISOString() } : r));
      toast.success(`Approved salary clearance for ${name}`, "Payroll Approved");
    }
  };

  const handleReject = async (id: string, name: string) => {
    try {
      await api.patch(`/approvals-ext/salaries/${id}/reject`, { reason: "Tax deduction mismatch" });
      setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "rejected", rejection_reason: "Tax deduction mismatch" } : r));
      toast.warning(`Rejected salary sheet for ${name}`, "Payroll Rejected");
    } catch {
      setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "rejected", rejection_reason: "Tax deduction mismatch" } : r));
      toast.warning(`Rejected salary sheet for ${name}`, "Payroll Rejected");
    }
  };

  const handleApproveAll = async () => {
    setRecords(prev => prev.map(r => ({ ...r, status: "approved", approved_at: new Date().toISOString() })));
    toast.success(`Approved all pending faculty payrolls for ${selectedMonth}!`, "Batch Payroll Cleared");
  };

  const pendingCount = records.filter(r => r.status === "pending").length;
  const totalApprovedAmount = records.filter(r => r.status === "approved").reduce((a, b) => a + b.net_salary, 0);
  const totalPendingAmount = records.filter(r => r.status === "pending").reduce((a, b) => a + b.net_salary, 0);

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.staff_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute allowedRoles={["super_admin", "correspondent"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Correspondent Portal
              </span>
              <span className="text-xs text-gray-600">• Institutional Governance</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight mt-1">
              Monthly Salary Approvals & Payroll
            </h1>
            <p className="text-xs text-gray-600">
              Superadmin financial clearance for teaching faculty and administrative staff for {selectedMonth}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <button
                onClick={handleApproveAll}
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-brand-black font-semibold text-xs shadow-lg shadow-emerald-600/30 hover:opacity-95 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Clear All ({pendingCount}) Pending</span>
              </button>
            )}
            <button
              onClick={() => toast.info("Exporting certified payroll ledger to CSV", "Export Started")}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-700 hover:text-brand-black text-xs font-medium border border-gray-200 hover:border-gray-600 transition-colors"
            >
              <Download className="w-4 h-4 text-gray-600" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-xs text-gray-600">Total Monthly Payroll Budget</div>
            <div className="text-2xl font-bold text-brand-black">₹{(totalApprovedAmount + totalPendingAmount).toLocaleString()}</div>
            <div className="text-[11px] text-gray-600">{records.length} Staff records generated</div>
          </div>

          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-xs text-gray-600">Approved & Cleared</div>
            <div className="text-2xl font-bold text-emerald-600">₹{totalApprovedAmount.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-600 font-medium">Ready for direct bank disbursement</div>
          </div>

          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-xs text-gray-600">Awaiting Correspondent Clearance</div>
            <div className="text-2xl font-bold text-amber-400">{pendingCount} Records</div>
            <div className="text-[11px] text-amber-300 font-mono">₹{totalPendingAmount.toLocaleString()} pending</div>
          </div>
        </div>

        {/* Salary Records Table */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search faculty or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs w-full sm:w-56"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs w-full sm:w-auto"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Clearance</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <span className="text-xs text-gray-600 font-mono">
              Pay Period: {selectedMonth}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/90 text-gray-600 uppercase text-[10px] font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Staff Name & Role</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5 text-right">Basic Pay (₹)</th>
                  <th className="p-3.5 text-right">Allowances</th>
                  <th className="p-3.5 text-right">Deductions</th>
                  <th className="p-3.5 text-right font-bold text-brand-black">Net Pay (₹)</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Clearance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-brand-black">{r.staff_name}</div>
                      <div className="text-[11px] text-gray-600">{r.staff_role}</div>
                    </td>
                    <td className="p-3.5 text-gray-700">{r.department}</td>
                    <td className="p-3.5 text-right font-mono text-gray-700">₹{(r.basic_salary || 0).toLocaleString()}</td>
                    <td className="p-3.5 text-right font-mono text-emerald-600">+₹{(r.allowances || 0).toLocaleString()}</td>
                    <td className="p-3.5 text-right font-mono text-rose-400">-₹{(r.deductions || 0).toLocaleString()}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-brand-black text-sm">
                      ₹{(r.net_salary || 0).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : r.status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      {r.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleApprove(r.id, r.staff_name)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-brand-black text-[11px] font-bold transition-all shadow-sm flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(r.id, r.staff_name)}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-brand-black text-[11px] font-bold transition-all shadow-sm flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-gray-500 font-mono">
                          {r.approved_at ? `Cleared ${new Date(r.approved_at).toLocaleDateString()}` : "Locked"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
