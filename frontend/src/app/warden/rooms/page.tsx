"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Home, Users, Plus, X } from "lucide-react";

export default function WardenRooms() {
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAllocateStudent, setShowAllocateStudent] = useState<number | null>(null);
  const [newStudentName, setNewStudentName] = useState("");
  const [newRoomBlock, setNewRoomBlock] = useState("Block A (Boys)");
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [newRoomCapacity, setNewRoomCapacity] = useState(2);
  const [rooms, setRooms] = useState([
    {
      id: 1,
      block: "Block A",
      number: "101",
      type: "Standard Room • Ground Floor",
      capacity: 3,
      students: [
        { name: "Rahul Sharma (Grade 10)" },
        { name: "Amit Kumar (Grade 10)" }
      ]
    },
    {
      id: 2,
      block: "Block A",
      number: "102",
      type: "AC Room • Ground Floor",
      capacity: 2,
      students: [
        { name: "Vikram Singh (Grade 12)" },
        { name: "Arjun Das (Grade 12)" }
      ]
    }
  ]);

  const handleSaveRoom = () => {
    if (!newRoomNumber) return;
    const newRoom = {
      id: Date.now(),
      block: newRoomBlock.split(" ")[0] + " " + newRoomBlock.split(" ")[1],
      number: newRoomNumber,
      type: "Standard Room",
      capacity: newRoomCapacity,
      students: []
    };
    setRooms([...rooms, newRoom]);
    setShowAddRoom(false);
    setNewRoomNumber("");
    setNewRoomCapacity(2);
  };

  const handleAllocateStudent = () => {
    if (!newStudentName || showAllocateStudent === null) return;
    
    setRooms(rooms.map(room => {
      if (room.id === showAllocateStudent) {
        return {
          ...room,
          students: [...room.students, { name: newStudentName }]
        };
      }
      return room;
    }));
    
    setShowAllocateStudent(null);
    setNewStudentName("");
  };

  const hostelAppliedStudents = [
    "Yash Sharma (Grade 11)",
    "Priya Patel (Grade 10)",
    "Rohan Gupta (Grade 12)",
    "Ananya Singh (Grade 9)",
    "Karthik Reddy (Grade 11)"
  ];

  return (
    <ProtectedRoute allowedRoles={['warden', 'super_admin', 'admin', 'principal']}>
      <div className="space-y-6 max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Home className="w-8 h-8 text-amber-400" />
              Room Allocation Matrix
            </h1>
            <p className="text-gray-400 mt-2">Manage hostel blocks, floors, and student room assignments.</p>
          </div>
          <button 
            onClick={() => setShowAddRoom(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Room
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const isFull = room.students.length >= room.capacity;
            return (
              <div key={room.id} className="glass-panel p-6 rounded-2xl border border-gray-800">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{room.block} - Room {room.number}</h3>
                    <p className="text-sm text-gray-400">{room.type}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-xs font-bold border ${isFull ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                    {room.students.length}/{room.capacity} {isFull ? 'Full' : 'Occupied'}
                  </div>
                </div>
                
                <div className="space-y-3 mt-4">
                  {room.students.map((student, idx) => (
                    <div key={idx} className="bg-gray-900/50 p-3 rounded-lg flex items-center gap-3 border border-gray-800">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-white">{student.name}</span>
                    </div>
                  ))}
                  {!isFull && (
                    <button 
                      onClick={() => setShowAllocateStudent(room.id)}
                      className="w-full border border-dashed border-gray-600 hover:border-amber-400 text-gray-400 hover:text-amber-400 p-3 rounded-lg transition-colors text-sm flex justify-center items-center gap-2"
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
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Add New Room</h3>
                <button onClick={() => setShowAddRoom(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Block</label>
                  <select 
                    value={newRoomBlock}
                    onChange={(e) => setNewRoomBlock(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
                  >
                    <option>Block A (Boys)</option>
                    <option>Block B (Girls)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Room Number</label>
                  <input 
                    type="text" 
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500" 
                    placeholder="e.g. 101" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Capacity</label>
                  <input 
                    type="number" 
                    value={newRoomCapacity}
                    onChange={(e) => setNewRoomCapacity(parseInt(e.target.value))}
                    min="1" 
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500" 
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
                <button onClick={() => setShowAddRoom(false)} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleSaveRoom} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors">Save Room</button>
              </div>
            </div>
          </div>
        )}

        {/* Allocate Student Modal */}
        {showAllocateStudent !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Allocate Student</h3>
                <button onClick={() => setShowAllocateStudent(null)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Select Student</label>
                  <select 
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="" disabled>Select an applied student...</option>
                    {hostelAppliedStudents.map(student => (
                      <option key={student} value={student}>{student}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end gap-3">
                <button onClick={() => setShowAllocateStudent(null)} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={handleAllocateStudent} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors">Allocate</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
