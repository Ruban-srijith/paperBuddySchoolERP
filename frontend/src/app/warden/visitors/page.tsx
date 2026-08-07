"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Users, LogIn, LogOut } from "lucide-react";

export default function WardenVisitors() {
  return (
    <ProtectedRoute allowedRoles={['warden', 'super_admin', 'admin', 'principal']}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-cyan-400" />
              Digital Visitor Logbook
            </h1>
            <p className="text-gray-400 mt-2">Track parents and guests entering the hostel premises.</p>
          </div>
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
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
      </div>
    </ProtectedRoute>
  );
}
