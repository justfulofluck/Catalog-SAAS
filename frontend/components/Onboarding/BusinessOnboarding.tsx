import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { authApi } from '../../client';
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
  ArrowRight
} from 'lucide-react';
import { AppIcon } from '../Common/AppIcon';

interface ProductFieldItem {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  isStandard?: boolean;
}

const DEFAULT_PRODUCT_FIELDS: ProductFieldItem[] = [
  { id: 'name', name: 'Product Title / Name', type: 'text', enabled: true, isStandard: true },
  { id: 'price', name: 'Selling Price', type: 'currency', enabled: true, isStandard: true },
  { id: 'image', name: 'Primary Photo', type: 'image', enabled: true, isStandard: true },
  { id: 'sku', name: 'SKU / Model Number', type: 'text', enabled: true },
  { id: 'mrp', name: 'MRP / Compare-At Price', type: 'currency', enabled: true },
  { id: 'moq', name: 'Minimum Order Quantity (MOQ)', type: 'number', enabled: true },
  { id: 'sizes', name: 'Sizes / Dimensions', type: 'tags', enabled: false },
  { id: 'colors', name: 'Color / Finish Options', type: 'tags', enabled: false },
  { id: 'material', name: 'Material / Fabric / Spec', type: 'text', enabled: false },
  { id: 'description', name: 'Short Description', type: 'textarea', enabled: true },
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
  const { user, updateUser, setDefaultCurrency, defaultCurrency, showToast } = useStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Company Profile & Brand Identity
  const [companyName, setCompanyName] = useState(user?.businessName || '');
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [website, setWebsite] = useState('');
  const [accentColor, setAccentColor] = useState('#0F3D3E');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Step 2: Contact & Store
  const [whatsapp, setWhatsapp] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [address, setAddress] = useState('');
  const [currency, setCurrency] = useState(defaultCurrency || '₹');

  // Step 3: Product Fields & Catalog Schema
  const [fields, setFields] = useState<ProductFieldItem[]>(DEFAULT_PRODUCT_FIELDS);
  const [newFieldName, setNewFieldName] = useState('');

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
      { id: customId, name: newFieldName.trim(), type: 'text', enabled: true }
    ]);
    setNewFieldName('');
  };

  const handleRemoveField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const handleNext = () => {
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
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // 1. Update User Profile on Backend
      await authApi.updateUser({
        business_name: companyName.trim(),
      });

      // 2. Sync to local state
      updateUser({
        businessName: companyName.trim(),
      });

      // 3. Set App Default Currency
      setDefaultCurrency(currency);

      // 4. Save business onboarding settings to localStorage for catalogs
      const onboardingData = {
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
      localStorage.setItem('catalogmakerr_workspace_config', JSON.stringify(onboardingData));

      showToast('Workspace and catalog profile configured successfully!', 'success', 'Welcome Aboard');
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Onboarding save error:', err);
      // Still allow them to enter studio
      showToast('Workspace ready. Welcome to catalogmakerr!', 'success', 'Setup Complete');
      navigate('/', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#111827] flex flex-col font-sans selection:bg-[#0F3D3E] selection:text-white">
      {/* Top Header Stepper (exact layout as image) */}
      <header className="w-full border-b border-gray-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AppIcon size={24} />
            <span className="font-bold text-lg tracking-tight font-heading text-black">
              catalogmakerr<span className="text-[#00B4A0]">.</span>
            </span>
          </div>

          {/* Stepper Header Navigation */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Step 1 Pill */}
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  step > 1
                    ? 'bg-black text-white'
                    : step === 1
                    ? 'bg-black text-white ring-4 ring-black/10'
                    : 'bg-gray-100 text-gray-400 border border-gray-300'
                }`}
              >
                {step > 1 ? <Check size={14} strokeWidth={3} /> : '1'}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  step === 1 ? 'text-black font-semibold' : 'text-gray-500'
                }`}
              >
                Company Profile
              </span>
            </div>

            {/* Connecting Line 1 */}
            <div
              className={`w-8 sm:w-12 h-[1.5px] transition-colors ${
                step > 1 ? 'bg-black' : 'bg-gray-200'
              }`}
            />

            {/* Step 2 Pill */}
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  step > 2
                    ? 'bg-black text-white'
                    : step === 2
                    ? 'bg-black text-white ring-4 ring-black/10'
                    : 'bg-gray-100 text-gray-400 border border-gray-300'
                }`}
              >
                {step > 2 ? <Check size={14} strokeWidth={3} /> : '2'}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  step === 2 ? 'text-black font-semibold' : 'text-gray-500'
                }`}
              >
                Contact & Store
              </span>
            </div>

            {/* Connecting Line 2 */}
            <div
              className={`w-8 sm:w-12 h-[1.5px] transition-colors ${
                step > 2 ? 'bg-black' : 'bg-gray-200'
              }`}
            />

            {/* Step 3 Pill */}
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  step === 3
                    ? 'bg-black text-white ring-4 ring-black/10'
                    : 'bg-gray-100 text-gray-400 border border-gray-300'
                }`}
              >
                3
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  step === 3 ? 'text-black font-semibold' : 'text-gray-500'
                }`}
              >
                Product Fields
              </span>
            </div>
          </div>

          <div className="text-xs font-medium text-gray-500">
            Step {step} of 3
          </div>
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl mx-auto py-6 sm:py-8">
          {/* STEP 1: COMPANY PROFILE */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 font-heading">
                  Create your workspace
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Configure your brand identity and workspace details for your catalogs.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Workspace / Brand name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Lifestyle"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-xs"
                    autoFocus
                  />
                </div>

                {/* Industry Niche */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Industry / Business Niche
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-xs cursor-pointer"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Logo Upload & Preview */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Brand Logo
                  </label>
                  <div className="flex items-center gap-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50/60 hover:bg-gray-50 transition-colors">
                    {logoPreview ? (
                      <div className="w-14 h-14 rounded-md border border-gray-200 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                        <img
                          src={logoPreview}
                          alt="Logo Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-400 shrink-0">
                        <Building2 size={24} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-300 hover:border-gray-400 rounded-md text-xs font-semibold text-gray-700 cursor-pointer shadow-xs transition-all">
                        <Upload size={14} />
                        <span>{logoPreview ? 'Change Logo' : 'Upload Logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-gray-400 mt-1">PNG, JPG or SVG. Displays on catalog covers and headers.</p>
                    </div>
                  </div>
                </div>

                {/* Brand Primary Accent Color */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                    <span>Brand Accent Color</span>
                    <span className="font-mono text-gray-500 text-[11px]">{accentColor}</span>
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {BRAND_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setAccentColor(col)}
                        style={{ backgroundColor: col }}
                        className={`w-7 h-7 rounded-full border transition-all ${
                          accentColor === col
                            ? 'ring-2 ring-black ring-offset-2 scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                      />
                    ))}
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-7 h-7 rounded-full border border-gray-300 cursor-pointer p-0 overflow-hidden"
                      title="Custom Color"
                    />
                  </div>
                </div>

                {/* Online Store / Website */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Website or Online Store (Optional)
                  </label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourbrand.com"
                      className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CONTACT & STORE */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 font-heading">
                  Contact & Inquiry Details
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  These details will appear in your catalog footers and order inquiry cards.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                {/* WhatsApp Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    WhatsApp / Direct Inquiry Phone
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-xs"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 ml-1">Customers can tap to order directly on WhatsApp from your digital flipbooks.</p>
                </div>

                {/* Business Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Business Inquiries Email
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="orders@company.com"
                      className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Business Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Store / Office Address
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-3 text-gray-400" />
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Suite 401, Fashion Avenue, Mumbai, India"
                      className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-xs resize-none"
                    />
                  </div>
                </div>

                {/* Default Currency */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Default Currency & Pricing Symbol
                  </label>
                  <div className="relative">
                    <Coins size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-xs cursor-pointer"
                    >
                      {CURRENCIES.map((curr) => (
                        <option key={curr.code} value={curr.symbol}>
                          {curr.symbol} — {curr.name} ({curr.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PRODUCT FIELDS SETUP */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 font-heading">
                  Product Fields Setup
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Choose which fields you want displayed on your catalog product cards.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    onClick={() => !field.isStandard && toggleField(field.id)}
                    className={`flex items-center justify-between p-3.5 rounded-lg border transition-all ${
                      field.enabled
                        ? 'bg-white border-black ring-1 ring-black/5 shadow-xs'
                        : 'bg-gray-50/70 border-gray-200 opacity-60 hover:opacity-100 hover:bg-white'
                    } ${field.isStandard ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-white transition-all ${
                          field.enabled ? 'bg-black' : 'border border-gray-300 bg-white'
                        }`}
                      >
                        {field.enabled && <Check size={13} strokeWidth={3} />}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          {field.name}
                        </span>
                        {field.isStandard && (
                          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                            Standard
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-mono">
                        {field.type}
                      </span>
                      {!field.isStandard && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveField(field.id);
                          }}
                          className="p-1 text-gray-300 hover:text-red-500 transition-colors ml-1"
                          title="Remove Field"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Custom Field */}
                <div className="pt-3">
                  <div className="flex items-center gap-2">
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
                      placeholder="Add custom field (e.g. Warranty, Weight, Barcode)"
                      className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomField}
                      disabled={!newFieldName.trim()}
                      className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                    >
                      <Plus size={14} /> Add Field
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Footer (Back / Continue Buttons) */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200 mt-8">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as any) : 1))}
                className="px-6 py-2.5 border border-gray-300 hover:border-gray-400 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-semibold transition-all shadow-xs cursor-pointer"
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
              className="px-8 py-3 bg-black hover:bg-gray-900 text-white rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center gap-2 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Launching Studio...</span>
                </div>
              ) : step === 3 ? (
                <>
                  <span>Complete Setup & Launch</span>
                  <ArrowRight size={16} />
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
