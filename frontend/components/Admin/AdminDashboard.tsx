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
    Sliders,
    Sparkles,
    ChevronRight,
    Layout,
    Activity,
    Menu,
    X
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import SubscriptionManagement from './SubscriptionManagement';
import { AdminSettings } from './AdminSettings';
import { AdminTemplateManager } from './AdminTemplateManager';

const AdminDashboard: React.FC = () => {
    const {
        registeredUsers,
        logout,
        user,
        fetchUsers,
        error,
        setIsAdminHeaderDesignerOpen,
        setIsAdminFooterDesignerOpen,
        openTemplateInVisualEditor
    } = useStore();

    const [activeTab, setActiveTab] = useState<'users' | 'subscriptions' | 'templates' | 'settings'>('templates');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    React.useEffect(() => {
        fetchUsers();
    }, []);

    const totalUsers = registeredUsers.length;
    const activeUsers = registeredUsers.filter(u => u.status === 'active').length;

    const navItems = [
        {
            id: 'templates' as const,
            label: 'Template & Studio Hub',
            icon: Sparkles
        },
        {
            id: 'users' as const,
            label: 'User Accounts',
            icon: Users
        },
        {
            id: 'subscriptions' as const,
            label: 'Subscription Factory',
            icon: CreditCard
        },
        {
            id: 'settings' as const,
            label: 'System Settings',
            icon: Sliders
        }
    ];

    return (
        <div className="min-h-screen bg-[#100F0F] text-white font-sans flex flex-col md:flex-row overflow-hidden">
            {/* Mobile Header Bar */}
            <div className="md:hidden bg-[#161616] border-b border-[#262626] px-4 py-3.5 flex items-center justify-between z-30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0F3D3E] rounded-[4px] flex items-center justify-center font-bold text-white shadow-md shadow-[#0F3D3E]/20">
                        <ShieldCheck size={18} />
                    </div>
                    <div>
                        <h1 className="font-space text-xs font-bold uppercase tracking-widest text-white">Catalog Team</h1>
                        <p className="text-[9px] text-[#888888] font-medium">Administration</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    className="p-2 bg-[#202020] border border-[#2e2e2e] rounded-[4px] text-[#cccccc] hover:text-white"
                >
                    {isMobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
            </div>

            {/* Backdrop for mobile */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-[#141414] border-r border-[#262626] flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {/* Top Brand / Logo */}
                <div className="p-6 border-b border-[#262626]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#0F3D3E] to-[#155455] rounded-[6px] flex items-center justify-center font-bold text-white shadow-lg shadow-[#0F3D3E]/30 border border-[#E2DCC8]/20">
                                <ShieldCheck size={22} className="text-[#E2DCC8]" />
                            </div>
                            <div>
                                <h1 className="font-space text-sm font-bold uppercase tracking-widest text-white leading-tight">Catalog Team</h1>
                                <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-[#0F3D3E]/30 text-[#E2DCC8] border border-[#0F3D3E]/50 rounded text-[9px] font-bold uppercase tracking-wider">
                                    Super Admin
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Main Section */}
                    <div>
                        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#666666] mb-3">Core Modules</p>
                        <nav className="space-y-1.5">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveTab(item.id);
                                            setIsMobileSidebarOpen(false);
                                        }}
                                        className={`w-full flex items-center px-3.5 py-3 rounded-[6px] text-xs font-bold transition-all duration-200 group text-left ${
                                            isActive
                                                ? 'bg-[#0F3D3E] text-white shadow-md shadow-[#0F3D3E]/25 border border-[#E2DCC8]/30 font-extrabold'
                                                : 'text-[#999999] hover:text-white hover:bg-[#1c1c1c] border border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon
                                                size={17}
                                                className={`transition-colors ${
                                                    isActive ? 'text-[#E2DCC8]' : 'text-[#666666] group-hover:text-white'
                                                }`}
                                            />
                                            <span>{item.label}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Quick Studio Launch Section */}
                    <div className="pt-4 border-t border-[#262626]">
                        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#666666] mb-3">Quick Studio Access</p>
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    setIsAdminHeaderDesignerOpen(true, null);
                                    setIsMobileSidebarOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 bg-[#181818] hover:bg-[#202020] border border-amber-500/20 hover:border-amber-500/40 rounded-[4px] text-[11px] font-bold text-amber-300 transition-all group"
                            >
                                <span className="flex items-center gap-2">
                                    <Sparkles size={13} /> Header Studio
                                </span>
                                <ChevronRight size={13} className="text-[#666666] group-hover:text-amber-300 transition-colors" />
                            </button>

                            <button
                                onClick={() => {
                                    setIsAdminFooterDesignerOpen(true, null);
                                    setIsMobileSidebarOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 bg-[#181818] hover:bg-[#202020] border border-cyan-500/20 hover:border-cyan-500/40 rounded-[4px] text-[11px] font-bold text-cyan-300 transition-all group"
                            >
                                <span className="flex items-center gap-2">
                                    <Sparkles size={13} /> Footer Studio
                                </span>
                                <ChevronRight size={13} className="text-[#666666] group-hover:text-cyan-300 transition-colors" />
                            </button>

                            <button
                                onClick={() => {
                                    openTemplateInVisualEditor(null);
                                    setIsMobileSidebarOpen(false);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 bg-[#181818] hover:bg-[#202020] border border-[#0F3D3E]/40 hover:border-[#0F3D3E] rounded-[4px] text-[11px] font-bold text-white transition-all group"
                            >
                                <span className="flex items-center gap-2">
                                    <Layout size={13} className="text-[#E2DCC8]" /> Catalog Studio
                                </span>
                                <ChevronRight size={13} className="text-[#666666] group-hover:text-white transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Footer: Profile & Logout */}
                <div className="p-4 border-t border-[#262626] bg-[#111111]">
                    <div className="flex items-center justify-between p-2.5 rounded-[6px] bg-[#181818] border border-[#262626]">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-[#0F3D3E] border border-[#E2DCC8]/30 flex items-center justify-center font-bold text-xs text-[#E2DCC8] shrink-0">
                                {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                                <p className="text-[10px] text-[#888888] truncate">{user?.email || 'admin@catalogstudio.com'}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 hover:bg-[#262626] rounded-[4px] text-[#888888] hover:text-red-400 transition-colors shrink-0"
                            title="Sign Out"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {error && (
                    <div className="bg-red-950/40 text-red-300 px-8 py-3 text-xs font-bold border-b border-red-800/40 flex items-center justify-between shrink-0">
                        <span>{error}</span>
                        <button onClick={() => useStore.setState({ error: null })}><XCircle size={15} /></button>
                    </div>
                )}

                {/* Dynamic Content Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-8">
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
                                            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
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
                        ) : activeTab === 'templates' ? (
                            <AdminTemplateManager />
                        ) : (
                            <AdminSettings />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
