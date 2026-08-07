"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Library, BookOpen, Clock, Search, BookMarked, MonitorSmartphone } from "lucide-react";

export default function StudentLibrary() {
  return (
    <ProtectedRoute allowedRoles={['student', 'super_admin', 'admin']}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Library className="w-8 h-8 text-sky-400" />
            My Library
          </h1>
          <p className="text-gray-400 mt-2">Search the catalog, view your issued books, and access digital resources.</p>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass-panel p-5 rounded-2xl border border-gray-800">
            <div className="text-gray-400 text-sm font-medium mb-1">Currently Issued</div>
            <div className="text-3xl font-bold text-emerald-400">2</div>
            <div className="text-xs text-gray-500 mt-2">Max allowed: 4</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-rose-900/50 bg-rose-900/10">
            <div className="text-rose-400 text-sm font-medium mb-1">Total Fines</div>
            <div className="text-3xl font-bold text-white">₹0.00</div>
            <div className="text-xs text-rose-300 mt-2">No pending dues</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-gray-800">
            <div className="text-gray-400 text-sm font-medium mb-1">Books Read (This Year)</div>
            <div className="text-3xl font-bold text-indigo-400">14</div>
            <div className="text-xs text-gray-500 mt-2">Top 10% in Grade 12</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Issued Books */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <BookMarked className="w-5 h-5 text-emerald-400" />
              Currently Issued
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white">Advanced Physics Vol 2</h3>
                    <p className="text-sm text-gray-400">H.C. Verma</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Issued</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">Due: <span className="text-white font-medium">Oct 25, 2026</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Search */}
          <div className="glass-panel p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Search className="w-5 h-5 text-sky-400" />
              Catalog Search
            </h2>
            <div className="relative mb-6">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search for books, topics, or authors..." 
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Suggested for you</h3>
              <div className="flex items-center justify-between p-3 hover:bg-gray-800/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-700">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-white">Calculus Early Transcendentals</div>
                    <div className="text-xs text-gray-500">Available: 3 copies</div>
                  </div>
                </div>
                <button className="text-xs font-medium text-sky-400 hover:text-sky-300">Reserve</button>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Resources */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <MonitorSmartphone className="w-5 h-5 text-violet-400" />
            Digital Learning Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 hover:border-violet-500/50 cursor-pointer transition-colors">
              <h3 className="font-bold text-white">Coursera: Python Basics</h3>
              <p className="text-sm text-gray-400 mt-1">Free access via campus license</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 hover:border-violet-500/50 cursor-pointer transition-colors">
              <h3 className="font-bold text-white">JSTOR Archive Access</h3>
              <p className="text-sm text-gray-400 mt-1">Research papers and journals</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
