"use client";

import { useState, useEffect } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { Wallet, Search, CheckCircle2, DollarSign } from "lucide-react";
import api from '@/lib/api';
import { useToast } from '@/components/Toast';

export default function PayrollPortal() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [baseSalary, setBaseSalary] = useState(50000); // Default placeholder
  const [bonuses, setBonuses] = useState(0);
  const [deductions, setDeductions] = useState(0);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await api.get('/finance/payroll/staff');
      setStaff(response.data);
    } catch (err) {
      toast.error("Failed to load staff list.", "Payroll Error");
    } finally {
      setLoading(false);
    }
  };

  const openProcessModal = (s: any) => {
    setSelectedStaff(s);
    setBaseSalary(s.role === 'principal' ? 80000 : s.role === 'teacher' ? 45000 : 35000);
    setBonuses(0);
    setDeductions(0);
    setShowModal(true);
  };

  const handleProcessSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    
    setProcessing(selectedStaff.id);
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    try {
      const response = await api.post('/finance/payroll/disburse', {
        staff_id: selectedStaff.id,
        month,
        base_salary: baseSalary,
        bonuses,
        deductions
      });
      
      if (response.data.success) {
        toast.success(`Successfully processed ₹${response.data.net_salary} for ${selectedStaff.full_name}`, 'Payroll Success');
        setShowModal(false);
        fetchStaff(); // Refresh staff to show updated paid status
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to process salary.", "Payroll Error");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'principal', 'finance']}>
      <div className="space-y-6 max-w-6xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
              <Wallet className="w-8 h-8 text-teal-400" />
              Staff Payroll
            </h1>
            <p className="text-gray-600 mt-2">Manage monthly salaries, bonuses, and deductions for all staff.</p>
          </div>
          <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-200 flex items-center gap-3">
            <span className="text-sm text-gray-600">Current Cycle:</span>
            <span className="font-bold text-teal-400">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          </div>
        </header>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-100 text-gray-700 uppercase font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Staff Member</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">Loading staff data...</td>
                  </tr>
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No staff found.</td>
                  </tr>
                ) : (
                  staff.map((s, idx) => (
                    <tr key={idx} className="hover:bg-gray-100/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-brand-black">{s.full_name}</div>
                        <div className="text-xs text-gray-500">{s.id}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-700 capitalize text-xs font-medium border border-gray-200">
                          {s.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">{s.department_id || 'N/A'}</td>
                      <td className="px-6 py-4 text-right">
                        {s.is_paid ? (
                          <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-400 border border-gray-200 px-4 py-2 rounded-lg font-medium cursor-not-allowed">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Paid
                          </span>
                        ) : (
                          <button 
                            onClick={() => openProcessModal(s)}
                            className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-600 hover:bg-teal-500/30 border border-teal-500/30 px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            <DollarSign className="w-4 h-4" />
                            Process Salary
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Processing Modal */}
        {showModal && selectedStaff && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm border border-gray-200 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-brand-black">Process Salary</h2>
                <p className="text-sm text-gray-600 mt-1">For {selectedStaff.full_name} ({selectedStaff.role})</p>
              </div>
              <form onSubmit={handleProcessSalary} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Base Salary (₹)</label>
                  <input 
                    type="number" 
                    value={baseSalary} 
                    onChange={e => setBaseSalary(Number(e.target.value))}
                    className="w-full bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl px-4 py-2 focus:outline-none focus:border-teal-500" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Bonuses (₹)</label>
                    <input 
                      type="number" 
                      value={bonuses} 
                      onChange={e => setBonuses(Number(e.target.value))}
                      className="w-full bg-gray-50/50 border border-gray-200 text-green-400 rounded-xl px-4 py-2 focus:outline-none focus:border-teal-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">Deductions (₹)</label>
                    <input 
                      type="number" 
                      value={deductions} 
                      onChange={e => setDeductions(Number(e.target.value))}
                      className="w-full bg-gray-50/50 border border-gray-200 text-rose-400 rounded-xl px-4 py-2 focus:outline-none focus:border-teal-500" 
                    />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Net Payable:</span>
                  <span className="text-2xl font-bold text-teal-400">₹{(baseSalary + bonuses - deductions).toLocaleString()}</span>
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-700 text-brand-black py-3 rounded-xl font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={processing === selectedStaff.id}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-brand-black py-3 rounded-xl font-medium transition-colors flex justify-center items-center gap-2"
                  >
                    {processing === selectedStaff.id ? 'Processing...' : 'Confirm Payment'}
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
