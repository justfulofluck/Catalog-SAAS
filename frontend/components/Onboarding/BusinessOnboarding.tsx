import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { authApi, subscriptionApi } from '../../client';
import { CURRENCIES } from '../../constants';
import {
  Check,
  Building2,
  Mail,
  Phone,
  MapPin,
  Coins,
  Palette,
  Upload,
  Globe,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Crown,
  Layers,
  HardDrive,
  BookOpen,
  Package,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { AppIcon } from '../Common/AppIcon';
import { GradientBlinds } from '../Common/GradientBlinds';

interface ProductFieldItem {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  isStandard?: boolean;
}

const DEFAULT_PRODUCT_FIELDS: ProductFieldItem[] = [
  { id: 'name', name: 'Product Title / Name', type: 'text', enabled: true, isStandard: true },
];

const INDUSTRIES = [
  'Fashion & Apparel',
  'Jewelry & Accessories',
  'Home Decor & Furniture',
  'Electronics & Gadgets',
  'Manufacturing & Industrial (B2B)',
  'Cosmetics & Personal Care',
  'Food & Beverages / FMCG',
  'Automotive & Spare Parts',
  'Other Commercial Goods',
];

const BRAND_COLORS = [
  '#0F3D3E',
  '#165B5D',
  '#2563EB',
  '#4F46E5',
  '#7C3AED',
  '#DB2777',
  '#DC2626',
  '#D97706',
  '#059669',
  '#18181B',
];

export const BusinessOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = (searchParams.get('token') || '').trim();

  const { user, updateUser, setDefaultCurrency, defaultCurrency, showToast, checkAuth } = useStore();

  // Verification & Onboarding Mode
  const [tokenVerifying, setTokenVerifying] = useState(!!token);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingName, setPendingName] = useState('');

  // Total steps: If onboarding via registration link with token:
  // Step 1: Plan, Step 2: Profile, Step 3: Contact, Step 4: Fields.
  // If already logged in, 3 steps: Profile, Contact, Fields.
  const isRegistrationMode = !!token;
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchMessage, setLaunchMessage] = useState('Initializing workspace...');

  // Step: Plan Selection (Registration mode)
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string>('starter');
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Step: Company Profile & Brand Identity
  const [companyName, setCompanyName] = useState(user?.businessName || '');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [website, setWebsite] = useState('');
  const [accentColor, setAccentColor] = useState('#0F3D3E');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Step: Contact & Store
  const [whatsapp, setWhatsapp] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency || '₹');

  // Step: Product Fields & Catalog Schema
  const [fields, setFields] = useState<ProductFieldItem[]>(DEFAULT_PRODUCT_FIELDS);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');

  // 1. Verify token if present
  useEffect(() => {
    if (token) {
      setTokenVerifying(true);
      authApi.verifyRegistrationToken(token)
        .then((res: any) => {
          if (res?.valid) {
            setPendingEmail(res.email || '');
            setPendingName(res.name || '');
            if (res.name && !companyName) {
              setCompanyName(res.name);
            }
            if (res.email) {
              setContactEmail(res.email);
            }
          }
        })
        .catch((err: any) => {
          const msg = err.response?.data?.error || 'Your verification link is invalid or has expired. Please sign up again.';
          setTokenError(msg);
        })
        .finally(() => {
          setTokenVerifying(false);
        });
    }
  }, [token]);

  // 2. Fetch plans for plan selection step
  useEffect(() => {
    if (isRegistrationMode) {
      setLoadingPlans(true);
      subscriptionApi.getPlans()
        .then((res: any) => {
          const data = res?.data || res;
          let list = Array.isArray(data) && data.length > 0 ? data : [];
          
          // Ensure all standard tiers are present
          const hasGrowth = list.some((p: any) => p.slug === 'growth');
          const hasPro = list.some((p: any) => p.slug === 'pro');

          if (!hasGrowth || !hasPro || list.length === 0) {
            const fallbackTiers = [
              {
                id: 'starter',
                name: 'Starter Plan',
                slug: 'starter',
                price: 0,
                description: 'Essential starter sandbox and trial capabilities.',
                features: { max_catalogs: 3, max_products: 50, pdf_export: true, max_storage_mb: 500 }
              },
              {
                id: 'growth',
                name: 'Growth Plan',
                slug: 'growth',
                price: 999,
                description: 'Full catalog scale for active commercial teams.',
                features: { max_catalogs: 25, max_products: 500, pdf_export: true, max_storage_mb: 2048, priority_support: true }
              },
              {
                id: 'pro',
                name: 'Pro Enterprise',
                slug: 'pro',
                price: 2499,
                description: 'High-volume production with priority support and unlimited scale.',
                features: { max_catalogs: 100, max_products: 5000, pdf_export: true, max_storage_mb: 10240, ai_enabled: true, priority_support: true }
              }
            ];

            const merged = [...list];
            fallbackTiers.forEach(fallback => {
              if (!merged.some(m => m.slug === fallback.slug)) {
                merged.push(fallback);
              }
            });
            list = merged.sort((a, b) => Number(a.price) - Number(b.price));
          }

          setPlans(list);
        })
        .catch(() => {
          setPlans([
            {
              id: 'starter',
              name: 'Starter Plan',
              slug: 'starter',
              price: 0,
              description: 'Essential starter sandbox and trial capabilities.',
              features: { max_catalogs: 3, max_products: 50, pdf_export: true, max_storage_mb: 500 }
            },
            {
              id: 'growth',
              name: 'Growth Plan',
              slug: 'growth',
              price: 999,
              description: 'Full catalog scale for active commercial teams.',
              features: { max_catalogs: 25, max_products: 500, pdf_export: true, max_storage_mb: 2048, priority_support: true }
            },
            {
              id: 'pro',
              name: 'Pro Enterprise',
              slug: 'pro',
              price: 2499,
              description: 'High-volume production with priority support and unlimited scale.',
              features: { max_catalogs: 100, max_products: 5000, pdf_export: true, max_storage_mb: 10240, ai_enabled: true, priority_support: true }
            }
          ]);
        })
        .finally(() => {
          setLoadingPlans(false);
        });
    }
  }, [isRegistrationMode]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleField = (id: string) => {
    setFields(prev =>
      prev.map(f => (f.id === id && !f.isStandard ? { ...f, enabled: !f.enabled } : f))
    );
  };

  const handleAddCustomField = () => {
    if (!newFieldName.trim()) return;
    const customId = `custom_${Date.now()}`;
    setFields(prev => [
      ...prev,
      { id: customId, name: newFieldName.trim(), type: newFieldType, enabled: true, isStandard: false }
    ]);
    setNewFieldName('');
  };

  const handleRemoveField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const totalSteps = isRegistrationMode ? 4 : 3;

  const handleNext = () => {
    if (isRegistrationMode) {
      // Step 1: Plan
      if (step === 1) {
        if (!selectedPlanSlug) {
          showToast('Please select a plan to continue', 'warning', 'Select Plan');
          return;
        }
        setStep(2);
        return;
      }

      // Step 2: Company Profile
      if (step === 2) {
        if (!companyName.trim()) {
          showToast('Please enter your company or brand name', 'warning', 'Company Name Required');
          return;
        }
        setStep(3);
        return;
      }

      // Step 3: Contact & Store
      if (step === 3) {
        setStep(4);
        return;
      }

      // Step 4: Product Schema -> Submit
      if (step === 4) {
        handleComplete();
      }
    } else {
      // Existing logged-in user mode
      if (step === 1) {
        if (!companyName.trim()) {
          showToast('Please enter your company or brand name', 'warning', 'Company Name Required');
          return;
        }
        setStep(2);
        return;
      }

      if (step === 2) {
        setStep(3);
        return;
      }

      if (step === 3) {
        handleComplete();
      }
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const workspaceConfig = {
        companyName: companyName.trim(),
        industry,
        website: website.trim(),
        accentColor,
        logo: logoPreview,
        whatsapp: whatsapp.trim(),
        contactEmail: contactEmail.trim(),
        address: address.trim(),
        currency,
        productFields: fields.filter(f => f.enabled),
        completedAt: new Date().toISOString(),
      };

      if (isRegistrationMode) {
        // Complete registration atomically! Save user and workspace to database.
        const payload = {
          token,
          company_name: companyName.trim(),
          plan_slug: selectedPlanSlug,
          currency,
          industry,
          website: website.trim(),
          whatsapp: whatsapp.trim(),
          contact_email: contactEmail.trim(),
          address: address.trim(),
          accent_color: accentColor,
          product_fields: fields.filter(f => f.enabled),
        };

        const res: any = await authApi.completeOnboarding(payload);

        // Save JWT tokens returned by server
        if (res.access_token || res.access) {
          localStorage.setItem('cs_access_token', res.access_token || res.access);
        }
        if (res.refresh_token || res.refresh) {
          localStorage.setItem('cs_refresh_token', res.refresh_token || res.refresh);
        }

        // Store config and update global store state
        localStorage.setItem('catalogmakerr_workspace_config', JSON.stringify(workspaceConfig));
        setDefaultCurrency(currency);

        if (res.user) {
          updateUser(res.user);
        }
        await checkAuth();

        // 3-SECOND LOGO ANIMATION SEQUENCE
        setIsLaunching(true);
        setLaunchMessage('Activating your subscription...');
        setTimeout(() => setLaunchMessage('Provisioning publishing engine & catalog templates...'), 1000);
        setTimeout(() => setLaunchMessage('Welcome aboard! Launching Studio...'), 2000);

        setTimeout(() => {
          showToast('Registration complete! Welcome to catalogmakerr.', 'success', 'Account Activated');
          navigate('/', { replace: true });
        }, 3000);
      } else {
        // Logged-in user updating workspace settings
        await authApi.updateUser({
          business_name: companyName.trim(),
        });
        updateUser({
          businessName: companyName.trim(),
        });
        setDefaultCurrency(currency);
        localStorage.setItem('catalogmakerr_workspace_config', JSON.stringify(workspaceConfig));

        // 3-SECOND LOGO ANIMATION SEQUENCE
        setIsLaunching(true);
        setLaunchMessage('Saving workspace settings...');
        setTimeout(() => setLaunchMessage('Syncing brand identity & catalog schemas...'), 1000);
        setTimeout(() => setLaunchMessage('Ready! Opening Studio...'), 2000);

        setTimeout(() => {
          showToast('Workspace and catalog profile updated successfully!', 'success', 'Setup Saved');
          navigate('/', { replace: true });
        }, 3000);
      }
    } catch (err: any) {
      console.error('Onboarding save error:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to complete workspace setup.';
      showToast(errMsg, 'error', 'Error');
      setIsLaunching(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Token Invalid State
  if (isRegistrationMode && tokenError) {
    return (
      <div className="min-h-screen bg-[#100F0F] text-[#F1F1F1] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="w-full max-w-md bg-[#161616]/95 border border-red-500/30 rounded-[8px] p-8 shadow-2xl text-center space-y-5 backdrop-blur-xl">
          <div className="w-14 h-14 bg-red-950/40 border border-red-500/30 text-red-400 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#F1F1F1] font-heading">Link Expired or Invalid</h2>
            <p className="text-xs text-[#888888] mt-2">{tokenError}</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3.5 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/20 rounded-[4px] font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            Go to Sign Up / Log In
          </button>
        </div>
      </div>
    );
  }

  // Render 3-Second Launching Transition Animation Screen
  if (isLaunching) {
    return (
      <div className="fixed inset-0 z-[200] bg-[#100F0F] text-[#F1F1F1] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden select-none">
        {/* Ambient Glow & Blur in background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0F3D3E]/60 via-[#100F0F]/80 to-[#100F0F] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-7 max-w-sm">
          {/* Pulsing & Glowing Logo Animation */}
          <div className="relative flex items-center justify-center">
            {/* Outer Glowing Ring */}
            <div className="absolute w-36 h-36 rounded-full border-2 border-[#00E5D0]/30 animate-ping opacity-60 pointer-events-none" />
            <div className="absolute w-28 h-28 rounded-full bg-[#00E5D0]/10 blur-xl animate-pulse pointer-events-none" />
            <div className="w-24 h-24 rounded-2xl bg-[#161616] border border-[#E2DCC8]/30 shadow-2xl shadow-[#00E5D0]/30 flex items-center justify-center relative z-10 transition-transform duration-700 animate-bounce">
              <AppIcon size={52} withGlow={true} />
            </div>
          </div>

          {/* Brand Name & Tagline */}
          <div className="space-y-1.5 animate-in fade-in duration-500">
            <h2 className="font-bold text-3xl tracking-tight font-heading text-[#F1F1F1]">
              catalogmakerr<span className="text-[#00E5D0]">.</span>
            </h2>
            <p className="text-xs text-[#E2DCC8]/80 font-medium tracking-wide">
              {launchMessage}
            </p>
          </div>

          {/* Progress Shimmer Bar */}
          <div className="w-64 h-1.5 bg-[#1b1b1b] rounded-full overflow-hidden border border-[#2e2e2e] relative shadow-inner">
            <div className="h-full bg-gradient-to-r from-[#0F3D3E] via-[#00E5D0] to-[#E2DCC8] rounded-full animate-pulse transition-all duration-300 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#100F0F] text-[#F1F1F1] flex flex-col font-sans selection:bg-[#0F3D3E] selection:text-white relative overflow-x-hidden">
      {/* Interactive WebGL Gradient Blinds Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <GradientBlinds
          gradientColors={['#0F3D3E', '#165B5D', '#4F46E5', '#E2DCC8']}
          angle={20}
          noise={0.25}
          blindCount={14}
          blindMinWidth={55}
          spotlightRadius={0.55}
          spotlightSoftness={1}
          spotlightOpacity={1}
          mouseDampening={0.15}
          distortAmount={0}
          shineDirection="left"
          mixBlendMode="screen"
        />
        <div className="absolute inset-0 bg-[#100F0F]/80 backdrop-blur-3xl" />
      </div>

      {/* Top Header Stepper */}
      <header className="w-full border-b border-[#262626] bg-[#161616]/90 backdrop-blur-xl sticky top-0 z-30 shadow-xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppIcon size={26} withGlow={false} />
            <span className="font-bold text-lg tracking-tight font-heading text-[#F1F1F1]">
              catalogmakerr<span className="text-[#00E5D0]">.</span>
            </span>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center gap-2 sm:gap-4">
            {isRegistrationMode ? (
              <>
                {/* Step 1: Plan */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      step > 1
                        ? 'bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/40'
                        : step === 1
                        ? 'bg-[#0F3D3E] text-[#F1F1F1] ring-2 ring-[#E2DCC8]/50 border border-[#E2DCC8]'
                        : 'bg-[#1e1e1e] text-[#666666] border border-[#2e2e2e]'
                    }`}
                  >
                    {step > 1 ? <Check size={13} strokeWidth={3} /> : '1'}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${step === 1 ? 'text-[#E2DCC8] font-bold' : 'text-[#777777]'}`}>
                    Plan
                  </span>
                </div>

                <div className={`w-4 sm:w-8 h-[1.5px] transition-colors ${step > 1 ? 'bg-[#0F3D3E]' : 'bg-[#262626]'}`} />

                {/* Step 2: Company */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      step > 2
                        ? 'bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/40'
                        : step === 2
                        ? 'bg-[#0F3D3E] text-[#F1F1F1] ring-2 ring-[#E2DCC8]/50 border border-[#E2DCC8]'
                        : 'bg-[#1e1e1e] text-[#666666] border border-[#2e2e2e]'
                    }`}
                  >
                    {step > 2 ? <Check size={13} strokeWidth={3} /> : '2'}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${step === 2 ? 'text-[#E2DCC8] font-bold' : 'text-[#777777]'}`}>
                    Company Profile
                  </span>
                </div>

                <div className={`w-4 sm:w-8 h-[1.5px] transition-colors ${step > 2 ? 'bg-[#0F3D3E]' : 'bg-[#262626]'}`} />

                {/* Step 3: Contact */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      step > 3
                        ? 'bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/40'
                        : step === 3
                        ? 'bg-[#0F3D3E] text-[#F1F1F1] ring-2 ring-[#E2DCC8]/50 border border-[#E2DCC8]'
                        : 'bg-[#1e1e1e] text-[#666666] border border-[#2e2e2e]'
                    }`}
                  >
                    {step > 3 ? <Check size={13} strokeWidth={3} /> : '3'}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${step === 3 ? 'text-[#E2DCC8] font-bold' : 'text-[#777777]'}`}>
                    Contact & Store
                  </span>
                </div>

                <div className={`w-4 sm:w-8 h-[1.5px] transition-colors ${step > 3 ? 'bg-[#0F3D3E]' : 'bg-[#262626]'}`} />

                {/* Step 4: Fields */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                      step === 4
                        ? 'bg-[#0F3D3E] text-[#F1F1F1] ring-2 ring-[#E2DCC8]/50 border border-[#E2DCC8]'
                        : 'bg-[#1e1e1e] text-[#666666] border border-[#2e2e2e]'
                    }`}
                  >
                    4
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${step === 4 ? 'text-[#E2DCC8] font-bold' : 'text-[#777777]'}`}>
                    Product Schema
                  </span>
                </div>
              </>
            ) : (
              <>
                {/* 3 Step Stepper for Logged-in User */}
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step > 1 ? 'bg-[#0F3D3E] text-[#E2DCC8]' : step === 1 ? 'bg-[#0F3D3E] text-[#F1F1F1] ring-2 ring-[#E2DCC8]/50' : 'bg-[#1e1e1e] text-[#666666] border border-[#2e2e2e]'}`}>
                    {step > 1 ? <Check size={13} strokeWidth={3} /> : '1'}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${step === 1 ? 'text-[#E2DCC8] font-bold' : 'text-[#777777]'}`}>
                    Company Profile
                  </span>
                </div>

                <div className={`w-8 sm:w-12 h-[1.5px] ${step > 1 ? 'bg-[#0F3D3E]' : 'bg-[#262626]'}`} />

                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step > 2 ? 'bg-[#0F3D3E] text-[#E2DCC8]' : step === 2 ? 'bg-[#0F3D3E] text-[#F1F1F1] ring-2 ring-[#E2DCC8]/50' : 'bg-[#1e1e1e] text-[#666666] border border-[#2e2e2e]'}`}>
                    {step > 2 ? <Check size={13} strokeWidth={3} /> : '2'}
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${step === 2 ? 'text-[#E2DCC8] font-bold' : 'text-[#777777]'}`}>
                    Contact & Store
                  </span>
                </div>

                <div className={`w-8 sm:w-12 h-[1.5px] ${step > 2 ? 'bg-[#0F3D3E]' : 'bg-[#262626]'}`} />

                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === 3 ? 'bg-[#0F3D3E] text-[#F1F1F1] ring-2 ring-[#E2DCC8]/50' : 'bg-[#1e1e1e] text-[#666666] border border-[#2e2e2e]'}`}>
                    3
                  </div>
                  <span className={`text-xs font-medium hidden sm:inline ${step === 3 ? 'text-[#E2DCC8] font-bold' : 'text-[#777777]'}`}>
                    Product Fields
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="text-xs font-medium text-[#888888] font-mono">
            Step {step} of {totalSteps}
          </div>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10">
        <div className={`w-full ${isRegistrationMode && step === 1 ? 'max-w-5xl' : 'max-w-xl'} mx-auto py-6 sm:py-8`}>

          {/* STEP: CHOOSE PLAN (Registration Mode Only) */}
          {isRegistrationMode && step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center max-w-xl mx-auto mb-8">
                <span className="text-[10px] font-bold tracking-widest uppercase text-[#00E5D0] bg-[#0F3D3E]/40 border border-[#00E5D0]/30 px-3 py-1 rounded-full font-heading">
                  Step 1 • Welcome {pendingName || 'Partner'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F1F1] font-heading mt-3">
                  Choose your starting plan
                </h1>
                <p className="text-xs text-[#888888] mt-2">
                  Start with our 7-day free trial or unlock unlimited growth features right away. No upfront charges during setup.
                </p>
              </div>

              {loadingPlans ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-[#00E5D0]" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                  {plans.map((p) => {
                    const isSelected = selectedPlanSlug === p.slug;
                    const isGrowth = p.slug === 'growth';
                    const isPro = p.slug === 'pro';
                    const numPrice = Number(p.price || 0);

                    return (
                      <div
                        key={p.slug || p.id}
                        onClick={() => setSelectedPlanSlug(p.slug)}
                        className={`rounded-[8px] p-6 border transition-all cursor-pointer flex flex-col justify-between relative text-left ${
                          isSelected
                            ? 'bg-[#151515] border-[#E2DCC8] ring-2 ring-[#E2DCC8]/40 shadow-2xl shadow-[#0F3D3E]/30 scale-[1.02]'
                            : 'bg-[#161616]/95 border-[#262626] hover:border-[#383838] hover:bg-[#1a1a1a] shadow-lg'
                        }`}
                      >
                        {isGrowth && !isSelected && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/30 px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1 font-heading">
                            <Sparkles size={10} /> Most Popular
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8] px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1 font-heading">
                            <Check size={11} strokeWidth={3} /> Selected
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-lg text-[#F1F1F1] font-heading flex items-center gap-1.5">
                              {p.name}
                              {isPro && <Crown size={15} className="text-amber-400" />}
                            </h3>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              isSelected ? 'border-[#E2DCC8] bg-[#E2DCC8] text-[#100F0F]' : 'border-[#444]'
                            }`}>
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </div>
                          </div>

                          <p className="text-[11px] text-[#888888] min-h-[32px] line-clamp-2">
                            {p.description || (numPrice === 0 ? 'Essential starter sandbox and trial capabilities.' : 'Full catalog scale for active teams.')}
                          </p>

                          <div className="my-4 pb-4 border-b border-[#262626] flex items-baseline gap-1">
                            <span className="text-3xl font-extrabold text-[#F1F1F1] font-heading">
                              ₹{numPrice}
                            </span>
                            <span className="text-xs text-[#888888] font-medium">
                              {numPrice === 0 ? '/ 7 days free' : '/ month'}
                            </span>
                          </div>

                          <ul className="space-y-2.5 text-xs text-[#aaaaaa] mb-6">
                            <li className="flex items-center gap-2">
                              <Check size={14} className="text-[#00E5D0] shrink-0" />
                              <span>{p.features?.max_catalogs || 3} Active Catalogs</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check size={14} className="text-[#00E5D0] shrink-0" />
                              <span>{p.features?.max_products || 50} Products per Catalog</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check size={14} className="text-[#00E5D0] shrink-0" />
                              <span>High-Res PDF Export & WhatsApp Share</span>
                            </li>
                            {p.features?.priority_support && (
                              <li className="flex items-center gap-2">
                                <Check size={14} className="text-[#00E5D0] shrink-0" />
                                <span>Priority 24/7 Dedicated Support</span>
                              </li>
                            )}
                          </ul>
                        </div>

                        <button
                          type="button"
                          className={`w-full py-2.5 rounded-[4px] font-heading font-semibold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/50 shadow-md'
                              : 'bg-[#1b1b1b] text-[#888888] border border-[#2e2e2e] hover:text-white hover:border-[#444]'
                          }`}
                        >
                          {isSelected ? 'Selected Tier' : 'Choose Plan'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP: COMPANY PROFILE (Step 2 in reg mode, Step 1 for existing user) */}
          {((isRegistrationMode && step === 2) || (!isRegistrationMode && step === 1)) && (
            <div className="bg-[#161616]/95 border border-[#262626] rounded-[8px] p-7 md:p-8 shadow-2xl backdrop-blur-xl space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F1] font-heading">
                  Create your workspace
                </h1>
                <p className="text-xs text-[#888888] mt-1">
                  Configure your brand identity and workspace details for your catalogs.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading">
                    Workspace / Brand name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Lifestyle"
                    className="w-full bg-[#171616] border border-[#262626] rounded-[4px] px-4 py-3 text-sm text-[#F1F1F1] placeholder:text-[#555] focus:border-[#E2DCC8] focus:ring-1 focus:ring-[#E2DCC8]/30 outline-none transition-all"
                    autoFocus
                  />
                </div>

                {/* Industry Niche */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading">
                    Industry / Business Niche
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-[#171616] border border-[#262626] rounded-[4px] px-4 py-3 text-sm text-[#F1F1F1] focus:border-[#E2DCC8] focus:ring-1 focus:ring-[#E2DCC8]/30 outline-none transition-all cursor-pointer"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind} className="bg-[#171616] text-[#F1F1F1]">
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Logo Upload & Preview */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading">
                    Brand Logo
                  </label>
                  <div className="flex items-center gap-4 p-4 border border-dashed border-[#333] rounded-[4px] bg-[#1a1a1a]/60 hover:bg-[#1a1a1a] transition-colors">
                    {logoPreview ? (
                      <div className="w-14 h-14 rounded-[4px] border border-[#333] bg-[#111] p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                        <img
                          src={logoPreview}
                          alt="Logo Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-[4px] border border-[#333] bg-[#171616] flex items-center justify-center text-[#666] shrink-0">
                        <Building2 size={24} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#222] border border-[#333] hover:border-[#555] rounded-[4px] text-xs font-semibold text-[#F1F1F1] cursor-pointer transition-all">
                        <Upload size={14} className="text-[#00E5D0]" />
                        <span>{logoPreview ? 'Change Logo' : 'Upload Logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-[#666] mt-1">PNG, JPG or SVG. Displays on catalog covers and headers.</p>
                    </div>
                  </div>
                </div>

                {/* Brand Primary Accent Color */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading flex items-center justify-between">
                    <span>Brand Accent Color</span>
                    <span className="font-mono text-[#E2DCC8] text-[11px]">{accentColor}</span>
                  </label>
                  <div className="flex items-center gap-2.5 flex-wrap pt-1">
                    {BRAND_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setAccentColor(col)}
                        style={{ backgroundColor: col }}
                        className={`w-7 h-7 rounded-full border transition-all cursor-pointer ${
                          accentColor === col
                            ? 'ring-2 ring-[#E2DCC8] ring-offset-2 ring-offset-[#161616] scale-110 border-white'
                            : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                      />
                    ))}
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-7 h-7 rounded-full border border-[#444] cursor-pointer p-0 overflow-hidden bg-transparent"
                      title="Custom Color"
                    />
                  </div>
                </div>

                {/* Online Store / Website */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading">
                    Website or Online Store (Optional)
                  </label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666]" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourbrand.com"
                      className="w-full bg-[#171616] border border-[#262626] rounded-[4px] pl-10 pr-4 py-3 text-sm text-[#F1F1F1] placeholder:text-[#555] focus:border-[#E2DCC8] focus:ring-1 focus:ring-[#E2DCC8]/30 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP: CONTACT & STORE (Step 3 in reg mode, Step 2 for existing user) */}
          {((isRegistrationMode && step === 3) || (!isRegistrationMode && step === 2)) && (
            <div className="bg-[#161616]/95 border border-[#262626] rounded-[8px] p-7 md:p-8 shadow-2xl backdrop-blur-xl space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F1] font-heading">
                  Contact & Inquiry Details
                </h1>
                <p className="text-xs text-[#888888] mt-1">
                  These details will appear in your catalog footers and order inquiry cards.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {/* WhatsApp Phone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading">
                    WhatsApp / Direct Inquiry Phone
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666]" />
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#171616] border border-[#262626] rounded-[4px] pl-10 pr-4 py-3 text-sm text-[#F1F1F1] placeholder:text-[#555] focus:border-[#E2DCC8] focus:ring-1 focus:ring-[#E2DCC8]/30 outline-none transition-all"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-[#666] ml-1">Customers can tap to order directly on WhatsApp from your digital flipbooks.</p>
                </div>

                {/* Business Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading">
                    Business Inquiries Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666]" />
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="orders@company.com"
                      className="w-full bg-[#171616] border border-[#262626] rounded-[4px] pl-10 pr-4 py-3 text-sm text-[#F1F1F1] placeholder:text-[#555] focus:border-[#E2DCC8] focus:ring-1 focus:ring-[#E2DCC8]/30 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Business Address */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading">
                    Store / Office Address
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-3 text-[#666]" />
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Suite 401, Fashion Avenue, Mumbai, India"
                      className="w-full bg-[#171616] border border-[#262626] rounded-[4px] pl-10 pr-4 py-2.5 text-sm text-[#F1F1F1] placeholder:text-[#555] focus:border-[#E2DCC8] focus:ring-1 focus:ring-[#E2DCC8]/30 outline-none resize-none transition-all"
                    />
                  </div>
                </div>

                {/* Default Currency */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading">
                    Default Currency & Pricing Symbol
                  </label>
                  <div className="relative">
                    <Coins size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666]" />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-[#171616] border border-[#262626] rounded-[4px] pl-10 pr-4 py-3 text-sm text-[#F1F1F1] focus:border-[#E2DCC8] focus:ring-1 focus:ring-[#E2DCC8]/30 outline-none transition-all cursor-pointer"
                    >
                      {CURRENCIES.map((curr) => (
                        <option key={curr.code} value={curr.symbol} className="bg-[#171616] text-[#F1F1F1]">
                          {curr.symbol} — {curr.label} ({curr.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP: PRODUCT FIELDS (Step 4 in reg mode, Step 3 for existing user) */}
          {((isRegistrationMode && step === 4) || (!isRegistrationMode && step === 3)) && (
            <div className="bg-[#161616]/95 border border-[#262626] rounded-[8px] p-7 md:p-8 shadow-2xl backdrop-blur-xl space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#F1F1F1] font-heading">
                  Product Details & Schema
                </h1>
                <p className="text-xs text-[#888888] mt-1">
                  Choose which product fields your catalogs should support. You can always change this later.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    onClick={() => toggleField(field.id)}
                    className={`flex items-center justify-between p-3.5 rounded-[4px] border transition-all ${
                      field.enabled
                        ? 'border-[#333] bg-[#1a1a1a] shadow-xs'
                        : 'border-[#222] bg-[#141414] opacity-50'
                    } ${field.isStandard ? 'cursor-default' : 'cursor-pointer hover:border-[#444]'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-[3px] flex items-center justify-center transition-colors ${
                          field.enabled
                            ? 'bg-[#0F3D3E] border border-[#E2DCC8]/40 text-[#E2DCC8]'
                            : 'border border-[#333] bg-[#171616]'
                        }`}
                      >
                        {field.enabled && <Check size={12} strokeWidth={3} />}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-[#F1F1F1]">
                          {field.name}
                        </span>
                        {field.isStandard && (
                          <span className="ml-2 text-[9px] font-semibold uppercase tracking-wider text-[#E2DCC8]/70 bg-[#0F3D3E]/30 border border-[#0F3D3E] px-2 py-0.5 rounded-[2px]">
                            Standard
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#666] uppercase tracking-wider font-mono">
                        {field.type}
                      </span>
                      {!field.isStandard && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveField(field.id);
                          }}
                          className="p-1 text-[#666] hover:text-red-400 transition-colors ml-1 cursor-pointer"
                          title="Remove Field"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Custom Field */}
                <div className="pt-3 border-t border-[#262626] mt-4 space-y-3">
                  <div className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading">
                    Add New Product Field
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomField();
                        }
                      }}
                      placeholder="Field name (e.g. Selling Price, Photo, SKU, MRP, MOQ, Warranty)"
                      className="flex-1 bg-[#171616] border border-[#262626] rounded-[4px] px-4 py-2.5 text-sm text-[#F1F1F1] placeholder:text-[#555] focus:border-[#E2DCC8] focus:ring-1 focus:ring-[#E2DCC8]/30 outline-none transition-all"
                    />
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                      className="bg-[#171616] border border-[#262626] rounded-[4px] px-3 py-2.5 text-xs text-[#E2DCC8] focus:border-[#E2DCC8] outline-none transition-all cursor-pointer font-mono shrink-0"
                    >
                      <option value="text">TEXT</option>
                      <option value="currency">CURRENCY</option>
                      <option value="number">NUMBER</option>
                      <option value="image">IMAGE</option>
                      <option value="textarea">TEXTAREA</option>
                      <option value="tags">TAGS</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddCustomField}
                      disabled={!newFieldName.trim()}
                      className="px-4 py-2.5 bg-[#0F3D3E] hover:bg-[#155455] text-[#E2DCC8] border border-[#E2DCC8]/30 text-xs font-bold uppercase tracking-wider rounded-[4px] transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Plus size={14} /> Add Field
                    </button>
                  </div>

                  {/* Quick Preset Suggestions */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-[#666] font-mono mr-1">Suggestions:</span>
                    {[
                      { name: 'Selling Price', type: 'currency' },
                      { name: 'Primary Photo', type: 'image' },
                      { name: 'SKU / Code', type: 'text' },
                      { name: 'MRP / List Price', type: 'currency' },
                      { name: 'MOQ (Min Order)', type: 'number' },
                      { name: 'Short Description', type: 'textarea' },
                      { name: 'Sizes / Dimensions', type: 'tags' },
                      { name: 'Colors / Finish', type: 'tags' },
                    ].map((preset) => {
                      const alreadyAdded = fields.some(
                        (f) => f.name.toLowerCase() === preset.name.toLowerCase()
                      );
                      if (alreadyAdded) return null;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            const customId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
                            setFields((prev) => [
                              ...prev,
                              { id: customId, name: preset.name, type: preset.type, enabled: true, isStandard: false },
                            ]);
                          }}
                          className="text-[11px] px-2.5 py-1 bg-[#1a1a1a] hover:bg-[#242424] text-[#888] hover:text-[#E2DCC8] border border-[#2a2a2a] hover:border-[#444] rounded-[3px] transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={10} className="text-[#00E5D0]" /> {preset.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Footer (Back / Continue Buttons) */}
          <div className="flex items-center justify-between pt-8 border-t border-[#262626] mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev > 1 ? prev - 1 : 1))}
                className="px-6 py-2.5 border border-[#262626] hover:border-[#444] text-[#E2DCC8] bg-[#171616] hover:bg-[#1c1c1c] rounded-[4px] text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/30 rounded-[4px] font-heading font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#0F3D3E]/30 transition-all flex items-center gap-2 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Activating Workspace...</span>
                </div>
              ) : step === totalSteps ? (
                <>
                  <span>Complete Setup & Launch</span>
                  <ArrowRight size={16} className="text-[#00E5D0]" />
                </>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BusinessOnboarding;
