"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Home, Users, AlertTriangle, ShieldCheck, TrendingUp, Sparkles, LogOut, ArrowRight } from "lucide-react";
import Tilt3D from "@/components/Tilt3D";

function CornerArchOrnament({ position = "tr" }: { position?: "tr" | "bl" | "br" }) {
  if (position === "tr") {
    return (
      <svg className="corner-arch-tr" viewBox="0 0 100 100" fill="none" stroke="#43634e" strokeWidth="1.5">
        <path d="M 100 0 A 100 100 0 0 0 0 100" />
        <path d="M 100 20 A 80 80 0 0 0 20 100" />
        <path d="M 100 40 A 60 60 0 0 0 40 100" />
        <path d="M 100 60 A 40 40 0 0 0 60 100" />
      </svg>
    );
  }
  return (
    <svg className="corner-arch-bl" viewBox="0 0 100 100" fill="none" stroke="#43634e" strokeWidth="1.5">
      <path d="M 0 100 A 100 100 0 0 1 100 0" />
      <path d="M 0 80 A 80 80 0 0 1 80 0" />
      <path d="M 0 60 A 60 60 0 0 1 60 0" />
      <path d="M 0 40 A 40 40 0 0 1 40 0" />
    </svg>
  );
}

export default function WardenDashboard() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'principal', 'warden']}>
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        <header className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-[#f4f0e6] font-syne flex items-center gap-3">
              <Home className="w-8 h-8 text-[#e5c158]" />
              Warden Command Center
            </h1>
            <p className="text-[#a3c9b0] mt-1 font-medium">AI-Powered Hostel Management & Student Welfare</p>
          </div>
        </header>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Tilt3D>
            <div className="glass-emerald-tile p-5 rounded-[24px]">
              <CornerArchOrnament position="tr" />
              <div className="text-[#a3c9b0] text-xs font-semibold uppercase tracking-wider mb-1 relative z-10">Total Boarders</div>
              <div className="text-3xl font-extrabold text-[#f4f0e6] font-syne relative z-10">450</div>
              <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-semibold relative z-10"><TrendingUp className="w-3.5 h-3.5" /> 100% Occupancy</div>
            </div>
          </Tilt3D>

          <Tilt3D>
            <div className="glass-emerald-tile p-5 rounded-[24px]">
              <CornerArchOrnament position="bl" />
              <div className="text-[#a3c9b0] text-xs font-semibold uppercase tracking-wider mb-1 relative z-10">Present Today</div>
              <div className="text-3xl font-extrabold text-emerald-400 font-syne relative z-10">428</div>
              <div className="text-xs text-rose-300 mt-2 font-medium relative z-10">22 On Approved Leave</div>
            </div>
          </Tilt3D>

          <Tilt3D>
            <div className="glass-emerald-tile p-5 rounded-[24px]">
              <CornerArchOrnament position="tr" />
              <div className="text-[#a3c9b0] text-xs font-semibold uppercase tracking-wider mb-1 relative z-10">Pending Outpasses</div>
              <div className="text-3xl font-extrabold text-[#e5c158] font-syne relative z-10">12</div>
              <div className="text-xs text-[#a3c9b0] mt-2 font-medium relative z-10">Requires Approval</div>
            </div>
          </Tilt3D>

          <Tilt3D>
            <div className="glass-emerald-tile p-5 rounded-[24px] border-rose-500/40">
              <CornerArchOrnament position="bl" />
              <div className="text-rose-300 text-xs font-bold uppercase tracking-wider mb-1 relative z-10">Active Incidents</div>
              <div className="text-3xl font-extrabold text-rose-400 font-syne relative z-10">3</div>
              <div className="text-xs text-rose-400 mt-2 flex items-center gap-1 font-bold relative z-10"><AlertTriangle className="w-3.5 h-3.5" /> Action Required</div>
            </div>
          </Tilt3D>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          
          {/* AI Insights Panel */}
          <Tilt3D className="lg:col-span-2 rounded-[24px]">
            <div className="glass-emerald-tile p-6 rounded-[24px] relative overflow-hidden h-full">
              <CornerArchOrnament position="tr" />
              <div className="absolute top-0 right-0 p-4 opacity-15">
                <Sparkles className="w-24 h-24 text-[#e5c158]" />
              </div>
              <h2 className="text-xl font-bold text-[#e5c158] font-syne flex items-center gap-2 mb-6 relative z-10">
                <Sparkles className="w-5 h-5 text-[#e5c158]" />
                AI Copilot Insights
              </h2>
              
              <div className="space-y-4 relative z-10">
                <div className="glass-box p-4 rounded-xl flex gap-4 border border-[#e5c158]/30">
                  <div className="bg-[#e5c158]/20 p-2.5 rounded-lg shrink-0 h-fit border border-[#e5c158]/40">
                    <ShieldCheck className="w-5 h-5 text-[#e5c158]" />
                  </div>
                  <div>
                    <h3 className="text-[#f4f0e6] font-bold font-syne text-base">Welfare Risk Detected</h3>
                    <p className="text-sm text-[#a3c9b0] mt-1">Student 'Rahul Sharma' (Room 102) has requested outpasses 4 weekends in a row and missed 3 morning roll calls. AI suggests a welfare check.</p>
                  </div>
                </div>

                <div className="glass-box p-4 rounded-xl flex gap-4 border border-emerald-500/30">
                  <div className="bg-emerald-500/20 p-2.5 rounded-lg shrink-0 h-fit border border-emerald-500/40">
                    <Home className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-[#f4f0e6] font-bold font-syne text-base">Occupancy Forecast</h3>
                    <p className="text-sm text-[#a3c9b0] mt-1">Based on upcoming admissions, Boys Hostel Block B will exceed capacity by next month. Recommend opening Block C.</p>
                  </div>
                </div>
              </div>
            </div>
          </Tilt3D>

          {/* Quick Actions */}
          <Tilt3D className="rounded-[24px]">
            <div className="glass-emerald-tile p-6 rounded-[24px] h-full">
              <CornerArchOrnament position="bl" />
              <h2 className="text-xl font-bold text-[#f4f0e6] font-syne mb-6 relative z-10">Quick Actions</h2>
              <div className="space-y-3 relative z-10">
                <button className="w-full text-left glass-box hover:bg-emerald-950/40 p-4 rounded-xl transition-all group border border-[#a3c9b0]/20">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[#f4f0e6] font-semibold text-sm">Start Evening Roll Call</span>
                  </div>
                </button>
                <button className="w-full text-left glass-box hover:bg-emerald-950/40 p-4 rounded-xl transition-all group border border-[#a3c9b0]/20">
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5 text-[#e5c158] group-hover:scale-110 transition-transform" />
                    <span className="text-[#f4f0e6] font-semibold text-sm">Review Outpasses (12)</span>
                  </div>
                </button>
                <button className="w-full text-left glass-box hover:bg-emerald-950/40 p-4 rounded-xl transition-all group border border-[#a3c9b0]/20">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[#f4f0e6] font-semibold text-sm">Log New Incident</span>
                  </div>
                </button>
              </div>
            </div>
          </Tilt3D>

        </div>
      </div>
    </ProtectedRoute>
  );
}

