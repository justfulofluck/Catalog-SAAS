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
  const { user, updateUser, defaultCurrency, setDefaultCurrency, uiTheme } = useStore();
  const isDark = uiTheme === 'dark';
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
      <div className={`rounded-[4px] border overflow-hidden transition-colors ${
        isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className={`p-8 border-b flex items-center justify-between transition-colors ${
          isDark ? 'bg-[#121212]/50 border-[#262626]' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div>
            <h3 className={`font-space text-2xl font-bold tracking-tight flex items-center gap-3 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <UserCircle size={24} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
              Corporate Profile
            </h3>
            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
              isDark ? 'text-[#888888]' : 'text-slate-500'
            }`}>Manage your public identity across the workspace.</p>
          </div>
        </div>
        
        <form onSubmit={handleSavePersonal} className="p-8 space-y-10">
          <div className={`flex flex-col md:flex-row items-center gap-8 pb-8 border-b ${
            isDark ? 'border-[#262626]' : 'border-slate-200'
          }`}>
            <div className="w-28 h-28 bg-[#0F3D3E] rounded-[4px] flex items-center justify-center text-white text-3xl font-bold shadow-2xl shadow-[#0F3D3E]/25 ring-4 ring-[#0F3D3E]/20 shrink-0">
              {user?.avatar || name.substring(0, 2).toUpperCase()}
            </div>
            <div className="space-y-3 text-center md:text-left">
              <div className="flex gap-3 justify-center md:justify-start">
                <button type="button" className="px-6 py-2.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white text-[10px] font-bold uppercase tracking-widest rounded-[4px] shadow-lg shadow-[#0F3D3E]/20 transition-all">
                  Upload Avatar
                </button>
                <button type="button" className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-[4px] border transition-all ${
                  isDark 
                    ? 'bg-[#1c1c1c] hover:bg-[#262626] text-[#888888] hover:text-white border-[#262626]' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
                }`}>
                  Remove
                </button>
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${
                isDark ? 'text-[#666666]' : 'text-slate-400'
              }`}>Recommended: Square 512x512 PNG/JPG. Max size 5MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${
                isDark ? 'text-[#888888]' : 'text-slate-500'
              }`}>Legal Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full border rounded-[4px] px-5 py-3.5 text-base font-bold outline-none transition-all ${
                  isDark 
                    ? 'bg-[#1c1c1c] border-[#262626] text-white focus:border-[#0F3D3E]' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0F3D3E] focus:bg-white'
                }`}
                required
              />
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${
                isDark ? 'text-[#888888]' : 'text-slate-500'
              }`}>Corporate Email Address</label>
              <div className="relative">
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#666666]' : 'text-slate-400'}`} size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border rounded-[4px] pl-12 pr-5 py-3.5 text-base font-bold outline-none transition-all ${
                    isDark 
                      ? 'bg-[#1c1c1c] border-[#262626] text-white focus:border-[#0F3D3E]' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0F3D3E] focus:bg-white'
                  }`}
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
              <div className="flex items-center gap-2 text-emerald-500 animate-in fade-in zoom-in duration-300">
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
      <div className={`rounded-[4px] border overflow-hidden transition-colors ${
        isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className={`p-8 border-b flex items-center justify-between transition-colors ${
          isDark ? 'bg-[#121212]/50 border-[#262626]' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div>
            <h3 className={`font-space text-2xl font-bold tracking-tight flex items-center gap-3 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <ShieldAlert size={24} className="text-rose-500" />
              Access Control
            </h3>
            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
              isDark ? 'text-[#888888]' : 'text-slate-500'
            }`}>Manage cryptographic credentials and platform security.</p>
          </div>
        </div>
        
        <div className="p-8 space-y-8">
          <div className={`border p-6 rounded-[4px] flex items-start gap-4 ${
            isDark ? 'bg-rose-950/20 border-rose-900/40 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <Lock size={20} className="text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className={`text-sm font-bold leading-tight mb-1 ${isDark ? 'text-rose-200' : 'text-rose-950'}`}>Enhanced Security: Multi-Factor Authentication</p>
              <p className={`text-xs font-medium ${isDark ? 'text-rose-300/80' : 'text-rose-800/80'}`}>Enabling MFA increases your account resistance against unauthorized access by 99%.</p>
              <button className="mt-4 px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all">Configure MFA</button>
            </div>
          </div>

          <form className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${
                  isDark ? 'text-[#888888]' : 'text-slate-500'
                }`}>Current Access Key</label>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#666666]' : 'text-slate-400'}`} size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full border rounded-[4px] pl-12 pr-5 py-3.5 text-base font-bold outline-none transition-all ${
                      isDark 
                        ? 'bg-[#1c1c1c] border-[#262626] text-white focus:border-[#0F3D3E]' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0F3D3E] focus:bg-white'
                    }`}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${
                  isDark ? 'text-[#888888]' : 'text-slate-500'
                }`}>New Access Key</label>
                <div className="relative group">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#666666]' : 'text-slate-400'}`} size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new complex key"
                    className={`w-full border rounded-[4px] pl-12 pr-12 py-3.5 text-base font-bold outline-none transition-all ${
                      isDark 
                        ? 'bg-[#1c1c1c] border-[#262626] text-white focus:border-[#0F3D3E]' 
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0F3D3E] focus:bg-white'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                    isDark ? 'text-[#666666] hover:text-white' : 'text-slate-400 hover:text-slate-800'
                  }`}>
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
      <div className={`rounded-[4px] border overflow-hidden transition-colors ${
        isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className={`p-8 border-b flex items-center justify-between transition-colors ${
          isDark ? 'bg-[#121212]/50 border-[#262626]' : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div>
            <h3 className={`font-space text-2xl font-bold tracking-tight flex items-center gap-3 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <SettingsIcon size={24} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
              Global Preferences
            </h3>
            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${
              isDark ? 'text-[#888888]' : 'text-slate-500'
            }`}>Set defaults for automation and commercial metadata.</p>
          </div>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${
                isDark ? 'text-[#888888]' : 'text-slate-500'
              }`}>Default Workspace Currency</label>
              <div className="relative group">
                <DollarSign className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`} size={18} />
                <select 
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className={`w-full border rounded-[4px] pl-12 pr-10 py-3.5 text-base font-bold outline-none appearance-none transition-all ${
                    isDark 
                      ? 'bg-[#1c1c1c] border-[#262626] text-white focus:border-[#0F3D3E]' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0F3D3E] focus:bg-white'
                  }`}
                >
                  {CURRENCIES.map(c => <option key={c.code} value={c.symbol}>{c.name} ({c.symbol})</option>)}
                </select>
                <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isDark ? 'text-[#666666]' : 'text-slate-400'
                }`} size={18} />
              </div>
              <p className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${
                isDark ? 'text-[#666666]' : 'text-slate-400'
              }`}>This currency is applied to all new inventory entries automatically.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex-1 overflow-y-auto p-8 lg:p-12 animate-in fade-in duration-500 transition-colors ${
      isDark ? 'bg-[#100F0F] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto space-y-10">
        
        <div>
          <h1 className={`font-space text-5xl font-bold tracking-tight leading-none ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>Workspace Preferences</h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Navigation Rail */}
          <div className="xl:col-span-1 space-y-2">
            {[
              { id: 'personal', label: 'Identity Profile', icon: User, color: isDark ? 'text-[#E2DCC8] bg-[#0F3D3E]/10' : 'text-[#0F3D3E] bg-teal-50' },
              { id: 'security', label: 'Access Control', icon: ShieldCheck, color: isDark ? 'text-rose-400 bg-rose-950/40' : 'text-rose-600 bg-rose-50' },
              { id: 'preferences', label: 'Global Presets', icon: SettingsIcon, color: isDark ? 'text-emerald-400 bg-emerald-950/40' : 'text-emerald-600 bg-emerald-50' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-[4px] transition-all group ${
                  activeTab === tab.id 
                    ? (isDark ? 'bg-[#161616] border border-[#262626] text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-900 shadow-sm font-bold') 
                    : (isDark ? 'text-[#888888] hover:bg-[#161616]/50 hover:text-white border border-transparent' : 'text-slate-600 hover:bg-white/80 hover:text-slate-900 border border-transparent')
                }`}
              >
                <div className={`p-2 rounded-[4px] transition-colors ${activeTab === tab.id ? tab.color : (isDark ? 'bg-[#1c1c1c] text-[#888888]' : 'bg-slate-100 text-slate-500')}`}>
                  <tab.icon size={18} />
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${activeTab === tab.id ? (isDark ? 'text-white' : 'text-slate-900') : ''}`}>{tab.label}</span>
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
