"use client";

import { useState, useEffect } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { UsersRound, Bus, Home, Info } from "lucide-react";
import api from '@/lib/api';
import { useToast } from '@/components/Toast';

export default function MyClassFeesPortal() {
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/class-teacher/students/fees');
      setStudents(response.data);
    } catch (err) {
      toast.error("Failed to load class fee data.", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAux = async (studentId: string, currentBus: boolean, currentHostel: boolean, type: 'bus' | 'hostel') => {
    const isBus = type === 'bus' ? !currentBus : currentBus;
    const isHostel = type === 'hostel' ? !currentHostel : currentHostel;

    // Optimistic update
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        return { ...s, is_bus_user: isBus, is_hostel_user: isHostel };
      }
      return s;
    }));

    try {
      await api.put(`/class-teacher/student/${studentId}/aux-services`, {
        is_bus_user: isBus,
        is_hostel_user: isHostel
      });
      toast.success("Auxiliary services updated.", "Success");
      // Refresh to get new fee balances
      fetchStudents();
    } catch (err) {
      toast.error("Failed to update services.", "Error");
      // Revert on error
      fetchStudents();
    }
  };

  return (
    <ProtectedRoute allowedRoles={['teacher', 'super_admin', 'correspondent', 'principal']}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
            <UsersRound className="w-8 h-8 text-cyan-600" />
            Class Fee Management
          </h1>
          <p className="text-gray-600 mt-2">Manage auxiliary services (Bus & Hostel) and view fee status for your assigned class.</p>
        </header>

        <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-cyan-800 dark:text-cyan-300">
            <strong>Note:</strong> Toggling the Bus or Hostel switch will automatically recalculate the student's dues in the Finance portal. 
            Ensure these toggles are accurate for the current term!
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-100 text-gray-700 uppercase font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Admission #</th>
                  <th className="px-6 py-4 text-center">Uses Bus</th>
                  <th className="px-6 py-4 text-center">Uses Hostel</th>
                  <th className="px-6 py-4 text-right">Fee Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading student data...</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No students found. Are you assigned as a Class Teacher?
                    </td>
                  </tr>
                ) : (
                  students.map((s, idx) => (
                    <tr key={idx} className="hover:bg-gray-100/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-brand-black">{s.full_name}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{s.admission_number}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleAux(s.id, s.is_bus_user, s.is_hostel_user, 'bus')}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                            s.is_bus_user 
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                              : 'bg-gray-100 text-gray-500 border border-gray-200 hover:text-brand-black'
                          }`}
                        >
                          <Bus className="w-3.5 h-3.5" />
                          {s.is_bus_user ? 'YES' : 'NO'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleAux(s.id, s.is_bus_user, s.is_hostel_user, 'hostel')}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                            s.is_hostel_user 
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                              : 'bg-gray-100 text-gray-500 border border-gray-200 hover:text-brand-black'
                          }`}
                        >
                          <Home className="w-3.5 h-3.5" />
                          {s.is_hostel_user ? 'YES' : 'NO'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {s.balance > 0 ? (
                          <div className="inline-flex flex-col items-end">
                            <span className="text-rose-400 font-bold">₹{s.balance}</span>
                            <span className="text-[10px] text-gray-500 uppercase">Pending</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                            Clear
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
