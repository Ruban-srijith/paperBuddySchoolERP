"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { PieChart, Plus, Download } from "lucide-react";

export default function BudgetsPortal() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'principal', 'finance']}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
              <PieChart className="w-8 h-8 text-brand-blue" />
              Department Budgets
            </h1>
            <p className="text-gray-600 mt-2">Manage budget allocations across Academics, Events, IT, and Infrastructure.</p>
          </div>
          <button className="bg-brand-blue hover:bg-indigo-700 text-brand-black px-4 py-2 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Budget
          </button>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
            <h3 className="text-gray-600 font-medium">Academics</h3>
            <div className="mt-2 text-2xl font-bold text-brand-black">₹10.0M <span className="text-sm font-normal text-gray-500">Allocated</span></div>
            <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
              <div className="bg-indigo-400 h-2 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <div className="mt-2 text-xs text-gray-600 text-right">45% Utilized</div>
          </div>
          
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
            <h3 className="text-gray-600 font-medium">Infrastructure & Maintenance</h3>
            <div className="mt-2 text-2xl font-bold text-brand-black">₹15.0M <span className="text-sm font-normal text-gray-500">Allocated</span></div>
            <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
              <div className="bg-rose-400 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <div className="mt-2 text-xs text-rose-400 text-right font-bold">85% Utilized (High)</div>
          </div>

          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
            <h3 className="text-gray-600 font-medium">Events & Sports</h3>
            <div className="mt-2 text-2xl font-bold text-brand-black">₹3.0M <span className="text-sm font-normal text-gray-500">Allocated</span></div>
            <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
              <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '15%' }}></div>
            </div>
            <div className="mt-2 text-xs text-gray-600 text-right">15% Utilized</div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
