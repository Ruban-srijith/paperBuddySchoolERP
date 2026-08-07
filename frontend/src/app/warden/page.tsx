"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Home, LogOut, Users } from "lucide-react";

export default function WardenDashboard() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'admin', 'principal', 'warden']}>
      <div className="space-y-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Home className="w-8 h-8 text-fuchsia-400" />
            Hostel Management
          </h1>
          <p className="text-gray-400 mt-2">Manage dorm rooms, outpasses, and hostel attendance.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Home className="w-5 h-5 text-amber-400" />
              Room Allocation
            </h3>
            <p className="text-gray-400 text-sm">Assign students to dorm rooms and manage capacity.</p>
          </div>
          
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <LogOut className="w-5 h-5 text-rose-400" />
              Outpass System
            </h3>
            <p className="text-gray-400 text-sm">Review and approve weekend leave requests.</p>
          </div>
          
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              Hostel Roll Call
            </h3>
            <p className="text-gray-400 text-sm">Manage nightly attendance for boarding students.</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
