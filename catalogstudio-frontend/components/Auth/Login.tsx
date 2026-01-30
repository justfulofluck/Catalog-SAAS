
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle2, User as UserIcon, Shield } from 'lucide-react';
import SignUpBG from '../../images/SignUpBG.png';

const Login: React.FC = () => {
  const { login, register } = useStore();

  // Auth Views: 'login', 'register', 'forgot-password', 'verify-otp', 'reset-password'
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot-password' | 'verify-otp' | 'reset-password'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');

  // For Reset Flow
  const [resetUid, setResetUid] = useState('');
  const [resetToken, setResetToken] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const cleanState = () => {
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const success = await login(email, password);
    if (!success) setError('Invalid credentials');
    setIsSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const success = await register(name, email, password);
    setIsSubmitting(false);
    if (success) {
      alert('Registration successful! Please sign in.');
      setAuthView('login');
    } else {
      setError('Registration failed');
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const { default: api } = await import('../../utils/api');
      await api.post('/auth/password/reset/', { email });
      setAuthView('verify-otp');
      setSuccessMsg(`OTP sent to ${email}. Valid for 60s.`);
    } catch (err) {
      setError('Failed to send OTP. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const { default: api } = await import('../../utils/api');
      const res = await api.post('/auth/password/reset/verify/', { email, otp });
      setResetUid(res.data.uid);
      setResetToken(res.data.token);
      setAuthView('reset-password');
      setSuccessMsg('OTP Verified. Set new password.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid or Expired OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const { default: api } = await import('../../utils/api');
      await api.post('/auth/password/reset/confirm/', {
        uid: resetUid,
        token: resetToken,
        new_password: newPassword
      });
      alert('Password reset successful! Please login.');
      setAuthView('login');
      setPassword('');
    } catch (err) {
      setError('Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = () => {
    switch (authView) {
      case 'login':
        return (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Email</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Key</label>
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your secure password" className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end">
                <button type="button" onClick={() => { cleanState(); setAuthView('forgot-password'); }} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Forgot Password?</button>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4">
              {isSubmitting ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Sign In To Studio <ArrowRight size={20} /></>}
            </button>
          </form>
        );
      case 'register':
        return (
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
              <div className="relative group">
                <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Johnathon Doe" className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Email</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300" />
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4">
              {isSubmitting ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Create Account <ArrowRight size={20} /></>}
            </button>
          </form>
        );
      case 'forgot-password':
        return (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enter Email for OTP</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300" />
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4">
              {isSubmitting ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Send OTP Code <ArrowRight size={20} /></>}
            </button>
            <button type="button" onClick={() => { cleanState(); setAuthView('login'); }} className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600">Cancel</button>
          </form>
        );
      case 'verify-otp':
        return (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enter 6-Digit OTP</label>
              <div className="relative group">
                <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input type="text" required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-xl font-bold text-slate-900 tracking-[0.5em] text-center focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300 placeholder:tracking-normal" />
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4">
              {isSubmitting ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Verify OTP <CheckCircle2 size={20} /></>}
            </button>
          </form>
        );
      case 'reset-password':
        return (
          <form onSubmit={handleResetConfirm} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New secure password" className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300" />
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70 mt-4">
              {isSubmitting ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Reset Password <CheckCircle2 size={20} /></>}
            </button>
          </form>
        );
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 font-sans bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: `url(${SignUpBG})` }}
    >
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-[0_40px_100px_rgba(79,70,229,0.1)] overflow-hidden min-h-[640px]">

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
        <div className="flex flex-col p-12 md:p-20 justify-center">
          <div className="mb-12">
            <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
              {authView === 'login' && 'Welcome Back'}
              {authView === 'register' && 'Get Started'}
              {authView === 'forgot-password' && 'Reset Password'}
              {authView === 'verify-otp' && 'Check Your Email'}
              {authView === 'reset-password' && 'Secure Account'}
            </h3>
            <p className="text-slate-500 font-medium">
              {authView === 'login' && 'Please enter your workspace credentials.'}
              {authView === 'register' && 'Create your organization account.'}
              {authView === 'forgot-password' && 'We will send you a 6-digit code.'}
              {authView === 'verify-otp' && 'Enter the 6-digit code sent to you.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 flex items-center gap-2">
              <Shield size={16} />{error}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-3 bg-green-50 text-green-600 text-sm font-bold rounded-xl border border-green-100 flex items-center gap-2">
              <CheckCircle2 size={16} />{successMsg}
            </div>
          )}

          {renderForm()}

          {(authView === 'login' || authView === 'register') && (
            <div className="mt-12 text-center">
              <p className="text-xs font-bold text-slate-400">
                {authView === 'login' ? "New here?" : "Already a user?"}
                <button onClick={() => { cleanState(); setAuthView(authView === 'login' ? 'register' : 'login'); }} className="text-indigo-600 font-black ml-2 hover:underline">
                  {authView === 'login' ? "Establish Account" : "Sign In"}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-10 flex items-center gap-4 text-slate-300 text-[10px] font-black tracking-[0.3em] uppercase">
        <Shield size={12} className="text-indigo-600/40" />
        AES-256 Cloud Encrypted Connection
      </div>
    </div>
  );
};

export default Login;
