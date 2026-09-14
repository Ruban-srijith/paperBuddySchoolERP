"use client";

import { useState, useEffect } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import api from '@/lib/api';
import { useToast } from '@/components/Toast';

export default function ApprovalsPortal() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/finance/core/requests');
      setRequests(response.data);
    } catch (err) {
      toast.error("Failed to load requests", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, status: string) => {
    try {
      await api.put(`/finance/core/requests/${id}/approve`, { status });
      toast.success(`Request ${status.replace(/_/g, ' ')}`);
      fetchRequests();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'principal', 'finance']}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            Approval Center
          </h1>
          <p className="text-gray-600 mt-2">Review and approve budget and funding requests from all departments.</p>
        </header>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-100 text-gray-700 uppercase font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Requester</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8">Loading...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8">No requests found.</td></tr>
                ) : (
                  requests.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-100/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-brand-black">{r.requester_name}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-brand-black">{r.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{r.description}</div>
                      </td>
                      <td className="px-6 py-4">{r.department_name}</td>
                      <td className="px-6 py-4 font-bold text-amber-400">₹{parseFloat(r.amount).toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium border ${
                          r.status.includes('approved') ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 
                          r.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                          'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {r.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {r.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(r.id, 'approved_by_finance')} className="text-emerald-600 hover:text-emerald-300"><CheckCircle2 className="w-5 h-5 inline" /></button>
                            <button onClick={() => handleApprove(r.id, 'rejected')} className="text-rose-400 hover:text-rose-300"><XCircle className="w-5 h-5 inline" /></button>
                          </>
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
