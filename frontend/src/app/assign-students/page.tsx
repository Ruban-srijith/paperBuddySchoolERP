"use client";

import { useEffect, useState } from 'react';
import { UserPlus, Search, Building2, CheckSquare, Loader2, ArrowRight } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
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
}

function AssignStudentsContent() {
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        api.get('/students'),
        api.get('/classes')
      ]);
      const unassigned = (studentsRes.data as StudentItem[]).filter(s => !s.class_id);
      setStudents(unassigned);
      setClasses(classesRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStudents = students.filter(s => 
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.admission_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleStudent = (id: string) => {
    const newSelected = new Set(selectedStudentIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStudentIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedStudentIds.size === filteredStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleAssign = async () => {
    if (!selectedClassId || selectedStudentIds.size === 0) return;
    
    setAssigning(true);
    try {
      await api.put('/students/assign-class', {
        student_ids: Array.from(selectedStudentIds),
        class_id: selectedClassId
      });
      toast.success(`Successfully assigned ${selectedStudentIds.size} students`);
      setSelectedStudentIds(new Set());
      setSelectedClassId('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to assign students');
    }
    setAssigning(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-brand-black flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-5 h-5 text-blue-500" />
            </div>
            Assign Students
          </h1>
          <p className="text-sm text-gray-600">Assign unassigned students to their respective grades and sections</p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Student Selection */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-brand-black">Unassigned Students</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold border border-blue-100">
                  {students.length} Total
                </span>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-500 w-full sm:w-64 transition-colors bg-white"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {filteredStudents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
                  <UserPlus className="w-12 h-12 text-gray-200" />
                  <p className="font-medium text-sm">No unassigned students found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 mb-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={toggleAll}>
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedStudentIds.size === filteredStudents.length && filteredStudents.length > 0 ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'}`}>
                      {selectedStudentIds.size === filteredStudents.length && filteredStudents.length > 0 && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-sm font-bold text-gray-700">Select All ({filteredStudents.length})</span>
                  </div>

                  {filteredStudents.map(student => (
                    <div 
                      key={student.id} 
                      onClick={() => toggleStudent(student.id)}
                      className={`flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedStudentIds.has(student.id) 
                          ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-500/20' 
                          : 'bg-white border-gray-100 hover:border-blue-200'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedStudentIds.has(student.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                        {selectedStudentIds.has(student.id) && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {student.full_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-brand-black text-sm truncate">{student.full_name}</div>
                        <div className="text-xs text-gray-500 font-mono truncate">{student.admission_number}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Assignment Action */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col h-fit sticky top-24">
            <h2 className="font-bold text-lg text-brand-black mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" />
              Assign to Class
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Target Class</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 font-medium"
                >
                  <option value="">-- Select Grade & Section --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      Grade {c.grade} - Section {c.section}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="text-sm text-blue-800 font-medium flex items-center justify-between">
                  <span>Selected Students:</span>
                  <span className="font-bold text-lg">{selectedStudentIds.size}</span>
                </div>
              </div>

              <button
                onClick={handleAssign}
                disabled={assigning || selectedStudentIds.size === 0 || !selectedClassId}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-blue text-white font-bold hover:bg-brand-blue/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {assigning ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Confirm Assignment
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssignStudentsPage() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'admin', 'principal', 'vice_principal']}>
      <AssignStudentsContent />
    </ProtectedRoute>
  );
}
