import React, { useState, useEffect } from 'react';
import { 
  User, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  DollarSign, 
  ChevronDown,
  Building,
  Save,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CURRENCIES } from '../../constants';
import { authApi } from '../../client';

type SettingsTab = 'personal' | 'security' | 'preferences';

export const Settings: React.FC = () => {
  const { user, updateUser, defaultCurrency, setDefaultCurrency, uiTheme, showToast } = useStore();
  const isDark = uiTheme === 'dark';
  const [activeTab, setActiveTab] = useState<SettingsTab>('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setBusinessName(user.businessName || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload: any = { name, email };
      if (businessName !== undefined) {
        payload.business_name = businessName;
      }

      await authApi.updateUser(payload);
      updateUser({ name, email, businessName });
      
      setSaveSuccess(true);
      if (showToast) showToast('Profile settings saved successfully', 'success');
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to update profile';
      if (showToast) showToast(errMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!newPassword || newPassword.length < 6) {
      setPasswordStatus({ success: false, message: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ success: false, message: 'New passwords do not match.' });
      return;
    }

    setPasswordLoading(true);
    try {
      await authApi.updateUser({
        current_password: currentPassword,
        new_password: newPassword
      });
      setPasswordStatus({ success: true, message: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (showToast) showToast('Password updated successfully', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Failed to update password. Please check your current password.';
      setPasswordStatus({ success: false, message: msg });
      if (showToast) showToast(msg, 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const initials = user?.name 
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() 
    : 'U';

  const renderPersonalSection = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className={`rounded-[8px] border overflow-hidden ${
        isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'bg-[#141414] border-[#262626]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <h3 className={`font-space text-lg font-bold flex items-center gap-2.5 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <User size={18} className="text-[#00E5BF]" />
              Profile & Account Details
            </h3>
            <p className={`text-xs mt-1 font-medium ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
              Manage your personal identity, company name, and workspace contact details.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-mono px-2.5 py-1 rounded-[4px] border uppercase font-semibold ${
              user?.role === 'admin' 
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
            }`}>
              {user?.role || 'Member'}
            </span>
          </div>
        </div>
        
        <form onSubmit={handleSaveProfile} className="p-6 md:p-8 space-y-8">
          {/* Avatar & Identity Preview */}
          <div className={`flex flex-col sm:flex-row items-center gap-6 pb-6 border-b ${
            isDark ? 'border-[#262626]' : 'border-slate-200'
          }`}>
            <div className="w-20 h-20 bg-gradient-to-br from-[#0F3D3E] to-[#164e50] border border-[#00E5BF]/30 rounded-[8px] flex items-center justify-center text-white text-2xl font-bold font-space shadow-md shrink-0">
              {initials}
            </div>
            <div className="space-y-1.5 text-center sm:text-left">
              <h4 className="text-base font-bold text-white font-space">{name || 'User Profile'}</h4>
              <p className="text-xs text-[#888888] font-mono">{email || 'user@example.com'}</p>
              <p className="text-[11px] text-[#666666]">
                Role: <span className="text-[#E2DCC8] font-semibold capitalize">{user?.role || 'Standard User'}</span>
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={`text-xs font-semibold ${isDark ? 'text-[#E2DCC8]' : 'text-slate-700'}`}>
                Full Name
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className={`w-full border rounded-[4px] px-3.5 py-2.5 text-sm font-medium outline-none transition-all ${
                  isDark 
                    ? 'bg-[#1c1c1c] border-[#262626] text-white focus:border-[#00E5BF]' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0F3D3E] focus:bg-white'
                }`}
                required
              />
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-semibold ${isDark ? 'text-[#E2DCC8]' : 'text-slate-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#666666]' : 'text-slate-400'}`} size={16} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className={`w-full border rounded-[4px] pl-10 pr-4 py-2.5 text-sm font-medium outline-none transition-all ${
                    isDark 
                      ? 'bg-[#1c1c1c] border-[#262626] text-white focus:border-[#00E5BF]' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0F3D3E] focus:bg-white'
                  }`}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className={`text-xs font-semibold ${isDark ? 'text-[#E2DCC8]' : 'text-slate-700'}`}>
                Company / Organization Name
              </label>
              <div className="relative">
                <Building className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#666666]' : 'text-slate-400'}`} size={16} />
                <input 
                  type="text" 
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your brand or agency name"
                  className={`w-full border rounded-[4px] pl-10 pr-4 py-2.5 text-sm font-medium outline-none transition-all ${
                    isDark 
                      ? 'bg-[#1c1c1c] border-[#262626] text-white focus:border-[#00E5BF]' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0F3D3E] focus:bg-white'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button 
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white text-xs font-bold uppercase tracking-wider rounded-[4px] shadow-lg shadow-[#0F3D3E]/20 transition-all disabled:opacity-50 active:scale-95"
            >
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
            </button>
            
            {saveSuccess && (
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold animate-in fade-in duration-200">
                <CheckCircle2 size={16} />
                <span>Profile updated successfully</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className={`rounded-[8px] border overflow-hidden ${
        isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'bg-[#141414] border-[#262626]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <h3 className={`font-space text-lg font-bold flex items-center gap-2.5 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <KeyRound size={18} className="text-[#00E5BF]" />
              Password & Security
            </h3>
            <p className={`text-xs mt-1 font-medium ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
              Manage your workspace login password and security keys.
            </p>
          </div>
        </div>
        
        <form onSubmit={handleUpdatePassword} className="p-6 md:p-8 space-y-6 max-w-xl">
          {passwordStatus && (
            <div className={`p-3.5 rounded-[4px] border flex items-center gap-2.5 text-xs font-medium animate-in fade-in ${
              passwordStatus.success 
                ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
                : 'bg-red-950/40 border-red-800 text-red-300'
            }`}>
              {passwordStatus.success ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
              <span>{passwordStatus.message}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className={`text-xs font-semibold ${isDark ? 'text-[#E2DCC8]' : 'text-slate-700'}`}>
              Current Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#666666]' : 'text-slate-400'}`} size={16} />
              <input 
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className={`w-full border rounded-[4px] pl-10 pr-10 py-2.5 text-sm font-medium outline-none transition-all ${
                  isDark 
                    ? 'bg-[#1c1c1c] border-[#262626] text-white focus:border-[#00E5BF]' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0F3D3E] focus:bg-white'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                  isDark ? 'text-[#666666] hover:text-white' : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-xs font-semibold ${isDark ? 'text-[#E2DCC8]' : 'text-slate-700'}`}>
              New Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#666666]' : 'text-slate-400'}`} size={16} />
              <input 
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className={`w-full border rounded-[4px] pl-10 pr-10 py-2.5 text-sm font-medium outline-none transition-all ${
                  isDark 
                    ? 'bg-[#1c1c1c] border-[#262626] text-white focus:border-[#00E5BF]' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0F3D3E] focus:bg-white'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                  isDark ? 'text-[#666666] hover:text-white' : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-xs font-semibold ${isDark ? 'text-[#E2DCC8]' : 'text-slate-700'}`}>
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#666666]' : 'text-slate-400'}`} size={16} />
              <input 
                type={showNewPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className={`w-full border rounded-[4px] pl-10 pr-4 py-2.5 text-sm font-medium outline-none transition-all ${
                  isDark 
                    ? 'bg-[#1c1c1c] border-[#262626] text-white focus:border-[#00E5BF]' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0F3D3E] focus:bg-white'
                }`}
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white text-xs font-bold uppercase tracking-wider rounded-[4px] shadow-lg shadow-[#0F3D3E]/20 transition-all disabled:opacity-50 active:scale-95"
            >
              {passwordLoading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className={`rounded-[8px] border overflow-hidden ${
        isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className={`p-6 border-b flex items-center justify-between ${
          isDark ? 'bg-[#141414] border-[#262626]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <h3 className={`font-space text-lg font-bold flex items-center gap-2.5 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              <DollarSign size={18} className="text-[#00E5BF]" />
              Workspace Preferences
            </h3>
            <p className={`text-xs mt-1 font-medium ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
              Customize default currency and regional format for newly created catalogs.
            </p>
          </div>
        </div>
        
        <div className="p-6 md:p-8 space-y-6 max-w-xl">
          <div className="space-y-2">
            <label className={`text-xs font-semibold ${isDark ? 'text-[#E2DCC8]' : 'text-slate-700'}`}>
              Default Pricing Currency
            </label>
            <div className="relative">
              <DollarSign className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`} size={16} />
              <select 
                value={defaultCurrency}
                onChange={(e) => {
                  setDefaultCurrency(e.target.value);
                  if (showToast) showToast(`Default currency set to ${e.target.value}`, 'success');
                }}
                className={`w-full border rounded-[4px] pl-10 pr-10 py-2.5 text-sm font-semibold outline-none appearance-none transition-all ${
                  isDark 
                    ? 'bg-[#1c1c1c] border-[#262626] text-white focus:border-[#00E5BF]' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0F3D3E] focus:bg-white'
                }`}
              >
                {CURRENCIES.map(c => <option key={c.code} value={c.symbol}>{c.name} ({c.symbol})</option>)}
              </select>
              <ChevronDown className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                isDark ? 'text-[#666666]' : 'text-slate-400'
              }`} size={16} />
            </div>
            <p className={`text-[11px] mt-1 font-medium ${isDark ? 'text-[#777777]' : 'text-slate-500'}`}>
              This currency symbol is automatically populated when adding new products and generating catalogs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex-1 overflow-y-auto p-6 lg:p-10 animate-in fade-in duration-300 ${
      isDark ? 'bg-[#100F0F] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="border-b pb-5 border-[#262626]">
          <h1 className="font-space text-2xl font-bold tracking-tight text-white">
            Account & Workspace Settings
          </h1>
          <p className="text-xs text-[#888888] font-medium mt-1">
            Manage your personal profile, credentials, and catalog authoring defaults.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Navigation Tabs */}
          <div className="md:col-span-1 space-y-1.5">
            {[
              { id: 'personal', label: 'Profile Details', icon: User },
              { id: 'security', label: 'Security & Password', icon: ShieldCheck },
              { id: 'preferences', label: 'Preferences', icon: DollarSign }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[4px] text-xs font-semibold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#1c1c1c] text-white border border-[#333333] shadow-sm' 
                    : 'text-[#888888] hover:text-white hover:bg-[#161616] border border-transparent'
                }`}
              >
                <tab.icon size={15} className={activeTab === tab.id ? 'text-[#00E5BF]' : 'text-[#666666]'} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Settings Tab Content */}
          <div className="md:col-span-3">
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
