"use client";

import { useEffect, useState } from "react";
import { UserPlus, Download } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface Allocation {
  id: string;
  student_id: string;
  stop_id: string;
  status: string;
}

export default function StudentAllocationsPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAllocation, setNewAllocation] = useState({
    student_id: "",
    stop_id: ""
  });

  useEffect(() => {
    fetchAllocations();
  }, []);

  async function fetchAllocations() {
    try {
      const res = await api.get("/transport/allocations");
      setAllocations(res.data);
    } catch (err) {
      console.error("Failed to fetch allocations", err);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/transport/allocate-student", newAllocation);
      setIsModalOpen(false);
      setNewAllocation({ student_id: "", stop_id: "" });
      fetchAllocations();
    } catch (err) {
      console.error("Failed to allocate student", err);
    }
  };

  const handlePrintPass = (allocation: Allocation) => {
    // In a real app, this would open a printable pass template
    // For now, we trigger the browser print dialog
    window.print();
  };

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-brand-black tracking-tight">
              Student Transport Allocation
            </h1>
            <p className="text-xs text-gray-600">
              Assign students to routes and manage bus passes.
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center space-x-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
              <Download className="w-4 h-4" />
              <span>Export List</span>
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Allocate Student</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Stop ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {allocations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No active student allocations.
                  </td>
                </tr>
              ) : (
                allocations.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-medium text-gray-900">{a.student_id}</td>
                    <td className="px-6 py-4 text-gray-600">{a.stop_id}</td>
                    <td className="px-6 py-4">
                      {a.status === 'active' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">Active</span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-medium">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 space-x-3">
                      <button onClick={() => handlePrintPass(a)} className="text-indigo-600 hover:text-indigo-900 font-medium text-xs">Print Pass</button>
                      <button onClick={() => alert("Edit allocation functionality coming soon")} className="text-gray-500 hover:text-gray-700 font-medium text-xs">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Allocate Student</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Student ID</label>
                  <input 
                    type="text" 
                    required 
                    value={newAllocation.student_id}
                    onChange={e => setNewAllocation({...newAllocation, student_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. STU12345"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Stop ID</label>
                  <input 
                    type="text" 
                    required 
                    value={newAllocation.stop_id}
                    onChange={e => setNewAllocation({...newAllocation, stop_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. STOP-10"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                  >
                    Allocate Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
