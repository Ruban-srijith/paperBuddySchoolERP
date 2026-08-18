"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { MonitorSmartphone, ExternalLink, Plus, Search, X } from "lucide-react";

export default function LibrarianDigital() {
  const [showAddModal, setShowAddModal] = useState(false);
  return (
    <ProtectedRoute allowedRoles={['librarian', 'super_admin', 'principal']}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
              <MonitorSmartphone className="w-8 h-8 text-violet-400" />
              Digital Library Resources
            </h1>
            <p className="text-gray-600 mt-2">Manage e-books, journal subscriptions, and online learning materials.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-violet-600 hover:bg-violet-700 text-brand-black px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Resource
          </button>
        </header>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-violet-500"
              />
            </div>
            <select className="w-full md:w-auto bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-violet-500">
              <option>All Types</option>
              <option>E-Book</option>
              <option>Journal</option>
              <option>Video Course</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 min-w-max">
              <thead className="bg-gray-100 text-gray-700 uppercase font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Resource Title</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-center">Total Accesses</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr className="hover:bg-gray-100/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-brand-black">Nature Science Journal (Annual Subs)</div>
                    <div className="text-xs text-gray-500">Provided by Nature Publishing</div>
                  </td>
                  <td className="px-6 py-4 text-violet-400 font-medium">Journal</td>
                  <td className="px-6 py-4 text-center font-bold text-brand-black">1,402</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Active</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-gray-600 hover:text-brand-black flex items-center gap-2 text-xs font-bold transition-colors">
                      Open <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-100/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-brand-black">Python for Data Science (Video Series)</div>
                    <div className="text-xs text-gray-500">Coursera for Campus</div>
                  </td>
                  <td className="px-6 py-4 text-sky-400 font-medium">Video Course</td>
                  <td className="px-6 py-4 text-center font-bold text-brand-black">845</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Active</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-gray-600 hover:text-brand-black flex items-center gap-2 text-xs font-bold transition-colors">
                      Open <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Resource Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-black">Add Digital Resource</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-600 hover:text-brand-black transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Resource Title</label>
                  <input type="text" className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-violet-500" placeholder="e.g. Science Journal" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Resource URL</label>
                  <input type="url" className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-violet-500" placeholder="https://" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Category / Type</label>
                  <select className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-violet-500">
                    <option>E-Book</option>
                    <option>Journal</option>
                    <option>Video Course</option>
                    <option>Database</option>
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50/50 flex justify-end gap-3">
                <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:text-brand-black transition-colors">Cancel</button>
                <button onClick={() => setShowAddModal(false)} className="bg-violet-600 hover:bg-violet-700 text-brand-black px-4 py-2 rounded-lg transition-colors">Add Resource</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
