import './globals.css';
import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import { ThemeProvider } from './components/ThemeProvider';
import SessionProvider from './components/SessionProvider';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'ChurchDev — Ministry Excellence Platform',
  description:
    'A robust church management and payment platform for modern ministries. Manage tithes, users, and member support with ease.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased text-slate-900 dark:text-gray-100 overflow-x-hidden transition-colors duration-300 bg-white dark:bg-slate-900">
        <SessionProvider>
          <ThemeProvider>
            <Toaster position="top-right" />
            <div className="flex flex-col min-h-screen">
              <Header />

              <main className="flex-1">
                {children}
              </main>

              <Footer />
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
