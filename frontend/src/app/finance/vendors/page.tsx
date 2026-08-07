"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Building2, Plus, Users } from "lucide-react";

export default function VendorsPortal() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'admin', 'principal', 'finance']}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Building2 className="w-8 h-8 text-amber-400" />
              Vendor Management
            </h1>
            <p className="text-gray-400 mt-2">Manage active vendor contracts, IT services, and stationery suppliers.</p>
          </div>
          <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        </header>

        <div className="glass-panel p-6 rounded-2xl border border-gray-800">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-gray-900/80 text-gray-300 uppercase font-medium border-b border-gray-800">
              <tr>
                <th className="px-6 py-4">Vendor Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 font-bold text-white">Dell Technologies India</td>
                <td className="px-6 py-4">IT Services</td>
                <td className="px-6 py-4">enterprise@dell.com</td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active Contract</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4 font-bold text-white">Shree Stationery Mart</td>
                <td className="px-6 py-4">Academics</td>
                <td className="px-6 py-4">+91 9876543210</td>
                <td className="px-6 py-4 text-center">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active Contract</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
