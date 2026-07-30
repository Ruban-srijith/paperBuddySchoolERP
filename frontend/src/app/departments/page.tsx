"use client";

import { useEffect, useState } from 'react';
import { Building2, Users, BookOpen, Crown, Plus, X, Check } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ROLE_COLORS, UserRole } from '@/store/authStore';
import api from '@/lib/api';

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
  { bg: 'from-indigo-500/20 to-purple-500/20', border: 'border-indigo-500/30', icon: 'text-indigo-400', glow: 'shadow-indigo-500/10' },
  { bg: 'from-cyan-500/20 to-teal-500/20', border: 'border-cyan-500/30', icon: 'text-cyan-400', glow: 'shadow-cyan-500/10' },
  { bg: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', icon: 'text-amber-400', glow: 'shadow-amber-500/10' },
];

function DepartmentsContent() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [deptTeachers, setDeptTeachers] = useState<TeacherItem[]>([]);
  const [deptSubjects, setDeptSubjects] = useState<SubjectItem[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDepartments();
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
        api.get(`/departments/${deptId}/subjects`),
      ]);
      setDeptTeachers(teachersRes.data);
      setDeptSubjects(subjectsRes.data);
    } catch {}
    setDetailLoading(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-teal-400" />
          </div>
          Departments
        </h1>
        <p className="text-sm text-gray-400">Academic department overview with faculty and subjects</p>
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
                <button
                  onClick={() => handleExpand(dept.id)}
                  className={`w-full text-left glass-panel p-6 rounded-2xl space-y-4 hover:bg-slate-900/80 transition-all ${colors.border} ${isExpanded ? 'rounded-b-none' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex items-center justify-center ${colors.icon}`}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800/80 text-gray-300 font-mono">{dept.code}</span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{dept.name}</h3>
                    {dept.dean_name && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs text-amber-300">{dept.dean_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 pt-2 border-t border-gray-800/40">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-300">{dept.teacher_count} Members</span>
                    </div>
                  </div>
                </button>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <div className={`glass-panel p-5 rounded-b-2xl border-t-0 ${colors.border} space-y-4`}>
                    {detailLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <>
                        {/* Subjects */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <BookOpen className="w-3 h-3" /> Subjects
                          </h4>
                          {deptSubjects.length === 0 ? (
                            <p className="text-xs text-gray-500">No subjects assigned</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {deptSubjects.map(s => (
                                <span key={s.id} className="text-xs px-2.5 py-1 rounded-lg bg-gray-800/60 text-gray-300 border border-gray-700/40">
                                  {s.name} <span className="text-gray-500">({s.code})</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Teachers */}
                        <div>
                          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Users className="w-3 h-3" /> Faculty Members
                          </h4>
                          {deptTeachers.length === 0 ? (
                            <p className="text-xs text-gray-500">No faculty assigned</p>
                          ) : (
                            <div className="space-y-2">
                              {deptTeachers.map(t => (
                                <div key={t.id} className="flex items-center gap-2.5 py-1.5">
                                  <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${ROLE_COLORS[t.role as UserRole] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white font-semibold text-[9px]`}>
                                    {t.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </div>
                                  <div>
                                    <span className="text-xs text-white font-medium">{t.full_name}</span>
                                    {t.assigned_grade && (
                                      <span className="text-[10px] text-cyan-400 ml-2">Grade {t.assigned_grade}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DepartmentsPage() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'admin', 'principal', 'dean', 'dept_head']}>
      <DepartmentsContent />
    </ProtectedRoute>
  );
}
