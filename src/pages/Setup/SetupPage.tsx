import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, AtSign, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { MerchantProfile } from '../../types';
import { generateShortId } from '../../core/splitter';

export const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [, setProfile] = useLocalStorage<MerchantProfile | null>('merchant_profile', null);

  const [businessName, setBusinessName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [errors, setErrors] = useState<{ businessName?: string; upiId?: string }>({});

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!businessName.trim()) next.businessName = 'Business name is required.';
    if (!upiId.trim()) next.upiId = 'UPI ID is required.';
    else if (!upiId.includes('@')) next.upiId = 'Enter a valid UPI ID (e.g. name@bank)';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const profile: MerchantProfile = {
      id: generateShortId(),
      businessName: businessName.trim(),
      upiId: upiId.trim().toLowerCase(),
      createdAt: Date.now(),
    };
    setProfile(profile);
    navigate('/');
  };

  return (
    <div className="app-shell fade-in">
      {/* Hero area */}
      <div className="flex flex-col items-center justify-center px-6 pt-20 pb-10">
        {/* Abstract graphic */}
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-3xl bg-indigo-500/20 blur-xl" />
          <div className="relative w-24 h-24 rounded-3xl glass flex items-center justify-center glow-primary">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="14" height="14" rx="3" fill="#6366f1" fillOpacity="0.9"/>
              <rect x="22" y="4" width="14" height="14" rx="3" fill="#6366f1" fillOpacity="0.5"/>
              <rect x="4" y="22" width="14" height="14" rx="3" fill="#6366f1" fillOpacity="0.5"/>
              <rect x="26" y="26" width="6" height="6" rx="1.5" fill="#6366f1" fillOpacity="0.9"/>
              <rect x="22" y="22" width="6" height="6" rx="1.5" fill="#6366f1" fillOpacity="0.5"/>
              <rect x="30" y="22" width="6" height="6" rx="1.5" fill="#6366f1" fillOpacity="0.3"/>
              <rect x="22" y="30" width="6" height="6" rx="1.5" fill="#6366f1" fillOpacity="0.3"/>
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-slate-100 mb-2 text-center">
          UPI Flow
        </h1>
        <p className="text-sm text-slate-500 text-center leading-relaxed max-w-xs">
          Set up your merchant profile once. Generate split payment QRs instantly.
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col px-5 gap-4 slide-up">
        <div className="glass rounded-3xl p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-base font-semibold text-slate-200 mb-1">Merchant Setup</h2>
            <p className="text-xs text-slate-500">Your information stays on this device only.</p>
          </div>

          <Input
            label="Business Name"
            placeholder="e.g. Sharma Store"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            error={errors.businessName}
            icon={<Building2 size={16} />}
            autoCapitalize="words"
            autoComplete="organization"
          />

          <Input
            label="UPI ID"
            placeholder="e.g. sharmastore@upi"
            value={upiId}
            onChange={e => setUpiId(e.target.value)}
            error={errors.upiId}
            icon={<AtSign size={16} />}
            autoCapitalize="none"
            autoComplete="off"
            inputMode="email"
          />

          <div className="divider" />

          <div className="flex items-start gap-3 py-1">
            <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
            <p className="text-xs text-slate-500 leading-relaxed">
              This app never processes or holds payments. All transactions happen through your normal UPI bank setup.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={<ArrowRight size={18} />}
          iconPosition="right"
          onClick={handleSave}
        >
          Continue
        </Button>

        <div className="pb-10" />
      </div>
    </div>
  );
};
