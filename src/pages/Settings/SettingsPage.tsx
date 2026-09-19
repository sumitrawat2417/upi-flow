import React, { useState } from 'react';
import { useNavigate }     from 'react-router-dom';
import { ChevronLeft, Sun, Moon, Trash2, CreditCard, LayoutGrid } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useTheme }        from '../../context/ThemeContext';
import type { AppSettings, MerchantProfile } from '../../types';


const THRESHOLDS = [1000, 2000, 5000, 10000];

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [profile] = useLocalStorage<MerchantProfile | null>('merchant_profile', null);
  const [settings, setSettings] = useLocalStorage<AppSettings>('app_settings', { splitThreshold: 2000 });
  useLocalStorage<unknown[]>('payment_sessions', []);
  const [showConfirm, setShowConfirm] = useState(false);

  const reset = () => {
    localStorage.clear();
    navigate('/setup');
  };

  return (
    <div className="app-shell fade-in">
      <div className="hero-header px-5 pt-12 pb-8 relative z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="icon-circle w-9 h-9 active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <ChevronLeft size={18} strokeWidth={2.5} color="white" />
          </button>
          <h1 className="text-white font-bold text-xl tracking-tight">Settings</h1>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 pb-10 flex flex-col gap-4"
        style={{
          background: 'var(--color-bg)',
          borderRadius: '24px 24px 0 0',
          marginTop: '-20px',
          zIndex: 10,
          position: 'relative',
          paddingTop: '24px',
        }}
      >
        {/* Profile section */}
        <p className="section-label px-1">Merchant Profile</p>
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="icon-circle w-10 h-10" style={{ background: 'var(--color-primary-dim)' }}>
              <CreditCard size={18} strokeWidth={1.75} color="var(--color-primary)" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: 'var(--color-text-1)' }}>
                {profile?.businessName}
              </p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-3)' }}>
                {profile?.upiId}
              </p>
            </div>
          </div>
        </div>

        {/* Split threshold */}
        <p className="section-label px-1 mt-1">Split Threshold</p>
        <div className="card px-5 py-4 flex flex-col gap-3">
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-2)' }}>
            Amounts above this limit will be suggested for splitting.
          </p>
          <div className="grid grid-cols-4 gap-2">
            {THRESHOLDS.map(t => {
              const active = settings.splitThreshold === t;
              return (
                <button
                  key={t}
                  onClick={() => setSettings(s => ({ ...s, splitThreshold: t }))}
                  className="py-2 rounded-2xl text-sm font-bold transition-all"
                  style={
                    active
                      ? { background: 'var(--color-primary)', color: '#fff' }
                      : { background: 'var(--color-surface-2)', color: 'var(--color-text-2)', border: '1px solid var(--color-border)' }
                  }
                >
                  ₹{t >= 1000 ? `${t / 1000}K` : t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Appearance */}
        <p className="section-label px-1 mt-1">Appearance</p>
        <div className="card overflow-hidden">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-5 py-4"
          >
            <div className="flex items-center gap-3">
              <div className="icon-circle w-9 h-9" style={{ background: 'var(--color-surface-2)' }}>
                {theme === 'dark'
                  ? <Moon size={16} strokeWidth={1.75} color="var(--color-primary)" />
                  : <Sun size={16} strokeWidth={1.75} color="var(--color-primary)" />
                }
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-1)' }}>
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>
                  Tap to switch
                </p>
              </div>
            </div>

            {/* Toggle pill */}
            <div
              className="w-12 h-6 rounded-full relative transition-all"
              style={{
                background: theme === 'dark' ? 'var(--color-primary)' : 'var(--color-border-med)',
              }}
            >
              <span
                className="absolute top-1 w-4 h-4 rounded-full transition-all"
                style={{
                  background: 'white',
                  left: theme === 'dark' ? '26px' : '4px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }}
              />
            </div>
          </button>
        </div>

        {/* About */}
        <p className="section-label px-1 mt-1">About</p>
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="icon-circle w-9 h-9" style={{ background: 'var(--color-primary-dim)' }}>
              <LayoutGrid size={16} strokeWidth={1.75} color="var(--color-primary)" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text-1)' }}>UPI Flow</p>
              <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>v1.0.0 · Offline-first</p>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <p className="section-label px-1 mt-1" style={{ color: 'var(--color-danger)' }}>Danger Zone</p>
        {!showConfirm ? (
          <button
            className="card px-5 py-4 w-full flex items-center gap-3 active:scale-[0.99] transition-transform"
            onClick={() => setShowConfirm(true)}
          >
            <div className="icon-circle w-9 h-9" style={{ background: 'rgba(239,68,68,0.08)' }}>
              <Trash2 size={16} strokeWidth={1.75} color="#EF4444" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold" style={{ color: '#EF4444' }}>Reset All Data</p>
              <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>Clears profile, history and settings</p>
            </div>
          </button>
        ) : (
          <div className="card px-5 py-5 flex flex-col gap-4">
            <p className="text-sm font-medium text-center" style={{ color: 'var(--color-text-1)' }}>
              This will erase everything. Are you sure?
            </p>
            <div className="flex gap-3">
              <button
                className="btn-secondary flex-1"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 h-12 rounded-full text-sm font-bold text-white transition-all active:scale-95"
                style={{ background: '#EF4444' }}
                onClick={reset}
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
