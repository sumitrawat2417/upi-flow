import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Settings, Delete, ArrowRight, Sun, Moon } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useTheme } from '../../context/ThemeContext';
import type { MerchantProfile, AppSettings } from '../../types';
import { formatAmount } from '../../core/splitter';

const KEYS = ['1','2','3','4','5','6','7','8','9','.','0','del'];

export const HomePage: React.FC = () => {
  const navigate  = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [profile] = useLocalStorage<MerchantProfile | null>('merchant_profile', null);
  const [settings] = useLocalStorage<AppSettings>('app_settings', { splitThreshold: 2000 });
  const [raw, setRaw] = useState('');

  const numericValue = parseFloat(raw) || 0;
  const needsSplit   = numericValue > 0 && numericValue > settings.splitThreshold;
  const canProceed   = numericValue > 0;

  const handleKey = (key: string) => {
    if (key === 'del') { setRaw(prev => prev.slice(0, -1)); return; }
    if (key === '.') {
      if (raw.includes('.')) return;
      setRaw(prev => (prev === '' ? '0.' : prev + '.'));
      return;
    }
    if (raw === '0' && key !== '.') { setRaw(key); return; }
    if (raw.replace(/\D/g, '').length >= 7) return;
    setRaw(prev => prev + key);
  };

  const handleProceed = () => {
    if (!canProceed) return;
    navigate('/split', { state: { amount: numericValue } });
  };

  // Format display
  const parts  = (raw || '').split('.');
  const intVal = parts[0] ? parseInt(parts[0], 10) : 0;
  const intStr = intVal.toLocaleString('en-IN');
  const decStr = parts.length > 1 ? '.' + parts[1] : '';

  return (
    <div className="app-shell fade-in">
      {/* ── Compact header ── */}
      <div className="hero-header px-6 pt-16 pb-14 relative z-10 flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Merchant info */}
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-0.5">Merchant</p>
            <p className="text-white font-bold text-base leading-tight">{profile?.businessName ?? 'Setup required'}</p>
            <p className="text-white/50 text-xs mt-0.5">{profile?.upiId ?? '—'}</p>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="icon-circle w-9 h-9"
              style={{ background: 'rgba(255,255,255,0.15)' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark'
                ? <Sun size={16} strokeWidth={2} color="white" />
                : <Moon size={16} strokeWidth={2} color="white" />
              }
            </button>
            <button
              onClick={() => navigate('/history')}
              className="icon-circle w-9 h-9"
              style={{ background: 'rgba(255,255,255,0.15)' }}
              aria-label="History"
            >
              <History size={16} strokeWidth={2} color="white" />
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="icon-circle w-9 h-9"
              style={{ background: 'rgba(255,255,255,0.15)' }}
              aria-label="Settings"
            >
              <Settings size={16} strokeWidth={2} color="white" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main content — rounded top card ── */}
      <div
        className="flex-1 flex flex-col"
        style={{
          background: 'var(--color-bg)',
          borderRadius: '24px 24px 0 0',
          marginTop: '-20px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Amount display */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-6 pb-2">
          <p className="section-label mb-4">Amount to collect</p>

          {/* Amount */}
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span
              className="text-2xl font-semibold"
              style={{ color: 'var(--color-text-3)' }}
            >
              ₹
            </span>
            <span
              className="amount-large"
              style={{ color: raw ? 'var(--color-text-1)' : 'var(--color-text-4)' }}
            >
              {raw ? intStr : '0'}
              {decStr && (
                <span style={{ color: 'var(--color-text-3)' }}>{decStr}</span>
              )}
            </span>
          </div>

          {/* Context chip */}
          <div className="h-7 flex items-center">
            {numericValue > 0 && (
              <div
                className="pop-in px-4 py-1 rounded-full text-xs font-semibold"
                style={
                  needsSplit
                    ? { background: 'rgba(232,67,90,0.08)', color: 'var(--color-primary)', border: '1px solid rgba(232,67,90,0.15)' }
                    : { background: 'rgba(34,197,94,0.08)', color: '#16A34A', border: '1px solid rgba(34,197,94,0.15)' }
                }
              >
                {needsSplit
                  ? `Will split into ${Math.ceil(numericValue / settings.splitThreshold)} payments`
                  : 'Single payment'
                }
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="divider mx-5" />

        {/* Numpad */}
        <div className="px-5 pt-2 pb-4">
          <div className="grid grid-cols-3">
            {KEYS.map(key => (
              <button
                key={key}
                onPointerDown={() => handleKey(key)}
                className="key-btn"
                aria-label={key === 'del' ? 'Delete' : key}
              >
                {key === 'del'
                  ? <Delete size={22} strokeWidth={1.75} style={{ color: 'var(--color-text-2)' }} />
                  : <span style={{ color: 'var(--color-text-1)' }}>{key}</span>
                }
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 pb-8">
          <button
            className="btn-primary w-full"
            disabled={!canProceed}
            onClick={handleProceed}
          >
            {needsSplit ? 'Choose Split' : 'Generate QR'}
            <ArrowRight size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};
