import React, { useState, useEffect, useRef } from 'react';
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
    BookOpen,
    Activity,
    Menu,
    X,
    Edit3,
    Trash2,
    Shield,
    ShieldAlert,
    UserCheck,
    UserX,
    Loader2,
    Building,
    Mail,
    User as UserIcon,
    Check
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import SubscriptionManagement from './SubscriptionManagement';
import { AdminSettings } from './AdminSettings';
import { AdminTemplateManager } from './AdminTemplateManager';
import { User } from '../../store/types';

const AdminDashboard: React.FC = () => {
    const {
        registeredUsers,
        logout,
        user,
        fetchUsers,
        updateUserAdmin,
        deleteUserAdmin,
        showConfirm,
        showToast,
        error,
        setIsAdminHeaderDesignerOpen,
        setIsAdminFooterDesignerOpen,
        openTemplateInVisualEditor
    } = useStore();

    const [activeTab, setActiveTab] = useState<'users' | 'subscriptions' | 'templates' | 'settings'>('templates');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // User management states
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [activeActionUserId, setActiveActionUserId] = useState<string | number | null>(null);

    // Edit modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        businessName: '',
        role: 'user' as 'admin' | 'user',
        status: 'active' as 'active' | 'suspended'
    });
    const [isSavingUser, setIsSavingUser] = useState(false);

    const actionMenuRef = useRef<HTMLDivElement>(null);
    const filterMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    // Close action menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setActiveActionUserId(null);
            }
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
                setIsFilterDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const totalUsers = registeredUsers.length;
    const activeUsers = registeredUsers.filter(u => u.status === 'active').length;

    // Filter users
    const filteredUsers = registeredUsers.filter(u => {
        const matchesSearch =
            (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.businessName || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const handleOpenEditModal = (targetUser: User) => {
        setEditingUser(targetUser);
        setEditForm({
            name: targetUser.name || '',
            businessName: targetUser.businessName || '',
            role: targetUser.role === 'admin' ? 'admin' : 'user',
            status: targetUser.status === 'suspended' ? 'suspended' : 'active'
        });
        setActiveActionUserId(null);
        setIsEditModalOpen(true);
    };

    const handleSaveEditUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setIsSavingUser(true);
        try {
            const result = await updateUserAdmin(editingUser.id, {
                name: editForm.name,
                business_name: editForm.businessName,
                is_staff: editForm.role === 'admin',
                is_active: editForm.status === 'active'
            });
            if (result.success) {
                setIsEditModalOpen(false);
                setEditingUser(null);
            }
        } finally {
            setIsSavingUser(false);
        }
    };

    const handleToggleRole = async (targetUser: User) => {
        setActiveActionUserId(null);
        const newIsStaff = targetUser.role !== 'admin';
        showConfirm({
            title: newIsStaff ? 'Promote to Admin' : 'Demote to Standard User',
            message: `Are you sure you want to change privileges for "${targetUser.name || targetUser.email}" to ${newIsStaff ? 'Super Admin' : 'Standard User'}?`,
            confirmText: newIsStaff ? 'Promote to Admin' : 'Demote User',
            type: newIsStaff ? 'info' : 'warning',
            onConfirm: async () => {
                await updateUserAdmin(targetUser.id, { is_staff: newIsStaff });
            }
        });
    };

    const handleToggleStatus = async (targetUser: User) => {
        setActiveActionUserId(null);
        const newIsActive = targetUser.status !== 'active';
        showConfirm({
            title: newIsActive ? 'Reactivate Account' : 'Suspend Account',
            message: `Are you sure you want to ${newIsActive ? 'reactivate' : 'suspend'} the account of "${targetUser.name || targetUser.email}"?`,
            confirmText: newIsActive ? 'Reactivate' : 'Suspend',
            type: newIsActive ? 'info' : 'danger',
            onConfirm: async () => {
                await updateUserAdmin(targetUser.id, { is_active: newIsActive });
            }
        });
    };

    const handleDeleteUser = (targetUser: User) => {
        setActiveActionUserId(null);
        showConfirm({
            title: 'Delete User Account',
            message: `Are you sure you want to permanently delete user "${targetUser.name || targetUser.email}"? This action cannot be undone and will remove all their data.`,
            confirmText: 'Delete User',
            type: 'danger',
            onConfirm: async () => {
                await deleteUserAdmin(targetUser.id);
            }
        });
    };

    const handleExportUsersCSV = () => {
        if (registeredUsers.length === 0) {
            showToast('No users to export', 'info');
            return;
        }
        const headers = ['ID', 'Name', 'Email', 'Business Name', 'Role', 'Status', 'Joined Date', 'Plan'];
        const rows = registeredUsers.map(u => [
            `"${u.id}"`,
            `"${(u.name || '').replace(/"/g, '""')}"`,
            `"${(u.email || '').replace(/"/g, '""')}"`,
            `"${(u.businessName || '').replace(/"/g, '""')}"`,
            `"${u.role}"`,
            `"${u.status}"`,
            `"${u.joinedAt || ''}"`,
            `"${u.subscription_plan || 'Starter'}"`
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `catalogstudio_users_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Users exported to CSV', 'success');
    };

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
                                className="w-full flex items-center justify-between px-3 py-2 bg-[#181818] hover:bg-[#202020] border border-emerald-500/20 hover:border-emerald-500/40 rounded-[4px] text-[11px] font-bold text-emerald-300 transition-all group"
                            >
                                <span className="flex items-center gap-2">
                                    <BookOpen size={13} className="text-emerald-400" /> Cover Studio
                                </span>
                                <ChevronRight size={13} className="text-[#666666] group-hover:text-emerald-300 transition-colors" />
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
                                <div className="bg-[#161616] rounded-[4px] border border-[#262626] shadow-xl relative">
                                    <div className="p-8 border-b border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h2 className="font-space text-lg font-bold tracking-tight text-white">User Management</h2>
                                            <p className="text-xs text-[#888888] font-medium">View and manage registered accounts.</p>
                                        </div>

                                        <div className="flex items-center gap-3 flex-wrap">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" size={14} />
                                                <input
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Search users..."
                                                    className="pl-9 pr-4 py-2 bg-[#1c1c1c] border border-[#262626] rounded-[4px] text-xs font-medium text-white placeholder-[#666666] outline-none focus:border-[#0F3D3E] transition-all w-60 md:w-64"
                                                />
                                                {searchQuery && (
                                                    <button
                                                        onClick={() => setSearchQuery('')}
                                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Filter dropdown */}
                                            <div className="relative" ref={filterMenuRef}>
                                                <button
                                                    onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                                                    className={`p-2 border rounded-[4px] transition-colors flex items-center gap-1.5 text-xs font-bold ${
                                                        roleFilter !== 'all' || statusFilter !== 'all'
                                                            ? 'border-[#0F3D3E] bg-[#0F3D3E]/20 text-[#E2DCC8]'
                                                            : 'border-[#262626] text-[#888888] hover:text-white hover:bg-[#1c1c1c]'
                                                    }`}
                                                    title="Filter Users"
                                                >
                                                    <Filter size={14} />
                                                    {(roleFilter !== 'all' || statusFilter !== 'all') && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#E2DCC8]" />
                                                    )}
                                                </button>

                                                {isFilterDropdownOpen && (
                                                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#161616] border border-[#2e2e2e] rounded-[6px] shadow-2xl p-3 z-30 space-y-3">
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-1.5">Role</p>
                                                            <div className="grid grid-cols-3 gap-1">
                                                                {(['all', 'admin', 'user'] as const).map((r) => (
                                                                    <button
                                                                        key={r}
                                                                        onClick={() => setRoleFilter(r)}
                                                                        className={`px-2 py-1 text-[10px] font-bold rounded capitalize ${
                                                                            roleFilter === r
                                                                                ? 'bg-[#0F3D3E] text-white'
                                                                                : 'bg-[#202020] text-[#888888] hover:text-white'
                                                                        }`}
                                                                    >
                                                                        {r}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#777777] mb-1.5">Status</p>
                                                            <div className="grid grid-cols-3 gap-1">
                                                                {(['all', 'active', 'suspended'] as const).map((s) => (
                                                                    <button
                                                                        key={s}
                                                                        onClick={() => setStatusFilter(s)}
                                                                        className={`px-2 py-1 text-[10px] font-bold rounded capitalize ${
                                                                            statusFilter === s
                                                                                ? 'bg-[#0F3D3E] text-white'
                                                                                : 'bg-[#202020] text-[#888888] hover:text-white'
                                                                        }`}
                                                                    >
                                                                        {s}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {(roleFilter !== 'all' || statusFilter !== 'all') && (
                                                            <button
                                                                onClick={() => {
                                                                    setRoleFilter('all');
                                                                    setStatusFilter('all');
                                                                }}
                                                                className="w-full py-1 text-[10px] font-bold text-center text-red-400 hover:text-red-300 border-t border-[#262626] pt-2"
                                                            >
                                                                Reset Filters
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* CSV Export */}
                                            <button
                                                onClick={handleExportUsersCSV}
                                                className="p-2 border border-[#262626] rounded-[4px] text-[#888888] hover:text-white hover:bg-[#1c1c1c] transition-colors"
                                                title="Export Users to CSV"
                                            >
                                                <Download size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto min-h-[260px]">
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
                                                {filteredUsers.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={6} className="px-8 py-12 text-center text-xs text-[#777777]">
                                                            No users found matching your search or filters.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredUsers.map((u) => (
                                                        <tr key={u.id} className="hover:bg-[#1c1c1c] transition-colors group">
                                                            <td className="px-8 py-4">
                                                                <div className="w-10 h-10 rounded-[4px] bg-[#1c1c1c] border border-[#262626] flex items-center justify-center font-bold text-white text-xs">
                                                                    {u.avatar ? (
                                                                        <img src={u.avatar} alt={u.name} className="w-full h-full object-cover rounded-[4px]" />
                                                                    ) : (
                                                                        (u.name || 'User').slice(0, 2).toUpperCase()
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-4">
                                                                <p className="text-xs font-bold text-white">{u.name || 'Unnamed Account'}</p>
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
                                                            <td className="px-8 py-4 text-right relative">
                                                                <div className="inline-block">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setActiveActionUserId(activeActionUserId === u.id ? null : u.id);
                                                                        }}
                                                                        className={`p-2 rounded-[4px] transition-colors ${
                                                                            activeActionUserId === u.id
                                                                                ? 'bg-[#0F3D3E] text-white'
                                                                                : 'hover:bg-[#262626] text-[#888888] hover:text-white'
                                                                        }`}
                                                                        title="User Actions"
                                                                    >
                                                                        <MoreVertical size={16} />
                                                                    </button>

                                                                    {/* Action Popup Dropdown */}
                                                                    {activeActionUserId === u.id && (
                                                                        <div
                                                                            ref={actionMenuRef}
                                                                            className="absolute right-8 top-12 w-52 bg-[#161616] border border-[#2c2c2c] rounded-[6px] shadow-2xl py-1.5 z-50 text-left divide-y divide-[#222222]"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            <div className="py-1">
                                                                                <button
                                                                                    onClick={() => handleOpenEditModal(u)}
                                                                                    className="w-full px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-[#222222] hover:text-white flex items-center gap-2.5 transition-colors"
                                                                                >
                                                                                    <Edit3 size={14} className="text-amber-400" />
                                                                                    <span>Edit Account</span>
                                                                                </button>
                                                                            </div>

                                                                            <div className="py-1">
                                                                                <button
                                                                                    onClick={() => handleToggleRole(u)}
                                                                                    className="w-full px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-[#222222] hover:text-white flex items-center gap-2.5 transition-colors"
                                                                                >
                                                                                    {u.role === 'admin' ? (
                                                                                        <>
                                                                                            <ShieldAlert size={14} className="text-purple-400" />
                                                                                            <span>Demote to User</span>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <Shield size={14} className="text-cyan-400" />
                                                                                            <span>Promote to Admin</span>
                                                                                        </>
                                                                                    )}
                                                                                </button>

                                                                                <button
                                                                                    onClick={() => handleToggleStatus(u)}
                                                                                    className="w-full px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-[#222222] hover:text-white flex items-center gap-2.5 transition-colors"
                                                                                >
                                                                                    {u.status === 'active' ? (
                                                                                        <>
                                                                                            <UserX size={14} className="text-yellow-400" />
                                                                                            <span>Suspend Account</span>
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <UserCheck size={14} className="text-emerald-400" />
                                                                                            <span>Reactivate Account</span>
                                                                                        </>
                                                                                    )}
                                                                                </button>
                                                                            </div>

                                                                            <div className="py-1">
                                                                                <button
                                                                                    onClick={() => handleDeleteUser(u)}
                                                                                    className="w-full px-3.5 py-2 text-xs font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 flex items-center gap-2.5 transition-colors"
                                                                                >
                                                                                    <Trash2 size={14} />
                                                                                    <span>Delete Account</span>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
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

            {/* Edit User Modal */}
            {isEditModalOpen && editingUser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#161616] border border-[#2e2e2e] rounded-[8px] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
                        <div className="p-6 border-b border-[#262626] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[#0F3D3E]/40 border border-[#0F3D3E] flex items-center justify-center text-[#E2DCC8]">
                                    <UserIcon size={18} />
                                </div>
                                <div>
                                    <h3 className="font-space text-sm font-bold text-white">Edit User Account</h3>
                                    <p className="text-[11px] text-[#888888] font-mono">{editingUser.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-1.5 text-[#888888] hover:text-white rounded-[4px] hover:bg-[#202020]"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveEditUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-1.5">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" size={14} />
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        placeholder="User full name"
                                        required
                                        className="w-full pl-9 pr-3.5 py-2.5 bg-[#1c1c1c] border border-[#2e2e2e] rounded-[4px] text-xs font-medium text-white focus:border-[#0F3D3E] outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-1.5">
                                    Email Address (Read-only)
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555555]" size={14} />
                                    <input
                                        type="email"
                                        value={editingUser.email}
                                        disabled
                                        className="w-full pl-9 pr-3.5 py-2.5 bg-[#141414] border border-[#222222] rounded-[4px] text-xs font-mono text-[#666666] cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-1.5">
                                    Business Name
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" size={14} />
                                    <input
                                        type="text"
                                        value={editForm.businessName}
                                        onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                                        placeholder="Business / Organization Name"
                                        className="w-full pl-9 pr-3.5 py-2.5 bg-[#1c1c1c] border border-[#2e2e2e] rounded-[4px] text-xs font-medium text-white focus:border-[#0F3D3E] outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-1.5">
                                        Account Role
                                    </label>
                                    <select
                                        value={editForm.role}
                                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                                        className="w-full px-3 py-2.5 bg-[#1c1c1c] border border-[#2e2e2e] rounded-[4px] text-xs font-bold text-white focus:border-[#0F3D3E] outline-none"
                                    >
                                        <option value="user">Standard User</option>
                                        <option value="admin">Super Admin</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#888888] mb-1.5">
                                        Account Status
                                    </label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                                        className="w-full px-3 py-2.5 bg-[#1c1c1c] border border-[#2e2e2e] rounded-[4px] text-xs font-bold text-white focus:border-[#0F3D3E] outline-none"
                                    >
                                        <option value="active">Active</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>

                            <div className="p-4 border-t border-[#262626] flex items-center justify-end gap-3 mt-6 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 bg-[#202020] hover:bg-[#262626] text-xs font-bold text-[#888888] hover:text-white rounded-[4px] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingUser}
                                    className="px-5 py-2 bg-[#0F3D3E] hover:bg-[#134e4f] text-xs font-bold text-white rounded-[4px] shadow-md shadow-[#0F3D3E]/30 flex items-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {isSavingUser ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={14} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

