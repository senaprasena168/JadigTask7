'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { loginSuccess, initializeAuth } from '@/lib/features/auth/authSlice';

interface AdminProtectionProps {
  children: React.ReactNode;
}

export default function AdminProtection({ children }: AdminProtectionProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: session, status: sessionStatus } = useSession();
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Redux auth state on component mount
  useEffect(() => {
    dispatch(initializeAuth());
    setIsInitialized(true);
  }, [dispatch]);

  // Sync NextAuth session with Redux store
  useEffect(() => {
    if (sessionStatus === 'loading' || !isInitialized) return;

    if (session?.user && sessionStatus === 'authenticated') {
      // User is authenticated via NextAuth, sync with Redux
      dispatch(
        loginSuccess({
          username: session.user.name || session.user.email || 'User',
          email: session.user.email || '',
          role: (session.user as { role?: string }).role || 'admin',
        })
      );
    }
  }, [session, sessionStatus, dispatch, isInitialized]);

  // Handle authentication check and redirect
  useEffect(() => {
    if (sessionStatus === 'loading' || !isInitialized) return;

    // Check NextAuth session first
    if (session?.user && sessionStatus === 'authenticated') {
      // User is authenticated via NextAuth, allow access
      return;
    }

    // Check Redux auth state for manual login
    if (isAuthenticated && user) {
      // User is authenticated via manual login, allow access
      return;
    }

    // No valid authentication found, redirect to login
    console.log('🔒 No valid authentication found, redirecting to login');
    router.push('/login?redirect=/admin');
  }, [session, sessionStatus, isAuthenticated, user, router, isInitialized]);

  // Show loading while checking authentication
  if (sessionStatus === 'loading' || !isInitialized || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Check if user is authenticated (either via NextAuth or manual login)
  const isUserAuthenticated =
    (session?.user && sessionStatus === 'authenticated') ||
    (isAuthenticated && user);

  if (!isUserAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
}