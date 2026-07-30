"use client";

import { useEffect, useState } from "react";
import { CreditCard, CheckCircle2, Download, ShieldCheck, DollarSign, FileText, ArrowRight, X } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface ReceiptItem {
  id: string;
  student_id: string;
  student_name: string;
  title: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  receipt_number: string;
  status: string;
  created_at: string;
}

function FeePaymentContent() {
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  const [form, setForm] = useState({
    title: "Term 1 Tuition & Operations Fee",
    amount: 450.0,
    payment_method: "Card",
  });

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/fees/receipts");
      setReceipts(res.data);
    } catch (err) {
      console.error("Failed to fetch fee receipts:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    setMsg(null);
    try {
      const res = await api.post("/fees/pay", form);
      setMsg(`Payment of $${res.data.amount.toFixed(2)} successful! Receipt: ${res.data.receipt_number}`);
      fetchReceipts();
    } catch (err: any) {
      setMsg(`Payment failed: ${err.response?.data?.detail || "Error processing payment"}`);
    }
    setPaying(false);
  };

  const handleDownload = async (paymentId: string) => {
    try {
      const res = await api.get(`/fees/download/${paymentId}`);
      setSelectedReceipt(res.data);
    } catch (err) {
      console.error("Download receipt failed:", err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
          Fee Payment Gateway & Receipts
        </h1>
        <p className="text-sm text-gray-400">Process student fee payments and view automated PDF transaction receipts</p>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-2xl border-l-4 border-emerald-500 space-y-2">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Tuition Fee Status</div>
          <div className="text-2xl font-bold text-white">$450.00</div>
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Term 1 Active
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-cyan-500 space-y-2">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Lab & Activity Fee</div>
          <div className="text-2xl font-bold text-white">$120.00</div>
          <div className="text-xs text-cyan-400 font-medium">Science & CS Practical Labs</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border-l-4 border-indigo-500 space-y-2">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Receipt Verification</div>
          <div className="text-2xl font-bold text-white">Instant Receipt</div>
          <div className="text-xs text-indigo-300 font-medium">Async Email Intimation Active</div>
        </div>
      </div>

      {/* Main Grid: Form + Receipts Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="glass-panel-glow p-6 rounded-2xl space-y-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Make Fee Payment
          </h2>

          <form onSubmit={handlePay} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Fee Category</label>
              <select
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/70 border border-gray-700/60 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Term 1 Tuition & Operations Fee">Term 1 Tuition & Operations Fee ($450.00)</option>
                <option value="Science & CS Lab Materials Fee">Science & CS Lab Materials Fee ($120.00)</option>
                <option value="Annual Sports & Activity Fee">Annual Sports & Activity Fee ($80.00)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/70 border border-gray-700/60 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Payment Method</label>
              <select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/70 border border-gray-700/60 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Card">Credit / Debit Card</option>
                <option value="UPI">UPI Instant Payment</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            {msg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{msg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={paying}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-medium text-sm shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {paying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing Transaction...
                </>
              ) : (
                <>
                  <span>Pay Now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Payment History / Receipts List */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Transaction Receipts
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
          ) : receipts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">No transaction receipts found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800/60 text-xs font-semibold text-gray-400 uppercase tracking-wider text-left">
                    <th className="py-3 px-3">Receipt / Txn</th>
                    <th className="py-3 px-3">Fee Title</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Method</th>
                    <th className="py-3 px-3 text-right">PDF Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {receipts.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-mono text-xs text-white">{r.receipt_number}</div>
                        <div className="font-mono text-[10px] text-gray-400">{r.transaction_id}</div>
                      </td>
                      <td className="py-3 px-3 text-gray-200 text-xs font-medium">{r.title}</td>
                      <td className="py-3 px-3 font-semibold text-emerald-400 text-xs">${r.amount.toFixed(2)}</td>
                      <td className="py-3 px-3 text-gray-400 text-xs">{r.payment_method}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDownload(r.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 text-xs border border-indigo-500/30 hover:bg-indigo-600/30 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* PDF Receipt Modal Preview */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedReceipt(null)}></div>
          <div className="relative glass-panel-glow rounded-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">{selectedReceipt.institution}</h3>
                <p className="text-xs text-gray-400">Official Payment Receipt</p>
              </div>
              <button onClick={() => setSelectedReceipt(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-800/40">
                <span className="text-gray-400">Receipt No:</span>
                <span className="font-mono text-emerald-400 font-bold">{selectedReceipt.receipt_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/40">
                <span className="text-gray-400">Transaction ID:</span>
                <span className="font-mono text-white">{selectedReceipt.transaction_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/40">
                <span className="text-gray-400">Date:</span>
                <span className="text-white">{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/40">
                <span className="text-gray-400">Student Name:</span>
                <span className="text-white font-medium">{selectedReceipt.student?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/40">
                <span className="text-gray-400">Fee Category:</span>
                <span className="text-white">{selectedReceipt.payment?.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800/40">
                <span className="text-gray-400">Amount Paid:</span>
                <span className="text-emerald-400 font-bold text-sm">{selectedReceipt.payment?.amount}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800/60 text-[10px] text-gray-400 text-center">
              {selectedReceipt.footer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeePaymentPage() {
  return (
    <ProtectedRoute allowedRoles={["super_admin", "admin", "principal", "student"]}>
      <FeePaymentContent />
    </ProtectedRoute>
  );
}
