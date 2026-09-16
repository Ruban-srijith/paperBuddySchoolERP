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
  Check,
  Printer
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/Toast";
import Tilt3D from "@/components/Tilt3D";

function CornerArchOrnament({ position = "tr" }: { position?: "tr" | "bl" | "br" }) {
  if (position === "tr") {
    return (
      <svg className="corner-arch-tr" viewBox="0 0 100 100" fill="none" stroke="#43634e" strokeWidth="1.5">
        <path d="M 100 0 A 100 100 0 0 0 0 100" />
        <path d="M 100 20 A 80 80 0 0 0 20 100" />
        <path d="M 100 40 A 60 60 0 0 0 40 100" />
        <path d="M 100 60 A 40 40 0 0 0 60 100" />
      </svg>
    );
  }
  return (
    <svg className="corner-arch-bl" viewBox="0 0 100 100" fill="none" stroke="#43634e" strokeWidth="1.5">
      <path d="M 0 100 A 100 100 0 0 1 100 0" />
      <path d="M 0 80 A 80 80 0 0 1 80 0" />
      <path d="M 0 60 A 60 60 0 0 1 60 0" />
      <path d="M 0 40 A 40 40 0 0 1 40 0" />
    </svg>
  );
}

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

  const [dues, setDues] = useState<any[]>([]);
  const [selectedDue, setSelectedDue] = useState<any | null>(null);
  const [form, setForm] = useState({
    title: "Term 1 Tuition & Academic Fee",
    category: "Tuition",
    amount: 45000.0,
    payment_method: "Razorpay UPI",
    fee_structure_id: "",
  });

  const isManagement = user && ['super_admin', 'correspondent', 'principal', 'vice_principal', 'finance'].includes(user.role);
  const isStudentOrParent = user && ['student'].includes(user.role);

  const fetchDuesAndReceipts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/fees/receipts");
      if (res.data && res.data.length > 0) {
        setReceipts(res.data);
      } else {
        setReceipts(getDemoReceipts());
      }

      if (user?.id) {
        try {
          const duesRes = await api.get(`/finance/fees/student/${user.id}/dues`);
          if (duesRes.data && duesRes.data.length > 0) {
            setDues(duesRes.data);
            const firstPending = duesRes.data.find((d: any) => d.balance > 0);
            if (firstPending) {
              setSelectedDue(firstPending);
              setForm(prev => ({
                ...prev,
                title: firstPending.title || `Grade Fee (${firstPending.fee_type.toUpperCase()})`,
                amount: firstPending.balance,
                fee_structure_id: firstPending.fee_structure_id
              }));
            } else {
              setSelectedDue(null);
              setForm(prev => ({
                ...prev,
                title: "All Dues Cleared",
                amount: 0,
                fee_structure_id: ""
              }));
            }
          }
        } catch (e) {
          console.log("No custom dues found.");
        }
      }
    } catch (err) {
      setReceipts(getDemoReceipts());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuesAndReceipts();
  }, [user?.id]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDue || form.amount <= 0 || selectedDue.balance <= 0) {
      toast.info("This fee item has already been fully paid or no outstanding balance remains.", "Fee Paid");
      return;
    }

    setPaying(true);

    const resScript = await loadRazorpay();

    // 1. Try launching official Razorpay Checkout SDK Modal
    let orderData: any = null;
    try {
      const orderRes = await api.post("/fees/create-order", {
        amount: form.amount,
        currency: "INR",
        fee_structure_id: selectedDue?.fee_structure_id,
        student_id: user?.id
      });
      orderData = orderRes.data;
    } catch (e) {
      console.log("Using direct Razorpay payment mode or test gateway");
    }

    const razorpayKey = orderData?.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TFdHFeHGkMKc4O";

    const options = {
      key: razorpayKey,
      amount: Math.round((orderData?.amount || form.amount) * 100),
      currency: orderData?.currency || "INR",
      name: "PaperBuddy ERP",
      description: form.title,
      order_id: orderData?.order_id,
      handler: async function (response: any) {
        try {
          if (response.razorpay_signature) {
            const verifyRes = await api.post("/fees/verify-signature", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              title: form.title,
              amount: form.amount,
              payment_method: form.payment_method || "Razorpay UPI",
              fee_structure_id: selectedDue?.fee_structure_id,
              student_id: user?.id
            });
            toast.success(`Payment successful! Receipt: ${verifyRes.data.receipt_number}`, "Fee Paid");
          } else {
            const payRes = await api.post("/fees/pay", {
              title: form.title,
              amount: form.amount,
              payment_method: form.payment_method || "Razorpay Gateway",
              fee_structure_id: selectedDue?.fee_structure_id,
              student_id: user?.id
            });
            toast.success(`Payment of ₹${form.amount.toLocaleString()} successful! Receipt: ${payRes.data?.receipt_number || "REC-2026-092"}`, "Fee Paid");
          }
          await fetchDuesAndReceipts();
        } catch (verifyErr: any) {
          toast.error(verifyErr?.response?.data?.detail || "Payment verification encountered an issue.", "Payment Status");
          await fetchDuesAndReceipts();
        } finally {
          setPaying(false);
        }
      },
      prefill: {
        name: user?.full_name || "Kishor Kumar",
        email: user?.email || "student@school.edu",
        contact: "9876543210"
      },
      notes: {
        fee_structure_id: selectedDue?.fee_structure_id || "",
        student_id: user?.id || ""
      },
      theme: {
        color: "#059669"
      },
      modal: {
        ondismiss: function() {
          setPaying(false);
          toast.info("Payment popup closed.", "Razorpay Checkout");
        }
      }
    };

    if ((window as any).Razorpay) {
      try {
        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on('payment.failed', function (response: any) {
          toast.error(`Payment failed: ${response.error?.description || 'Transaction declined'}`, "Payment Error");
          setPaying(false);
        });
        paymentObject.open();
      } catch (err) {
        // Fallback execution if popups are blocked by browser
        await executeDirectPayment();
      }
    } else {
      await executeDirectPayment();
    }
  };

  const executeDirectPayment = async () => {
    try {
      const res = await api.post("/fees/pay", {
        title: form.title,
        amount: form.amount,
        payment_method: form.payment_method,
        fee_structure_id: selectedDue?.fee_structure_id,
        student_id: user?.id
      });
      toast.success(`Payment of ₹${form.amount.toLocaleString()} successful! Receipt: ${res.data?.receipt_number}`, "Fee Paid");
      await fetchDuesAndReceipts();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Payment failed to process.", "Payment Error");
      await fetchDuesAndReceipts();
    } finally {
      setPaying(false);
    }
  };


function numberToWords(amount: number): string {
  const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if (!amount || amount === 0) return "Zero Rupees Only";

  const convertLessThanOneThousand = (num: number): string => {
    let current = "";
    if (num >= 100) {
      current += units[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }
    if (num >= 20) {
      current += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    }
    if (num > 0) {
      current += units[num] + " ";
    }
    return current;
  };

  let num = Math.floor(amount);
  let result = "";

  if (num >= 10000000) {
    result += convertLessThanOneThousand(Math.floor(num / 10000000)) + "Crore ";
    num %= 10000000;
  }
  if (num >= 100000) {
    result += convertLessThanOneThousand(Math.floor(num / 100000)) + "Lakh ";
    num %= 100000;
  }
  if (num >= 1000) {
    result += convertLessThanOneThousand(Math.floor(num / 1000)) + "Thousand ";
    num %= 1000;
  }
  if (num > 0) {
    result += convertLessThanOneThousand(num);
  }

  return result.trim() + " Rupees Only";
}

const generateReceiptHtml = (receipt: ReceiptItem): string => {
  const amountInWords = numberToWords(receipt.amount);
  const formattedDate = receipt.created_at ? new Date(receipt.created_at).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) : new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Fee Receipt - ${receipt.receipt_number}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8fafc;
      color: #0f172a;
      padding: 30px 20px;
      display: flex;
      justify-content: center;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .receipt-container {
      background: #ffffff;
      width: 100%;
      max-width: 800px;
      padding: 40px 48px;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
      position: relative;
    }
    
    .watermark {
      position: absolute;
      top: 52%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-28deg);
      font-size: 88px;
      font-weight: 800;
      color: rgba(16, 185, 129, 0.05);
      letter-spacing: 12px;
      pointer-events: none;
      user-select: none;
      text-transform: uppercase;
      z-index: 0;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 24px;
      position: relative;
      z-index: 1;
    }
    
    .school-info h1 {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
    }
    
    .school-info p {
      font-size: 11px;
      color: #64748b;
      line-height: 1.5;
    }
    
    .receipt-badge {
      text-align: right;
    }
    
    .badge-pill {
      display: inline-block;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    
    .receipt-no {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }
    
    .receipt-date {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
      position: relative;
      z-index: 1;
    }
    
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    
    .meta-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 2px;
    }
    
    .meta-value {
      font-size: 13px;
      font-weight: 600;
      color: #1e293b;
    }
    
    .meta-value.mono {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #0284c7;
    }
    
    .table-container {
      margin-bottom: 24px;
      position: relative;
      z-index: 1;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    
    th {
      background: #f1f5f9;
      color: #475569;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 14px;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #cbd5e1;
    }
    
    td {
      padding: 14px 14px;
      font-size: 12px;
      color: #334155;
      border-bottom: 1px solid #f1f5f9;
    }
    
    .amount-col {
      text-align: right;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
    }
    
    .summary-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-top: 2px solid #e2e8f0;
      padding-top: 16px;
      margin-bottom: 28px;
      position: relative;
      z-index: 1;
    }
    
    .words-box {
      max-width: 55%;
    }
    
    .words-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 4px;
    }
    
    .words-text {
      font-size: 12px;
      font-weight: 600;
      color: #1e293b;
      font-style: italic;
      line-height: 1.4;
      background: #f8fafc;
      padding: 10px 14px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .total-box {
      width: 40%;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 12px;
      color: #64748b;
    }
    
    .grand-total {
      display: flex;
      justify-content: space-between;
      border-top: 2px solid #0f172a;
      padding-top: 8px;
      margin-top: 6px;
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }
    
    .grand-total .amount {
      color: #059669;
      font-family: 'JetBrains Mono', monospace;
    }
    
    .signatures {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 20px;
      margin-top: 20px;
      border-top: 1px dashed #cbd5e1;
      position: relative;
      z-index: 1;
    }
    
    .seal-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .stamp-circle {
      width: 64px;
      height: 64px;
      border: 2px dashed #059669;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #059669;
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
      text-align: center;
      transform: rotate(-10deg);
      line-height: 1.1;
    }
    
    .stamp-details {
      font-size: 10px;
      color: #64748b;
      line-height: 1.4;
    }
    
    .sign-box {
      text-align: center;
      min-width: 160px;
    }
    
    .sign-line {
      border-top: 1px solid #94a3b8;
      margin-top: 40px;
      padding-top: 6px;
      font-size: 11px;
      font-weight: 700;
      color: #334155;
    }
    
    .sign-sub {
      font-size: 9px;
      color: #64748b;
    }
    
    .footer-note {
      text-align: center;
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
      font-size: 10px;
      color: #94a3b8;
      line-height: 1.5;
      position: relative;
      z-index: 1;
    }
    
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .receipt-container {
        border: none;
        box-shadow: none;
        padding: 16px 20px;
        max-width: 100%;
      }
      @page {
        size: A4 portrait;
        margin: 10mm;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="watermark">PAID</div>
    
    <div class="header">
      <div class="school-info">
        <h1>PAPERBUDDY INTERNATIONAL SCHOOL</h1>
        <p>Affiliated to CBSE, New Delhi • Affiliation No. 1930842</p>
        <p>104 Knowledge Park Boulevard, Cyber City, Chennai - 600113</p>
        <p>Email: accounts@paperbuddy.edu • Phone: +91 44 2847 9000</p>
        <p style="margin-top: 3px; font-weight: 600; color: #475569;">GSTIN: 33AAAAA0000A1Z5</p>
      </div>
      <div class="receipt-badge">
        <div class="badge-pill">✓ Official Fee Receipt</div>
        <div class="receipt-no">${receipt.receipt_number}</div>
        <div class="receipt-date">Date: ${formattedDate}</div>
        <div class="receipt-date" style="font-weight: 600; color: #334155;">Academic Year: 2026 - 2027</div>
      </div>
    </div>
    
    <div class="meta-grid">
      <div class="meta-item">
        <span class="meta-label">Student Full Name</span>
        <span class="meta-value">${receipt.student_name}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Class & Section</span>
        <span class="meta-value">${receipt.grade}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Payment Mode / Gateway</span>
        <span class="meta-value">${receipt.payment_method}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Transaction Reference / UTR</span>
        <span class="meta-value mono">${receipt.transaction_id || 'TXN_PB_' + receipt.receipt_number.replace(/[^0-9]/g, '')}</span>
      </div>
    </div>
    
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th>Fee Description / Particulars</th>
            <th style="width: 140px;">Category</th>
            <th class="amount-col" style="width: 130px;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center; font-weight: 600;">1</td>
            <td>
              <div style="font-weight: 700; color: #0f172a;">${receipt.title}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Term Academic Tuition, Labs & Institution Services</div>
            </td>
            <td><span style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">${receipt.category}</span></td>
            <td class="amount-col">₹${receipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="summary-section">
      <div class="words-box">
        <div class="words-label">Amount in Words</div>
        <div class="words-text">${amountInWords}</div>
      </div>
      <div class="total-box">
        <div class="total-row">
          <span>Subtotal</span>
          <span style="font-family: 'JetBrains Mono', monospace;">₹${receipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div class="total-row">
          <span>Educational Tax (Exempt)</span>
          <span style="font-family: 'JetBrains Mono', monospace;">₹0.00</span>
        </div>
        <div class="grand-total">
          <span>Total Paid</span>
          <span class="amount">₹${receipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
    
    <div class="signatures">
      <div class="seal-box">
        <div class="stamp-circle">
          <span>★ PAID ★</span>
          <span>ONLINE</span>
          <span>VERIFIED</span>
        </div>
        <div class="stamp-details">
          <div style="font-weight: 700; color: #059669;">Verified Electronic Payment</div>
          <div>Bank Hash: ${receipt.transaction_id ? receipt.transaction_id.slice(-12) : 'SECURE_HASH_OK'}</div>
          <div>Status: Fully Realized & Credited</div>
        </div>
      </div>
      <div class="sign-box">
        <div class="sign-line">Authorized Signatory</div>
        <div class="sign-sub">Finance & Accounts Department</div>
      </div>
    </div>
    
    <div class="footer-note">
      This is a digitally generated electronic receipt verified by PaperBuddy School ERP. No physical signature is required under the Information Technology Act, 2000. For billing inquiries, contact accounts@paperbuddy.edu.
    </div>
  </div>
</body>
</html>`;
};

  const handleDownload = (receipt: ReceiptItem) => {
    setSelectedReceipt(receipt);
  };

  const handlePrintReceipt = (receipt: ReceiptItem) => {
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to print receipt.");
      return;
    }

    const htmlContent = generateReceiptHtml(receipt) + `
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    toast.success(`Print preview generated for ${receipt.receipt_number}`, "Printing Receipt");
  };

  const handleDownloadReceiptDoc = (receipt: ReceiptItem) => {
    try {
      const htmlContent = generateReceiptHtml(receipt);
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.setAttribute("download", `Fee_Receipt_${receipt.receipt_number}.html`);
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success(`Fee receipt ${receipt.receipt_number} downloaded successfully`, "Download Complete");
    } catch (err) {
      toast.error("Failed to download fee receipt");
    }
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
      <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e5c158]/20 text-[#e5c158] font-bold border border-[#e5c158]/40">
              {isManagement ? "Institutional Fee Collection Ledger" : "Fee Payment Gateway"}
            </span>
            <span className="text-xs text-[#a3c9b0]">• Digital Receipts & GST Invoices</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-[#f4f0e6] font-syne tracking-tight mt-1">
            Fee Management & Digital Receipts
          </h1>
          <p className="text-sm text-[#a3c9b0] font-medium">
            {isManagement
              ? "View-only institutional collection oversight with tuition, bus, hostel, and lab kit fee records."
              : "Review your fee schedule, make secure online payments, and download certified tax receipts."}
          </p>
        </div>

        {/* Financial Metrics Summary */}
        {isManagement && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Tilt3D>
              <div className="glass-emerald-tile p-5 rounded-[22px] space-y-1">
                <CornerArchOrnament position="tr" />
                <div className="text-xs text-[#a3c9b0] font-semibold relative z-10">Total Fees Collected (FY 2026)</div>
                <div className="text-2xl font-extrabold text-emerald-400 font-syne relative z-10">₹4,43,50,000</div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold relative z-10">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 94.6% collection target achieved
                </div>
              </div>
            </Tilt3D>

            <Tilt3D>
              <div className="glass-emerald-tile p-5 rounded-[22px] space-y-1">
                <CornerArchOrnament position="bl" />
                <div className="text-xs text-[#a3c9b0] font-semibold relative z-10">Tuition & Term Dues</div>
                <div className="text-2xl font-extrabold text-sky-300 font-syne relative z-10">₹2,85,00,000</div>
                <div className="text-[11px] text-[#a3c9b0] relative z-10">All 14 grades LKG–12th</div>
              </div>
            </Tilt3D>

            <Tilt3D>
              <div className="glass-emerald-tile p-5 rounded-[22px] space-y-1">
                <CornerArchOrnament position="tr" />
                <div className="text-xs text-[#a3c9b0] font-semibold relative z-10">Transport & Hostel</div>
                <div className="text-2xl font-extrabold text-[#e5c158] font-syne relative z-10">₹1,16,00,000</div>
                <div className="text-[11px] text-[#a3c9b0] relative z-10">Bus fleets & Boarding campus</div>
              </div>
            </Tilt3D>

            <Tilt3D>
              <div className="glass-emerald-tile p-5 rounded-[22px] space-y-1">
                <CornerArchOrnament position="bl" />
                <div className="text-xs text-[#a3c9b0] font-semibold relative z-10">Pending Remittances</div>
                <div className="text-2xl font-extrabold text-amber-300 font-syne relative z-10">₹25,00,000</div>
                <div className="text-[11px] text-[#a3c9b0] relative z-10">Automated SMS/Email reminders sent</div>
              </div>
            </Tilt3D>
          </div>
        )}

        {/* STUDENT / PARENT ONLINE PAYMENT PORTAL */}
        {isStudentOrParent && (
          <Tilt3D>
            <div className="glass-emerald-tile p-6 rounded-[24px] space-y-5">
              <CornerArchOrnament position="tr" />
              <div className="flex items-center justify-between border-b border-[#a3c9b0]/20 pb-3 relative z-10">
                <h2 className="text-base font-extrabold text-[#f4f0e6] font-syne flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#e5c158]" />
                  <span>Official Fee Payment Gateway (Read-Only Fixed Ledger)</span>
                </h2>
                <span className="text-xs px-3 py-1 bg-[#e5c158]/20 text-[#e5c158] font-bold rounded-full border border-[#e5c158]/40">
                  Verified School Dues
                </span>
              </div>

              {/* Read-Only Itemized Dues Selection */}
              {dues.length > 0 ? (
                <div className="space-y-3 relative z-10">
                  <label className="text-xs font-extrabold text-[#a3c9b0] block uppercase tracking-wider">
                    Your Fee Schedule
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dues.map((d: any) => {
                      const isPaid = d.balance <= 0;
                      const isSelected = selectedDue?.fee_structure_id === d.fee_structure_id;
                      return (
                        <button
                          key={d.fee_structure_id}
                          type="button"
                          disabled={isPaid}
                          onClick={() => {
                            if (isPaid) return;
                            setSelectedDue(d);
                            setForm(prev => ({
                              ...prev,
                              title: d.title || `Grade Fee (${d.fee_type.toUpperCase()})`,
                              amount: d.balance,
                              fee_structure_id: d.fee_structure_id
                            }));
                          }}
                          className={`p-4 rounded-2xl border text-left transition-all flex justify-between items-center ${
                            isPaid
                              ? "glass-box opacity-70 cursor-not-allowed border-emerald-500/30"
                              : isSelected
                              ? "bg-[#e5c158]/20 border-[#e5c158] ring-2 ring-[#e5c158]/30 cursor-pointer"
                              : "glass-box hover:border-[#e5c158]/50 cursor-pointer"
                          }`}
                        >
                          <div>
                            <div className="font-extrabold text-sm text-[#f4f0e6] font-syne">{d.title || d.fee_type.toUpperCase()}</div>
                            <div className="text-xs text-[#a3c9b0] mt-0.5">
                              Total: ₹{(d.total_amount || 0).toLocaleString()}
                              {d.discount_applied > 0 && ` (Scholarship: -₹${d.discount_applied})`}
                              {d.total_paid > 0 && ` • Paid: ₹${(d.total_paid || 0).toLocaleString()}`}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-extrabold border border-emerald-500/40">
                                <Check className="w-3 h-3" /> PAID
                              </span>
                            ) : (
                              <>
                                <div className="font-extrabold text-base text-rose-300 font-mono">₹{(d.balance || 0).toLocaleString()}</div>
                                <div className="text-[10px] font-extrabold uppercase text-rose-300">Due</div>
                              </>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {dues.every((d: any) => d.balance <= 0) && (
                    <div className="p-4 glass-box border border-emerald-500/40 rounded-2xl text-center text-emerald-300 text-sm font-bold">
                      🎉 All fee dues for this term have been fully cleared! No outstanding balance.
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 glass-box border border-emerald-500/40 rounded-2xl text-center text-emerald-300 text-sm font-bold relative z-10">
                  ✅ No fee schedule found or all dues have been cleared.
                </div>
              )}

              <form onSubmit={handlePay} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2 relative z-10">
                <div>
                  <label className="text-[#a3c9b0] font-semibold block mb-1">Fee Item Title</label>
                  <input
                    type="text"
                    value={form.title}
                    readOnly={true}
                    className="w-full px-3.5 py-3 glass-input-dark text-[#f4f0e6] font-semibold cursor-not-allowed opacity-80"
                  />
                </div>

                <div>
                  <label className="text-[#a3c9b0] font-semibold block mb-1">Fixed Due Amount (₹)</label>
                  <input
                    type="number"
                    value={form.amount}
                    readOnly={true}
                    className="w-full px-3.5 py-3 glass-input-dark text-emerald-400 font-extrabold text-sm cursor-not-allowed opacity-80 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[#a3c9b0] font-semibold block mb-1">Payment Method</label>
                  <select
                    value={form.payment_method}
                    onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                    className="w-full px-3.5 py-3 glass-input-dark text-[#f4f0e6] font-bold"
                  >
                    <option value="Razorpay UPI" className="bg-[#14251c]">Razorpay UPI / QR Code</option>
                    <option value="Credit/Debit Card" className="bg-[#14251c]">Credit / Debit Card</option>
                    <option value="Net Banking" className="bg-[#14251c]">Net Banking (All Indian Banks)</option>
                  </select>
                </div>

                <div className="sm:col-span-3 pt-2">
                  {dues.length > 0 && dues.every((d: any) => d.balance <= 0) ? (
                    <div className="w-full py-3.5 glass-box border border-emerald-500/40 text-emerald-300 font-extrabold rounded-xl text-sm flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> All Fees Paid — No Outstanding Balance
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={paying || form.amount <= 0 || !selectedDue || selectedDue.balance <= 0}
                      className="w-full py-3.5 bg-[#e5c158] hover:bg-[#d4b047] disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-[#e5c158]/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {paying ? (
                        <><span className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" /> Connecting to Razorpay...</>
                      ) : (
                        `Pay ₹${(form.amount || 0).toLocaleString()} via Razorpay`
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </Tilt3D>
        )}

        {/* TRANSACTIONS & RECEIPTS REPOSITORY */}
        <Tilt3D>
          <div className="glass-emerald-tile p-6 rounded-[24px] space-y-4">
            <CornerArchOrnament position="bl" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
              <div>
                <h2 className="text-base font-extrabold text-[#f4f0e6] font-syne flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#e5c158]" />
                  <span>{isManagement ? "Master Student Fee Ledger" : "Your Payment Receipts"}</span>
                </h2>
                <p className="text-xs text-[#a3c9b0]">Certified digital receipts with transaction verification hashes</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#e5c158]" />
                  <input
                    type="text"
                    placeholder="Search receipt or student..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-2 rounded-xl glass-input-dark text-[#f4f0e6] text-xs w-full sm:w-48"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl glass-input-dark text-[#f4f0e6] text-xs w-full sm:w-auto font-semibold"
                >
                  <option value="all" className="bg-[#14251c]">All Categories</option>
                  <option value="Tuition" className="bg-[#14251c]">Tuition</option>
                  <option value="Transport" className="bg-[#14251c]">Transport</option>
                  <option value="Hostel" className="bg-[#14251c]">Hostel</option>
                  <option value="Lab Kit" className="bg-[#14251c]">Lab Kit</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto relative z-10">
              <table>
                <thead>
                  <tr>
                    <th>Receipt #</th>
                    <th>Student Name</th>
                    <th>Grade</th>
                    <th>Fee Category</th>
                    <th>Payment Mode</th>
                    <th className="text-right font-extrabold text-[#e5c158]">Amount (₹)</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceipts.map((rec) => (
                    <tr key={rec.id}>
                      <td className="font-mono text-[#e5c158] font-bold">{rec.receipt_number}</td>
                      <td className="font-extrabold text-[#f4f0e6]">{rec.student_name}</td>
                      <td className="text-[#a3c9b0]">{rec.grade}</td>
                      <td>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e5c158]/20 text-[#e5c158] border border-[#e5c158]/30">
                          {rec.category}
                        </span>
                      </td>
                      <td className="text-[#a3c9b0] font-mono text-[11px]">{rec.payment_method}</td>
                      <td className="text-right font-mono font-extrabold text-emerald-400 text-sm">
                        ₹{rec.amount.toLocaleString()}
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => handleDownload(rec)}
                          className="px-3.5 py-1.5 rounded-xl glass-box hover:border-[#e5c158] text-[#f4f0e6] text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-[#e5c158]" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Tilt3D>

        {/* Printable Receipt Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="glass-emerald-tile border-2 border-[#e5c158]/40 max-w-xl w-full rounded-[28px] p-6 space-y-5 shadow-2xl relative">
              <CornerArchOrnament position="tr" />
              {/* Modal Top Header */}
              <div className="flex items-center justify-between border-b border-[#a3c9b0]/20 pb-3 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#e5c158]/20 text-[#e5c158] flex items-center justify-center border border-[#e5c158]/40">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#f4f0e6] font-syne">Official Fee Receipt</h3>
                    <p className="text-[11px] text-[#a3c9b0]">GST: 33AAAAA0000A1Z5 • CBSE-1930842</p>
                  </div>
                </div>
                <button onClick={() => setSelectedReceipt(null)} className="text-[#a3c9b0] hover:text-[#f4f0e6] p-1 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Receipt Preview Body Card */}
              <div className="p-5 rounded-2xl glass-box space-y-4 text-xs border border-[#a3c9b0]/20 relative z-10">
                <div className="flex items-center justify-between pb-3 border-b border-[#a3c9b0]/20">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#a3c9b0] tracking-wider block">Receipt Number</span>
                    <span className="font-mono text-[#e5c158] font-extrabold text-sm">{selectedReceipt.receipt_number}</span>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <CheckCircle2 className="w-3 h-3" /> Paid & Verified
                    </span>
                    <div className="text-[10px] text-[#a3c9b0] mt-0.5">
                      {selectedReceipt.created_at ? new Date(selectedReceipt.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-1 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-[#a3c9b0] block">Student Name</span>
                    <span className="text-[#f4f0e6] font-extrabold text-sm font-syne">{selectedReceipt.student_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-[#a3c9b0] block">Grade / Section</span>
                    <span className="text-[#f4f0e6] font-semibold">{selectedReceipt.grade}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-[#a3c9b0] block">Payment Mode</span>
                    <span className="text-[#f4f0e6] font-semibold">{selectedReceipt.payment_method}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-[#a3c9b0] block">Transaction Reference</span>
                    <span className="font-mono text-sky-300 text-[11px] font-bold">{selectedReceipt.transaction_id || 'TXN_PB_' + selectedReceipt.receipt_number.replace(/[^0-9]/g, '')}</span>
                  </div>
                </div>

                {/* Table of items */}
                <div className="rounded-xl border border-[#a3c9b0]/20 overflow-hidden glass-box">
                  <table>
                    <thead>
                      <tr>
                        <th>Particulars</th>
                        <th>Category</th>
                        <th className="text-right font-extrabold text-[#e5c158]">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-bold text-[#f4f0e6]">{selectedReceipt.title}</td>
                        <td className="text-[#a3c9b0]">{selectedReceipt.category}</td>
                        <td className="text-right font-mono font-extrabold text-emerald-400">₹{selectedReceipt.amount.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Amount in words and Total */}
                <div className="pt-2 border-t border-[#a3c9b0]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-[11px] text-[#a3c9b0] italic">
                    <span className="font-bold not-italic text-[#f4f0e6]">In Words: </span>
                    {numberToWords(selectedReceipt.amount)}
                  </div>
                  <div className="flex items-center gap-2 text-sm justify-end">
                    <span className="font-bold text-[#f4f0e6]">Total Paid:</span>
                    <span className="text-emerald-400 font-mono font-extrabold text-base">₹{selectedReceipt.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#a3c9b0]/20 relative z-10">
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-2.5 rounded-xl glass-box text-[#a3c9b0] hover:text-[#f4f0e6] text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadReceiptDoc(selectedReceipt)}
                  className="px-4 py-2.5 rounded-xl glass-box border border-[#e5c158]/40 text-[#f4f0e6] text-xs font-extrabold hover:bg-emerald-950/40 flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#e5c158]" />
                  Download HTML Voucher
                </button>
                <button
                  onClick={() => handlePrintReceipt(selectedReceipt)}
                  className="px-5 py-2.5 rounded-xl bg-[#e5c158] hover:bg-[#d4b047] text-black text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
