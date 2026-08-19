"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { GraduationCap, Plus } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";
import dayjs from "dayjs";

export default function ScholarshipsPortal() {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  // Form state
  const [studentId, setStudentId] = useState("");
  const [aidType, setAidType] = useState("");
  const [discountAmount, setDiscountAmount] = useState<number | "">("");
  const { toast } = useToast();

  const fetchScholarships = async () => {
    try {
      const res = await api.get('/finance/core/scholarships');
      setScholarships(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load scholarships");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students'); // Fetch all students to select from
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchScholarships();
    fetchStudents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !aidType || !discountAmount) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      await api.post('/finance/core/scholarships', {
        student_id: studentId,
        name: aidType,
        discount_amount: Number(discountAmount)
      });
      toast.success("Scholarship granted successfully");
      setShowModal(false);
      setStudentId("");
      setAidType("");
      setDiscountAmount("");
      fetchScholarships();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to grant scholarship");
    }
  };

  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'principal', 'finance']}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-violet-400" />
              Financial Aid & Scholarships
            </h1>
            <p className="text-gray-600 mt-2">Manage student fee waivers and merit scholarships.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-violet-600 hover:bg-violet-700 text-brand-black px-4 py-2 rounded-xl flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" /> Grant Aid
          </button>
        </header>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-gray-700 uppercase font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Aid Type</th>
                <th className="px-6 py-4">Discount Applied</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {scholarships.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No active scholarships found.</td>
                </tr>
              ) : (
                scholarships.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-100/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-brand-black">{s.student_name}</td>
                    <td className="px-6 py-4">{s.name}</td>
                    <td className="px-6 py-4 font-bold text-violet-500">₹{s.discount_amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Active</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm border border-gray-200 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-brand-black">Grant Financial Aid</h2>
                <p className="text-sm text-gray-600 mt-1">Assign a new scholarship to a student.</p>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Select Student</label>
                  <select 
                    value={studentId} 
                    onChange={e => setStudentId(e.target.value)}
                    className="w-full bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl px-4 py-2 focus:outline-none focus:border-violet-400" 
                    required
                  >
                    <option value="">-- Choose a student --</option>
                    {students.map(st => (
                      <option key={st.id} value={st.id}>{st.full_name} (Grade {st.assigned_grade})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Aid / Scholarship Type</label>
                  <input 
                    type="text" 
                    value={aidType} 
                    onChange={e => setAidType(e.target.value)}
                    placeholder="e.g. State Merit Scholarship"
                    className="w-full bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl px-4 py-2 focus:outline-none focus:border-violet-400" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Discount Amount (₹)</label>
                  <input 
                    type="number" 
                    value={discountAmount} 
                    onChange={e => setDiscountAmount(Number(e.target.value) || "")}
                    className="w-full bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl px-4 py-2 focus:outline-none focus:border-violet-400" 
                    required 
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-brand-black py-3 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-violet-600 hover:bg-violet-700 text-brand-black py-3 rounded-xl font-medium transition-colors"
                  >
                    Grant Aid
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
