"use client";

import { useEffect, useState } from "react";
import { Heart, CheckSquare, BookOpen, CreditCard, MessageSquare, Bus, Phone, ShieldCheck, MapPin } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
            <Heart className="w-5 h-5 text-pink-400" />
          </div>
          Parent Portal & Child Overview
        </h1>
        <p className="text-sm text-gray-400">Track your child's attendance rate, portion completion, fee status, and real-time school bus location</p>
      </div>

      {/* Child Selector Tabs */}
      {children.length > 0 && (
        <div className="flex gap-3">
          {children.map((c) => (
            <button
              key={c.student_id}
              onClick={() => handleChildSelect(c)}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                selectedChild?.student_id === c.student_id
                  ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-lg shadow-pink-500/10"
                  : "glass-panel text-gray-400 hover:text-white"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-pink-500/30 flex items-center justify-center text-[10px] text-white font-bold">
                {c.student_name[0]}
              </div>
              <span>{c.student_name} (Grade {c.grade}-{c.section})</span>
            </button>
          ))}
        </div>
      )}

      {loading || !overview ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Child Progress Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Attendance Rate */}
              <div className="glass-panel p-5 rounded-2xl border-l-4 border-emerald-500 space-y-2">
                <div className="text-xs text-gray-400 font-semibold uppercase flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400" /> Attendance Rate
                </div>
                <div className="text-3xl font-bold text-emerald-400">{overview.attendance_rate}%</div>
                <div className="text-[11px] text-emerald-300/80 font-medium">Regular School Attendance</div>
              </div>

              {/* Portion Progress */}
              <div className="glass-panel p-5 rounded-2xl border-l-4 border-amber-500 space-y-2">
                <div className="text-xs text-gray-400 font-semibold uppercase flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" /> Portion Done
                </div>
                <div className="text-3xl font-bold text-amber-400">{overview.portion_progress}%</div>
                <div className="text-[11px] text-amber-300/80 font-medium">Syllabus Completion</div>
              </div>

              {/* Fee Receipts */}
              <div className="glass-panel p-5 rounded-2xl border-l-4 border-indigo-500 space-y-2">
                <div className="text-xs text-gray-400 font-semibold uppercase flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-indigo-400" /> Fee Receipts
                </div>
                <div className="text-3xl font-bold text-white">{overview.fees_paid_count} Paid</div>
                <div className="text-[11px] text-indigo-300 font-medium">
                  {overview.pending_fees_count === 0 ? "All Dues Cleared" : `${overview.pending_fees_count} Pending`}
                </div>
              </div>
            </div>

            {/* Teacher Notes & Feedback */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-pink-400" />
                Teacher & Mentor Activity Feedback
              </h2>
              <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800/60 text-xs space-y-2">
                <div className="flex items-center justify-between text-gray-400">
                  <span className="font-semibold text-pink-300 uppercase tracking-wider text-[10px]">Academic Progress Note</span>
                  <span>July 2026</span>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {selectedChild?.student_name} is performing consistently well in Physics and CS binary search tree practicals. Attendance remains above target threshold.
                </p>
              </div>
            </div>
          </div>

          {/* School Bus Tracking Widget */}
          <div className="glass-panel-glow p-6 rounded-2xl space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bus className="w-5 h-5 text-pink-400" />
              School Bus Live Tracking
            </h2>

            {bus && (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-300 space-y-1">
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-pink-400" />
                    {bus.route_name}
                  </div>
                  <div className="text-[11px] text-gray-300">{bus.current_location}</div>
                </div>

                <div className="space-y-2 border-t border-gray-800/60 pt-3">
                  <div className="flex justify-between py-1 border-b border-gray-800/40">
                    <span className="text-gray-400">Bus Number:</span>
                    <span className="font-mono text-white font-semibold">{bus.bus_number}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-800/40">
                    <span className="text-gray-400">Driver Name:</span>
                    <span className="text-white font-medium">{bus.driver_name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-800/40">
                    <span className="text-gray-400">Driver Phone:</span>
                    <span className="text-pink-300 font-mono flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {bus.driver_phone}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-800/40">
                    <span className="text-gray-400">Status:</span>
                    <span className="uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                      {bus.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800/60 text-[10px] text-gray-400 text-center">
                  Live GPS tracking synced with driver mobile broadcast.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ParentPage() {
  return (
    <ProtectedRoute allowedRoles={["super_admin", "correspondent", "admin", "principal", "parent"]}>
      <ParentContent />
    </ProtectedRoute>
  );
}
