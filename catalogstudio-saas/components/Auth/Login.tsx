
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Mail, Lock, ArrowRight, Eye, EyeOff, CheckCircle2, User as UserIcon, Shield } from 'lucide-react';
import SignUpBG from '../../images/SignUpBG.png';

const Login: React.FC = () => {
  const login = useStore((state) => state.login);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      login(email);
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 font-sans bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: `url(${SignUpBG})` }}
    >
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.08)] overflow-hidden min-h-[640px]">

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
              {isLoginMode ? 'Welcome Back' : 'Get Started'}
            </h3>
            <p className="text-slate-500 font-medium">Please enter your workspace credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLoginMode && (
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
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Email</label>
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

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Key</label>
              </div>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your secure password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300"
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
                  {isLoginMode ? 'Sign In To Studio' : 'Create Organization Account'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-xs font-bold text-slate-400">
              {isLoginMode ? "New here?" : "Already a user?"}
              <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-indigo-600 font-black ml-2 hover:underline">
                {isLoginMode ? "Establish Account" : "Sign In"}
              </button>
            </p>
          </div>
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
