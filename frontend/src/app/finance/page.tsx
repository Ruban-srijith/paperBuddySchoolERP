"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Receipt, Wallet, PieChart } from "lucide-react";

export default function FinanceDashboard() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'admin', 'principal', 'finance']}>
      <div className="space-y-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Wallet className="w-8 h-8 text-green-400" />
            Finance Overview
          </h1>
          <p className="text-gray-400 mt-2">Manage fee collections, staff payroll, and track expenses.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              Fee Collection
            </h3>
            <p className="text-gray-400 text-sm">Monitor student dues and process tuition payments.</p>
          </div>
          
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-teal-400" />
              Staff Payroll
            </h3>
            <p className="text-gray-400 text-sm">Process monthly salaries and generate digital payslips.</p>
          </div>
          
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-400" />
              Financial Reports
            </h3>
            <p className="text-gray-400 text-sm">Generate balance sheets and income statements.</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
