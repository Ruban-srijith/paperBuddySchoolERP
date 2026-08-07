"use client";

import { useState } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Building2, 
  Calendar, 
  Download, 
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  PieChart as PieChartIcon
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/components/Toast";

export default function RevenuePage() {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState<"monthly" | "quarterly" | "annual">("monthly");

  const monthlyCollections = [
    { month: "Apr 2026", tuition: 6500000, transport: 1800000, hostel: 2400000, lab: 500000, total: 11200000 },
    { month: "May 2026", tuition: 4200000, transport: 1200000, hostel: 1900000, lab: 300000, total: 7600000 },
    { month: "Jun 2026", tuition: 8900000, transport: 2400000, hostel: 3500000, lab: 800000, total: 15600000 },
    { month: "Jul 2026", tuition: 5400000, transport: 1500000, hostel: 2100000, lab: 400000, total: 9400000 },
    { month: "Aug 2026", tuition: 3500000, transport: 900000, hostel: 1200000, lab: 250000, total: 5850000 },
  ];

  const gradeRevenueData = [
    { grade: "Grade 11 & 12 (Science & CS)", students: 180, feePerStudent: 95000, collected: 17100000, pct: 98 },
    { grade: "Grade 9 & 10 (Secondary)", students: 220, feePerStudent: 80000, collected: 17600000, pct: 96 },
    { grade: "Grade 6 to 8 (Middle School)", students: 340, feePerStudent: 65000, collected: 22100000, pct: 94 },
    { grade: "Grade 1 to 5 (Primary)", students: 480, feePerStudent: 55000, collected: 26400000, pct: 95 },
    { grade: "LKG & UKG (Pre-Primary)", students: 200, feePerStudent: 45000, collected: 9000000, pct: 92 },
  ];

  const totalCollected = monthlyCollections.reduce((a, b) => a + b.total, 0);

  return (
    <ProtectedRoute allowedRoles={["super_admin", "correspondent"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                Correspondent Financial Analytics
              </span>
              <span className="text-xs text-gray-600">• Institutional Treasury</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight mt-1">
              Monthly Revenue & Fee Collections Breakdown
            </h1>
            <p className="text-xs text-gray-600">
              Institutional revenue matrix categorized by Tuition, Bus Transportation, Boarding Hostel, and Laboratory Kit Dues.
            </p>
          </div>

          <button
            onClick={() => toast.info("Exporting financial balance sheet (FY 2026-27)", "Export Started")}
            className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-700 hover:text-brand-black text-xs font-medium border border-gray-200 hover:border-gray-600 transition-colors"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span>Export Balance Sheet</span>
          </button>
        </div>

        {/* Big Numbers Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-xs text-gray-600">Total Net Collections (FY 2026)</div>
            <div className="text-2xl font-bold text-emerald-600">₹{(totalCollected).toLocaleString()}</div>
            <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% YoY growth vs FY 2025
            </div>
          </div>

          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-xs text-gray-600">Tuition Fee Vault</div>
            <div className="text-2xl font-bold text-brand-blue">₹{(totalCollected * 0.58).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div className="text-[11px] text-gray-600">58% of gross institution revenues</div>
          </div>

          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-xs text-gray-600">Transport & Bus Fleet</div>
            <div className="text-2xl font-bold text-cyan-600">₹{(totalCollected * 0.16).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div className="text-[11px] text-gray-600">18 Route buses operational</div>
          </div>

          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200 space-y-1">
            <div className="text-xs text-gray-600">Hostel & Boarding Fee</div>
            <div className="text-2xl font-bold text-purple-400">₹{(totalCollected * 0.22).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            <div className="text-[11px] text-gray-600">320 Hostelite students</div>
          </div>
        </div>

        {/* Monthly Breakdown Matrix */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-brand-black flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
              <span>Monthly Inflow Breakdown (FY 2026-27)</span>
            </h2>
            <span className="text-xs text-gray-600 font-mono">Currency: INR (₹)</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/90 text-gray-600 uppercase text-[10px] font-semibold border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Month</th>
                  <th className="p-3.5 text-right">Tuition Fees</th>
                  <th className="p-3.5 text-right">Bus Transport</th>
                  <th className="p-3.5 text-right">Hostel & Boarding</th>
                  <th className="p-3.5 text-right">Lab & Activities</th>
                  <th className="p-3.5 text-right font-bold text-brand-black">Monthly Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-mono">
                {monthlyCollections.map((m) => (
                  <tr key={m.month} className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-3.5 font-bold text-brand-black font-sans">{m.month}</td>
                    <td className="p-3.5 text-right text-gray-700">₹{m.tuition.toLocaleString()}</td>
                    <td className="p-3.5 text-right text-gray-700">₹{m.transport.toLocaleString()}</td>
                    <td className="p-3.5 text-right text-gray-700">₹{m.hostel.toLocaleString()}</td>
                    <td className="p-3.5 text-right text-gray-700">₹{m.lab.toLocaleString()}</td>
                    <td className="p-3.5 text-right font-bold text-emerald-600 text-sm">
                      ₹{m.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grade-wise Revenue Yield Matrix */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200 space-y-4">
          <h2 className="text-base font-bold text-brand-black flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-blue" />
            <span>Grade-wise Revenue Distribution</span>
          </h2>

          <div className="space-y-3">
            {gradeRevenueData.map((g) => (
              <div key={g.grade} className="p-4 rounded-xl bg-white border border-gray-200 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs gap-1">
                  <div className="font-semibold text-brand-black">{g.grade} ({g.students} Enrolled)</div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 font-mono">₹{g.feePerStudent.toLocaleString()} / student</span>
                    <span className="font-bold text-emerald-600 font-mono">₹{g.collected.toLocaleString()}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full" style={{ width: `${g.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
