"use client";

import { useEffect, useState } from 'react';
import { Building2, Users, BookOpen, Crown, Plus, X, Check } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ROLE_COLORS, UserRole } from '@/store/authStore';
import api from '@/lib/api';
import SearchableSelect from '@/components/SearchableSelect';

interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  dean_id: string | null;
  dean_name: string | null;
  teacher_count: number;
  created_at: string;
}

interface TeacherItem {
  id: string;
  full_name: string;
  email: string;
  role: string;
  assigned_grade: string | null;
}

interface SubjectItem {
  id: string;
  code: string;
  name: string;
}

const DEPT_COLORS = [
  { bg: 'from-indigo-500/20 to-purple-500/20', border: 'border-indigo-500/30', icon: 'text-brand-blue', glow: 'shadow-indigo-500/10' },
  { bg: 'from-cyan-500/20 to-teal-500/20', border: 'border-cyan-500/30', icon: 'text-cyan-600', glow: 'shadow-cyan-500/10' },
  { bg: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', icon: 'text-amber-400', glow: 'shadow-amber-500/10' },
];

function DepartmentsContent() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [deptTeachers, setDeptTeachers] = useState<TeacherItem[]>([]);
  const [deptSubjects, setDeptSubjects] = useState<SubjectItem[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      setDepartments([]);
    }
    setLoading(false);
  };

  const fetchAllTeachers = async () => {
    try {
      const res = await api.get('/users?role=teacher');
      setAllTeachers(res.data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchDepartments();
    fetchAllTeachers();
  }, []);

  const handleExpand = async (deptId: string) => {
    if (expandedDept === deptId) {
      setExpandedDept(null);
      return;
    }

    setExpandedDept(deptId);
    setDetailLoading(true);
    try {
      const [teachersRes, subjectsRes] = await Promise.all([
        api.get(`/departments/${deptId}/teachers`),
        api.get(`/departments/${deptId}/subjects`)
      ]);
      setDeptTeachers(teachersRes.data);
      setDeptSubjects(subjectsRes.data);
    } catch {
      setDeptTeachers([]);
      setDeptSubjects([]);
    }
    setDetailLoading(false);
  };

  const handleRemoveDepartment = async (deptId: string) => {
    try {
      await api.delete(`/departments/${deptId}`);
      if (expandedDept === deptId) setExpandedDept(null);
      fetchDepartments();
    } catch (err) {
      console.error("Failed to delete department");
    }
  };

  const handleRemoveTeacher = async (teacherId: string) => {
    if (!expandedDept) return;
    try {
      await api.delete(`/departments/${expandedDept}/teachers/${teacherId}`);
      const res = await api.get(`/departments/${expandedDept}/teachers`);
      setDeptTeachers(res.data);
    } catch (err) {
      console.error("Failed to remove teacher");
    }
  };

  const handleSetDean = async (deptId: string, teacherId: string | null) => {
    try {
      await api.put(`/departments/${deptId}`, { dean_id: teacherId });
      fetchDepartments();
    } catch (err) {
      console.error("Failed to set head of department");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-brand-black flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-teal-400" />
            </div>
            Departments
          </h1>
          <p className="text-sm text-gray-600">Academic department overview with faculty and subjects</p>
        </div>
        <button 
          onClick={() => setShowAddDeptModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-brand-black text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-teal-500/20 transition-all whitespace-nowrap flex-shrink-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {/* Department Cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, idx) => {
            const colors = DEPT_COLORS[idx % DEPT_COLORS.length];
            const isExpanded = expandedDept === dept.id;

            return (
              <div key={dept.id} className="space-y-0">
                <div
                  onClick={() => handleExpand(dept.id)}
                  className={`w-full text-left bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 space-y-4 hover:bg-gray-50 hover:shadow-md transition-all cursor-pointer ${colors.border}`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center ${colors.icon}`}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100/80 text-gray-700 font-mono">{dept.code}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveDepartment(dept.id);
                        }}
                        className="p-1 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-brand-black">{dept.name}</h3>
                    {dept.dean_name && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs text-amber-600 font-medium">{dept.dean_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t border-gray-200/40">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-600" />
                      <span className="text-xs text-gray-700">{dept.teacher_count} Members</span>
                    </div>
                  </div>
                </div>

                {/* Expanded Detail Panel Modal */}
                {isExpanded && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className={`bg-white rounded-[24px] border border-gray-100 shadow-sm w-full max-w-md p-6 rounded-2xl shadow-2xl relative border ${colors.border} animate-in zoom-in-95 duration-200 space-y-4 max-h-[85vh] overflow-y-auto`}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDept(null);
                        }}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-brand-black transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center ${colors.icon}`}>
                          <Building2 className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-brand-black">{dept.name}</h3>
                      </div>

                      {detailLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Subjects */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <BookOpen className="w-3 h-3" /> Subjects
                            </h4>
                            {deptSubjects.length === 0 ? (
                              <p className="text-xs text-gray-500">No subjects assigned</p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {deptSubjects.map(s => (
                                  <span key={s.id} className="text-xs px-2.5 py-1 rounded-lg bg-gray-100/60 text-gray-700 border border-gray-200/40">
                                    {s.name} <span className="text-gray-500">({s.code})</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Teachers */}
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                                <Users className="w-3 h-3" /> Faculty Members
                              </h4>
                              <button 
                                onClick={() => setShowAddTeacherModal(true)}
                                className="text-[10px] bg-teal-500/20 text-teal-400 px-2 py-1 rounded-md hover:bg-teal-500/30 flex items-center gap-1 transition-colors"
                              >
                                <Plus className="w-3 h-3" /> Add Teacher
                              </button>
                            </div>
                            {deptTeachers.length === 0 ? (
                              <p className="text-xs text-gray-500">No faculty assigned</p>
                            ) : (
                              <div className="space-y-2">
                                {deptTeachers.map(t => (
                                  <div key={t.id} className="flex items-center justify-between gap-2.5 py-1.5 group">
                                    <div className="flex items-center gap-2.5">
                                      <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${ROLE_COLORS[t.role as UserRole] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-brand-black font-semibold text-[9px]`}>
                                        {t.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-brand-black font-medium">{t.full_name}</span>
                                        {dept.dean_id === t.id && (
                                          <div className="p-0.5 rounded text-amber-400" title="Head of Department">
                                            <Crown className="w-3 h-3" />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {dept.dean_id === t.id ? (
                                        <button
                                          onClick={() => handleSetDean(dept.id, null)}
                                          title="Remove Head of Department"
                                          className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                        >
                                          <Crown className="w-3 h-3" />
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleSetDean(dept.id, t.id)}
                                          title="Make Head of Department"
                                          className="p-1 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all"
                                        >
                                          <Crown className="w-3 h-3" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleRemoveTeacher(t.id)}
                                        title="Remove Faculty"
                                        className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm w-full max-w-md p-6 rounded-2xl shadow-2xl relative border border-gray-200 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-brand-black mb-4">Add New Department</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Department Name (e.g. 'Arts')"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                autoFocus
                className="w-full px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-brand-black focus:outline-none focus:border-teal-500 transition-colors"
              />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowAddDeptModal(false); setNewItemName(''); }}
                  className="flex-1 py-2 rounded-xl bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-700 font-medium hover:text-brand-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (newItemName) {
                      try {
                        await api.post('/departments', {
                          name: newItemName,
                          code: newItemName.substring(0,3).toUpperCase()
                        });
                        fetchDepartments();
                      } catch (err) {
                        console.error("Failed to create department");
                      }
                      setShowAddDeptModal(false);
                      setNewItemName('');
                    }
                  }}
                  className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-brand-black font-medium transition-colors"
                >
                  Add Department
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm w-full max-w-md p-6 rounded-2xl shadow-2xl relative border border-gray-200 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-brand-black mb-1">Assign Faculty</h3>
            <p className="text-xs text-gray-600 mb-4">Select an existing teacher to assign to this department.</p>
            <div className="space-y-4">
              <SearchableSelect
                options={allTeachers.map(t => ({ value: t.id, label: t.full_name }))}
                value={selectedTeacherId}
                onChange={setSelectedTeacherId}
                placeholder="-- Search & Choose Faculty --"
              />
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowAddTeacherModal(false); setSelectedTeacherId(''); }}
                  className="flex-1 py-2 rounded-xl bg-white rounded-[24px] border border-gray-100 shadow-sm text-gray-700 font-medium hover:text-brand-black transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (selectedTeacherId && expandedDept) {
                      try {
                        await api.put(`/users/${selectedTeacherId}`, {
                          department_id: expandedDept
                        });
                        const res = await api.get(`/departments/${expandedDept}/teachers`);
                        setDeptTeachers(res.data);
                      } catch (err) {
                        console.error("Failed to assign teacher");
                      }
                      setShowAddTeacherModal(false);
                      setSelectedTeacherId('');
                    }
                  }}
                  disabled={!selectedTeacherId}
                  className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-brand-black font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign Teacher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DepartmentsPage() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'admin', 'principal', 'vice_principal', 'dean', 'dept_head']}>
      <DepartmentsContent />
    </ProtectedRoute>
  );
}
