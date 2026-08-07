"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Home, Users, Plus } from "lucide-react";

export default function WardenRooms() {
  return (
    <ProtectedRoute allowedRoles={['warden', 'super_admin', 'admin', 'principal']}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Home className="w-8 h-8 text-amber-400" />
              Room Allocation Matrix
            </h1>
            <p className="text-gray-400 mt-2">Manage hostel blocks, floors, and student room assignments.</p>
          </div>
          <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Add Room
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample Room Cards */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Block A - Room 101</h3>
                <p className="text-sm text-gray-400">Standard Room • Ground Floor</p>
              </div>
              <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md text-xs font-bold">
                2/3 Occupied
              </div>
            </div>
            
            <div className="space-y-3 mt-4">
              <div className="bg-gray-900/50 p-3 rounded-lg flex items-center gap-3 border border-gray-800">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-white">Rahul Sharma (Grade 10)</span>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-lg flex items-center gap-3 border border-gray-800">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-white">Amit Kumar (Grade 10)</span>
              </div>
              <button className="w-full border border-dashed border-gray-600 hover:border-amber-400 text-gray-400 hover:text-amber-400 p-3 rounded-lg transition-colors text-sm flex justify-center items-center gap-2">
                <Plus className="w-4 h-4" /> Allocate Student
              </button>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Block A - Room 102</h3>
                <p className="text-sm text-gray-400">AC Room • Ground Floor</p>
              </div>
              <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-1 rounded-md text-xs font-bold">
                2/2 Full
              </div>
            </div>
            
            <div className="space-y-3 mt-4">
              <div className="bg-gray-900/50 p-3 rounded-lg flex items-center gap-3 border border-gray-800">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-white">Vikram Singh (Grade 12)</span>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-lg flex items-center gap-3 border border-gray-800">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-white">Arjun Das (Grade 12)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
