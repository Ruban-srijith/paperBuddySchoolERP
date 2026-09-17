"use client";

import { useEffect, useState } from 'react';
import { Building2, Plus, X, Trash2, AlertTriangle, Check, Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import api from '@/lib/api';
import { useToast } from '@/components/Toast';

interface ClassItem {
  id: string;
  grade: string;
  section: string;
  teacher_name?: string | null;
}

const ALL_GRADES = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H"];

function ClassesPageContent() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [classToDelete, setClassToDelete] = useState<ClassItem | null>(null);

  const [newGrade, setNewGrade] = useState('10');
  const [newSection, setNewSection] = useState('C');
  const [customGrade, setCustomGrade] = useState('');
  const [customSection, setCustomSection] = useState('');
  const [isCustomGrade, setIsCustomGrade] = useState(false);
  const [isCustomSection, setIsCustomSection] = useState(false);

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

  const openCreateModal = () => {
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
    setCreateError('');
    setShowCreateModal(true);
  };

  const effectiveGrade = isCustomGrade ? customGrade.trim().toUpperCase() : newGrade.trim().toUpperCase();
  const effectiveSection = isCustomSection ? customSection.trim().toUpperCase() : newSection.trim().toUpperCase();

  const isAlreadyExists = classes.some(
    c => c.grade.trim().toUpperCase() === effectiveGrade && c.section.trim().toUpperCase() === effectiveSection
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveGrade || !effectiveSection) {
      setCreateError("Please enter both Grade and Section");
      return;
    }

    if (isAlreadyExists) {
      setCreateError(`Class Grade ${effectiveGrade} - Section ${effectiveSection} already exists.`);
      return;
    }

    setCreating(true);
    setCreateError('');
    try {
      await api.post('/classes', { grade: effectiveGrade, section: effectiveSection });
      toast.success(`Class Grade ${effectiveGrade} - Section ${effectiveSection} created successfully!`, "Success");
      setShowCreateModal(false);
      fetchClasses();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to create class';
      setCreateError(msg);
      toast.error(msg, "Error");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!classToDelete) return;
    setDeletingId(classToDelete.id);
    try {
      await api.delete(`/classes/${classToDelete.id}`);
      toast.success(`Grade ${classToDelete.grade} - Section ${classToDelete.section} deleted successfully`);
      setClassToDelete(null);
      fetchClasses();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete class');
    } finally {
      setDeletingId(null);
    }
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
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all whitespace-nowrap flex-shrink-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Create Class
        </button>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 rounded-full text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue font-bold text-lg">
                  {cls.grade}
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-200 text-sm font-bold text-gray-600">
                    Sec {cls.section}
                  </div>
                  <button
                    onClick={() => setClassToDelete(cls)}
                    title="Delete Class"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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

      {/* Delete Confirmation Modal */}
      {classToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-brand-black">Delete Class</h3>
            </div>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <span className="font-bold text-brand-black">Grade {classToDelete.grade} - Section {classToDelete.section}</span>?
              Students assigned to this class will become unassigned.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setClassToDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deletingId !== null}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deletingId ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
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

              {isAlreadyExists && !createError && (
                <div className="p-2.5 bg-amber-50 text-amber-700 text-xs rounded-lg border border-amber-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Grade {effectiveGrade} - Section {effectiveSection} already exists. Choose a different section or grade.</span>
                </div>
              )}
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-500 uppercase">Grade Level</label>
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
                    onChange={e => setCustomGrade(e.target.value.toUpperCase())}
                    placeholder="e.g. Pre-KG, Nursery, 13"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold uppercase focus:outline-none focus:border-brand-blue"
                    required
                  />
                ) : (
                  <select
                    value={newGrade}
                    onChange={e => setNewGrade(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-brand-blue font-semibold"
                    required
                  >
                    {ALL_GRADES.map(g => <option key={g} value={g}>Grade {g}</option>)}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-500 uppercase">Section</label>
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
                    onChange={e => setCustomSection(e.target.value.toUpperCase())}
                    placeholder="e.g. C, D, Lotus, Rose"
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold uppercase focus:outline-none focus:border-brand-blue"
                    required
                  />
                ) : (
                  <select
                    value={newSection}
                    onChange={e => setNewSection(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-brand-blue font-semibold"
                    required
                  >
                    {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                )}
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
                  disabled={creating || isAlreadyExists}
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
