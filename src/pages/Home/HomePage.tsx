import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Settings, Delete, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { MerchantProfile, AppSettings } from '../../types';
import { formatAmount } from '../../core/splitter';

const KEYS = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile] = useLocalStorage<MerchantProfile | null>('merchant_profile', null);
  const [settings] = useLocalStorage<AppSettings>('app_settings', { splitThreshold: 2000 });
  const [raw, setRaw] = useState('');

  // Derived display amount
  const numericValue = parseFloat(raw) || 0;
  const displayStr = raw || '0';

  const handleKey = (key: string) => {
    if (key === '⌫') {
      setRaw(prev => prev.slice(0, -1));
      return;
    }
    if (key === '.') {
      if (raw.includes('.')) return;
      setRaw(prev => (prev === '' ? '0.' : prev + '.'));
      return;
    }
    // prevent leading zero duplicates
    if (raw === '0' && key !== '.') { setRaw(key); return; }
    // max 8 digits
    if (raw.replace('.', '').replace('-', '').length >= 8) return;
    setRaw(prev => prev + key);
  };

  const canProceed = numericValue > 0;
  const needsSplit = numericValue > settings.splitThreshold;

  const handleProceed = () => {
    if (!canProceed) return;
    navigate('/split', { state: { amount: numericValue } });
  };

  return (
    <div className="app-shell fade-in">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 pt-14 pb-2">
        {/* Merchant badge */}
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Merchant
          </span>
          <span className="text-sm font-semibold text-slate-200 truncate max-w-[180px]">
            {profile?.businessName ?? 'Your Business'}
          </span>
          <span className="text-xs text-slate-500 truncate max-w-[180px]">
            {profile?.upiId ?? 'Setup required'}
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/history')}
            aria-label="History"
            className="w-10 h-10 rounded-xl glass glass-hover flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all active:scale-90"
          >
            <History size={18} strokeWidth={1.75} />
          </button>
          <button
            onClick={() => navigate('/settings')}
            aria-label="Settings"
            className="w-10 h-10 rounded-xl glass glass-hover flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all active:scale-90"
          >
            <Settings size={18} strokeWidth={1.75} />
          </button>
        </div>
      </header>

      {/* Amount display */}
      <div className="flex flex-col items-center justify-center px-6 py-10 flex-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">
          Amount to collect
        </p>

        <div className="relative text-center mb-2">
          <span className="amount-display">
            <span className="amount-prefix">₹</span>
            {formatAmount(numericValue || 0)}
            {raw.endsWith('.') && <span className="text-slate-500">.</span>}
          </span>
        </div>

        {/* Split hint */}
        {needsSplit && (
          <div className="mt-3 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 slide-up">
            <span className="text-xs text-indigo-400 font-medium">
              Will split into {Math.ceil(numericValue / settings.splitThreshold)} payments
            </span>
          </div>
        )}
        {numericValue > 0 && !needsSplit && (
          <div className="mt-3 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 slide-up">
            <span className="text-xs text-emerald-400 font-medium">
              Single payment — no split needed
            </span>
          </div>
        )}
      </div>

      {/* Keypad */}
      <div className="px-5 pb-6">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {KEYS.map((key) => (
            <button
              key={key}
              onClick={() => handleKey(key)}
              className="key-btn"
              aria-label={key === '⌫' ? 'Delete' : key}
            >
              {key === '⌫' ? <Delete size={22} strokeWidth={1.75} /> : key}
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canProceed}
          onClick={handleProceed}
          icon={<ArrowRight size={18} />}
          iconPosition="right"
        >
          {needsSplit ? 'Choose Split' : 'Generate QR'}
        </Button>

        <div className="pb-4" />
      </div>
    </div>
  );
};
