"use client";

import { useEffect, useState } from 'react';
import { Users, Plus, Search, Filter, Shield, Building2, X, Check } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ROLE_LABELS, ROLE_COLORS, UserRole } from '@/store/authStore';
import api from '@/lib/api';

interface UserItem {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department_id: string | null;
  department_name: string | null;
  assigned_grade: string | null;
  is_active: boolean;
  created_at: string;
}

interface DeptItem {
  id: string;
  name: string;
}

const ALL_ROLES: UserRole[] = ['correspondent', 'principal', 'vice_principal', 'teacher', 'mentor', 'student'];
const ALL_GRADES = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

function UsersPageContent() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [departments, setDepartments] = useState<DeptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form state
  const [newUser, setNewUser] = useState({
    email: '', full_name: '', password: 'school@123',
    role: 'student', department_id: '', assigned_grade: '',
    phone: '', roll_number: '', admission_number: '', age: ''
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      setUsers([]);
    }
    setLoading(false);
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const filteredUsers = users.filter(u =>
    (roleFilter === '' || u.role === roleFilter) &&
    (u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      await api.post('/users', {
        ...newUser,
        department_id: newUser.department_id || null,
        assigned_grade: newUser.assigned_grade || null,
        phone: newUser.phone || null,
        roll_number: newUser.roll_number || null,
        admission_number: newUser.admission_number || null,
        age: newUser.age ? parseInt(newUser.age) : null,
      });
      setShowCreateModal(false);
      setNewUser({ email: '', full_name: '', password: 'school@123', role: 'student', department_id: '', assigned_grade: '', phone: '', roll_number: '', admission_number: '', age: '' });
      fetchUsers();
    } catch (err: any) {
      setCreateError(err.response?.data?.detail || 'Failed to create user');
    }
    setCreating(false);
  };

  const roleCounts = ALL_ROLES.reduce((acc, role) => {
    acc[role] = users.filter(u => u.role === role).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-pink-400" />
            </div>
            User Management
          </h1>
          <p className="text-sm text-gray-400">Manage users across all 8 roles — {users.length} total users</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all whitespace-nowrap flex-shrink-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
        {ALL_ROLES.map(role => (
          <button
            key={role}
            onClick={() => setRoleFilter(roleFilter === role ? '' : role)}
            className={`glass-panel p-3 rounded-xl text-center transition-all cursor-pointer
              ${roleFilter === role ? 'border-indigo-500/50 bg-indigo-600/10' : 'hover:border-gray-600'}`}
          >
            <div className="text-lg font-bold text-white">{roleCounts[role] || 0}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{ROLE_LABELS[role]}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-900/70 border border-gray-700/60 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        {roleFilter && (
          <button
            onClick={() => setRoleFilter('')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs border border-indigo-500/30 hover:bg-indigo-500/20 transition-colors"
          >
            <Filter className="w-3 h-3" />
            {ROLE_LABELS[roleFilter as UserRole]}
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800/60">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Grade</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                </td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No users found</td></tr>
              ) : (
                filteredUsers.map(user => {
                  const role = user.role as UserRole;
                  return (
                    <tr key={user.id} className="hover:bg-gray-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${ROLE_COLORS[role]} flex items-center justify-center text-white font-semibold text-xs`}>
                            {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.full_name}</div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full bg-gradient-to-r ${ROLE_COLORS[role]} text-white font-medium`}>
                          {ROLE_LABELS[role]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-xs">
                        {user.department_name || <span className="text-gray-600">—</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-xs">
                        {user.assigned_grade ? `Grade ${user.assigned_grade}` : <span className="text-gray-600">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          user.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
          <div className="relative glass-panel-glow rounded-2xl p-6 w-full max-w-lg space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Create New User</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Full Name</label>
                  <input
                    value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})}
                    required placeholder="Dr. John Doe"
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-900/70 border border-gray-700/60 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Email</label>
                  <input
                    type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                    required placeholder="john.doe@school.edu"
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-900/70 border border-gray-700/60 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Role</label>
                  <select
                    value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-900/70 border border-gray-700/60 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {ALL_ROLES.map(r => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Password</label>
                  <input
                    value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
                    required placeholder="school@123"
                    className="w-full px-3 py-2.5 rounded-lg bg-gray-900/70 border border-gray-700/60 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {newUser.role === 'teacher' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Department</label>
                      <select
                        value={newUser.department_id} onChange={e => setNewUser({...newUser, department_id: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-lg bg-gray-900/70 border border-gray-700/60 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">None</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Phone Number</label>
                      <input
                        value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})}
                        placeholder="+1 234 567 8900"
                        className="w-full px-3 py-2.5 rounded-lg bg-gray-900/70 border border-gray-700/60 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {newUser.role === 'student' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Assigned Grade</label>
                      <select
                        value={newUser.assigned_grade} onChange={e => setNewUser({...newUser, assigned_grade: e.target.value})}
                        className="w-full px-3 py-2.5 rounded-lg bg-gray-900/70 border border-gray-700/60 text-sm text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">None</option>
                        {ALL_GRADES.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Age</label>
                      <input
                        type="number" value={newUser.age} onChange={e => setNewUser({...newUser, age: e.target.value})}
                        placeholder="e.g. 15"
                        className="w-full px-3 py-2.5 rounded-lg bg-gray-900/70 border border-gray-700/60 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Roll Number</label>
                      <input
                        value={newUser.roll_number} onChange={e => setNewUser({...newUser, roll_number: e.target.value})}
                        placeholder="e.g. 1045"
                        className="w-full px-3 py-2.5 rounded-lg bg-gray-900/70 border border-gray-700/60 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Admission ID</label>
                      <input
                        value={newUser.admission_number} onChange={e => setNewUser({...newUser, admission_number: e.target.value})}
                        placeholder="e.g. ADM-2024-001"
                        className="w-full px-3 py-2.5 rounded-lg bg-gray-900/70 border border-gray-700/60 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {createError && (
                <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">{createError}</div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl glass-panel text-gray-300 text-sm font-medium hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={creating}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-sm font-medium shadow-lg shadow-indigo-500/25 hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Check className="w-4 h-4" />}
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={['super_admin', 'correspondent', 'admin', 'principal']}>
      <UsersPageContent />
    </ProtectedRoute>
  );
}
