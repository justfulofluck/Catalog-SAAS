
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle2, User as UserIcon, Shield, KeyRound, ArrowLeft } from 'lucide-react';
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
      try {
        const isEmail = email.includes('@');
        await login(isEmail ? email : undefined, isEmail ? undefined : email, password);
      } catch (err) {
        console.error("Login failed", err);
      } finally {
        setIsSubmitting(false);
      }
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
        <form onSubmit={handleRecoverySubmit} className="space-y-5 animate-in slide-in-from-right-8 duration-300">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading ml-1">6-Digit Security Code</label>
            <div className="relative group">
              <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E2DCC8]/50 group-focus-within:text-[#E2DCC8] transition-colors" />
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                className="w-full bg-[#171616] border border-[#262626] rounded-[4px] pl-12 pr-4 py-3.5 text-xl font-mono font-bold text-[#F1F1F1] focus:border-[#E2DCC8] focus:ring-1 focus:ring-[#E2DCC8]/30 outline-none transition-all placeholder:text-[#555555] tracking-[0.5em] text-center"
              />
            </div>
            <p className="text-[10px] text-[#E2DCC8]/60 text-center">Enter the code sent to {email}</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading ml-1">New Access Key</label>
            <div className="relative group">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E2DCC8]/50 group-focus-within:text-[#E2DCC8] transition-colors" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New secure password"
                className="w-full bg-[#171616] border border-[#262626] rounded-[4px] pl-12 pr-4 py-3.5 text-sm font-medium text-[#F1F1F1] focus:border-[#E2DCC8] focus:ring-1 focus:ring-[#E2DCC8]/30 outline-none transition-all placeholder:text-[#555555]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || otp.length !== 6}
            className="w-full py-4 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/20 rounded-[4px] font-heading font-medium text-xs uppercase tracking-wider shadow-lg shadow-[#0F3D3E]/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Credentials'}
          </button>

          <button
            type="button"
            onClick={() => setRecoveryStep('email')}
            className="w-full text-center text-xs font-medium text-[#E2DCC8]/70 hover:text-[#E2DCC8] transition-colors"
          >
            Resend Code
          </button>
        </form>
      );
    }

    // 2. RECOVERY: EMAIL REQUEST
    if (recoveryStep === 'email') {
      return (
        <form onSubmit={handleRecoveryRequest} className="space-y-5 animate-in slide-in-from-right-8 duration-300">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading ml-1">Recovery Email</label>
            <div className="relative group">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E2DCC8]/50 group-focus-within:text-[#E2DCC8] transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-[#171616] border border-[#262626] rounded-[4px] pl-12 pr-4 py-3.5 text-sm font-medium text-[#F1F1F1] focus:border-[#E2DCC8] focus:ring-1 focus:ring-[#E2DCC8]/30 outline-none transition-all placeholder:text-[#555555]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/20 rounded-[4px] font-heading font-medium text-xs uppercase tracking-wider shadow-lg shadow-[#0F3D3E]/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Send Recovery Code'}
          </button>

          <button
            type="button"
            onClick={() => setRecoveryStep('none')}
            className="w-full flex items-center justify-center gap-2 text-xs font-medium text-[#E2DCC8]/70 hover:text-[#F1F1F1] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Sign In
          </button>
        </form>
      );
    }

    // 3. STANDARD LOGIN / SIGNUP
    return (
      <form onSubmit={handleLoginSubmit} className="space-y-5 animate-in fade-in duration-300">
        {!isLoginMode && (
          <>
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading ml-1">Full Legal Name</label>
              <div className="relative group">
                <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E2DCC8]/50 group-focus-within:text-[#E2DCC8] transition-colors" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Johnathon Doe"
                  className="w-full bg-[#171616] border border-[#262626] rounded-[4px] pl-12 pr-4 py-3.5 text-sm font-medium text-[#F1F1F1] focus:border-[#E2DCC8] focus:ring-1 focus:ring-[#E2DCC8]/30 outline-none transition-all placeholder:text-[#555555]"
                />
              </div>
            </div>

            <div className="space-y-1.5 animate-in slide-in-from-top-3 duration-300">
              <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading ml-1">Business Name</label>
              <div className="relative group">
                <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E2DCC8]/50 group-focus-within:text-[#E2DCC8] transition-colors" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full bg-[#171616] border border-[#262626] rounded-[4px] pl-12 pr-4 py-3.5 text-sm font-medium text-[#F1F1F1] focus:border-[#E2DCC8] focus:ring-1 focus:ring-[#E2DCC8]/30 outline-none transition-all placeholder:text-[#555555]"
                />
              </div>
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading ml-1">Email or Username</label>
          <div className="relative group">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E2DCC8]/50 group-focus-within:text-[#E2DCC8] transition-colors" />
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com or username"
              className="w-full bg-[#171616] border border-[#262626] rounded-[4px] pl-12 pr-4 py-3.5 text-sm font-medium text-[#F1F1F1] focus:border-[#E2DCC8] focus:ring-1 focus:ring-[#E2DCC8]/30 outline-none transition-all placeholder:text-[#555555]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center ml-1">
            <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading">
              {isLoginMode ? 'Access Key' : 'Create Access Key'}
            </label>
            {isLoginMode && (
              <button
                type="button"
                onClick={() => setRecoveryStep('email')}
                className="text-[10px] font-bold text-[#E2DCC8] hover:underline transition-colors font-heading"
              >
                Forgot Password?
              </button>
            )}
          </div>

          <div className="relative group">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E2DCC8]/50 group-focus-within:text-[#E2DCC8] transition-colors" />
            <input
              key={isLoginMode ? "login-password" : "register-password"}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLoginMode ? "Your secure password" : "Create a strong password"}
              autoComplete={isLoginMode ? "current-password" : "new-password"}
              className="w-full bg-[#171616] border border-[#262626] rounded-[4px] pl-12 pr-12 py-3.5 text-sm font-medium text-[#F1F1F1] focus:border-[#E2DCC8] focus:ring-1 focus:ring-[#E2DCC8]/30 outline-none transition-all placeholder:text-[#555555] disabled:opacity-50"
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#E2DCC8]/50 hover:text-[#F1F1F1] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/25 rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider shadow-lg shadow-[#0F3D3E]/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 mt-4 active:scale-98"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-[#F1F1F1]/30 border-t-[#F1F1F1] rounded-full animate-spin"></div>
          ) : (
            <>
              {isLoginMode ? 'Sign In To Studio' : (regStep === 'info' ? 'Next: Select Plan' : 'Confirm & Register')}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    );
  };

  const renderPlanSelection = () => {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
        <div className="grid grid-cols-1 gap-3.5 max-h-[340px] overflow-y-auto pr-1">
          {plans.map((plan: any) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanSlug(plan.slug)}
              className={`p-5 rounded-[4px] border cursor-pointer transition-all ${selectedPlanSlug === plan.slug
                ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 ring-1 ring-[#E2DCC8]/50'
                : 'border-[#262626] bg-[#171616] hover:border-[#383838]'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-base text-[#F1F1F1] font-heading">{plan.name}</h4>
                <span className="text-lg font-medium text-[#E2DCC8] font-heading">₹{plan.price}<span className="text-[10px] text-[#E2DCC8]/60">/mo</span></span>
              </div>
              <div className="flex flex-wrap gap-2">
                {plan.features?.max_catalogs && (
                  <span className="px-2.5 py-1 bg-[#100F0F] border border-[#262626] rounded-[4px] text-[10px] font-medium text-[#E2DCC8]">
                    {plan.features.max_catalogs} Catalogs
                  </span>
                )}
                {plan.features?.max_products && (
                  <span className="px-2.5 py-1 bg-[#100F0F] border border-[#262626] rounded-[4px] text-[10px] font-medium text-[#E2DCC8]">
                    {plan.features.max_products} Products
                  </span>
                )}
                {plan.slug === 'starter' && (
                  <span className="px-2.5 py-1 bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/30 rounded-[4px] text-[10px] font-bold uppercase tracking-wider font-heading">
                    7 Days Free
                  </span>
                )}
              </div>
            </div>
          ))}
          {plans.length === 0 && (
            <div className="p-8 text-center text-[#E2DCC8]/60 font-medium border border-dashed border-[#262626] rounded-[4px]">
              Loading pricing plans...
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setRegStep('info')}
            className="flex-1 py-4 bg-[#171616] text-[#E2DCC8] border border-[#262626] hover:border-[#E2DCC8]/40 rounded-[4px] font-heading font-medium text-xs uppercase tracking-wider transition-all"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleLoginSubmit}
            disabled={isSubmitting || plans.length === 0}
            className="flex-[2] py-4 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/25 rounded-[4px] font-heading font-medium text-xs uppercase tracking-wider shadow-lg shadow-[#0F3D3E]/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Start Free Trial'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#100F0F] text-[#F1F1F1] flex items-center justify-start p-6 md:pl-16 lg:pl-24 font-sans">
      <div className="w-full max-w-md bg-[#161616] rounded-[4px] border border-[#262626] shadow-2xl overflow-hidden p-8 md:p-10 relative">
        <div className="flex items-center gap-2 mb-8">
          <span className="font-bold text-xl tracking-tight font-heading text-[#F1F1F1]">catalogmakerr.</span>
        </div>
          {regStep === 'plan' && !isLoginMode && recoveryStep === 'none' ? renderPlanSelection() : renderFormContent()}

          {error && (
            <div className="mt-5 p-3.5 bg-red-950/40 border border-red-800/60 rounded-[4px] flex items-start gap-2.5 text-red-400 animate-in slide-in-from-bottom-2">
              <Shield size={16} className="shrink-0 mt-0.5" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}

          {recoveryStep === 'none' && (
            <div className="mt-8 text-center">
              <p className="text-xs text-[#E2DCC8]/70">
                {isLoginMode ? "New here?" : "Already a user?"}
                <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-[#E2DCC8] hover:text-[#F1F1F1] font-semibold ml-2 hover:underline font-heading transition-colors">
                  {isLoginMode ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          )}
      </div>
    </div>
  );
};

export default Login;
