"use client";

import { useState } from "react";
import { 
  FileSpreadsheet, 
  Download, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Filter, 
  Clock,
  Sparkles,
  Printer
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/components/Toast";

export default function OperationalReportsPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<"all" | "daily" | "monthly" | "annual">("daily");
  const [category, setCategory] = useState("all");

  const reportsList = [
    { id: "rep-1", title: "Daily School Attendance & Staff Log Summary", type: "daily", date: "Aug 06, 2026", size: "1.2 MB", format: "PDF" },
    { id: "rep-2", title: "Monthly Fee Collections & Outstanding Ledger (July 2026)", type: "monthly", date: "Aug 01, 2026", size: "3.4 MB", format: "XLSX" },
    { id: "rep-3", title: "Term 1 Syllabus Velocity & Milestone Audit", type: "monthly", date: "Aug 03, 2026", size: "2.1 MB", format: "PDF" },
    { id: "rep-4", title: "Annual Institutional Performance & Grade Matrix (2025-26)", type: "annual", date: "May 15, 2026", size: "8.7 MB", format: "PDF" },
    { id: "rep-5", title: "Specialized Laboratory Utilization & Chemical Safety Audit", type: "monthly", date: "July 28, 2026", size: "1.8 MB", format: "PDF" },
  ];

  const filteredReports = reportsList.filter(r => reportType === "all" || r.type === reportType);

  const handleGenerateNew = () => {
    toast.success("Generated real-time administrative report snapshot!", "Report Generated");
  };

  return (
    <ProtectedRoute allowedRoles={["admin", "principal", "super_admin", "correspondent"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
                Principal Executive Reports
              </span>
              <span className="text-xs text-gray-600">• Institutional Audits</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight mt-1">
              School Operational Reports & Analytics
            </h1>
            <p className="text-xs text-gray-600">
              Daily operational logs, monthly financial collections audits, syllabus tracking, and CBSE compliance reports.
            </p>
          </div>

          <button
            onClick={handleGenerateNew}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 text-brand-black font-semibold text-xs shadow-lg shadow-teal-600/25 hover:opacity-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Real-time Snapshot</span>
          </button>
        </div>

        {/* Report Types Filter */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setReportType("daily")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                reportType === "daily" ? "bg-teal-600 text-brand-black shadow-md" : "bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-600 hover:text-brand-black"
              }`}
            >
              Daily Reports
            </button>
            <button
              onClick={() => setReportType("monthly")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                reportType === "monthly" ? "bg-teal-600 text-brand-black shadow-md" : "bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-600 hover:text-brand-black"
              }`}
            >
              Monthly Audits
            </button>
            <button
              onClick={() => setReportType("annual")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                reportType === "annual" ? "bg-teal-600 text-brand-black shadow-md" : "bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-600 hover:text-brand-black"
              }`}
            >
              Annual Comprehensive
            </button>
          </div>

          <span className="text-xs text-gray-600 font-mono">
            {filteredReports.length} Reports Available
          </span>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map(rep => (
            <div key={rep.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200 space-y-4 hover:border-teal-500/40 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {rep.type}
                  </span>
                  <span className="text-xs text-gray-600 font-mono">{rep.date}</span>
                </div>
                <h3 className="text-base font-bold text-brand-black">{rep.title}</h3>
                <div className="text-xs text-gray-600 flex items-center gap-3">
                  <span>File Size: {rep.size}</span>
                  <span>Format: <span className="font-mono text-cyan-300 font-bold">{rep.format}</span></span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  onClick={() => toast.info(`Downloading ${rep.title}`, "Download Started")}
                  className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-700 text-gray-800 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-teal-400" />
                  <span>Download {rep.format}</span>
                </button>
                <button
                  onClick={() => toast.success(`Sent ${rep.title} to printer`, "Printing")}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/40 text-teal-300 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
