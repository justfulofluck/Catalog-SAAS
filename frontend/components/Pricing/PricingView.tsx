import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { ArrowLeft, Check, Sparkles, CreditCard, ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { AppIcon } from '../Common/AppIcon';

const PricingView: React.FC = () => {
  const { plans, fetchPlans, setView, user, updateSubscription, uiTheme } = useStore();
  const isDark = uiTheme === 'dark';
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
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"></div>

        {/* Razorpay Card */}
        <div className={`relative w-full max-w-[420px] rounded-[4px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border ${
          isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200'
        }`}>
          {/* Razorpay Header */}
          <div className={`p-6 flex items-center justify-between border-b ${
            isDark ? 'bg-[#121212] text-white border-[#262626]' : 'bg-slate-50 text-slate-900 border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#0F3D3E] rounded-[4px] flex items-center justify-center text-white">
                <CreditCard size={18} />
              </div>
              <div>
                <h4 className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-1 ${
                  isDark ? 'text-[#888888]' : 'text-slate-500'
                }`}>Razorpay Checkout</h4>
                <p className={`font-space font-bold text-sm tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>CatalogStudio Upgrade</p>
              </div>
            </div>
            <button onClick={() => setCheckoutOpen(false)} className={`transition-colors ${
              isDark ? 'text-[#888888] hover:text-white' : 'text-slate-400 hover:text-slate-900'
            }`}>
              <ArrowLeft size={20} className="rotate-45" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            {checkoutStep === 'details' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className={`flex items-center justify-between p-5 rounded-[4px] border ${
                  isDark ? 'bg-[#1c1c1c] border-[#262626]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest leading-none mb-1 ${
                      isDark ? 'text-[#888888]' : 'text-slate-500'
                    }`}>Selected Plan</p>
                    <p className={`font-space text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedPlan?.name}</p>
                  </div>
                  <p className={`font-space text-xl font-bold ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>₹{selectedPlan?.price}</p>
                </div>

                <div className="space-y-3">
                  <p className={`text-[10px] font-bold uppercase tracking-widest leading-none ${
                    isDark ? 'text-[#888888]' : 'text-slate-500'
                  }`}>Payment Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 border-2 border-[#0F3D3E] bg-[#0F3D3E]/10 rounded-[4px] relative cursor-pointer">
                      <Check size={12} className={`absolute top-2 right-2 ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`} />
                      <CreditCard size={20} className={`${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'} mb-2`} />
                      <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Card / UPI</p>
                    </div>
                    <div className={`p-4 border rounded-[4px] opacity-40 cursor-not-allowed ${
                      isDark ? 'border-[#262626] bg-[#1c1c1c]' : 'border-slate-200 bg-slate-100'
                    }`}>
                      <CreditCard size={20} className={`${isDark ? 'text-[#666666]' : 'text-slate-400'} mb-2`} />
                      <p className={`text-xs font-bold ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>Net Banking</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium px-1">
                    <span className={isDark ? 'text-[#888888]' : 'text-slate-500'}>Email</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.email}</span>
                  </div>
                </div>

                <button
                  onClick={processPayment}
                  className="w-full py-4 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-bold text-sm uppercase tracking-widest shadow-xl shadow-[#0F3D3E]/25 active:scale-95 transition-all"
                >
                  Pay ₹{selectedPlan?.price}
                </button>

                <div className="flex items-center justify-center gap-2 opacity-60">
                  <Lock size={12} className={isDark ? 'text-[#888888]' : 'text-slate-500'} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
                    Secure Payment Powered by Razorpay
                  </span>
                </div>
              </div>
            )}

            {checkoutStep === 'processing' && (
              <div className="py-16 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
                <div className="relative">
                  <div className={`w-20 h-20 border-4 rounded-full ${isDark ? 'border-[#262626]' : 'border-slate-200'}`}></div>
                  <div className="w-20 h-20 border-4 border-[#0F3D3E] border-t-transparent rounded-full animate-spin absolute inset-0"></div>
                  <CreditCard className={`absolute inset-0 m-auto ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`} size={32} />
                </div>
                <div className="text-center space-y-2">
                  <h3 className={`font-space text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Processing Payment</h3>
                  <p className={`text-sm font-medium ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>Please do not refresh or close the window</p>
                </div>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="py-16 flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 rounded-full flex items-center justify-center shadow-xl">
                  <Check size={40} strokeWidth={3} />
                </div>
                <div className="text-center space-y-2">
                  <h3 className={`font-space text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Success!</h3>
                  <p className={`text-sm font-medium max-w-[240px] mx-auto ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
                    Your account has been upgraded to <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedPlan?.name}</span>
                  </p>
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-widest animate-pulse ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
                  Redirecting to Dashboard...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans overflow-y-auto transition-colors ${
      isDark ? 'bg-[#100F0F] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {isCheckoutOpen && renderRazorpayMock()}

      {/* Header */}
      <div className={`px-8 py-6 flex items-center justify-between border-b shrink-0 sticky top-0 z-10 transition-colors ${
        isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView(user?.businessId ? 'dashboard' : 'business-selection')}
            className={`p-2 rounded-[4px] transition-colors ${
              isDark ? 'hover:bg-[#1c1c1c] text-[#888888] hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
            }`}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2.5">
            <AppIcon size={24} />
            <span className={`font-space font-bold text-xl tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>catalogmakerr.</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>Current Plan:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
            isDark ? 'bg-[#0F3D3E]/10 text-[#E2DCC8] border-[#0F3D3E]/20' : 'bg-teal-50 text-[#0F3D3E] border-teal-200'
          }`}>
            {user?.subscription_plan || 'No Plan'}
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-8 py-16">
        <div className="text-center space-y-4 mb-16">
          <h1 className={`font-space text-4xl md:text-5xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Scale Your Catalog Factory</h1>
          <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-[#888888]' : 'text-slate-600'}`}>
            Choose the perfect tier for your business volume. Upgrade anytime as you grow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan: any) => {
            const isCurrent = user?.subscription_plan === plan.name;
            const isPro = plan.slug === 'pro';
            const isGrowth = plan.slug === 'growth';

            return (
              <div
                key={plan.id}
                className={`rounded-[4px] p-8 md:p-10 border-2 transition-all hover:shadow-2xl relative flex flex-col ${
                  isGrowth
                    ? (isDark ? 'border-[#0F3D3E] bg-[#161616] shadow-2xl shadow-[#0F3D3E]/10 scale-105 z-10' : 'border-[#0F3D3E] bg-white shadow-xl shadow-teal-900/10 scale-105 z-10')
                    : (isDark ? 'bg-[#161616] border-[#262626] hover:border-[#3a3a3a]' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm')
                }`}
              >
                {isGrowth && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0F3D3E] text-white px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-2">
                    <Sparkles size={12} /> Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`font-space text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`font-space text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>₹{plan.price}</span>
                    <span className={`font-bold text-sm ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>/per month</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  {plan.features?.max_catalogs && (
                    <div className={`flex items-center gap-3 font-medium text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isDark ? 'bg-[#0F3D3E]/20 text-[#E2DCC8]' : 'bg-teal-50 text-[#0F3D3E]'
                      }`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      {plan.features.max_catalogs} Active Catalogs
                    </div>
                  )}
                  {plan.features?.max_products && (
                    <div className={`flex items-center gap-3 font-medium text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isDark ? 'bg-[#0F3D3E]/20 text-[#E2DCC8]' : 'bg-teal-50 text-[#0F3D3E]'
                      }`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      {plan.features.max_products} Product Inventory
                    </div>
                  )}
                  {plan.features?.max_storage_mb && (
                    <div className={`flex items-center gap-3 font-medium text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isDark ? 'bg-[#0F3D3E]/20 text-[#E2DCC8]' : 'bg-teal-50 text-[#0F3D3E]'
                      }`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      {plan.features.max_storage_mb < 1024 ? `${plan.features.max_storage_mb}MB` : `${plan.features.max_storage_mb / 1024}GB`} Media Storage
                    </div>
                  )}
                  {plan.features?.ai_enabled && (
                    <div className={`flex items-center gap-3 font-medium text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isDark ? 'bg-[#0F3D3E]/20 text-[#E2DCC8]' : 'bg-teal-50 text-[#0F3D3E]'
                      }`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      AI Catalog Generation
                    </div>
                  )}
                  {isPro && (
                    <div className={`flex items-center gap-3 font-medium text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isDark ? 'bg-[#0F3D3E]/20 text-[#E2DCC8]' : 'bg-teal-50 text-[#0F3D3E]'
                      }`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      Priority White-Glove Support
                    </div>
                  )}
                </div>

                <button
                  disabled={isCurrent}
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-4 rounded-[4px] font-bold text-xs uppercase tracking-widest transition-all ${
                    isCurrent
                      ? (isDark ? 'bg-[#1c1c1c] text-[#666666] cursor-default border border-[#262626]' : 'bg-slate-100 text-slate-400 cursor-default border border-slate-200')
                      : isGrowth
                        ? 'bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white shadow-xl shadow-[#0F3D3E]/25 active:scale-95'
                        : (isDark ? 'bg-[#1c1c1c] hover:bg-[#262626] text-white border border-[#262626] active:scale-95' : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95 shadow-md')
                  }`}
                >
                  {isCurrent ? 'Existing Plan' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-20 text-center">
          <p className={`font-medium text-sm mb-6 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
            Need a custom enterprise solution? <span className={`cursor-pointer hover:underline ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>Contact our sales team</span>
          </p>
          <div className={`flex justify-center items-center gap-3 ${isDark ? 'text-[#666666]' : 'text-slate-400'}`}>
            <ShieldCheck size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Secure 256-bit encrypted payments</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingView;
