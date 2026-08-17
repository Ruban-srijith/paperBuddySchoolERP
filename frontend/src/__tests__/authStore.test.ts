/**
 * authStore.test.ts — Zustand Auth Store Unit Tests
 * ==================================================
 * Tests the core auth state machine:
 *  - Initial state is unauthenticated
 *  - login() success sets user + token + isAuthenticated
 *  - login() failure sets error, keeps unauthenticated
 *  - logout() clears all state
 *  - getAuthHeaders() returns correct Bearer token
 *  - checkAuth() restores session from localStorage
 *
 * These tests mirror the button flows:
 *  [Login Button]  → calls store.login() → state transitions
 *  [Logout Button] → calls store.logout() → state cleared
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import { useAuthStore, ROLE_NAV_ITEMS } from '../store/authStore';

// ─── Mock axios ─────────────────────────────────────────────────────────────
vi.mock('axios');
const mockedAxios = axios as unknown as {
  post: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
};

// ─── Mock localStorage ───────────────────────────────────────────────────────
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });


// ─── Helpers ─────────────────────────────────────────────────────────────────
const mockLoginResponse = {
  data: {
    access_token: 'mock_jwt_token_abc123',
    user_id: 'user-001',
    email: 'teacher@school.edu',
    full_name: 'Test Teacher',
    role: 'teacher',
    school_id: 'school-001',
    department_id: 'dept-001',
    assigned_grade: '10',
  },
};


describe('AuthStore — Initial State', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    localStorageMock.clear();
  });

  it('should start with unauthenticated state', () => {
    const { token, user, isAuthenticated, isLoading, error } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
    expect(isLoading).toBe(false);
    expect(error).toBeNull();
  });

  it('getAuthHeaders() should return empty object when not logged in', () => {
    const headers = useAuthStore.getState().getAuthHeaders();
    expect(headers).toEqual({});
  });
});


describe('AuthStore — Login Flow (Button: [Login])', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false, isLoading: false, error: null });
    localStorageMock.clear();
  });

  it('[Login Button] — success sets token, user, and isAuthenticated', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue(mockLoginResponse);

    const success = await useAuthStore.getState().login('teacher@school.edu', 'Test@1234');

    expect(success).toBe(true);
    const { token, user, isAuthenticated, isLoading, error } = useAuthStore.getState();
    expect(isAuthenticated).toBe(true);
    expect(token).toBe('mock_jwt_token_abc123');
    expect(user?.email).toBe('teacher@school.edu');
    expect(user?.role).toBe('teacher');
    expect(isLoading).toBe(false);
    expect(error).toBeNull();
  });

  it('[Login Button] — success persists token to localStorage', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue(mockLoginResponse);
    await useAuthStore.getState().login('teacher@school.edu', 'Test@1234');

    expect(localStorageMock.getItem('pb_token')).toBe('mock_jwt_token_abc123');
    expect(localStorageMock.getItem('pb_user')).toBeTruthy();
  });

  it('[Login Button] — wrong password returns false and sets error', async () => {
    mockedAxios.post = vi.fn().mockRejectedValue({
      response: { data: { detail: 'Invalid email or password' } },
    });

    const success = await useAuthStore.getState().login('teacher@school.edu', 'WrongPass!');

    expect(success).toBe(false);
    const { isAuthenticated, token, error } = useAuthStore.getState();
    expect(isAuthenticated).toBe(false);
    expect(token).toBeNull();
    expect(error).toBe('Invalid email or password');
  });

  it('[Login Button] — network failure shows generic error message', async () => {
    mockedAxios.post = vi.fn().mockRejectedValue(new Error('Network Error'));

    const success = await useAuthStore.getState().login('teacher@school.edu', 'Any@pass');

    expect(success).toBe(false);
    expect(useAuthStore.getState().error).toContain('Login failed');
  });

  it('[Login Button] — isLoading is true during login, then false after', async () => {
    let loadingDuringRequest = false;
    mockedAxios.post = vi.fn().mockImplementation(() => {
      loadingDuringRequest = useAuthStore.getState().isLoading;
      return Promise.resolve(mockLoginResponse);
    });

    await useAuthStore.getState().login('teacher@school.edu', 'Test@1234');

    expect(loadingDuringRequest).toBe(true);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('[Login Button] — getAuthHeaders() returns Bearer token after login', async () => {
    mockedAxios.post = vi.fn().mockResolvedValue(mockLoginResponse);
    await useAuthStore.getState().login('teacher@school.edu', 'Test@1234');

    const headers = useAuthStore.getState().getAuthHeaders();
    expect(headers).toEqual({ Authorization: 'Bearer mock_jwt_token_abc123' });
  });
});


describe('AuthStore — Logout Flow (Button: [Logout])', () => {
  beforeEach(async () => {
    mockedAxios.post = vi.fn().mockResolvedValue(mockLoginResponse);
    await useAuthStore.getState().login('teacher@school.edu', 'Test@1234');
  });

  it('[Logout Button] — clears token, user, and isAuthenticated', () => {
    useAuthStore.getState().logout();
    const { token, user, isAuthenticated } = useAuthStore.getState();
    expect(token).toBeNull();
    expect(user).toBeNull();
    expect(isAuthenticated).toBe(false);
  });

  it('[Logout Button] — removes token from localStorage', () => {
    useAuthStore.getState().logout();
    expect(localStorageMock.getItem('pb_token')).toBeNull();
    expect(localStorageMock.getItem('pb_user')).toBeNull();
  });

  it('[Logout Button] — getAuthHeaders() returns empty object after logout', () => {
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().getAuthHeaders()).toEqual({});
  });
});


describe('AuthStore — Session Restore (checkAuth)', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false });
    localStorageMock.clear();
  });

  it('checkAuth() restores session from valid localStorage data', () => {
    const storedUser = {
      id: 'user-001',
      email: 'teacher@school.edu',
      full_name: 'Test Teacher',
      role: 'teacher',
    };
    localStorageMock.setItem('pb_token', 'restored_token');
    localStorageMock.setItem('pb_user', JSON.stringify(storedUser));

    mockedAxios.get = vi.fn().mockRejectedValue(new Error('Network'));

    useAuthStore.getState().checkAuth();

    const { token, user, isAuthenticated } = useAuthStore.getState();
    expect(isAuthenticated).toBe(true);
    expect(token).toBe('restored_token');
    expect(user?.email).toBe('teacher@school.edu');
  });

  it('checkAuth() clears state when no localStorage data exists', () => {
    useAuthStore.getState().checkAuth();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('checkAuth() handles corrupted localStorage user data gracefully', () => {
    localStorageMock.setItem('pb_token', 'some_token');
    localStorageMock.setItem('pb_user', '{ INVALID JSON {{{{');

    expect(() => useAuthStore.getState().checkAuth()).not.toThrow();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});


describe('AuthStore — Role Navigation Guards', () => {
  it('teacher role should have teacher-specific nav items', () => {
    const teacherNav = ROLE_NAV_ITEMS['teacher'];
    expect(teacherNav).toContain('attendance');
    expect(teacherNav).toContain('timetable');
    expect(teacherNav).toContain('my_class');
    // Teacher should NOT have admin items
    expect(teacherNav).not.toContain('revenue');
    expect(teacherNav).not.toContain('salary_approvals');
  });

  it('student role should have student-specific nav items only', () => {
    const studentNav = ROLE_NAV_ITEMS['student'];
    expect(studentNav).toContain('fees');
    expect(studentNav).toContain('timetable');
    expect(studentNav).not.toContain('admin_documents');
    expect(studentNav).not.toContain('salary_approvals');
  });

  it('warden role should have hostel-specific items', () => {
    const wardenNav = ROLE_NAV_ITEMS['warden'];
    expect(wardenNav).toContain('hostel_rooms');
    expect(wardenNav).toContain('outpasses');
    expect(wardenNav).toContain('warden_incidents');
    expect(wardenNav).toContain('warden_visitors');
  });

  it('transport role should have transport-specific items', () => {
    const transportNav = ROLE_NAV_ITEMS['transport'];
    expect(transportNav).toContain('transport_dashboard');
    expect(transportNav).toContain('transport_routes');
    expect(transportNav).toContain('transport_fleet');
    expect(transportNav).not.toContain('fees');
  });
});
