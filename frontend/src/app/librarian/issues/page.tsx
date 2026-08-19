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
  const [search, setSearch] = useState("");

  const [studentId, setStudentId] = useState("");
  const [bookId, setBookId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [returnIssueId, setReturnIssueId] = useState("");

  const fetchIssues = async () => {
    try {
      const res = await api.get("/librarian/issues");
      setIssues(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleIssue = async () => {
    try {
      await api.post("/librarian/issues", {
        book_id: bookId,
        user_id: studentId,
        due_date: dueDate
      });
      toast.success("Book issued successfully");
      setShowIssueModal(false);
      setBookId("");
      setStudentId("");
      setDueDate("");
      fetchIssues();
    } catch (err) {
      toast.error("Failed to issue book");
    }
  };

  const handleReturn = async (issueId: string) => {
    try {
      await api.put(`/librarian/issues/${issueId}/return`);
      toast.success("Book returned successfully");
      fetchIssues();
    } catch (err) {
      toast.error("Failed to return book");
    }
  };

  const filteredIssues = issues.filter(i => 
    i.user_id?.toLowerCase().includes(search.toLowerCase()) || 
    i.book_id?.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <ProtectedRoute allowedRoles={['librarian', 'super_admin', 'principal']}>
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
              onClick={() => setShowIssueModal(true)}
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

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-500" />
              <input 
                type="text" 
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by Student ID or Book ID..." 
                className="w-full bg-gray-50 border border-gray-200 text-brand-black rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <select className="w-full md:w-auto bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500">
              <option>All Status</option>
              <option>Issued</option>
              <option>Overdue</option>
              <option>Returned</option>
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
              <tbody className="divide-y divide-gray-800">
                {filteredIssues.map((issue) => {
                  const issueDate = new Date(issue.issue_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const due = new Date(issue.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const isOverdue = new Date() > new Date(issue.due_date) && issue.status !== 'returned';
                  
                  return (
                    <tr key={issue.id} className="hover:bg-gray-100/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-brand-black">Book ID: {issue.book_id.substring(0,8)}</td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700 font-medium">User: {issue.user_id.substring(0,8)}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{issueDate}</td>
                      <td className={`px-6 py-4 font-bold ${isOverdue ? 'text-rose-400' : 'text-emerald-600'}`}>{due}</td>
                      <td className="px-6 py-4 text-center font-bold text-rose-400">
                        {issue.fine_amount > 0 ? `₹${issue.fine_amount}` : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {issue.status === 'returned' ? (
                           <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-600 border border-gray-500/20">Returned</span>
                        ) : isOverdue ? (
                           <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">Overdue</span>
                        ) : (
                           <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Issued</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {issue.status !== 'returned' && (
                          <button onClick={() => handleReturn(issue.id)} className={`text-xs font-bold px-3 py-1 rounded-full border transition-colors ${isOverdue ? 'text-emerald-600 hover:text-emerald-300 bg-emerald-500/10 border-emerald-500/20' : 'text-gray-600 hover:text-brand-black bg-gray-100'}`}>
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
            <div className="bg-gray-50 border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-black">Issue Book</h3>
                <button onClick={() => setShowIssueModal(false)} className="text-gray-600 hover:text-brand-black transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Student ID</label>
                  <input value={studentId} onChange={e => setStudentId(e.target.value)} type="text" className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500" placeholder="e.g. STU1234 or User UUID" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Book ID</label>
                  <input value={bookId} onChange={e => setBookId(e.target.value)} type="text" className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500" placeholder="Book UUID" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Due Date</label>
                  <input value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50/50 flex justify-end gap-3">
                <button onClick={() => setShowIssueModal(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:text-brand-black transition-colors">Cancel</button>
                <button onClick={handleIssue} className="bg-emerald-600 hover:bg-emerald-700 text-brand-black px-4 py-2 rounded-lg transition-colors">Confirm Issue</button>
              </div>
            </div>
          </div>
        )}

        {/* Process Return Modal */}
        {showReturnModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-black">Process Return</h3>
                <button onClick={() => setShowReturnModal(false)} className="text-gray-600 hover:text-brand-black transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Issue ID</label>
                  <input value={returnIssueId} onChange={e => setReturnIssueId(e.target.value)} type="text" className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500" placeholder="Enter Issue ID" />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50/50 flex justify-end gap-3">
                <button onClick={() => setShowReturnModal(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:text-brand-black transition-colors">Cancel</button>
                <button onClick={() => { handleReturn(returnIssueId); setShowReturnModal(false); }} className="bg-gray-100 hover:bg-gray-700 text-brand-black border border-gray-200 px-4 py-2 rounded-lg transition-colors">Process Return</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
