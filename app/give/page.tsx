import { dbConnect } from '@/lib/db';
import PaymentOption, { IPaymentOption } from '@/models/PaymentOption';
import PublicPaymentForm from '@/app/components/payments/PublicPaymentForm';
import { CreditCard, Heart, ShieldCheck } from 'lucide-react';

export const metadata = {
    title: 'Give - Support Our Ministry',
    description: 'Securely contribute to our various ministry programs and initiatives.',
};

export default async function GivePage() {
    await dbConnect();
    const rawOptions = (await PaymentOption.find({ active: true }).sort({ createdAt: -1 }).lean()) as any[];
    const options = JSON.parse(JSON.stringify(rawOptions)) as IPaymentOption[];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header Section */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-24">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30">
                        <Heart size={16} />
                        <span className="text-xs font-black uppercase tracking-widest">Generosity</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6">
                        Support the <span className="text-indigo-600">Ministry.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                        Your partnership enables us to continue our mission of hope and service.
                        Every contribution, no matter the size, makes a meaningful difference.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-20">
                <div className="grid lg:grid-cols-3 gap-12 items-start">
                    {/* Informational Column */}
                    <div className="lg:col-span-1 space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Why We Give</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                Giving is an act of worship and a commitment to the growth of God's kingdom.
                                We are dedicated to transparency and stewardship in all received contributions.
                            </p>
                        </div>

                        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
                                <ShieldCheck size={24} />
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white">Secure Processing</h4>
                            <p className="text-xs text-slate-500">
                                All transactions are encrypted and processed through our secure payment partners.
                            </p>
                        </div>
                    </div>

                    {/* Main Form Column */}
                    <div className="lg:col-span-2">
                        <div className="grid md:grid-cols-1 gap-8">
                            {options.length > 0 ? (
                                <div className="space-y-12">
                                    {options.map((opt) => (
                                        <div key={opt._id.toString()}>
                                            <div className="mb-4 px-2">
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{opt.title}</h3>
                                                {opt.description && <p className="text-sm text-slate-500 mt-1">{opt.description}</p>}
                                            </div>
                                            <PublicPaymentForm option={opt} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                                    <div className="text-5xl mb-4">💳</div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">General Giving</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-8">Direct support for our ongoing ministry efforts.</p>
                                    <PublicPaymentForm />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
