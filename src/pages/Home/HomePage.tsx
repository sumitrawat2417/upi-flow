import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Settings, Delete, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { MerchantProfile, AppSettings } from '../../types';
import { formatAmount } from '../../core/splitter';

const KEYS = ['1','2','3','4','5','6','7','8','9','.','0','del'];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile] = useLocalStorage<MerchantProfile | null>('merchant_profile', null);
  const [settings] = useLocalStorage<AppSettings>('app_settings', { splitThreshold: 2000 });
  const [raw, setRaw] = useState('');

  const numericValue = parseFloat(raw) || 0;
  const needsSplit   = numericValue > settings.splitThreshold;
  const canProceed   = numericValue > 0;

  const handleKey = (key: string) => {
    if (key === 'del') { setRaw(prev => prev.slice(0, -1)); return; }
    if (key === '.') {
      if (raw.includes('.')) return;
      setRaw(prev => (prev === '' ? '0.' : prev + '.'));
      return;
    }
    if (raw === '0' && key !== '.') { setRaw(key); return; }
    if (raw.replace(/\D/g, '').length >= 8) return;
    setRaw(prev => prev + key);
  };

  const handleProceed = () => {
    if (!canProceed) return;
    navigate('/split', { state: { amount: numericValue } });
  };

  // Format display: split integer from decimal
  const parts = (raw || '').split('.');
  const intPart = parts[0] ? parseInt(parts[0], 10).toLocaleString('en-IN') : '0';
  const decPart = parts.length > 1 ? '.' + parts[1] : '';

  return (
    <div className="app-shell fade-in">
      {/* Header */}
      <header className="flex items-start justify-between px-5 pt-14 pb-2">
        {/* Merchant info */}
        <div className="flex flex-col gap-0.5">
          <span className="label-sm">Merchant</span>
          <span className="text-[15px] font-semibold text-slate-100 tracking-[-0.02em] truncate max-w-[190px]">
            {profile?.businessName ?? 'Setup required'}
          </span>
          <span
            className="text-xs truncate max-w-[190px] font-mono mt-0.5"
            style={{ color: '#64748B', fontSize: '11px' }}
          >
            {profile?.upiId ?? '—'}
          </span>
        </div>

        {/* Icon row */}
        <div className="flex items-center gap-1.5 mt-0.5">
          {[
            { icon: <History size={17} strokeWidth={1.75} />, label: 'History', to: '/history' },
            { icon: <Settings size={17} strokeWidth={1.75} />, label: 'Settings', to: '/settings' },
          ].map(({ icon, label, to }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              aria-label={label}
              className="
                w-9 h-9 rounded-xl flex items-center justify-center
                text-slate-600 hover:text-slate-300
                bg-white/[0.03] border border-white/[0.06]
                hover:bg-white/[0.07] hover:border-white/[0.10]
                transition-all duration-100 active:scale-90
              "
            >
              {icon}
            </button>
          ))}
        </div>
      </header>

      {/* Amount display */}
      <div className="flex flex-col items-center justify-center px-6 flex-1 pb-4">
        <p className="label-sm mb-4">Amount to collect</p>

        {/* The big number */}
        <div className="relative mb-3">
          <span className="amount-display text-slate-100">
            <span className="amount-prefix">₹</span>
            {intPart}
            {decPart && <span className="text-slate-500">{decPart}</span>}
          </span>
          {/* cursor blink */}
          {raw.endsWith('.') && !decPart.slice(1) && (
            <span className="inline-block w-0.5 h-8 bg-amber-400 ml-1 animate-pulse align-middle" />
          )}
        </div>

        {/* Context pill */}
        <div className="h-7 flex items-center">
          {numericValue > 0 && (
            <div
              className="pop-in px-4 py-1 rounded-full text-xs font-mono font-medium"
              style={
                needsSplit
                  ? { background: 'rgba(139,92,246,0.1)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.2)' }
                  : { background: 'rgba(16,185,129,0.08)', color: '#34D399', border: '1px solid rgba(16,185,129,0.18)' }
              }
            >
              {needsSplit
                ? `Split into ${Math.ceil(numericValue / settings.splitThreshold)} payments`
                : 'Single payment'
              }
            </div>
          )}
        </div>
      </div>

      {/* Numpad */}
      <div className="px-5 pb-6">
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          {KEYS.map(key => (
            <button
              key={key}
              onPointerDown={() => handleKey(key)}
              className="key-btn"
              aria-label={key === 'del' ? 'Delete' : key}
            >
              {key === 'del'
                ? <Delete size={20} strokeWidth={1.75} />
                : key
              }
            </button>
          ))}
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canProceed}
          onClick={handleProceed}
          icon={<ArrowRight size={17} />}
          iconPosition="right"
        >
          {needsSplit ? 'Choose Split' : 'Generate QR'}
        </Button>

        <div className="pb-2" />
      </div>
    </div>
  );
};
