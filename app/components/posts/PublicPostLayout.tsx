'use client';
import React from 'react';
import PostView from './PostView';
import { Calendar, User, Tag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PublicPostLayoutProps {
    post: any;
    previewMode?: boolean;
}

export default function PublicPostLayout({ post, previewMode = false }: PublicPostLayoutProps) {
    const publishedDate = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
            {/* Preview Banner */}
            {previewMode && (
                <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-4 py-3 text-center border-b border-amber-200 dark:border-amber-800/50 sticky top-0 z-50 backdrop-blur-sm">
                    <div className="container mx-auto flex items-center justify-center gap-2 text-sm font-semibold">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        You are viewing a draft preview. This content is not public.
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="relative w-full h-[40vh] md:h-[50vh] bg-slate-100 dark:bg-slate-900 overflow-hidden">
                {/* Navigation Back */}
                <div className="absolute top-6 left-6 z-20">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 transition-all font-medium text-sm group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </Link>
                </div>

                {/* Feature Image */}
                {post.featureImage ? (
                    <>
                        <img
                            src={post.featureImage}
                            alt={post.title}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900" />
                )}

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <div className="container mx-auto max-w-4xl">
                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-6">
                                {post.tags.map((tag: string) => (
                                    <span key={tag} className="px-3 py-1 bg-indigo-500/80 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Title */}
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-8 drop-shadow-xl text-balance">
                            {post.title}
                        </h1>

                        {/* Meta Row */}
                        <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm font-medium">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white border-2 border-white/20 shadow-xl">
                                    {post.createdBy?.name ? post.createdBy.name.charAt(0).toUpperCase() : <User size={18} />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 uppercase tracking-wider">Written by</span>
                                    <span className="text-white font-bold">{post.createdBy?.name || 'Unknown Author'}</span>
                                </div>
                            </div>

                            <div className="w-px h-10 bg-white/10 hidden sm:block"></div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-300 border border-white/10">
                                    <Calendar size={18} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 uppercase tracking-wider">Published on</span>
                                    <span className="text-slate-200">{publishedDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto max-w-3xl px-6 -mt-10 relative z-10">
                <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 ring-1 ring-slate-900/5">
                    <PostView body={post.body} />

                    <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-slate-400 italic text-sm">Thanks for reading!</p>
                            <div className="mt-2 text-indigo-500 font-bold">Share this post</div>
                        </div>
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="mt-12 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors font-medium">
                        <ArrowLeft size={16} /> return to homepage
                    </Link>
                </div>
            </main>
        </div>
    );
}
