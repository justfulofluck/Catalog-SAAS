import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, LayoutDashboard, Globe, ArrowLeft } from 'lucide-react';

const AdminLogin: React.FC = () => {
    const { adminLogin, setView } = useStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            adminLogin(email);
            setIsSubmitting(false);
        }, 1500);
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
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Team Email</label>
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

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Token</label>
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

                    <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                        <button
                            onClick={() => setView('dashboard')}
                            className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 flex items-center justify-center gap-1 mx-auto transition-colors"
                        >
                            <ArrowLeft size={10} /> Back to User Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;