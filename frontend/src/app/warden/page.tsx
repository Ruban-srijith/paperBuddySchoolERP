"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Home, Users, AlertTriangle, ShieldCheck, TrendingUp, Sparkles, LogOut } from "lucide-react";

export default function WardenDashboard() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'principal', 'warden']}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
              <Home className="w-8 h-8 text-fuchsia-400" />
              Warden Command Center
            </h1>
            <p className="text-gray-600 mt-2">AI-Powered Hostel Management & Student Welfare</p>
          </div>
        </header>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200">
            <div className="text-gray-600 text-sm font-medium mb-1">Total Boarders</div>
            <div className="text-3xl font-bold text-brand-black">450</div>
            <div className="text-xs text-emerald-600 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> 100% Occupancy</div>
          </div>
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200">
            <div className="text-gray-600 text-sm font-medium mb-1">Present Today</div>
            <div className="text-3xl font-bold text-emerald-600">428</div>
            <div className="text-xs text-rose-400 mt-2 flex items-center gap-1">22 On Approved Leave</div>
          </div>
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200">
            <div className="text-gray-600 text-sm font-medium mb-1">Pending Outpasses</div>
            <div className="text-3xl font-bold text-amber-400">12</div>
            <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">Requires Approval</div>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/30 rounded-[24px] border border-rose-200 dark:border-rose-800/50 shadow-sm p-5 transition-colors">
            <div className="text-rose-700 dark:text-rose-300 text-sm font-semibold mb-1">Active Incidents</div>
            <div className="text-3xl font-bold text-rose-900 dark:text-rose-100">3</div>
            <div className="text-xs text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" /> Action Required</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          
          {/* AI Insights Panel */}
          <div className="lg:col-span-2 bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-24 h-24 text-fuchsia-400" />
            </div>
            <h2 className="text-xl font-bold text-brand-black flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-fuchsia-400" />
              AI Copilot Insights
            </h2>
            
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4">
                <div className="bg-amber-500/20 p-2 rounded-lg shrink-0 h-fit">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-brand-black font-medium">Welfare Risk Detected</h3>
                  <p className="text-sm text-gray-600 mt-1">Student 'Rahul Sharma' (Room 102) has requested outpasses 4 weekends in a row and missed 3 morning roll calls. AI suggests a welfare check.</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4">
                <div className="bg-emerald-500/20 p-2 rounded-lg shrink-0 h-fit">
                  <Home className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-brand-black font-medium">Occupancy Forecast</h3>
                  <p className="text-sm text-gray-600 mt-1">Based on upcoming admissions, Boys Hostel Block B will exceed capacity by next month. Recommend opening Block C.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
            <h2 className="text-xl font-bold text-brand-black mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full text-left bg-gray-100/50 hover:bg-gray-100 border border-gray-200 p-4 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-700 font-medium">Start Evening Roll Call</span>
                </div>
              </button>
              <button className="w-full text-left bg-gray-100/50 hover:bg-gray-100 border border-gray-200 p-4 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-700 font-medium">Review Outpasses (12)</span>
                </div>
              </button>
              <button className="w-full text-left bg-gray-100/50 hover:bg-gray-100 border border-gray-200 p-4 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-700 font-medium">Log New Incident</span>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
