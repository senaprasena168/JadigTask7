import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';
import Navbar from '@/components/Navbar';
import { ToastContainer } from '@/components/Toast';
import { TestToastButton } from '@/components/TestToastButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cat Food Store',
  description: 'Premium cat food and accessories for your feline friends',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <SessionProviderWrapper>
          <Providers>
            <Navbar />
            <main>{children}</main>
            <ToastContainer />
            <TestToastButton />
          </Providers>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
