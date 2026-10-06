import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { 
  ArrowLeft, 
  Check, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  Zap, 
  BookOpen, 
  Package, 
  HardDrive, 
  Layers, 
  Crown,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { AppIcon } from '../Common/AppIcon';

const PricingView: React.FC = () => {
  const { plans: storePlans, fetchPlans, setView, user, updateSubscription, uiTheme, isLoading } = useStore();
  const isDark = uiTheme === 'dark';
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'processing' | 'success'>('details');

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Strictly display only active plans that exist in the database
  const displayPlans = (storePlans || []).filter(p => p.is_active !== false);

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setCheckoutOpen(true);
    setCheckoutStep('details');
  };

  const processPayment = async () => {
    setCheckoutStep('processing');

    // Simulate payment processing handshake
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = await updateSubscription(selectedPlan.slug);

    if (result.success) {
      setCheckoutStep('success');
      setTimeout(() => {
        setView('dashboard');
      }, 2000);
    } else {
      alert(result.message);
      setCheckoutStep('details');
    }
  };

  const renderRazorpayMock = () => {
    const planPrice = billingCycle === 'annual' && selectedPlan?.annualPrice !== undefined 
      ? selectedPlan.annualPrice 
      : selectedPlan?.price;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          onClick={() => setCheckoutOpen(false)}
          className="absolute inset-0 bg-black/85 backdrop-blur-md animate-in fade-in duration-300"
        />

        {/* Razorpay Card */}
        <div className={`relative w-full max-w-[440px] rounded-[6px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-6 duration-300 border ${
          isDark ? 'bg-[#161616] border-[#2e2e2e]' : 'bg-white border-slate-200'
        }`}>
          {/* Header */}
          <div className={`p-6 flex items-center justify-between border-b ${
            isDark ? 'bg-[#121212] text-white border-[#262626]' : 'bg-slate-50 text-slate-900 border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/25 rounded-[4px] flex items-center justify-center shadow-md">
                <CreditCard size={18} />
              </div>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#E2DCC8]/70 font-heading">
                  Secure Checkout
                </h4>
                <p className="font-space font-bold text-sm tracking-tight text-[#F1F1F1]">
                  catalogmakerr Upgrade
                </p>
              </div>
            </div>
            <button 
              onClick={() => setCheckoutOpen(false)} 
              className="p-1.5 rounded text-[#888888] hover:text-white transition-colors"
            >
              <ArrowLeft size={18} className="rotate-45" />
            </button>
          </div>

          <div className="p-7 space-y-6">
            {checkoutStep === 'details' && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className={`flex items-center justify-between p-4.5 rounded-[4px] border ${
                  isDark ? 'bg-[#1b1b1b] border-[#2c2c2c]' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#E2DCC8]/60 font-heading mb-0.5">
                      Selected Tier
                    </p>
                    <p className="font-space text-base font-bold text-[#F1F1F1]">
                      {selectedPlan?.name}
                    </p>
                    <span className="text-[11px] text-[#E2DCC8]/70">
                      Billed {billingCycle === 'annual' ? 'Annually (Save 20%)' : 'Monthly'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-space text-2xl font-bold text-[#E2DCC8]">
                      ₹{planPrice}
                    </p>
                    <span className="text-[10px] text-[#888888]">/month</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#E2DCC8]/70 font-heading">
                    Payment Option
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 border-2 border-[#0F3D3E] bg-[#0F3D3E]/15 rounded-[4px] relative cursor-pointer flex flex-col justify-between">
                      <Check size={12} className="absolute top-2 right-2 text-[#E2DCC8]" />
                      <CreditCard size={18} className="text-[#E2DCC8] mb-2" />
                      <div>
                        <p className="text-xs font-bold text-[#F1F1F1]">UPI / Cards</p>
                        <p className="text-[10px] text-[#E2DCC8]/60">Instant Activation</p>
                      </div>
                    </div>
                    <div className={`p-3.5 border rounded-[4px] opacity-40 cursor-not-allowed flex flex-col justify-between ${
                      isDark ? 'border-[#262626] bg-[#171616]' : 'border-slate-200 bg-slate-100'
                    }`}>
                      <Lock size={18} className="text-[#666666] mb-2" />
                      <div>
                        <p className="text-xs font-bold text-[#888888]">Net Banking</p>
                        <p className="text-[10px] text-[#666666]">Corporate Accounts</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs py-1 border-b border-white/5">
                    <span className="text-[#888888]">Account</span>
                    <span className="font-semibold text-white">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-[#888888]">Workspace</span>
                    <span className="font-semibold text-[#E2DCC8]">{user?.businessName || 'Primary Workspace'}</span>
                  </div>
                </div>

                <button
                  onClick={processPayment}
                  className="w-full py-3.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-heading font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#0F3D3E]/30 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <Zap size={14} className="text-[#E2DCC8]" /> Confirm & Upgrade for ₹{planPrice}
                </button>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <ShieldCheck size={13} className="text-[#E2DCC8]/60" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888] font-heading">
                    Encrypted 256-Bit SSL Verification
                  </span>
                </div>
              </div>
            )}

            {checkoutStep === 'processing' && (
              <div className="py-14 flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-300">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-[#262626] rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-[#0F3D3E] border-t-transparent rounded-full animate-spin absolute inset-0"></div>
                  <CreditCard className="absolute inset-0 m-auto text-[#E2DCC8]" size={24} />
                </div>
                <div className="text-center space-y-1.5">
                  <h3 className="font-space text-lg font-bold text-white">Activating {selectedPlan?.name}</h3>
                  <p className="text-xs text-[#888888]">Provisioning catalog resources and quotas...</p>
                </div>
              </div>
            )}

            {checkoutStep === 'success' && (
              <div className="py-12 flex flex-col items-center justify-center space-y-5 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 rounded-full flex items-center justify-center shadow-xl">
                  <Check size={32} strokeWidth={3} />
                </div>
                <div className="text-center space-y-1.5">
                  <h3 className="font-space text-2xl font-bold text-white tracking-tight">Plan Upgraded!</h3>
                  <p className="text-xs text-[#888888] max-w-[260px] mx-auto">
                    Your workspace now has full access to the <span className="font-bold text-white">{selectedPlan?.name}</span> features.
                  </p>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#E2DCC8] animate-pulse font-heading">
                  Redirecting to Workspace...
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

      {/* Top Navigation Bar */}
      <div className={`px-6 md:px-12 py-5 flex items-center justify-between border-b shrink-0 sticky top-0 z-20 backdrop-blur-md transition-colors ${
        isDark ? 'bg-[#161616]/90 border-[#262626]' : 'bg-white/90 border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('dashboard')}
            className={`p-2 rounded-[4px] border flex items-center gap-2 text-xs font-semibold uppercase tracking-wider font-heading transition-all ${
              isDark 
                ? 'bg-[#1a1a1a] hover:bg-[#222222] text-[#E2DCC8] border-[#2e2e2e]' 
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <ArrowLeft size={14} /> Back to Studio
          </button>
          <div className="flex items-center gap-2.5">
            <AppIcon size={26} withGlow={true} />
            <span className="font-space font-bold text-lg tracking-tight text-[#F1F1F1]">catalogmakerr.</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#888888] font-heading hidden sm:inline">
            Active Tier:
          </span>
          <span className="px-3 py-1 bg-[#0F3D3E]/30 text-[#E2DCC8] border border-[#0F3D3E] rounded-[4px] text-xs font-bold uppercase tracking-widest font-heading shadow-sm">
            {user?.subscription_plan || 'Starter'}
          </span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 pt-14 pb-8 text-center space-y-4 animate-in fade-in duration-500">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F3D3E]/30 border border-[#E2DCC8]/20 text-[#E2DCC8] text-[10px] font-bold uppercase tracking-widest font-heading mb-1 shadow-sm">
          <Sparkles size={12} /> Flexible Plans for Growing Brands
        </div>
        
        <h1 className="font-space text-3xl sm:text-5xl font-bold tracking-tight text-[#F1F1F1] max-w-3xl mx-auto leading-tight">
          Scale Your Catalog Production
        </h1>
        
        <p className="text-sm sm:text-base text-[#888888] max-w-xl mx-auto leading-relaxed">
          Unlock unlimited product catalogs, high-resolution multi-page PDF generation, and custom branding for your team.
        </p>

        {/* Monthly / Annual Toggle Switch */}
        {displayPlans.length > 0 && (
          <div className="pt-4 flex items-center justify-center">
            <div className={`p-1 rounded-[6px] border flex items-center gap-1 shadow-inner ${
              isDark ? 'bg-[#161616] border-[#262626]' : 'bg-slate-200 border-slate-300'
            }`}>
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-[4px] text-xs font-semibold font-heading uppercase tracking-wider transition-all ${
                  billingCycle === 'monthly'
                    ? (isDark ? 'bg-[#0F3D3E] text-white shadow' : 'bg-white text-slate-900 shadow')
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-[4px] text-xs font-semibold font-heading uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? (isDark ? 'bg-[#0F3D3E] text-white shadow' : 'bg-white text-slate-900 shadow')
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                <span>Annual</span>
                <span className="px-1.5 py-0.5 bg-amber-500 text-black font-bold text-[9px] rounded uppercase">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-7xl mx-auto w-full px-6 md:px-12 pb-20">
        {displayPlans.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#1c1c1c] border border-[#262626] flex items-center justify-center mx-auto text-[#888888]">
              <Package size={22} />
            </div>
            <h3 className="font-space text-lg font-bold text-white">No Subscription Plans Available</h3>
            <p className="text-xs text-[#888888] max-w-sm mx-auto">
              Please contact the Super Admin to configure and activate subscription tiers.
            </p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 ${
            displayPlans.length === 1 
              ? 'max-w-md mx-auto' 
              : displayPlans.length === 2 
                ? 'md:grid-cols-2 max-w-4xl mx-auto' 
                : 'md:grid-cols-3'
          } gap-6 lg:gap-8 items-stretch pt-4`}>
            {displayPlans.map((plan: any) => {
              const userPlanStr = (user?.subscription_plan || '').toLowerCase();
              const isCurrent = userPlanStr.includes(plan.slug?.toLowerCase() || '') || userPlanStr.includes(plan.name?.toLowerCase() || '');
              const isGrowth = plan.slug === 'growth';
              const isPro = plan.slug === 'pro';

              const numPrice = typeof plan.price === 'string' ? parseFloat(plan.price) : Number(plan.price || 0);
              const price = billingCycle === 'annual'
                ? Math.round(numPrice * 0.8)
                : numPrice;

              return (
                <div
                  key={plan.slug || plan.id}
                  className={`rounded-[6px] p-7 md:p-8 border transition-all duration-300 flex flex-col justify-between relative ${
                    isGrowth
                      ? 'bg-[#151515] border-[#E2DCC8]/40 ring-1 ring-[#E2DCC8]/30 shadow-2xl shadow-[#0F3D3E]/20 md:-translate-y-2'
                      : 'bg-[#161616] border-[#262626] hover:border-[#383838] shadow-lg'
                  }`}
                >
                  {/* Popular Badge */}
                  {isGrowth && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/30 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl flex items-center gap-1.5 font-heading">
                      <Sparkles size={12} /> Most Popular Tier
                    </div>
                  )}

                  <div>
                    {/* Tier Title & Description */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-space text-xl font-bold text-[#F1F1F1] flex items-center gap-2">
                          {plan.name}
                          {isPro && <Crown size={16} className="text-amber-400" />}
                        </h3>
                        <p className="text-xs text-[#888888] mt-1 line-clamp-2">
                          {plan.description || (numPrice === 0 ? 'Essential starter sandbox and trial capabilities.' : 'Full catalog scale for active teams.')}
                        </p>
                      </div>
                    </div>

                    {/* Price Tag */}
                    <div className="my-6 pb-6 border-b border-white/5 flex items-baseline gap-1.5">
                      <span className="font-space text-4xl font-bold text-[#F1F1F1]">
                        ₹{price}
                      </span>
                      <span className="text-xs font-medium text-[#888888]">
                        {numPrice === 0 ? '/ 7 days trial' : '/ month'}
                      </span>
                    </div>

                    {/* Feature Bullets */}
                    <div className="space-y-3.5 mb-8">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#E2DCC8]/60 font-heading">
                        Plan Includes:
                      </p>

                      <div className="flex items-center gap-3 text-xs text-[#E2DCC8]/90">
                        <div className="w-5 h-5 rounded-[4px] bg-[#0F3D3E]/40 border border-[#0F3D3E] flex items-center justify-center shrink-0 text-[#E2DCC8]">
                          <BookOpen size={11} />
                        </div>
                        <span className="font-medium">
                          <strong>{plan.features?.max_catalogs || 1}</strong> Active Catalog Projects
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#E2DCC8]/90">
                        <div className="w-5 h-5 rounded-[4px] bg-[#0F3D3E]/40 border border-[#0F3D3E] flex items-center justify-center shrink-0 text-[#E2DCC8]">
                          <Package size={11} />
                        </div>
                        <span className="font-medium">
                          <strong>{plan.features?.max_products || 50}</strong> Inventory Items
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#E2DCC8]/90">
                        <div className="w-5 h-5 rounded-[4px] bg-[#0F3D3E]/40 border border-[#0F3D3E] flex items-center justify-center shrink-0 text-[#E2DCC8]">
                          <HardDrive size={11} />
                        </div>
                        <span className="font-medium">
                          <strong>{plan.features?.max_storage_mb ? (plan.features.max_storage_mb >= 1024 ? `${plan.features.max_storage_mb / 1024}GB` : `${plan.features.max_storage_mb}MB`) : '500MB'}</strong> Asset Storage
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#E2DCC8]/90">
                        <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center shrink-0 border ${
                          plan.features?.custom_watermark 
                            ? 'bg-[#0F3D3E]/40 border-[#0F3D3E] text-[#E2DCC8]' 
                            : 'bg-white/5 border-white/10 text-[#666666]'
                        }`}>
                          <Layers size={11} />
                        </div>
                        <span className={plan.features?.custom_watermark ? "font-medium" : "text-[#777777]"}>
                          {plan.features?.custom_watermark ? 'Custom Watermark & Logo' : 'Includes catalogmakerr Watermark'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#E2DCC8]/90">
                        <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center shrink-0 border ${
                          plan.features?.ai_enabled 
                            ? 'bg-[#0F3D3E]/40 border-[#0F3D3E] text-[#E2DCC8]' 
                            : 'bg-white/5 border-white/10 text-[#666666]'
                        }`}>
                          <Sparkles size={11} />
                        </div>
                        <span className={plan.features?.ai_enabled ? "font-medium" : "text-[#777777]"}>
                          {plan.features?.ai_enabled ? 'AI Product Layout Generator' : 'Standard Layout Grids'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Upgrade Button */}
                  <button
                    disabled={isCurrent}
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3.5 rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-[#202020] text-[#666666] border border-[#2e2e2e] cursor-default'
                        : isGrowth
                          ? 'bg-[#0F3D3E] hover:bg-[#155455] text-white border border-[#E2DCC8]/40 shadow-lg shadow-[#0F3D3E]/30 active:scale-98'
                          : 'bg-[#1b1b1b] hover:bg-[#252525] text-white border border-[#333333] active:scale-98'
                    }`}
                  >
                    {isCurrent ? (
                      <span className="flex items-center gap-1.5"><Check size={14} /> Current Active Tier</span>
                    ) : (
                      <span>{numPrice === 0 ? 'Start Free Trial' : `Upgrade to ${plan.name}`}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Feature Comparison Matrix */}
        {displayPlans.length > 0 && (
          <div className="mt-20 border border-[#262626] rounded-[6px] bg-[#141414] overflow-hidden shadow-xl">
            <div className="px-6 py-4.5 border-b border-[#262626] bg-[#181818] flex items-center justify-between">
              <div>
                <h4 className="font-space text-base font-bold text-[#F1F1F1]">Detailed Feature Breakdown</h4>
                <p className="text-xs text-[#888888]">Comprehensive comparison of all available subscription tiers</p>
              </div>
              <ShieldCheck size={18} className="text-[#E2DCC8]" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#262626] text-[10px] font-bold uppercase tracking-wider text-[#888888] font-heading">
                    <th className="p-4 pl-6">Feature</th>
                    {displayPlans.map((plan: any) => (
                      <th key={plan.id} className="p-4 text-center font-bold text-[#E2DCC8]">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  <tr>
                    <td className="p-4 pl-6 text-[#E2DCC8]">Active Catalogs Limit</td>
                    {displayPlans.map((plan: any) => (
                      <td key={plan.id} className="p-4 text-center text-[#888888]">
                        {plan.features?.max_catalogs || 1} Catalogs
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-6 text-[#E2DCC8]">Max Products in Inventory</td>
                    {displayPlans.map((plan: any) => (
                      <td key={plan.id} className="p-4 text-center text-[#888888]">
                        {plan.features?.max_products || 50} Items
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-6 text-[#E2DCC8]">Asset Storage Limit</td>
                    {displayPlans.map((plan: any) => (
                      <td key={plan.id} className="p-4 text-center text-[#888888]">
                        {plan.features?.max_storage_mb ? `${plan.features.max_storage_mb} MB` : '500 MB'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-6 text-[#E2DCC8]">Remove catalogmakerr Watermark</td>
                    {displayPlans.map((plan: any) => (
                      <td key={plan.id} className="p-4 text-center">
                        {plan.features?.custom_watermark ? (
                          <CheckCircle2 size={15} className="mx-auto text-emerald-400" />
                        ) : (
                          <XCircle size={15} className="mx-auto text-red-500/60" />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-4 pl-6 text-[#E2DCC8]">AI Product Grid Auto-Assembly</td>
                    {displayPlans.map((plan: any) => (
                      <td key={plan.id} className="p-4 text-center">
                        {plan.features?.ai_enabled ? (
                          <CheckCircle2 size={15} className="mx-auto text-emerald-400" />
                        ) : (
                          <XCircle size={15} className="mx-auto text-red-500/60" />
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Enterprise Assistance */}
        <div className="mt-16 text-center space-y-3">
          <p className="text-xs text-[#888888]">
            Need high-volume multi-brand catalog setup or custom ERP integration?{' '}
            <button onClick={() => alert("Please reach out to support@catalogmakerr.com for custom enterprise volume pricing.")} className="text-[#E2DCC8] hover:underline font-semibold font-heading">
              Talk to Enterprise Solutions
            </button>
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-[#666666] uppercase tracking-widest font-heading">
            <Lock size={12} /> Powered by 256-Bit SSL Encrypted Gateway
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingView;

