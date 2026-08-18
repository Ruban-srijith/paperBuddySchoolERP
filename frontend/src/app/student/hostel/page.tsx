"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { LogOut, AlertCircle, Clock } from "lucide-react";

export default function StudentHostelPortal() {
  return (
    <ProtectedRoute allowedRoles={['student', 'super_admin', 'principal']}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
            <LogOut className="w-8 h-8 text-brand-blue" />
            Hostel Services
          </h1>
          <p className="text-gray-600 mt-2">Apply for weekend outpasses and track status.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
            <h2 className="text-xl font-bold text-brand-black mb-4">Apply for Outpass</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Departure</label>
                <input type="datetime-local" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-brand-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Return</label>
                <input type="datetime-local" className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-brand-black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Reason</label>
                <textarea className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-brand-black h-24" placeholder="Going home for the weekend..."></textarea>
              </div>
              <button type="button" className="w-full bg-brand-blue hover:bg-indigo-700 text-brand-black font-bold py-3 rounded-xl">
                Submit Request
              </button>
            </form>
          </div>

          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
            <h2 className="text-xl font-bold text-brand-black mb-4">My Requests</h2>
            <div className="space-y-3">
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-brand-black">Oct 12 - Oct 14</span>
                  <span className="px-2 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs rounded-md">Pending</span>
                </div>
                <p className="text-xs text-gray-600">Family function</p>
              </div>
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-brand-black">Sep 20 - Sep 22</span>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs rounded-md">Approved</span>
                </div>
                <p className="text-xs text-gray-600">Weekend trip</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
