import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SplitSquareHorizontal, ArrowRight, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { TopBar } from '../../components/ui/TopBar';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { AppSettings, SplitResult } from '../../types';
import { computeSplits, formatAmount } from '../../core/splitter';

const modeLabels: Record<string, string> = {
  auto:  'Recommended',
  equal: 'Equal Split',
};

export const SplitPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const amount: number = state?.amount ?? 0;
  const [settings] = useLocalStorage<AppSettings>('app_settings', { splitThreshold: 2000 });

  const splits = computeSplits(amount, settings.splitThreshold);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const selected = splits[selectedIdx];

  const handleStartSession = () => {
    navigate('/session/new', { state: { amount, split: selected } });
  };

  if (!amount) {
    navigate('/');
    return null;
  }

  return (
    <div className="app-shell fade-in">
      <TopBar title="Choose Split" subtitle={`Total ₹${formatAmount(amount)}`} backTo="/" />

      <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-4 slide-up">

        {/* Total card */}
        <Card className="text-center py-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
            Total Amount
          </p>
          <p className="text-4xl font-bold tracking-tight text-slate-100">
            <span className="text-xl font-medium text-slate-500 mr-1">₹</span>
            {formatAmount(amount)}
          </p>
        </Card>

        {/* Split options */}
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-1">
          Split Options
        </p>

        {splits.map((split: SplitResult, idx: number) => (
          <button
            key={idx}
            onClick={() => setSelectedIdx(idx)}
            className={`
              w-full text-left rounded-2xl p-5
              border transition-all duration-200 active:scale-[0.98]
              ${selectedIdx === idx
                ? 'bg-indigo-500/10 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                : 'glass glass-hover'
              }
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <SplitSquareHorizontal size={16} strokeWidth={1.75} className="text-slate-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {modeLabels[split.mode] ?? split.mode} · {split.amounts.length} payment{split.amounts.length > 1 ? 's' : ''}
                </span>
              </div>
              {selectedIdx === idx && (
                <span className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Check size={12} strokeWidth={3} className="text-white" />
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {split.amounts.map((a, i) => (
                <span
                  key={i}
                  className={`
                    px-4 py-1.5 rounded-xl text-sm font-semibold
                    ${selectedIdx === idx
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-white/[0.04] text-slate-300 border border-white/[0.08]'
                    }
                  `}
                >
                  ₹{formatAmount(a)}
                </span>
              ))}
            </div>
          </button>
        ))}

        {/* Threshold note */}
        <div className="glass rounded-2xl p-4 flex items-start gap-3">
          <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-slate-500 flex-shrink-0" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Split threshold is set to ₹{formatAmount(settings.splitThreshold)}. You can change this in Settings.
          </p>
        </div>

        {/* CTA */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleStartSession}
          icon={<ArrowRight size={18} />}
          iconPosition="right"
        >
          Start Session
        </Button>

        <div className="pb-2" />
      </div>
    </div>
  );
};
