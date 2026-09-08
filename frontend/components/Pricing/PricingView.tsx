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
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"></div>

        {/* Razorpay Card */}
        <div className="relative w-full max-w-[420px] bg-[#161616] rounded-[4px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-[#262626]">
          {/* Razorpay Header */}
          <div className="bg-[#121212] p-6 text-white flex items-center justify-between border-b border-[#262626]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#0F3D3E] rounded-[4px] flex items-center justify-center text-white">
                <CreditCard size={18} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#888888] leading-none mb-1">Razorpay Checkout</h4>
                <p className="font-space font-bold text-sm tracking-tight text-white">CatalogStudio Upgrade</p>
              </div>
            </div>
            <button onClick={() => setCheckoutOpen(false)} className="text-[#888888] hover:text-white transition-colors">
              <ArrowLeft size={20} className="rotate-45" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            {checkoutStep === 'details' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between p-5 bg-[#1c1c1c] rounded-[4px] border border-[#262626]">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-[#888888] tracking-widest leading-none mb-1">Selected Plan</p>
                    <p className="font-space text-sm font-bold text-white">{selectedPlan?.name}</p>
                  </div>
                  <p className="font-space text-xl font-bold text-[#E2DCC8]">₹{selectedPlan?.price}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase text-[#888888] tracking-widest leading-none">Payment Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 border-2 border-[#0F3D3E] bg-[#0F3D3E]/10 rounded-[4px] relative cursor-pointer">
                      <Check size={12} className="absolute top-2 right-2 text-[#E2DCC8]" />
                      <CreditCard size={20} className="text-[#E2DCC8] mb-2" />
                      <p className="text-xs font-bold text-white">Card / UPI</p>
                    </div>
                    <div className="p-4 border border-[#262626] bg-[#1c1c1c] rounded-[4px] opacity-40 cursor-not-allowed">
                      <CreditCard size={20} className="text-[#666666] mb-2" />
                      <p className="text-xs font-bold text-[#888888]">Net Banking</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium px-1">
                    <span className="text-[#888888]">Email</span>
                    <span className="text-white font-semibold">{user?.email}</span>
                  </div>
                </div>

                <button
                  onClick={processPayment}
                  className="w-full py-4 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-bold text-sm uppercase tracking-widest shadow-xl shadow-[#0F3D3E]/25 active:scale-95 transition-all"
                >
                  Pay ₹{selectedPlan?.price}
                </button>

                <div className="flex items-center justify-center gap-2 opacity-60">
                  <Lock size={12} className="text-[#888888]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#888888]">Secure Payment Powered by Razorpay</span>
                </div>
              </div>
            )}

            {checkoutStep === 'processing' && (
              <div className="py-16 flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-[#262626] rounded-full"></div>
                  <div className="w-20 h-20 border-4 border-[#0F3D3E] border-t-transparent rounded-full animate-spin absolute inset-0"></div>
                  <CreditCard className="absolute inset-0 m-auto text-[#E2DCC8]" size={32} />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-space text-lg font-bold text-white">Processing Payment</h3>
                  <p className="text-sm font-medium text-[#888888]">Please do not refresh or close the window</p>
                </div>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="py-16 flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 rounded-full flex items-center justify-center shadow-xl">
                  <Check size={40} strokeWidth={3} />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="font-space text-2xl font-bold text-white tracking-tight">Success!</h3>
                  <p className="text-sm font-medium text-[#888888] max-w-[240px] mx-auto">
                    Your account has been upgraded to <span className="text-white font-bold">{selectedPlan?.name}</span>
                  </p>
                </div>
                <div className="text-[10px] font-bold text-[#E2DCC8] uppercase tracking-widest animate-pulse">Redirecting to Dashboard...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#100F0F] text-white flex flex-col font-sans overflow-y-auto">
      {isCheckoutOpen && renderRazorpayMock()}

      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between bg-[#161616] border-b border-[#262626] shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView(user?.businessId ? 'dashboard' : 'business-selection')}
            className="p-2 hover:bg-[#1c1c1c] rounded-[4px] transition-colors text-[#888888] hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <span className="font-space font-bold text-xl tracking-tight text-white">catalogmakerr.</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#888888] uppercase tracking-wider">Current Plan:</span>
          <span className="px-3 py-1 bg-[#0F3D3E]/10 text-[#E2DCC8] rounded-full text-xs font-bold uppercase tracking-widest border border-[#0F3D3E]/20">
            {user?.subscription_plan || 'No Plan'}
          </span>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-8 py-16">
        <div className="text-center space-y-4 mb-16">
          <h1 className="font-space text-4xl md:text-5xl font-bold text-white tracking-tight">Scale Your Catalog Factory</h1>
          <p className="text-lg text-[#888888] max-w-2xl mx-auto">Choose the perfect tier for your business volume. Upgrade anytime as you grow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan: any) => {
            const isCurrent = user?.subscription_plan === plan.name;
            const isPro = plan.slug === 'pro';
            const isGrowth = plan.slug === 'growth';

            return (
              <div
                key={plan.id}
                className={`bg-[#161616] rounded-[4px] p-8 md:p-10 border-2 transition-all hover:shadow-2xl relative flex flex-col ${
                  isGrowth
                    ? 'border-[#0F3D3E] shadow-2xl shadow-[#0F3D3E]/10 scale-105 z-10'
                    : 'border-[#262626] hover:border-[#3a3a3a]'
                }`}
              >
                {isGrowth && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0F3D3E] text-white px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-2">
                    <Sparkles size={12} /> Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="font-space text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-space text-4xl font-bold text-white">₹{plan.price}</span>
                    <span className="text-[#888888] font-bold text-sm">/per month</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  {plan.features?.max_catalogs && (
                    <div className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                      <div className="w-5 h-5 rounded-full bg-[#0F3D3E]/20 text-[#E2DCC8] flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      {plan.features.max_catalogs} Active Catalogs
                    </div>
                  )}
                  {plan.features?.max_products && (
                    <div className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                      <div className="w-5 h-5 rounded-full bg-[#0F3D3E]/20 text-[#E2DCC8] flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      {plan.features.max_products} Product Inventory
                    </div>
                  )}
                  {plan.features?.max_storage_mb && (
                    <div className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                      <div className="w-5 h-5 rounded-full bg-[#0F3D3E]/20 text-[#E2DCC8] flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      {plan.features.max_storage_mb < 1024 ? `${plan.features.max_storage_mb}MB` : `${plan.features.max_storage_mb / 1024}GB`} Media Storage
                    </div>
                  )}
                  {plan.features?.ai_enabled && (
                    <div className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                      <div className="w-5 h-5 rounded-full bg-[#0F3D3E]/20 text-[#E2DCC8] flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      AI Catalog Generation
                    </div>
                  )}
                  {isPro && (
                    <div className="flex items-center gap-3 text-slate-300 font-medium text-sm">
                      <div className="w-5 h-5 rounded-full bg-[#0F3D3E]/20 text-[#E2DCC8] flex items-center justify-center shrink-0">
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
                      ? 'bg-[#1c1c1c] text-[#666666] cursor-default border border-[#262626]'
                      : isGrowth
                        ? 'bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white shadow-xl shadow-[#0F3D3E]/25 active:scale-95'
                        : 'bg-[#1c1c1c] hover:bg-[#262626] text-white border border-[#262626] active:scale-95'
                  }`}
                >
                  {isCurrent ? 'Existing Plan' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-20 text-center">
          <p className="text-[#888888] font-medium text-sm mb-6">
            Need a custom enterprise solution? <span className="text-[#E2DCC8] cursor-pointer hover:underline">Contact our sales team</span>
          </p>
          <div className="flex justify-center items-center gap-3 text-[#666666]">
            <ShieldCheck size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Secure 256-bit encrypted payments</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingView;
