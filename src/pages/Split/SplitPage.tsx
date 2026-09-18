import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { TopBar } from '../../components/ui/TopBar';
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
      <TopBar title="Split Strategy" subtitle={`₹${formatAmount(amount)} total`} backTo="/" />

      <div className="flex-1 overflow-y-auto px-5 pb-8 flex flex-col gap-3 slide-up">

        {/* Total pill */}
        <div
          className="rounded-2xl px-5 py-4 flex items-center justify-between"
          style={{ background: 'rgba(13,17,32,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <span className="label-sm">Total</span>
          <span className="text-2xl font-bold tracking-[-0.03em] text-slate-100 font-mono">
            ₹{formatAmount(amount)}
          </span>
        </div>

        {/* Options */}
        <p className="label-sm px-1 mt-1">Choose an option</p>

        {splits.map((split: SplitResult, i: number) => {
          const active = i === idx;
          return (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="w-full text-left rounded-2xl p-5 transition-all duration-100 active:scale-[0.99]"
              style={{
                background: active ? 'rgba(245,158,11,0.07)' : 'rgba(13,17,32,0.6)',
                border: active ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.06)',
                boxShadow: active ? '0 0 0 1px rgba(245,158,11,0.08)' : 'none',
              }}
            >
              <div className="flex items-center justify-between mb-3.5">
                <span className="label-sm">
                  {modeLabel[split.mode] ?? split.mode}
                  &nbsp;·&nbsp;
                  {split.amounts.length} payment{split.amounts.length > 1 ? 's' : ''}
                </span>
                {active && (
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: '#F59E0B' }}
                  >
                    <Check size={11} strokeWidth={3} className="text-slate-900" />
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {split.amounts.map((a, j) => (
                  <span
                    key={j}
                    className="px-3.5 py-1.5 rounded-xl text-sm font-semibold font-mono tracking-[-0.01em]"
                    style={
                      active
                        ? { background: 'rgba(245,158,11,0.12)', color: '#FBBF24', border: '1px solid rgba(245,158,11,0.25)' }
                        : { background: 'rgba(255,255,255,0.04)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.07)' }
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
        <p className="label-sm px-1 text-slate-700 mt-1">
          Threshold: ₹{formatAmount(settings.splitThreshold)} &nbsp;·&nbsp; Change in Settings
        </p>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('/session/new', { state: { amount, split: selected } })}
          icon={<ArrowRight size={17} />}
          iconPosition="right"
          className="mt-1"
        >
          Start Session
        </Button>
      </div>
    </div>
  );
};
