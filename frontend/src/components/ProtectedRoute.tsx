"use client";

import { useEffect, useState } from 'react';
import { useAuthStore, UserRole } from '@/store/authStore';

import { useRouter } from 'next/navigation';
import PageLoader from '@/components/PageLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    checkAuth();
    setHasChecked(true);
  }, [checkAuth]);

  useEffect(() => {
    if (hasChecked && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, hasChecked, router]);

  if (!hasChecked || !isAuthenticated || !user) {
    return <PageLoader />;
  }

  return <>{children}</>;
}
