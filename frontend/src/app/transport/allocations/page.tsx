"use client";

import { useEffect, useState } from "react";
import { 
  UserPlus, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  Bus, 
  MapPin, 
  CheckCircle2, 
  QrCode, 
  ShieldCheck, 
  Phone, 
  GraduationCap, 
  X, 
  Clock,
  Sparkles
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/components/Toast";
import api from "@/lib/api";

interface Allocation {
  id: string;
  student_id: string;
  stop_id: string;
  status: string;
  student_name?: string;
  student_roll?: string;
  student_grade?: string;
  student_phone?: string;
  student_email?: string;
  stop_name?: string;
  route_name?: string;
  pickup_time?: string;
  drop_time?: string;
  monthly_fee?: number;
  school_name?: string;
}

interface StopOption {
  id: string;
  route_id: string;
  route_name: string;
  stop_name: string;
  pickup_time: string;
  drop_time: string;
  monthly_fee: number;
}

interface StudentOption {
  id: string;
  full_name: string;
  roll_number?: string;
  admission_number?: string;
  email?: string;
  phone?: string;
  assigned_grade?: string;
  is_allocated?: boolean;
}

export default function StudentAllocationsPage() {
  const { toast } = useToast();
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [stopsList, setStopsList] = useState<StopOption[]>([]);
  const [studentsList, setStudentsList] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState<Allocation | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  
  const [newAllocation, setNewAllocation] = useState({
    student_id: "",
    stop_id: "",
    status: "active"
  });

  useEffect(() => {
    fetchAllocations();
    fetchStops();
    fetchAvailableStudents();
  }, []);

  async function fetchAllocations() {
    try {
      setLoading(true);
      const res = await api.get("/transport/allocations");
      setAllocations(res.data || []);
    } catch (err) {
      console.error("Failed to fetch allocations", err);
      toast.error("Failed to load transport allocations");
    } finally {
      setLoading(false);
    }
  }

  async function fetchStops() {
    try {
      const res = await api.get("/transport/all-stops");
      setStopsList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch stops", err);
    }
  }

  async function fetchAvailableStudents() {
    try {
      setLoadingStudents(true);
      const res = await api.get("/transport/students?unallocated_only=true");
      setStudentsList(res.data || []);
    } catch (err) {
      console.error("Failed to fetch available students", err);
    } finally {
      setLoadingStudents(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllocation.student_id.trim() || !newAllocation.stop_id.trim()) {
      toast.error("Please provide both Student and Designated Stop");
      return;
    }
    try {
      await api.post("/transport/allocate-student", newAllocation);
      toast.success("Student transport allocation updated successfully!", "Allocation Saved");
      setIsModalOpen(false);
      setNewAllocation({ student_id: "", stop_id: "", status: "active" });
      setSelectedStudent(null);
      setStudentSearchQuery("");
      fetchAllocations();
      fetchAvailableStudents();
    } catch (err: any) {
      console.error("Failed to allocate student", err);
      toast.error(err.response?.data?.detail || "Failed to allocate student");
    }
  };

  const handleExportCSV = () => {
    try {
      const dataToExport = filteredAllocations.length > 0 ? filteredAllocations : allocations;
      if (dataToExport.length === 0) {
        toast.info("No student transport allocation records found to export.", "Export Info");
        return;
      }

      const escapeCell = (val: any) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const headers = [
        "Allocation ID",
        "Student ID / Roll No",
        "Student Full Name",
        "Class & Section",
        "Contact Phone",
        "Student Email",
        "Assigned Route",
        "Designated Bus Stop",
        "Morning Pickup Time",
        "Evening Drop-off Time",
        "Monthly Transit Fee (INR)",
        "Pass Status",
        "Institution Name"
      ];

      const rows = dataToExport.map((a, idx) => [
        a.id || `ALLOC-${idx + 1}`,
        a.student_roll || a.student_id,
        a.student_name || "N/A",
        a.student_grade || "Grade 10-A",
        a.student_phone || "N/A",
        a.student_email || "N/A",
        a.route_name || "Main Campus Route",
        a.stop_name || a.stop_id,
        a.pickup_time || "07:30 AM",
        a.drop_time || "04:30 PM",
        a.monthly_fee !== undefined ? `₹${a.monthly_fee}` : "₹1,200",
        (a.status || "active").toUpperCase(),
        a.school_name || "Genesis International School"
      ]);

      const headerRow = headers.map(escapeCell).join(",");
      const dataRows = rows.map(r => r.map(escapeCell).join(",")).join("\r\n");
      const csvContent = "\uFEFF" + headerRow + "\r\n" + dataRows;

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      link.href = url;
      link.setAttribute("download", `Student_Transport_Allocations_${dateStr}.csv`);
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      toast.success(
        `Successfully exported ${dataToExport.length} student allocation record(s) to CSV`,
        "Export Complete"
      );
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to generate CSV export");
    }
  };

  const handleOpenPassPreview = (allocation: Allocation) => {
    setSelectedPass(allocation);
  };

  const triggerDirectPrint = () => {
    const printContent = document.getElementById("printable-bus-pass");
    if (!printContent) {
      window.print();
      return;
    }

    try {
      let iframe = document.getElementById("bus-pass-print-frame") as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.id = "bus-pass-print-frame";
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "none";
        document.body.appendChild(iframe);
      }

      const doc = iframe.contentWindow?.document;
      if (!doc) {
        window.print();
        return;
      }

      const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
        .map(el => el.outerHTML)
        .join('\n');

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Official Student Bus Pass - ${selectedPass?.student_name || "Transit Pass"}</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            ${styles}
            <style>
              @page {
                size: auto;
                margin: 8mm;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              body {
                background: #ffffff !important;
                margin: 0 !important;
                padding: 15px 0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
              }
              .pass-container {
                width: 92mm !important;
                max-width: 92mm !important;
                min-height: 140mm !important;
                border: 2px solid #1e293b !important;
                border-radius: 16px !important;
                overflow: hidden !important;
                background: #ffffff !important;
                box-shadow: none !important;
                margin: 0 auto !important;
              }
            </style>
          </head>
          <body>
            <div class="pass-container">
              ${printContent.innerHTML}
            </div>
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 300);
    } catch (err) {
      console.error("Iframe print error fallback to window.print", err);
      window.print();
    }
  };

  const filteredAllocations = allocations.filter(a => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = 
      (a.student_name || "").toLowerCase().includes(query) ||
      (a.student_roll || "").toLowerCase().includes(query) ||
      (a.student_id || "").toLowerCase().includes(query) ||
      (a.stop_name || "").toLowerCase().includes(query) ||
      (a.route_name || "").toLowerCase().includes(query) ||
      (a.student_grade || "").toLowerCase().includes(query);

    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && (a.status === "active" || !a.status)) ||
      (statusFilter === "inactive" && a.status === "inactive");

    return matchesSearch && matchesStatus;
  });

  // Filter out any students who already have transport allocation so allocated students cannot be seen while searching
  const allocatedStudentKeys = new Set(
    allocations.flatMap(a => [
      (a.student_id || "").toLowerCase(),
      (a.student_roll || "").toLowerCase(),
      (a.student_email || "").toLowerCase()
    ]).filter(Boolean)
  );

  const unallocatedStudents = studentsList.filter(s => {
    if (s.is_allocated) return false;
    if (allocatedStudentKeys.has((s.id || "").toLowerCase())) return false;
    if (s.roll_number && allocatedStudentKeys.has(s.roll_number.toLowerCase())) return false;
    if (s.admission_number && allocatedStudentKeys.has(s.admission_number.toLowerCase())) return false;
    if (s.email && allocatedStudentKeys.has(s.email.toLowerCase())) return false;
    return true;
  });

  const filteredAvailableStudents = unallocatedStudents.filter(s => {
    const q = studentSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.full_name || "").toLowerCase().includes(q) ||
      (s.roll_number || "").toLowerCase().includes(q) ||
      (s.admission_number || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q) ||
      (s.assigned_grade || "").toLowerCase().includes(q)
    );
  });

  return (
    <ProtectedRoute allowedRoles={["super_admin", "transport", "principal", "correspondent"]}>
      {/* Dedicated Print Styles for Authentic Transport Pass */}
      <style jsx global>{`
        @media print {
          /* Hide all main web UI layout chrome */
          header, 
          nav, 
          aside, 
          footer,
          .no-print,
          div[class*="sidebar"],
          div[class*="ClientLayout"] > div:first-child,
          button {
            display: none !important;
          }
          
          body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Ensure modal backdrop doesn't dim or cover the print */
          .print-modal-backdrop {
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
            display: block !important;
            inset: auto !important;
          }

          .print-modal-content {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            background: transparent !important;
          }

          #printable-bus-pass {
            box-shadow: none !important;
            border: 2px solid #1e293b !important;
            page-break-inside: avoid !important;
            margin: 1cm auto !important;
            width: 92mm !important;
            min-height: 140mm !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5">
                <Bus className="w-3.5 h-3.5" /> Fleet & Transit Operations
              </span>
              <span className="text-xs text-gray-400">• Academic Year 2026–2027</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
              Student Transport Allocation
            </h1>
            <p className="text-xs text-gray-600">
              Assign students to bus routes, manage transit stops, and generate official student bus passes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all hover:border-gray-300"
              title="Export allocations to CSV"
            >
              <Download className="w-4 h-4 text-gray-500" />
              <span>Export List</span>
            </button>
            
            <button 
              onClick={() => {
                setSelectedStudent(null);
                setStudentSearchQuery("");
                setNewAllocation({ student_id: "", stop_id: "", status: "active" });
                setIsStudentDropdownOpen(false);
                fetchAvailableStudents();
                setIsModalOpen(true);
              }}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm shadow-indigo-600/20 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Allocate Student</span>
            </button>
          </div>
        </div>

        {/* Filters and Stats Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search student, roll, stop or route..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-xs w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="all">All Statuses ({allocations.length})</option>
                <option value="active">Active Passes ({allocations.filter(a => a.status === "active" || !a.status).length})</option>
                <option value="inactive">Inactive ({allocations.filter(a => a.status === "inactive").length})</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="font-medium text-gray-700 font-mono">
              Showing {filteredAllocations.length} of {allocations.length} Allocations
            </span>
          </div>
        </div>

        {/* Allocations Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Class / Section</th>
                  <th className="px-6 py-4">Assigned Route & Stop</th>
                  <th className="px-6 py-4">Pickup / Drop Time</th>
                  <th className="px-6 py-4">Monthly Fare</th>
                  <th className="px-6 py-4">Pass Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="inline-flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs">Loading transport allocation records...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredAllocations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="max-w-sm mx-auto space-y-2">
                        <Bus className="w-10 h-10 text-gray-300 mx-auto" />
                        <p className="font-semibold text-gray-700 text-sm">No Student Allocations Found</p>
                        <p className="text-xs text-gray-500">
                          {searchTerm ? "No records match your search criteria." : "Click 'Allocate Student' above to assign students to school transport routes."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAllocations.map(a => {
                    const studentName = a.student_name || "Student";
                    const initials = studentName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "ST";
                    const isPassActive = a.status === 'active' || !a.status;

                    return (
                      <tr key={a.id} className="hover:bg-indigo-50/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-sm flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-xs">{studentName}</p>
                              <p className="text-[11px] font-mono text-gray-500">
                                {a.student_roll || a.student_id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">
                            <GraduationCap className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                            {a.student_grade || "Grade 10-A"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <p className="font-medium text-gray-900 text-xs flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                              <span>{a.stop_name || a.stop_id}</span>
                            </p>
                            <p className="text-[11px] text-gray-500 pl-5">
                              {a.route_name || "Main Campus Route"}
                            </p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-600 space-y-0.5">
                            <div className="flex items-center gap-1">
                              <span className="text-emerald-600 font-medium">Pick:</span> {a.pickup_time || "07:30 AM"}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-gray-500">
                              <span className="text-amber-600 font-medium">Drop:</span> {a.drop_time || "04:30 PM"}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-mono font-semibold text-gray-800 text-xs">
                            ₹{a.monthly_fee ?? 1200}
                          </span>
                          <span className="text-[10px] text-gray-400 block">/ Month</span>
                        </td>

                        <td className="px-6 py-4">
                          {isPassActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              onClick={() => handleOpenPassPreview(a)} 
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors border border-indigo-200/60"
                              title="Preview & Print Official Bus Pass"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print Pass</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Allocate Student Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 no-print">
            <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Allocate Student to Route</h2>
                    <p className="text-[11px] text-gray-500">Assign boarding stop and generate official transit permit</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-semibold text-gray-700">
                      Select Student <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {unallocatedStudents.length} Unallocated Available
                    </span>
                  </div>

                  {selectedStudent ? (
                    <div className="flex items-center justify-between p-3 bg-indigo-50/80 border border-indigo-200 rounded-2xl">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                          {(selectedStudent.full_name || "ST").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-xs truncate">
                            {selectedStudent.full_name}
                          </p>
                          <p className="text-[11px] text-gray-500 font-mono">
                            {selectedStudent.roll_number || selectedStudent.admission_number || selectedStudent.id} • {selectedStudent.assigned_grade || "Grade 10-A"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudent(null);
                          setNewAllocation(prev => ({ ...prev, student_id: "" }));
                          setStudentSearchQuery("");
                          setIsStudentDropdownOpen(true);
                        }}
                        className="p-1.5 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Choose a different student"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3.5 top-3 text-gray-400" />
                        <input
                          type="text"
                          value={studentSearchQuery}
                          onFocus={() => setIsStudentDropdownOpen(true)}
                          onChange={e => {
                            setStudentSearchQuery(e.target.value);
                            setIsStudentDropdownOpen(true);
                          }}
                          placeholder="Search unallocated student by name, roll no, or grade..."
                          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-900 transition-colors"
                        />
                      </div>

                      {isStudentDropdownOpen && (
                        <div className="absolute z-20 w-full mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-gray-100">
                          {loadingStudents ? (
                            <div className="p-4 text-center text-gray-400 text-xs flex items-center justify-center space-x-2">
                              <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                              <span>Loading unallocated students...</span>
                            </div>
                          ) : filteredAvailableStudents.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-xs">
                              {studentSearchQuery ? (
                                <div className="space-y-1">
                                  <p className="font-semibold text-gray-700">No unallocated student found</p>
                                  <p className="text-[11px] text-gray-400">
                                    Already allocated students are excluded from this search.
                                  </p>
                                </div>
                              ) : (
                                <p className="text-gray-500">All students are currently allocated.</p>
                              )}
                            </div>
                          ) : (
                            filteredAvailableStudents.map(student => {
                              const initials = (student.full_name || "ST").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
                              return (
                                <button
                                  key={student.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedStudent(student);
                                    setNewAllocation(prev => ({ ...prev, student_id: student.id }));
                                    setStudentSearchQuery("");
                                    setIsStudentDropdownOpen(false);
                                  }}
                                  className="w-full px-3.5 py-2.5 text-left hover:bg-indigo-50/50 flex items-center justify-between transition-colors group"
                                >
                                  <div className="flex items-center space-x-2.5 min-w-0">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                      {initials}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-gray-900 text-xs truncate group-hover:text-indigo-600 transition-colors">
                                        {student.full_name}
                                      </p>
                                      <p className="text-[10px] text-gray-500 font-mono">
                                        {student.roll_number || student.admission_number || student.id}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-medium flex-shrink-0">
                                    {student.assigned_grade || "Grade 10-A"}
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">
                    Only students without an active bus pass are listed for allocation.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">
                    Select Designated Bus Stop <span className="text-rose-500">*</span>
                  </label>
                  {stopsList.length > 0 ? (
                    <select
                      value={newAllocation.stop_id}
                      onChange={e => setNewAllocation({...newAllocation, stop_id: e.target.value})}
                      required
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50"
                    >
                      <option value="">-- Choose Stop / Route --</option>
                      {stopsList.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.stop_name} — {s.route_name} (Pickup: {s.pickup_time || "07:30 AM"})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      required 
                      value={newAllocation.stop_id}
                      onChange={e => setNewAllocation({...newAllocation, stop_id: e.target.value})}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50"
                      placeholder="e.g. STOP-10"
                    />
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">Pass Status</label>
                  <select
                    value={newAllocation.status}
                    onChange={e => setNewAllocation({...newAllocation, status: e.target.value})}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50"
                  >
                    <option value="active">Active (Permit Issued)</option>
                    <option value="inactive">Inactive / Suspended</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 transition-all"
                  >
                    Save Allocation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================================= */}
        {/* OFFICIAL BUS PASS PRINT PREVIEW MODAL & HIGH-RESOLUTION CARD */}
        {/* ========================================================================================= */}
        {selectedPass && (
          <div className="print-modal-backdrop fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200">
            <div className="print-modal-content bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl border border-gray-200 space-y-6 animate-in zoom-in-95 duration-200 my-8">
              {/* Modal Top Bar (Hidden on Print) */}
              <div className="no-print flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Student Transport Pass</h2>
                    <p className="text-[11px] text-gray-500">Official physical ID permit formatted for direct print & laminating</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={triggerDirectPrint}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Pass</span>
                  </button>
                  <button 
                    onClick={() => setSelectedPass(null)}
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* PRINTABLE OFFICIAL BUS PASS CARD */}
              <div 
                id="printable-bus-pass" 
                className="bg-white rounded-2xl border-2 border-slate-800 shadow-xl overflow-hidden relative text-slate-900 font-sans mx-auto"
                style={{ width: "100%", maxWidth: "420px" }}
              >
                {/* Decorative Top Accent Bar */}
                <div className="h-2 bg-gradient-to-r from-amber-400 via-indigo-600 to-amber-500"></div>

                {/* Card Header */}
                <div className="bg-slate-900 text-white p-4 text-center relative border-b-2 border-amber-400">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-sm">
                      <Bus className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold tracking-wider text-xs uppercase text-amber-300">
                      {selectedPass.school_name || "GENESIS INTERNATIONAL SCHOOL"}
                    </span>
                  </div>
                  <div className="text-[10px] tracking-widest text-slate-300 font-medium uppercase">
                    SMART CAMPUS TRANSIT IDENTITY CARD • AY 2026–2027
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold tracking-wider uppercase">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    OFFICIAL STUDENT BUS PASS
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 bg-gradient-to-b from-slate-50 to-white">
                  {/* Student Details Row */}
                  <div className="flex items-center space-x-4 pb-4 border-b border-slate-200">
                    {/* Photo Monogram */}
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-24 rounded-xl bg-gradient-to-br from-slate-800 to-indigo-900 border-2 border-slate-700 flex flex-col items-center justify-center text-white shadow-inner">
                        <GraduationCap className="w-7 h-7 text-amber-400 mb-1" />
                        <span className="text-[10px] font-mono font-bold tracking-wider">
                          {(selectedPass.student_name || "ST").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full border-2 border-white shadow-sm" title="Verified Pass">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight truncate">
                        {selectedPass.student_name || "Student Name"}
                      </h3>
                      <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">Roll / ID:</span>
                        <span className="font-mono text-indigo-700 font-semibold">
                          {selectedPass.student_roll || selectedPass.student_id}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">Standard:</span>
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-bold text-[11px]">
                          {selectedPass.student_grade || "Grade 10-A"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{selectedPass.student_phone || "+91 98765 43210"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Route & Transit Details Grid */}
                  <div className="bg-slate-100/90 rounded-xl p-3.5 border border-slate-200/80 space-y-2.5">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">Assigned Route</span>
                        <span className="font-bold text-slate-900 text-xs block leading-tight mt-0.5">
                          {selectedPass.route_name || "Route 01 – Main Express"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">Boarding Stop</span>
                        <span className="font-bold text-indigo-900 text-xs block leading-tight mt-0.5">
                          {selectedPass.stop_name || selectedPass.stop_id}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-600" /> Morning Pickup:
                        </span>
                        <span className="font-bold text-emerald-700 text-xs font-mono">
                          {selectedPass.pickup_time || "07:30 AM"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" /> Evening Drop:
                        </span>
                        <span className="font-bold text-amber-700 text-xs font-mono">
                          {selectedPass.drop_time || "04:30 PM"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                      <span className="text-[11px] text-slate-600 font-medium">Monthly Fare Status:</span>
                      <span className="font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        ₹{selectedPass.monthly_fee ?? 1200} • PAID
                      </span>
                    </div>
                  </div>

                  {/* Verification & Signatures Section */}
                  <div className="pt-2 flex items-end justify-between gap-4">
                    {/* QR Code / Barcode representation */}
                    <div className="space-y-1">
                      <div className="w-14 h-14 bg-white p-1 rounded-lg border border-slate-300 shadow-sm flex items-center justify-center">
                        <QrCode className="w-12 h-12 text-slate-800" />
                      </div>
                      <span className="text-[8px] font-mono text-slate-400 block tracking-tight">
                        VALID PASS AY26-27
                      </span>
                    </div>

                    {/* Official Signatures */}
                    <div className="flex items-center space-x-4 text-center">
                      <div className="space-y-1">
                        <div className="h-7 border-b border-dashed border-slate-400 flex items-end justify-center px-1">
                          <span className="font-serif italic text-xs font-bold text-indigo-950">S. Murugan</span>
                        </div>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight block">
                          Transport Officer
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="h-7 border-b border-dashed border-slate-400 flex items-end justify-center px-1">
                          <span className="font-serif italic text-xs font-bold text-slate-900">Dr. K. Bharathi</span>
                        </div>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tight block">
                          Principal / Seal
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pass Rules Disclaimer */}
                  <div className="pt-2 border-t border-slate-200 text-center">
                    <p className="text-[8px] text-slate-500 leading-tight">
                      This pass is non-transferable and must be carried daily while boarding school vehicles. In case of loss, report to Transport Office immediately.
                    </p>
                  </div>
                </div>

                {/* Card Bottom Stripe */}
                <div className="h-1.5 bg-slate-900"></div>
              </div>

              {/* Bottom Actions (Hidden on Print) */}
              <div className="no-print flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Tip: Use <strong>A4</strong> or <strong>Card size</strong> in printer settings for best results.
                </span>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setSelectedPass(null)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    onClick={triggerDirectPrint}
                    className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Official Pass</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
