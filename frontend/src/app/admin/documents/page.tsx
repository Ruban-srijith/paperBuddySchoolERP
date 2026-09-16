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
    <ProtectedRoute allowedRoles={["super_admin", "principal", "correspondent", "teacher"]}>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <header className="glass-box-gold p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#f4f0e6] font-syne flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#12281b] border-2 border-[#e5c158]/50 flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-7 h-7 text-[#e5c158]" />
              </div>
              Student Profile Documents Audit Panel
            </h1>
            <p className="text-[#a3c9b0] mt-2 text-sm font-medium">
              Real-time reflected table of student Aadhaar verification, community categories, income disclosures, and AI audit notes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#e5c158] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or adm no..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && fetchAdminDocuments()}
                className="pl-9 pr-4 py-2 glass-input-dark text-xs w-64"
              />
            </div>
            <button
              onClick={fetchAdminDocuments}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#e5c158] to-[#c49a32] text-[#0f1c15] rounded-xl text-xs font-extrabold shadow-lg hover:opacity-90 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Filter
            </button>
          </div>
        </header>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="glass-box p-5 space-y-1">
            <span className="text-xs text-[#a3c9b0] font-bold uppercase tracking-wider block">Total Roster Students</span>
            <div className="text-2xl font-black text-[#f4f0e6] font-syne">{students.length}</div>
          </div>
          <div className="glass-box p-5 space-y-1 border-emerald-500/30">
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">Aadhaar Verified</span>
            <div className="text-2xl font-black text-emerald-400 font-syne">
              {students.filter(s => s.aadhaar_status === "VERIFIED").length}
            </div>
          </div>
          <div className="glass-box p-5 space-y-1 border-amber-500/30">
            <span className="text-xs text-amber-300 font-bold uppercase tracking-wider block">Pending Aadhaar Gate</span>
            <div className="text-2xl font-black text-amber-300 font-syne">
              {students.filter(s => s.aadhaar_status !== "VERIFIED").length}
            </div>
          </div>
          <div className="glass-box p-5 space-y-1 border-[#e5c158]/30">
            <span className="text-xs text-[#e5c158] font-bold uppercase tracking-wider block">Total Docs Uploaded</span>
            <div className="text-2xl font-black text-[#e5c158] font-syne">
              {students.reduce((acc, s) => acc + s.total_documents, 0)}
            </div>
          </div>
        </div>

        {/* REFLECTED DATA TABLE */}
        <div className="glass-box overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
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
              <tbody className="divide-y divide-white/10">
                {students.map(s => (
                  <tr key={s.student_id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#f4f0e6] font-syne text-sm">{s.student_name}</div>
                      <div className="text-[11px] text-[#e5c158] font-mono">{s.admission_number}</div>
                    </td>
                    <td className="p-4 font-semibold text-[#a3c9b0]">
                      {s.class_name || "Grade 10-A"}
                    </td>
                    <td className="p-4 text-[#f4f0e6]">
                      {s.father_name || "—"}
                    </td>
                    <td className="p-4 font-bold text-emerald-400 font-mono">
                      {s.father_annual_income || "Not Uploaded"}
                    </td>
                    <td className="p-4 text-[#e5c158] font-semibold">
                      {s.community_category || "General"}
                    </td>
                    <td className="p-4">
                      {s.aadhaar_status === "VERIFIED" ? (
                        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded-lg border border-emerald-500/30 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 font-bold rounded-lg border border-amber-500/30 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Missing
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center font-bold text-[#f4f0e6] font-mono">
                      {s.total_documents}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedStudent(s)}
                        className="px-3 py-1.5 bg-gradient-to-r from-[#e5c158] to-[#c49a32] text-[#0f1c15] rounded-xl text-xs font-extrabold transition-colors inline-flex items-center gap-1 shadow-md hover:opacity-90"
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
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-box-gold p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="font-bold text-lg text-[#f4f0e6] font-syne">
                    Document Audit: {selectedStudent.student_name}
                  </h3>
                  <p className="text-xs text-[#a3c9b0]">
                    Admission: {selectedStudent.admission_number} | Class: {selectedStudent.class_name}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-1 text-[#a3c9b0] hover:text-[#f4f0e6]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {selectedStudent.documents.length === 0 ? (
                  <div className="p-8 text-center text-[#a3c9b0] text-xs font-medium">No documents uploaded yet by student.</div>
                ) : (
                  selectedStudent.documents.map(doc => (
                    <div key={doc.id} className="border border-white/10 rounded-2xl p-4 bg-black/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#e5c158]" />
                          <span className="font-bold text-[#f4f0e6] text-sm">{doc.document_title}</span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/40 text-[#e5c158] border border-[#e5c158]/30">
                            {doc.masked_doc_number || "Masked"}
                          </span>
                        </div>

                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#e5c158]" /> AI Confidence {(doc.ai_confidence * 100).toFixed(0)}%
                        </span>
                      </div>

                      <p className="text-xs text-[#a3c9b0]">{doc.ai_remarks}</p>

                      {doc.extracted_data && (
                        <div className="bg-black/40 border border-white/10 rounded-xl p-3 text-xs space-y-1 font-mono text-[#f4f0e6]">
                          {Object.entries(doc.extracted_data).map(([key, val]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-[#a3c9b0]">{key}:</span>
                              <span className="font-semibold text-[#e5c158]">{String(val)}</span>
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
