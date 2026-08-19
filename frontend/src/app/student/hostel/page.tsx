"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LogOut, AlertCircle, Clock } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";
import dayjs from "dayjs";

export default function StudentHostelPortal() {
  const [outpasses, setOutpasses] = useState<any[]>([]);
  const [departure, setDeparture] = useState("");
  const [returnTime, setReturnTime] = useState("");
  const [reason, setReason] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departure || !returnTime || !reason) {
      toast.error("Please fill all fields");
      return;
    }
    
    try {
      await api.post('/warden/outpasses', {
        departure_time: new Date(departure).toISOString(),
        expected_return_time: new Date(returnTime).toISOString(),
        reason: reason
      });
      toast.success("Outpass request submitted successfully");
      setDeparture("");
      setReturnTime("");
      setReason("");
      fetchOutpasses();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to submit request");
    }
  };

  return (
    <ProtectedRoute allowedRoles={['student', 'super_admin', 'principal']}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
            <LogOut className="w-8 h-8 text-brand-blue" />
            Hostel Services
          </h1>
          <p className="text-gray-600 mt-2">Apply for weekend outpasses and track status.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
            <h2 className="text-xl font-bold text-brand-black mb-4">Apply for Outpass</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Departure</label>
                <input 
                  type="datetime-local" 
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-brand-black" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Return</label>
                <input 
                  type="datetime-local" 
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-brand-black" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Reason</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-brand-black h-24" 
                  placeholder="Going home for the weekend..."
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-brand-blue hover:bg-indigo-700 text-brand-black font-bold py-3 rounded-xl">
                Submit Request
              </button>
            </form>
          </div>

          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
            <h2 className="text-xl font-bold text-brand-black mb-4">My Requests</h2>
            <div className="space-y-3">
              {outpasses.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">No outpass requests found</div>
              ) : (
                outpasses.map((o) => (
                  <div key={o.id} className="bg-gray-50/50 p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-bold text-brand-black">
                        {dayjs(o.departure_time).format('MMM DD, HH:mm')} - {dayjs(o.expected_return).format('MMM DD, HH:mm')}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-md border ${
                        o.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                        o.status === 'rejected' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{o.reason}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
