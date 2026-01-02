"use client";

import { motion } from "framer-motion";
import {
  FiShield,
  FiCreditCard,
  FiUsers,
  FiMessageSquare,
  FiCalendar,
  FiTrendingUp,
  FiAward,
  FiArrowRight,
  FiCheck
} from "react-icons/fi";
import Link from "next/link";

export default function Home() {
  const features = [
    {
      icon: FiCreditCard,
      label: "Secure Contributions",
      value: "Manage tithes, offerings, and special gifts with integrated payment tracking.",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: FiUsers,
      label: "Tiered Management",
      value: "Hierarchical access for Admins, Coordinators, and Members to ensure security.",
      color: "from-indigo-500 to-blue-600"
    },
    {
      icon: FiMessageSquare,
      label: "Support System",
      value: "Efficient ticket management system for handling member requests and inquiries.",
      color: "from-slate-500 to-slate-700"
    },
    {
      icon: FiCalendar,
      label: "Event Coordination",
      value: "Plan and manage church events, volunteer schedules, and community activities.",
      color: "from-amber-500 to-orange-600"
    },
  ];

  const userTiers = [
    {
      role: "Admin",
      description: "Complete oversight of the platform, transactions, and user hierarchy.",
      color: "border-indigo-500/50 bg-indigo-500/5",
      iconColor: "text-indigo-500",
      features: ["Full Financial Oversight", "User Approval Management", "System Configuration", "Advanced Analytics"]
    },
    {
      role: "Coordinator",
      description: "Dedicated managers for support tickets and specific church departments.",
      color: "border-emerald-500/50 bg-emerald-500/5",
      iconColor: "text-emerald-500",
      features: ["Ticket Queue Management", "Member Engagement", "Event Scheduling", "Department Reports"]
    },
    {
      role: "Member",
      description: "Church participants with access to their giving history and support.",
      color: "border-slate-500/50 bg-slate-500/5",
      iconColor: "text-slate-500",
      features: ["Personal Giving History", "Instant Support Tickets", "Event Registration", "Secure Profile Management"]
    }
  ];

  return (
    <main className="relative overflow-hidden min-h-screen">
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10 bg-slate-50 dark:bg-slate-950">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Hero Section */}
      <section className="container pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full glass border border-indigo-500/20 bg-indigo-500/5 backdrop-blur-sm"
          >
            <FiShield className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">Secure Church Management</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight"
          >
            Empowering Your Ministry with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-emerald-600 to-indigo-600">
              Excellence.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            A unified management and payment platform designed to deepen engagement,
            streamline administration, and secure your church's legacy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/auth/register"
              className="px-10 py-5 rounded-2xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 group"
            >
              Get Started
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/signin"
              className="px-10 py-5 rounded-2xl glass border border-slate-200 dark:border-slate-800 font-bold text-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Modern Dashboard Preview Fragment */}
      <section className="container pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative p-2 md:p-4 rounded-[2.5rem] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 shadow-3xl"
        >
          <div className="rounded-[1.5rem] overflow-hidden bg-white dark:bg-slate-950 border border-white/20 shadow-inner">
            <div className="grid md:grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 h-64 md:h-96">
              <div className="h-full bg-slate-50/50 dark:bg-slate-900/50 p-6">
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 w-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 p-8 flex flex-col items-center justify-center text-center">
                <FiTrendingUp className="text-5xl text-emerald-500 mb-4" />
                <h3 className="text-xl font-bold mb-2">Real-time Financial Insights</h3>
                <p className="text-slate-500 max-w-sm">Every contribution is tracked and visualized for total transparency.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container py-24 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">Built for Every Need</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto italic">Everything you need to manage your church effectively.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-3xl glass border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform text-white`}>
                <feature.icon size={24} />
              </div>
              <h3 className="font-bold text-xl mb-3">{feature.label}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.value}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* User Tiers Section */}
      <section className="container py-24 bg-slate-100/50 dark:bg-slate-900/50 rounded-[3rem] my-24 border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4">Hierarchical Excellence</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">Tailored interfaces for every role within your organization.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          {userTiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`p-10 rounded-[2.5rem] border ${tier.color} flex flex-col h-full`}
            >
              <h3 className={`text-2xl font-black mb-4 ${tier.iconColor}`}>{tier.role}</h3>
              <p className="text-slate-500 dark:text-slate-300 text-sm mb-8 leading-relaxed">{tier.description}</p>

              <div className="space-y-4 mt-auto">
                {tier.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-medium">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${tier.iconColor} bg-white dark:bg-slate-800 shadow-sm`}>
                      <FiCheck size={12} strokeWidth={4} />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container pb-32 pt-12">
        <div className="relative p-12 md:p-24 rounded-[3rem] overflow-hidden bg-slate-900 text-white text-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900 via-emerald-900/50 to-indigo-900 opacity-50" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-6">Ready to Transform Your Church?</h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">Join a growing community of churches using modern technology to fulfill their mission.</p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 px-12 py-5 rounded-2xl bg-white text-indigo-900 font-bold text-lg hover:bg-slate-100 transition-all shadow-2xl"
            >
              Start for Free
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}