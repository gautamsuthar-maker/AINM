import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-primary',
});

export const metadata: Metadata = {
  title: 'AI Marketing Platform',
  description: 'Next-gen AI Native Marketing SaaS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="antialiased font-sans">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
