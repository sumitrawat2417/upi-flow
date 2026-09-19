import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Settings, Delete, ArrowRight, Sun, Moon, ChevronDown, Check, X } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useTheme } from '../../context/ThemeContext';
import type { MerchantProfile, AppSettings } from '../../types';


const KEYS = ['1','2','3','4','5','6','7','8','9','.','0','del'];

export const HomePage: React.FC = () => {
  const navigate  = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [profile] = useLocalStorage<MerchantProfile | null>('merchant_profile', null);
  const [settings, setSettings] = useLocalStorage<AppSettings>('app_settings', { splitThreshold: 2000 });
  const [raw, setRaw] = useState('');
  const [showModeSelector, setShowModeSelector] = useState(false);

  const numericValue = parseFloat(raw) || 0;
  const needsSplit   = numericValue > 0 && numericValue > settings.splitThreshold;
  const canProceed   = numericValue > 0;

  const activeMode = settings.paymentMode || profile?.upiIds?.[0] || profile?.upiId || '';
  let modeText = '—';
  if (activeMode) {
    modeText = profile?.upiLabels?.[activeMode] || activeMode;
  }

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
          <div 
            className="active:scale-95 transition-transform cursor-pointer"
            onClick={() => { if (profile?.upiIds && profile.upiIds.length > 1) setShowModeSelector(true); }}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Merchant</p>
              {profile?.upiIds && profile.upiIds.length > 1 && (
                <ChevronDown size={12} color="rgba(255,255,255,0.5)" strokeWidth={2.5} />
              )}
            </div>
            <p className="text-white font-bold text-base leading-tight">{profile?.businessName ?? 'Setup required'}</p>
            <p className="text-white/50 text-xs mt-0.5 truncate max-w-[200px]">
              {modeText}
            </p>
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

      {/* Mode Selector Modal */}
      {showModeSelector && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-white dark:bg-[#1A1A2E] w-full rounded-t-3xl p-6 pb-10 slide-up flex flex-col gap-4 max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-1)' }}>Payment Routing</h3>
                <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>Choose how incoming payments are routed</p>
              </div>
              <button 
                onClick={() => setShowModeSelector(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 active:scale-90 transition-transform"
              >
                <X size={16} style={{ color: 'var(--color-text-2)' }} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
              {/* Specific Options */}
              {profile?.upiIds?.map((id, index) => (
                <button
                  key={id}
                  onClick={() => { setSettings(s => ({ ...s, paymentMode: id })); setShowModeSelector(false); }}
                  className="flex items-center justify-between p-4 rounded-2xl border transition-all text-left active:scale-[0.98]"
                  style={{
                    borderColor: activeMode === id ? 'var(--color-primary)' : 'var(--color-border-med)',
                    background: activeMode === id ? 'var(--color-primary-dim)' : 'transparent'
                  }}
                >
                  <div className="min-w-0 pr-4">
                    <p className="font-bold text-sm truncate" style={{ color: activeMode === id ? 'var(--color-primary)' : 'var(--color-text-1)' }}>
                      {profile.upiLabels?.[id] || (index === 0 ? 'Primary Account' : id)}
                    </p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: activeMode === id ? 'var(--color-primary)' : 'var(--color-text-3)', opacity: 0.8 }}>
                      {id}
                    </p>
                  </div>
                  {activeMode === id && <Check size={18} color="var(--color-primary)" strokeWidth={2.5} style={{ flexShrink: 0 }} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
