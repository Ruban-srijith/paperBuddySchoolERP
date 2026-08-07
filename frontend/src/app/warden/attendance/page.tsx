"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Users, Save } from "lucide-react";

export default function WardenAttendance() {
  return (
    <ProtectedRoute allowedRoles={['warden', 'super_admin', 'admin', 'principal']}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-emerald-400" />
              Hostel Roll Call
            </h1>
            <p className="text-gray-400 mt-2">Log daily evening attendance for boarding students.</p>
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
            <Save className="w-4 h-4" /> Save Attendance
          </button>
        </header>

        <div className="glass-panel p-6 rounded-2xl border border-gray-800 overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
            <select className="bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500">
              <option>Block A (Boys)</option>
              <option>Block B (Boys)</option>
              <option>Block C (Girls)</option>
            </select>
            <div className="text-gray-400 text-sm whitespace-nowrap ml-4">Date: <strong>Oct 12, 2026</strong></div>
          </div>

          <table className="w-full text-left text-sm text-gray-400 min-w-max">
            <thead className="bg-gray-900/80 text-gray-300 uppercase font-medium border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Room</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4 text-center">Present</th>
                <th className="px-6 py-4 text-center">Absent</th>
                <th className="px-6 py-4 text-center">On Leave</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 font-bold text-white">101</td>
                <td className="px-6 py-4">Rahul Sharma</td>
                <td className="px-6 py-4 text-center">
                  <input type="radio" name="att_1" className="w-4 h-4 accent-emerald-500" defaultChecked />
                </td>
                <td className="px-6 py-4 text-center">
                  <input type="radio" name="att_1" className="w-4 h-4 accent-rose-500" />
                </td>
                <td className="px-6 py-4 text-center">
                  <input type="radio" name="att_1" className="w-4 h-4 accent-amber-500" />
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 font-bold text-white">101</td>
                <td className="px-6 py-4">Amit Kumar</td>
                <td className="px-6 py-4 text-center">
                  <input type="radio" name="att_2" className="w-4 h-4 accent-emerald-500" />
                </td>
                <td className="px-6 py-4 text-center">
                  <input type="radio" name="att_2" className="w-4 h-4 accent-rose-500" />
                </td>
                <td className="px-6 py-4 text-center">
                  <input type="radio" name="att_2" className="w-4 h-4 accent-amber-500" defaultChecked />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
