'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface AdminProtectionProps {
  children: React.ReactNode;
}

export default function AdminProtection({ children }: AdminProtectionProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Handle authentication and admin role check
  useEffect(() => {
    if (status === 'loading') return; // Still loading session

    // Check NextAuth session
    if (!session?.user) {
      // No valid authentication found, redirect to login
      console.log('🔒 No valid authentication found, redirecting to login');
      router.push('/login?redirect=/admin');
      return;
    }

    // Check if user has admin role
    if (session.user.role !== 'admin') {
      // User is authenticated but not admin, redirect to home
      console.log('🔒 User authenticated but not admin, redirecting to home');
      router.push('/');
      return;
    }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and has admin role
  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check if user has admin role
  if (session.user.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page. Redirecting to home...</p>
        </div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
}