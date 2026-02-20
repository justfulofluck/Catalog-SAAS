
import React, { useState } from 'react';
import {
    Users,
    ShieldCheck,
    Search,
    Filter,
    Download,
    MoreVertical,
    CheckCircle2,
    XCircle,
    LogOut,
    Store,
    Layout,
    CreditCard
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import BusinessManager from './BusinessManager';
import SubscriptionManagement from './SubscriptionManagement';

const AdminDashboard: React.FC = () => {
    const { registeredUsers, logout, user, fetchUsers, error } = useStore();
    const [activeTab, setActiveTab] = useState<'users' | 'businesses' | 'subscriptions'>('users');

    React.useEffect(() => {
        fetchUsers();
    }, []);

    const totalUsers = registeredUsers.length;
    const activeUsers = registeredUsers.filter(u => u.status === 'active').length;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
            {/* Top Admin Bar */}
            <div className="bg-[#0f172a] text-white px-8 py-4 flex items-center justify-between shadow-md z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">
                        <ShieldCheck size={18} />
                    </div>
                    <div>
                        <h1 className="text-sm font-black uppercase tracking-widest">Catalog Team</h1>
                        <p className="text-[9px] text-slate-400 font-medium">Administration Portal</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <p className="text-xs font-bold">{user?.name}</p>
                        <p className="text-[10px] text-slate-400">{user?.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 px-8 py-4 text-sm font-bold border-b border-red-100 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => useStore.setState({ error: null })}><XCircle size={16} /></button>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white border-b border-slate-200 px-8 pt-6">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        <Users size={16} /> User Accounts
                    </button>
                    <button
                        onClick={() => setActiveTab('businesses')}
                        className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'businesses' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        <Store size={16} /> Business Templates
                    </button>
                    <button
                        onClick={() => setActiveTab('subscriptions')}
                        className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'subscriptions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        <CreditCard size={16} /> Subscription Factory
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                <div className="max-w-7xl mx-auto space-y-10">

                    {activeTab === 'users' ? (
                        <>
                            {/* Stats Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6">
                                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                        <Users size={32} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Users</p>
                                        <p className="text-4xl font-black text-slate-900">{totalUsers}</p>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-6">
                                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Accounts</p>
                                        <p className="text-4xl font-black text-slate-900">{activeUsers}</p>
                                    </div>
                                </div>

                                <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-600/20 text-white flex flex-col justify-center">
                                    <p className="text-xs font-black text-indigo-200 uppercase tracking-widest mb-1">System Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                                        <p className="text-xl font-bold">All Systems Operational</p>
                                    </div>
                                </div>
                            </div>

                            {/* User Management Table */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900">User Management</h2>
                                        <p className="text-sm text-slate-500 font-medium mt-1">View and manage registered accounts.</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Search users..."
                                                className="bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-bold focus:ring-2 focus:ring-indigo-600/10 outline-none w-64"
                                            />
                                        </div>
                                        <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors">
                                            <Filter size={16} />
                                        </button>
                                        <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition-colors">
                                            <Download size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50/50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">
                                                    Avatar
                                                </th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    Identity
                                                </th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    Role
                                                </th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    Status
                                                </th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                    Joined Date
                                                </th>
                                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {registeredUsers.map(u => (
                                                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-8 py-4">
                                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">
                                                            {u.avatar || u.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{u.name}</p>
                                                            <p className="text-xs text-slate-500">{u.email}</p>
                                                            {u.businessName && <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[9px] font-bold uppercase">{u.businessName}</span>}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${u.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {u.status === 'active' ? (
                                                                <CheckCircle2 size={14} className="text-emerald-500" />
                                                            ) : (
                                                                <XCircle size={14} className="text-red-500" />
                                                            )}
                                                            <span className={`text-xs font-bold ${u.status === 'active' ? 'text-slate-700' : 'text-red-600'}`}>
                                                                {u.status === 'active' ? 'Active' : 'Suspended'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <span className="text-xs font-mono text-slate-500">
                                                            {new Date(u.joinedAt).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-4 text-right">
                                                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                                                            <MoreVertical size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : activeTab === 'businesses' ? (
                        <BusinessManager />
                    ) : (
                        <SubscriptionManagement />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
