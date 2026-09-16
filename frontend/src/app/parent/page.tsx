"use client";

import { useEffect, useState } from "react";
import { Heart, CheckSquare, BookOpen, CreditCard, MessageSquare, Bus, Phone, ShieldCheck, MapPin } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import Tilt3D from "@/components/Tilt3D";

function CornerArchOrnament({ position = "tr" }: { position?: "tr" | "bl" | "br" }) {
  if (position === "tr") {
    return (
      <svg className="corner-arch-tr" viewBox="0 0 100 100" fill="none" stroke="#43634e" strokeWidth="1.5">
        <path d="M 100 0 A 100 100 0 0 0 0 100" />
        <path d="M 100 20 A 80 80 0 0 0 20 100" />
        <path d="M 100 40 A 60 60 0 0 0 40 100" />
        <path d="M 100 60 A 40 40 0 0 0 60 100" />
      </svg>
    );
  }
  return (
    <svg className="corner-arch-bl" viewBox="0 0 100 100" fill="none" stroke="#43634e" strokeWidth="1.5">
      <path d="M 0 100 A 100 100 0 0 1 100 0" />
      <path d="M 0 80 A 80 80 0 0 1 80 0" />
      <path d="M 0 60 A 60 60 0 0 1 60 0" />
      <path d="M 0 40 A 40 40 0 0 1 40 0" />
    </svg>
  );
}

interface ChildItem {
  student_id: string;
  student_name: string;
  email: string;
  grade?: string;
  section?: string;
  admission_number?: string;
}

interface ChildOverview {
  student_id: string;
  student_name: string;
  grade: string;
  section: string;
  attendance_rate: number;
  portion_progress: number;
  fees_paid_count: number;
  pending_fees_count: number;
  mentor_notes_count: number;
}

interface BusInfo {
  id: string;
  route_name: string;
  driver_name: string;
  driver_phone: string;
  bus_number: string;
  current_location: string;
  status: string;
  updated_at: string;
}

function ParentContent() {
  const [children, setChildren] = useState<ChildItem[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildItem | null>(null);
  const [overview, setOverview] = useState<ChildOverview | null>(null);
  const [bus, setBus] = useState<BusInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchParentData = async () => {
    setLoading(true);
    try {
      const childrenRes = await api.get("/parent/children");
      setChildren(childrenRes.data);
      if (childrenRes.data.length > 0) {
        const first = childrenRes.data[0];
        setSelectedChild(first);
        loadChildDetails(first.student_id);
      }
    } catch (err) {
      console.error("Failed to fetch parent data:", err);
    }
    setLoading(false);
  };

  const loadChildDetails = async (studentId: string) => {
    try {
      const [ovRes, busRes] = await Promise.all([
        api.get(`/parent/child-overview/${studentId}`),
        api.get(`/parent/bus-tracking/${studentId}`),
      ]);
      setOverview(ovRes.data);
      setBus(busRes.data);
    } catch (err) {
      console.error("Failed to load child details:", err);
    }
  };

  useEffect(() => {
    fetchParentData();
  }, []);

  const handleChildSelect = (child: ChildItem) => {
    setSelectedChild(child);
    loadChildDetails(child.student_id);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#e5c158]/20 text-[#e5c158] font-bold border border-[#e5c158]/40">
            Parent Guardian Workspace
          </span>
          <span className="text-xs text-[#a3c9b0]">• Real-Time Student Monitoring</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-[#f4f0e6] font-syne flex items-center gap-3 tracking-tight mt-1">
          <div className="w-10 h-10 rounded-xl bg-[#e5c158]/20 border border-[#e5c158]/40 flex items-center justify-center">
            <Heart className="w-5 h-5 text-[#e5c158]" />
          </div>
          Parent Portal & Child Overview
        </h1>
        <p className="text-sm text-[#a3c9b0] font-medium">
          Track your child's attendance rate, portion completion, fee status, and real-time school bus location.
        </p>
      </div>

      {/* Child Selector Tabs */}
      {children.length > 0 && (
        <div className="flex gap-3">
          {children.map((c) => (
            <button
              key={c.student_id}
              onClick={() => handleChildSelect(c)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                selectedChild?.student_id === c.student_id
                  ? "bg-[#e5c158] text-black shadow-lg"
                  : "glass-box text-[#a3c9b0] hover:text-[#f4f0e6]"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-black/30 flex items-center justify-center text-[10px] font-extrabold">
                {c.student_name[0]}
              </div>
              <span>{c.student_name} (Grade {c.grade}-{c.section})</span>
            </button>
          ))}
        </div>
      )}

      {loading || !overview ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#e5c158]/30 border-t-[#e5c158] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Child Progress Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Attendance Rate */}
              <Tilt3D>
                <div className="glass-emerald-tile p-5 rounded-[22px] space-y-2">
                  <CornerArchOrnament position="tr" />
                  <div className="text-xs text-[#a3c9b0] font-bold uppercase flex items-center gap-1.5 relative z-10">
                    <CheckSquare className="w-4 h-4 text-emerald-400" /> Attendance Rate
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-400 font-syne relative z-10">{overview.attendance_rate}%</div>
                  <div className="text-[11px] text-[#a3c9b0] font-semibold relative z-10">Regular School Attendance</div>
                </div>
              </Tilt3D>

              {/* Portion Progress */}
              <Tilt3D>
                <div className="glass-emerald-tile p-5 rounded-[22px] space-y-2">
                  <CornerArchOrnament position="bl" />
                  <div className="text-xs text-[#a3c9b0] font-bold uppercase flex items-center gap-1.5 relative z-10">
                    <BookOpen className="w-4 h-4 text-amber-300" /> Portion Done
                  </div>
                  <div className="text-3xl font-extrabold text-amber-300 font-syne relative z-10">{overview.portion_progress}%</div>
                  <div className="text-[11px] text-[#a3c9b0] font-semibold relative z-10">Syllabus Completion</div>
                </div>
              </Tilt3D>

              {/* Fee Receipts */}
              <Tilt3D>
                <div className="glass-emerald-tile p-5 rounded-[22px] space-y-2">
                  <CornerArchOrnament position="tr" />
                  <div className="text-xs text-[#a3c9b0] font-bold uppercase flex items-center gap-1.5 relative z-10">
                    <CreditCard className="w-4 h-4 text-[#e5c158]" /> Fee Receipts
                  </div>
                  <div className="text-3xl font-extrabold text-[#f4f0e6] font-syne relative z-10">{overview.fees_paid_count} Paid</div>
                  <div className="text-[11px] text-[#e5c158] font-bold relative z-10">
                    {overview.pending_fees_count === 0 ? "All Dues Cleared" : `${overview.pending_fees_count} Pending`}
                  </div>
                </div>
              </Tilt3D>
            </div>

            {/* Teacher Notes & Feedback */}
            <Tilt3D>
              <div className="glass-emerald-tile p-6 rounded-[24px] space-y-4">
                <CornerArchOrnament position="tr" />
                <h2 className="text-base font-extrabold text-[#f4f0e6] font-syne flex items-center gap-2 relative z-10">
                  <MessageSquare className="w-4 h-4 text-[#e5c158]" />
                  Teacher & Mentor Activity Feedback
                </h2>
                <div className="p-4 rounded-xl glass-box text-xs space-y-2 relative z-10">
                  <div className="flex items-center justify-between text-[#a3c9b0]">
                    <span className="font-extrabold text-[#e5c158] uppercase tracking-wider text-[10px]">Academic Progress Note</span>
                    <span>July 2026</span>
                  </div>
                  <p className="text-[#f4f0e6] leading-relaxed">
                    {selectedChild?.student_name} is performing consistently well in Physics and CS binary search tree practicals. Attendance remains above target threshold.
                  </p>
                </div>
              </div>
            </Tilt3D>
          </div>

          {/* School Bus Tracking Widget */}
          <Tilt3D>
            <div className="glass-emerald-tile p-6 rounded-[24px] space-y-5">
              <CornerArchOrnament position="bl" />
              <h2 className="text-base font-extrabold text-[#f4f0e6] font-syne flex items-center gap-2 relative z-10">
                <Bus className="w-5 h-5 text-[#e5c158]" />
                School Bus Live Tracking
              </h2>

              {bus && (
                <div className="space-y-4 text-xs relative z-10">
                  <div className="p-3.5 rounded-xl glass-box border border-[#e5c158]/30 space-y-1">
                    <div className="font-extrabold text-sm text-[#f4f0e6] font-syne flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#e5c158]" />
                      {bus.route_name}
                    </div>
                    <div className="text-[11px] text-[#a3c9b0]">{bus.current_location}</div>
                  </div>

                  <div className="space-y-2 border-t border-[#a3c9b0]/20 pt-3">
                    <div className="flex justify-between py-1 border-b border-[#a3c9b0]/10">
                      <span className="text-[#a3c9b0]">Bus Number:</span>
                      <span className="font-mono text-[#f4f0e6] font-bold">{bus.bus_number}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#a3c9b0]/10">
                      <span className="text-[#a3c9b0]">Driver Name:</span>
                      <span className="text-[#f4f0e6] font-semibold">{bus.driver_name}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#a3c9b0]/10">
                      <span className="text-[#a3c9b0]">Driver Phone:</span>
                      <span className="text-[#e5c158] font-mono flex items-center gap-1 font-bold">
                        <Phone className="w-3 h-3" /> {bus.driver_phone}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#a3c9b0]/10">
                      <span className="text-[#a3c9b0]">Status:</span>
                      <span className="uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px]">
                        {bus.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl glass-box text-[10px] text-[#a3c9b0] text-center font-medium">
                    Live GPS tracking synced with driver mobile broadcast.
                  </div>
                </div>
              )}
            </div>
          </Tilt3D>
        </div>
      )}
    </div>
  );
}

export default function ParentPage() {
  return (
    <ProtectedRoute allowedRoles={["super_admin", "correspondent", "principal"]}>
      <ParentContent />
    </ProtectedRoute>
  );
}

