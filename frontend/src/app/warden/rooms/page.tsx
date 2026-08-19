"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Home, Users, Plus, X } from "lucide-react";

export default function WardenRooms() {
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAllocateStudent, setShowAllocateStudent] = useState<number | null>(null);
  const [newStudentName, setNewStudentName] = useState("");
  const [newRoomBlock, setNewRoomBlock] = useState("Block A (Boys)");
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newRoomCapacity, setNewRoomCapacity] = useState(2);
  const [rooms, setRooms] = useState<any[]>([]);
  const [hostelAppliedStudents, setHostelAppliedStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsRes, studentsRes] = await Promise.all([
        api.get("/warden/rooms"),
        api.get("/warden/available-students")
      ]);
      setRooms(roomsRes.data || []);
      setHostelAppliedStudents(studentsRes.data || []);
    } catch (err) {
      console.error("Failed to load hostel data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveRoom = async () => {
    if (!newRoomNumber) return;
    try {
      await api.post("/warden/rooms", {
        block_name: newRoomBlock.split(" ")[0] + " " + (newRoomBlock.split(" ")[1] || ""),
        room_number: newRoomNumber,
        capacity: newRoomCapacity
      });
      await fetchData();
      setShowAddRoom(false);
      setNewRoomNumber("");
      setNewRoomCapacity(2);
    } catch (err) {
      console.error("Failed to add room", err);
    }
  };

  const handleAllocateStudent = async () => {
    if (!newStudentName || showAllocateStudent === null) return;
    
    try {
      await api.post(`/warden/rooms/${showAllocateStudent}/allocate`, {
        student_id: newStudentName // newStudentName actually holds the student ID from the select value
      });
      await fetchData();
      setShowAllocateStudent(null);
      setNewStudentName("");
    } catch (err) {
      console.error("Failed to allocate student", err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['warden', 'super_admin', 'principal']}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
              <Home className="w-8 h-8 text-amber-400" />
              Room Allocation Matrix
            </h1>
            <p className="text-gray-600 mt-2">Manage hostel blocks, floors, and student room assignments.</p>
          </div>
          <button 
            onClick={() => setShowAddRoom(true)}
            className="bg-amber-600 hover:bg-amber-700 text-brand-black px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Room
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const isFull = room.students.length >= room.capacity;
            return (
              <div key={room.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-brand-black">{room.block} - Room {room.number}</h3>
                    <p className="text-sm text-gray-600">{room.type}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-xs font-bold border ${isFull ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                    {room.students.length}/{room.capacity} {isFull ? 'Full' : 'Occupied'}
                  </div>
                </div>
                
                <div className="space-y-3 mt-4">
                  {room.students.map((student, idx) => (
                    <div key={idx} className="bg-gray-50/50 p-3 rounded-lg flex items-center gap-3 border border-gray-200">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-brand-black">{student.name}</span>
                    </div>
                  ))}
                  {!isFull && (
                    <button 
                      onClick={() => setShowAllocateStudent(room.id)}
                      className="w-full border border-dashed border-gray-600 hover:border-amber-400 text-gray-600 hover:text-amber-400 p-3 rounded-lg transition-colors text-sm flex justify-center items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Allocate Student
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Room Modal */}
        {showAddRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-black">Add New Room</h3>
                <button onClick={() => setShowAddRoom(false)} className="text-gray-600 hover:text-brand-black transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Block</label>
                  <select 
                    value={newRoomBlock}
                    onChange={(e) => setNewRoomBlock(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
                  >
                    <option>Block A (Boys)</option>
                    <option>Block B (Girls)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Room Number</label>
                  <input 
                    type="text" 
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500" 
                    placeholder="e.g. 101" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Capacity</label>
                  <input 
                    type="number" 
                    value={newRoomCapacity}
                    onChange={(e) => setNewRoomCapacity(parseInt(e.target.value))}
                    min="1" 
                    className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500" 
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50/50 flex justify-end gap-3">
                <button onClick={() => setShowAddRoom(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:text-brand-black transition-colors">Cancel</button>
                <button onClick={handleSaveRoom} className="bg-amber-600 hover:bg-amber-700 text-brand-black px-4 py-2 rounded-lg transition-colors">Save Room</button>
              </div>
            </div>
          </div>
        )}

        {/* Allocate Student Modal */}
        {showAllocateStudent !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-brand-black">Allocate Student</h3>
                <button onClick={() => setShowAllocateStudent(null)} className="text-gray-600 hover:text-brand-black transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Select Student</label>
                  <select 
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="" disabled>Select an applied student...</option>
                    {hostelAppliedStudents.map((student: any) => (
                      <option key={student.id} value={student.id}>{student.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 bg-gray-50/50 flex justify-end gap-3">
                <button onClick={() => setShowAllocateStudent(null)} className="px-4 py-2 rounded-lg text-gray-600 hover:text-brand-black transition-colors">Cancel</button>
                <button onClick={handleAllocateStudent} className="bg-amber-600 hover:bg-amber-700 text-brand-black px-4 py-2 rounded-lg transition-colors">Allocate</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
