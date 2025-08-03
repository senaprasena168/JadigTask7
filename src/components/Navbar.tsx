'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import clsx from 'clsx';
import LoginModal from './LoginModal';
import { useLoginModal } from '../hooks/useLoginModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isOpen, openModal, closeModal } = useLoginModal();

  const handleLogout = async () => {
    try {
      await signOut({
        redirect: false,
        callbackUrl: '/',
      });
      // Use window.location.replace to prevent back button issues
      window.location.replace('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback redirect
      window.location.replace('/');
    }
  };

  const handleLoginSuccess = () => {
    // No need to reload - let NextAuth handle session updates naturally
    // The useSession hook will automatically update when the session changes
  };

  // Check if user is authenticated and is admin
  const isAuthenticated = status === 'authenticated' && session?.user;
  const isAdmin = isAuthenticated && session?.user?.role === 'admin';

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/profile', label: 'Profile' },
    { href: '/products', label: 'Products' },
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []), // Only show Admin menu to admin users
  ];

  return (
    <nav className='bg-blue-600 text-white shadow-lg'>
      <div className='max-w-6xl mx-auto px-4'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex items-center space-x-3'>
            {/* Profile picture */}
            <div className='w-10 h-10 rounded-full overflow-hidden relative hover:ring-2 hover:ring-yellow-400 transition-all duration-200'>
              <Image
                src='/profile-cat.png'
                alt='Profile Cat'
                width={40}
                height={40}
                className='w-full h-full object-cover hover:scale-110 transition-transform duration-200'
              />
            </div>

            <Link
              href='/'
              className='text-xl font-bold hover:text-blue-200 transition-colors'
            >
              Aing Meong Shop
            </Link>
          </div>

          <div className='hidden md:flex space-x-6'>
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap',
                  'hover:text-blue-200',
                  pathname === href
                    ? 'text-blue-200 border-b-2 border-blue-200'
                    : 'text-white'
                )}
              >
                {label}
              </Link>
            ))}
            
            {/* Login button for unauthenticated users */}
            {!isAuthenticated && (
              <button
                onClick={openModal}
                className='px-4 py-2 text-sm font-medium transition-colors relative whitespace-nowrap text-white hover:text-blue-200'
              >
                Login
              </button>
            )}
          </div>

          {/* User info and logout */}
          {isAuthenticated && (
            <div className='hidden md:flex items-center space-x-4'>
              {/* Admin badge - only show for admin users */}
              {isAdmin && (
                <div className='text-yellow-400 font-bold text-sm px-2 py-1 bg-red-100 bg-opacity-20 rounded border border-red-400'>
                  ADMIN
                </div>
              )}
              <div className='text-sm text-blue-200 text-right'>
                <div className='font-medium'>
                  {session.user.name || session.user.email}
                </div>
                <div className='text-xs opacity-80'>{session.user.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className='bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm transition-colors'
              >
                Logout
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <div className='md:hidden'>
            <button className='text-white hover:text-blue-200 p-2'>
              <svg
                className='h-6 w-6'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Login Modal */}
      <LoginModal
        isOpen={isOpen}
        onClose={closeModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </nav>
  );
}
