'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthRedirectHandler() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const redirect = searchParams.get('redirect') || '/admin';
      
      // Clear the browser history to prevent back button issues
      // Replace the current entry and clear any OAuth-related history
      window.history.replaceState(null, '', redirect);
      
      // Navigate to the target page
      router.replace(redirect);
    }
  }, [session, status, router, searchParams]);

  return null; // This component doesn't render anything
}