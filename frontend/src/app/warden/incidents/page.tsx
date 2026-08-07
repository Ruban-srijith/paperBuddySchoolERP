"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AlertTriangle, Plus, X } from "lucide-react";

export default function WardenIncidents() {
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  return (
    <ProtectedRoute allowedRoles={['warden', 'super_admin', 'admin', 'principal']}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-rose-400" />
              Incident Reports
            </h1>
            <p className="text-gray-400 mt-2">Log and track disciplinary, health, or maintenance issues.</p>
          </div>
          <button 
            onClick={() => setShowIncidentModal(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Log Incident
          </button>
        </header>

        <div className="glass-panel p-6 rounded-2xl border border-gray-800 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400 min-w-max">
            <thead className="bg-gray-900/80 text-gray-300 uppercase font-medium border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-center">Severity</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 font-bold text-white">Oct 12, 2026</td>
                <td className="px-6 py-4 text-fuchsia-400 font-bold">Discipline</td>
                <td className="px-6 py-4">Noise complaint after lights out in Room 101. Warning issued.</td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Medium</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">Resolved</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 font-bold text-white">Oct 12, 2026</td>
                <td className="px-6 py-4 text-cyan-400 font-bold">Maintenance</td>
                <td className="px-6 py-4">Water leakage in Block B common bathroom.</td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">High</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Open</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Log Incident Modal */}
        {showIncidentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Log Incident</h3>
                <button onClick={() => setShowIncidentModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                  <select className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-rose-500">
                    <option>Disciplinary</option>
                    <option>Health/Medical</option>
                    <option>Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Severity</label>
                  <select className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-rose-500">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                  <textarea rows={3} className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-rose-500" placeholder="Describe the incident..."></textarea>
                </div>
              </div>
              <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
                <button onClick={() => setShowIncidentModal(false)} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={() => setShowIncidentModal(false)} className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg transition-colors">Save Log</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
