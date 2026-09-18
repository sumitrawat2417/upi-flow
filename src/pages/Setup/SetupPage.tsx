import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, AtSign, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { MerchantProfile } from '../../types';
import { generateShortId } from '../../core/splitter';

export const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [, setProfile] = useLocalStorage<MerchantProfile | null>('merchant_profile', null);
  const [businessName, setBusinessName] = useState('');
  const [upiId, setUpiId]               = useState('');
  const [errors, setErrors]             = useState<{ businessName?: string; upiId?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!businessName.trim()) next.businessName = 'Business name is required.';
    if (!upiId.trim())        next.upiId = 'UPI ID is required.';
    else if (!upiId.includes('@')) next.upiId = 'Enter a valid UPI ID (e.g. name@bank)';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setProfile({
      id: generateShortId(),
      businessName: businessName.trim(),
      upiId: upiId.trim().toLowerCase(),
      createdAt: Date.now(),
    });
    navigate('/');
  };

  return (
    <div className="app-shell fade-in" style={{ background: 'none' }}>
      {/* Top noise / brand area */}
      <div className="relative px-6 pt-16 pb-8 flex flex-col items-start">
        {/* Accent glow blob */}
        <div
          className="absolute top-0 right-0 w-56 h-56 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
            filter: 'blur(24px)',
          }}
        />

        {/* Wordmark + icon */}
        <div className="flex items-center gap-3 mb-8 relative z-10">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              boxShadow: '0 4px 16px rgba(245,158,11,0.35)',
            }}
          >
            {/* QR Mark SVG */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="2" width="8" height="8" rx="1.5" fill="#0F172A" fillOpacity="0.9"/>
              <rect x="12" y="2" width="8" height="8" rx="1.5" fill="#0F172A" fillOpacity="0.5"/>
              <rect x="2" y="12" width="8" height="8" rx="1.5" fill="#0F172A" fillOpacity="0.5"/>
              <rect x="14" y="14" width="3.5" height="3.5" rx="0.75" fill="#0F172A"/>
              <rect x="12" y="12" width="3.5" height="3.5" rx="0.75" fill="#0F172A" fillOpacity="0.5"/>
              <rect x="16.5" y="12" width="3.5" height="3.5" rx="0.75" fill="#0F172A" fillOpacity="0.3"/>
              <rect x="12" y="16.5" width="3.5" height="3.5" rx="0.75" fill="#0F172A" fillOpacity="0.3"/>
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-[-0.03em] text-slate-100">UPI Flow</h1>
            <p className="text-xs font-mono text-slate-500 mt-0.5">v1.0 · Merchant Edition</p>
          </div>
        </div>

        <h2 className="text-3xl font-bold tracking-[-0.035em] text-slate-100 leading-snug relative z-10">
          Set up your<br />
          <span className="text-amber-400">merchant profile.</span>
        </h2>
        <p className="text-sm text-slate-500 mt-3 leading-relaxed relative z-10 max-w-xs">
          Everything stays on this device. No accounts, no servers, no cloud.
        </p>
      </div>

      {/* Form area */}
      <div className="flex-1 flex flex-col px-5 gap-4 slide-up">
        <div
          className="rounded-2xl p-5 flex flex-col gap-5"
          style={{
            background: 'rgba(13,17,32,0.8)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <Input
            label="Business Name"
            placeholder="e.g. Sharma Enterprises"
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            error={errors.businessName}
            icon={<Building2 size={15} />}
            autoCapitalize="words"
            autoComplete="organization"
          />

          <Input
            label="UPI ID"
            placeholder="yourname@bank"
            value={upiId}
            onChange={e => setUpiId(e.target.value)}
            error={errors.upiId}
            icon={<AtSign size={15} />}
            autoCapitalize="none"
            autoComplete="off"
            inputMode="email"
          />
        </div>

        {/* Disclaimer */}
        <div className="flex gap-2.5 px-1">
          <div className="mt-1 w-1 h-1 rounded-full bg-slate-600 flex-shrink-0" />
          <p className="text-xs text-slate-600 leading-relaxed">
            This app generates QR codes only. It never processes, intercepts, or holds payments. All money moves through your bank's UPI infrastructure.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={<ArrowRight size={17} />}
          iconPosition="right"
          onClick={handleSave}
          className="mt-1"
        >
          Continue
        </Button>

        <div className="pb-8" />
      </div>
    </div>
  );
};
