
import React from 'react';
import { useStore } from '../../store/useStore';
import {
    CreditCard,
    Calendar,
    Search,
    Filter,
    Download,
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
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <CreditCard size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Subs</p>
                        <p className="text-4xl font-black text-slate-900">{allSubscriptions.filter(s => s.is_active).length}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6">
                    <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Clock size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Expiring Soon</p>
                        <p className="text-4xl font-black text-slate-900">
                            {allSubscriptions.filter(s => {
                                if (!s.end_date) return false;
                                const daysLeft = Math.ceil((new Date(s.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                                return daysLeft > 0 && daysLeft <= 7;
                            }).length}
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <Calendar size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
                        <p className="text-4xl font-black text-slate-900 italic">Mocked</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">Subscription Factory</h2>
                        <p className="text-sm text-slate-500 font-medium mt-1">Monitor billing cycles and plan distributions.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search subscriptions..."
                                className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none w-64"
                            />
                        </div>
                        <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscriber</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Plan</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valid Until</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {allSubscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold italic">
                                        No active subscriptions found.
                                    </td>
                                </tr>
                            ) : (
                                allSubscriptions.map(sub => (
                                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-8 py-4">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{sub.user_name || 'Unnamed User'}</p>
                                                <p className="text-xs text-slate-500">{sub.user_email}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${sub.plan_name?.toLowerCase().includes('pro')
                                                    ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                    : sub.plan_name?.toLowerCase().includes('growth')
                                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                                        : 'bg-slate-50 text-slate-600 border-slate-200'
                                                }`}>
                                                {sub.plan_name}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4 text-xs font-mono text-slate-500">
                                            {new Date(sub.start_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </td>
                                        <td className="px-8 py-4">
                                            {sub.end_date ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-mono text-slate-500">
                                                        {new Date(sub.end_date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                                                        {Math.ceil((new Date(sub.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days left
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs italic text-slate-300">Lifetime / N/A</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-2">
                                                {sub.is_active ? (
                                                    <CheckCircle2 size={14} className="text-emerald-500" />
                                                ) : (
                                                    <AlertCircle size={14} className="text-red-500" />
                                                )}
                                                <span className={`text-xs font-bold ${sub.is_active ? 'text-slate-700' : 'text-red-600'}`}>
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
