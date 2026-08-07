"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LogOut, CheckCircle2, XCircle } from "lucide-react";

export default function OutpassApproval() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAction = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <ProtectedRoute allowedRoles={['warden', 'super_admin', 'admin', 'principal']}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
            <LogOut className="w-8 h-8 text-rose-400" />
            Outpass Approval System
          </h1>
          <p className="text-gray-600 mt-2">Review and approve weekend leave and overnight outpass requests.</p>
        </header>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 min-w-max">
            <thead className="bg-gray-100 text-gray-700 uppercase font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr className="hover:bg-gray-100/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-brand-black">Rahul Sharma</div>
                  <div className="text-xs text-gray-500">Block A - Room 101</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-700">Oct 12, 5:00 PM</div>
                  <div className="text-xs text-gray-500">to Oct 14, 8:00 AM</div>
                </td>
                <td className="px-6 py-4">Going home for family function</td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleAction("Outpass Approved")} className="text-emerald-600 hover:text-emerald-300 p-1 border border-emerald-500/30 rounded-lg bg-emerald-500/10 transition-colors" title="Approve">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleAction("Outpass Rejected")} className="text-rose-400 hover:text-rose-300 p-1 border border-rose-500/30 rounded-lg bg-rose-500/10 transition-colors" title="Reject">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-gray-100/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-brand-black">Amit Kumar</div>
                  <div className="text-xs text-gray-500">Block A - Room 101</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-700">Oct 10, 6:00 PM</div>
                  <div className="text-xs text-gray-500">to Oct 11, 8:00 AM</div>
                </td>
                <td className="px-6 py-4">Medical checkup</td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Approved</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-gray-600">Processed</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {toastMessage && (
          <div className="fixed bottom-4 right-4 bg-gray-100 border border-gray-200 text-brand-black px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            {toastMessage}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
