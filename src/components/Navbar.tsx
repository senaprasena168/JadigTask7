'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { logout, loginSuccess } from '@/lib/features/auth/authSlice';
import clsx from 'clsx';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Backdoor login function
  const handleBackdoorLogin = async () => {
    if (!isAuthenticated) {
      // Direct login without going through login page
      dispatch(loginSuccess({
        username: 'Admin Cat',
        email: 'admin@catfoodstore.com',
        role: 'admin'
      }));
      router.push('/admin');
    }
  };

  const handleLogout = async () => {
    if (session) {
      await signOut({ redirect: false });
    }
    dispatch(logout());
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/profile', label: 'Profile' },
    { href: '/products', label: 'Products' },
    { href: '/admin', label: 'Admin' }, // Always show Admin menu
    ...(!isAuthenticated && !session ? [{ href: '/login', label: 'Login' }] : []),
  ];

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            {/* Profile picture as backdoor login button */}
            <button
              onClick={handleBackdoorLogin}
              className="w-10 h-10 rounded-full overflow-hidden hover:ring-2 hover:ring-blue-200 transition-all duration-200 transform hover:scale-105"
              title={isAuthenticated ? "Already logged in" : "Click for quick admin access"}
            >
              <Image
                src="/profile-cat.png"
                alt="Profile Cat"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </button>
            
            <Link
              href="/"
              className="text-xl font-bold hover:text-blue-200 transition-colors"
            >
              Cat Food Store
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-6">
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
          </div>

          {/* User info and logout */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-sm text-blue-200 text-right">
                <div className="font-medium">{user?.username}</div>
                <div className="text-xs opacity-80">{user?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-white hover:text-blue-200 p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
