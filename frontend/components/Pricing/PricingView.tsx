
import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { ArrowLeft, Check, Sparkles, CreditCard, ShieldCheck, Lock, Loader2 } from 'lucide-react';

const PricingView: React.FC = () => {
    const { plans, fetchPlans, setView, user, updateSubscription } = useStore();
    const [isCheckoutOpen, setCheckoutOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [checkoutStep, setCheckoutStep] = useState<'details' | 'processing' | 'success'>('details');

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    const handleSelectPlan = (plan: any) => {
        setSelectedPlan(plan);
        setCheckoutOpen(true);
        setCheckoutStep('details');
    };

    const processPayment = async () => {
        setCheckoutStep('processing');

        // Simulate payment processing time
        await new Promise(resolve => setTimeout(resolve, 3000));

        const result = await updateSubscription(selectedPlan.slug);

        if (result.success) {
            setCheckoutStep('success');
            // Auto redirect after success
            setTimeout(() => {
                setView('dashboard');
            }, 2500);
        } else {
            alert(result.message);
            setCheckoutStep('details');
        }
    };

    const renderRazorpayMock = () => {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"></div>

                {/* Razorpay Card */}
                <div className="relative w-full max-w-[420px] bg-white rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                    {/* Razorpay Header */}
                    <div className="bg-[#121212] p-6 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <CreditCard size={18} />
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest opacity-60 leading-none mb-1">Razorpay Checkout</h4>
                                <p className="font-bold text-sm tracking-tight text-white/90">CatalogStudio Upgrade</p>
                            </div>
                        </div>
                        <button onClick={() => setCheckoutOpen(false)} className="text-white/40 hover:text-white transition-colors">
                            <ArrowLeft size={20} className="rotate-45" />
                        </button>
                    </div>

                    <div className="p-8 space-y-8">
                        {checkoutStep === 'details' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Selected Plan</p>
                                        <p className="text-sm font-black text-slate-900">{selectedPlan?.name}</p>
                                    </div>
                                    <p className="text-lg font-black text-indigo-600">₹{selectedPlan?.price}</p>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Payment Method</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 border-2 border-blue-500 bg-blue-50/50 rounded-xl relative">
                                            <Check size={12} className="absolute top-2 right-2 text-blue-500" />
                                            <CreditCard size={20} className="text-blue-500 mb-2" />
                                            <p className="text-xs font-bold text-blue-900">Card / UPI</p>
                                        </div>
                                        <div className="p-4 border border-slate-100 rounded-xl grayscale opacity-40 cursor-not-allowed">
                                            <CreditCard size={20} className="text-slate-400 mb-2" />
                                            <p className="text-xs font-bold text-slate-500">Net Banking</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-xs font-bold px-1">
                                        <span className="text-slate-500">Email</span>
                                        <span className="text-slate-900">{user?.email}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={processPayment}
                                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                                >
                                    Pay ₹{selectedPlan?.price}
                                </button>

                                <div className="flex items-center justify-center gap-2 opacity-40">
                                    <Lock size={12} className="text-slate-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Payment Powered by Razorpay</span>
                                </div>
                            </div>
                        )}

                        {checkoutStep === 'processing' && (
                            <div className="py-20 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-blue-100 rounded-full"></div>
                                    <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
                                    <CreditCard className="absolute inset-0 m-auto text-blue-600" size={32} />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-black text-slate-900">Processing Payment</h3>
                                    <p className="text-sm font-bold text-slate-400">Please do not refresh or close the window</p>
                                </div>
                            </div>
                        )}

                        {checkoutStep === 'success' && (
                            <div className="py-20 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-500">
                                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce shadow-xl shadow-emerald-500/10">
                                    <Check size={48} strokeWidth={4} />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Success!</h3>
                                    <p className="text-sm font-bold text-slate-400 max-w-[240px] mx-auto">Your account has been upgraded to <span className="text-slate-900">{selectedPlan?.name}</span></p>
                                </div>
                                <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] animate-pulse">Redirecting to Dashboard...</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-y-auto">
            {isCheckoutOpen && renderRazorpayMock()}

            {/* Header */}
            <div className="px-8 py-6 flex items-center justify-between bg-white border-b border-slate-200 shrink-0 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setView(user?.businessId ? 'dashboard' : 'business-selection')}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20">C</div>
                        <span className="font-black text-xl tracking-tight text-slate-900">Studio.</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400">Current Plan:</span>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100">
                        {user?.subscription_plan || 'No Plan'}
                    </span>
                </div>
            </div>

            <div className="flex-1 max-w-7xl mx-auto w-full px-8 py-16">
                <div className="text-center space-y-4 mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Scale Your Catalog Factory</h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">Choose the perfect tier for your business volume. Upgrade anytime as you grow.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan: any) => {
                        const isCurrent = user?.subscription_plan === plan.name;
                        const isPro = plan.slug === 'pro';
                        const isGrowth = plan.slug === 'growth';

                        return (
                            <div
                                key={plan.id}
                                className={`bg-white rounded-[32px] p-10 border-2 transition-all hover:shadow-2xl relative flex flex-col ${isGrowth ? 'border-indigo-600 ring-8 ring-indigo-600/5 shadow-xl scale-105 z-10' : 'border-slate-100 hover:border-slate-300'
                                    }`}
                            >
                                {isGrowth && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-2">
                                        <Sparkles size={12} /> Most Popular
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-slate-900">₹{plan.price}</span>
                                        <span className="text-slate-400 font-bold text-sm">/per month</span>
                                    </div>
                                </div>

                                <div className="space-y-5 mb-10 flex-1">
                                    {plan.features?.max_catalogs && (
                                        <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Check size={12} strokeWidth={4} /></div>
                                            {plan.features.max_catalogs} Active Catalogs
                                        </div>
                                    )}
                                    {plan.features?.max_products && (
                                        <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Check size={12} strokeWidth={4} /></div>
                                            {plan.features.max_products} Product Inventory
                                        </div>
                                    )}
                                    {plan.features?.max_storage_mb && (
                                        <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Check size={12} strokeWidth={4} /></div>
                                            {plan.features.max_storage_mb < 1024 ? `${plan.features.max_storage_mb}MB` : `${plan.features.max_storage_mb / 1024}GB`} Media Storage
                                        </div>
                                    )}
                                    {plan.features?.ai_enabled && (
                                        <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Check size={12} strokeWidth={4} /></div>
                                            AI Catalog Generation
                                        </div>
                                    )}
                                    {isPro && (
                                        <div className="flex items-center gap-3 text-slate-600 font-bold text-sm">
                                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Check size={12} strokeWidth={4} /></div>
                                            Priority White-Glove Support
                                        </div>
                                    )}
                                </div>

                                <button
                                    disabled={isCurrent}
                                    onClick={() => handleSelectPlan(plan)}
                                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${isCurrent
                                            ? 'bg-slate-100 text-slate-400 cursor-default'
                                            : isGrowth
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95'
                                                : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                                        }`}
                                >
                                    {isCurrent ? 'Existing Plan' : 'Select Plan'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-24 text-center">
                    <p className="text-slate-400 font-bold text-sm mb-6">Need a custom enterprise solution? <span className="text-indigo-600 cursor-pointer">Contact our sales team</span></p>
                    <div className="flex justify-center gap-8 opacity-50 grayscale transition-all hover:grayscale-0">
                        <ShieldCheck className="text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure 256-bit encrypted payments</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingView;
