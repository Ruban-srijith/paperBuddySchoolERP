import { create } from 'zustand';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export type UserRole = 
  | 'super_admin' 
  | 'correspondent'
  | 'principal' 
  | 'vice_principal'
  | 'teacher' 
  | 'mentor' 
  | 'student'
  | 'finance'
  | 'warden'
  | 'librarian'
  | 'transport';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  school_id?: string | null;
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
  super_admin: 'Founder / Super Admin',
  correspondent: 'Correspondent',
  principal: 'Principal',
  vice_principal: 'Vice-Principal',
  teacher: 'Teacher',
  mentor: 'Mentor',
  student: 'Student',
  finance: 'Finance Manager',
  warden: 'Hostel Warden',
  librarian: 'Chief Librarian',
  transport: 'Transport Admin',
};

// Role colors for badges
export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'from-fuchsia-500 to-purple-600',
  correspondent: 'from-amber-500 to-red-500',
  principal: 'from-amber-500 to-yellow-500',
  vice_principal: 'from-blue-600 to-cyan-500',
  teacher: 'from-emerald-500 to-green-500',
  mentor: 'from-violet-500 to-purple-500',
  student: 'from-sky-500 to-blue-500',
  finance: 'from-emerald-500 to-teal-500',
  warden: 'from-fuchsia-500 to-purple-500',
  librarian: 'from-sky-500 to-indigo-500',
  transport: 'from-blue-400 to-indigo-500',
};

// Navigation items per role
export const ROLE_NAV_ITEMS: Record<UserRole, string[]> = {
  super_admin: [
    'superadmin_analytics',
    'superadmin_colleges',
    'superadmin_admins',
    'superadmin_logs',
    'superadmin_payments',
    'superadmin_broadcasts',
    'superadmin_aiconfig'
  ],
  correspondent: [
    'dashboard',
    'scans',
    'admin_documents',
    'pending_approvals',
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
    'assign_students',
    'class_roster',
    'class_allotments',
    'classroom_allocation',
    'reports'
  ],
  principal: [
    'dashboard',
    'scans',
    'admin_documents',
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
    'assign_students',
    'class_roster',
    'class_allotments',
    'classroom_allocation'
  ],
  vice_principal: [
    'dashboard',
    'scans',
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
    'assign_students',
    'class_roster',
    'class_allotments'
  ],
  teacher: [
    'dashboard',
    'scans',
    'assign_toppers',
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
    'departments'
  ],
  mentor: [
    'dashboard',
    'scans',
    'mentorship',
    'assignments',
    'queries'
  ],
  student: [
    'dashboard',
    'scans',
    'student_documents',
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
    'student_hostel'
  ],

  finance: [
    'dashboard',
    'scans',
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
    'scans',
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
    'scans',
    'librarian_inventory',
    'librarian_issues',
    'librarian_digital',
    'librarian_requests'
  ],
  transport: [
    'transport_dashboard',
    'transport_fleet',
    'transport_routes',
    'transport_staff',
    'transport_allocations'
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
        school_id: data.school_id,
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
              school_id: res.data.school_id,
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
        school_id: res.data.school_id,
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
