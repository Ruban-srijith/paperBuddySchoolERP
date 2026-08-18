"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { BookCopy, Plus, Search, X } from "lucide-react";

export default function LibrarianInventory() {
  const [showAddBook, setShowAddBook] = useState(false);
  return (
    <ProtectedRoute allowedRoles={['librarian', 'super_admin', 'principal']}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
              <BookCopy className="w-8 h-8 text-brand-blue" />
              Book Inventory
            </h1>
            <p className="text-gray-600 mt-2">Manage the complete catalog of physical and digital books.</p>
          </div>
          <button 
            onClick={() => setShowAddBook(true)}
            className="bg-brand-blue hover:bg-indigo-700 text-brand-black px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Book
          </button>
        </header>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search by Title, Author, or ISBN..." 
                className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <select className="w-full md:w-auto bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500">
              <option>All Categories</option>
              <option>Science</option>
              <option>Fiction</option>
              <option>History</option>
              <option>Reference</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 min-w-max">
              <thead className="bg-gray-100 text-gray-700 uppercase font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">Total Copies</th>
                  <th className="px-6 py-4 text-center">Available</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                <tr className="hover:bg-gray-100/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-brand-black">Advanced Physics Vol 2</div>
                    <div className="text-xs text-gray-500">ISBN: 978-0134093413</div>
                  </td>
                  <td className="px-6 py-4">H.C. Verma</td>
                  <td className="px-6 py-4">Science</td>
                  <td className="px-6 py-4 text-center font-bold text-gray-700">12</td>
                  <td className="px-6 py-4 text-center font-bold text-amber-400">5</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">High Demand</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-100/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-brand-black">To Kill a Mockingbird</div>
                    <div className="text-xs text-gray-500">ISBN: 978-0060935467</div>
                  </td>
                  <td className="px-6 py-4">Harper Lee</td>
                  <td className="px-6 py-4">Fiction</td>
                  <td className="px-6 py-4 text-center font-bold text-gray-700">8</td>
                  <td className="px-6 py-4 text-center font-bold text-emerald-600">8</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Available</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Book Modal */}
        {showAddBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-black">Add New Book</h3>
                <button onClick={() => setShowAddBook(false)} className="text-gray-600 hover:text-brand-black transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Book Title</label>
                  <input type="text" className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500" placeholder="e.g. Advanced Physics" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Author</label>
                  <input type="text" className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500" placeholder="Author name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">ISBN</label>
                    <input type="text" className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500" placeholder="ISBN-13" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Total Copies</label>
                    <input type="number" defaultValue="1" min="1" className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                  <select className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500">
                    <option>Science</option>
                    <option>Fiction</option>
                    <option>History</option>
                    <option>Reference</option>
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50/50 flex justify-end gap-3">
                <button onClick={() => setShowAddBook(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:text-brand-black transition-colors">Cancel</button>
                <button onClick={() => setShowAddBook(false)} className="bg-brand-blue hover:bg-indigo-700 text-brand-black px-4 py-2 rounded-lg transition-colors">Save Book</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
