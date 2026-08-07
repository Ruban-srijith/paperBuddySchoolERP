"use client";

import { useState, useEffect } from 'react';
import { Users, Search, GraduationCap, X, Check, UserPlus, Shield, Loader2, ListOrdered, CheckSquare, Plus, UsersRound } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';

interface StudentItem {
  id: string;
  full_name: string;
  admission_number: string;
  class_id: string | null;
}

interface ClassItem {
  id: string;
  grade: string;
  section: string;
  class_teacher_id: string | null;
  teacher_name: string | null;
}

interface TeacherItem {
  id: string;
  full_name: string;
}

export default function ClassRosterPage() {
  return (
    <ProtectedRoute allowedRoles={["super_admin", "correspondent", "admin", "principal", "vice_principal"]}>
      <ClassRosterContent />
    </ProtectedRoute>
  );
}

function ClassRosterContent() {
  const { toast } = useToast();
  
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<StudentItem[]>([]);
  const [classStudents, setClassStudents] = useState<StudentItem[]>([]);
  
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  
  // Selections
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  
  const fetchData = async () => {
    try {
      const [classesRes, teachersRes, studentsRes] = await Promise.all([
        api.get('/classes'),
        api.get('/users?role=teacher'),
        api.get('/students')
      ]);
      
      setClasses(classesRes.data);
      setTeachers(teachersRes.data);
      
      const allStudents: StudentItem[] = studentsRes.data;
      setUnassignedStudents(allStudents.filter(s => !s.class_id));
      
      if (selectedClassId) {
        setClassStudents(allStudents.filter(s => s.class_id === selectedClassId));
      }
    } catch (err) {
      toast.error("Failed to fetch roster data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      api.get(`/students?class_id=${selectedClassId}`).then(res => {
        setClassStudents(res.data);
      });
    }
  }, [selectedClassId]);

  const selectedClass = classes.find(c => c.id === selectedClassId);

  const handleAssignTeacher = async () => {
    if (!selectedClassId || !selectedTeacherId) return;
    try {
      await api.put(`/classes/${selectedClassId}/assign`, { teacher_id: selectedTeacherId });
      toast.success("Class teacher assigned successfully");
      setShowTeacherModal(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to assign teacher");
    }
  };

  const handleBulkAssignStudents = async () => {
    if (!selectedClassId || selectedStudentIds.size === 0) return;
    try {
      await api.put(`/students/assign-class`, {
        student_ids: Array.from(selectedStudentIds),
        class_id: selectedClassId
      });
      toast.success(`Successfully assigned ${selectedStudentIds.size} students`);
      setShowAddStudentsModal(false);
      setSelectedStudentIds(new Set());
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to assign students");
    }
  };
  
  const handleRemoveStudent = async (studentId: string) => {
    try {
      await api.put(`/students/assign-class`, {
        student_ids: [studentId],
        class_id: null
      });
      toast.success("Student removed from class");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to remove student");
    }
  };

  if (loading && classes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-brand-black flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center flex-shrink-0">
              <UsersRound className="w-5 h-5 text-fuchsia-400" />
            </div>
            Class Roster & Assignments
          </h1>
          <p className="text-sm text-gray-600">Manage class teachers and assign students to specific sections.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Class Selection */}
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 lg:col-span-1 h-[600px] flex flex-col">
          <h3 className="text-sm font-bold text-brand-black mb-4 uppercase tracking-wider text-gray-600">Select Section</h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {classes.map(cls => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedClassId === cls.id
                    ? 'bg-fuchsia-600/20 border-fuchsia-500/50 text-fuchsia-200'
                    : 'bg-gray-50/50 border-gray-200 hover:border-gray-200 text-gray-600 hover:bg-gray-100/50'
                }`}
              >
                <div className="font-semibold text-sm">Grade {cls.grade} - {cls.section}</div>
                <div className="text-[11px] mt-1 opacity-70">
                  {cls.class_teacher_id ? cls.teacher_name : 'No Teacher Assigned'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel: Class Roster */}
        <div className="lg:col-span-3">
          {selectedClassId && selectedClass ? (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm rounded-2xl border border-gray-200 h-[600px] flex flex-col overflow-hidden">
              {/* Roster Header */}
              <div className="p-5 border-b border-gray-200 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-brand-black">Grade {selectedClass.grade} <span className="text-fuchsia-400">{selectedClass.section}</span></h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-gray-700">Class Teacher: <span className="font-semibold text-brand-black">{selectedClass.teacher_name || 'Not Assigned'}</span></span>
                    <button 
                      onClick={() => setShowTeacherModal(true)}
                      className="ml-3 text-xs bg-gray-100 hover:bg-gray-700 text-gray-700 px-2 py-1 rounded-md transition-colors"
                    >
                      {selectedClass.class_teacher_id ? 'Change' : 'Assign'}
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowAddStudentsModal(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-brand-black text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-fuchsia-500/20 transition-all"
                >
                  <UserPlus className="w-4 h-4" /> Add Students
                </button>
              </div>
              
              {/* Students List */}
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">Enrolled Students ({classStudents.length})</h3>
                </div>
                
                {classStudents.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No students assigned to this section yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {classStudents.map(student => (
                      <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/50 border border-gray-200 hover:border-gray-200 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 font-semibold text-xs">
                            {student.full_name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-800">{student.full_name}</div>
                            <div className="text-[10px] text-gray-500">ADM: {student.admission_number}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveStudent(student.id)}
                          className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          title="Remove from class"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-4 rounded-2xl border border-gray-200 h-[600px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <ListOrdered className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Select a section from the left panel to manage its roster.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Students Modal */}
      {showAddStudentsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm w-full max-w-2xl h-[70vh] flex flex-col rounded-3xl shadow-2xl relative border border-gray-200 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-brand-black mb-1">Assign Students</h3>
                <p className="text-xs text-gray-600">Select unassigned students to add to {selectedClass?.grade}-{selectedClass?.section}.</p>
              </div>
              <button onClick={() => setShowAddStudentsModal(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-brand-black transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-2">
              {unassignedStudents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>All students have been assigned to a class.</p>
                </div>
              ) : (
                unassignedStudents.map(student => {
                  const isSelected = selectedStudentIds.has(student.id);
                  return (
                    <div 
                      key={student.id} 
                      onClick={() => {
                        const newSet = new Set(selectedStudentIds);
                        if (isSelected) newSet.delete(student.id);
                        else newSet.add(student.id);
                        setSelectedStudentIds(newSet);
                      }}
                      className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected ? 'bg-fuchsia-600/20 border-fuchsia-500/50' : 'bg-gray-50/40 border-gray-200 hover:bg-gray-100/60'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-fuchsia-500 border-fuchsia-400' : 'border-gray-600'}`}>
                        {isSelected && <Check className="w-3 h-3 text-brand-black" />}
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${isSelected ? 'text-fuchsia-200' : 'text-gray-700'}`}>{student.full_name}</div>
                        <div className="text-[10px] text-gray-500">ADM: {student.admission_number}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50/50 flex justify-between items-center rounded-b-3xl">
              <span className="text-sm text-gray-600">{selectedStudentIds.size} students selected</span>
              <button 
                onClick={handleBulkAssignStudents}
                disabled={selectedStudentIds.size === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-brand-black text-sm font-semibold shadow-lg shadow-fuchsia-500/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                Assign to Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm w-full max-w-md p-6 rounded-3xl shadow-2xl relative border border-gray-200 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowTeacherModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-brand-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-xl font-bold text-brand-black mb-1">Select Class Teacher</h3>
            <p className="text-xs text-gray-600 mb-6">Assign a faculty member as the primary teacher.</p>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider pl-1">Faculty Member</label>
                <select
                  value={selectedTeacherId}
                  onChange={e => setSelectedTeacherId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 border border-gray-200 text-brand-black outline-none focus:border-fuchsia-500 transition-colors"
                >
                  <option value="">-- Select Teacher --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.full_name}</option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={handleAssignTeacher}
                disabled={!selectedTeacherId}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-brand-black font-bold shadow-lg shadow-fuchsia-500/25 hover:opacity-90 transition-all disabled:opacity-50 mt-4"
              >
                Assign Teacher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
