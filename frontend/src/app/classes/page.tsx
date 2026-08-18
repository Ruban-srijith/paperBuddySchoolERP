"use client";

import { useEffect, useState } from 'react';
import { Building2, Plus, X } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';

interface ClassItem {
  id: string;
  grade: string;
  section: string;
  teacher_name?: string | null;
}

const ALL_GRADES = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const SECTIONS = ["A", "B", "C", "D", "E", "F"];

function ClassesPageContent() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [newClass, setNewClass] = useState({
    grade: '10',
    section: 'A'
  });

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/classes');
      setClasses(res.data);
    } catch (err) {
      setClasses([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      await api.post('/classes', newClass);
      setShowCreateModal(false);
      setNewClass({ grade: '10', section: 'A' });
      fetchClasses();
    } catch (err: any) {
      setCreateError(err.response?.data?.detail || 'Failed to create class');
    }
    setCreating(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-brand-black flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-pink-400" />
            </div>
            Manage Classes
          </h1>
          <p className="text-sm text-gray-600">Create and manage grades and sections — {classes.length} total classes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all whitespace-nowrap flex-shrink-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Create Class
        </button>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue font-bold text-lg">
                  {cls.grade}
                </div>
                <div className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-200 text-sm font-bold text-gray-600">
                  Sec {cls.section}
                </div>
              </div>
              <h3 className="font-bold text-brand-black mb-1">Grade {cls.grade} - {cls.section}</h3>
              <p className="text-xs text-gray-500">
                {cls.teacher_name ? `Teacher: ${cls.teacher_name}` : 'No Class Teacher Assigned'}
              </p>
            </div>
          ))}
          {classes.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500">
              No classes created yet. Click "Create Class" to get started.
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-lg text-brand-black">Create New Class</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-brand-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {createError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {createError}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Grade Level</label>
                <select
                  value={newClass.grade}
                  onChange={e => setNewClass({...newClass, grade: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-brand-blue"
                  required
                >
                  {ALL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Section</label>
                <select
                  value={newClass.section}
                  onChange={e => setNewClass({...newClass, section: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-brand-blue"
                  required
                >
                  {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-brand-blue text-white font-bold hover:bg-brand-blue/90 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClassesPage() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'principal', 'vice_principal']}>
      <ClassesPageContent />
    </ProtectedRoute>
  );
}
