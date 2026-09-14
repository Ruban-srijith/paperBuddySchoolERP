"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { 
  Receipt, 
  Plus, 
  Download, 
  Search, 
  Filter, 
  TrendingDown, 
  Building2, 
  Store, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Trash2, 
  ShieldCheck, 
  PieChart
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";

interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  expense_date: string;
  department_id?: string;
  department_name: string;
  vendor_id?: string;
  vendor_name: string;
}

interface FinancialRequestItem {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: string;
  priority: string;
  created_at: string;
  requester_name: string;
  department_name: string;
}

interface DepartmentBudget {
  id: string;
  department_name: string;
  academic_year: string;
  allocated_amount: number;
  utilized_amount: number;
}

interface VendorItem {
  id: string;
  name: string;
  category: string;
  contact_email?: string;
  contact_phone?: string;
  active_contract?: boolean;
}

export default function ExpensesPortal() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"ledger" | "requisitions" | "budgets" | "vendors">("ledger");
  
  // Data states
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [requests, setRequests] = useState<FinancialRequestItem[]>([]);
  const [budgets, setBudgets] = useState<DepartmentBudget[]>([]);
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("all");

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  // Form states
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    department_id: "",
    vendor_id: "",
    expense_date: new Date().toISOString().split("T")[0],
  });

  const [requestForm, setRequestForm] = useState({
    title: "",
    department_id: "",
    amount: "",
    priority: "normal",
    description: "",
  });

  const [vendorForm, setVendorForm] = useState({
    name: "",
    category: "Stationery & Supplies",
    contact_email: "",
    contact_phone: "",
  });

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [expRes, reqRes, budRes, venRes] = await Promise.all([
        api.get("/finance/expenses").catch(() => ({ data: [] })),
        api.get("/finance/requests").catch(() => ({ data: [] })),
        api.get("/finance/budgets").catch(() => ({ data: [] })),
        api.get("/finance/vendors").catch(() => ({ data: [] })),
      ]);
      setExpenses(expRes.data || []);
      setRequests(reqRes.data || []);
      setBudgets(budRes.data || []);
      setVendors(venRes.data || []);
    } catch (err) {
      console.error("Failed to load finance data", err);
      toast.error("Failed to load finance records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handlers
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.title.trim() || !expenseForm.amount) {
      toast.error("Please provide title and amount");
      return;
    }
    try {
      await api.post("/finance/expenses", {
        title: expenseForm.title.trim(),
        amount: parseFloat(expenseForm.amount),
        department_id: expenseForm.department_id || undefined,
        vendor_id: expenseForm.vendor_id || undefined,
        expense_date: expenseForm.expense_date,
      });
      toast.success("Expense logged successfully!", "Disbursement Recorded");
      setIsExpenseModalOpen(false);
      setExpenseForm({
        title: "",
        amount: "",
        department_id: "",
        vendor_id: "",
        expense_date: new Date().toISOString().split("T")[0],
      });
      fetchAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to log expense");
    }
  };

  const handleDeleteExpense = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the expense entry: "${title}"?`)) return;
    try {
      await api.delete(`/finance/expenses/${id}`);
      toast.success("Expense entry removed");
      setExpenses(prev => prev.filter(e => e.id !== id));
      fetchAllData();
    } catch (err) {
      toast.error("Failed to delete expense");
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.title.trim() || !requestForm.department_id || !requestForm.amount) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      await api.post("/finance/requests", {
        title: requestForm.title.trim(),
        department_id: requestForm.department_id,
        amount: parseFloat(requestForm.amount),
        priority: requestForm.priority,
        description: requestForm.description.trim() || "Requisition for department operations",
      });
      toast.success("Procurement requisition submitted", "Request Filed");
      setIsRequestModalOpen(false);
      setRequestForm({
        title: "",
        department_id: "",
        amount: "",
        priority: "normal",
        description: "",
      });
      fetchAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to submit requisition");
    }
  };

  const handleApproveRequest = async (id: string, status: "approved_by_finance" | "rejected") => {
    try {
      await api.put(`/finance/requests/${id}/approve`, { status });
      toast.success(status === "approved_by_finance" ? "Requisition approved by Finance" : "Requisition rejected");
      fetchAllData();
    } catch (err) {
      toast.error("Failed to update requisition status");
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name.trim()) {
      toast.error("Vendor name is required");
      return;
    }
    try {
      await api.post("/finance/vendors", {
        name: vendorForm.name.trim(),
        category: vendorForm.category,
        contact_email: vendorForm.contact_email.trim() || undefined,
        contact_phone: vendorForm.contact_phone.trim() || undefined,
      });
      toast.success("Vendor added to registry", vendorForm.name);
      setIsVendorModalOpen(false);
      setVendorForm({
        name: "",
        category: "Stationery & Supplies",
        contact_email: "",
        contact_phone: "",
      });
      fetchAllData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to add vendor");
    }
  };

  const handleExportCSV = () => {
    try {
      const dataToExport = filteredExpenses;
      if (dataToExport.length === 0) {
        toast.info("No expense records available to export");
        return;
      }
      const headers = ["Expense ID", "Date", "Title / Item", "Department", "Vendor / Payee", "Amount (INR)", "Status"];
      const rows = dataToExport.map(e => [
        `"${e.id.substring(0, 8)}"`,
        `"${e.expense_date}"`,
        `"${e.title.replace(/"/g, '""')}"`,
        `"${e.department_name.replace(/"/g, '""')}"`,
        `"${e.vendor_name.replace(/"/g, '""')}"`,
        e.amount,
        `"Disbursed"`
      ]);

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `School_Expense_Ledger_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${dataToExport.length} expense record(s) to CSV`, "Export Ready");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate CSV export");
    }
  };

  // Calculations
  const totalExpenseAmount = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalBudgetAllocated = budgets.reduce((acc, curr) => acc + (curr.allocated_amount || 0), 0);
  const totalBudgetUtilized = budgets.reduce((acc, curr) => acc + (curr.utilized_amount || 0), 0);
  const overallBudgetRatio = totalBudgetAllocated > 0 ? Math.round((totalBudgetUtilized / totalBudgetAllocated) * 100) : 0;
  const pendingRequestsCount = requests.filter(r => r.status === "pending").length;

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDeptFilter === "all" || e.department_id === selectedDeptFilter || e.department_name === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'principal', 'finance']}>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" /> Finance & Institutional Procurement
              </span>
              <span className="text-xs text-gray-400">• AY 2026–2027</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
              Expenses & Procurement Portal
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              Manage operational disbursements, departmental requisitions, vendor contracts, and budget allocations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-gray-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-all"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Requisition</span>
            </button>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm shadow-rose-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        {/* High-Level Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Disbursed</span>
              <div className="text-2xl font-black text-gray-900 font-mono">
                ₹{totalExpenseAmount.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Verified School Outflows</span>
              </div>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <Receipt className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Budget Allocation</span>
              <div className="text-2xl font-black text-gray-900 font-mono">
                ₹{totalBudgetAllocated.toLocaleString()}
              </div>
              <div className="text-[11px] text-indigo-600 font-medium flex items-center gap-1">
                <PieChart className="w-3.5 h-3.5" />
                <span>{overallBudgetRatio}% Utilized (₹{totalBudgetUtilized.toLocaleString()})</span>
              </div>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pending Requisitions</span>
              <div className="text-2xl font-black text-amber-600 font-mono">
                {pendingRequestsCount}
              </div>
              <div className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Awaiting Super Admin / Finance</span>
              </div>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Approved Vendors</span>
              <div className="text-2xl font-black text-gray-900 font-mono">
                {vendors.length}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Active Supply Contracts</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <Store className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 gap-2">
          <button
            onClick={() => setActiveTab("ledger")}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "ledger"
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Expense Ledger ({expenses.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("requisitions")}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "requisitions"
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Procurement & Requisitions</span>
            {pendingRequestsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {pendingRequestsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("budgets")}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "budgets"
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Department Budgets ({budgets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("vendors")}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === "vendors"
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Vendor Directory ({vendors.length})</span>
          </button>
        </div>

        {/* TAB 1: EXPENSE LEDGER */}
        {activeTab === "ledger" && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, department, or vendor..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedDeptFilter}
                  onChange={e => setSelectedDeptFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-rose-500"
                >
                  <option value="all">All Departments</option>
                  {budgets.map(b => (
                    <option key={b.id} value={b.id}>{b.department_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600 min-w-max">
                  <thead className="bg-gray-50/80 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5">Date & ID</th>
                      <th className="px-6 py-3.5">Expense Description</th>
                      <th className="px-6 py-3.5">Department</th>
                      <th className="px-6 py-3.5">Vendor / Payee</th>
                      <th className="px-6 py-3.5 text-right">Amount (INR)</th>
                      <th className="px-6 py-3.5 text-center">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-rose-50/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{exp.expense_date}</div>
                          <div className="text-[10px] font-mono text-gray-400">#{exp.id.substring(0, 8)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{exp.title}</div>
                          <div className="text-[10px] text-gray-400">Institutional Operational Expense</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                            {exp.department_name}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-800">{exp.vendor_name}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-mono font-bold text-sm text-gray-900">
                            ₹{exp.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase">
                            Disbursed
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteExpense(exp.id, exp.title)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredExpenses.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-400">
                          <Receipt className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                          <p className="font-semibold text-gray-600">No expense records found</p>
                          <p className="text-xs text-gray-400 mt-1">Log a new expense to start tracking disbursements.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROCUREMENT & REQUISITIONS */}
        {activeTab === "requisitions" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Department Purchase Requisitions</h3>
                  <p className="text-xs text-gray-500">Review, approve, or reject procurement requests filed by department heads.</p>
                </div>
                <button
                  onClick={() => setIsRequestModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Requisition</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600 min-w-max">
                  <thead className="bg-gray-50/80 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5">Requisition</th>
                      <th className="px-6 py-3.5">Department</th>
                      <th className="px-6 py-3.5">Requested By</th>
                      <th className="px-6 py-3.5">Priority</th>
                      <th className="px-6 py-3.5 text-right">Est. Amount</th>
                      <th className="px-6 py-3.5 text-center">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{req.title}</div>
                          <div className="text-[11px] text-gray-500 truncate max-w-xs">{req.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-gray-800">{req.department_name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-700">{req.requester_name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            req.priority === 'urgent' ? 'bg-rose-100 text-rose-700' :
                            req.priority === 'high' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-50 text-blue-700'
                          }`}>
                            {req.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-mono font-bold text-gray-900">
                            ₹{req.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                            req.status === 'approved_by_finance' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            req.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {req.status === 'approved_by_finance' ? 'Approved' : req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {req.status === 'pending' ? (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleApproveRequest(req.id, "approved_by_finance")}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] border border-emerald-200"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleApproveRequest(req.id, "rejected")}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[11px] border border-rose-200"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-400">
                          <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                          <p className="font-semibold text-gray-600">No requisitions on file</p>
                          <p className="text-xs text-gray-400 mt-1">Submit a purchase requisition to begin approval workflow.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DEPARTMENT BUDGETS */}
        {activeTab === "budgets" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((b) => {
              const utilPercent = b.allocated_amount > 0 ? Math.round(((b.utilized_amount || 0) / b.allocated_amount) * 100) : 0;
              const remaining = Math.max(0, b.allocated_amount - (b.utilized_amount || 0));
              return (
                <div key={b.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm leading-tight">{b.department_name}</h4>
                      <span className="text-[10px] text-gray-400 font-mono">AY {b.academic_year}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      utilPercent > 90 ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      utilPercent > 70 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {utilPercent}% Utilized
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-gray-500">Utilized: ₹{(b.utilized_amount || 0).toLocaleString()}</span>
                      <span className="text-gray-900 font-bold">Total: ₹{b.allocated_amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          utilPercent > 90 ? 'bg-rose-500' : utilPercent > 70 ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.min(100, utilPercent)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Remaining Funds:</span>
                    <span className="font-mono font-bold text-emerald-700">₹{remaining.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 4: VENDOR DIRECTORY */}
        {activeTab === "vendors" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Approved Institutional Vendors</h3>
                <p className="text-xs text-gray-500">Contracted suppliers for school materials, labs, IT infrastructure, and facilities.</p>
              </div>
              <button
                onClick={() => setIsVendorModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vendor</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map((v) => (
                <div key={v.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm leading-tight">{v.name}</h4>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-semibold">
                        {v.category}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      Active
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="font-medium text-gray-800">{v.contact_email || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Phone:</span>
                      <span className="font-mono text-gray-800">{v.contact_phone || "N/A"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL 1: LOG EXPENSE */}
        {isExpenseModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Log Disbursement</h3>
                    <p className="text-xs text-gray-500">Record a new school expenditure</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 uppercase tracking-wider block">Expense Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Lab Reagents & Microscope Slides"
                    value={expenseForm.title}
                    onChange={e => setExpenseForm({...expenseForm, title: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 uppercase tracking-wider block">Amount (INR) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder="e.g. 15000"
                      value={expenseForm.amount}
                      onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 uppercase tracking-wider block">Disbursement Date</label>
                    <input
                      type="date"
                      value={expenseForm.expense_date}
                      onChange={e => setExpenseForm({...expenseForm, expense_date: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 uppercase tracking-wider block">Department Budget</label>
                  <select
                    value={expenseForm.department_id}
                    onChange={e => setExpenseForm({...expenseForm, department_id: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-rose-500"
                  >
                    <option value="">-- Direct Institution Outflow --</option>
                    {budgets.map(b => (
                      <option key={b.id} value={b.id}>{b.department_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 uppercase tracking-wider block">Vendor / Payee</label>
                  <select
                    value={expenseForm.vendor_id}
                    onChange={e => setExpenseForm({...expenseForm, vendor_id: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-rose-500"
                  >
                    <option value="">-- Direct / Petty Cash --</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsExpenseModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm shadow-rose-600/20"
                  >
                    Save Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: PURCHASE REQUISITION */}
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">New Purchase Requisition</h3>
                    <p className="text-xs text-gray-500">Submit procurement request for approval</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsRequestModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 uppercase tracking-wider block">Item / Requisition Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50x High School Chemistry Lab Flasks"
                    value={requestForm.title}
                    onChange={e => setRequestForm({...requestForm, title: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 uppercase tracking-wider block">Estimated Amount *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 24000"
                      value={requestForm.amount}
                      onChange={e => setRequestForm({...requestForm, amount: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 uppercase tracking-wider block">Priority</label>
                    <select
                      value={requestForm.priority}
                      onChange={e => setRequestForm({...requestForm, priority: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 uppercase tracking-wider block">Target Department *</label>
                  <select
                    required
                    value={requestForm.department_id}
                    onChange={e => setRequestForm({...requestForm, department_id: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">-- Select Department --</option>
                    {budgets.map(b => (
                      <option key={b.id} value={b.id}>{b.department_name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 uppercase tracking-wider block">Justification / Details</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details on curricular necessity or urgency..."
                    value={requestForm.description}
                    onChange={e => setRequestForm({...requestForm, description: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
                  >
                    Submit Requisition
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: ADD VENDOR */}
        {isVendorModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-gray-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">Register Approved Vendor</h3>
                    <p className="text-xs text-gray-500">Add a new supplier to institutional registry</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsVendorModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateVendor} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 uppercase tracking-wider block">Vendor Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Edutech Labs & Hardware"
                    value={vendorForm.name}
                    onChange={e => setVendorForm({...vendorForm, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 uppercase tracking-wider block">Supply Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IT Equipment, Stationery, Catering"
                    value={vendorForm.category}
                    onChange={e => setVendorForm({...vendorForm, category: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 uppercase tracking-wider block">Contact Email</label>
                    <input
                      type="email"
                      placeholder="vendor@company.com"
                      value={vendorForm.contact_email}
                      onChange={e => setVendorForm({...vendorForm, contact_email: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 uppercase tracking-wider block">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={vendorForm.contact_phone}
                      onChange={e => setVendorForm({...vendorForm, contact_phone: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsVendorModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm"
                  >
                    Register Vendor
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
