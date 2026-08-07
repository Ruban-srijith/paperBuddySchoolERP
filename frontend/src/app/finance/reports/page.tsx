"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { FileSpreadsheet, Download, TrendingUp } from "lucide-react";

export default function FinancialReportsPortal() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'admin', 'principal', 'finance']}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-brand-blue" />
            Financial Reports
          </h1>
          <p className="text-gray-600 mt-2">Generate and download monthly revenue, fee defaulter, and payroll reports.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 rounded-2xl border border-gray-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-brand-blue" />
            </div>
            <h2 className="text-xl font-bold text-brand-black">Monthly Revenue Report</h2>
            <p className="text-gray-600 mt-2 text-sm">
              Comprehensive breakdown of all tuition, hostel, and transport fees collected this month.
            </p>
            <button className="mt-6 inline-flex items-center gap-2 bg-brand-blue hover:bg-indigo-700 text-brand-black px-6 py-2.5 rounded-xl font-medium transition-colors">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>

          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 rounded-2xl border border-gray-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-brand-black">Fee Defaulters List</h2>
            <p className="text-gray-600 mt-2 text-sm">
              List of all students with outstanding dues across all grades for targeted follow-up.
            </p>
            <button className="mt-6 inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-brand-black px-6 py-2.5 rounded-xl font-medium transition-colors">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
