"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, UserRole, ROLE_LABELS } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mx-auto"></div>
          <p className="text-gray-400 text-sm">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Role access check bypassed as per request
  // if (allowedRoles && !allowedRoles.includes(user.role)) { ... }

  return <>{children}</>;
}
