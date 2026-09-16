"use client";

import { useState } from "react";
import dayjs from "dayjs";
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

interface ReportItem {
  id: string;
  title: string;
  type: "daily" | "monthly" | "annual";
  date: string;
  size: string;
  format: string;
}

const generateReportHtml = (rep: ReportItem) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${rep.title}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; color: #000; background: #fff; }
      .no-print { display: none; }
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      color: #1e293b;
      background: #f8fafc;
      padding: 40px;
      margin: 0 auto;
      max-width: 800px;
    }
    .header {
      border-bottom: 2px solid #0f766e;
      padding-bottom: 16px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      color: #0f766e;
      letter-spacing: -0.5px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      background: #ccfbf1;
      color: #0f766e;
      font-size: 12px;
      font-weight: 700;
      border-radius: 9999px;
      text-transform: uppercase;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin: 12px 0 6px 0;
    }
    .meta {
      font-size: 12px;
      color: #64748b;
      display: flex;
      gap: 16px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin: 24px 0;
    }
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .card-title {
      font-size: 11px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .card-value {
      font-size: 22px;
      font-weight: 700;
      color: #0f766e;
    }
    .card-sub {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 2px;
    }
    .section {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 8px;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    .table th {
      text-align: left;
      padding: 8px 12px;
      background: #f8fafc;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
    }
    .table td {
      padding: 8px 12px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    .footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #64748b;
    }
    .sign-box {
      border-top: 1px solid #94a3b8;
      width: 180px;
      text-align: center;
      padding-top: 6px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">PaperBuddy School ERP</div>
      <div class="title">${rep.title}</div>
      <div class="meta">
        <span><strong>Report ID:</strong> ${rep.id}</span>
        <span><strong>Date:</strong> ${rep.date}</span>
        <span><strong>Classification:</strong> ${rep.type.toUpperCase()}</span>
      </div>
    </div>
    <div>
      <span class="badge">Official Institutional Audit</span>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title">Attendance & Duty Compliance</div>
      <div class="card-value">95.8%</div>
      <div class="card-sub">Campus operational quorum met</div>
    </div>
    <div class="card">
      <div class="card-title">Academic Syllabus Velocity</div>
      <div class="card-value">68.4%</div>
      <div class="card-sub">+3.4% ahead of institutional milestone</div>
    </div>
    <div class="card">
      <div class="card-title">Fee Revenue Realization</div>
      <div class="card-value">92.1%</div>
      <div class="card-sub">Ledger reconciliation verified</div>
    </div>
    <div class="card">
      <div class="card-title">Laboratory Safety & Compliance</div>
      <div class="card-value">100%</div>
      <div class="card-sub">All safety audits certified</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Institutional Summary & Audit Log</div>
    <table class="table">
      <thead>
        <tr>
          <th>Metric / Parameter</th>
          <th>Status / Benchmark</th>
          <th>Audit Assessment</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Staff & Student Attendance</td>
          <td>95.8% (Benchmark: 90.0%)</td>
          <td>Compliant — High campus presence</td>
        </tr>
        <tr>
          <td>Curriculum & Syllabus Completion</td>
          <td>68.4% (Benchmark: 65.0%)</td>
          <td>On Track — Term targets met</td>
        </tr>
        <tr>
          <td>Fee Dues & Revenue Settlement</td>
          <td>92.1% Collected</td>
          <td>Satisfactory — Auto-receipts dispatched</td>
        </tr>
        <tr>
          <td>Classroom & Lab Allocation</td>
          <td>100% Conflict-Free</td>
          <td>Optimal — OR-Tools constraints active</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <div>
      <p style="margin:0 0 4px 0;"><strong>PaperBuddy School ERP</strong></p>
      <p style="margin:0; font-size:11px; color:#94a3b8;">Generated on ${rep.date} • Electronic Audit Record</p>
    </div>
    <div class="sign-box">
      Principal / Admin Authority
    </div>
  </div>
</body>
</html>`;
};

export default function OperationalReportsPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<"all" | "daily" | "monthly" | "annual">("daily");

  const [reports, setReports] = useState<ReportItem[]>([
    { id: "rep-1", title: "Daily School Attendance & Staff Log Summary", type: "daily", date: "Aug 06, 2026", size: "1.2 MB", format: "PDF" },
    { id: "rep-2", title: "Monthly Fee Collections & Outstanding Ledger (July 2026)", type: "monthly", date: "Aug 01, 2026", size: "3.4 MB", format: "XLSX" },
    { id: "rep-3", title: "Term 1 Syllabus Velocity & Milestone Audit", type: "monthly", date: "Aug 03, 2026", size: "2.1 MB", format: "PDF" },
    { id: "rep-4", title: "Annual Institutional Performance & Grade Matrix (2025-26)", type: "annual", date: "May 15, 2026", size: "8.7 MB", format: "PDF" },
    { id: "rep-5", title: "Specialized Laboratory Utilization & Chemical Safety Audit", type: "monthly", date: "July 28, 2026", size: "1.8 MB", format: "PDF" },
  ]);

  const filteredReports = reports.filter(r => reportType === "all" || r.type === reportType);

  const handleGenerateNew = () => {
    const newRep: ReportItem = {
      id: `rep-${Date.now()}`,
      title: `Real-time Operational Snapshot (${dayjs().format("DD MMM YYYY, hh:mm A")})`,
      type: "daily",
      date: dayjs().format("DD MMM YYYY"),
      size: "1.5 MB",
      format: "PDF"
    };
    setReports(prev => [newRep, ...prev]);
    toast.success("Generated real-time administrative report snapshot!", "Report Generated");
  };

  const handleDownloadReport = (rep: ReportItem) => {
    try {
      const htmlContent = generateReportHtml(rep);
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const cleanTitle = rep.title.replace(/[^a-zA-Z0-9]/g, '_');
      anchor.setAttribute("download", `${cleanTitle}.html`);
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success(`Downloading ${rep.title}`, "Download Complete");
    } catch (err) {
      toast.error("Failed to download report");
    }
  };

  const handlePrintReport = (rep: ReportItem) => {
    try {
      const printWindow = window.open('', '_blank', 'width=900,height=800');
      if (!printWindow) {
        window.print();
        return;
      }
      const htmlContent = generateReportHtml(rep) + `
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      `;
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      toast.success(`Sent ${rep.title} to printer`, "Printing");
    } catch (err) {
      window.print();
    }
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
                  onClick={() => handleDownloadReport(rep)}
                  className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-700 text-gray-800 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-teal-400" />
                  <span>Download {rep.format}</span>
                </button>
                <button
                  onClick={() => handlePrintReport(rep)}
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
