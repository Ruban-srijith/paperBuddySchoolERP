import { create } from 'zustand';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export type UserRole = 
  | 'super_admin' 
  | 'correspondent'
  | 'admin' 
  | 'principal' 
  | 'vice_principal'
  | 'dean' 
  | 'dept_head' 
  | 'teacher' 
  | 'mentor' 
  | 'student'
  | 'parent'
  | 'finance'
  | 'warden'
  | 'librarian';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department_id?: string | null;
  assigned_grade?: string | null;
  profile_picture?: string | null;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
  checkAuth: () => void;
  refreshUser: () => Promise<void>;
}

// Role display names for UI
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin (Correspondent)',
  correspondent: 'Correspondent',
  admin: 'Admin (Principal)',
  principal: 'Principal',
  vice_principal: 'Sub-admin (Vice-Principal)',
  dean: 'Dean of Academics',
  dept_head: 'Head of Department',
  teacher: 'Teacher',
  mentor: 'Mentor',
  student: 'Student',
  parent: 'Parent',
  finance: 'Finance Manager',
  warden: 'Hostel Warden',
  librarian: 'Chief Librarian',
};

// Role colors for badges
export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'from-red-500 to-amber-500',
  correspondent: 'from-amber-500 to-red-500',
  admin: 'from-indigo-500 to-purple-500',
  principal: 'from-amber-500 to-yellow-500',
  vice_principal: 'from-blue-600 to-cyan-500',
  dean: 'from-teal-500 to-cyan-500',
  dept_head: 'from-blue-500 to-indigo-500',
  teacher: 'from-emerald-500 to-green-500',
  mentor: 'from-violet-500 to-purple-500',
  student: 'from-sky-500 to-blue-500',
  parent: 'from-pink-500 to-rose-500',
  finance: 'from-emerald-500 to-teal-500',
  warden: 'from-fuchsia-500 to-purple-500',
  librarian: 'from-sky-500 to-indigo-500',
};

// Navigation items per role
export const ROLE_NAV_ITEMS: Record<UserRole, string[]> = {
  super_admin: [
    'dashboard',
    'salary_approvals',
    'event_approvals',
    'revenue',
    'toppers',
    'calendar',
    'timetable',
    'attendance',
    'mentorship',
    'fees',
    'emails',
    'users',
    'departments',
    'classes',
    'class_allotments',
    'ocr'
  ],
  correspondent: [
    'dashboard',
    'salary_approvals',
    'event_approvals',
    'revenue',
    'toppers',
    'calendar',
    'timetable',
    'attendance',
    'mentorship',
    'fees',
    'emails',
    'users',
    'departments',
    'classes',
    'class_roster',
    'class_allotments',
    'classroom_allocation',
    'ocr'
  ],
  admin: [
    'dashboard',
    'pending_approvals',
    'workload',
    'staff_management',
    'reports',
    'calendar',
    'timetable',
    'attendance',
    'mentorship',
    'fees',
    'emails',
    'users',
    'departments',
    'classes',
    'class_roster',
    'class_allotments',
    'ocr'
  ],
  principal: [
    'dashboard',
    'pending_approvals',
    'workload',
    'staff_management',
    'reports',
    'calendar',
    'timetable',
    'attendance',
    'mentorship',
    'fees',
    'emails',
    'users',
    'departments',
    'classes',
    'class_roster',
    'class_allotments',
    'classroom_allocation',
    'ocr'
  ],
  vice_principal: [
    'dashboard',
    'timetable',
    'classroom_allocation',
    'workload',
    'exams',
    'calendar',
    'reports',
    'labs',
    'substitutions',
    'attendance',
    'portion',
    'users',
    'departments',
    'classes',
    'class_roster',
    'class_allotments',
    'ocr'
  ],
  dean: [
    'dashboard',
    'timetable',
    'classroom_allocation',
    'workload',
    'exams',
    'calendar',
    'reports',
    'labs',
    'attendance',
    'portion',
    'ocr'
  ],
  dept_head: [
    'dashboard',
    'timetable',
    'workload',
    'calendar',
    'labs',
    'attendance',
    'portion',
    'ocr'
  ],
  teacher: [
    'dashboard',
    'my_class',
    'class-fees',
    'teacher-requests',
    'teacher_leave',
    'teacher_library',
    'attendance',
    'timetable',
    'homework',
    'assignments',
    'labs',
    'portion',
    'calendar',
    'doubts',
    'leave_apply',
    'announcements',
    'departments',
    'ocr'
  ],
  mentor: [
    'dashboard',
    'mentorship',
    'attendance',
    'portion',
    'ocr'
  ],
  student: [
    'dashboard',
    'timetable',
    'attendance',
    'homework',
    'assignments',
    'exam_schedule',
    'portion',
    'labs',
    'calendar',
    'queries',
    'fees',
    'student_settings',
    'student_library',
    'student_hostel',
    'ocr'
  ],
  parent: [
    'parent_portal',
    'ocr'
  ],
  finance: [
    'dashboard',
    'finance_approvals',
    'budgets',
    'vendors',
    'scholarships',
    'fee-config',
    'fees',
    'expenses',
    'payroll',
    'reports'
  ],
  warden: [
    'dashboard',
    'hostel_rooms',
    'outpasses',
    'hostel_attendance',
    'mess',
    'warden-finance',
    'warden_incidents',
    'warden_visitors'
  ],
  librarian: [
    'librarian_dashboard',
    'librarian_inventory',
    'librarian_issues',
    'librarian_digital',
    'librarian_requests'
  ]
};

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const data = response.data;

      const user: AuthUser = {
        id: data.user_id,
        email: data.email,
        full_name: data.full_name,
        role: data.role as UserRole,
        department_id: data.department_id,
        assigned_grade: data.assigned_grade,
      };

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('pb_token', data.access_token);
        localStorage.setItem('pb_user', JSON.stringify(user));
      }

      set({
        token: data.access_token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Login failed. Please check your credentials.';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pb_token');
      localStorage.removeItem('pb_user');
    }
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  getAuthHeaders: () => {
    const token = get().token;
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  },

  checkAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pb_token');
      const userStr = localStorage.getItem('pb_user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr) as AuthUser;
          set({ token, user, isAuthenticated: true });
          
          // Background refresh to get latest profile (e.g. assigned_grade updates)
          axios.get(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => {
            const freshUser: AuthUser = {
              id: res.data.id,
              email: res.data.email,
              full_name: res.data.full_name,
              role: res.data.role,
              department_id: res.data.department_id,
              assigned_grade: res.data.assigned_grade,
            };
            localStorage.setItem('pb_user', JSON.stringify(freshUser));
            set({ user: freshUser });
          }).catch(() => {
             // Silently fail, keep local state
          });
        } catch {
          set({ token: null, user: null, isAuthenticated: false });
        }
      } else {
        set({ token: null, user: null, isAuthenticated: false });
      }
    }
  },
  
  refreshUser: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const freshUser: AuthUser = {
        id: res.data.id,
        email: res.data.email,
        full_name: res.data.full_name,
        role: res.data.role,
        department_id: res.data.department_id,
        assigned_grade: res.data.assigned_grade,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('pb_user', JSON.stringify(freshUser));
      }
      set({ user: freshUser });
    } catch (err) {
      console.error("Failed to refresh user profile", err);
    }
  },
}));
