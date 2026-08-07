"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Library, BookOpen, Clock, AlertTriangle, Sparkles, LogIn, LineChart, TrendingUp } from "lucide-react";

export default function LibrarianDashboard() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'admin', 'principal', 'librarian']}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Library className="w-8 h-8 text-sky-400" />
              Librarian Command Center
            </h1>
            <p className="text-gray-400 mt-2">AI-Powered Central Library Intelligence</p>
          </div>
        </header>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-gray-800">
            <div className="text-gray-400 text-sm font-medium mb-1">Total Books</div>
            <div className="text-3xl font-bold text-white">24,512</div>
            <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +120 this month</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-gray-800">
            <div className="text-gray-400 text-sm font-medium mb-1">Currently Issued</div>
            <div className="text-3xl font-bold text-indigo-400">1,245</div>
            <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">5% of total catalog</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-rose-900/50 bg-rose-900/10">
            <div className="text-rose-400 text-sm font-medium mb-1">Overdue Books</div>
            <div className="text-3xl font-bold text-white">42</div>
            <div className="text-xs text-rose-300 mt-2 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Fines accruing</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-gray-800">
            <div className="text-gray-400 text-sm font-medium mb-1">Digital Accesses (30d)</div>
            <div className="text-3xl font-bold text-sky-400">8,904</div>
            <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +15% vs last month</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          
          {/* AI Insights Panel */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="w-24 h-24 text-sky-400" />
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-sky-400" />
              AI Copilot Insights
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 flex gap-4">
                <div className="bg-amber-500/20 p-2 rounded-lg shrink-0 h-fit">
                  <LineChart className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Book Demand Prediction</h3>
                  <p className="text-sm text-gray-400 mt-1">Based on upcoming Physics exams for Grade 12, predict high demand for "Advanced Physics Vol 2". Currently only 5 copies available. Recommend recalling overdue copies.</p>
                </div>
              </div>

              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 flex gap-4">
                <div className="bg-sky-500/20 p-2 rounded-lg shrink-0 h-fit">
                  <BookOpen className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Reading Habit Analysis</h3>
                  <p className="text-sm text-gray-400 mt-1">Grade 8 students are showing a 40% increase in checking out Sci-Fi fiction. Consider highlighting these books in the "New Arrivals" section to boost engagement.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700 p-4 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <LogIn className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-300 font-medium">Issue Book</span>
                </div>
              </button>
              <button className="w-full text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700 p-4 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-300 font-medium">Add to Catalog</span>
                </div>
              </button>
              <button className="w-full text-left bg-gray-800/50 hover:bg-gray-800 border border-gray-700 p-4 rounded-xl transition-colors group">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-300 font-medium">Send Overdue Reminders (42)</span>
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
