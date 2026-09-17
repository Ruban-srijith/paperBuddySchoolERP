"use client";

import { useState, useEffect } from 'react';
import { Users, Search, GraduationCap, X, ChevronRight, UserPlus, Filter, Check, Plus, Loader2, UserCheck, Trash2, AlertTriangle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';
import SearchableSelect from '@/components/SearchableSelect';
import { useToast } from '@/components/Toast';

interface TeacherItem {
  id: string;
  name: string;
  email?: string;
  assigned_grade?: string | null;
}

interface ClassItem {
  id: string;
  grade: string;
  section: string;
  class_teacher_id: string | null;
  teacher_name: string | null;
  department_id: string | null;
}

const ALL_GRADES = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function ClassAllotmentsPage() {
  return (
    <ProtectedRoute allowedRoles={["super_admin", "correspondent", "principal", "vice_principal"]}>
      <ClassAllotmentsContent />
    </ProtectedRoute>
  );
}

function ClassAllotmentsContent() {
  const user = useAuthStore(state => state.user);
  const canManage = ['super_admin', 'correspondent', 'principal', 'vice_principal'].includes(user?.role as string);
  const { toast } = useToast();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newGrade, setNewGrade] = useState('10');
  const [newSection, setNewSection] = useState('C');
  const [customGrade, setCustomGrade] = useState('');
  const [customSection, setCustomSection] = useState('');
  const [isCustomGrade, setIsCustomGrade] = useState(false);
  const [isCustomSection, setIsCustomSection] = useState(false);
  const [creatingClass, setCreatingClass] = useState(false);
  const [savingAssign, setSavingAssign] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clsRes, teachRes] = await Promise.all([
        api.get('/classes'),
        api.get('/users?role=teacher')
      ]);
      setClasses(clsRes.data || []);
      setTeachers((teachRes.data || []).map((t: any) => ({
        id: t.id,
        name: t.full_name,
        email: t.email,
        assigned_grade: t.assigned_grade
      })));
    } catch (err) {
      toast.error('Failed to load classes and faculty data', 'Error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddClassModal = () => {
    // Pick first available grade/section combo
    let foundGrade = '10';
    let foundSection = 'C';
    for (const g of ALL_GRADES) {
      for (const s of SECTIONS) {
        const exists = classes.some(c => c.grade.toUpperCase() === g.toUpperCase() && c.section.toUpperCase() === s.toUpperCase());
        if (!exists) {
          foundGrade = g;
          foundSection = s;
          break;
        }
      }
      if (foundSection !== 'A') break;
    }
    setNewGrade(foundGrade);
    setNewSection(foundSection);
    setIsCustomGrade(false);
    setIsCustomSection(false);
    setCustomGrade('');
    setCustomSection('');
    setShowAddClassModal(true);
  };

  const handleAssignClick = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    setSelectedClassId(classId);
    setSelectedTeacherId(cls?.class_teacher_id || '');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (selectedClassId && selectedTeacherId) {
      setSavingAssign(true);
      try {
        await api.put(`/classes/${selectedClassId}/assign`, { teacher_id: selectedTeacherId });
        toast.success("Class Teacher assigned successfully", "Success");
        await fetchData();
        setShowModal(false);
      } catch (err: any) {
        toast.error(err.response?.data?.detail || "Failed to assign teacher", "Error");
      } finally {
        setSavingAssign(false);
      }
    }
  };

  const effectiveGrade = isCustomGrade ? customGrade.trim().toUpperCase() : newGrade.trim().toUpperCase();
  const effectiveSection = isCustomSection ? customSection.trim().toUpperCase() : newSection.trim().toUpperCase();

  const isClassAlreadyExists = classes.some(
    c => c.grade.trim().toUpperCase() === effectiveGrade && c.section.trim().toUpperCase() === effectiveSection
  );

  const handleAddClass = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!effectiveGrade || !effectiveSection) {
      toast.error("Please provide both Grade and Section", "Error");
      return;
    }

    if (isClassAlreadyExists) {
      toast.error(`Class Grade ${effectiveGrade} - Section ${effectiveSection} already exists`, "Duplicate Class");
      return;
    }

    setCreatingClass(true);
    try {
      await api.post('/classes', { grade: effectiveGrade, section: effectiveSection });
      toast.success(`Class Grade ${effectiveGrade} - Section ${effectiveSection} created successfully`, "Success");
      await fetchData();
      setShowAddClassModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create class", "Error");
    } finally {
      setCreatingClass(false);
    }
  };

  const handleRemoveAllotment = async (classId: string) => {
    try {
      await api.delete(`/classes/${classId}/assign`);
      toast.success("Class teacher removed successfully");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to remove teacher");
    }
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);

  const teacherOptions = teachers.map(t => {
    const assignedClass = classes.find(c => c.class_teacher_id === t.id);
    let label = t.name;
    if (assignedClass && assignedClass.id !== selectedClassId) {
      label = `${t.name} (Assigned to Grade ${assignedClass.grade}-${assignedClass.section})`;
    } else if (assignedClass && assignedClass.id === selectedClassId) {
      label = `${t.name} (Current Class Teacher)`;
    }
    return { value: t.id, label };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-brand-black flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5 text-amber-500" />
            </div>
            Class Teachers Allotments
          </h1>
          <p className="text-sm text-gray-600">Assign faculty members as official Class Teachers for specific grades and sections.</p>
        </div>
        {canManage && (
          <button 
            onClick={openAddClassModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-amber-500/20 transition-all whitespace-nowrap flex-shrink-0 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" /> Add New Class
          </button>
        )}
      </div>

      {/* Grid of Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {classes.map(cls => (
          <div key={cls.id} className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-brand-blue" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-black">Grade {cls.grade} <span className="text-brand-blue font-bold">Sec {cls.section}</span></h3>
                </div>
                {cls.class_teacher_id && (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Assigned
                  </span>
                )}
              </div>
              
              <div className="pt-3 border-t border-gray-100">
                {cls.class_teacher_id ? (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Class Teacher</p>
                    <p className="text-sm font-bold text-brand-black">{cls.teacher_name}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 py-1">
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
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                    cls.class_teacher_id 
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                    : 'bg-brand-blue text-white hover:bg-brand-blue/90 shadow-sm'
                  }`}
                >
                  {cls.class_teacher_id ? 'Change' : 'Assign Teacher'}
                </button>
                {cls.class_teacher_id && (
                  <button
                    onClick={() => handleRemoveAllotment(cls.id)}
                    className="py-2 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                    title="Remove assignment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {classes.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-500">
            No classes found. Click "Add New Class" to create one.
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative border border-gray-100 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-brand-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-brand-black mb-1">Assign Class Teacher</h3>
            <p className="text-xs text-gray-600 mb-6">
              Assign faculty member to <span className="font-bold text-brand-black">Grade {selectedClass?.grade} - Section {selectedClass?.section}</span>
            </p>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Select Faculty Member</label>
                <SearchableSelect
                  options={teacherOptions}
                  value={selectedTeacherId}
                  onChange={setSelectedTeacherId}
                  placeholder="-- Search & Choose Faculty --"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!selectedTeacherId || savingAssign}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-white text-sm font-bold hover:opacity-90 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {savingAssign ? 'Saving...' : 'Save Allotment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative border border-gray-100 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAddClassModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-brand-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold text-brand-black mb-1">Add New Class</h3>
            <p className="text-xs text-gray-600 mb-4">Create a new class for the academic year.</p>

            {isClassAlreadyExists && (
              <div className="mb-4 p-2.5 bg-amber-50 text-amber-700 text-xs rounded-lg border border-amber-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Grade {effectiveGrade} - Section {effectiveSection} already exists.</span>
              </div>
            )}
            
            <form onSubmit={handleAddClass} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Grade / Standard</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomGrade(!isCustomGrade)}
                    className="text-[11px] text-brand-blue font-semibold hover:underline"
                  >
                    {isCustomGrade ? 'Select from list' : '+ Custom Grade'}
                  </button>
                </div>
                {isCustomGrade ? (
                  <input 
                    type="text"
                    value={customGrade}
                    onChange={(e) => setCustomGrade(e.target.value.toUpperCase())}
                    placeholder="e.g. Pre-KG, Nursery, 13"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-brand-black font-semibold uppercase focus:outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                ) : (
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-brand-black font-semibold focus:outline-none focus:border-amber-500 transition-colors"
                    required
                  >
                    {ALL_GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Section</label>
                  <button
                    type="button"
                    onClick={() => setIsCustomSection(!isCustomSection)}
                    className="text-[11px] text-brand-blue font-semibold hover:underline"
                  >
                    {isCustomSection ? 'Select from list' : '+ Custom Section'}
                  </button>
                </div>
                {isCustomSection ? (
                  <input 
                    type="text"
                    value={customSection}
                    onChange={(e) => setCustomSection(e.target.value.toUpperCase())}
                    placeholder="e.g. C, D, Lotus, Rose"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-brand-black font-semibold uppercase focus:outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                ) : (
                  <select
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-brand-black font-semibold focus:outline-none focus:border-amber-500 transition-colors"
                    required
                  >
                    {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!effectiveGrade || !effectiveSection || isClassAlreadyExists || creatingClass}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-white text-sm font-bold hover:opacity-90 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {creatingClass ? 'Creating...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

