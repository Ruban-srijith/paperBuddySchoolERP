"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Receipt, FileText } from "lucide-react";

export default function ExpensesPortal() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'principal', 'finance']}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
            <Receipt className="w-8 h-8 text-rose-400" />
            Expenses & Procurement
          </h1>
          <p className="text-gray-600 mt-2">Track daily school expenses and manage vendor invoices.</p>
        </header>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-12 rounded-2xl border border-gray-200 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-brand-black">Expense Ledger</h2>
          <p className="text-gray-600 mt-2 max-w-md mx-auto">
            The advanced procurement and expense tracking ledger is scheduled for the next phase of development. 
            You will be able to log petty cash, upload vendor invoices, and track school maintenance costs here.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
