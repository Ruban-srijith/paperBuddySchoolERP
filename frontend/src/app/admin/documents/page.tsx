"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  ShieldCheck, Search, Filter, FileText, CheckCircle2, AlertTriangle,
  UserCheck, RefreshCw, Eye, Sparkles, DollarSign, Award, X
} from "lucide-react";

interface DocumentItem {
  id: string;
  document_type: string;
  document_title: string;
  file_url: string;
  masked_doc_number?: string;
  verification_status: string;
  ai_confidence: number;
  ai_matched_fields?: Record<string, boolean>;
  extracted_data?: Record<string, any>;
  ai_remarks?: string;
  uploaded_at: string;
}

interface AdminStudentRow {
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name?: string;
  father_name?: string;
  father_annual_income?: string;
  community_category?: string;
  aadhaar_status: string;
  total_documents: number;
  documents: DocumentItem[];
}

import api from "@/lib/api";

export default function AdminDocumentsPage() {
  const [students, setStudents] = useState<AdminStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<AdminStudentRow | null>(null);

  const fetchAdminDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/student-documents/admin/all", {
        params: search ? { search } : {}
      });
      if (res.data) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error("Failed to load admin student document records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDocuments();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["super_admin", "admin", "principal", "correspondent", "teacher", "dept_head"]}>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-indigo-500" />
              Student Profile Documents Audit Panel
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1 text-sm">
              Real-time reflected table of student Aadhaar verification, community categories, income disclosures, and AI audit notes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or adm no..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && fetchAdminDocuments()}
                className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={fetchAdminDocuments}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Filter
            </button>
          </div>
        </header>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-gray-500 dark:text-slate-400 block font-medium">Total Roster Students</span>
            <div className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-0.5">{students.length}</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-emerald-700 dark:text-emerald-300 block font-medium">Aadhaar Verified</span>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-0.5">
              {students.filter(s => s.aadhaar_status === "VERIFIED").length}
            </div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-amber-700 dark:text-amber-300 block font-medium">Pending Aadhaar Gate</span>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-0.5">
              {students.filter(s => s.aadhaar_status !== "VERIFIED").length}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-2xl p-4 shadow-sm">
            <span className="text-xs text-purple-700 dark:text-purple-300 block font-medium">Total Docs Uploaded</span>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-0.5">
              {students.reduce((acc, s) => acc + s.total_documents, 0)}
            </div>
          </div>
        </div>

        {/* REFLECTED DATA TABLE */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-transparent text-gray-600 dark:text-slate-400 uppercase text-[10px] font-semibold border-b border-gray-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Student & Admission</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Father's Name</th>
                  <th className="p-4">Father's Annual Income</th>
                  <th className="p-4">Community Category</th>
                  <th className="p-4">Aadhaar Status</th>
                  <th className="p-4 text-center">Uploaded Docs</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {students.map(s => (
                  <tr key={s.student_id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900 dark:text-slate-100">{s.student_name}</div>
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">{s.admission_number}</div>
                    </td>
                    <td className="p-4 font-semibold text-gray-700 dark:text-slate-300">
                      {s.class_name || "Grade 10-A"}
                    </td>
                    <td className="p-4 text-gray-800 dark:text-slate-200">
                      {s.father_name || "—"}
                    </td>
                    <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      {s.father_annual_income || "Not Uploaded"}
                    </td>
                    <td className="p-4 text-purple-600 dark:text-purple-400 font-medium">
                      {s.community_category || "General"}
                    </td>
                    <td className="p-4">
                      {s.aadhaar_status === "VERIFIED" ? (
                        <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold rounded-lg border border-emerald-200 dark:border-emerald-800/50 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-semibold rounded-lg border border-amber-200 dark:border-amber-800/50 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Missing
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center font-bold text-gray-900 dark:text-slate-100">
                      {s.total_documents}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedStudent(s)}
                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 border border-indigo-200 dark:border-indigo-800"
                      >
                        <Eye className="w-3.5 h-3.5" /> Audit Docs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AUDIT INSPECTION DRAWER / MODAL */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-slate-100">
                    Document Audit: {selectedStudent.student_name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Admission: {selectedStudent.admission_number} | Class: {selectedStudent.class_name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {selectedStudent.documents.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-xs">No documents uploaded yet by student.</div>
                ) : (
                  selectedStudent.documents.map(doc => (
                    <div key={doc.id} className="border border-gray-200 dark:border-slate-800 rounded-2xl p-4 bg-gray-50/50 dark:bg-slate-800/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-500" />
                          <span className="font-bold text-gray-900 dark:text-slate-100 text-sm">{doc.document_title}</span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-slate-200">
                            {doc.masked_doc_number || "Masked"}
                          </span>
                        </div>

                        <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-xs font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> AI Confidence {(doc.ai_confidence * 100).toFixed(0)}%
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 dark:text-slate-400">{doc.ai_remarks}</p>

                      {doc.extracted_data && (
                        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3 text-xs space-y-1 font-mono text-gray-700 dark:text-slate-300">
                          {Object.entries(doc.extracted_data).map(([key, val]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-400">{key}:</span>
                              <span className="font-semibold">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
