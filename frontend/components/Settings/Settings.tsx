import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Mail, 
  Check, 
  Loader2, 
  Lock, 
  Eye, 
  EyeOff, 
  UserCircle, 
  ShieldAlert, 
  Settings as SettingsIcon, 
  DollarSign, 
  ChevronDown 
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CURRENCIES } from '../../constants';

type SettingsTab = 'personal' | 'security' | 'preferences';

const Settings: React.FC = () => {
  const { user, updateUser, defaultCurrency, setDefaultCurrency } = useStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSavePersonal = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateUser({ name, email });
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  const renderPersonalSection = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#161616] rounded-[4px] border border-[#262626] overflow-hidden">
        <div className="p-8 border-b border-[#262626] flex items-center justify-between bg-[#121212]/50">
          <div>
            <h3 className="font-space text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <UserCircle size={24} className="text-[#E2DCC8]" />
              Corporate Profile
            </h3>
            <p className="text-[10px] text-[#888888] font-bold uppercase tracking-widest mt-1">Manage your public identity across the workspace.</p>
          </div>
        </div>
        
        <form onSubmit={handleSavePersonal} className="p-8 space-y-10">
          <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-[#262626]">
            <div className="w-28 h-28 bg-[#0F3D3E] rounded-[4px] flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-[#0F3D3E]/25 ring-4 ring-[#0F3D3E]/20 shrink-0">
              {user?.avatar || name.substring(0, 2).toUpperCase()}
            </div>
            <div className="space-y-3 text-center md:text-left">
              <div className="flex gap-3 justify-center md:justify-start">
                <button type="button" className="px-6 py-2.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white text-[10px] font-bold uppercase tracking-widest rounded-[4px] shadow-lg shadow-[#0F3D3E]/20 transition-all">
                  Upload Avatar
                </button>
                <button type="button" className="px-6 py-2.5 bg-[#1c1c1c] hover:bg-[#262626] text-[#888888] hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-[4px] border border-[#262626] transition-all">
                  Remove
                </button>
              </div>
              <p className="text-[10px] text-[#666666] font-bold uppercase tracking-wider">Recommended: Square 512x512 PNG/JPG. Max size 5MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Legal Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] px-5 py-3.5 text-base font-bold text-white focus:border-[#0F3D3E] outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Corporate Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] pl-12 pr-5 py-3.5 text-base font-bold text-white focus:border-[#0F3D3E] outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <button 
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-3 px-8 py-3.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white text-xs font-bold uppercase tracking-widest rounded-[4px] shadow-xl shadow-[#0F3D3E]/20 transition-all disabled:opacity-50 active:scale-95"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Commit Workspace Updates'}
            </button>
            
            {showSuccess && (
              <div className="flex items-center gap-2 text-emerald-400 animate-in fade-in zoom-in duration-300">
                <Check size={18} className="bg-emerald-500/10 rounded-full p-0.5" />
                <span className="text-xs font-bold uppercase tracking-widest">Profiles Synced</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#161616] rounded-[4px] border border-[#262626] overflow-hidden">
        <div className="p-8 border-b border-[#262626] flex items-center justify-between bg-[#121212]/50">
          <div>
            <h3 className="font-space text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <ShieldAlert size={24} className="text-rose-400" />
              Access Control
            </h3>
            <p className="text-[10px] text-[#888888] font-bold uppercase tracking-widest mt-1">Manage cryptographic credentials and platform security.</p>
          </div>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="bg-rose-950/20 border border-rose-900/40 p-6 rounded-[4px] flex items-start gap-4">
            <Lock size={20} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-rose-200 leading-tight mb-1">Enhanced Security: Multi-Factor Authentication</p>
              <p className="text-xs text-rose-300/80 font-medium">Enabling MFA increases your account resistance against unauthorized access by 99%.</p>
              <button className="mt-4 px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all">Configure MFA</button>
            </div>
          </div>

          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Current Access Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] pl-12 pr-5 py-3.5 text-base font-bold text-white focus:border-[#0F3D3E] outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">New Access Key</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new complex key"
                    className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] pl-12 pr-12 py-3.5 text-base font-bold text-white focus:border-[#0F3D3E] outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" className="px-8 py-3.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white text-xs font-bold uppercase tracking-widest rounded-[4px] shadow-xl shadow-[#0F3D3E]/20 transition-all">
              Update Secure Credentials
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#161616] rounded-[4px] border border-[#262626] overflow-hidden">
        <div className="p-8 border-b border-[#262626] flex items-center justify-between bg-[#121212]/50">
          <div>
            <h3 className="font-space text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <SettingsIcon size={24} className="text-[#E2DCC8]" />
              Global Preferences
            </h3>
            <p className="text-[10px] text-[#888888] font-bold uppercase tracking-widest mt-1">Set defaults for automation and commercial metadata.</p>
          </div>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Default Workspace Currency</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E2DCC8]" size={18} />
                <select 
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] pl-12 pr-10 py-3.5 text-base font-bold text-white outline-none focus:border-[#0F3D3E] appearance-none"
                >
                  {CURRENCIES.map(c => <option key={c.code} value={c.symbol}>{c.name} ({c.symbol})</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] pointer-events-none" size={18} />
              </div>
              <p className="text-[9px] font-bold text-[#666666] uppercase tracking-wider mt-1">This currency is applied to all new inventory entries automatically.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#100F0F] text-white p-8 lg:p-12 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-10">
        
        <div>
          <h1 className="font-space text-5xl font-bold text-white tracking-tight leading-none">Workspace Preferences</h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Navigation Rail */}
          <div className="xl:col-span-1 space-y-2">
            {[
              { id: 'personal', label: 'Identity Profile', icon: User, color: 'text-[#E2DCC8] bg-[#0F3D3E]/10' },
              { id: 'security', label: 'Access Control', icon: ShieldCheck, color: 'text-rose-400 bg-rose-950/40' },
              { id: 'preferences', label: 'Global Presets', icon: SettingsIcon, color: 'text-emerald-400 bg-emerald-950/40' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-[4px] transition-all group ${
                  activeTab === tab.id 
                    ? 'bg-[#161616] border border-[#262626] text-white shadow-lg' 
                    : 'text-[#888888] hover:bg-[#161616]/50 hover:text-white border border-transparent'
                }`}
              >
                <div className={`p-2 rounded-[4px] transition-colors ${activeTab === tab.id ? tab.color : 'bg-[#1c1c1c] text-[#888888]'}`}>
                  <tab.icon size={18} />
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${activeTab === tab.id ? 'text-white' : ''}`}>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Main Settings Body */}
          <div className="xl:col-span-3">
            {activeTab === 'personal' && renderPersonalSection()}
            {activeTab === 'security' && renderSecuritySection()}
            {activeTab === 'preferences' && renderPreferencesSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
