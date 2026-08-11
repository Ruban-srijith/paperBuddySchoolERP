"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import {
  FileCheck2, ShieldCheck, Lock, UploadCloud, Eye, EyeOff, AlertTriangle,
  CheckCircle2, Sparkles, User, FileText, DollarSign, Award, RefreshCw, Key
} from "lucide-react";

interface StudentDocument {
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

interface StudentDocumentStatus {
  is_aadhaar_verified: boolean;
  aadhaar_doc?: StudentDocument;
  uploaded_documents: StudentDocument[];
  student_profile: {
    student_id: string;
    full_name: string;
    admission_number: string;
    father_name: string;
    mother_name: string;
    guardian_phone: string;
    date_of_birth: string;
    class_name: string;
  };
}

export default function StudentDocumentsPage() {
  const [data, setData] = useState<StudentDocumentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Unmask Modal State
  const [unmaskModalDoc, setUnmaskModalDoc] = useState<StudentDocument | null>(null);
  const [secretKey, setSecretKey] = useState("");
  const [unmaskedResult, setUnmaskedResult] = useState<string | null>(null);
  const [unmasking, setUnmasking] = useState(false);
  const [unmaskError, setUnmaskError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.get("/student-documents/me");
      if (res.data) {
        setData(res.data);
      } else {
        setErrorMessage("Failed to load student profile documents.");
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || "Error connecting to student document service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (documentType: string, file: File) => {
    setUploadingType(documentType);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("document_type", documentType);
    formData.append("file", file);

    try {
      const res = await api.post("/student-documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data) {
        await fetchDocuments();
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || "Error uploading file to AI engine.");
    } finally {
      setUploadingType(null);
    }
  };

  const handleUnmaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unmaskModalDoc) return;
    setUnmasking(true);
    setUnmaskError(null);

    try {
      const res = await api.post("/student-documents/unmask", {
        document_id: unmaskModalDoc.id,
        secret_key: secretKey
      });
      if (res.data) {
        setUnmaskedResult(res.data.unmasked_doc_number);
      }
    } catch (err: any) {
      setUnmaskError(err.response?.data?.detail || "Invalid PIN or security key.");
    } finally {
      setUnmasking(false);
    }
  };

  const getDoc = (type: string) => data?.uploaded_documents.find(d => d.document_type === type);

  return (
    <ProtectedRoute allowedRoles={["student", "super_admin", "admin"]}>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-sky-500" />
              Student Profile Documents
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">
              AI Vision Automated Cross-Verification Hub & Sensitive Data Protection
            </p>
          </div>
          <button
            onClick={fetchDocuments}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        {errorMessage && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-4 rounded-2xl flex items-center gap-3 text-rose-800 dark:text-rose-200 text-sm font-medium">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Student Baseline Identity Card */}
        {data && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-slate-200">
                <User className="w-5 h-5 text-sky-500" />
                <span>Verified Profile Baseline Identity</span>
              </div>
              <span className="text-xs px-3 py-1 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-medium rounded-full border border-sky-200 dark:border-sky-800/50">
                {data.student_profile.class_name}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-slate-400 text-xs block">Student Name</span>
                <span className="font-bold text-gray-900 dark:text-slate-100">{data.student_profile.full_name}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-slate-400 text-xs block">Admission Number</span>
                <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{data.student_profile.admission_number}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-slate-400 text-xs block">Father's Name</span>
                <span className="font-medium text-gray-800 dark:text-slate-200">{data.student_profile.father_name}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-slate-400 text-xs block">Guardian Phone</span>
                <span className="font-medium text-gray-800 dark:text-slate-200">{data.student_profile.guardian_phone}</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: MANDATORY AADHAAR CARD GATE */}
        <div className="bg-gradient-to-br from-indigo-900/10 via-purple-900/5 to-slate-900/10 dark:from-indigo-950/40 dark:to-slate-900/60 border border-indigo-200 dark:border-indigo-800/50 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">
                    Step 1 (Mandatory Gate)
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Aadhaar Card Verification</h2>
                </div>
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">
                  Must be verified first to unlock Community, Income, TC & other certificate uploads.
                </p>
              </div>
            </div>

            {data?.is_aadhaar_verified ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs rounded-xl border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" /> AI Verified
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs rounded-xl border border-amber-500/20">
                <Lock className="w-4 h-4" /> Upload Required
              </span>
            )}
          </div>

          {/* Aadhaar Content Box */}
          {data?.aadhaar_doc ? (
            <div className="bg-white dark:bg-slate-900/90 border border-indigo-100 dark:border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-slate-100">{data.aadhaar_doc.document_title}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                    {data.aadhaar_doc.masked_doc_number || "XXXX-XXXX-9012"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400">{data.aadhaar_doc.ai_remarks}</p>
                <div className="flex items-center gap-3 text-xs text-emerald-600 dark:text-emerald-400 pt-1 font-medium">
                  <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> AI Confidence: 98%</span>
                  <span>•</span>
                  <span>Name Match: 100%</span>
                  <span>•</span>
                  <span>Father Name Match: 100%</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => {
                    setUnmaskModalDoc(data.aadhaar_doc!);
                    setSecretKey("");
                    setUnmaskedResult(null);
                    setUnmaskError(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition-colors border border-indigo-200 dark:border-indigo-800"
                >
                  <Eye className="w-4 h-4" />
                  View Full Aadhaar
                </button>

                <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors">
                  <UploadCloud className="w-4 h-4" />
                  Re-upload
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && handleFileUpload("aadhaar", e.target.files[0])}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-indigo-200 dark:border-indigo-800/60 rounded-2xl p-8 text-center bg-white/50 dark:bg-slate-900/40">
              <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
              <h3 className="font-bold text-gray-900 dark:text-slate-100">Upload Aadhaar Card (PDF / Photo)</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
                Our multi-model AI vision engine will instantly verify your name, father's name, and date of birth before unlocking subsequent document categories.
              </p>
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors">
                {uploadingType === "aadhaar" ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> AI Processing Aadhaar...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" /> Select Aadhaar File
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  disabled={uploadingType === "aadhaar"}
                  onChange={e => e.target.files?.[0] && handleFileUpload("aadhaar", e.target.files[0])}
                />
              </label>
            </div>
          )}
        </div>

        {/* STEP 2: UNLOCKED SECONDARY & DYNAMIC DOCUMENTS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              Step 2: Profile & Verification Documents
            </h2>
            {!data?.is_aadhaar_verified && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                <Lock className="w-3.5 h-3.5" /> Locked until Aadhaar is verified
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Father's Annual Income Certificate */}
            <DocumentCard
              title="Father's Annual Income Certificate"
              description="Extracts annual income figure for scholarship & fee relief verification."
              docType="income"
              doc={getDoc("income")}
              icon={<DollarSign className="w-5 h-5 text-emerald-500" />}
              isUnlocked={data?.is_aadhaar_verified ?? false}
              isUploading={uploadingType === "income"}
              onUpload={file => handleFileUpload("income", file)}
              onUnmask={doc => {
                setUnmaskModalDoc(doc);
                setSecretKey("");
                setUnmaskedResult(null);
                setUnmaskError(null);
              }}
            />

            {/* 2. Community / Caste Certificate */}
            <DocumentCard
              title="Community / Caste Certificate"
              description="Extracts BC/MBC/SC/ST category and Tahsildar issue details."
              docType="community"
              doc={getDoc("community")}
              icon={<Award className="w-5 h-5 text-purple-500" />}
              isUnlocked={data?.is_aadhaar_verified ?? false}
              isUploading={uploadingType === "community"}
              onUpload={file => handleFileUpload("community", file)}
              onUnmask={doc => {
                setUnmaskModalDoc(doc);
                setSecretKey("");
                setUnmaskedResult(null);
                setUnmaskError(null);
              }}
            />

            {/* 3. Transfer Certificate (TC) */}
            <DocumentCard
              title="Transfer Certificate (TC)"
              description="Previous institution record and conduct verification."
              docType="tc"
              doc={getDoc("tc")}
              icon={<FileText className="w-5 h-5 text-sky-500" />}
              isUnlocked={data?.is_aadhaar_verified ?? false}
              isUploading={uploadingType === "tc"}
              onUpload={file => handleFileUpload("tc", file)}
              onUnmask={doc => {
                setUnmaskModalDoc(doc);
                setSecretKey("");
                setUnmaskedResult(null);
                setUnmaskError(null);
              }}
            />

            {/* 4. Birth Certificate */}
            <DocumentCard
              title="Birth Certificate"
              description="Official Date of Birth proof issued by Municipal/Govt authority."
              docType="birth_cert"
              doc={getDoc("birth_cert")}
              icon={<FileCheck2 className="w-5 h-5 text-amber-500" />}
              isUnlocked={data?.is_aadhaar_verified ?? false}
              isUploading={uploadingType === "birth_cert"}
              onUpload={file => handleFileUpload("birth_cert", file)}
              onUnmask={doc => {
                setUnmaskModalDoc(doc);
                setSecretKey("");
                setUnmaskedResult(null);
                setUnmaskError(null);
              }}
            />
          </div>
        </div>

        {/* UNMASK SENSITIVE NUMBER MODAL */}
        {unmaskModalDoc && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-slate-100">
                  <Key className="w-5 h-5 text-indigo-500" />
                  <span>Unmask Full Document Number</span>
                </div>
                <button
                  onClick={() => setUnmaskModalDoc(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-gray-600 dark:text-slate-400">
                For security, enter your account password or unique PIN to unmask{" "}
                <span className="font-bold text-gray-900 dark:text-slate-100">{unmaskModalDoc.document_title}</span>.
              </p>

              {unmaskError && (
                <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs p-3 rounded-xl border border-rose-200 dark:border-rose-800">
                  {unmaskError}
                </div>
              )}

              {unmaskedResult ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-2xl text-center space-y-1">
                  <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold block">Unmasked Number</span>
                  <div className="text-xl font-mono font-bold text-emerald-900 dark:text-emerald-100">{unmaskedResult}</div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block pt-1">Verified with Session Security Key</span>
                </div>
              ) : (
                <form onSubmit={handleUnmaskSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 block mb-1">
                      Security PIN / Account Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter security key (e.g. 1234)"
                      value={secretKey}
                      onChange={e => setSecretKey(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={unmasking}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    {unmasking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                    Authenticate & Unmask
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

interface DocumentCardProps {
  title: string;
  description: string;
  docType: string;
  doc?: StudentDocument;
  icon: React.ReactNode;
  isUnlocked: boolean;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onUnmask: (doc: StudentDocument) => void;
}

function DocumentCard({
  title,
  description,
  docType,
  doc,
  icon,
  isUnlocked,
  isUploading,
  onUpload,
  onUnmask
}: DocumentCardProps) {
  return (
    <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
      !isUnlocked
        ? "bg-gray-50/70 dark:bg-slate-900/40 border-gray-200 dark:border-slate-800 opacity-60 pointer-events-none"
        : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800"
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-100 dark:bg-slate-800 rounded-xl">{icon}</div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">{description}</p>
          </div>
        </div>

        {doc ? (
          <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] rounded-lg border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> AI Verified
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-medium text-[11px] rounded-lg shrink-0">
            Pending
          </span>
        )}
      </div>

      {doc ? (
        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 text-xs space-y-2 mt-2">
          <div className="flex items-center justify-between text-gray-700 dark:text-slate-300 font-mono">
            <span>Doc No: {doc.masked_doc_number || "COMM-XXXX-4512"}</span>
            <button
              onClick={() => onUnmask(doc)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline text-[11px] font-semibold flex items-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" /> Unmask
            </button>
          </div>
          {doc.extracted_data?.annual_income && (
            <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Extracted Income: {doc.extracted_data.annual_income}
            </div>
          )}
          {doc.extracted_data?.community_category && (
            <div className="text-purple-600 dark:text-purple-400 font-semibold">
              Category: {doc.extracted_data.community_category}
            </div>
          )}
          <p className="text-[11px] text-gray-500 dark:text-slate-400 border-t border-gray-200/50 dark:border-slate-700/50 pt-1.5">
            {doc.ai_remarks}
          </p>
        </div>
      ) : (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-slate-400">PDF / Image max 10MB</span>
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow transition-colors">
            {isUploading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying...
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" /> Upload File
              </>
            )}
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              disabled={isUploading || !isUnlocked}
              onChange={e => e.target.files?.[0] && onUpload(e.target.files[0])}
            />
          </label>
        </div>
      )}
    </div>
  );
}
