"use client";

import { useState } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { Receipt, Search, CreditCard, CheckCircle2 } from "lucide-react";
import api from '@/lib/api';
import { useToast } from '@/components/Toast';

export default function FeePaymentPortal() {
  const { toast } = useToast();
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [dues, setDues] = useState<any[]>([]);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [processing, setProcessing] = useState<string | null>(null);

  const searchDues = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/finance/fees/student/${studentId}/dues`);
      setDues(response.data);
      if (response.data.length === 0) {
        toast.info("No dues found for this student.", "Fee Search");
      }
    } catch (err) {
      toast.error("Student not found or failed to fetch dues.", "Fee Search Error");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (fs_id: string, amount: number) => {
    setProcessing(fs_id);
    try {
      const response = await api.post('/finance/fees/pay', {
        student_id: studentId,
        fee_structure_id: fs_id,
        amount_paid: amount,
        payment_method: paymentMode
      });
      
      if (response.data.success) {
        toast.success(`Payment of ₹${amount} successful. Receipt: ${response.data.receipt_number}`, 'Payment Success');
        // Refresh dues
        const duesResponse = await api.get(`/finance/fees/student/${studentId}/dues`);
        setDues(duesResponse.data);
      }
    } catch (err) {
      toast.error("Failed to process payment.", "Payment Error");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'admin', 'principal', 'finance']}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
            <Receipt className="w-8 h-8 text-emerald-600" />
            Fee Payment Portal
          </h1>
          <p className="text-gray-600 mt-2">Search for a student and process tuition or hostel fees.</p>
        </header>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
          <form onSubmit={searchDues} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
              <input 
                type="text" 
                placeholder="Enter Student ID (e.g., UUID from users table)..." 
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-200 text-brand-black rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-brand-black px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
            >
              {loading ? 'Searching...' : 'Find Dues'}
            </button>
          </form>
        </div>

        {dues.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-brand-black">Pending Dues</h2>
              <div className="flex items-center gap-3 bg-gray-50/50 p-2 rounded-xl border border-gray-200">
                <span className="text-sm text-gray-600">Payment Mode:</span>
                <select 
                  value={paymentMode} 
                  onChange={e => setPaymentMode(e.target.value)}
                  className="bg-gray-100 text-brand-black text-sm border-none rounded-lg px-3 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card / POS</option>
                  <option value="upi">UPI / NetBanking</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4">
              {dues.map((due, idx) => (
                <div key={idx} className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-brand-black capitalize">{due.fee_type} Fee</h3>
                    <div className="text-sm text-gray-600 flex gap-4 mt-1">
                      <span>Total: ₹{due.total_amount}</span>
                      <span>Paid: ₹{due.total_paid}</span>
                      <span className="text-rose-400 font-medium">Balance: ₹{due.balance}</span>
                    </div>
                  </div>
                  <div>
                    {due.balance > 0 ? (
                      <button 
                        onClick={() => handlePayment(due.fee_structure_id, due.balance)}
                        disabled={processing === due.fee_structure_id}
                        className="bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30 border border-emerald-500/30 px-6 py-2 rounded-xl font-medium transition-colors flex items-center gap-2"
                      >
                        {processing === due.fee_structure_id ? 'Processing...' : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            Pay ₹{due.balance}
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-emerald-600 bg-emerald-500/10 px-4 py-2 rounded-xl font-medium border border-emerald-500/20">
                        <CheckCircle2 className="w-5 h-5" />
                        Fully Paid
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
