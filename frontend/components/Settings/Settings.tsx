
import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Bell,
  Mail,
  Check,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  UserCircle,
  ShieldAlert,
  Smartphone,
  CreditCard,
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/30">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <UserCircle size={24} className="text-indigo-600 dark:text-indigo-400" />
              Corporate Profile
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-2">Manage your public identity across the workspace.</p>
          </div>
        </div>
        
        <form onSubmit={handleSavePersonal} className="p-10 space-y-12">
          <div className="flex flex-col md:flex-row items-center gap-10 pb-10 border-b border-slate-50 dark:border-slate-800">
            <div className="w-32 h-32 bg-indigo-600 dark:bg-indigo-500 rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-600/20 ring-8 ring-indigo-50 dark:ring-indigo-900/30 shrink-0">
              {user?.avatar || name.substring(0, 2).toUpperCase()}
            </div>
            <div className="space-y-4 text-center md:text-left">
              <div className="flex gap-3 justify-center md:justify-start">
                <button type="button" className="px-8 py-3.5 bg-indigo-600 dark:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/10 hover:bg-indigo-700 transition-all">
                  Upload Avatar
                </button>
                <button type="button" className="px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                  Remove
                </button>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">Recommended: Square 512x512 Assets. Max size 5MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Legal Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-base font-bold text-slate-800 dark:text-white focus:ring-4 focus:ring-indigo-600/5 dark:focus:ring-indigo-500/10 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all shadow-sm"
                required
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Corporate Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-14 pr-6 py-4 text-base font-bold text-slate-800 dark:text-white focus:ring-4 focus:ring-indigo-600/5 dark:focus:ring-indigo-500/10 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all shadow-sm"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-4">
            <button 
              type="submit"
              disabled={isSaving}
              className="flex items-center justify-center gap-3 px-10 py-5 bg-slate-900 dark:bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-black dark:hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : 'Commit Workspace Updates'}
            </button>
            
            {showSuccess && (
              <div className="flex items-center gap-3 text-emerald-500 animate-in fade-in zoom-in duration-300">
                <Check size={20} className="bg-emerald-500/10 rounded-full p-1" />
                <span className="text-sm font-black uppercase tracking-widest">Profiles Synced</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/30">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <ShieldAlert size={24} className="text-rose-500 dark:text-rose-400" />
              Access Control
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-2">Manage cryptographic credentials and platform security.</p>
          </div>
        </div>
        
        <div className="p-10 space-y-12">
           <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 p-6 rounded-2xl flex items-start gap-4">
              <Lock size={20} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-black text-rose-900 dark:text-rose-100 leading-tight mb-1">Enhanced Security: Multi-Factor Authentication</p>
                <p className="text-xs text-rose-700 dark:text-rose-400 font-medium">Enabling MFA increases your account resistance against unauthorized access by 99%.</p>
                <button className="mt-4 px-6 py-2.5 bg-rose-600 dark:bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all">Configure MFA</button>
              </div>
           </div>

           <form className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Current Access Key</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-14 pr-6 py-4 text-base font-bold text-slate-800 dark:text-white focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">New Access Key</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new complex key"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-14 pr-12 py-4 text-base font-bold text-slate-800 dark:text-white focus:border-indigo-600 outline-none"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
              <button type="submit" className="px-10 py-5 bg-slate-900 dark:bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-black dark:hover:bg-indigo-700 transition-all">Update Secure Credentials</button>
           </form>
        </div>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/30">
          <div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <SettingsIcon size={24} className="text-indigo-600 dark:text-indigo-400" />
              Global Preferences
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-2">Set defaults for automation and commercial metadata.</p>
          </div>
        </div>
        
        <div className="p-10 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Default Workspace Currency</label>
                    <div className="relative group">
                        <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500 dark:text-indigo-400" size={20} />
                        <select 
                            value={defaultCurrency}
                            onChange={(e) => setDefaultCurrency(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-14 pr-10 py-4 text-base font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 appearance-none"
                        >
                            {CURRENCIES.map(c => <option key={c.code} value={c.symbol}>{c.name} ({c.symbol})</option>)}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">This currency is applied to all new inventory entries automatically.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 p-8 lg:p-12 animate-in fade-in duration-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-12">
        
        <div className="mb-10">
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Workspace Preferences</h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
          {/* Enhanced Navigation Rail */}
          <div className="xl:col-span-1 space-y-3">
            {[
              { id: 'personal', label: 'Identity Profile', icon: User, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' },
              { id: 'security', label: 'Access Control', icon: ShieldCheck, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20' },
              { id: 'preferences', label: 'Global Presets', icon: SettingsIcon, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center gap-4 px-6 py-4.5 rounded-2xl transition-all group ${activeTab === tab.id ? 'bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <div className={`p-2.5 rounded-2xl transition-colors ${activeTab === tab.id ? tab.color : 'bg-slate-50 dark:bg-slate-800'}`}>
                  <tab.icon size={20} />
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-slate-900 dark:text-white' : ''}`}>{tab.label}</span>
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
