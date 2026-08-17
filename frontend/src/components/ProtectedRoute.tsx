"use client";

import { useEffect, useState } from 'react';
import { useAuthStore, UserRole } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    checkAuth();
    setHasChecked(true);
  }, [checkAuth]);

  useEffect(() => {
    if (hasChecked && !isAuthenticated) {
      window.location.replace('/login');
    }
  }, [isAuthenticated, hasChecked]);

  if (!hasChecked || !isAuthenticated || !user) {
    return null;
  }

  return <>{children}</>;
}
