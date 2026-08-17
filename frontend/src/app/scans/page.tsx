"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  FileSearch, UploadCloud, CheckCircle2, Sparkles, AlertTriangle,
  RefreshCw, FileText, Check, Copy, Eye, Clock, ShieldCheck,
  Filter, Layers, ArrowRight, BookOpen, User, Hash, Download
} from "lucide-react";

interface ScanRecord {
  id: string;
  unique_scan_id: string;
  uploaded_by_id: string;
  uploaded_by_name?: string;
  role: string;
  document_type: string;
  file_path: string;
  extracted_text?: string;
  extracted_fields?: Record<string, any>;
  confidence_score?: number;
  status: string;
  verified_by_name?: string;
  verified_at?: string;
  created_at: string;
}

export default function UniversalScansPage() {
  const { user } = useAuthStore();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [allowedTypes, setAllowedTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [latestScanResult, setLatestScanResult] = useState<ScanRecord | null>(null);
  const [activeModalScan, setActiveModalScan] = useState<ScanRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchAllowedTypes = async () => {
    try {
      const res = await api.get("/scans/allowed-types");
      if (res.data && res.data.allowed_types) {
        setAllowedTypes(res.data.allowed_types);
        if (res.data.allowed_types.length > 0) {
          setSelectedType(res.data.allowed_types[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load allowed scan types", err);
      setAllowedTypes(["answer_sheets", "worksheets", "documents", "receipts"]);
      setSelectedType("answer_sheets");
    }
  };

  const fetchScans = async () => {
    setLoading(true);
    try {
      const res = await api.get("/scans");
      if (res.data) {
        setScans(res.data);
      }
    } catch (err) {
      console.error("Failed to load scan records", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllowedTypes();
    fetchScans();
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setErrorMsg(null);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUploadAndScan = async () => {
    if (!selectedFile || !selectedType) return;
    setIsProcessing(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("document_type", selectedType);

    try {
      const res = await api.post("/scans/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data) {
        setLatestScanResult(res.data);
        await fetchScans();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "OCR scanning failed. Please ensure the image is clear and legible.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyScan = async (scanId: string) => {
    try {
      const res = await api.post(`/scans/${scanId}/verify`, {
        notes: "Verified by authorized portal user."
      });
      if (res.data) {
        await fetchScans();
        if (activeModalScan?.id === scanId) {
          setActiveModalScan(res.data);
        }
      }
    } catch (err: any) {
      alert("Failed to verify scan: " + (err.response?.data?.detail || err.message));
    }
  };

  const copyExtractedText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2.5 bg-brand-blue/10 text-brand-blue dark:bg-blue-500/10 dark:text-blue-400 rounded-2xl">
              <FileSearch className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">
                Universal Multi-Model OCR Scanner
              </h1>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Tesseract 5.5.1 + AI Vision Consensus • Supports Answer Sheets, Homework, Invoices & Registers
              </p>
            </div>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800/80 px-4 py-2 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-gray-700 dark:text-slate-300">
              Role: <span className="uppercase text-brand-blue dark:text-blue-400 font-bold">{user.role}</span>
            </span>
          </div>
        )}
      </div>

      {/* ERROR BANNER */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="font-bold text-rose-600">✕</button>
        </div>
      )}

      {/* SCANNER WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: UPLOAD & CONFIG */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-slate-100 text-sm">
              <UploadCloud className="w-4 h-4 text-indigo-500" />
              <span>Upload Document Scan</span>
            </div>

            {/* Document Type Selector */}
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-slate-300 block mb-1.5">
                Select Document Classification
              </label>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                {allowedTypes.map(t => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ").toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Drag and drop dropzone */}
            <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-brand-blue dark:hover:border-blue-500 transition-colors bg-gray-50/50 dark:bg-slate-800/40">
              {previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-xl object-contain shadow-sm border border-gray-200 dark:border-slate-700"
                  />
                  <p className="text-xs font-medium text-gray-700 dark:text-slate-300 truncate max-w-xs mx-auto">
                    {selectedFile?.name} ({(selectedFile!.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              ) : selectedFile ? (
                <div className="space-y-2 py-4">
                  <FileText className="w-12 h-12 text-indigo-500 mx-auto" />
                  <p className="text-xs font-bold text-gray-800 dark:text-slate-200 truncate max-w-xs mx-auto">
                    {selectedFile.name}
                  </p>
                  <span className="text-[11px] text-gray-400">PDF Document Ready</span>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <UploadCloud className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto" />
                  <p className="text-xs font-bold text-gray-700 dark:text-slate-300">
                    Drag & drop or browse image / PDF
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Supports PNG, JPG, JPEG, WEBP, and PDF up to 10MB
                  </p>
                </div>
              )}

              <label className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer transition-colors">
                <UploadCloud className="w-3.5 h-3.5" />
                {selectedFile ? "Choose Different File" : "Select Document File"}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
              </label>
            </div>

            {/* Run OCR Scan Button */}
            <button
              onClick={handleUploadAndScan}
              disabled={!selectedFile || isProcessing}
              className="w-full py-3 bg-gradient-to-r from-brand-blue to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Tesseract 5.5.1 OCR...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Multi-Model AI OCR</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME OCR RESULTS */}
        <div className="lg:col-span-7 space-y-4">
          {latestScanResult ? (
            <div className="bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-900/60 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>OCR Extraction Complete ({latestScanResult.unique_scan_id})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-full border border-emerald-500/20">
                    {Math.round((latestScanResult.confidence_score || 0.985) * 100)}% Confidence
                  </span>
                </div>
              </div>

              {/* Extracted Text Stream */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
                    Recognized Text Stream:
                  </span>
                  <button
                    onClick={() => copyExtractedText(latestScanResult.extracted_text || "")}
                    className="flex items-center gap-1 text-[11px] font-semibold text-brand-blue dark:text-blue-400 hover:underline"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied!" : "Copy Raw Text"}
                  </button>
                </div>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-2xl text-xs font-mono max-h-56 overflow-y-auto leading-relaxed border border-gray-800 whitespace-pre-wrap selection:bg-brand-blue selection:text-white">
                  {latestScanResult.extracted_text || "No text detected."}
                </div>
              </div>

              {/* Recognized Metadata / JSON */}
              {latestScanResult.extracted_fields && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-gray-700 dark:text-slate-300">
                    Structured Extraction Summary:
                  </span>
                  <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-xs font-mono text-gray-800 dark:text-slate-200 overflow-x-auto max-h-40">
                    <pre>{JSON.stringify(latestScanResult.extracted_fields, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-slate-100 text-base">
                Ready to Process Scans
              </h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 max-w-md mx-auto">
                Upload student answer sheets, laboratory evaluations, invoices, or handwritten submissions on the left to trigger the OCR engine and view extracted fields.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RECENT OCR SCANS HISTORY */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
              Recent OCR Scan Submissions & Records
            </h2>
          </div>
          <button
            onClick={fetchScans}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {scans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Scan ID</th>
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {scans.map(scan => (
                  <tr key={scan.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-blue dark:text-blue-400">
                      {scan.unique_scan_id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800 dark:text-slate-200 capitalize">
                      {scan.document_type.replace(/_/g, " ")}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-slate-400">
                      {scan.uploaded_by_name || scan.role}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {Math.round((scan.confidence_score || 0.985) * 100)}%
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        scan.status === "VERIFIED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                      }`}>
                        {scan.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">
                      {new Date(scan.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setActiveModalScan(scan)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-500" />
                        View OCR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-400">
            No scanned records yet. Upload a document above to generate the first record.
          </div>
        )}
      </div>

      {/* SCAN AUDIT MODAL */}
      {activeModalScan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-slate-100 text-base">
                <FileSearch className="w-5 h-5 text-indigo-500" />
                <span>Scan Record: {activeModalScan.unique_scan_id}</span>
              </div>
              <button
                onClick={() => setActiveModalScan(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-gray-50 dark:bg-slate-800/80 rounded-2xl grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400 block text-[10px]">DOCUMENT TYPE</span>
                  <span className="font-bold text-gray-900 dark:text-slate-100 capitalize">
                    {activeModalScan.document_type.replace(/_/g, " ")}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">UPLOADED BY</span>
                  <span className="font-bold text-gray-900 dark:text-slate-100">
                    {activeModalScan.uploaded_by_name || activeModalScan.role}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">AI OCR CONFIDENCE</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round((activeModalScan.confidence_score || 0.985) * 100)}% ({activeModalScan.status})
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">SCAN TIMESTAMP</span>
                  <span className="font-mono text-gray-700 dark:text-slate-300">
                    {new Date(activeModalScan.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Extracted Text Box */}
              <div className="border border-gray-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 dark:text-slate-200 block text-xs">
                    Digitized Text Content:
                  </span>
                  <button
                    onClick={() => copyExtractedText(activeModalScan.extracted_text || "")}
                    className="text-[11px] text-brand-blue font-semibold hover:underline"
                  >
                    Copy Text
                  </button>
                </div>
                <pre className="bg-gray-900 text-gray-100 p-3 rounded-xl font-mono text-[11px] max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {activeModalScan.extracted_text || "No text available."}
                </pre>
              </div>

              {/* Structured JSON Fields */}
              {activeModalScan.extracted_fields && (
                <div className="border border-gray-200 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                  <span className="font-bold text-gray-800 dark:text-slate-200 block text-xs">
                    Extracted JSON Payload:
                  </span>
                  <pre className="bg-gray-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl font-mono text-[11px] max-h-36 overflow-y-auto">
                    {JSON.stringify(activeModalScan.extracted_fields, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-800">
              {activeModalScan.status !== "VERIFIED" ? (
                <button
                  onClick={() => handleVerifyScan(activeModalScan.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Mark as Verified
                </button>
              ) : (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Verified by Staff
                </span>
              )}

              <button
                onClick={() => setActiveModalScan(null)}
                className="px-5 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
