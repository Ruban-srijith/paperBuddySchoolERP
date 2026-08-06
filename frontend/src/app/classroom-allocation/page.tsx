"use client";

import { useState } from "react";
import { 
  LayoutGrid, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Search, 
  Filter,
  Layers,
  Edit3,
  X
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/components/Toast";

interface RoomAllocation {
  id: string;
  room_number: string;
  building_block: string;
  room_type: "classroom" | "lab" | "auditorium";
  capacity: number;
  assigned_class: string;
  current_occupancy: number;
  status: "occupied" | "available" | "maintenance";
}

export default function ClassroomAllocationPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [editingRoom, setEditingRoom] = useState<RoomAllocation | null>(null);

  const [rooms, setRooms] = useState<RoomAllocation[]>([
    { id: "r1", room_number: "Room 101", building_block: "Block A (Primary)", room_type: "classroom", capacity: 35, assigned_class: "Grade 1-A", current_occupancy: 30, status: "occupied" },
    { id: "r2", room_number: "Room 102", building_block: "Block A (Primary)", room_type: "classroom", capacity: 35, assigned_class: "Grade 1-B", current_occupancy: 30, status: "occupied" },
    { id: "r3", room_number: "Room 201", building_block: "Block B (Middle)", room_type: "classroom", capacity: 40, assigned_class: "Grade 6-A", current_occupancy: 32, status: "occupied" },
    { id: "r4", room_number: "Room 301", building_block: "Block C (Senior)", room_type: "classroom", capacity: 40, assigned_class: "Grade 10-A", current_occupancy: 30, status: "occupied" },
    { id: "r5", room_number: "Room 302", building_block: "Block C (Senior)", room_type: "classroom", capacity: 40, assigned_class: "Grade 10-B", current_occupancy: 30, status: "occupied" },
    { id: "r6", room_number: "Physics Lab 204", building_block: "Science Block", room_type: "lab", capacity: 36, assigned_class: "Grade 10-A (Practical)", current_occupancy: 30, status: "occupied" },
    { id: "r7", room_number: "Chem Lab 2", building_block: "Science Block", room_type: "lab", capacity: 32, assigned_class: "Grade 12-A", current_occupancy: 28, status: "occupied" },
    { id: "r8", room_number: "CS Lab 1", building_block: "Tech Wing", room_type: "lab", capacity: 40, assigned_class: "Grade 11-A", current_occupancy: 32, status: "occupied" },
    { id: "r9", room_number: "Auditorium Main", building_block: "Central Complex", room_type: "auditorium", capacity: 500, assigned_class: "Morning Assembly", current_occupancy: 450, status: "occupied" },
    { id: "r10", room_number: "Room 401 (Seminar)", building_block: "Block C (Senior)", room_type: "classroom", capacity: 45, assigned_class: "Free Slot", current_occupancy: 0, status: "available" },
  ]);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    setRooms(prev => prev.map(r => r.id === editingRoom.id ? editingRoom : r));
    toast.success(`Allocated ${editingRoom.room_number} to ${editingRoom.assigned_class}`, "Allocation Saved");
    setEditingRoom(null);
  };

  const filteredRooms = rooms.filter(r => {
    const matchesSearch = r.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.assigned_class.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || r.room_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <ProtectedRoute allowedRoles={["vice_principal", "dean", "dept_head", "super_admin", "admin", "principal"]}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30 whitespace-nowrap">
              Vice-Principal Operations
            </span>
            <span className="text-xs text-gray-400 whitespace-nowrap">• Space Capacity Optimization</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight mt-1">
            Classroom & Specialized Lab Allocation
          </h1>
          <p className="text-xs text-gray-400">
            Real-time physical space planner across primary wings, senior high classrooms, science laboratories, and computer suites.
          </p>
        </div>

        {/* Filters */}
        <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64 max-w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search room or class..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs w-full"
              />
            </div>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-700 text-white text-xs w-full sm:w-auto"
            >
              <option value="all">All Facilities</option>
              <option value="classroom">Classrooms</option>
              <option value="lab">Science & CS Labs</option>
              <option value="auditorium">Auditoriums</option>
            </select>
          </div>

          <span className="text-xs text-gray-400 font-mono">
            {rooms.filter(r => r.status === 'occupied').length} of {rooms.length} Spaces Allocated
          </span>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRooms.map(r => {
            const isAvail = r.status === "available";

            return (
              <div
                key={r.id}
                className={`glass-panel p-5 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                  isAvail ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-gray-800 hover:border-purple-500/40'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {r.room_type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isAvail ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {r.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{r.room_number}</h3>
                  <p className="text-xs text-gray-400">{r.building_block}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-800 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Assigned Class:</span>
                    <span className="font-semibold text-cyan-300">{r.assigned_class}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Seating / Capacity:</span>
                    <span className="font-mono text-gray-200">{r.current_occupancy} / {r.capacity} Seats</span>
                  </div>

                  <button
                    onClick={() => setEditingRoom(r)}
                    className="w-full mt-2 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                    <span>Modify Allocation</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit Allocation Modal */}
        {editingRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="glass-panel border border-gray-700 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h3 className="text-base font-bold text-white">Allocate {editingRoom.room_number}</h3>
                <button onClick={() => setEditingRoom(null)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Assigned Grade / Section</label>
                  <input
                    type="text"
                    value={editingRoom.assigned_class}
                    onChange={e => setEditingRoom({ ...editingRoom, assigned_class: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Student Strength Headcount</label>
                  <input
                    type="number"
                    max={editingRoom.capacity}
                    value={editingRoom.current_occupancy}
                    onChange={e => setEditingRoom({ ...editingRoom, current_occupancy: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white font-mono"
                  />
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Capacity check passed: Fits within {editingRoom.capacity} seats.</span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => setEditingRoom(null)}
                    className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-md shadow-purple-600/30 hover:bg-purple-500"
                  >
                    Save Allocation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
