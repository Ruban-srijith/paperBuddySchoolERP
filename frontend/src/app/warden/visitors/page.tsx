"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Users, LogIn, LogOut, X } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function WardenVisitors() {
  const { toast } = useToast();
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [visitors, setVisitors] = useState<any[]>([]);
  
  const [visitorName, setVisitorName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [studentVisiting, setStudentVisiting] = useState("");

  const fetchVisitors = async () => {
    try {
      const res = await api.get("/warden/visitors");
      setVisitors(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleSave = async () => {
    try {
      let finalPurpose = purpose;
      if (studentVisiting) {
        finalPurpose += ` (Visiting: ${studentVisiting})`;
      }
      await api.post("/warden/visitors", {
        visitor_name: visitorName,
        purpose: finalPurpose
      });
      toast.success("Visitor logged successfully");
      setShowVisitorModal(false);
      setVisitorName("");
      setPurpose("");
      setStudentVisiting("");
      fetchVisitors();
    } catch (err) {
      toast.error("Failed to log visitor");
    }
  };

  const handleCheckout = async (visitorId: string) => {
    try {
      await api.put(`/warden/visitors/${visitorId}/checkout`);
      toast.success("Visitor checked out successfully");
      fetchVisitors();
    } catch (err) {
      toast.error("Failed to check out visitor");
    }
  };
  return (
    <ProtectedRoute allowedRoles={['warden', 'super_admin', 'principal']}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
              <Users className="w-8 h-8 text-cyan-600" />
              Digital Visitor Logbook
            </h1>
            <p className="text-gray-600 mt-2">Track parents and guests entering the hostel premises.</p>
          </div>
          <button 
            onClick={() => setShowVisitorModal(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-brand-black px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shrink-0 whitespace-nowrap"
          >
            <LogIn className="w-4 h-4" /> New Entry
          </button>
        </header>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 min-w-max">
            <thead className="bg-gray-100 text-gray-700 uppercase font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Visitor Name</th>
                <th className="px-6 py-4">Student Visited</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Check In</th>
                <th className="px-6 py-4">Check Out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {visitors.map((v) => {
                const checkInDate = new Date(v.check_in);
                return (
                  <tr key={v.id} className="hover:bg-gray-100/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-brand-black">{v.visitor_name}</div>
                      <div className="text-xs text-gray-500">{checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-cyan-600">-</td>
                    <td className="px-6 py-4">{v.purpose}</td>
                    <td className="px-6 py-4 text-emerald-600 font-medium">
                      {checkInDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {v.check_out ? new Date(v.check_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : (
                        <button onClick={() => handleCheckout(v.id)} className="text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                          <LogOut className="w-3 h-3" /> Mark Out
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {visitors.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No visitors logged yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* New Visitor Entry Modal */}
        {showVisitorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-black">New Visitor Entry</h3>
                <button onClick={() => setShowVisitorModal(false)} className="text-gray-600 hover:text-brand-black transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Visitor Name</label>
                  <input value={visitorName} onChange={e => setVisitorName(e.target.value)} type="text" className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Relation / Purpose</label>
                  <input value={purpose} onChange={e => setPurpose(e.target.value)} type="text" className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500" placeholder="e.g. Father, Delivery" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Student Visiting (Optional)</label>
                  <input value={studentVisiting} onChange={e => setStudentVisiting(e.target.value)} type="text" className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-cyan-500" placeholder="Search student name..." />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50/50 flex justify-end gap-3">
                <button onClick={() => setShowVisitorModal(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:text-brand-black transition-colors">Cancel</button>
                <button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 text-brand-black px-4 py-2 rounded-lg transition-colors">Log Entry</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
