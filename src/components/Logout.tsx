'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface LogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Sign out using NextAuth
      await signOut({
        redirect: false, // Don't auto-redirect
      });
      
      // Manual redirect to prevent back button issues
      window.location.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback redirect
      window.location.replace('/login');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={className || "bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"}
    >
      {children || 'Logout'}
    </button>
  );
}