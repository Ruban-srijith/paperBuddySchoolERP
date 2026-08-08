"use client";

import { useEffect, useState } from "react";
import { Bus, MapPin, Users, LayoutDashboard, AlertTriangle } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";

export default function TransportDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    total_vehicles: 0,
    active_vehicles: 0,
    total_routes: 0,
    total_staff: 0
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get("/transport/dashboard-stats");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    }
    fetchStats();
  }, []);

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight">
            Transport Overview
          </h1>
          <p className="text-xs text-gray-600">
            High-level metrics for school fleet and routes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total_vehicles}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Active Vehicles</p>
              <p className="text-2xl font-bold text-gray-800">{stats.active_vehicles}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Routes</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total_routes}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-rose-50 text-rose-500 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Transport Staff</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total_staff}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 text-center flex flex-col items-center mt-6">
           <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
           <h3 className="text-lg font-semibold text-gray-800">Live Tracking is Offline</h3>
           <p className="text-sm text-gray-500 mt-2">The core CRUD modules are ready. GPS Live Tracking integration will be available in Phase 2.</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
