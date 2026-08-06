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
  | 'parent';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department_id?: string | null;
  assigned_grade?: string | null;
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
  parent: 'from-emerald-500 to-teal-500',
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
    'class_allotments',
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
    'class_allotments',
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
    'departments',
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
    'ocr'
  ],
  parent: [
    'parent_portal',
    'ocr'
  ],
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
        } catch {
          set({ token: null, user: null, isAuthenticated: false });
        }
      } else {
        set({ token: null, user: null, isAuthenticated: false });
      }
    }
  },
}));
