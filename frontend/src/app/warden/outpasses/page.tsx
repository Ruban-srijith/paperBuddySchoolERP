"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LogOut, CheckCircle2, XCircle } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";
import dayjs from "dayjs";

export default function OutpassApproval() {
  const [outpasses, setOutpasses] = useState<any[]>([]);
  const { toast } = useToast();

  const fetchOutpasses = async () => {
    try {
      const res = await api.get('/warden/outpasses');
      setOutpasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOutpasses();
  }, []);

  const handleAction = async (id: string, status: string) => {
    try {
      await api.put(`/warden/outpasses/${id}/status`, { status });
      toast.success(`Outpass ${status} successfully`);
      fetchOutpasses();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update outpass");
    }
  };

  return (
    <ProtectedRoute allowedRoles={['warden', 'super_admin', 'principal']}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
            <LogOut className="w-8 h-8 text-rose-400" />
            Outpass Approval System
          </h1>
          <p className="text-gray-600 mt-2">Review and approve weekend leave and overnight outpass requests.</p>
        </header>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 min-w-max">
            <thead className="bg-gray-100 text-gray-700 uppercase font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {outpasses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No outpass requests found
                  </td>
                </tr>
              ) : (
                outpasses.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-100/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-brand-black">{o.student_name}</div>
                      <div className="text-xs text-gray-500">{o.room_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-700">{dayjs(o.departure_time).format('MMM DD, hh:mm A')}</div>
                      <div className="text-xs text-gray-500">to {dayjs(o.expected_return).format('MMM DD, hh:mm A')}</div>
                    </td>
                    <td className="px-6 py-4">{o.reason}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        o.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                        o.status === 'rejected' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {o.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleAction(o.id, "approved")} className="text-emerald-600 hover:text-emerald-300 p-1 border border-emerald-500/30 rounded-lg bg-emerald-500/10 transition-colors" title="Approve">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleAction(o.id, "rejected")} className="text-rose-400 hover:text-rose-300 p-1 border border-rose-500/30 rounded-lg bg-rose-500/10 transition-colors" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
}
