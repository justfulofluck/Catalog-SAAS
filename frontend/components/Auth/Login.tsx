
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  User as UserIcon, 
  Shield, 
  KeyRound, 
  ArrowLeft,
  Sparkles,
  Crown,
  Package,
  BookOpen,
  Check,
  Layers,
  Clock,
  RotateCcw
} from 'lucide-react';
import { authApi, subscriptionApi } from '../../client';
import GradientBlinds from '../Common/GradientBlinds';
import { AppIcon } from '../Common/AppIcon';

const OTP_TOTAL_SECONDS = 300; // 5 minutes strict

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, setView, error, clearError, showToast, plans, fetchPlans, systemSettings, fetchSystemSettings, checkAuth } = useStore();

  // Auth Modes: 'signin' | 'signup'
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Registration Steps: 'info' | 'sent'
  const [regStep, setRegStep] = useState<'info' | 'sent'>('info');
  const [selectedPlanSlug, setSelectedPlanSlug] = useState('starter');

  // Recovery Modes: 'none' | 'email' | 'otp'
  const [recoveryStep, setRecoveryStep] = useState<'none' | 'email' | 'otp'>('none');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // OTP States
  const [signupOtp, setSignupOtp] = useState('');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // 5-Minute Timers
  const [signupTimer, setSignupTimer] = useState<number>(OTP_TOTAL_SECONDS);
  const [recoveryTimer, setRecoveryTimer] = useState<number>(OTP_TOTAL_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    fetchSystemSettings();
  }, [fetchSystemSettings]);

  // Signup OTP Countdown (5 minutes)
  React.useEffect(() => {
    if (!isLoginMode && regStep === 'otp' && signupTimer > 0) {
      const timer = setInterval(() => {
        setSignupTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isLoginMode, regStep, signupTimer]);

  // Password Recovery OTP Countdown (5 minutes)
  React.useEffect(() => {
    if (recoveryStep === 'otp' && recoveryTimer > 0) {
      const timer = setInterval(() => {
        setRecoveryTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [recoveryStep, recoveryTimer]);

  // Format MM:SS helper
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  // Resend Signup OTP
  const handleResendSignupOtp = async () => {
    if (signupTimer > 240) {
      showToast("Please wait at least 60 seconds before requesting a new code.", "warning", "Cooldown Active");
      return;
    }
    setIsSubmitting(true);
    clearError();
    try {
      await authApi.requestVerificationOtp(email.trim());
      setSignupTimer(OTP_TOTAL_SECONDS);
      setSignupOtp('');
      showToast("A new 6-digit verification code has been sent to your email!", "success", "Code Sent");
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Failed to resend verification code. Please try again.";
      showToast(errMsg, "error", "Verification Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend Password Reset OTP
  const handleResendRecoveryOtp = async () => {
    if (recoveryTimer > 240) {
      showToast("Please wait at least 60 seconds before requesting a new code.", "warning", "Cooldown Active");
      return;
    }
    setIsSubmitting(true);
    clearError();
    try {
      await authApi.requestOtp(email.trim());
      setRecoveryTimer(OTP_TOTAL_SECONDS);
      setRecoveryOtp('');
      showToast("A new password reset code has been sent to your email!", "success", "Code Sent");
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Failed to resend code.";
      showToast(errMsg, "error", "Reset Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();

    if (!isLoginMode) {
      // REGISTRATION FLOW

      // Step 1: Info Validation & Registration -> Magic Link Sent
      if (regStep === 'info') {
        if (!name.trim()) {
          showToast("Please enter your full name.", "warning", "Required Field");
          setIsSubmitting(false);
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          showToast("Please enter a valid email address.", "warning", "Invalid Email");
          setIsSubmitting(false);
          return;
        }
        if (!password || password.length < 6) {
          showToast("Password must be at least 6 characters long.", "warning", "Password Length");
          setIsSubmitting(false);
          return;
        }

        try {
          const cleanEmail = email.trim();
          const cleanName = name.trim();

          const res: any = await authApi.register({
            email: cleanEmail,
            username: cleanEmail,
            password: password,
            password1: password,
            password2: password,
            name: cleanName,
          });

          // Registration staging succeeded; magic link sent
          setRegStep('sent');
          showToast(res?.data?.message || `Onboarding link sent to ${cleanEmail}. Please check your inbox.`, "success", "Setup Link Sent");
        } catch (error: any) {
          console.error("Registration request failed", error);
          if (error.response?.status === 401) {
            await authApi.forceLogout();
            showToast("Previous session state was invalid. Please submit again.", "error", "Session Cleared");
            setIsSubmitting(false);
            return;
          }

          let errorMsg = "Registration failed.";
          if (error.response?.data) {
            const data = error.response.data;
            if (typeof data === 'string') {
              errorMsg = data;
            } else if (data.error) {
              errorMsg = data.error;
            } else {
              const messages = Object.keys(data).map(key => {
                const val = data[key];
                return `${key}: ${Array.isArray(val) ? val.join(' ') : val}`;
              });
              errorMsg = messages.join('\n');
            }
          }
          showToast(errorMsg, "error", "Registration Error");
        } finally {
          setIsSubmitting(false);
        }
        return;
      }
    } else {
      // LOGIN FLOW
      try {
        const cleanEmail = email.trim();
        await login(cleanEmail, undefined, password);
        showToast("Signed in successfully!", "success", "Welcome Back");
        const from = (location.state as any)?.from?.pathname || '/';
        navigate(from, { replace: true });
      } catch (err) {
        // Handled cleanly by authSlice error state which displays in the red banner
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();
    try {
      await authApi.requestOtp(email.trim());
      setRecoveryOtp('');
      setRecoveryTimer(OTP_TOTAL_SECONDS);
      setRecoveryStep('otp');
      showToast(`A 6-digit recovery code has been sent to ${email.trim()}`, "success", "Recovery Code Sent");
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || "Failed to send code. Please check your email address.";
      showToast(errMsg, "error", "Request Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();
    try {
      await authApi.verifyOtpAndReset({ email: email.trim(), otp: recoveryOtp.trim(), new_password: newPassword });
      setRecoveryStep('none');
      setIsLoginMode(true);
      showToast("Password reset successfully! Please sign in with your new password.", "success", "Password Reset", 6000);
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.response?.data?.error || err?.response?.data?.detail || "Verification failed. Invalid code or expired.";
      showToast(errMsg, "error", "Reset Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render different forms based on state
  const renderFormContent = () => {
    // 1. RECOVERY: OTP & NEW PASSWORD
    if (recoveryStep === 'otp') {
      const isExpired = recoveryTimer <= 0;
      return (
        <form onSubmit={handleRecoverySubmit} className="space-y-5 animate-in slide-in-from-right-8 duration-300">
          <div>
            <h3 className="font-space font-bold text-lg text-[#F1F1F1] tracking-tight">Enter Reset Code</h3>
            <p className="text-xs text-[#888888] mt-0.5">We sent a 6-digit password reset code to <span className="text-[#E2DCC8] font-medium">{email}</span></p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading">6-Digit Security Code</label>
              <div className={`flex items-center gap-1.5 text-xs font-mono font-bold px-2 py-0.5 rounded-[3px] border ${
                isExpired 
                  ? 'bg-red-950/40 border-red-800/60 text-red-400' 
                  : recoveryTimer < 60 
                    ? 'bg-amber-950/40 border-amber-800/60 text-amber-400 animate-pulse' 
                    : 'bg-[#0F3D3E]/40 border-[#0F3D3E] text-[#00E5D0]'
              }`}>
                <Clock size={12} />
                <span>{isExpired ? 'EXPIRED' : formatTimer(recoveryTimer)}</span>
              </div>
            </div>

            <div className="relative group">
              <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E2DCC8]/50 group-focus-within:text-[#E2DCC8] transition-colors" />
              <input
                type="text"
                required
                maxLength={6}
                value={recoveryOtp}
                onChange={(e) => setRecoveryOtp(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                disabled={isExpired}
                className="w-full bg-[#171616] border border-[#262626] rounded-[4px] pl-12 pr-4 py-3.5 text-xl font-mono font-bold text-[#F1F1F1] focus:border-[#E2DCC8] focus:ring-1 focus:ring-[#E2DCC8]/30 outline-none transition-all placeholder:text-[#555555] tracking-[0.5em] text-center disabled:opacity-50"
              />
            </div>
            {isExpired && (
              <p className="text-[11px] text-red-400 text-center font-medium">OTP has expired after 5 minutes. Request a new code below.</p>
            )}
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
            disabled={isSubmitting || recoveryOtp.length !== 6 || isExpired}
            className="w-full py-4 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/20 rounded-[4px] font-heading font-medium text-xs uppercase tracking-wider shadow-lg shadow-[#0F3D3E]/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Credentials'}
          </button>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setRecoveryStep('email')}
              className="text-xs text-[#888888] hover:text-[#E2DCC8] transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={13} /> Change Email
            </button>
            <button
              type="button"
              onClick={handleResendRecoveryOtp}
              disabled={isSubmitting}
              className="text-xs font-semibold text-[#00E5D0] hover:text-[#5cf8eb] transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={13} /> Resend Code
            </button>
          </div>
        </form>
      );
    }

    // 2. SIGNUP: MAGIC LINK SENT TO EMAIL CONFIRMATION SCREEN
    if (!isLoginMode && regStep === 'sent') {
      return (
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-300 text-center py-2">
          <div className="w-16 h-16 rounded-full bg-[#0F3D3E]/40 border border-[#00E5BF]/40 mx-auto flex items-center justify-center text-[#00E5BF] shadow-lg shadow-[#0F3D3E]/30 animate-pulse">
            <Mail size={30} />
          </div>

          <div className="space-y-2">
            <h3 className="font-space font-bold text-2xl text-[#F1F1F1] tracking-tight">Check Your Inbox</h3>
            <p className="text-xs text-[#999999] leading-relaxed max-w-sm mx-auto">
              We've dispatched a secure workspace setup link to <br/>
              <span className="text-[#E2DCC8] font-semibold text-sm underline decoration-[#00E5BF]/50">{email}</span>
            </p>
          </div>

          <div className="bg-[#121212] border border-[#262626] rounded-[6px] p-4 text-left space-y-2.5">
            <div className="flex items-start gap-2.5">
              <Sparkles size={16} className="text-[#00E5BF] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#cccccc] leading-snug">
                Click the <strong>Complete Workspace Setup</strong> link in your email to choose your plan, configure your company profile, and launch your studio.
              </p>
            </div>
            <p className="text-[10px] text-[#777777] border-t border-[#222] pt-2">
              ⏱️ Link valid for 30 minutes. If not in Inbox, check your Promotions or Spam folder.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setRegStep('info')}
              className="text-xs text-[#888888] hover:text-[#E2DCC8] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={13} /> Edit details
            </button>
            <button
              type="button"
              onClick={handleLoginSubmit}
              disabled={isSubmitting}
              className="text-xs font-semibold text-[#00E5BF] hover:text-[#5cf8eb] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={13} /> Resend Link
            </button>
          </div>
        </div>
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
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading ml-1">Email Address</label>
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

        <div className="space-y-1.5">
          <div className="flex justify-between items-center ml-1">
            <label className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-widest font-heading">
              {isLoginMode ? 'Access Key' : 'Create Access Key'}
            </label>
            {isLoginMode && (
              <button
                type="button"
                onClick={() => { clearError(); setRecoveryStep('email'); }}
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
          className="w-full py-4 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/25 rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider shadow-lg shadow-[#0F3D3E]/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-60 mt-4 active:scale-98 relative overflow-hidden"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2.5">
              <div className="w-4 h-4 border-2 border-[#E2DCC8]/30 border-t-[#E2DCC8] rounded-full animate-spin"></div>
              <span className="tracking-widest font-bold text-[#E2DCC8]">
                {isLoginMode ? 'Signing In...' : (regStep === 'info' ? 'Processing...' : 'Creating Account...')}
              </span>
            </div>
          ) : (
            <>
              <span>{isLoginMode ? 'Sign In To Studio' : 'Next: Verify Email'}</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    );
  };

  const renderPlanSelection = () => {
    return (
      <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
        <div>
          <h3 className="font-space font-bold text-xl text-[#F1F1F1] tracking-tight">Select Your Plan</h3>
          <p className="text-xs text-[#888888] mt-1">Choose a subscription plan to begin your workspace journey.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {plans.map((plan: any) => {
            const isSelected = selectedPlanSlug === plan.slug;
            const isGrowth = plan.slug === 'growth';
            const isPro = plan.slug === 'pro';
            const numPrice = typeof plan.price === 'string' ? parseFloat(plan.price) : Number(plan.price || 0);

            return (
              <div
                key={plan.id || plan.slug}
                onClick={() => setSelectedPlanSlug(plan.slug)}
                className={`rounded-[6px] p-5 md:p-6 border cursor-pointer transition-all duration-300 flex flex-col justify-between relative group ${
                  isSelected
                    ? 'bg-[#151515] border-[#E2DCC8] ring-2 ring-[#E2DCC8]/40 shadow-2xl shadow-[#0F3D3E]/30 scale-[1.02]'
                    : 'bg-[#161616] border-[#262626] hover:border-[#3a3a3a] hover:bg-[#1a1a1a] shadow-lg'
                }`}
              >
                {/* Popular or Selected Badge */}
                {isGrowth && !isSelected && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/30 px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1 font-heading">
                    <Sparkles size={10} /> Popular
                  </div>
                )}
                {isSelected && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8] px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1 font-heading">
                    <Check size={11} strokeWidth={3} /> Selected
                  </div>
                )}

                <div>
                  {/* Tier Title */}
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-space text-base font-bold text-[#F1F1F1] flex items-center gap-1.5">
                      {plan.name}
                      {isPro && <Crown size={14} className="text-amber-400" />}
                    </h4>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                      isSelected ? 'border-[#E2DCC8] bg-[#E2DCC8]' : 'border-[#444]'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#100F0F]" />}
                    </div>
                  </div>

                  <p className="text-[11px] text-[#888888] line-clamp-2 min-h-[32px]">
                    {plan.description || (numPrice === 0 ? 'Essential starter sandbox and trial capabilities.' : 'Full catalog scale for active teams.')}
                  </p>

                  {/* Price Tag */}
                  <div className="my-4 pb-4 border-b border-white/5 flex items-baseline gap-1">
                    <span className="font-space text-2xl font-bold text-[#F1F1F1]">
                      ₹{numPrice}
                    </span>
                    <span className="text-[11px] font-medium text-[#888888]">
                      {numPrice === 0 ? '/ 7 days trial' : '/ mo'}
                    </span>
                  </div>

                  {/* Feature Highlights */}
                  <div className="space-y-2.5 mb-4 text-xs text-[#E2DCC8]/90">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-[3px] bg-[#0F3D3E]/40 border border-[#0F3D3E] flex items-center justify-center shrink-0 text-[#E2DCC8]">
                        <BookOpen size={10} />
                      </div>
                      <span className="text-[11px]">
                        <strong>{plan.features?.max_catalogs || 1}</strong> Catalogs
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-[3px] bg-[#0F3D3E]/40 border border-[#0F3D3E] flex items-center justify-center shrink-0 text-[#E2DCC8]">
                        <Package size={10} />
                      </div>
                      <span className="text-[11px]">
                        <strong>{plan.features?.max_products || 50}</strong> Products
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-[3px] bg-[#0F3D3E]/40 border border-[#0F3D3E] flex items-center justify-center shrink-0 text-[#E2DCC8]">
                        <Layers size={10} />
                      </div>
                      <span className="text-[11px]">
                        {plan.features?.custom_watermark ? 'Custom Watermark' : 'Catalog Watermark'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Selection Action Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlanSlug(plan.slug);
                  }}
                  className={`w-full py-2 rounded-[4px] font-heading font-semibold text-[10px] uppercase tracking-wider transition-all mt-2 ${
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

          {plans.length === 0 && (
            <div className="col-span-3 p-8 text-center text-[#E2DCC8]/60 font-medium border border-dashed border-[#262626] rounded-[4px]">
              Loading pricing plans...
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setRegStep('info')}
            className="px-6 py-4 bg-[#171616] text-[#E2DCC8] border border-[#262626] hover:border-[#E2DCC8]/40 rounded-[4px] font-heading font-medium text-xs uppercase tracking-wider transition-all"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleLoginSubmit}
            disabled={isSubmitting || plans.length === 0}
            className="flex-1 py-4 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/25 rounded-[4px] font-heading font-medium text-xs uppercase tracking-wider shadow-lg shadow-[#0F3D3E]/30 transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Activating Subscription...</span>
              </div>
            ) : (
              <span>Start with {plans.find((p: any) => p.slug === selectedPlanSlug)?.name || 'Selected Plan'} &rarr;</span>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#100F0F] text-[#F1F1F1] flex items-center justify-start p-6 md:pl-16 lg:pl-24 font-sans relative overflow-hidden">
      {/* Interactive WebGL Gradient Blinds Background */}
      <div className="absolute inset-0 z-0">
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
        {/* Soft dark vignette on the left to ensure login card & branding have top contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#100F0F] via-[#100F0F]/65 to-transparent pointer-events-none" />
      </div>

      <div className={`w-full ${
        regStep === 'plan' && !isLoginMode && recoveryStep === 'none'
          ? 'max-w-4xl' 
          : 'max-w-md'
      } bg-[#161616]/95 backdrop-blur-2xl rounded-[8px] border border-[#262626] shadow-2xl overflow-hidden p-6 md:p-9 relative z-10 transition-all duration-300 login-card-enter`}>
        {/* Top Loading Shimmer Bar during submission */}
        {isSubmitting && (
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#100F0F] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-[#E2DCC8] to-transparent animate-shimmer-progress w-full" />
          </div>
        )}

        <div className="flex items-center gap-3 mb-8">
          <AppIcon size={32} withGlow={false} />
          <span className="font-bold text-2xl tracking-tight font-heading text-[#F1F1F1]">catalogmakerr<span className="text-[#00E5D0]">.</span></span>
        </div>
          {regStep === 'plan' && !isLoginMode && recoveryStep === 'none' ? renderPlanSelection() : renderFormContent()}

          {systemSettings?.maintenance_mode && (
            <div className="mt-5 p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-[4px] flex items-start gap-2.5 text-amber-300 animate-in slide-in-from-bottom-2">
              <Shield size={16} className="shrink-0 mt-0.5 text-amber-400" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Maintenance Mode Active</p>
                <p className="text-[11px] text-amber-200/80 mt-0.5">{systemSettings.maintenance_message}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-5 p-3.5 bg-red-950/40 border border-red-800/60 rounded-[4px] flex items-start gap-2.5 text-red-400 animate-in slide-in-from-bottom-2 animate-shake">
              <Shield size={16} className="shrink-0 mt-0.5" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}

          {recoveryStep === 'none' && (
            <div className="mt-8 text-center">
              {systemSettings?.allow_public_signup === false && isLoginMode ? (
                <p className="text-[11px] text-[#E2DCC8]/50">
                  Public registrations are currently invitation-only.
                </p>
              ) : (
                <p className="text-xs text-[#E2DCC8]/70">
                  {isLoginMode ? "New here?" : "Already a user?"}
                  <button onClick={() => { clearError(); setIsLoginMode(!isLoginMode); }} className="text-[#E2DCC8] hover:text-[#F1F1F1] font-semibold ml-2 hover:underline font-heading transition-colors">
                    {isLoginMode ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export default Login;
