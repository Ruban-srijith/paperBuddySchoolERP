"use client";

import { useState, useEffect } from 'react';
import { Users, Search, GraduationCap, X, ChevronRight, UserPlus, Filter, Check, Plus, Loader2, UserCheck } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import SearchableSelect from '@/components/SearchableSelect';
import { useToast } from '@/components/Toast';

interface DeptItem {
  id: string;
  name: string;
}

interface TeacherItem {
  id: string;
  name: string;
  dept_id: string;
}

interface ClassItem {
  id: string;
  grade: string;
  section: string;
  class_teacher_id: string | null;
  teacher_name: string | null;
  department_id: string | null;
}

export default function ClassAllotmentsPage() {
  return (
    <ProtectedRoute allowedRoles={["super_admin", "correspondent", "admin", "principal", "vice_principal"]}>
      <ClassAllotmentsContent />
    </ProtectedRoute>
  );
}

function ClassAllotmentsContent() {
  const user = useAuthStore(state => state.user);
  const canManage = ['super_admin', 'correspondent', 'admin', 'principal', 'vice_principal'].includes(user?.role as string);
  const { toast } = useToast();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [departments, setDepartments] = useState<DeptItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  // Modal state
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newGrade, setNewGrade] = useState('');
  const [newSection, setNewSection] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clsRes, deptRes, teachRes] = await Promise.all([
        api.get('/classes'),
        api.get('/departments'),
        api.get('/users?role=teacher')
      ]);
      setClasses(clsRes.data);
      setDepartments(deptRes.data.map((d: any) => ({ id: d.id, name: d.name })));
      setTeachers(teachRes.data.map((t: any) => ({ id: t.id, name: t.full_name, dept_id: t.department_id })));
    } catch (err) {
      toast.error('Failed to load data', 'Error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignClick = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    setSelectedClassId(classId);
    
    if (cls && cls.class_teacher_id) {
      const teacher = teachers.find(t => t.id === cls.class_teacher_id);
      if (teacher) {
        setSelectedDeptId(teacher.dept_id);
        setSelectedTeacherId(teacher.id);
      }
    } else {
      setSelectedDeptId('');
      setSelectedTeacherId('');
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (selectedClassId && selectedTeacherId) {
      try {
        await api.put(`/classes/${selectedClassId}/assign`, { teacher_id: selectedTeacherId });
        toast.success("Class Teacher assigned successfully", "Success");
        fetchData();
        setShowModal(false);
      } catch (err) {
        toast.error("Failed to assign teacher", "Error");
      }
    }
  };

  const handleAddClass = async () => {
    if (newGrade && newSection) {
      try {
        await api.post('/classes', { grade: newGrade, section: newSection });
        toast.success("New class created successfully", "Success");
        fetchData();
        setShowAddClassModal(false);
        setNewGrade('');
        setNewSection('');
      } catch (err: any) {
        toast.error(err.response?.data?.detail || "Failed to create class", "Error");
      }
    }
  };

  const filteredTeachers = teachers.filter(t => {
    if (t.dept_id !== selectedDeptId) return false;
    const isAssignedElsewhere = classes.some(c => c.class_teacher_id === t.id && c.id !== selectedClassId);
    return !isAssignedElsewhere;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const handleRemoveAllotment = async (classId: string) => {
    try {
      await api.delete(`/classes/${classId}/assign`);
      toast.success("Class teacher removed successfully");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to remove teacher");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-brand-black flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5 text-amber-400" />
            </div>
            Class Teachers Allotments
          </h1>
          <p className="text-sm text-gray-600">Assign faculty members as official Class Teachers for specific grades and sections.</p>
        </div>
        {canManage && (
          <button 
            onClick={() => setShowAddClassModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-brand-black text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-amber-500/20 transition-all whitespace-nowrap flex-shrink-0 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" /> Add New Class
          </button>
        )}
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {classes.map(cls => {
          const assignedDept = departments.find(d => d.id === cls.department_id);

          return (
            <div key={cls.id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-5 rounded-2xl border border-gray-200/60 flex flex-col justify-between hover:bg-slate-900/50 transition-colors">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-brand-blue" />
                    <h3 className="text-lg font-bold text-brand-black">Grade {cls.grade} <span className="text-brand-blue">{cls.section}</span></h3>
                  </div>
                  {cls.class_teacher_id && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> Assigned
                    </span>
                  )}
                </div>
                
                <div className="pt-2 border-t border-gray-200/60">
                  {cls.class_teacher_id ? (
                    <div>
                      <p className="text-sm font-semibold text-brand-black">{cls.teacher_name}</p>
                      <p className="text-[11px] text-gray-600">{assignedDept?.name || "Unknown"} Department</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500 py-1">
                      <Search className="w-4 h-4" />
                      <span className="text-sm italic">No teacher assigned</span>
                    </div>
                  )}
                </div>
              </div>
              
              {canManage && (
                <div className="mt-6 flex flex-col sm:flex-row gap-2">
                  <button 
                    onClick={() => handleAssignClick(cls.id)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
                      cls.class_teacher_id 
                      ? 'bg-gray-100/60 hover:bg-gray-700/80 text-gray-700' 
                      : 'bg-brand-blue/20 hover:bg-brand-blue/40 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {cls.class_teacher_id ? 'Change' : 'Assign Class Teacher'}
                  </button>
                  {cls.class_teacher_id && (
                    <button
                      onClick={() => handleRemoveAllotment(cls.id)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm w-full max-w-md p-6 rounded-3xl shadow-2xl relative border border-gray-200 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-brand-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-xl font-bold text-brand-black mb-1">Assign Class Teacher</h3>
            <p className="text-xs text-gray-600 mb-6">Select a department, then choose a faculty member.</p>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Step 1: Select Department</label>
                <select 
                  value={selectedDeptId}
                  onChange={(e) => {
                    setSelectedDeptId(e.target.value);
                    setSelectedTeacherId(''); 
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-sm text-brand-black focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Step 2: Select Teacher</label>
                <SearchableSelect
                  options={filteredTeachers.map(t => ({ value: t.id, label: t.name }))}
                  value={selectedTeacherId}
                  onChange={setSelectedTeacherId}
                  placeholder="-- Search & Choose Faculty --"
                  disabled={!selectedDeptId}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-700 text-sm font-semibold hover:text-brand-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!selectedTeacherId}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-brand-black text-sm font-semibold hover:opacity-90 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Save Allotment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm w-full max-w-md p-6 rounded-3xl shadow-2xl relative border border-gray-200 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAddClassModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-brand-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h3 className="text-xl font-bold text-brand-black mb-1">Add New Class</h3>
            <p className="text-xs text-gray-600 mb-6">Create a new class for the academic year.</p>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Grade / Standard</label>
                <input 
                  type="text"
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  placeholder="e.g., 10, 11, LKG"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-sm text-brand-black focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Section</label>
                <input 
                  type="text"
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  placeholder="e.g., A, B, C"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-sm text-brand-black focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowAddClassModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-700 text-sm font-semibold hover:text-brand-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClass}
                  disabled={!newGrade || !newSection}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-brand-black text-sm font-semibold hover:opacity-90 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Create Class
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
