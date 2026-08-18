"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { FileSearch, CheckCircle2, XCircle, Send } from "lucide-react";

export default function LibrarianRequests() {
  return (
    <ProtectedRoute allowedRoles={['librarian', 'super_admin', 'principal']}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
              <FileSearch className="w-8 h-8 text-pink-400" />
              Book Requests & Approvals
            </h1>
            <p className="text-gray-600 mt-2">Manage new book requests from teachers and forward budget requests to Finance.</p>
          </div>
        </header>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 min-w-max">
              <thead className="bg-gray-100 text-gray-700 uppercase font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Title & Author</th>
                  <th className="px-6 py-4">Requested By</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr className="hover:bg-gray-100/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-brand-black">Quantum Computing Since Democritus</div>
                    <div className="text-xs text-gray-500">Scott Aaronson</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-700">Sarah Connor</div>
                    <div className="text-xs text-gray-500">Teacher (Science Dept)</div>
                  </td>
                  <td className="px-6 py-4 truncate max-w-xs">Required for the new Grade 12 Advanced Tech elective course.</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="text-emerald-600 hover:text-emerald-300 p-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20 transition-colors" title="Approve & Order">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button className="text-rose-400 hover:text-rose-300 p-1 bg-rose-500/10 rounded-lg border border-rose-500/20 transition-colors" title="Reject">
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button className="text-cyan-600 hover:text-cyan-300 p-1 bg-cyan-500/10 rounded-lg border border-cyan-500/20 transition-colors" title="Forward to Finance">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-100/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-brand-black">A Brief History of Time</div>
                    <div className="text-xs text-gray-500">Stephen Hawking</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-700">Kishor K</div>
                    <div className="text-xs text-gray-500">Student (Grade 12)</div>
                  </td>
                  <td className="px-6 py-4 truncate max-w-xs">Physics project reference.</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">Sent to Finance</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500">Awaiting Budget</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
