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

  const [books, setBooks] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  const fetchIssues = async () => {
    try {
      const res = await api.get("/librarian/issues");
      setIssues(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAuxiliaryData = async () => {
    try {
      const [booksRes, studentsRes] = await Promise.all([
        api.get("/librarian/books"),
        api.get("/students")
      ]);
      setBooks(booksRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchAuxiliaryData();
    // Default due date: 14 days from today
    const twoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    setDueDate(twoWeeks);
  }, []);

  const handleIssue = async () => {
    if (!bookId || !studentId) {
      toast.error("Please select both a book and a student");
      return;
    }
    try {
      await api.post("/librarian/issues", {
        book_id: bookId,
        user_id: studentId,
        due_date: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
      });
      toast.success("Book issued successfully");
      setShowIssueModal(false);
      setBookId("");
      setStudentId("");
      fetchIssues();
      fetchAuxiliaryData();
    } catch (err) {
      toast.error("Failed to issue book");
    }
  };

  const handleReturn = async (issueId: string) => {
    if (!issueId) {
      toast.error("Please select a book issue to return");
      return;
    }
    try {
      await api.put(`/librarian/issues/${issueId}/return`);
      toast.success("Book returned successfully");
      fetchIssues();
      fetchAuxiliaryData();
    } catch (err) {
      toast.error("Failed to return book");
    }
  };

  const getBookTitle = (id: string) => {
    const b = books.find(x => x.id === id);
    return b ? b.title : `Book ${id?.substring(0, 8) || ''}`;
  };

  const getStudentName = (id: string) => {
    const s = students.find(x => x.id === id || x.user_id === id);
    return s ? s.full_name : `Student ${id?.substring(0, 8) || ''}`;
  };

  const filteredIssues = issues.filter(i => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const bTitle = getBookTitle(i.book_id).toLowerCase();
    const sName = getStudentName(i.user_id).toLowerCase();
    return bTitle.includes(q) || sName.includes(q) || i.user_id?.toLowerCase().includes(q) || i.book_id?.toLowerCase().includes(q);
  });
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
                      <td className="px-6 py-4 font-bold text-brand-black">{getBookTitle(issue.book_id)}</td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700 font-medium">{getStudentName(issue.user_id)}</div>
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
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-brand-black">Issue Book</h3>
                <button onClick={() => setShowIssueModal(false)} className="text-gray-600 hover:text-brand-black transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                  <select 
                    value={studentId} 
                    onChange={e => setStudentId(e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-300 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 text-sm"
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id || s.user_id}>
                        {s.full_name} {s.admission_number ? `(ADM: ${s.admission_number})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Book</label>
                  <select 
                    value={bookId} 
                    onChange={e => setBookId(e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-300 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 text-sm"
                  >
                    <option value="">-- Choose Book Catalog --</option>
                    {books.map(b => (
                      <option key={b.id} value={b.id} disabled={b.available_copies <= 0}>
                        {b.title} — {b.author} ({b.available_copies} available)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input 
                    value={dueDate} 
                    onChange={e => setDueDate(e.target.value)} 
                    type="date" 
                    className="w-full bg-gray-50 border border-gray-300 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 text-sm font-mono" 
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setShowIssueModal(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:text-brand-black transition-colors font-medium">Cancel</button>
                <button onClick={handleIssue} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">Confirm Issue</button>
              </div>
            </div>
          </div>
        )}

        {/* Process Return Modal */}
        {showReturnModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="text-xl font-bold text-brand-black">Process Return</h3>
                <button onClick={() => setShowReturnModal(false)} className="text-gray-600 hover:text-brand-black transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Issued Book</label>
                  <select 
                    value={returnIssueId} 
                    onChange={e => setReturnIssueId(e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-300 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 text-sm"
                  >
                    <option value="">-- Choose Issued Record to Return --</option>
                    {issues.filter(i => i.status !== 'returned').map(i => (
                      <option key={i.id} value={i.id}>
                        {getBookTitle(i.book_id)} — Borrowed by {getStudentName(i.user_id)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setShowReturnModal(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:text-brand-black transition-colors font-medium">Cancel</button>
                <button 
                  onClick={() => { handleReturn(returnIssueId); setShowReturnModal(false); }} 
                  disabled={!returnIssueId}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  Process Return
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
