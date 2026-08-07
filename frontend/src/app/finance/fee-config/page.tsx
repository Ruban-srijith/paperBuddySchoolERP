"use client";

import { useState, useEffect } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { Settings, Save, CheckCircle2 } from "lucide-react";
import api from '@/lib/api';
import { useToast } from '@/components/Toast';

const ALL_GRADES = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

export default function FeeConfigPortal() {
  const { toast } = useToast();
  const [selectedGrade, setSelectedGrade] = useState(ALL_GRADES[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [fees, setFees] = useState({
    term1: '',
    term2: '',
    bus: '',
    hostel: '',
    due_date: '2026-12-31'
  });

  useEffect(() => {
    fetchFeesForGrade(selectedGrade);
  }, [selectedGrade]);

  const fetchFeesForGrade = async (grade: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/finance/fees/structures/${grade}`);
      const data = response.data;
      
      const newFees: any = { term1: '', term2: '', bus: '', hostel: '', due_date: '2026-12-31' };
      if (data && data.length > 0) {
        newFees.due_date = data[0].due_date || '2026-12-31';
        data.forEach((fs: any) => {
          if (fs.fee_type === 'term1') newFees.term1 = fs.amount.toString();
          if (fs.fee_type === 'term2') newFees.term2 = fs.amount.toString();
          if (fs.fee_type === 'bus') newFees.bus = fs.amount.toString();
          if (fs.fee_type === 'hostel') newFees.hostel = fs.amount.toString();
        });
      }
      setFees(newFees);
    } catch (err) {
      toast.error("Failed to fetch fee structures.", "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.post('/finance/fees/structures', {
        grade: selectedGrade,
        academic_year: "2026-2027",
        term1: Number(fees.term1) || 0,
        term2: Number(fees.term2) || 0,
        bus: Number(fees.bus) || 0,
        hostel: Number(fees.hostel) || 0,
        due_date: fees.due_date
      });
      if (response.data.success) {
        toast.success(`Fee structures updated for Grade ${selectedGrade}`, "Success");
      }
    } catch (err) {
      toast.error("Failed to save fee structures.", "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'admin', 'principal', 'finance']}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
            <Settings className="w-8 h-8 text-amber-400" />
            Master Fee Configurator
          </h1>
          <p className="text-gray-600 mt-2">Define base tuition, bus, and hostel fees for each grade level.</p>
        </header>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Grade Selector Sidebar */}
          <div className="md:col-span-1 space-y-2">
            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4 px-2">Select Grade</h3>
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-2 rounded-2xl border border-gray-200 max-h-[600px] overflow-y-auto custom-scrollbar">
              {ALL_GRADES.map(grade => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-medium ${
                    selectedGrade === grade 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-brand-black'
                  }`}
                >
                  Grade {grade}
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Form */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-8 rounded-2xl border border-gray-200">
              <h2 className="text-xl font-bold text-brand-black mb-6 border-b border-gray-200 pb-4">
                Fee Structure for Grade {selectedGrade}
              </h2>
              
              {loading ? (
                <div className="py-12 text-center text-gray-600">Loading current fees...</div>
              ) : (
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Term 1 Fee (₹)</label>
                      <input 
                        type="number" 
                        value={fees.term1} 
                        onChange={e => setFees({...fees, term1: e.target.value})}
                        className="w-full bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Term 2 Fee (₹)</label>
                      <input 
                        type="number" 
                        value={fees.term2} 
                        onChange={e => setFees({...fees, term2: e.target.value})}
                        className="w-full bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Bus/Transport Fee (₹)</label>
                      <input 
                        type="number" 
                        value={fees.bus} 
                        onChange={e => setFees({...fees, bus: e.target.value})}
                        className="w-full bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">Hostel Fee (₹)</label>
                      <input 
                        type="number" 
                        value={fees.hostel} 
                        onChange={e => setFees({...fees, hostel: e.target.value})}
                        className="w-full bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500" 
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">General Due Date</label>
                    <input 
                      type="date" 
                      value={fees.due_date} 
                      onChange={e => setFees({...fees, due_date: e.target.value})}
                      className="w-full md:w-1/2 bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 [color-scheme:dark]" 
                      required 
                    />
                  </div>

                  <div className="pt-6 border-t border-gray-200 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="bg-amber-600 hover:bg-amber-700 text-brand-black px-8 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                      {saving ? 'Saving...' : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Fees for Grade {selectedGrade}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
