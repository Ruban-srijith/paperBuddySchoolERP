"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { CheckSquare, LogIn, LogOut, Search, X } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function LibrarianIssues() {
  const { toast } = useToast();
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [studentId, setStudentId] = useState("");
  const [bookId, setBookId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [returnIssueId, setReturnIssueId] = useState("");

  const fetchIssues = async () => {
    try {
      const res = await api.get("/librarian/issues");
      setIssues(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAuxData = async () => {
    try {
      const [bRes, mRes] = await Promise.allSettled([
        api.get("/librarian/books"),
        api.get("/librarian/members")
      ]);
      if (bRes.status === "fulfilled") setBooks(bRes.value.data || []);
      if (mRes.status === "fulfilled") setMembers(mRes.value.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchAuxData();
  }, []);

  const openIssueModal = () => {
    // Default due date to 14 days from now
    const defaultDue = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    setDueDate(defaultDue);
    setShowIssueModal(true);
    fetchAuxData();
  };

  const handleIssue = async () => {
    if (!studentId.trim()) {
      toast.error("Please enter or select a student");
      return;
    }
    if (!bookId.trim()) {
      toast.error("Please enter or select a book");
      return;
    }

    const defaultDue = dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

    try {
      await api.post("/librarian/issues", {
        book_id: bookId.trim(),
        user_id: studentId.trim(),
        due_date: defaultDue
      });
      toast.success("Book issued successfully");
      setShowIssueModal(false);
      setBookId("");
      setStudentId("");
      setDueDate("");
      fetchIssues();
      fetchAuxData();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Failed to issue book";
      toast.error(errorMsg);
    }
  };

  const handleReturn = async (issueId: string) => {
    if (!issueId.trim()) {
      toast.error("Please select or enter an Issue ID");
      return;
    }
    try {
      await api.put(`/librarian/issues/${issueId.trim()}/return`);
      toast.success("Book returned successfully");
      setShowReturnModal(false);
      setReturnIssueId("");
      fetchIssues();
      fetchAuxData();
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || "Failed to return book";
      toast.error(errorMsg);
    }
  };

  const filteredIssues = issues.filter(i => {
    const q = search.toLowerCase();
    const matchesSearch = 
      !search ||
      i.user_id?.toLowerCase().includes(q) || 
      i.user_name?.toLowerCase().includes(q) ||
      i.user_email?.toLowerCase().includes(q) ||
      i.user_roll?.toLowerCase().includes(q) ||
      i.book_id?.toLowerCase().includes(q) ||
      i.book_title?.toLowerCase().includes(q) ||
      i.book_author?.toLowerCase().includes(q);
    
    if (!matchesSearch) return false;
    if (statusFilter === "All Status" || !statusFilter) return true;
    return i.status?.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <ProtectedRoute allowedRoles={['librarian', 'super_admin', 'principal', 'correspondent']}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-emerald-600" />
              Book Issues & Returns
            </h1>
            <p className="text-gray-600 mt-2">Track issued books, manage returns, and monitor overdue fines.</p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <button 
              onClick={openIssueModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-brand-black px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shrink-0 whitespace-nowrap"
            >
              <LogOut className="w-4 h-4" /> Issue Book
            </button>
            <button 
              onClick={() => setShowReturnModal(true)}
              className="bg-gray-100 hover:bg-gray-700 text-brand-black border border-gray-200 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shrink-0 whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" /> Process Return
            </button>
          </div>
        </header>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by student, book, or ID..." 
                className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full md:w-auto bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="All Status">All Status</option>
              <option value="issued">Issued</option>
              <option value="overdue">Overdue</option>
              <option value="returned">Returned</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 min-w-max">
              <thead className="bg-gray-100 text-gray-700 uppercase font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-center">Fine</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredIssues.map((issue) => {
                  const issueDate = issue.issue_date 
                    ? new Date(issue.issue_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '-';
                  const due = issue.due_date 
                    ? new Date(issue.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '-';
                  const isOverdue = issue.due_date && new Date() > new Date(issue.due_date) && issue.status !== 'returned';
                  
                  return (
                    <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-brand-black">
                        <div>{issue.book_title || `Book ID: ${issue.book_id?.substring(0,8)}`}</div>
                        {issue.book_author && <div className="text-xs text-gray-500 font-normal">{issue.book_author}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700 font-medium">{issue.user_name || `User: ${issue.user_id?.substring(0,8)}`}</div>
                        <div className="text-xs text-gray-500">{issue.user_roll || issue.user_email || issue.user_id?.substring(0,8)}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{issueDate}</td>
                      <td className={`px-6 py-4 font-bold ${isOverdue ? 'text-rose-500' : 'text-emerald-600'}`}>{due}</td>
                      <td className="px-6 py-4 text-center font-bold text-rose-500">
                        {issue.fine_amount > 0 ? `₹${issue.fine_amount}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {issue.status === 'returned' ? (
                           <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">Returned</span>
                        ) : isOverdue ? (
                           <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200">Overdue</span>
                        ) : (
                           <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Issued</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {issue.status !== 'returned' && (
                          <button onClick={() => handleReturn(issue.id)} className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors ${isOverdue ? 'text-emerald-700 hover:text-emerald-800 bg-emerald-50 border-emerald-200' : 'text-gray-700 hover:text-brand-black bg-gray-100 border-gray-300'}`}>
                            {isOverdue ? 'Return & Pay Fine' : 'Return Book'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredIssues.length === 0 && (
                   <tr><td colSpan={7} className="text-center py-8 text-gray-500">No issues found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issue Book Modal */}
        {showIssueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-black">Issue Book</h3>
                <button onClick={() => setShowIssueModal(false)} className="text-gray-600 hover:text-brand-black transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student / Member</label>
                  {members.length > 0 && (
                    <select 
                      value={studentId}
                      onChange={e => setStudentId(e.target.value)}
                      className="w-full mb-2 bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Select from registered members --</option>
                      {members.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.full_name} ({m.roll_number || m.admission_number || m.email || m.role})
                        </option>
                      ))}
                    </select>
                  )}
                  <input 
                    list="student-list-opts"
                    value={studentId} 
                    onChange={e => setStudentId(e.target.value)} 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 text-sm" 
                    placeholder="Or type Student Name, Roll No, Email, or ID" 
                  />
                  <datalist id="student-list-opts">
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.full_name} ({m.email || m.roll_number})</option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Book</label>
                  {books.length > 0 && (
                    <select 
                      value={bookId}
                      onChange={e => setBookId(e.target.value)}
                      className="w-full mb-2 bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Select from library catalog --</option>
                      {books.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.title} ({b.available_copies} available)
                        </option>
                      ))}
                    </select>
                  )}
                  <input 
                    list="book-list-opts"
                    value={bookId} 
                    onChange={e => setBookId(e.target.value)} 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 text-sm" 
                    placeholder="Or type Book Title, ISBN, Author, or ID" 
                  />
                  <datalist id="book-list-opts">
                    {books.map(b => (
                      <option key={b.id} value={b.id}>{b.title} ({b.author})</option>
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input 
                    value={dueDate} 
                    onChange={e => setDueDate(e.target.value)} 
                    type="date" 
                    className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 text-sm" 
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setShowIssueModal(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:text-brand-black transition-colors">Cancel</button>
                <button onClick={handleIssue} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">Confirm Issue</button>
              </div>
            </div>
          </div>
        )}

        {/* Process Return Modal */}
        {showReturnModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-black">Process Return</h3>
                <button onClick={() => setShowReturnModal(false)} className="text-gray-600 hover:text-brand-black transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Active Issue / Return Book</label>
                  {issues.filter(i => i.status !== 'returned').length > 0 && (
                    <select 
                      value={returnIssueId}
                      onChange={e => setReturnIssueId(e.target.value)}
                      className="w-full mb-2 bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">-- Select active issued book --</option>
                      {issues.filter(i => i.status !== 'returned').map(i => (
                        <option key={i.id} value={i.id}>
                          {i.book_title || i.book_id} issued to {i.user_name || i.user_id}
                        </option>
                      ))}
                    </select>
                  )}
                  <input 
                    value={returnIssueId} 
                    onChange={e => setReturnIssueId(e.target.value)} 
                    type="text" 
                    className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500" 
                    placeholder="Or enter Issue ID" 
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setShowReturnModal(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:text-brand-black transition-colors">Cancel</button>
                <button onClick={() => handleReturn(returnIssueId)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">Process Return</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

