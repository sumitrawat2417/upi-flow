import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, AtSign, ArrowRight } from 'lucide-react';
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
    if (!businessName.trim()) next.businessName = 'Business name is required';
    if (!upiId.trim())        next.upiId = 'UPI ID is required';
    else if (!upiId.includes('@')) next.upiId = 'Enter a valid UPI ID  (e.g. name@bank)';
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
    <div className="app-shell fade-in">
      {/* Hero gradient top */}
      <div className="hero-header px-6 pt-16 pb-10 relative z-10">
        {/* Logo mark */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="1.5" fill="white" />
              <rect x="11" y="2" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.6" />
              <rect x="2" y="11" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.6" />
              <rect x="13" y="13" width="3" height="3" rx="0.75" fill="white" />
              <rect x="11" y="11" width="3" height="3" rx="0.75" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">UPI Flow</span>
        </div>

        <h1 className="text-white font-extrabold text-[2rem] leading-tight tracking-tight mb-2">
          Set up your<br />merchant profile.
        </h1>
        <p className="text-white/60 text-sm leading-relaxed">
          All data stays on this device. No accounts, no cloud.
        </p>
      </div>

      {/* White card form below hero */}
      <div className="flex-1 flex flex-col" style={{ marginTop: '-20px' }}>
        <div
          className="flex-1 flex flex-col px-5 pt-7 pb-10 gap-5"
          style={{ background: 'var(--color-bg)', borderRadius: '24px 24px 0 0' }}
        >
          {/* Business Name */}
          <div className="flex flex-col gap-1.5">
            <label className="section-label px-1">Business Name</label>
            <div className="relative">
              <span
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--color-text-3)' }}
              >
                <Building2 size={16} strokeWidth={1.75} />
              </span>
              <input
                className="input-field"
                placeholder="e.g. Sharma Enterprises"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                autoCapitalize="words"
                autoComplete="organization"
              />
            </div>
            {errors.businessName && (
              <p className="text-xs font-medium ml-1" style={{ color: 'var(--color-danger)' }}>
                {errors.businessName}
              </p>
            )}
          </div>

          {/* UPI ID */}
          <div className="flex flex-col gap-1.5">
            <label className="section-label px-1">UPI ID</label>
            <div className="relative">
              <span
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--color-text-3)' }}
              >
                <AtSign size={16} strokeWidth={1.75} />
              </span>
              <input
                className="input-field"
                placeholder="yourname@bank"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                autoCapitalize="none"
                autoComplete="off"
                inputMode="email"
              />
            </div>
            {errors.upiId && (
              <p className="text-xs font-medium ml-1" style={{ color: 'var(--color-danger)' }}>
                {errors.upiId}
              </p>
            )}
          </div>

          {/* Disclaimer */}
          <div
            className="rounded-2xl p-4 flex gap-3"
            style={{ background: 'rgba(232,67,90,0.05)', border: '1px solid rgba(232,67,90,0.10)' }}
          >
            <div
              className="icon-circle w-7 h-7 flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(232,67,90,0.10)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke="#E8435A" strokeWidth="1.5"/>
                <path d="M7 4.5V7.5" stroke="#E8435A" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="7" cy="9.5" r="0.75" fill="#E8435A"/>
              </svg>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-2)' }}>
              This app only generates QR codes. All payments flow through your bank's UPI infrastructure. No money is held or processed here.
            </p>
          </div>

          <div className="flex-1" />

          <button
            className="btn-primary w-full"
            onClick={handleSave}
          >
            Continue
            <ArrowRight size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};
