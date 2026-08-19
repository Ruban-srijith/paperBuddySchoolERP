"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PieChart, Plus, Download } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function BudgetsPortal() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [departmentName, setDepartmentName] = useState("");
  const [academicYear, setAcademicYear] = useState("2026-2027");
  const [allocatedAmount, setAllocatedAmount] = useState<number | "">("");
  const { toast } = useToast();

  const fetchBudgets = async () => {
    try {
      const res = await api.get('/finance/core/budgets');
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load budgets");
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentName || !academicYear || !allocatedAmount) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      await api.post('/finance/core/budgets', {
        department_name: departmentName,
        academic_year: academicYear,
        allocated_amount: Number(allocatedAmount)
      });
      toast.success("Budget created successfully");
      setShowModal(false);
      setDepartmentName("");
      setAllocatedAmount("");
      fetchBudgets();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create budget");
    }
  };

  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'principal', 'finance']}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
              <PieChart className="w-8 h-8 text-brand-blue" />
              Department Budgets
            </h1>
            <p className="text-gray-600 mt-2">Manage budget allocations across Academics, Events, IT, and Infrastructure.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-brand-blue hover:bg-indigo-700 text-brand-black px-4 py-2 rounded-xl flex items-center gap-2 font-medium"
          >
            <Plus className="w-4 h-4" /> New Budget
          </button>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {budgets.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-500">No budgets found.</div>
          ) : (
            budgets.map((b) => {
              const utilized = parseFloat(b.utilized_amount) || 0;
              const allocated = parseFloat(b.allocated_amount) || 0;
              const percent = allocated > 0 ? (utilized / allocated) * 100 : 0;
              const isHigh = percent > 80;

              return (
                <div key={b.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
                  <h3 className="text-gray-600 font-medium">{b.department_name}</h3>
                  <div className="mt-2 text-2xl font-bold text-brand-black">₹{(allocated / 1000000).toFixed(1)}M <span className="text-sm font-normal text-gray-500">Allocated</span></div>
                  <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`${isHigh ? 'bg-rose-400' : 'bg-brand-blue'} h-2 rounded-full`} 
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    ></div>
                  </div>
                  <div className={`mt-2 text-xs text-right ${isHigh ? 'text-rose-400 font-bold' : 'text-gray-600'}`}>
                    {percent.toFixed(0)}% Utilized {isHigh && '(High)'}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm border border-gray-200 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-brand-black">New Budget Allocation</h2>
                <p className="text-sm text-gray-600 mt-1">Assign funds to a department.</p>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Department Name</label>
                  <input 
                    type="text" 
                    value={departmentName} 
                    onChange={e => setDepartmentName(e.target.value)}
                    className="w-full bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl px-4 py-2 focus:outline-none focus:border-brand-blue" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Academic Year</label>
                  <input 
                    type="text" 
                    value={academicYear} 
                    onChange={e => setAcademicYear(e.target.value)}
                    className="w-full bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl px-4 py-2 focus:outline-none focus:border-brand-blue" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Allocated Amount (₹)</label>
                  <input 
                    type="number" 
                    value={allocatedAmount} 
                    onChange={e => setAllocatedAmount(Number(e.target.value) || "")}
                    className="w-full bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl px-4 py-2 focus:outline-none focus:border-brand-blue" 
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
                    className="flex-1 bg-brand-blue hover:bg-indigo-700 text-brand-black py-3 rounded-xl font-medium transition-colors"
                  >
                    Create Budget
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
