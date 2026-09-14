"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Users, Save, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

export default function WardenAttendance() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceState, setAttendanceState] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState("Block A (Boys)");

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomsRes, attRes] = await Promise.all([
        api.get("/warden/rooms"),
        api.get(`/warden/attendance?target_date=${todayStr}`)
      ]);

      const rooms = roomsRes.data || [];
      const flattenedStudents: any[] = [];
      rooms.forEach((room: any) => {
        room.students.forEach((st: any) => {
          flattenedStudents.push({
            student_id: st.id,
            student_name: st.name,
            room_number: room.number,
            block: room.block
          });
        });
      });
      setStudents(flattenedStudents);

      const existingAtt = attRes.data?.records || [];
      const newAttState: Record<string, string> = {};
      
      // Default to present, or use existing status
      flattenedStudents.forEach(st => {
        const found = existingAtt.find((r: any) => r.student_id === st.student_id);
        newAttState[st.student_id] = found ? found.status : "present";
      });
      
      setAttendanceState(newAttState);

      // Auto select the first available block if there are rooms
      if (rooms.length > 0) {
        const blocks = Array.from(new Set(rooms.map((r: any) => r.block)));
        if (!blocks.includes(selectedBlock)) {
          setSelectedBlock(blocks[0] as string);
        }
      }

    } catch (err) {
      console.error("Failed to load attendance data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      const records = Object.entries(attendanceState).map(([student_id, status]) => ({
        student_id,
        status
      }));

      await api.post("/warden/attendance", {
        date: todayStr,
        records
      });

      setToastMessage("Attendance saved successfully!");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("Failed to save attendance", err);
    }
  };

  const filteredStudents = students.filter(s => s.block === selectedBlock);

  const availableBlocks = Array.from(new Set(students.map(s => s.block)));

  return (
    <ProtectedRoute allowedRoles={['warden', 'super_admin', 'principal']}>
      <div className="space-y-6 max-w-5xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-brand-black flex items-center gap-3">
              <Users className="w-8 h-8 text-emerald-600" />
              Hostel Roll Call
            </h1>
            <p className="text-gray-600 mt-2">Log daily evening attendance for boarding students.</p>
          </div>
          <button 
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-brand-black px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" /> Save Attendance
          </button>
        </header>

        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 rounded-2xl border border-gray-200 overflow-x-auto">
          <div className="flex justify-between items-center mb-6">
            <select 
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-brand-black rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
            >
              {availableBlocks.length > 0 ? (
                availableBlocks.map(block => (
                  <option key={block} value={block}>{block}</option>
                ))
              ) : (
                <option>No Blocks Available</option>
              )}
            </select>
            <div className="text-gray-600 text-sm whitespace-nowrap ml-4">Date: <strong>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></div>
          </div>

          <table className="w-full text-left text-sm text-gray-600 min-w-max">
            <thead className="bg-gray-100 text-gray-700 uppercase font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Room</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4 text-center">Present</th>
                <th className="px-6 py-4 text-center">Absent</th>
                <th className="px-6 py-4 text-center">On Leave</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading attendance data...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No students found in this block.</td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.student_id} className="hover:bg-gray-100/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-brand-black">{student.room_number}</td>
                    <td className="px-6 py-4">{student.student_name}</td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="radio" 
                        name={`att_${student.student_id}`} 
                        className="w-4 h-4 accent-emerald-500" 
                        checked={attendanceState[student.student_id] === "present"}
                        onChange={() => setAttendanceState(prev => ({...prev, [student.student_id]: "present"}))}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="radio" 
                        name={`att_${student.student_id}`} 
                        className="w-4 h-4 accent-rose-500" 
                        checked={attendanceState[student.student_id] === "absent"}
                        onChange={() => setAttendanceState(prev => ({...prev, [student.student_id]: "absent"}))}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="radio" 
                        name={`att_${student.student_id}`} 
                        className="w-4 h-4 accent-amber-500" 
                        checked={attendanceState[student.student_id] === "leave"}
                        onChange={() => setAttendanceState(prev => ({...prev, [student.student_id]: "leave"}))}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {toastMessage && (
          <div className="fixed bottom-4 right-4 bg-gray-100 border border-gray-200 text-brand-black px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            {toastMessage}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
