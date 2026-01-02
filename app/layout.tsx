import './globals.css';
import React from 'react';
import Header from './components/Header';
import Link from 'next/link';
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

              <footer className="mt-20 py-16 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                <div className="container px-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-slate-200 dark:border-slate-800">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                      <div className="font-black text-3xl tracking-tighter text-indigo-600">ChurchDev<span className="text-emerald-500">.</span></div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm italic">
                        "Empowering modern ministries through secure technology and seamless administration."
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-sm uppercase tracking-widest text-indigo-600">Platform</h4>
                      <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                        <li>
                          <Link href="/about" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                            Our Mission
                          </Link>
                        </li>
                        <li>
                          <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                            Support
                          </Link>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-sm uppercase tracking-widest text-indigo-600">Legal</h4>
                      <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                        <li>
                          <Link href="/privacy" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                            Privacy Policy
                          </Link>
                        </li>
                        <li>
                          <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
                            Terms of Service
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-center pt-8 gap-4 text-xs font-medium text-slate-400 uppercase tracking-tighter">
                    <div>© {new Date().getFullYear()} ChurchDev Platform. All rights reserved.</div>
                    <div className="flex gap-8">
                      Built with excellence for modern faith communities.
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
