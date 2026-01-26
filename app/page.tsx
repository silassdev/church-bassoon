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
import { useState, useEffect } from "react";
import EventModal from "@/app/components/ui/EventModal";
import { Calendar, MapPin, ExternalLink, Eye } from 'lucide-react';

// Latest Events Component
function LatestEventsSection() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch('/api/events');
        if (res.ok) {
          const allEvents = await res.json();
          const now = Date.now();
          const upcoming = allEvents
            .filter((e: any) => new Date(e.endAt).getTime() > now)
            .slice(0, 2);
          setEvents(upcoming);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  if (events.length === 0 && !loading) return null;

  return (
    <>
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">Upcoming Events</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Join us for these exciting upcoming activities and fellowship opportunities.</p>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[1, 2].map((i) => (
              <div key={i} className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {events.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedEvent(event)}
                className="group relative h-96 rounded-3xl overflow-hidden cursor-pointer"
              >
                {event.bannerUrl ? (
                  <img
                    src={event.bannerUrl}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-emerald-500" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-3xl font-bold mb-3">{event.title}</h3>
                  {event.description && (
                    <p className="text-slate-200 text-sm mb-4 line-clamp-2">{event.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-slate-200 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(event.startAt).toLocaleDateString()}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        {event.location}
                      </span>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-indigo-300 text-sm font-bold">
                    <Eye size={16} />
                    Click to view details
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
          >
            View All Events
            <FiArrowRight />
          </Link>
        </div>
      </section>

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </>
  );
}

// Latest Blogs Component
function LatestBlogsSection() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch('/api/posts?status=published&limit=3');
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (err) {
        console.error('Failed to load posts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  if (posts.length === 0 && !loading) return null;

  return (
    <section className="container py-24 border-t border-slate-200/50 dark:border-slate-800/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-black mb-4">Latest Stories</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Stay updated with the latest news, insights, and inspirations from our community.</p>
      </motion.div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {posts.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="h-48 overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                {post.featureImage ? (
                  <img
                    src={post.featureImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📝</div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">{post.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4 opacity-80">{post.body?.replace(/[#*`]/g, '').substring(0, 100)}...</p>
                <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                  <Link href={`/posts/${post.slug}`} className="text-indigo-600 hover:underline">Read More</Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="text-center">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 px-8 py-4 glass border border-slate-200 dark:border-slate-800 font-bold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
        >
          View All Stories
          <FiArrowRight />
        </Link>
      </div>
    </section>
  );
}

// Featured Give Section
function FeaturedGiveSection() {
  const [options, setOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOptions() {
      try {
        const res = await fetch('/api/payment-options');
        if (res.ok) {
          const data = await res.json();
          setOptions(data.slice(0, 2));
        }
      } catch (err) {
        console.error('Failed to load options:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOptions();
  }, []);

  if (options.length === 0 && !loading) return null;

  return (
    <section className="container py-24 bg-slate-50/50 dark:bg-slate-900/50 rounded-[3rem] my-12 border border-slate-100 dark:border-slate-800/50 shadow-inner">
      <div className="text-center mb-16 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]"
        >
          Partner with us
        </motion.div>
        <h2 className="text-4xl md:text-5xl font-black mb-4">Support Our Mission</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Your contributions help us reach more people and deepen our community impact.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto px-6 mb-12">
        {loading ? (
          [1, 2].map(i => <div key={i} className="h-64 bg-white dark:bg-slate-800 rounded-3xl animate-pulse border border-slate-100 dark:border-slate-800" />)
        ) : (
          options.map((opt, index) => (
            <motion.div
              key={opt._id}
              initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="group bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-indigo-500/5 hover:border-indigo-500/30 transition-all flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/40 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                <FiCreditCard size={32} />
              </div>
              <h3 className="text-2xl font-black mb-2 text-slate-900 dark:text-white uppercase tracking-tight">{opt.title}</h3>
              <p className="text-sm text-slate-500 mb-8 line-clamp-2">{opt.description || 'Support our ongoing ministry and outreach efforts.'}</p>
              <Link
                href="/give"
                className="mt-auto px-8 py-3 bg-slate-900 dark:bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-black dark:hover:bg-indigo-700 transition-all shadow-lg"
              >
                Contribute Now
              </Link>
            </motion.div>
          ))
        )}
      </div>

      <div className="text-center">
        <Link
          href="/give"
          className="text-sm font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-all flex items-center justify-center gap-2 group"
        >
          View All Payment Options
          <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

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

  const galleryImages = [
    {
      title: "Sunday Service",
      description: "Join us every Sunday for powerful worship and biblical teaching",
      link: "/events",
      image: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&q=80"
    },
    {
      title: "Community Outreach",
      description: "Making a difference in our local community through love and service",
      link: "/about",
      image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80"
    },
    {
      title: "Youth Programs",
      description: "Empowering the next generation with faith-based mentorship",
      link: "/events",
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80"
    }
  ];

  const carouselImages = [
    "https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1200&q=80",
    "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1200&q=80",
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&q=80",
    "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&q=80"
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

      {/* NEW: Large Image Gallery Section */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">Moments That Matter</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Experience the heart of our church community through these special moments.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {galleryImages.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative h-96 rounded-3xl overflow-hidden"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform">
                <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                <p className="text-slate-200 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity">{item.description}</p>
                <Link
                  href={item.link}
                  className="inline-flex items-center gap-2 text-sm font-bold text-indigo-300 hover:text-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Learn More <FiArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
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

      {/* NEW: Fade-in Hero Image Section */}
      <section className="container py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1507692049790-de58290a4334?w=1000&q=80"
              alt="Church Community"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 to-transparent" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 1 }}
            className="space-y-6"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="text-4xl md:text-5xl font-black leading-tight"
            >
              Building Faith,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-600">
                Together
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed"
            >
              We believe in creating a welcoming environment where everyone can grow in their faith journey.
              Our community is built on love, service, and the transformative power of God's word.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1 }}
              className="text-slate-500 dark:text-slate-400"
            >
              Join us in making a difference in our community and beyond. Experience genuine fellowship,
              inspiring worship, and practical teaching that will strengthen your walk with Christ.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Image Carousel */}
      <section className="container py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">Church Life in Motion</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Witness the vibrant spirit of our community through these snapshots.</p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto">
          <div className="relative h-96 md:h-[500px] rounded-3xl overflow-hidden">
            {carouselImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: currentSlide === index ? 1 : 0,
                  scale: currentSlide === index ? 1 : 1.1
                }}
                transition={{ duration: 0.7 }}
                className="absolute inset-0"
              >
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
              </motion.div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${currentSlide === index
                  ? 'bg-indigo-600 w-8'
                  : 'bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Second Image Gallery */}
      <section className="container py-24">
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative h-96 md:h-[500px] rounded-3xl overflow-hidden group"
          >
            <img
              src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1000&q=80"
              alt="Worship Experience"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h3 className="text-3xl font-bold mb-2">Worship Experience</h3>
              <p className="text-slate-200">Encounter God's presence through powerful worship</p>
            </div>
          </motion.div>

          <div className="grid grid-rows-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative h-full rounded-3xl overflow-hidden group"
            >
              <img
                src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80"
                alt="Prayer Gathering"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold">Prayer Gatherings</h3>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative h-full rounded-3xl overflow-hidden group"
            >
              <img
                src="https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&q=80"
                alt="Fellowship"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold">Community Fellowship</h3>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Latest Events Section */}
      <LatestEventsSection />

      {/* Featured Give Section */}
      <FeaturedGiveSection />

      {/* Latest Blogs Section */}
      <LatestBlogsSection />

      {/* Weekly Church Schedule */}
      <section className="container pb-32 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">Weekly Church Activities</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Join us throughout the week for worship, fellowship, and spiritual growth.</p>
        </motion.div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 to-emerald-600 text-white">
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Day</th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider hidden md:table-cell">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {/* Sunday */}
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0 }}
                  className="bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">Sunday</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">8:00 AM</td>
                  <td className="px-6 py-4 font-medium">First Service</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">Main Sanctuary</td>
                </motion.tr>
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 }}
                  className="bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400"></td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">10:00 AM</td>
                  <td className="px-6 py-4 font-medium">Second Service</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">Main Sanctuary</td>
                </motion.tr>

                {/* Monday */}
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">Monday</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">6:00 PM</td>
                  <td className="px-6 py-4 font-medium">Prayer Meeting</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">Prayer Room</td>
                </motion.tr>

                {/* Tuesday */}
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 }}
                  className="bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-amber-600 dark:text-amber-400">Tuesday</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">7:00 PM</td>
                  <td className="px-6 py-4 font-medium">Bible Study</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">Fellowship Hall</td>
                </motion.tr>

                {/* Wednesday */}
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-rose-600 dark:text-rose-400">Wednesday</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">6:30 PM</td>
                  <td className="px-6 py-4 font-medium">Midweek Service</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">Main Sanctuary</td>
                </motion.tr>

                {/* Thursday */}
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 }}
                  className="bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-purple-600 dark:text-purple-400">Thursday</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">7:00 PM</td>
                  <td className="px-6 py-4 font-medium">Youth Fellowship</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">Youth Center</td>
                </motion.tr>

                {/* Friday */}
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-cyan-600 dark:text-cyan-400">Friday</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">6:00 PM</td>
                  <td className="px-6 py-4 font-medium">Worship Night</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">Main Sanctuary</td>
                </motion.tr>

                {/* Saturday */}
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.35 }}
                  className="bg-slate-50 dark:bg-slate-950 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-teal-600 dark:text-teal-400">Saturday</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">10:00 AM</td>
                  <td className="px-6 py-4 font-medium">Men's Fellowship</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">Fellowship Hall</td>
                </motion.tr>
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-teal-600 dark:text-teal-400"></td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">2:00 PM</td>
                  <td className="px-6 py-4 font-medium">Women's Fellowship</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden md:table-cell">Fellowship Hall</td>
                </motion.tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Below Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="relative p-12 md:p-16 rounded-[3rem] overflow-hidden bg-gradient-to-br from-indigo-600 to-emerald-600 text-white">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/50 via-emerald-900/30 to-indigo-900/50" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black mb-4">Join Us This Week</h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">Experience the warmth of our community and grow in your faith journey.</p>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-white text-indigo-900 font-bold text-base hover:bg-slate-100 transition-all shadow-2xl"
              >
                Get Started Today
                <FiArrowRight />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}