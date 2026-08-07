"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Utensils, Calendar, Clock, CheckCircle2 } from "lucide-react";

export default function WardenMess() {
  return (
    <ProtectedRoute allowedRoles={['warden', 'super_admin', 'admin', 'principal']}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Utensils className="w-8 h-8 text-orange-400" />
            Mess & Cafeteria Management
          </h1>
          <p className="text-gray-400 mt-2">Manage daily menus, track meal counts, and monitor food quality.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Menu */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-400" />
                Today's Menu (Oct 12, 2026)
              </h2>
              <button className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 transition-colors">
                Edit Menu
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 flex gap-4 items-start">
                <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/20 text-orange-400 font-bold text-center w-24 shrink-0">
                  <div className="text-xs uppercase tracking-wider mb-1 opacity-80">Breakfast</div>
                  <div className="text-sm">07:30 AM</div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Idli, Vada, Sambar</h3>
                  <p className="text-gray-400 text-sm mt-1">Coconut Chutney, Coffee / Milk</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 w-fit px-2 py-1 rounded-md">
                    <CheckCircle2 className="w-3 h-3" /> Served (412 students)
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 flex gap-4 items-start">
                <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/20 text-orange-400 font-bold text-center w-24 shrink-0">
                  <div className="text-xs uppercase tracking-wider mb-1 opacity-80">Lunch</div>
                  <div className="text-sm">12:30 PM</div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Rice, Roti, Dal Makhani</h3>
                  <p className="text-gray-400 text-sm mt-1">Mixed Veg Curry, Salad, Papad</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 w-fit px-2 py-1 rounded-md">
                    <Clock className="w-3 h-3" /> Preparing (Est. 430 students)
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/60 p-4 rounded-xl border border-gray-800 flex gap-4 items-start">
                <div className="bg-orange-500/10 p-3 rounded-xl border border-orange-500/20 text-orange-400 font-bold text-center w-24 shrink-0">
                  <div className="text-xs uppercase tracking-wider mb-1 opacity-80">Dinner</div>
                  <div className="text-sm">08:00 PM</div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Phulka, Paneer Butter Masala</h3>
                  <p className="text-gray-400 text-sm mt-1">Jeera Rice, Gulab Jamun</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 bg-gray-800 w-fit px-2 py-1 rounded-md">
                    Scheduled
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mess Stats & Actions */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Meal Statistics</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Breakfast Turnout</span>
                    <span className="text-white font-bold">92%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-orange-400 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Total Food Waste</span>
                    <span className="text-rose-400 font-bold">12 kg</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-rose-400 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4">Inventory Alerts</h2>
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                <div className="font-bold text-rose-400">Low Stock Warning</div>
                <p className="text-sm text-gray-300 mt-1">Rice and Cooking Oil stocks are below 20%.</p>
                <button className="mt-3 text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg transition-colors w-full">
                  Request Supplies from Finance
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
