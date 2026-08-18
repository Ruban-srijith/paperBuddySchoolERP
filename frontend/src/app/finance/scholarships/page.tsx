"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { GraduationCap, Plus } from "lucide-react";

export default function ScholarshipsPortal() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'principal', 'finance']}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-violet-400" />
              Financial Aid & Scholarships
            </h1>
            <p className="text-gray-600 mt-2">Manage student fee waivers and merit scholarships.</p>
          </div>
          <button className="bg-violet-600 hover:bg-violet-700 text-brand-black px-4 py-2 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> Grant Aid
          </button>
        </header>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-gray-700 uppercase font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Aid Type</th>
                <th className="px-6 py-4">Discount Applied</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr className="hover:bg-gray-100/30 transition-colors">
                <td className="px-6 py-4 font-bold text-brand-black">Aditya Sharma</td>
                <td className="px-6 py-4">State Merit Scholarship</td>
                <td className="px-6 py-4 font-bold text-violet-400">₹15,000</td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Active</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
