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
  Printer,
  X
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/components/Toast";
import { exportToCsv } from "@/lib/exportUtils";

interface ReportItem {
  id: string;
  title: string;
  type: "daily" | "monthly" | "annual";
  date: string;
  size: string;
  format: "CSV" | "PDF" | "XLSX";
  summary: string;
  headers: string[];
  sampleRows: (string | number)[][];
}

export default function OperationalReportsPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<"all" | "daily" | "monthly" | "annual">("daily");
  const [selectedPrintReport, setSelectedPrintReport] = useState<ReportItem | null>(null);

  const [reportsList, setReportsList] = useState<ReportItem[]>([
    {
      id: "rep-1",
      title: "Daily School Attendance & Staff Log Summary",
      type: "daily",
      date: "Aug 06, 2026",
      size: "1.2 MB",
      format: "CSV",
      summary: "Daily aggregate across Kindergarten, Primary, and High School with teacher duty logs.",
      headers: ["Standard", "Total Enrolled", "Present Today", "Absent Today", "Attendance Rate (%)"],
      sampleRows: [
        ["Kindergarten (LKG-UKG)", 180, 172, 8, "95.5%"],
        ["Primary (Grades 1-5)", 450, 436, 14, "96.8%"],
        ["Middle (Grades 6-8)", 320, 310, 10, "96.8%"],
        ["Secondary (Grades 9-10)", 220, 213, 7, "96.8%"],
        ["Higher Secondary (Grades 11-12)", 180, 176, 4, "97.7%"]
      ]
    },
    {
      id: "rep-2",
      title: "Monthly Fee Collections & Outstanding Ledger (July 2026)",
      type: "monthly",
      date: "Aug 01, 2026",
      size: "3.4 MB",
      format: "CSV",
      summary: "Fee collections ledger categorized by Tuition, Bus Transportation, and Science Kits.",
      headers: ["Fee Head", "Budgeted Target (₹)", "Collected Amount (₹)", "Defaulter Dues (₹)", "Collection %"],
      sampleRows: [
        ["Tuition Fees", 8500000, 8150000, 350000, "95.8%"],
        ["Bus Transportation", 2200000, 2100000, 100000, "95.4%"],
        ["Hostel Boarding", 3200000, 3100000, 100000, "96.8%"],
        ["Science & Computer Lab Kits", 700000, 680000, 20000, "97.1%"]
      ]
    },
    {
      id: "rep-3",
      title: "Term 1 Syllabus Velocity & Milestone Audit",
      type: "monthly",
      date: "Aug 03, 2026",
      size: "2.1 MB",
      format: "CSV",
      summary: "Curriculum velocity tracking for Samacheer Kalvi and CBSE subjects across terms.",
      headers: ["Grade / Department", "Total Units", "Units Completed", "Target Milestone", "Pacing Status"],
      sampleRows: [
        ["Grade 10 Science", 23, 16, 15, "Ahead of Schedule"],
        ["Grade 12 Physics", 28, 18, 18, "On Track"],
        ["Grade 8 Mathematics", 20, 14, 13, "Ahead of Schedule"],
        ["Grade 5 EVS", 18, 11, 12, "Behind Schedule"]
      ]
    },
    {
      id: "rep-4",
      title: "Annual Institutional Performance & Grade Matrix (2025-26)",
      type: "annual",
      date: "May 15, 2026",
      size: "8.7 MB",
      format: "CSV",
      summary: "Consolidated board exam pass percentages, GPA distribution, and scholarship disbursements.",
      headers: ["Grade Level", "Students Appeared", "Pass Rate (%)", "Distinctions", "Mean GPA"],
      sampleRows: [
        ["10th Standard Board", 220, "100%", 142, "9.1"],
        ["12th Standard Board", 180, "100%", 126, "9.3"],
        ["8th Standard Annual", 320, "99.4%", 198, "8.9"]
      ]
    }
  ]);

  const filteredReports = reportsList.filter(r => reportType === "all" || r.type === reportType);

  const handleGenerateNew = () => {
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
    const newRep: ReportItem = {
      id: `rep-${Date.now()}`,
      title: `Real-time Operations Snapshot (${today})`,
      type: "daily",
      date: today,
      size: "0.9 MB",
      format: "CSV",
      summary: "Instant live snapshot of active attendance, pending governance clearances, and lab status.",
      headers: ["System Metric", "Current Metric Value", "Target Benchmark", "Health Status"],
      sampleRows: [
        ["Student Attendance", "96.4%", "95.0%", "OPTIMAL"],
        ["Faculty On-Duty", "98.2%", "95.0%", "OPTIMAL"],
        ["Fee Ledger Cleared", "92.5%", "90.0%", "HEALTHY"],
        ["Pending Event Approvals", "1 Item", "0 Items", "ACTION_REQUIRED"]
      ]
    };
    setReportsList(prev => [newRep, ...prev]);
    toast.success("Generated real-time administrative report snapshot!", "Report Generated");
  };

  const handleDownload = (rep: ReportItem) => {
    exportToCsv(rep.title.replace(/[\s&()]+/g, '_'), rep.headers, rep.sampleRows);
    toast.success(`Exported ${rep.title} successfully!`, "Download Complete");
  };

  return (
    <ProtectedRoute allowedRoles={["principal", "super_admin", "correspondent"]}>
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
              Daily operational logs, monthly financial collections audits, syllabus tracking, and board compliance reports.
            </p>
          </div>

          <button
            onClick={handleGenerateNew}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 text-white font-semibold text-xs shadow-lg shadow-teal-600/25 hover:opacity-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Real-time Snapshot</span>
          </button>
        </div>

        {/* Report Types Filter */}
        <div className="bg-white rounded-2xl border border-gray-200 p-2.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setReportType("daily")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                reportType === "daily" ? "bg-teal-600 text-white shadow-sm" : "text-gray-600 hover:text-brand-black"
              }`}
            >
              Daily Reports
            </button>
            <button
              onClick={() => setReportType("monthly")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                reportType === "monthly" ? "bg-teal-600 text-white shadow-sm" : "text-gray-600 hover:text-brand-black"
              }`}
            >
              Monthly Audits
            </button>
            <button
              onClick={() => setReportType("annual")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                reportType === "annual" ? "bg-teal-600 text-white shadow-sm" : "text-gray-600 hover:text-brand-black"
              }`}
            >
              Annual Comprehensive
            </button>
            <button
              onClick={() => setReportType("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                reportType === "all" ? "bg-teal-600 text-white shadow-sm" : "text-gray-600 hover:text-brand-black"
              }`}
            >
              All Reports
            </button>
          </div>

          <span className="text-xs text-gray-500 font-mono pr-2">
            {filteredReports.length} Reports Available
          </span>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map(rep => (
            <div key={rep.id} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 hover:border-teal-400 transition-all flex flex-col justify-between shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-50 text-teal-700 border border-teal-200">
                    {rep.type}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">{rep.date}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900">{rep.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{rep.summary}</p>
                <div className="text-xs text-gray-500 flex items-center gap-3 pt-1">
                  <span>File Size: {rep.size}</span>
                  <span>Format: <span className="font-mono text-teal-700 font-bold">{rep.format}</span></span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  onClick={() => handleDownload(rep)}
                  className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-teal-600" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => setSelectedPrintReport(rep)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Printable Report Modal (Fixes #13: functional print) */}
        {selectedPrintReport && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl border border-gray-200 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Official Institutional Report</h3>
                  <p className="text-[11px] text-gray-500">PaperBuddy School ERP • Academic Governance Division</p>
                </div>
                <button onClick={() => setSelectedPrintReport(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border border-gray-200 rounded-2xl bg-gray-50/50 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-900">{selectedPrintReport.title}</span>
                  <span className="font-mono text-gray-500">Generated: {selectedPrintReport.date}</span>
                </div>
                <p className="text-xs text-gray-600">{selectedPrintReport.summary}</p>

                <table className="w-full text-xs text-left border-collapse border border-gray-200 rounded-xl overflow-hidden bg-white">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      {selectedPrintReport.headers.map((h, idx) => (
                        <th key={idx} className="p-2.5 font-bold text-gray-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedPrintReport.sampleRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-gray-50">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-2.5 text-gray-800">{String(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-gray-400">Certified by Principal & School Correspondent</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPrintReport(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-teal-600/20"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Document</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
