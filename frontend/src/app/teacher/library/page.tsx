"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Library, Plus, Search, FileSearch } from "lucide-react";

export default function TeacherLibrary() {
  return (
    <ProtectedRoute allowedRoles={['teacher', 'super_admin', 'principal']}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
              <Library className="w-8 h-8 text-sky-400" />
              Teacher Library Portal
            </h1>
            <p className="text-gray-600 mt-2">Request new books for your subjects and recommend readings for your students.</p>
          </div>
          <button className="bg-sky-600 hover:bg-sky-700 text-brand-black px-4 py-2 rounded-xl flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Request New Book
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* My Requests */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
            <h2 className="text-xl font-bold text-brand-black flex items-center gap-2 mb-6">
              <FileSearch className="w-5 h-5 text-pink-400" />
              My Book Requests
            </h2>
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-brand-black">Quantum Computing Since Democritus</h3>
                    <p className="text-sm text-gray-600">Scott Aaronson</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Requested on: Oct 01, 2026</p>
              </div>
            </div>
          </div>

          {/* Catalog Search & Recommendations */}
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
            <h2 className="text-xl font-bold text-brand-black flex items-center gap-2 mb-6">
              <Search className="w-5 h-5 text-emerald-600" />
              Find & Recommend
            </h2>
            <div className="relative mb-6">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search catalog to recommend..." 
                className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="text-center py-8 text-gray-500 text-sm">
              Search for a book to add to your class reading list.
            </div>
          </div>

        </div>
      </div>
    </ProtectedRoute>
  );
}
