import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, ArrowRight, ChevronLeft } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { AppSettings, SplitResult } from '../../types';
import { computeSplits, formatAmount } from '../../core/splitter';

const modeLabel: Record<string, string> = {
  auto:  'Recommended',
  equal: 'Equal Split',
};

export const SplitPage: React.FC = () => {
  const navigate    = useNavigate();
  const { state }   = useLocation();
  const amount: number = state?.amount ?? 0;
  const [settings]  = useLocalStorage<AppSettings>('app_settings', { splitThreshold: 2000 });
  const splits      = computeSplits(amount, settings.splitThreshold);
  const [idx, setIdx] = useState(0);

  if (!amount) { navigate('/'); return null; }

  const selected = splits[idx];

  return (
    <div className="app-shell fade-in">
      {/* Header */}
      <div className="hero-header px-5 pt-12 pb-8 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/')}
            className="icon-circle w-9 h-9 active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.2)' }}
            aria-label="Back"
          >
            <ChevronLeft size={18} strokeWidth={2.5} color="white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">Split Strategy</h1>
            <p className="text-white/55 text-xs mt-0.5">₹{formatAmount(amount)} total</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 flex flex-col px-4 pb-8 gap-3 overflow-y-auto"
        style={{
          background: 'var(--color-bg)',
          borderRadius: '24px 24px 0 0',
          marginTop: '-20px',
          zIndex: 10,
          position: 'relative',
          paddingTop: '24px',
        }}
      >
        {/* Total display */}
        <div
          className="card flex items-center justify-between px-5 py-4 mb-1"
        >
          <p className="section-label">Total Amount</p>
          <p
            className="text-2xl font-bold tracking-tight"
            style={{ color: 'var(--color-primary)' }}
          >
            ₹{formatAmount(amount)}
          </p>
        </div>

        {/* Section heading */}
        <p className="section-label px-1">Choose a split option</p>

        {/* Split options */}
        {splits.map((split: SplitResult, i: number) => {
          const active = i === idx;
          return (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="card w-full text-left p-5 transition-all duration-100 active:scale-[0.99]"
              style={
                active
                  ? {
                      border: '2px solid var(--color-primary)',
                      boxShadow: '0 4px 24px rgba(232,67,90,0.12)',
                    }
                  : {}
              }
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span
                    className="text-sm font-bold tracking-tight"
                    style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-1)' }}
                  >
                    {modeLabel[split.mode] ?? split.mode}
                  </span>
                  <span
                    className="text-xs ml-2 font-medium"
                    style={{ color: 'var(--color-text-3)' }}
                  >
                    {split.amounts.length} payment{split.amounts.length > 1 ? 's' : ''}
                  </span>
                </div>

                {active && (
                  <div
                    className="icon-circle w-6 h-6 pop-in"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    <Check size={13} strokeWidth={2.5} color="white" />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {split.amounts.map((a, j) => (
                  <span
                    key={j}
                    className="px-3 py-1.5 rounded-full text-sm font-bold"
                    style={
                      active
                        ? { background: 'rgba(232,67,90,0.08)', color: 'var(--color-primary)' }
                        : { background: 'var(--color-surface-2)', color: 'var(--color-text-2)' }
                    }
                  >
                    ₹{formatAmount(a)}
                  </span>
                ))}
              </div>
            </button>
          );
        })}

        {/* Note */}
        <p className="section-label px-1 text-center">
          Threshold ₹{formatAmount(settings.splitThreshold)} · Change in Settings
        </p>

        <button
          className="btn-primary w-full mt-1"
          onClick={() => navigate('/session/new', { state: { amount, split: selected } })}
        >
          Start Session
          <ArrowRight size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};
