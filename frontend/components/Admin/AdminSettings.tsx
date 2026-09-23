import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  Lock, 
  Save, 
  Globe, 
  Mail, 
  Layers, 
  KeyRound, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { SystemSetting } from '../../types';

export const AdminSettings: React.FC = () => {
  const { systemSettings, fetchSystemSettings, updateSystemSettings, changeAdminPassword, isLoading } = useStore();

  const [formData, setFormData] = useState<Partial<SystemSetting>>({
    platform_name: 'catalogmakerr.',
    support_email: 'support@catalogstudio.com',
    allow_public_signup: true,
    maintenance_mode: false,
    maintenance_message: 'System is currently under maintenance. We will be back shortly.',
    enable_free_watermark: true,
    watermark_text: 'Made with catalogmakerr.',
    default_currency: 'INR',
  });

  const [isSaving, setIsSaving] = useState(false);

  // Security / Password Rotation State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemSettings();
  }, [fetchSystemSettings]);

  useEffect(() => {
    if (systemSettings) {
      setFormData({
        platform_name: systemSettings.platform_name || 'catalogmakerr.',
        support_email: systemSettings.support_email || 'support@catalogstudio.com',
        allow_public_signup: systemSettings.allow_public_signup !== undefined ? systemSettings.allow_public_signup : true,
        maintenance_mode: !!systemSettings.maintenance_mode,
        maintenance_message: systemSettings.maintenance_message || 'System is currently under maintenance. We will be back shortly.',
        enable_free_watermark: systemSettings.enable_free_watermark !== undefined ? systemSettings.enable_free_watermark : true,
        watermark_text: systemSettings.watermark_text || 'Made with catalogmakerr.',
        default_currency: systemSettings.default_currency || 'INR',
      });
    }
  }, [systemSettings]);

  const handleToggle = (key: keyof SystemSetting) => {
    setFormData(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleInputChange = (key: keyof SystemSetting, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSystemSettings(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await changeAdminPassword({
        current_password: currentPassword || undefined,
        new_password: newPassword,
      });

      if (res.success) {
        setPasswordSuccess('Super admin credentials rotated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(res.message);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161616] p-6 rounded-[8px] border border-[#262626]">
        <div>
          <h2 className="font-space text-xl font-bold text-white flex items-center gap-2.5">
            <Sliders className="text-[#E2DCC8]" size={20} />
            System & Security Settings
          </h2>
          <p className="text-xs text-[#888888] mt-1 font-medium">
            Configure global SaaS policies, user registration access, maintenance status, and master credentials.
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="akio-btn-primary py-2.5 px-6 shrink-0 shadow-lg"
        >
          {isSaving ? (
            <RefreshCw size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          <span>{isSaving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Main Settings Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: General Platform Branding */}
          <div className="bg-[#161616] rounded-[8px] border border-[#262626] p-7 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-[#262626] pb-4">
              <div className="w-9 h-9 rounded-[4px] bg-[#0F3D3E]/30 border border-[#0F3D3E] text-[#E2DCC8] flex items-center justify-center">
                <Globe size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold font-space text-white uppercase tracking-wider">General Platform Configuration</h3>
                <p className="text-[11px] text-[#888888]">Branding, default currency and contact channels</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#999999] uppercase tracking-widest font-heading">
                  Platform Name
                </label>
                <input
                  type="text"
                  value={formData.platform_name || ''}
                  onChange={(e) => handleInputChange('platform_name', e.target.value)}
                  placeholder="catalogmakerr."
                  className="w-full bg-[#111111] border border-[#262626] rounded-[4px] px-4 py-3 text-xs text-white outline-none focus:border-[#0F3D3E] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#999999] uppercase tracking-widest font-heading">
                  Support Email
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666666]" />
                  <input
                    type="email"
                    value={formData.support_email || ''}
                    onChange={(e) => handleInputChange('support_email', e.target.value)}
                    placeholder="support@catalogstudio.com"
                    className="w-full bg-[#111111] border border-[#262626] rounded-[4px] pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-[#0F3D3E] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-[10px] font-bold text-[#999999] uppercase tracking-widest font-heading">
                  Default Currency
                </label>
                <select
                  value={formData.default_currency || 'INR'}
                  onChange={(e) => handleInputChange('default_currency', e.target.value)}
                  className="w-full bg-[#111111] border border-[#262626] rounded-[4px] px-4 py-3 text-xs text-white outline-none focus:border-[#0F3D3E] transition-all"
                >
                  <option value="INR">₹ INR - Indian Rupee</option>
                  <option value="USD">$ USD - US Dollar</option>
                  <option value="EUR">€ EUR - Euro</option>
                  <option value="GBP">£ GBP - British Pound</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Registration & Maintenance Status */}
          <div className="bg-[#161616] rounded-[8px] border border-[#262626] p-7 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-[#262626] pb-4">
              <div className="w-9 h-9 rounded-[4px] bg-[#0F3D3E]/30 border border-[#0F3D3E] text-[#E2DCC8] flex items-center justify-center">
                <Users size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold font-space text-white uppercase tracking-wider">Access & Maintenance Control</h3>
                <p className="text-[11px] text-[#888888]">Control public account registrations and system maintenance state</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Public Signups Toggle */}
              <div className="flex items-center justify-between p-4 rounded-[6px] bg-[#111111] border border-[#262626] transition-all">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Public User Registration</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-[2px] uppercase tracking-wider ${
                      formData.allow_public_signup 
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' 
                        : 'bg-red-950/60 text-red-400 border border-red-800/40'
                    }`}>
                      {formData.allow_public_signup ? 'Enabled (Open)' : 'Disabled (Paused)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#888888]">
                    When enabled, anyone can register a new account on the login screen. When disabled, only admins can provision accounts.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle('allow_public_signup')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formData.allow_public_signup ? 'bg-[#0F3D3E]' : 'bg-[#2b2b2b]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      formData.allow_public_signup ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Maintenance Mode Toggle */}
              <div className={`p-4 rounded-[6px] border transition-all ${
                formData.maintenance_mode 
                  ? 'bg-amber-950/20 border-amber-800/40' 
                  : 'bg-[#111111] border-[#262626]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">Platform Maintenance Mode</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-[2px] uppercase tracking-wider ${
                        formData.maintenance_mode 
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-700/50' 
                          : 'bg-[#262626] text-[#888888]'
                      }`}>
                        {formData.maintenance_mode ? 'Active (Admin Only)' : 'Inactive (Live)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#888888]">
                      Temporarily disable regular user logins during upgrades. Super Admins will continue to have full access.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggle('maintenance_mode')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData.maintenance_mode ? 'bg-amber-600' : 'bg-[#2b2b2b]'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        formData.maintenance_mode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {formData.maintenance_mode && (
                  <div className="mt-4 pt-3 border-t border-amber-900/30 space-y-1.5 animate-in fade-in duration-200">
                    <label className="text-[10px] font-bold text-amber-300 uppercase tracking-widest font-heading">
                      User Maintenance Banner Message
                    </label>
                    <textarea
                      rows={2}
                      value={formData.maintenance_message || ''}
                      onChange={(e) => handleInputChange('maintenance_message', e.target.value)}
                      placeholder="System is currently under maintenance. We will be back shortly."
                      className="w-full bg-[#161616] border border-amber-800/40 rounded-[4px] px-3 py-2 text-xs text-amber-100 outline-none focus:border-amber-600"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Watermark Control */}
          <div className="bg-[#161616] rounded-[8px] border border-[#262626] p-7 space-y-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-[#262626] pb-4">
              <div className="w-9 h-9 rounded-[4px] bg-[#0F3D3E]/30 border border-[#0F3D3E] text-[#E2DCC8] flex items-center justify-center">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold font-space text-white uppercase tracking-wider">Free Plan Watermark Policy</h3>
                <p className="text-[11px] text-[#888888]">Brand watermark footer attached to Free / Starter exported PDF catalogs</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-[6px] bg-[#111111] border border-[#262626]">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Enforce Watermark on Free Tier Exports</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-[2px] uppercase tracking-wider ${
                      formData.enable_free_watermark ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/40' : 'bg-[#262626] text-[#888888]'
                    }`}>
                      {formData.enable_free_watermark ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#888888]">
                    When active, catalogs exported by free starter accounts include the platform watermark banner.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle('enable_free_watermark')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formData.enable_free_watermark ? 'bg-[#0F3D3E]' : 'bg-[#2b2b2b]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      formData.enable_free_watermark ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#999999] uppercase tracking-widest font-heading">
                  Custom Watermark Branding Text
                </label>
                <input
                  type="text"
                  value={formData.watermark_text || ''}
                  onChange={(e) => handleInputChange('watermark_text', e.target.value)}
                  placeholder="Made with catalogmakerr."
                  className="w-full bg-[#111111] border border-[#262626] rounded-[4px] px-4 py-3 text-xs text-white outline-none focus:border-[#0F3D3E] transition-all"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right 1 Column: Security & Master Password Rotation */}
        <div className="space-y-8">
          
          <div className="bg-[#161616] rounded-[8px] border border-[#262626] p-7 space-y-6 shadow-xl sticky top-8">
            <div className="flex items-center gap-3 border-b border-[#262626] pb-4">
              <div className="w-9 h-9 rounded-[4px] bg-red-950/40 border border-red-800/40 text-red-400 flex items-center justify-center">
                <KeyRound size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold font-space text-white uppercase tracking-wider">Super Admin Security</h3>
                <p className="text-[11px] text-[#888888]">Rotate master credentials & security token</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-[4px] flex items-center gap-2 text-xs text-red-400 animate-in fade-in">
                  <XCircle size={15} className="shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-[4px] flex items-center gap-2 text-xs text-emerald-400 animate-in fade-in">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#999999] uppercase tracking-widest font-heading">
                  Current Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-[#111111] border border-[#262626] rounded-[4px] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#0F3D3E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#999999] uppercase tracking-widest font-heading">
                  New Admin Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-[#111111] border border-[#262626] rounded-[4px] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#0F3D3E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#999999] uppercase tracking-widest font-heading">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-[#111111] border border-[#262626] rounded-[4px] px-3.5 py-2.5 text-xs text-white outline-none focus:border-[#0F3D3E]"
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading || !newPassword}
                className="w-full py-3 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-heading font-bold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {passwordLoading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Lock size={14} />
                )}
                <span>Update Admin Password</span>
              </button>
            </form>

            <div className="p-4 bg-[#111111] rounded-[6px] border border-[#262626] space-y-2 text-[11px] text-[#888888]">
              <div className="flex items-center gap-1.5 text-white font-bold">
                <ShieldCheck size={14} className="text-[#E2DCC8]" />
                <span>Security Guidelines</span>
              </div>
              <p>Updating master password immediately secures all administrative endpoints and active management sessions.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminSettings;
