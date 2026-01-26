'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
    CreditCard,
    DollarSign,
    User,
    Mail,
    Check,
    Loader2,
    Tag,
    ShieldCheck,
    ArrowRight,
    Info,
    AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function GivePage() {
    const { data: session, status } = useSession();
    const [paymentOptions, setPaymentOptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [selectedOption, setSelectedOption] = useState<any>(null);
    const [isCustomAmount, setIsCustomAmount] = useState(false);
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Offering');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [formError, setFormError] = useState('');
    const [paymentReference, setPaymentReference] = useState('');
    const [paymentUrl, setPaymentUrl] = useState('');

    // Payment categories for custom amounts
    const paymentCategories = [
        'Offering',
        'Tithe',
        'One Tenth',
        'Church Project',
        'Special Offering',
        'Others'
    ];

    // Load payment options
    useEffect(() => {
        async function loadOptions() {
            try {
                const res = await fetch('/api/payment-options');
                if (res.ok) {
                    const data = await res.json();
                    setPaymentOptions(data);
                }
            } catch (err) {
                console.error('Failed to load payment options:', err);
            } finally {
                setLoading(false);
            }
        }
        loadOptions();

        // Check for callback success/error
        const params = new URLSearchParams(window.location.search);
        const successParam = params.get('success');
        const amountParam = params.get('amount');
        const refParam = params.get('ref');

        if (successParam === 'true' && amountParam && refParam) {
            setSuccess(true);
            setAmount(amountParam);
            setPaymentReference(refParam);
        }
    }, []);

    // Auto-fill user info when logged in
    useEffect(() => {
        if (session?.user) {
            setName((session.user as any).name || '');
            setEmail((session.user as any).email || '');
        }
    }, [session]);

    const handleSelectOption = (option: any) => {
        setSelectedOption(option);
        setIsCustomAmount(false);
        setAmount(option.amount?.toString() || '');
    };

    const handleCustomAmount = () => {
        setSelectedOption(null);
        setIsCustomAmount(true);
        setAmount('');
    };

    // Validate email before submission
    const validateEmail = async (emailToCheck: string) => {
        if (!emailToCheck || session) return true; // Skip if logged in or no email

        try {
            const res = await fetch('/api/auth/check-email', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ email: emailToCheck })
            });
            const data = await res.json();

            if (!data.available) {
                setEmailError(data.message || 'Email already exists');
                return false;
            }

            setEmailError('');
            return true;
        } catch (err) {
            console.error('Email validation error:', err);
            return true; // Allow on error to not block payments
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || Number(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (!name || !email) {
            alert('Please provide your name and email');
            return;
        }

        // Validate email for non-logged-in users
        if (!session) {
            const isValid = await validateEmail(email);
            if (!isValid) {
                return; // Stop if email validation fails
            }
        }

        setProcessing(true);
        setFormError('');
        try {
            const body = {
                title: isCustomAmount ? category : selectedOption?.title,
                amount: Number(amount),
                guestName: name,
                guestEmail: email,
                optionId: selectedOption?._id || null
            };

            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.error || 'Payment initiation failed');
            }

            // Show success modal with Paystack link
            if (data.authorization_url) {
                setPaymentUrl(data.authorization_url);
                setSuccess(true);
            } else {
                throw new Error('No payment URL received');
            }
        } catch (err: any) {
            setFormError(err.message || 'Failed to process payment');
        } finally {
            setProcessing(false);
        }
    };

    const resetForm = () => {
        setSuccess(false);
        setSelectedOption(null);
        setIsCustomAmount(false);
        setAmount('');
        setCategory('Offering');
        setFormError('');
        setPaymentUrl('');
        if (!session) {
            setName('');
            setEmail('');
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
                <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-[3rem] border border-emerald-100 dark:border-emerald-900/30 p-12 text-center shadow-2xl">
                    <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-6">
                        <Check size={50} />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Payment Initiated!</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                        Your payment of <span className="font-bold text-indigo-600">₦{Number(amount).toLocaleString()}</span> has been successfully initiated.
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 ">
                        {!session && (
                            <>If you register later using <span className="font-bold">{email}</span>, this payment will be automatically linked to your account.</>
                        )}
                    </p>
                    <div className="flex flex-col gap-4 items-center">
                        {paymentUrl && (
                            <a
                                href={paymentUrl}
                                className="w-full max-w-sm px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
                            >
                                <CreditCard size={20} />
                                Proceed to Paystack
                            </a>
                        )}
                        <div className="flex gap-4 justify-center w-full">
                            <button
                                onClick={resetForm}
                                className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                            >
                                Make Another
                            </button>
                            <Link
                                href="/"
                                className="px-8 py-4 glass border border-slate-200 dark:border-slate-800 font-bold rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                        <ShieldCheck size={16} />
                        <span className="text-xs font-black uppercase tracking-widest">Secure Payment Gateway</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-4">
                        Make a <span className="text-indigo-600">Payment</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        Select a payment type or enter a custom amount to continue
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-16 max-w-6xl">
                <form onSubmit={handlePayment} className="space-y-12">
                    {/* Step 1: Payment Type Selection */}
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                            Step 1: Select Payment Type
                        </h2>

                        {loading ? (
                            <div className="grid md:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-3 gap-6">
                                {/* Custom Amount Card */}
                                <div
                                    onClick={handleCustomAmount}
                                    className={`group relative p-8 rounded-3xl border-2 cursor-pointer transition-all ${isCustomAmount
                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-xl shadow-indigo-500/20'
                                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700'
                                        }`}
                                >
                                    {isCustomAmount && (
                                        <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Check size={14} className="text-white" />
                                        </div>
                                    )}
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mb-4">
                                        <DollarSign size={28} />
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Custom Amount</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Enter any amount you wish to pay
                                    </p>
                                </div>

                                {/* Fixed Amount Options */}
                                {paymentOptions.map((option) => (
                                    <div
                                        key={option._id}
                                        onClick={() => handleSelectOption(option)}
                                        className={`group relative p-8 rounded-3xl border-2 cursor-pointer transition-all ${selectedOption?._id === option._id
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-xl shadow-indigo-500/20'
                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700'
                                            }`}
                                    >
                                        {selectedOption?._id === option._id && (
                                            <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                                <Check size={14} className="text-white" />
                                            </div>
                                        )}
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white mb-4">
                                            <CreditCard size={28} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{option.title}</h3>
                                        {option.amount && (
                                            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
                                                ₦{option.amount.toLocaleString()}
                                            </p>
                                        )}
                                        {option.description && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                                {option.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Step 2: Amount Input (for custom or selected) */}
                    {(isCustomAmount || selectedOption) && (
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                                Step 2: {isCustomAmount ? 'Enter Amount' : 'Confirm Amount'}
                            </h2>
                            <div className="space-y-6">
                                {/* Category Selection for Custom Amounts */}
                                {isCustomAmount && (
                                    <div>
                                        <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-widest mb-2 block">
                                            Payment Category
                                        </label>
                                        <div className="relative">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
                                            <select
                                                required
                                                value={category}
                                                onChange={(e) => setCategory(e.target.value)}
                                                className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-600 rounded-2xl font-bold text-lg outline-none transition-all text-slate-800 dark:text-white appearance-none cursor-pointer"
                                            >
                                                {paymentCategories.map((cat) => (
                                                    <option key={cat} value={cat}>
                                                        {cat}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                ▼
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-widest mb-2 block">
                                        Amount (₦)
                                    </label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                        <input
                                            required
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            readOnly={!isCustomAmount}
                                            placeholder="0.00"
                                            className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-600 rounded-2xl font-black text-3xl outline-none transition-all text-indigo-600 dark:text-indigo-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: User Information */}
                    {(isCustomAmount || selectedOption) && amount && Number(amount) > 0 && (
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                                Step 3: Your Information
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-widest mb-2 block">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            readOnly={!!session}
                                            placeholder="John Doe"
                                            className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-600 rounded-2xl outline-none transition-all text-slate-800 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 ml-1 tracking-widest mb-2 block">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            required
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            readOnly={!!session}
                                            placeholder="john@example.com"
                                            className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-600 rounded-2xl outline-none transition-all text-slate-800 dark:text-white"
                                        />
                                    </div>

                                    {/* Email Error Message */}
                                    {emailError && !session && (
                                        <div className="mt-3 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-200 dark:border-rose-900/30 flex gap-3 animate-in slide-in-from-top">
                                            <AlertTriangle size={18} className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-rose-800 dark:text-rose-300 mb-1">
                                                    Email Already Registered
                                                </p>
                                                <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
                                                    {emailError}
                                                </p>
                                                <Link
                                                    href="/auth/signin"
                                                    className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 underline"
                                                >
                                                    Login to your account →
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {!session && !emailError && (
                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex gap-3">
                                        <Info size={16} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                                            If you register later using this email, your payment will be automatically linked to your account.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    {(isCustomAmount || selectedOption) && amount && Number(amount) > 0 && (
                        <div className="space-y-6">
                            {formError && (
                                <div className="max-w-md mx-auto p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-200 dark:border-rose-900/30 flex gap-3 animate-in fade-in zoom-in">
                                    <AlertTriangle size={18} className="text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-rose-800 dark:text-rose-300">
                                            Payment Error
                                        </p>
                                        <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
                                            {formError}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="group px-12 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-400 text-white rounded-2xl font-black text-lg flex items-center gap-3 transition-all shadow-2xl shadow-indigo-500/30 hover:scale-105 disabled:scale-100"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="animate-spin" size={24} />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck size={24} />
                                            Securely Pay with Paystack
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
