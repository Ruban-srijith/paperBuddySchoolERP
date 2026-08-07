"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Users, LogIn, LogOut, X } from "lucide-react";

export default function WardenVisitors() {
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  return (
    <ProtectedRoute allowedRoles={['warden', 'super_admin', 'admin', 'principal']}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-cyan-400" />
              Digital Visitor Logbook
            </h1>
            <p className="text-gray-400 mt-2">Track parents and guests entering the hostel premises.</p>
          </div>
          <button 
            onClick={() => setShowVisitorModal(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shrink-0 whitespace-nowrap"
          >
            <LogIn className="w-4 h-4" /> New Entry
          </button>
        </header>

        <div className="glass-panel p-6 rounded-2xl border border-gray-800 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400 min-w-max">
            <thead className="bg-gray-900/80 text-gray-300 uppercase font-medium border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Visitor Name</th>
                <th className="px-6 py-4">Student Visited</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white">Mr. Suresh Sharma</div>
                  <div className="text-xs text-gray-500">Father</div>
                </td>
                <td className="px-6 py-4 font-bold text-cyan-400">Rahul Sharma</td>
                <td className="px-6 py-4">Dropping off winter clothes</td>
                <td className="px-6 py-4 text-emerald-400 font-medium">04:30 PM</td>
                <td className="px-6 py-4">
                  <button className="text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                    <LogOut className="w-3 h-3" /> Mark Out
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-white">Mrs. Kavita Kumar</div>
                  <div className="text-xs text-gray-500">Mother</div>
                </td>
                <td className="px-6 py-4 font-bold text-cyan-400">Amit Kumar</td>
                <td className="px-6 py-4">Taking student for medical checkup</td>
                <td className="px-6 py-4 text-emerald-400 font-medium">02:15 PM</td>
                <td className="px-6 py-4 text-gray-500">03:45 PM</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* New Visitor Entry Modal */}
        {showVisitorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">New Visitor Entry</h3>
                <button onClick={() => setShowVisitorModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Visitor Name</label>
                  <input type="text" className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Relation / Purpose</label>
                  <input type="text" className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500" placeholder="e.g. Father, Delivery" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Student Visiting (Optional)</label>
                  <input type="text" className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500" placeholder="Search student name..." />
                </div>
              </div>
              <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
                <button onClick={() => setShowVisitorModal(false)} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={() => setShowVisitorModal(false)} className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors">Log Entry</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
