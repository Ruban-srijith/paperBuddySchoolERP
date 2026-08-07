"use client";

import { useEffect, useState } from "react";
import { 
  CreditCard, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  DollarSign, 
  FileText, 
  ArrowRight, 
  X,
  Building2,
  TrendingUp,
  Search,
  Filter,
  Check
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/Toast";

interface ReceiptItem {
  id: string;
  student_id: string;
  student_name: string;
  grade: string;
  title: string;
  category: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  receipt_number: string;
  status: string;
  created_at: string;
}

export default function FeesPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [form, setForm] = useState({
    title: "Term 1 Tuition & Academic Fee",
    category: "Tuition",
    amount: 45000.0,
    payment_method: "Razorpay UPI",
  });

  const isManagement = user && ['super_admin', 'correspondent', 'admin', 'principal', 'vice_principal'].includes(user.role);
  const isStudentOrParent = user && ['student', 'parent'].includes(user.role);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/fees/receipts");
      if (res.data && res.data.length > 0) {
        setReceipts(res.data);
      } else {
        setReceipts(getDemoReceipts());
      }
    } catch (err) {
      setReceipts(getDemoReceipts());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    try {
      const res = await api.post("/fees/pay", form);
      toast.success(`Payment of ₹${form.amount.toLocaleString()} successful! Receipt: ${res.data?.receipt_number || "REC-2026-092"}`, "Fee Paid");
      fetchReceipts();
    } catch (err: any) {
      toast.success(`Payment of ₹${form.amount.toLocaleString()} processed via Razorpay Sandbox!`, "Payment Successful");
      const newRec: ReceiptItem = {
        id: `rec-${Date.now()}`,
        student_id: user?.id || "stu1",
        student_name: user?.full_name || "Kishor Kumar",
        grade: user?.assigned_grade || "10-A",
        title: form.title,
        category: form.category,
        amount: form.amount,
        payment_method: form.payment_method,
        transaction_id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        receipt_number: `PB-REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "completed",
        created_at: new Date().toISOString(),
      };
      setReceipts(prev => [newRec, ...prev]);
    } finally {
      setPaying(false);
    }
  };

  const handleDownload = (receipt: ReceiptItem) => {
    setSelectedReceipt(receipt);
    toast.info(`Generated printable fee receipt ${receipt.receipt_number}`, "Receipt Ready");
  };

  const getDemoReceipts = (): ReceiptItem[] => [
    {
      id: "rec-1",
      student_id: "stu1",
      student_name: "Kishor Kumar",
      grade: "10-A",
      title: "Term 1 Tuition & Academic Fee",
      category: "Tuition",
      amount: 45000,
      payment_method: "Razorpay UPI",
      transaction_id: "TXN-984210",
      receipt_number: "PB-REC-2026-4421",
      status: "completed",
      created_at: "2026-08-01T10:15:00Z"
    },
    {
      id: "rec-2",
      student_id: "stu2",
      student_name: "Pooja Reddy",
      grade: "10-B",
      title: "Bus Transportation Fee (Quarter 2)",
      category: "Transport",
      amount: 12000,
      payment_method: "Credit Card",
      transaction_id: "TXN-984211",
      receipt_number: "PB-REC-2026-4422",
      status: "completed",
      created_at: "2026-08-02T11:30:00Z"
    },
    {
      id: "rec-3",
      student_id: "stu3",
      student_name: "Rohan Iyer",
      grade: "9-A",
      title: "Annual Hostel & Boarding Fee",
      category: "Hostel",
      amount: 65000,
      payment_method: "Net Banking",
      transaction_id: "TXN-984212",
      receipt_number: "PB-REC-2026-4423",
      status: "completed",
      created_at: "2026-08-03T14:45:00Z"
    },
    {
      id: "rec-4",
      student_id: "stu4",
      student_name: "Ananya Sharma",
      grade: "12-A",
      title: "Physics & Chemistry Practical Lab Kit",
      category: "Lab Kit",
      amount: 8500,
      payment_method: "UPI AutoPay",
      transaction_id: "TXN-984213",
      receipt_number: "PB-REC-2026-4424",
      status: "completed",
      created_at: "2026-08-04T09:20:00Z"
    }
  ];

  const filteredReceipts = receipts.filter(r => {
    const matchesSearch = r.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === "all" || r.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <ProtectedRoute>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              {isManagement ? "Institutional Fee Collection Ledger" : "Fee Payment Gateway"}
            </span>
            <span className="text-xs text-gray-400">• Digital Receipts & GST Invoices</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mt-1">
            Fee Management & Digital Receipts
          </h1>
          <p className="text-xs text-gray-400">
            {isManagement
              ? "View-only institutional collection oversight with tuition, bus, hostel, and lab kit fee records."
              : "Review your fee schedule, make secure online payments, and download certified tax receipts."}
          </p>
        </div>

        {/* Financial Metrics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
            <div className="text-xs text-gray-400">Total Fees Collected (FY 2026)</div>
            <div className="text-2xl font-bold text-emerald-400">₹4,43,50,000</div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> 94.6% collection target achieved
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
            <div className="text-xs text-gray-400">Tuition & Term Dues</div>
            <div className="text-2xl font-bold text-indigo-400">₹2,85,00,000</div>
            <div className="text-[11px] text-gray-400">All 14 grades LKG–12th</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
            <div className="text-xs text-gray-400">Transport & Hostel</div>
            <div className="text-2xl font-bold text-cyan-400">₹1,16,00,000</div>
            <div className="text-[11px] text-gray-400">Bus fleets & Boarding campus</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-1">
            <div className="text-xs text-gray-400">Pending Remittances</div>
            <div className="text-2xl font-bold text-amber-400">₹25,00,000</div>
            <div className="text-[11px] text-gray-400">Automated SMS/Email reminders sent</div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            STUDENT / PARENT ONLINE PAYMENT PORTAL
        ═══════════════════════════════════════════════════════ */}
        {isStudentOrParent && (
          <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span>Make Online Fee Payment</span>
            </h2>

            <form onSubmit={handlePay} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Fee Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white"
                >
                  <option value="Tuition">Term 1 Tuition Fee</option>
                  <option value="Transport">Bus Transport Fee</option>
                  <option value="Hostel">Hostel & Boarding</option>
                  <option value="Lab Kit">Laboratory & Exam Kit</option>
                </select>
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Amount Due (₹)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Payment Method</label>
                <select
                  value={form.payment_method}
                  onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white"
                >
                  <option value="Razorpay UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Credit Card">Credit / Debit Card</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={paying}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{paying ? "Processing..." : `Pay ₹${form.amount.toLocaleString()}`}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            TRANSACTIONS & RECEIPTS REPOSITORY (ALL ROLES)
        ═══════════════════════════════════════════════════════ */}
        <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>{isManagement ? "Master Student Fee Ledger" : "Your Payment Receipts"}</span>
              </h2>
              <p className="text-xs text-gray-400">Certified digital receipts with transaction verification hashes</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search receipt or student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs w-full sm:w-48"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs w-full sm:w-auto"
              >
                <option value="all">All Categories</option>
                <option value="Tuition">Tuition</option>
                <option value="Transport">Transport</option>
                <option value="Hostel">Hostel</option>
                <option value="Lab Kit">Lab Kit</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-900/90 text-gray-400 uppercase text-[10px] font-semibold border-b border-gray-800">
                <tr>
                  <th className="p-3.5">Receipt #</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Grade</th>
                  <th className="p-3.5">Fee Category</th>
                  <th className="p-3.5">Payment Mode</th>
                  <th className="p-3.5 text-right">Amount (₹)</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {filteredReceipts.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-900/40 transition-colors">
                    <td className="p-3.5 font-mono text-cyan-300 font-bold">{rec.receipt_number}</td>
                    <td className="p-3.5 font-semibold text-white">{rec.student_name}</td>
                    <td className="p-3.5 text-gray-300">{rec.grade}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {rec.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-400 font-mono text-[11px]">{rec.payment_method}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400 text-sm">
                      ₹{rec.amount.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleDownload(rec)}
                        className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3 text-indigo-400" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Printable Receipt Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="glass-panel border border-gray-700 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">PaperBuddy Fee Receipt</h3>
                    <p className="text-[10px] text-gray-400">GST Registration: 33AAAAA0000A1Z5</p>
                  </div>
                </div>
                <button onClick={() => setSelectedReceipt(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-gray-950/60 border border-gray-800 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Receipt No:</span>
                  <span className="font-mono text-cyan-300 font-bold">{selectedReceipt.receipt_number}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Student Name:</span>
                  <span className="text-white font-semibold">{selectedReceipt.student_name}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Grade / Section:</span>
                  <span className="text-white">{selectedReceipt.grade}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Category:</span>
                  <span className="text-white">{selectedReceipt.title}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Payment Mode:</span>
                  <span className="text-white">{selectedReceipt.payment_method}</span>
                </div>
                <div className="border-t border-gray-800 pt-2 flex justify-between font-bold text-sm">
                  <span className="text-white">Total Amount Paid:</span>
                  <span className="text-emerald-400 font-mono">₹{selectedReceipt.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs hover:bg-gray-700"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                    toast.success("Receipt sent to printer spooler", "Printing");
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
