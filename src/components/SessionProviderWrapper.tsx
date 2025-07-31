
// components/SessionProviderWrapper.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface SessionProviderWrapperProps {
  children: ReactNode;
}

export default function SessionProviderWrapper({ children }: SessionProviderWrapperProps) {
  return (
    <SessionProvider
      // Enable refetch on window focus for better UX
      refetchOnWindowFocus={true}
      // Refetch interval (5 minutes)
      refetchInterval={5 * 60}
    >
      {children}
    </SessionProvider>
  );
}