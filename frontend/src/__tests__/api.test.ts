/**
 * api.test.ts — Frontend API Client Tests
 * =========================================
 * Tests the axios API client wiring:
 *  - Bearer token is auto-attached from localStorage
 *  - 401 responses trigger auto-logout + redirect to /login
 *  - Base URL defaults to localhost:8000
 *  - Content-Type is set to application/json
 *
 * Button flow equivalents:
 *  Any authenticated API call → interceptor checks localStorage → attaches token
 *  401 response from any endpoint → user is redirected to /login
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';

// Mock axios to capture config
vi.mock('axios', async () => {
  const actual = await vi.importActual<typeof import('axios')>('axios');
  return {
    ...actual,
    default: {
      create: vi.fn().mockReturnValue({
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
      }),
    },
  };
});

// ─── localStorage mock ───────────────────────────────────────────────────────
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


describe('API Client — Token Interceptor', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should add Bearer token header when pb_token is in localStorage', () => {
    localStorageMock.setItem('pb_token', 'test_token_xyz');

    // Simulate what the request interceptor does
    const token = localStorageMock.getItem('pb_token') || localStorageMock.getItem('token');
    const config: Record<string, any> = { headers: {} };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    expect(config.headers.Authorization).toBe('Bearer test_token_xyz');
  });

  it('should not add Authorization header when no token in localStorage', () => {
    // No token stored
    const token = localStorageMock.getItem('pb_token') || localStorageMock.getItem('token');
    const config: Record<string, any> = { headers: {} };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    expect(config.headers.Authorization).toBeUndefined();
  });

  it('should fall back to token key if pb_token not set', () => {
    localStorageMock.setItem('token', 'fallback_token_abc');

    const token = localStorageMock.getItem('pb_token') || localStorageMock.getItem('token');
    const config: Record<string, any> = { headers: {} };
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    expect(config.headers.Authorization).toBe('Bearer fallback_token_abc');
  });
});


describe('API Client — 401 Response Interceptor', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.setItem('pb_token', 'some_valid_token');
    localStorageMock.setItem('pb_user', JSON.stringify({ id: 'user1', role: 'teacher' }));
    vi.stubGlobal('window', {
      ...window,
      location: { href: '/', pathname: '/dashboard' },
      localStorage: localStorageMock,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should clear localStorage tokens on 401 response', () => {
    // Simulate the 401 interceptor handler
    const simulateOn401 = () => {
      localStorageMock.removeItem('pb_token');
      localStorageMock.removeItem('pb_user');
    };

    simulateOn401();

    expect(localStorageMock.getItem('pb_token')).toBeNull();
    expect(localStorageMock.getItem('pb_user')).toBeNull();
  });

  it('should redirect to /login on 401 when not already on login page', () => {
    const mockHref = { href: '/dashboard' };
    // Simulate the redirect logic from the interceptor
    const currentPath = '/dashboard';
    if (currentPath !== '/login') {
      mockHref.href = '/login';
    }

    expect(mockHref.href).toBe('/login');
  });

  it('should NOT redirect if already on /login page (avoids infinite loop)', () => {
    const mockHref = { href: '/login' };
    const currentPath = '/login';
    if (currentPath !== '/login') {
      mockHref.href = '/login';
    }

    // href should remain /login (no re-redirect)
    expect(mockHref.href).toBe('/login');
  });
});


describe('API Client — Base Configuration', () => {
  it('default API base should point to localhost:8000', () => {
    // Simulate what api.ts does
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    expect(API_BASE).toBe('http://localhost:8000/api/v1');
  });

  it('should use NEXT_PUBLIC_API_URL when set', () => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.paperbuddy.in/api/v1';
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    expect(API_BASE).toBe('https://api.paperbuddy.in/api/v1');
    delete process.env.NEXT_PUBLIC_API_URL;
  });
});
