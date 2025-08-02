'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface BackdoorProps {
  onBackdoorActivated?: () => void;
}

export function Backdoor({ onBackdoorActivated }: BackdoorProps) {
  const router = useRouter();

  const handleBackdoorLogin = async () => {
    try {
      // Show success toast
      if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast.showSuccess('🐱 Admin backdoor activated!');
      }
      
      // Call the callback if provided
      if (onBackdoorActivated) {
        onBackdoorActivated();
      }
      
      // Simulate a delay for the backdoor effect
      setTimeout(async () => {
        try {
          // Sign in with the specific admin credentials
          const result = await signIn('credentials', {
            email: 'aingmeongshop@gmail.com',
            password: 'aingmeong',
            redirect: false,
          });
          
          if (result?.ok) {
            // Redirect to admin panel
            router.push('/admin');
            if (typeof window !== 'undefined' && (window as any).toast) {
              (window as any).toast.showSuccess('Welcome Admin!');
            }
          } else {
            // If credentials login fails, show error
            if (typeof window !== 'undefined' && (window as any).toast) {
              (window as any).toast.showError('Backdoor authentication failed');
            }
          }
        } catch (error) {
          console.error('Backdoor authentication error:', error);
          if (typeof window !== 'undefined' && (window as any).toast) {
            (window as any).toast.showError('Backdoor error occurred');
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('Backdoor activation error:', error);
      if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast.showError('Backdoor activation failed');
      }
    }
  };

  return (
    <div 
      className="absolute inset-0 cursor-pointer z-10"
      onClick={handleBackdoorLogin}
      title="🐱 Secret Admin Access"
      style={{
        background: 'transparent',
      }}
    />
  );
}