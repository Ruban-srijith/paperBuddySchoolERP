"use client";

import { useEffect, useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Shield, 
  X, 
  Check, 
  Phone, 
  GraduationCap, 
  Mail, 
  User as UserIcon,
  Edit2,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Building2,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  School,
  CheckCircle2,
  AlertCircle,
  Hash,
  BookOpen,
  UserCheck,
  UserX
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ROLE_LABELS, ROLE_COLORS, UserRole } from '@/store/authStore';
import { useToast } from '@/components/Toast';
import api from '@/lib/api';
import { exportToCsv } from '@/lib/exportUtils';

interface UserItem {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department_id: string | null;
  department_name?: string | null;
  assigned_grade: string | null;
  phone: string | null;
  roll_number?: string | null;
  admission_number?: string | null;
  age?: number | null;
  profile_picture?: string | null;
  is_active: boolean;
  created_at: string;
}

interface DepartmentItem {
  id: string;
  name: string;
  code: string;
}

const ALL_ROLES: UserRole[] = [
  'super_admin', 'correspondent', 'principal', 'vice_principal', 
  'teacher', 'mentor', 'student', 
  'finance', 'warden', 'librarian', 'transport'
];

const ALL_GRADES = [
  'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 
  '11', '12', '11-BioPCM', '11-PCM-CS', '11-Commerce', '12-BioPCM', '12-PCM-CS', '12-Commerce'
];

type TabFilter = 'all' | 'students' | 'teachers' | 'staff';
type SortField = 'full_name' | 'role' | 'assigned_grade' | 'department_name' | 'roll_number' | 'admission_number' | 'is_active' | 'created_at';
type SortDirection = 'asc' | 'desc';

function UsersPageContent() {
  const { toast } = useToast();
  
  // Data State
  const [users, setUsers] = useState<UserItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter State
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [roleFilter, setRoleFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('full_name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Modals State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  // Create form state
  const [newUser, setNewUser] = useState({
    email: '',
    full_name: '',
    password: 'school@123',
    role: 'student',
    department_id: '',
    assigned_grade: '',
    phone: '',
    roll_number: '',
    admission_number: '',
    age: ''
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    role: 'student',
    department_id: '',
    assigned_grade: '',
    phone: '',
    roll_number: '',
    admission_number: '',
    age: '',
    is_active: true,
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Fetch Users & Departments
  const fetchUsers = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    else setLoading(true);

    try {
      const [usersRes, deptsRes] = await Promise.all([
        api.get('/users'),
        api.get('/departments').catch(() => ({ data: [] }))
      ]);

      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
      setDepartments(Array.isArray(deptsRes.data) ? deptsRes.data : []);
    } catch (err: any) {
      console.error('Fetch users error:', err);
      toast.error('Failed to load users list from server', 'Network Error');
      setUsers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Tab Switch
  const handleTabChange = (tab: TabFilter) => {
    setActiveTab(tab);
    setCurrentPage(1);
    if (tab === 'students') {
      setRoleFilter('student');
    } else if (tab === 'teachers') {
      setRoleFilter('teacher');
    } else {
      setRoleFilter('');
    }
  };

  // Sort Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Quick Clear Filters
  const clearFilters = () => {
    setActiveTab('all');
    setRoleFilter('');
    setGradeFilter('');
    setDeptFilter('');
    setStatusFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters = roleFilter !== '' || gradeFilter !== '' || deptFilter !== '' || statusFilter !== 'all' || searchQuery.trim() !== '' || activeTab !== 'all';

  // Counts for summary metrics
  const counts = useMemo(() => {
    const total = users.length;
    const students = users.filter(u => u.role === 'student').length;
    const teachers = users.filter(u => u.role === 'teacher').length;
    const staff = users.filter(u => !['student', 'teacher'].includes(u.role)).length;
    const active = users.filter(u => u.is_active).length;
    return { total, students, teachers, staff, active };
  }, [users]);

  // Filtered & Sorted Users
  const processedUsers = useMemo(() => {
    return users
      .filter(u => {
        // Tab check
        if (activeTab === 'students' && u.role !== 'student') return false;
        if (activeTab === 'teachers' && u.role !== 'teacher') return false;
        if (activeTab === 'staff' && ['student', 'teacher'].includes(u.role)) return false;

        // Specific Role Filter
        if (roleFilter && u.role !== roleFilter) return false;

        // Grade Filter
        if (gradeFilter) {
          if (!u.assigned_grade) return false;
          if (u.assigned_grade !== gradeFilter && !u.assigned_grade.startsWith(gradeFilter)) return false;
        }

        // Department Filter
        if (deptFilter) {
          if (u.department_id !== deptFilter && u.department_name !== deptFilter) return false;
        }

        // Status Filter
        if (statusFilter === 'active' && !u.is_active) return false;
        if (statusFilter === 'inactive' && u.is_active) return false;

        // Search Query
        const q = searchQuery.toLowerCase().trim();
        if (q) {
          const matchName = (u.full_name || '').toLowerCase().includes(q);
          const matchEmail = (u.email || '').toLowerCase().includes(q);
          const matchPhone = (u.phone || '').toLowerCase().includes(q);
          const matchRoll = (u.roll_number || '').toLowerCase().includes(q);
          const matchAdm = (u.admission_number || '').toLowerCase().includes(q);
          const matchDept = (u.department_name || '').toLowerCase().includes(q);
          const matchGrade = (u.assigned_grade || '').toLowerCase().includes(q);
          if (!matchName && !matchEmail && !matchPhone && !matchRoll && !matchAdm && !matchDept && !matchGrade) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (valA == null) valA = '';
        if (valB == null) valB = '';

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = (valB || '').toString().toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [users, activeTab, roleFilter, gradeFilter, deptFilter, statusFilter, searchQuery, sortField, sortDirection]);

  // Paginated records
  const totalPages = Math.ceil(processedUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedUsers.slice(start, start + pageSize);
  }, [processedUsers, currentPage, pageSize]);

  // Handle Create User
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      const payload = {
        email: newUser.email.trim().toLowerCase(),
        full_name: newUser.full_name.trim(),
        password: newUser.password || 'school@123',
        role: newUser.role,
        department_id: newUser.department_id || null,
        assigned_grade: newUser.assigned_grade || null,
        phone: newUser.phone || null,
        roll_number: newUser.roll_number || null,
        admission_number: newUser.admission_number || null,
        age: newUser.age ? parseInt(newUser.age) : null,
      };

      await api.post('/users', payload);
      toast.success(`User "${newUser.full_name}" created successfully!`, 'User Created');
      setShowCreateModal(false);
      setNewUser({
        email: '',
        full_name: '',
        password: 'school@123',
        role: 'student',
        department_id: '',
        assigned_grade: '',
        phone: '',
        roll_number: '',
        admission_number: '',
        age: ''
      });
      await fetchUsers();
    } catch (err: any) {
      console.error('Create user error:', err);
      const errMsg = err.response?.data?.detail || 'Failed to create user. Please check form inputs.';
      setCreateError(errMsg);
      toast.error(errMsg, 'Creation Failed');
    } finally {
      setCreating(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setEditFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      department_id: user.department_id || '',
      assigned_grade: user.assigned_grade || '',
      phone: user.phone || '',
      roll_number: user.roll_number || '',
      admission_number: user.admission_number || '',
      age: user.age ? String(user.age) : '',
      is_active: user.is_active,
    });
    setEditError('');
  };

  // Handle Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingEdit(true);
    setEditError('');

    try {
      const payload = {
        full_name: editFormData.full_name.trim(),
        role: editFormData.role,
        department_id: editFormData.department_id ? editFormData.department_id : null,
        assigned_grade: editFormData.assigned_grade ? editFormData.assigned_grade : null,
        phone: editFormData.phone.trim() ? editFormData.phone.trim() : null,
        roll_number: editFormData.roll_number.trim() ? editFormData.roll_number.trim() : null,
        admission_number: editFormData.admission_number.trim() ? editFormData.admission_number.trim() : null,
        age: editFormData.age ? parseInt(editFormData.age) : null,
        is_active: editFormData.is_active,
      };

      const res = await api.put(`/users/${editingUser.id}`, payload);
      const updatedItem: UserItem = res.data;

      // Update state locally
      setUsers(prev => prev.map(u => (u.id === editingUser.id ? { ...u, ...updatedItem } : u)));
      toast.success(`User "${editFormData.full_name}" details updated successfully!`, 'Changes Saved');
      setEditingUser(null);
    } catch (err: any) {
      console.error('Update user error:', err);
      const errMsg = err.response?.data?.detail || 'Failed to update user profile.';
      setEditError(errMsg);
      toast.error(errMsg, 'Update Failed');
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deletingUser.id}`);
      setUsers(prev => prev.filter(u => u.id !== deletingUser.id));
      toast.success(`User "${deletingUser.full_name}" has been removed.`, 'User Deleted');
      setDeletingUser(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      const errMsg = err.response?.data?.detail || 'Failed to delete user.';
      toast.error(errMsg, 'Delete Failed');
    } finally {
      setDeleting(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Full Name',
      'Email',
      'Role',
      'Grade / Class',
      'Department',
      'Roll Number',
      'Admission Number',
      'Contact Phone',
      'Status',
      'Created Date'
    ];

    const rows = processedUsers.map(u => [
      u.full_name,
      u.email,
      ROLE_LABELS[u.role as UserRole] || u.role,
      u.assigned_grade || '',
      u.department_name || '',
      u.roll_number || '',
      u.admission_number || '',
      u.phone || '',
      u.is_active ? 'Active' : 'Inactive',
      u.created_at ? new Date(u.created_at).toLocaleDateString() : ''
    ]);

    const filename = `paperbuddy_${activeTab}_directory_${new Date().toISOString().slice(0, 10)}.csv`;
    exportToCsv(filename, headers, rows);
    toast.success(`Exported ${processedUsers.length} records to ${filename}`, 'CSV Export Ready');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-brand-black flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-pink-400" />
            </div>
            Student & Faculty Directory
          </h1>
          <p className="text-sm text-gray-600">
            Comprehensive directory with multi-filtering, column sorting, and full edit privileges across {users.length} registered profiles
          </p>
        </div>
        
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => fetchUsers(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={processedUsers.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setCreateError('');
              setShowCreateModal(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-sm font-medium shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all whitespace-nowrap flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4" />
            Add Profile
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div 
          onClick={() => handleTabChange('all')}
          className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all ${
            activeTab === 'all' ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/20 bg-indigo-50/20' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Total Profiles</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-brand-black mt-2">{counts.total}</div>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            {counts.active} active accounts
          </div>
        </div>

        <div 
          onClick={() => handleTabChange('students')}
          className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all ${
            activeTab === 'students' ? 'border-blue-500 shadow-md ring-1 ring-blue-500/20 bg-blue-50/20' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Students</span>
            <School className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-brand-black mt-2">{counts.students}</div>
          <div className="text-xs text-blue-600 mt-1 font-medium">
            30 Classes &bull; LKG to 12th
          </div>
        </div>

        <div 
          onClick={() => handleTabChange('teachers')}
          className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all ${
            activeTab === 'teachers' ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/20 bg-emerald-50/20' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Faculty / Teachers</span>
            <GraduationCap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-brand-black mt-2">{counts.teachers}</div>
          <div className="text-xs text-emerald-600 mt-1 font-medium">
            Across 13 Departments
          </div>
        </div>

        <div 
          onClick={() => handleTabChange('staff')}
          className={`bg-white rounded-2xl border p-4 cursor-pointer transition-all ${
            activeTab === 'staff' ? 'border-amber-500 shadow-md ring-1 ring-amber-500/20 bg-amber-50/20' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Administration & Staff</span>
            <Shield className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-brand-black mt-2">{counts.staff}</div>
          <div className="text-xs text-amber-600 mt-1 font-medium">
            Deans, Wardens, Finance
          </div>
        </div>
      </div>

      {/* Segmented Tab Controls */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-1">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => handleTabChange('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'all'
                ? 'bg-brand-black text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            All Members
            <span className="px-1.5 py-0.5 rounded-full text-xs bg-white/20 text-current">{counts.total}</span>
          </button>

          <button
            onClick={() => handleTabChange('students')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'students'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <School className="w-4 h-4" />
            Students
            <span className="px-1.5 py-0.5 rounded-full text-xs bg-white/20 text-current">{counts.students}</span>
          </button>

          <button
            onClick={() => handleTabChange('teachers')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'teachers'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Teachers & Faculty
            <span className="px-1.5 py-0.5 rounded-full text-xs bg-white/20 text-current">{counts.teachers}</span>
          </button>

          <button
            onClick={() => handleTabChange('staff')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'staff'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            Administration & Staff
            <span className="px-1.5 py-0.5 rounded-full text-xs bg-white/20 text-current">{counts.staff}</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500 font-mono">
          Showing {processedUsers.length} matched profiles
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Live Search */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, email, roll, admission ID..."
              className="w-full pl-10 pr-8 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm text-brand-black placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="md:col-span-2">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm text-brand-black focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Roles</option>
              {ALL_ROLES.map(role => (
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
              ))}
            </select>
          </div>

          {/* Grade / Class Filter */}
          <div className="md:col-span-2">
            <select
              value={gradeFilter}
              onChange={(e) => {
                setGradeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm text-brand-black focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Grades / Classes</option>
              {ALL_GRADES.map(g => (
                <option key={g} value={g}>Class / Grade {g}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="md:col-span-2">
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm text-brand-black focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name} Dept</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm text-brand-black focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Active Filter Tags & Reset */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-500 font-medium">Active Filters:</span>

            {activeTab !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                View: {activeTab.toUpperCase()}
                <button onClick={() => handleTabChange('all')}><X className="w-3 h-3" /></button>
              </span>
            )}

            {roleFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                Role: {ROLE_LABELS[roleFilter as UserRole] || roleFilter}
                <button onClick={() => setRoleFilter('')}><X className="w-3 h-3" /></button>
              </span>
            )}

            {gradeFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                Grade: {gradeFilter}
                <button onClick={() => setGradeFilter('')}><X className="w-3 h-3" /></button>
              </span>
            )}

            {deptFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                Dept: {deptFilter}
                <button onClick={() => setDeptFilter('')}><X className="w-3 h-3" /></button>
              </span>
            )}

            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                Status: {statusFilter.toUpperCase()}
                <button onClick={() => setStatusFilter('all')}><X className="w-3 h-3" /></button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
                Search: &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
              </span>
            )}

            <button
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700 font-medium underline ml-auto transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/70 text-xs font-semibold text-gray-600 select-none">
                {/* User column */}
                <th 
                  onClick={() => handleSort('full_name')}
                  className="px-5 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Member / Profile</span>
                    {sortField === 'full_name' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </div>
                </th>

                {/* Role column */}
                <th 
                  onClick={() => handleSort('role')}
                  className="px-5 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Role</span>
                    {sortField === 'role' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </div>
                </th>

                {/* Grade / Class column */}
                <th 
                  onClick={() => handleSort('assigned_grade')}
                  className="px-5 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Grade / Class</span>
                    {sortField === 'assigned_grade' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </div>
                </th>

                {/* Department column */}
                <th 
                  onClick={() => handleSort('department_name')}
                  className="px-5 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Department</span>
                    {sortField === 'department_name' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </div>
                </th>

                {/* Roll / Admission column */}
                <th 
                  onClick={() => handleSort('roll_number')}
                  className="px-5 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Roll & Admission No</span>
                    {sortField === 'roll_number' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </div>
                </th>

                {/* Contact Phone */}
                <th className="px-5 py-3.5">
                  <span>Contact Phone</span>
                </th>

                {/* Status column */}
                <th 
                  onClick={() => handleSort('is_active')}
                  className="px-5 py-3.5 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {sortField === 'is_active' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600" /> : <ArrowDown className="w-3.5 h-3.5 text-indigo-600" />
                    ) : (
                      <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </div>
                </th>

                {/* Actions column */}
                <th className="px-5 py-3.5 text-right">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-gray-500">
                    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm font-medium">Loading school directory data...</p>
                  </td>
                </tr>
              ) : paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-gray-500">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-base font-semibold text-gray-800">No matching members found</p>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      Try relaxing your search terms or clearing specific role, class, or department filters.
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-3 px-3 py-1.5 rounded-lg bg-gray-100 text-xs text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map(user => {
                  const role = user.role as UserRole;
                  return (
                    <tr key={user.id} className="hover:bg-indigo-50/30 transition-colors group">
                      {/* Name & Email */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${ROLE_COLORS[role] || 'from-gray-500 to-slate-600'} flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0`}>
                            {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-brand-black truncate flex items-center gap-2">
                              <span>{user.full_name}</span>
                              {user.role === 'teacher' && user.assigned_grade && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-medium">
                                  CT: {user.assigned_grade}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 font-mono truncate">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2.5 py-1 rounded-full bg-gradient-to-r ${ROLE_COLORS[role] || 'from-gray-500 to-slate-600'} text-white font-medium inline-block whitespace-nowrap shadow-xs`}>
                          {ROLE_LABELS[role] || role}
                        </span>
                      </td>

                      {/* Grade / Class */}
                      <td className="px-5 py-3.5 text-xs">
                        {user.assigned_grade ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-gray-800 px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100">
                            <BookOpen className="w-3 h-3 text-blue-500" />
                            {user.assigned_grade}
                          </span>
                        ) : (
                          <span className="text-gray-400">&mdash;</span>
                        )}
                      </td>

                      {/* Department */}
                      <td className="px-5 py-3.5 text-xs text-gray-700">
                        {user.department_name ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100 font-medium">
                            <Building2 className="w-3 h-3 text-emerald-600" />
                            {user.department_name}
                          </span>
                        ) : (
                          <span className="text-gray-400">&mdash;</span>
                        )}
                      </td>

                      {/* Roll & Admission ID */}
                      <td className="px-5 py-3.5 text-xs font-mono">
                        {user.roll_number || user.admission_number ? (
                          <div className="space-y-0.5">
                            {user.roll_number && (
                              <div className="text-gray-800 font-semibold flex items-center gap-1">
                                <span className="text-[10px] text-gray-500 font-sans">Roll:</span> {user.roll_number}
                              </div>
                            )}
                            {user.admission_number && (
                              <div className="text-gray-500 text-[11px] flex items-center gap-1">
                                <span className="text-[10px] text-gray-400 font-sans">Adm:</span> {user.admission_number}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">&mdash;</span>
                        )}
                      </td>

                      {/* Contact Phone */}
                      <td className="px-5 py-3.5 text-xs font-mono text-gray-700">
                        {user.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {user.phone}
                          </span>
                        ) : (
                          <span className="text-gray-400">&mdash;</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          user.is_active 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded-lg border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 transition-colors"
                            title="Edit user details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => setDeletingUser(user)}
                            className="p-1.5 rounded-lg border border-gray-200 hover:border-rose-400 hover:bg-rose-50 text-gray-600 hover:text-rose-600 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="px-5 py-3.5 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-md bg-white border border-gray-200 text-xs text-brand-black focus:outline-none focus:border-indigo-500"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <span className="text-gray-400 ml-2">|</span>
            <span className="ml-2">
              Showing <span className="font-semibold text-gray-800">{processedUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-gray-800">{Math.min(currentPage * pageSize, processedUsers.length)}</span> of{' '}
              <span className="font-semibold text-gray-800">{processedUsers.length}</span> entries
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium"
            >
              First
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-medium text-gray-800">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          EDIT USER MODAL
      ════════════════════════════════════════════════════════════ */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-gray-200 max-w-xl w-full rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-black">Edit Member Profile</h3>
                  <p className="text-xs text-gray-500">Update academic, departmental, and personal details</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingUser(null)} 
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={editFormData.full_name}
                    onChange={e => setEditFormData({ ...editFormData, full_name: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    disabled
                    className="w-full px-3 py-2 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 font-mono text-xs cursor-not-allowed"
                    title="Email is unique and immutable"
                  />
                </div>
              </div>

              {/* Role and Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Institutional Role</label>
                  <select
                    value={editFormData.role}
                    onChange={e => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {ALL_ROLES.map(r => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Department (Faculty)</label>
                  <select
                    value={editFormData.department_id}
                    onChange={e => setEditFormData({ ...editFormData, department_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">None / Not Applicable</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} Department</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assigned Grade and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Assigned Grade / Class</label>
                  <select
                    value={editFormData.assigned_grade}
                    onChange={e => setEditFormData({ ...editFormData, assigned_grade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">None</option>
                    {ALL_GRADES.map(g => (
                      <option key={g} value={g}>Class {g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Contact Phone</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder="e.g. 9840123456"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Roll and Admission ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Roll Number</label>
                  <input
                    type="text"
                    value={editFormData.roll_number}
                    onChange={e => setEditFormData({ ...editFormData, roll_number: e.target.value })}
                    placeholder="e.g. 10A01"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Admission Number</label>
                  <input
                    type="text"
                    value={editFormData.admission_number}
                    onChange={e => setEditFormData({ ...editFormData, admission_number: e.target.value })}
                    placeholder="e.g. ADM2024001"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Active Status Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div>
                  <div className="font-semibold text-gray-800">Account Active Status</div>
                  <div className="text-gray-500 text-[11px]">Inactive users are prevented from logging into the portal</div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditFormData({ ...editFormData, is_active: !editFormData.is_active })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    editFormData.is_active ? 'bg-emerald-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      editFormData.is_active ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
                >
                  {savingEdit ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          DELETE CONFIRMATION MODAL
      ════════════════════════════════════════════════════════════ */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-gray-200 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-brand-black">Delete Profile</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to permanently delete the profile of{' '}
                <span className="font-semibold text-brand-black">{deletingUser.full_name}</span> ({deletingUser.email})?
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
              <span>This action will revoke portal access and remove linked academic records.</span>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-700 disabled:opacity-50 transition-all text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                {deleting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          CREATE USER MODAL
      ════════════════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-gray-200 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-black">Add New Institutional Profile</h3>
                  <p className="text-xs text-gray-500">Register a new student, teacher, or administrative member</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Full Name</label>
                  <input
                    value={newUser.full_name} 
                    onChange={e => setNewUser({...newUser, full_name: e.target.value})}
                    required 
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Email Address</label>
                  <input
                    type="email" 
                    value={newUser.email} 
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    required 
                    placeholder="user@bharathischool.edu"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Role</label>
                  <select
                    value={newUser.role} 
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {ALL_ROLES.filter(r => r !== 'super_admin').map(r => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Initial Password</label>
                  <input
                    value={newUser.password} 
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    required 
                    placeholder="school@123"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {newUser.role === 'teacher' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700">Department</label>
                    <select
                      value={newUser.department_id}
                      onChange={e => setNewUser({...newUser, department_id: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name} Department</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-gray-700">Assigned Class Teacher Grade</label>
                    <select
                      value={newUser.assigned_grade} 
                      onChange={e => setNewUser({...newUser, assigned_grade: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">None (Subject Teacher)</option>
                      {ALL_GRADES.map(g => (
                        <option key={g} value={g}>Class {g}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {newUser.role === 'student' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-700">Class / Grade</label>
                      <select
                        value={newUser.assigned_grade} 
                        onChange={e => setNewUser({...newUser, assigned_grade: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">Select Class</option>
                        {ALL_GRADES.map(g => (
                          <option key={g} value={g}>Class {g}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-gray-700">Contact Phone</label>
                      <input
                        value={newUser.phone} 
                        onChange={e => setNewUser({...newUser, phone: e.target.value})}
                        placeholder="e.g. 9840123456"
                        className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-700">Roll Number</label>
                      <input
                        value={newUser.roll_number} 
                        onChange={e => setNewUser({...newUser, roll_number: e.target.value})}
                        placeholder="e.g. 10A15"
                        className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-700">Admission ID</label>
                      <input
                        value={newUser.admission_number} 
                        onChange={e => setNewUser({...newUser, admission_number: e.target.value})}
                        placeholder="e.g. ADM2024101"
                        className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {!['student', 'teacher'].includes(newUser.role) && (
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Contact Phone</label>
                  <input
                    value={newUser.phone} 
                    onChange={e => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="e.g. 9840123456"
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-brand-black text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              )}

              {createError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
                <button
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit" 
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
                >
                  {creating ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Create Profile</span>
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
    <ProtectedRoute allowedRoles={['super_admin', 'platform_super_admin', 'correspondent', 'principal', 'vice_principal']}>
      <UsersPageContent />
    </ProtectedRoute>
  );
}
