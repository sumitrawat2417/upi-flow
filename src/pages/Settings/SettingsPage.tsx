import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, AtSign, Sliders, Trash2, Check } from 'lucide-react';
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

  const [name,      setName]      = useState(profile?.businessName ?? '');
  const [upiId,     setUpiId]     = useState(profile?.upiId ?? '');
  const [threshold, setThreshold] = useState(String(settings.splitThreshold));
  const [saved,     setSaved]     = useState(false);

  const handleSave = () => {
    if (profile) setProfile({ ...profile, businessName: name, upiId });
    setSettings({ splitThreshold: Number(threshold) || 2000 });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = () => {
    if (window.confirm('Clear all payment history? This cannot be undone.')) {
      setSessions([]);
    }
  };

  return (
    <div className="app-shell fade-in">
      <TopBar title="Settings" backTo="/" />

      <div className="flex-1 overflow-y-auto px-5 pb-10 flex flex-col gap-3 slide-up">

        {/* Profile */}
        <p className="label-sm px-1 pt-1">Merchant Profile</p>
        <div
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: 'rgba(13,17,32,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Input label="Business Name" value={name} onChange={e => setName(e.target.value)} icon={<Building2 size={15} />} placeholder="Your business name" />
          <Input label="UPI ID"         value={upiId} onChange={e => setUpiId(e.target.value)} icon={<AtSign size={15} />} placeholder="name@bank" autoCapitalize="none" />
        </div>

        {/* Split */}
        <p className="label-sm px-1">Split Settings</p>
        <div
          className="rounded-2xl p-5"
          style={{ background: 'rgba(13,17,32,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Input
            label="Split Threshold (₹)"
            value={threshold}
            onChange={e => setThreshold(e.target.value)}
            icon={<Sliders size={15} />}
            inputMode="numeric"
            hint={`Payments above ₹${formatAmount(Number(threshold) || 2000)} are split.`}
          />
        </div>

        {/* Save */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSave}
          icon={saved ? <Check size={16} /> : undefined}
          className="mt-1"
        >
          {saved ? 'Saved' : 'Save Changes'}
        </Button>

        {/* Data */}
        <p className="label-sm px-1 mt-2">Data Management</p>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(13,17,32,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={handleClear}
            className="w-full flex items-center gap-3 px-5 py-4 text-red-400 hover:bg-red-500/5 transition-colors active:scale-[0.98] text-sm font-medium"
          >
            <Trash2 size={15} strokeWidth={1.75} />
            Clear All History
          </button>
        </div>

        <p className="text-center label-sm text-slate-700 pt-2 pb-4">
          UPI Flow v1.0 &nbsp;·&nbsp; All data is local
        </p>
      </div>
    </div>
  );
};
