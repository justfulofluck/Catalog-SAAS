import React from 'react';
import { useStore } from '../../store/useStore';
import {
    CreditCard,
    Calendar,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    AlertCircle
} from 'lucide-react';

const SubscriptionManagement: React.FC = () => {
    const { allSubscriptions, fetchAllSubscriptions } = useStore();

    React.useEffect(() => {
        fetchAllSubscriptions();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#161616] p-6 rounded-[4px] border border-[#262626] flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#0F3D3E]/10 text-[#E2DCC8] rounded-[4px] flex items-center justify-center">
                        <CreditCard size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[#888888] uppercase tracking-widest">Active Subs</p>
                        <p className="font-space text-4xl font-bold text-white">{allSubscriptions.filter(s => s.is_active).length}</p>
                    </div>
                </div>

                <div className="bg-[#161616] p-6 rounded-[4px] border border-[#262626] flex items-center gap-6">
                    <div className="w-16 h-16 bg-amber-950/40 text-amber-400 rounded-[4px] flex items-center justify-center">
                        <Clock size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[#888888] uppercase tracking-widest">Expiring Soon</p>
                        <p className="font-space text-4xl font-bold text-white">
                            {allSubscriptions.filter(s => {
                                if (!s.end_date) return false;
                                const daysLeft = Math.ceil((new Date(s.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                return daysLeft > 0 && daysLeft <= 7;
                            }).length}
                        </p>
                    </div>
                </div>

                <div className="bg-[#161616] p-6 rounded-[4px] border border-[#262626] flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-950/40 text-emerald-400 rounded-[4px] flex items-center justify-center">
                        <Calendar size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-[#888888] uppercase tracking-widest">Total Revenue</p>
                        <p className="font-space text-4xl font-bold text-white italic">Live</p>
                    </div>
                </div>
            </div>

            <div className="bg-[#161616] rounded-[4px] border border-[#262626] overflow-hidden shadow-xl">
                <div className="px-8 py-6 border-b border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="font-space text-xl font-bold text-white">Subscription Factory</h2>
                        <p className="text-sm text-[#888888] font-medium mt-1">Monitor billing cycles and plan distributions.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" size={16} />
                            <input
                                type="text"
                                placeholder="Search subscriptions..."
                                className="bg-[#1c1c1c] border border-[#262626] rounded-[4px] pl-10 pr-4 py-2 text-xs font-bold text-white placeholder-[#666666] focus:border-[#0F3D3E] outline-none w-64"
                            />
                        </div>
                        <button className="p-2 border border-[#262626] rounded-[4px] hover:bg-[#1c1c1c] text-[#888888] hover:text-white transition-colors">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#121212] border-b border-[#262626]">
                            <tr>
                                <th className="px-8 py-4 text-[10px] font-bold text-[#888888] uppercase tracking-widest">Subscriber</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-[#888888] uppercase tracking-widest">Current Plan</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-[#888888] uppercase tracking-widest">Start Date</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-[#888888] uppercase tracking-widest">Valid Until</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-[#888888] uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#262626]">
                            {allSubscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-[#666666] font-bold italic">
                                        No active subscriptions found.
                                    </td>
                                </tr>
                            ) : (
                                allSubscriptions.map(sub => (
                                    <tr key={sub.id} className="hover:bg-[#1c1c1c] transition-colors">
                                        <td className="px-8 py-4">
                                            <div>
                                                <p className="text-sm font-bold text-white">{sub.user_name || 'Unnamed User'}</p>
                                                <p className="text-xs text-[#888888]">{sub.user_email}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                                                sub.plan_name?.toLowerCase().includes('pro')
                                                    ? 'bg-[#0F3D3E]/10 text-[#E2DCC8] border-[#0F3D3E]/20'
                                                    : sub.plan_name?.toLowerCase().includes('growth')
                                                        ? 'bg-purple-950/40 text-purple-400 border-purple-800/40'
                                                        : 'bg-[#1c1c1c] text-[#888888] border-[#262626]'
                                            }`}>
                                                {sub.plan_name}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-xs font-mono text-[#888888]">
                                            {new Date(sub.start_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </td>
                                        <td className="px-8 py-4">
                                            {sub.end_date ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-mono text-[#888888]">
                                                        {new Date(sub.end_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-[#666666] uppercase mt-0.5">
                                                        {Math.ceil((new Date(sub.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days left
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs italic text-[#555555]">Lifetime / N/A</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-2">
                                                {sub.is_active ? (
                                                    <CheckCircle2 size={14} className="text-emerald-400" />
                                                ) : (
                                                    <AlertCircle size={14} className="text-red-400" />
                                                )}
                                                <span className={`text-xs font-bold ${sub.is_active ? 'text-slate-300' : 'text-red-400'}`}>
                                                    {sub.is_active ? 'Active' : 'Expired'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionManagement;
