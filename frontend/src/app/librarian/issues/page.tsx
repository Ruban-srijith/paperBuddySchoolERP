"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CheckSquare, LogIn, LogOut, Search, X } from "lucide-react";

export default function LibrarianIssues() {
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  return (
    <ProtectedRoute allowedRoles={['librarian', 'super_admin', 'principal']}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-emerald-600" />
              Book Issues & Returns
            </h1>
            <p className="text-gray-600 mt-2">Track issued books, manage returns, and monitor overdue fines.</p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <button 
              onClick={() => setShowIssueModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-brand-black px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shrink-0 whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" /> Issue Book
            </button>
            <button 
              onClick={() => setShowReturnModal(true)}
              className="bg-gray-100 hover:bg-gray-700 text-brand-black border border-gray-200 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shrink-0 whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" /> Process Return
            </button>
          </div>
        </header>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search by Student ID, Name, or Book..." 
                className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <select className="w-full md:w-auto bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500">
              <option>All Status</option>
              <option>Issued</option>
              <option>Overdue</option>
              <option>Returned</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 min-w-max">
              <thead className="bg-gray-100 text-gray-700 uppercase font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-center">Fine</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr className="hover:bg-gray-100/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-brand-black">Advanced Physics Vol 2</td>
                  <td className="px-6 py-4">
                    <div className="text-gray-700 font-medium">Kishor K</div>
                    <div className="text-xs text-gray-500">Grade 12</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">Sep 28, 2026</td>
                  <td className="px-6 py-4 font-bold text-rose-400">Oct 05, 2026</td>
                  <td className="px-6 py-4 text-center font-bold text-rose-400">₹140.00</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">Overdue (7 days)</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-emerald-600 hover:text-emerald-300 text-xs font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 transition-colors">
                      Return & Pay Fine
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-100/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-brand-black">To Kill a Mockingbird</td>
                  <td className="px-6 py-4">
                    <div className="text-gray-700 font-medium">Rahul Sharma</div>
                    <div className="text-xs text-gray-500">Grade 10</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">Oct 05, 2026</td>
                  <td className="px-6 py-4 text-emerald-600">Oct 19, 2026</td>
                  <td className="px-6 py-4 text-center text-gray-500">-</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Issued</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-gray-600 hover:text-brand-black text-xs font-bold bg-gray-100 px-3 py-1 rounded-full transition-colors">
                      Return Book
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Issue Book Modal */}
        {showIssueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-black">Issue Book</h3>
                <button onClick={() => setShowIssueModal(false)} className="text-gray-600 hover:text-brand-black transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Student ID or Name</label>
                  <input type="text" className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500" placeholder="e.g. STU1234 or John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Book Title or ISBN</label>
                  <input type="text" className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500" placeholder="Scan or type Book ID" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Due Date</label>
                  <input type="date" className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50/50 flex justify-end gap-3">
                <button onClick={() => setShowIssueModal(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:text-brand-black transition-colors">Cancel</button>
                <button onClick={() => setShowIssueModal(false)} className="bg-emerald-600 hover:bg-emerald-700 text-brand-black px-4 py-2 rounded-lg transition-colors">Confirm Issue</button>
              </div>
            </div>
          </div>
        )}

        {/* Process Return Modal */}
        {showReturnModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-black">Process Return</h3>
                <button onClick={() => setShowReturnModal(false)} className="text-gray-600 hover:text-brand-black transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Scan Book or Enter ISBN</label>
                  <input type="text" className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500" placeholder="Enter Book ID" />
                </div>
                <div className="p-4 bg-gray-100/50 rounded-lg border border-gray-200 mt-2">
                  <p className="text-sm text-gray-600 mb-1">Fine Details</p>
                  <div className="flex justify-between items-center">
                    <span className="text-brand-black font-medium">No pending fines</span>
                    <span className="text-emerald-600 font-bold">₹0.00</span>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50/50 flex justify-end gap-3">
                <button onClick={() => setShowReturnModal(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:text-brand-black transition-colors">Cancel</button>
                <button onClick={() => setShowReturnModal(false)} className="bg-gray-100 hover:bg-gray-700 text-brand-black border border-gray-200 px-4 py-2 rounded-lg transition-colors">Process Return</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
