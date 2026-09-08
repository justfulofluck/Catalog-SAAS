
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
                <form onSubmit={handleRecoverySubmit} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#999999] uppercase tracking-widest font-heading ml-1">6-Digit Admin Token</label>
                        <div className="relative group">
                            <KeyRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] group-focus-within:text-[#E2DCC8] transition-colors" />
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="000000"
                                className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[11px] pl-12 pr-4 py-3.5 text-lg font-mono font-bold text-white focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/20 outline-none transition-all placeholder:text-[#444444] tracking-[0.5em] text-center"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#999999] uppercase tracking-widest font-heading ml-1">New Secure Token</label>
                        <div className="relative group">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] group-focus-within:text-[#E2DCC8] transition-colors" />
                            <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New token string"
                                className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[11px] pl-12 pr-4 py-3.5 text-sm font-medium text-white focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/20 outline-none transition-all placeholder:text-[#555555]"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || otp.length !== 6}
                        className="w-full py-4 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[11px] font-heading font-medium text-xs uppercase tracking-wider shadow-lg shadow-[#0F3D3E]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Reset Access'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setRecoveryStep('email')}
                        className="w-full text-center text-xs font-medium text-[#999999] hover:text-[#E2DCC8] transition-colors"
                    >
                        Resend Token
                    </button>
                </form>
            );
        }

        // 2. RECOVERY: EMAIL
        if (recoveryStep === 'email') {
            return (
                <form onSubmit={handleRecoveryRequest} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#999999] uppercase tracking-widest font-heading ml-1">Administrator Email</label>
                        <div className="relative group">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] group-focus-within:text-[#E2DCC8] transition-colors" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@catalog.team"
                                className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[11px] pl-12 pr-4 py-3.5 text-sm font-medium text-white focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/20 outline-none transition-all placeholder:text-[#555555]"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[11px] font-heading font-medium text-xs uppercase tracking-wider shadow-lg shadow-[#0F3D3E]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Request Token Reset'}
                    </button>

                    <button
                        type="button"
                        onClick={() => setRecoveryStep('none')}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-[#999999] hover:text-white transition-colors"
                    >
                        <ArrowLeft size={14} /> Back to Login
                    </button>
                </form>
            );
        }

        // 3. LOGIN
        return (
            <form onSubmit={handleLoginSubmit} className="space-y-5 animate-in fade-in duration-300">
                {error && (
                    <div className="bg-red-950/40 border border-red-800/60 text-red-400 text-xs font-medium p-3 rounded-[11px] flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        {error}
                    </div>
                )}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#999999] uppercase tracking-widest font-heading ml-1">Team Email or Admin ID</label>
                    <div className="relative group">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] group-focus-within:text-[#E2DCC8] transition-colors" />
                        <input
                            type="text"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@catalog.team or admin_id"
                            className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[11px] pl-12 pr-4 py-3.5 text-sm font-medium text-white focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/20 outline-none transition-all placeholder:text-[#555555]"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-bold text-[#999999] uppercase tracking-widest font-heading">Secure Token</label>
                        <button
                            type="button"
                            onClick={() => setRecoveryStep('email')}
                            className="text-[10px] font-bold text-[#E2DCC8] hover:underline transition-colors font-heading"
                        >
                            Reset Token?
                        </button>
                    </div>
                    <div className="relative group">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] group-focus-within:text-[#E2DCC8] transition-colors" />
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[11px] pl-12 pr-12 py-3.5 text-sm font-medium text-white focus:border-[#0F3D3E] focus:ring-2 focus:ring-[#0F3D3E]/20 outline-none transition-all placeholder:text-[#555555]"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[11px] font-heading font-medium text-xs uppercase tracking-wider shadow-lg shadow-[#0F3D3E]/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 active:scale-98"
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
        <div className="min-h-screen w-full bg-[#100F0F] text-white flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md bg-[#161616] rounded-[24px] border border-[#262626] shadow-2xl overflow-hidden">
                <div className="bg-[#1c1c1c] p-8 text-center relative overflow-hidden border-b border-[#262626]">
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-14 h-14 bg-[#0F3D3E]/10 border border-[#0F3D3E]/30 rounded-[14px] flex items-center justify-center mb-3">
                            <ShieldCheck size={28} className="text-[#E2DCC8]" />
                        </div>
                        <h2 className="text-2xl font-medium text-white tracking-tight font-heading">Catalog Team</h2>
                        <p className="text-[#999999] text-xs font-medium uppercase tracking-widest mt-1">Authorized Personnel Only</p>
                    </div>
                </div>

                <div className="p-8">
                    {renderContent()}

                    {recoveryStep === 'none' && (
                        <div className="mt-6 pt-5 border-t border-[#262626] text-center">
                            <button
                                onClick={() => setView('dashboard')}
                                className="text-xs font-medium text-[#999999] hover:text-[#E2DCC8] flex items-center justify-center gap-1.5 mx-auto transition-colors font-heading"
                            >
                                <ArrowLeft size={14} /> Back to User Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
