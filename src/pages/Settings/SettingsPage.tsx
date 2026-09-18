import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, AtSign, Sliders, Trash2, Save } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TopBar } from '../../components/ui/TopBar';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { MerchantProfile, AppSettings } from '../../types';
import { formatAmount } from '../../core/splitter';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useLocalStorage<MerchantProfile | null>('merchant_profile', null);
  const [settings, setSettings] = useLocalStorage<AppSettings>('app_settings', { splitThreshold: 2000 });
  const [, setSessions] = useLocalStorage('payment_sessions', []);

  const [businessName, setBusinessName] = useState(profile?.businessName ?? '');
  const [upiId, setUpiId] = useState(profile?.upiId ?? '');
  const [threshold, setThreshold] = useState(String(settings.splitThreshold));
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (profile) {
      setProfile({ ...profile, businessName, upiId });
    }
    setSettings({ splitThreshold: Number(threshold) || 2000 });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all payment history? This cannot be undone.')) {
      setSessions([]);
    }
  };

  return (
    <div className="app-shell fade-in">
      <TopBar title="Settings" backTo="/" />

      <div className="flex-1 overflow-y-auto px-5 pb-8 flex flex-col gap-4 slide-up">

        {/* Merchant profile */}
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-1 pt-1">
          Merchant Profile
        </p>

        <div className="glass rounded-2xl p-5 flex flex-col gap-4">
          <Input
            label="Business Name"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            icon={<Building2 size={16} />}
            placeholder="e.g. Sharma Store"
          />
          <Input
            label="UPI ID"
            value={upiId}
            onChange={e => setUpiId(e.target.value)}
            icon={<AtSign size={16} />}
            placeholder="e.g. sharmastore@upi"
            autoCapitalize="none"
          />
        </div>

        {/* Split threshold */}
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-1">
          Split Settings
        </p>

        <div className="glass rounded-2xl p-5 flex flex-col gap-4">
          <Input
            label="Split Threshold (₹)"
            value={threshold}
            onChange={e => setThreshold(e.target.value)}
            icon={<Sliders size={16} />}
            inputMode="numeric"
            hint={`Payments above ₹${formatAmount(Number(threshold) || 2000)} will be split automatically.`}
          />
        </div>

        {/* Save button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSave}
          icon={<Save size={18} />}
          iconPosition="left"
        >
          {saved ? 'Saved' : 'Save Changes'}
        </Button>

        {/* Data section */}
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-1 mt-2">
          Data
        </p>

        <div className="glass rounded-2xl overflow-hidden">
          <button
            onClick={handleClearHistory}
            className="w-full flex items-center gap-3 px-5 py-4 text-rose-400 hover:bg-rose-500/5 transition-colors active:scale-[0.98]"
          >
            <Trash2 size={16} strokeWidth={1.75} />
            <span className="text-sm font-medium">Clear All History</span>
          </button>
        </div>

        <p className="text-center text-xs text-slate-600 pb-4 mt-2">
          UPI Flow v1.0 · All data stored locally on this device
        </p>
      </div>
    </div>
  );
};
