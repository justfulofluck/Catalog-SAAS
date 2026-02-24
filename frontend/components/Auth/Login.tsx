
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle2, User as UserIcon, Shield, KeyRound, ArrowLeft} from 'lucide-react';
import { authApi } from '../../client';

const Login: React.FC = () => {
  const { login, setView, error, plans, fetchPlans } = useStore();

  // Auth Modes: 'signin' | 'signup'
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Registration Steps: 'info' | 'plan'
  const [regStep, setRegStep] = useState<'info' | 'plan'>('info');
  const [selectedPlanSlug, setSelectedPlanSlug] = useState('starter');

  // Recovery Modes: 'none' | 'email' | 'otp'
  const [recoveryStep, setRecoveryStep] = useState<'none' | 'email' | 'otp'>('none');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Recovery State
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show error alert if exists
  React.useEffect(() => {
    if (error) {
      setIsSubmitting(false); // Stop loading if error occurs
    }
  }, [error]);

  React.useEffect(() => {
    if (!isLoginMode && regStep === 'plan') {
      fetchPlans();
    }
  }, [isLoginMode, regStep]);

  // Business Name field state needed for registration
  const [businessName, setBusinessName] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!isLoginMode) {
      // REGISTRATION FLOW

      // Step 1: Info -> Plan
      if (regStep === 'info') {
        setRegStep('plan');
        setIsSubmitting(false);
        return;
      }

      // Step 2: Submit Registration
      try {
        await authApi.register({
          email,
          username: email, // Auto-fill username with email to satisfy backend
          password: password,
          password1: password,
          password2: password,
          name,
          business_name: businessName,
          plan_slug: selectedPlanSlug
        });
        alert("Account created successfully! Please sign in.");
        setIsLoginMode(true);
        // Clear sensitive fields
        setPassword('');
      } catch (error: any) {
        console.error("Registration failed", error);

        // Handle Stale Session (User deleted but cookie remains)
        if (error.response?.status === 401) {
          await authApi.forceLogout();
          alert("Previous session state was invalid. We have cleared it. Please submit the form again.");
          setIsSubmitting(false);
          return;
        }

        // Helper to format all errors
        let errorMsg = "Registration failed.";
        if (error.response?.data) {
          const data = error.response.data;
          // Handle string errors (like 500 html or simple messages)
          if (typeof data === 'string') {
            errorMsg = data;
          } else {
            const messages = Object.keys(data).map(key => {
              const val = data[key];
              return `${key}: ${Array.isArray(val) ? val.join(' ') : val}`;
            });
            errorMsg = messages.join('\n');
          }
        }
        alert(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // LOGIN FLOW
      // Timeout is just for visual effect, but we can keep it or remove it. 
      // Keeping it small to ensure state updates match.
      setTimeout(() => {
        const isEmail = email.includes('@');
        login(isEmail ? email : undefined, isEmail ? undefined : email, password);
        setIsSubmitting(false);
      }, 800);
    }
  };

  const handleRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authApi.requestOtp(email);
      setRecoveryStep('otp');
    } catch (err: any) {
      console.error(err);
      // Show actual backend error if available
      alert(err.response?.data?.error || "Failed to send code. Please check your email address.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authApi.verifyOtpAndReset({ email, otp, new_password: newPassword });
      setRecoveryStep('none');
      setIsLoginMode(true);
      alert("Password reset successfully. Please sign in.");
    } catch (err) {
      console.error(err);
      alert("Verification failed. Invalid code or expired.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render different forms based on state
  const renderFormContent = () => {
    // 1. RECOVERY: OTP & NEW PASSWORD
    if (recoveryStep === 'otp') {
      return (
        <form onSubmit={handleRecoverySubmit} className="space-y-6 animate-in slide-in-from-right-8 duration-300">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">6-Digit Security Code</label>
            <div className="relative group">
              <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-xl font-mono font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300 tracking-[0.5em] text-center"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-bold text-center">Enter the code sent to {email}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Access Key</label>
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New secure password"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || otp.length !== 6}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Credentials'}
          </button>

          <button
            type="button"
            onClick={() => setRecoveryStep('email')}
            className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors"
          >
            Resend Code
          </button>
        </form>
      );
    }

    // 2. RECOVERY: EMAIL REQUEST
    if (recoveryStep === 'email') {
      return (
        <form onSubmit={handleRecoveryRequest} className="space-y-6 animate-in slide-in-from-right-8 duration-300">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recovery Email</label>
            <div className="relative group">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isSubmitting ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Recovery Code'}
          </button>

          <button
            type="button"
            onClick={() => setRecoveryStep('none')}
            className="w-full flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ArrowLeft size={12} /> Back to Sign In
          </button>
        </form>
      );
    }

    // 3. STANDARD LOGIN / SIGNUP
    return (
      <form onSubmit={handleLoginSubmit} className="space-y-6 animate-in fade-in duration-300">
        {!isLoginMode && (
          <>
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
              <div className="relative group">
                <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Johnathon Doe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2 animate-in slide-in-from-top-3 duration-300">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Name</label>
              <div className="relative group">
                <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email or Username</label>
          <div className="relative group">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com or username"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          {!isLoginMode && (
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Create Access Key</label>
            </div>
          )}

          {isLoginMode && (
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Key</label>
              <button
                type="button"
                onClick={() => setRecoveryStep('email')}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <div className="relative group">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
            <input
              key={isLoginMode ? "login-password" : "register-password"} // Force remount on mode switch to prevent autofill conflicts and frozen state
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLoginMode ? "Your secure password" : "Create a strong password"}
              autoComplete={isLoginMode ? "current-password" : "new-password"}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting} // Explicitly handle disabled state
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              {isLoginMode ? 'Sign In To Studio' : (regStep === 'info' ? 'Next: Select Plan' : 'Confirm & Register')}
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </form>
    );
  };

  const renderPlanSelection = () => {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
        <div className="grid grid-cols-1 gap-4">
          {plans.map((plan: any) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanSlug(plan.slug)}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedPlanSlug === plan.slug
                ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-600/5'
                : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-black text-lg text-slate-900">{plan.name}</h4>
                <span className="text-xl font-black text-indigo-600">₹{plan.price}<span className="text-[10px] text-slate-400">/mo</span></span>
              </div>
              <div className="flex flex-wrap gap-2">
                {plan.features?.max_catalogs && (
                  <span className="px-2 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500">
                    {plan.features.max_catalogs} Catalogs
                  </span>
                )}
                {plan.features?.max_products && (
                  <span className="px-2 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500">
                    {plan.features.max_products} Products
                  </span>
                )}
                {plan.slug === 'starter' && (
                  <span className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                    7 Days free
                  </span>
                )}
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="p-8 text-center text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-2xl">
              Loading pricing plans...
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setRegStep('info')}
            className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleLoginSubmit}
            disabled={isSubmitting || plans.length === 0}
            className="flex-[2] py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isSubmitting ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : 'Start Free Trial'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden min-h-[640px]">

        {/* Visual Brand Side */}
        <div className="hidden md:flex flex-col bg-slate-900 p-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]"></div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-auto">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl shadow-indigo-600/30">C</div>
              <span className="font-black text-2xl tracking-tighter">Studio.</span>
            </div>

            <div className="space-y-6">
              <span className="px-4 py-1.5 bg-indigo-600/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-600/30 inline-block">Enterprise v3.1</span>
              <h2 className="text-5xl font-black leading-[1.1] tracking-tight">Design At Scale. <br /><span className="text-indigo-500">Effortlessly.</span></h2>
              <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
                Accelerate your go-to-market strategy with automated high-fidelity catalog generation and cloud asset management.
              </p>
            </div>

            <div className="mt-20 flex items-center gap-8 text-slate-500">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white leading-none mb-1">2k+</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Global Brands</span>
              </div>
              <div className="w-px h-8 bg-slate-800"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white leading-none mb-1">99.9%</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Uptime SLA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Interaction Side */}
        <div className="flex flex-col p-12 md:p-20 justify-center relative">
          <div className="mb-12">
            <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
              {recoveryStep !== 'none' ? 'Recovery' : (isLoginMode ? 'Welcome Back' : 'Get Started')}
            </h3>
            <p className="text-slate-500 font-medium">
              {recoveryStep === 'otp' ? 'Enter the secure code sent to your email.' :
                recoveryStep === 'email' ? 'Confirm your corporate email address.' :
                  (isLoginMode ? 'Please enter your workspace credentials.' :
                    (regStep === 'info' ? 'Tell us about your organization.' : 'Select a plan to start your 7-day trial.'))}
            </p>
          </div>

          {regStep === 'plan' && !isLoginMode && recoveryStep === 'none' ? renderPlanSelection() : renderFormContent()}

          {error && (
            <div className="mt-6 mb-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-in slide-in-from-bottom-2">
              <Shield size={18} className="shrink-0 mt-0.5" />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          {recoveryStep === 'none' && (
            <div className="mt-10 text-center space-y-4">
              <p className="text-xs font-bold text-slate-400">
                {isLoginMode ? "New here?" : "Already a user?"}
                <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-indigo-600 font-black ml-2 hover:underline">
                  {isLoginMode ? "Establish Account" : "Sign In"}
                </button>
              </p>

              <div className="w-full h-px bg-slate-100 my-4" />

              <button
                onClick={() => setView('admin-login')}
                className="flex items-center justify-center gap-2 mx-auto text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-indigo-600 transition-colors"
              >
                <Shield size={12} /> Catalog Team Login
              </button>

              {/* <div className="pt-2">
                <button
                  onClick={(e) => { e.preventDefault(); (useStore.getState() as any).guestLogin(); }}
                  className="w-full py-4 bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 group"
                >
                  <Sparkles size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                  Try Guest Access (Instant)
                </button>
              </div> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
