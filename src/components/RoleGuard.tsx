import type React from 'react';
import { getStoredAuth } from '../store/authStore';

interface Props {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children, fallback }: Props) {
  const auth = getStoredAuth();
  const userRole = auth?.user?.role;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return fallback || (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
