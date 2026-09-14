"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    <ProtectedRoute allowedRoles={["super_admin", "platform_super_admin", "correspondent", "principal", "vice_principal"]}>
      <ClassRosterContent />
    </ProtectedRoute>
  );
}

function ClassRosterContent() {
  const { toast } = useToast();
  
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [allStudents, setAllStudents] = useState<StudentItem[]>([]);
  const [classStudents, setClassStudents] = useState<StudentItem[]>([]);
  
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [assignMode, setAssignMode] = useState<'unassigned' | 'all'>('all');
  const [studentSearch, setStudentSearch] = useState('');
  
  // Selections
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  
  const GRADE_ORDER = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const fetchData = async () => {
    try {
      const [classesRes, teachersRes, studentsRes] = await Promise.all([
        api.get('/classes'),
        api.get('/users?role=teacher'),
        api.get('/students')
      ]);
      
      const sortedClasses = (classesRes.data || []).sort((a: ClassItem, b: ClassItem) => {
        const idxA = GRADE_ORDER.indexOf(a.grade);
        const idxB = GRADE_ORDER.indexOf(b.grade);
        if (idxA !== idxB) {
          if (idxA === -1) return 1;
          if (idxB === -1) return -1;
          return idxA - idxB;
        }
        return a.section.localeCompare(b.section);
      });
      
      setClasses(sortedClasses);
      setTeachers(teachersRes.data || []);
      
      const studs: StudentItem[] = studentsRes.data || [];
      setAllStudents(studs);
      
      if (selectedClassId) {
        setClassStudents(studs.filter(s => s.class_id === selectedClassId));
      } else if (sortedClasses.length > 0) {
        setSelectedClassId(sortedClasses[0].id);
        setClassStudents(studs.filter(s => s.class_id === sortedClasses[0].id));
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
    if (selectedClassId && allStudents.length > 0) {
      setClassStudents(allStudents.filter(s => s.class_id === selectedClassId));
    }
  }, [selectedClassId, allStudents]);

  const selectedClass = classes.find(c => c.id === selectedClassId);

  const availableGrades = ['ALL', ...Array.from(new Set(classes.map(c => c.grade))).sort((a, b) => {
    const idxA = GRADE_ORDER.indexOf(a);
    const idxB = GRADE_ORDER.indexOf(b);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  })];

  const filteredClasses = gradeFilter === 'ALL' 
    ? classes 
    : classes.filter(c => c.grade.trim().toUpperCase() === gradeFilter.trim().toUpperCase());

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
      toast.success(`Successfully assigned ${selectedStudentIds.size} student(s)`);
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

  // Filter candidates for assignment
  const candidateStudents = allStudents.filter(s => {
    // Mode filter
    if (assignMode === 'unassigned') {
      if (s.class_id) return false;
    } else {
      // Don't show students already in this exact class
      if (s.class_id === selectedClassId) return false;
    }
    // Search query
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase().trim();
      const matchName = s.full_name?.toLowerCase().includes(q);
      const matchAdm = s.admission_number?.toLowerCase().includes(q);
      if (!matchName && !matchAdm) return false;
    }
    return true;
  });

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
          <p className="text-sm text-gray-600">Manage class teachers and assign or reassign students to specific sections.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel: Class Selection with Grade Filter */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 lg:col-span-1 h-[620px] flex flex-col">
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">Filter Grade</h3>
              <span className="text-xs text-gray-400 font-medium">{filteredClasses.length} Sections</span>
            </div>
            <select
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 focus:outline-none focus:border-fuchsia-500"
            >
              {availableGrades.map(g => (
                <option key={g} value={g}>{g === 'ALL' ? 'All Grades' : `Grade ${g}`}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredClasses.map(cls => (
              <button
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedClassId === cls.id
                    ? 'bg-fuchsia-100 border-fuchsia-400 text-fuchsia-900 shadow-sm'
                    : 'bg-gray-50/50 border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Grade {cls.grade} - {cls.section}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600 font-bold">
                    {allStudents.filter(s => s.class_id === cls.id).length} stds
                  </span>
                </div>
                <div className="text-[11px] mt-1 opacity-70 truncate">
                  {cls.class_teacher_id ? cls.teacher_name : 'No Teacher Assigned'}
                </div>
              </button>
            ))}
            {filteredClasses.length === 0 && (
              <div className="text-center py-8 text-xs text-gray-400">
                No sections found for Grade {gradeFilter}.
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Class Roster */}
        <div className="lg:col-span-3">
          {selectedClassId && selectedClass ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-[620px] flex flex-col overflow-hidden">
              {/* Roster Header */}
              <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-brand-black">Grade {selectedClass.grade} <span className="text-fuchsia-600">{selectedClass.section}</span></h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-gray-700">Class Teacher: <span className="font-semibold text-brand-black">{selectedClass.teacher_name || 'Not Assigned'}</span></span>
                    <button 
                      onClick={() => setShowTeacherModal(true)}
                      className="ml-2 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-2.5 py-1 rounded-md transition-colors"
                    >
                      {selectedClass.class_teacher_id ? 'Change' : 'Assign'}
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedStudentIds(new Set());
                    setStudentSearch('');
                    setShowAddStudentsModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-fuchsia-500/20 transition-all"
                >
                  <UserPlus className="w-4 h-4" /> Add / Reassign Students
                </button>
              </div>
              
              {/* Students List */}
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Enrolled Students ({classStudents.length})
                  </h3>
                </div>
                
                {classStudents.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium text-sm">No students assigned to this section yet.</p>
                    <p className="text-xs mt-1">Click "Add / Reassign Students" above to enroll students.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {classStudents.map(student => (
                      <div key={student.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 border border-gray-200 hover:border-fuchsia-200 hover:bg-fuchsia-50/20 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-600 font-bold text-xs">
                            {student.full_name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{student.full_name}</div>
                            <div className="text-[11px] text-gray-500">ADM: {student.admission_number}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveStudent(student.id)}
                          className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 h-[620px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <ListOrdered className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Select a section from the left panel to manage its roster.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Reassign Students Modal */}
      {showAddStudentsModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl h-[75vh] flex flex-col rounded-3xl shadow-2xl relative border border-gray-200 animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-brand-black">Assign Students to Grade {selectedClass?.grade}-{selectedClass?.section}</h3>
                <p className="text-xs text-gray-500">Select students to enroll. Reassigning moves them automatically from their previous section.</p>
              </div>
              <button onClick={() => setShowAddStudentsModal(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-brand-black transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs & Search */}
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex bg-gray-200/70 p-1 rounded-xl w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setAssignMode('unassigned')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    assignMode === 'unassigned' ? 'bg-white text-brand-black shadow-sm' : 'text-gray-600 hover:text-brand-black'
                  }`}
                >
                  Unassigned ({allStudents.filter(s => !s.class_id).length})
                </button>
                <button
                  type="button"
                  onClick={() => setAssignMode('all')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    assignMode === 'all' ? 'bg-white text-brand-black shadow-sm' : 'text-gray-600 hover:text-brand-black'
                  }`}
                >
                  All Students (Reassign)
                </button>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name or ADM..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl outline-none focus:border-fuchsia-500"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-2">
              {candidateStudents.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-semibold">No students match your criteria.</p>
                  <p className="text-xs text-gray-400 mt-1">Try toggling to "All Students (Reassign)" or clearing the search query.</p>
                </div>
              ) : (
                candidateStudents.map(student => {
                  const isSelected = selectedStudentIds.has(student.id);
                  const currClass = classes.find(c => c.id === student.class_id);

                  return (
                    <div 
                      key={student.id} 
                      onClick={() => {
                        const newSet = new Set(selectedStudentIds);
                        if (isSelected) newSet.delete(student.id);
                        else newSet.add(student.id);
                        setSelectedStudentIds(newSet);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected ? 'bg-fuchsia-50 border-fuchsia-400 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${isSelected ? 'bg-fuchsia-600 border-fuchsia-600' : 'border-gray-300 bg-white'}`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </div>
                        <div>
                          <div className={`text-sm font-semibold ${isSelected ? 'text-fuchsia-900' : 'text-gray-900'}`}>{student.full_name}</div>
                          <div className="text-[11px] text-gray-500">ADM: {student.admission_number}</div>
                        </div>
                      </div>

                      {currClass ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          Moves from {currClass.grade}-{currClass.section}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Unassigned
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center rounded-b-3xl">
              <span className="text-xs font-semibold text-gray-600">{selectedStudentIds.size} student(s) selected</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentsModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBulkAssignStudents}
                  disabled={selectedStudentIds.size === 0}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white text-xs font-bold shadow-md shadow-fuchsia-500/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  Assign to {selectedClass?.grade}-{selectedClass?.section}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Assign Teacher Modal */}
      {showTeacherModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
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
                className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold shadow-lg shadow-fuchsia-500/25 hover:opacity-90 transition-all disabled:opacity-50 mt-4"
              >
                Assign Teacher
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
