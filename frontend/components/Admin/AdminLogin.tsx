
import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, KeyRound, ArrowLeft } from 'lucide-react';
import { authApi } from '../../client';

const AdminLogin: React.FC = () => {
    const { adminLogin, setView, error, isLoading } = useStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Recovery State
    const [recoveryStep, setRecoveryStep] = useState<'none' | 'email' | 'otp'>('none');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const isEmail = email.includes('@');
            await adminLogin(isEmail ? email : undefined, isEmail ? undefined : email, password);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRecoveryRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await authApi.requestOtp(email);
            setRecoveryStep('otp');
        } catch (err) {
            console.error(err);
            alert("Failed to send token reset email.");
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
            alert("Admin credentials rotated successfully.");
        } catch (err) {
            console.error(err);
            alert("Token verification failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderContent = () => {
        // 1. RECOVERY: OTP
        if (recoveryStep === 'otp') {
            return (
                <form onSubmit={handleRecoverySubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">6-Digit Admin Token</label>
                        <div className="relative group">
                            <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="000000"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-lg font-mono font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300 tracking-[0.5em] text-center"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Secure Token</label>
                        <div className="relative group">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New token string"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || otp.length !== 6}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Access'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setRecoveryStep('email')}
                        className="w-full text-center text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        Resend Token
                    </button>
                </form>
            );
        }

        // 2. RECOVERY: EMAIL
        if (recoveryStep === 'email') {
            return (
                <form onSubmit={handleRecoveryRequest} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrator Email</label>
                        <div className="relative group">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@catalog.team"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Request Token Reset'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setRecoveryStep('none')}
                        className="w-full flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                        <ArrowLeft size={10} /> Back to Login
                    </button>
                </form>
            );
        }

        // 3. LOGIN
        return (
            <form onSubmit={handleLoginSubmit} className="space-y-6 animate-in fade-in duration-300">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        {error}
                    </div>
                )}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Team Email or Admin ID</label>
                    <div className="relative group">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type="text"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@catalog.team or admin_id"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Token</label>
                        <button
                            type="button"
                            onClick={() => setRecoveryStep('email')}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
                        >
                            Reset Token?
                        </button>
                    </div>
                    <div className="relative group">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-3.5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all placeholder:text-slate-300"
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
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-6"
                >
                    {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            Access Portal <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </form>
        );
    };

    return (
        <div className="min-h-screen w-full bg-[#0f172a] flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_0_50px_rgba(79,70_229,0.15)] overflow-hidden">
                <div className="bg-indigo-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md mb-4 shadow-inner border border-white/20">
                            <ShieldCheck size={32} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Catalog Team</h2>
                        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mt-1">Authorized Personnel Only</p>
                    </div>
                </div>

                <div className="p-8">
                    {renderContent()}

                    {recoveryStep === 'none' && (
                        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                            <button
                                onClick={() => setView('dashboard')}
                                className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 flex items-center justify-center gap-1 mx-auto transition-colors"
                            >
                                <ArrowLeft size={10} /> Back to User Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
