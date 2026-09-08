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
    CreditCard,
    Sparkles
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import SubscriptionManagement from './SubscriptionManagement';
import { AdminTemplateManager } from './AdminTemplateManager';

const AdminDashboard: React.FC = () => {
    const { registeredUsers, logout, user, fetchUsers, error } = useStore();
    const [activeTab, setActiveTab] = useState<'users' | 'subscriptions' | 'templates'>('users');

    React.useEffect(() => {
        fetchUsers();
    }, []);

    const totalUsers = registeredUsers.length;
    const activeUsers = registeredUsers.filter(u => u.status === 'active').length;

    return (
        <div className="min-h-screen bg-[#100F0F] text-white font-sans flex flex-col">
            {/* Top Admin Bar */}
            <div className="bg-[#161616] text-white px-8 py-4 flex items-center justify-between border-b border-[#262626] z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0F3D3E] rounded-[4px] flex items-center justify-center font-bold text-white shadow-md shadow-[#0F3D3E]/20">
                        <ShieldCheck size={18} />
                    </div>
                    <div>
                        <h1 className="font-space text-sm font-bold uppercase tracking-widest text-white">Catalog Team</h1>
                        <p className="text-[9px] text-[#888888] font-medium">Administration Portal</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                        <p className="text-xs font-bold text-white">{user?.name}</p>
                        <p className="text-[10px] text-[#888888]">{user?.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 hover:bg-[#262626] rounded-[4px] transition-colors text-[#888888] hover:text-white"
                        title="Sign Out"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-950/40 text-red-300 px-8 py-4 text-sm font-bold border-b border-red-800/40 flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => useStore.setState({ error: null })}><XCircle size={16} /></button>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-[#121212] border-b border-[#262626] px-8 pt-4">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'users' ? 'border-[#0F3D3E] text-[#E2DCC8]' : 'border-transparent text-[#888888] hover:text-white'}`}
                    >
                        <Users size={16} /> User Accounts
                    </button>

                    <button
                        onClick={() => setActiveTab('subscriptions')}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'subscriptions' ? 'border-[#0F3D3E] text-[#E2DCC8]' : 'border-transparent text-[#888888] hover:text-white'}`}
                    >
                        <CreditCard size={16} /> Subscription Factory
                    </button>

                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'templates' ? 'border-[#0F3D3E] text-[#E2DCC8]' : 'border-transparent text-[#888888] hover:text-white'}`}
                    >
                        <Sparkles size={16} /> Template Studio
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                <div className="max-w-7xl mx-auto space-y-10">

                    {activeTab === 'users' ? (
                        <>
                            {/* Stats Overview */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-[#161616] p-6 rounded-[4px] border border-[#262626] flex items-center gap-6">
                                    <div className="w-16 h-16 bg-[#0F3D3E]/10 text-[#E2DCC8] rounded-[4px] flex items-center justify-center">
                                        <Users size={32} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#888888] uppercase tracking-widest">Total Users</p>
                                        <p className="font-space text-4xl font-bold text-white">{totalUsers}</p>
                                    </div>
                                </div>

                                <div className="bg-[#161616] p-6 rounded-[4px] border border-[#262626] flex items-center gap-6">
                                    <div className="w-16 h-16 bg-emerald-950/40 text-emerald-400 rounded-[4px] flex items-center justify-center">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-[#888888] uppercase tracking-widest">Active Accounts</p>
                                        <p className="font-space text-4xl font-bold text-white">{activeUsers}</p>
                                    </div>
                                </div>

                                <div className="bg-[#161616] border border-[#262626] p-6 rounded-[4px] flex flex-col justify-center">
                                    <p className="text-xs font-bold text-[#888888] uppercase tracking-widest mb-1">System Status</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 bg-[#0F3D3E] rounded-full animate-pulse" />
                                        <span className="font-space text-sm font-bold tracking-wide text-white">All Systems Operational</span>
                                    </div>
                                </div>
                            </div>

                            {/* User Management Table */}
                            <div className="bg-[#161616] rounded-[4px] border border-[#262626] overflow-hidden shadow-xl">
                                <div className="p-8 border-b border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="font-space text-lg font-bold tracking-tight text-white">User Management</h2>
                                        <p className="text-xs text-[#888888] font-medium">View and manage registered accounts.</p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Search users..."
                                                className="pl-9 pr-4 py-2 bg-[#1c1c1c] border border-[#262626] rounded-[4px] text-xs font-medium text-white placeholder-[#666666] outline-none focus:border-[#0F3D3E] transition-all w-64"
                                            />
                                        </div>
                                        <button className="p-2 border border-[#262626] rounded-[4px] text-[#888888] hover:text-white hover:bg-[#1c1c1c] transition-colors">
                                            <Filter size={14} />
                                        </button>
                                        <button className="p-2 border border-[#262626] rounded-[4px] text-[#888888] hover:text-white hover:bg-[#1c1c1c] transition-colors">
                                            <Download size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-[#262626] bg-[#121212] text-[10px] font-bold uppercase tracking-widest text-[#888888]">
                                                <th className="px-8 py-4">Avatar</th>
                                                <th className="px-8 py-4">Identity</th>
                                                <th className="px-8 py-4">Role</th>
                                                <th className="px-8 py-4">Status</th>
                                                <th className="px-8 py-4">Joined Date</th>
                                                <th className="px-8 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#262626]">
                                            {registeredUsers.map((u) => (
                                                <tr key={u.id} className="hover:bg-[#1c1c1c] transition-colors group">
                                                    <td className="px-8 py-4">
                                                        <div className="w-10 h-10 rounded-[4px] bg-[#1c1c1c] border border-[#262626] flex items-center justify-center font-bold text-white text-xs">
                                                            {u.avatar ? (
                                                                <img src={u.avatar} alt={u.name} className="w-full h-full object-cover rounded-[4px]" />
                                                            ) : (
                                                                u.name.slice(0, 2).toUpperCase()
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <p className="text-xs font-bold text-white">{u.name}</p>
                                                        <p className="text-[11px] text-[#888888] font-medium">{u.email}</p>
                                                        {u.businessName && (
                                                            <span className="inline-block mt-1 px-2 py-0.5 bg-[#0F3D3E]/10 text-[#E2DCC8] rounded text-[9px] font-bold uppercase tracking-wider border border-[#0F3D3E]/20">
                                                                {u.businessName}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-[#0F3D3E]/10 text-[#E2DCC8] border border-[#0F3D3E]/20' : 'bg-[#1c1c1c] text-[#888888] border border-[#262626]'}`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {u.status === 'active' ? (
                                                                <CheckCircle2 size={14} className="text-emerald-400" />
                                                            ) : (
                                                                <XCircle size={14} className="text-red-400" />
                                                            )}
                                                            <span className={`text-xs font-bold ${u.status === 'active' ? 'text-slate-300' : 'text-red-400'}`}>
                                                                {u.status === 'active' ? 'Active' : 'Suspended'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <span className="text-xs font-mono text-[#888888]">
                                                            {new Date(u.joinedAt).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-4 text-right">
                                                        <button className="p-2 hover:bg-[#262626] rounded-[4px] text-[#666666] hover:text-white transition-colors">
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
                    ) : activeTab === 'subscriptions' ? (
                        <SubscriptionManagement />
                    ) : (
                        <AdminTemplateManager />
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
