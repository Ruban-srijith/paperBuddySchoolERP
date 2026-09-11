"use client";

import { useEffect, useState } from 'react';
import { useAuthStore, UserRole } from '@/store/authStore';

import { useRouter } from 'next/navigation';
import PageLoader from '@/components/PageLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: string;
  requirePlatformAdmin?: boolean;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  requiredPermission,
  requirePlatformAdmin = false
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, checkAuth, hasPermission, hasAnyRole } = useAuthStore();
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

  if (requirePlatformAdmin && user.platform_role !== 'platform_super_admin') {
    router.replace('/dashboard');
    return null;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    router.replace('/dashboard');
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
    router.replace('/dashboard');
    return null;
  }

  return <>{children}</>;
}
