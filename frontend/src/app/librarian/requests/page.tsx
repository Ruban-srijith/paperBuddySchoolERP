"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { 
  FileSearch, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Plus, 
  Download, 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  CheckCheck, 
  Building2, 
  Trash2, 
  User, 
  DollarSign, 
  Sparkles,
  BookMarked
} from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";

interface BookRequestItem {
  id: string;
  requested_by: string;
  requester_name: string;
  requester_email: string;
  requester_role: string;
  title: string;
  author: string;
  reason: string;
  status: string;
  created_at: string;
}

export default function LibrarianRequests() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<BookRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: "",
    author: "",
    reason: "",
    target_grade: "High School (Grades 9-12)",
    estimated_price: "",
  });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/librarian/requests");
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch book procurement requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/librarian/requests/${id}/status`, { status });
      toast.success(`Request status updated to "${status}"`, "Workflow Updated");
      fetchRequests();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteRequest = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove book request for "${title}"?`)) return;
    try {
      await api.delete(`/librarian/requests/${id}`);
      toast.success("Book request record removed");
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      toast.error("Failed to delete request");
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.title.trim()) {
      toast.error("Book title is required");
      return;
    }

    try {
      const payload = {
        title: newRequest.title.trim(),
        author: newRequest.author.trim() || undefined,
        reason: newRequest.reason.trim() || `Required for ${newRequest.target_grade} curricular reference`,
        priority: "Normal",
        estimated_price: newRequest.estimated_price ? parseFloat(newRequest.estimated_price) : undefined,
        target_grade: newRequest.target_grade,
      };

      await api.post("/librarian/requests", payload);
      toast.success("Book request submitted for library procurement", newRequest.title);
      setIsModalOpen(false);
      setNewRequest({
        title: "",
        author: "",
        reason: "",
        target_grade: "High School (Grades 9-12)",
        estimated_price: "",
      });
      fetchRequests();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create book request");
    }
  };

  const handleExportCSV = () => {
    try {
      const dataToExport = filteredRequests;
      if (dataToExport.length === 0) {
        toast.info("No requests available to export");
        return;
      }

      const headers = ["Request ID", "Book Title", "Author", "Requester Name", "Requester Role", "Curricular Reason", "Status", "Date Submitted"];
      const rows = dataToExport.map(r => [
        `"${r.id.substring(0, 8)}"`,
        `"${r.title.replace(/"/g, '""')}"`,
        `"${(r.author || 'N/A').replace(/"/g, '""')}"`,
        `"${(r.requester_name || 'N/A').replace(/"/g, '""')}"`,
        `"${r.requester_role || 'teacher'}"`,
        `"${(r.reason || 'N/A').replace(/"/g, '""')}"`,
        `"${r.status}"`,
        `"${r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : 'N/A'}"`
      ]);

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Library_Book_Requests_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${dataToExport.length} request(s) to CSV`, "Export Ready");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate CSV export");
    }
  };

  // Metrics
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved" || r.status === "ordered").length;
  const financeCount = requests.filter(r => r.status === "Sent to Finance").length;
  const fulfilledCount = requests.filter(r => r.status === "fulfilled").length;

  const filteredRequests = requests.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = 
      (r.title || "").toLowerCase().includes(q) ||
      (r.author || "").toLowerCase().includes(q) ||
      (r.requester_name || "").toLowerCase().includes(q) ||
      (r.reason || "").toLowerCase().includes(q);

    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "pending" && r.status === "pending") ||
      (statusFilter === "approved" && (r.status === "approved" || r.status === "ordered")) ||
      (statusFilter === "finance" && r.status === "Sent to Finance") ||
      (statusFilter === "fulfilled" && r.status === "fulfilled") ||
      (statusFilter === "rejected" && r.status === "rejected");

    return matchesQuery && matchesStatus;
  });

  return (
    <ProtectedRoute allowedRoles={['librarian', 'super_admin', 'principal', 'correspondent']}>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-pink-50 text-pink-700 border border-pink-100 flex items-center gap-1.5">
                <BookMarked className="w-3.5 h-3.5" /> Library Procurement Workflow
              </span>
              <span className="text-xs text-gray-400">• AY 2026–2027</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
              Book Requests & Procurement
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              Review faculty book requisition proposals, coordinate budget approvals with Finance, and order catalog titles.
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
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold shadow-sm shadow-pink-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Book Request</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Requests</span>
              <div className="text-2xl font-black text-gray-900 font-mono">{totalCount}</div>
              <span className="text-[10px] text-gray-400">All Requisitions</span>
            </div>
            <div className="p-3 bg-pink-50 text-pink-600 rounded-xl border border-pink-100">
              <FileSearch className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Pending Review</span>
              <div className="text-2xl font-black text-amber-600 font-mono">{pendingCount}</div>
              <span className="text-[10px] text-amber-600 font-medium">Awaiting Action</span>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Approved / Ordered</span>
              <div className="text-2xl font-black text-emerald-600 font-mono">{approvedCount}</div>
              <span className="text-[10px] text-emerald-600 font-medium">Procurement Active</span>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Sent to Finance</span>
              <div className="text-2xl font-black text-cyan-600 font-mono">{financeCount}</div>
              <span className="text-[10px] text-cyan-600 font-medium">Budget Clearance</span>
            </div>
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-100">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Fulfilled & Cataloged</span>
              <div className="text-2xl font-black text-indigo-600 font-mono">{fulfilledCount}</div>
              <span className="text-[10px] text-indigo-600 font-medium">Available in Library</span>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <CheckCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, author, or requester..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {[
              { id: "all", label: "All Requests" },
              { id: "pending", label: "Pending" },
              { id: "approved", label: "Approved" },
              { id: "finance", label: "Sent to Finance" },
              { id: "fulfilled", label: "Fulfilled" },
              { id: "rejected", label: "Rejected" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? "bg-pink-600 text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 min-w-max">
              <thead className="bg-gray-50/80 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Book Details</th>
                  <th className="px-6 py-3.5">Requested By</th>
                  <th className="px-6 py-3.5">Curricular Reason / Purpose</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                  <th className="px-6 py-3.5 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-pink-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 mt-0.5">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm leading-tight">{req.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">by {req.author || "Unknown Author"}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{req.requester_name}</div>
                      <div className="text-[10px] text-gray-400 capitalize">{req.requester_role} • {req.requester_email}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-gray-700 max-w-sm leading-relaxed">{req.reason || "-"}</div>
                      {req.created_at && (
                        <span className="text-[10px] text-gray-400 block mt-1">
                          Submitted on {new Date(req.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        req.status === 'approved' || req.status === 'ordered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : req.status === 'rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : req.status === 'Sent to Finance'
                          ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                          : req.status === 'fulfilled'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {req.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'approved')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] border border-emerald-200 transition-colors"
                              title="Approve & Order"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'Sent to Finance')}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-700 hover:bg-cyan-100 font-semibold text-[11px] border border-cyan-200 transition-colors"
                              title="Forward Budget to Finance"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Finance</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(req.id, 'rejected')}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[11px] border border-rose-200 transition-colors"
                              title="Reject Request"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {(req.status === 'approved' || req.status === 'Sent to Finance') && (
                          <button
                            onClick={() => handleUpdateStatus(req.id, 'fulfilled')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-[11px] border border-indigo-200 transition-colors"
                            title="Mark as Received & Available"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Mark Fulfilled</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteRequest(req.id, req.title)}
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                          title="Delete Request"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-gray-400">
                      <FileSearch className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="font-semibold text-gray-600">No book requests found</p>
                      <p className="text-xs text-gray-400 mt-1">Submit a book requisition to start the acquisition workflow.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* NEW BOOK REQUEST MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-pink-50 text-pink-600 rounded-xl">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">New Book Request</h3>
                    <p className="text-xs text-gray-500">Request book title for library acquisition</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700 uppercase tracking-wider block">Book Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. S. Chand Principles of Physics"
                    value={newRequest.title}
                    onChange={e => setNewRequest({...newRequest, title: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 uppercase tracking-wider block">Author / Publication</label>
                  <input
                    type="text"
                    placeholder="e.g. V. K. Mehta & Rohit Mehta"
                    value={newRequest.author}
                    onChange={e => setNewRequest({...newRequest, author: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 uppercase tracking-wider block">Target Grade</label>
                    <select
                      value={newRequest.target_grade}
                      onChange={e => setNewRequest({...newRequest, target_grade: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-pink-500"
                    >
                      <option value="Primary (Grades 1-5)">Primary (Grades 1-5)</option>
                      <option value="Middle School (Grades 6-8)">Middle School (Grades 6-8)</option>
                      <option value="High School (Grades 9-10)">High School (Grades 9-10)</option>
                      <option value="Higher Secondary (Grades 11-12)">Higher Secondary (Grades 11-12)</option>
                      <option value="Faculty Reference">Faculty Reference</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 uppercase tracking-wider block">Est. Cost (INR)</label>
                    <input
                      type="number"
                      placeholder="e.g. 750"
                      value={newRequest.estimated_price}
                      onChange={e => setNewRequest({...newRequest, estimated_price: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-mono focus:outline-none focus:border-pink-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700 uppercase tracking-wider block">Academic Purpose / Justification</label>
                  <textarea
                    rows={3}
                    placeholder="Describe how this book will benefit students, olympiad preparation, or syllabus coverage..."
                    value={newRequest.reason}
                    onChange={e => setNewRequest({...newRequest, reason: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold shadow-sm shadow-pink-600/20"
                  >
                    Submit Request
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
