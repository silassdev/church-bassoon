'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiShield, FiUser, FiLogOut, FiLayout } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';
import HeaderNotifications from '@/components/ui/HeaderNotifications';


export default function Header() {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { label: 'Platform', href: '/' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-sm ${isScrolled ? 'bg-white/70 dark:bg-slate-900/70 shadow-sm' : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                <FiShield className="w-6 h-6" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
                  ChurchDev
                </span>
                <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-500 -mt-1">
                  Ministry Excellence
                </div>
              </div>
            </Link>
          </div>

          {/* Middle: nav (desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-sky-600 transition-colors"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-sky-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Right: actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <ThemeToggle />

              {session ? (
                <div className="flex items-center gap-4">
                  <Link
                    href={`/dashboard/${(session.user as any).role || 'member'}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-bold"
                  >
                    <FiLayout className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    title="Sign Out"
                  >
                    <FiLogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all text-sm font-bold shadow-lg shadow-indigo-600/20"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              onClick={() => setMobileOpen((s) => !s)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-3 pb-4 space-y-3">
                <div className="px-4">
                  <nav className="flex flex-col gap-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        {item.label}
                      </Link>
                    ))}

                    <Link
                      href={`/dashboard/${(session?.user as any)?.role || 'member'}`}
                      onClick={() => setMobileOpen(false)}
                      className="mt-2 inline-flex items-center justify-center px-3 py-2 rounded-md bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 transition"
                    >
                      Dashboard
                    </Link>

                    {session ? (
                      <>
                        <div className="px-3 py-2 flex items-center gap-3 border-t border-slate-200 dark:border-slate-800 mt-2">
                          {session.user?.image && (
                            <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
                          )}
                          <span className="text-sm font-medium text-slate-700 dark:text-gray-200">
                            {session.user?.name || 'User'}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setMobileOpen(false);
                            signOut({ callbackUrl: '/' });
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        >
                          <FiLogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/auth/signin"
                        onClick={() => setMobileOpen(false)}
                        className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <FiUser className="w-4 h-4" />
                        Sign in
                      </Link>
                    )}

                    <div className="mt-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                      <ThemeToggle />
                    </div>
                  </nav>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
