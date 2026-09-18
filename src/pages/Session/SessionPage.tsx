import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Lock, ChevronRight, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { TopBar } from '../../components/ui/TopBar';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { PaymentSession, Payment, SplitResult, MerchantProfile } from '../../types';
import { generateQRId, generateSessionId, generateShortId, formatAmount } from '../../core/splitter';

/* ─── Placeholder QR ─────────────────────────────────────────────── */
const QRPlaceholder: React.FC<{ size?: number; id: string }> = ({ size = 200, id }) => {
  // Deterministic cell pattern from ID
  const cells = Array.from({ length: 49 }, (_, i) => {
    const row = Math.floor(i / 7), col = i % 7;
    // Finder patterns (top-left, top-right, bottom-left)
    const tlFinder = row < 3 && col < 3;
    const trFinder = row < 3 && col >= 4;
    const blFinder = row >= 4 && col < 3;
    if (tlFinder || trFinder || blFinder) return true;
    // Random data cells from ID seed
    const seed = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return ((seed * (i + 7) * 31) % 17) < 9;
  });

  return (
    <div
      className="rounded-2xl p-4 flex items-center justify-center"
      style={{
        width: size, height: size,
        background: '#F8FAFC',
        boxShadow: '0 0 0 1px rgba(139,92,246,0.2), 0 8px 32px rgba(139,92,246,0.15)',
      }}
    >
      <div
        className="grid"
        style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, width: size - 40, height: size - 40 }}
      >
        {cells.map((filled, i) => (
          <div
            key={i}
            className="rounded-sm"
            style={{ background: filled ? '#1E293B' : 'transparent', aspectRatio: '1' }}
          />
        ))}
      </div>
    </div>
  );
};

/* ─── Build session ──────────────────────────────────────────────── */
function buildSession(amount: number, split: SplitResult, merchantId: string, upiId: string): PaymentSession {
  const payments: Payment[] = split.amounts.map(amt => ({
    id: generateQRId(),
    amount: amt,
    upiUri: `upi://pay?pa=${encodeURIComponent(upiId)}&pn=&am=${amt}&tn=${generateShortId()}&cu=INR`,
    status: 'pending',
  }));
  payments[0].status = 'active';
  return {
    id: generateSessionId(),
    merchantId,
    totalAmount: amount,
    payments,
    status: 'active',
    createdAt: Date.now(),
  };
}

export const SessionPage: React.FC = () => {
  const navigate      = useNavigate();
  const { state }     = useLocation();
  const amount: number    = state?.amount ?? 0;
  const split: SplitResult = state?.split;

  const [profile]  = useLocalStorage<MerchantProfile | null>('merchant_profile', null);
  const [, setSessions] = useLocalStorage<PaymentSession[]>('payment_sessions', []);
  const [session, setSession] = useState<PaymentSession | null>(null);

  useEffect(() => {
    if (!amount || !split) { navigate('/'); return; }
    const s = buildSession(amount, split, profile?.id ?? 'default', profile?.upiId ?? '');
    setSession(s);
    setSessions(prev => [s, ...prev]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session) return null;

  const activeIdx     = session.payments.findIndex(p => p.status === 'active');
  const activePayment = session.payments[activeIdx] ?? null;
  const isComplete    = session.status === 'completed';
  const received      = session.payments.filter(p => p.status === 'received').length;

  const markReceived = () => {
    setSession(prev => {
      if (!prev) return prev;
      const payments = prev.payments.map((p, i) => {
        if (i === activeIdx)     return { ...p, status: 'received' as const, confirmedAt: Date.now() };
        if (i === activeIdx + 1) return { ...p, status: 'active' as const };
        return p;
      });
      const allDone = payments.every(p => p.status === 'received');
      const updated: PaymentSession = {
        ...prev, payments,
        status:      allDone ? 'completed' : 'active',
        completedAt: allDone ? Date.now() : undefined,
      };
      setSessions(all => all.map(s => s.id === updated.id ? updated : s));
      return updated;
    });
  };

  /* ── Complete screen ── */
  if (isComplete) {
    return (
      <div className="app-shell fade-in flex flex-col items-center justify-center px-6 text-center">
        {/* Success ring */}
        <div className="relative mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
              boxShadow: '0 0 0 8px rgba(16,185,129,0.04), 0 8px 32px rgba(16,185,129,0.15)',
            }}
          >
            <CheckCircle2 size={36} strokeWidth={1.5} className="text-emerald-400" />
          </div>
        </div>

        <p className="label-sm text-emerald-400/70 mb-2">Session Complete</p>
        <p className="text-4xl font-bold tracking-[-0.04em] text-slate-100 mb-1">
          <span style={{ fontSize: '0.5em', fontWeight: 500, color: '#475569', verticalAlign: '0.2em', marginRight: 2 }}>₹</span>
          {formatAmount(session.totalAmount)}
        </p>
        <p className="label-sm text-slate-600 mb-8">{session.id} · {session.payments.length} payments</p>

        {/* Summary table */}
        <div
          className="w-full rounded-2xl overflow-hidden mb-6"
          style={{ background: 'rgba(13,17,32,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {session.payments.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center justify-between px-5 py-3.5 ${i > 0 ? 'border-t border-white/[0.05]' : ''}`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" strokeWidth={2} />
                <span className="text-xs font-mono text-slate-500">{p.id}</span>
              </div>
              <span className="text-sm font-semibold font-mono text-slate-300">₹{formatAmount(p.amount)}</span>
            </div>
          ))}
          <div
            className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.05]"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <span className="label-sm">Total Collected</span>
            <span className="text-base font-bold font-mono text-slate-100">₹{formatAmount(session.totalAmount)}</span>
          </div>
        </div>

        <div className="flex gap-2.5 w-full">
          <Button variant="secondary" size="lg" fullWidth onClick={() => navigate('/history')} icon={<ChevronRight size={15} />} iconPosition="right">
            History
          </Button>
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/')} icon={<Home size={15} />} iconPosition="right">
            New
          </Button>
        </div>
      </div>
    );
  }

  /* ── Active session ── */
  return (
    <div className="app-shell fade-in">
      <TopBar
        title={`Session ${session.id}`}
        subtitle={`₹${formatAmount(session.totalAmount)} · ${received}/${session.payments.length} received`}
        backTo="/"
      />

      <div className="flex-1 flex flex-col px-5 pb-6 gap-4 overflow-y-auto slide-up">

        {/* Active QR card */}
        {activePayment && (
          <div
            className="rounded-3xl p-6 flex flex-col items-center gap-4"
            style={{ background: 'rgba(13,17,32,0.85)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-xs font-mono font-semibold" style={{ color: '#A78BFA' }}>{activePayment.id}</p>
                <p className="text-2xl font-bold tracking-[-0.03em] text-slate-100 mt-0.5 font-mono">
                  ₹{formatAmount(activePayment.amount)}
                </p>
              </div>
              <Badge variant="active" />
            </div>

            {/* QR */}
            <QRPlaceholder size={210} id={activePayment.id} />

            <p className="text-xs text-slate-600 text-center leading-relaxed">
              Show this QR to the customer. Confirm receipt from your bank app, then tap below.
            </p>
          </div>
        )}

        {/* Progress rail */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(13,17,32,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="px-5 pt-4 pb-2">
            <span className="label-sm">Payment Progress</span>
          </div>
          {session.payments.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center justify-between px-5 py-3.5 transition-colors ${i > 0 ? 'border-t border-white/[0.05]' : ''}`}
              style={p.status === 'active' ? { background: 'rgba(139,92,246,0.05)' } : {}}
            >
              <div className="flex items-center gap-3">
                {p.status === 'received' && (
                  <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" strokeWidth={1.75} />
                )}
                {p.status === 'active' && (
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 pulse-ring"
                    style={{ background: '#8B5CF6', border: '2px solid #A78BFA' }}
                  />
                )}
                {p.status === 'pending' && (
                  <Lock size={13} className="text-slate-700 flex-shrink-0" strokeWidth={2} />
                )}
                <span className="text-xs font-mono text-slate-500">{p.id}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-semibold font-mono text-slate-300">₹{formatAmount(p.amount)}</span>
                <Badge variant={p.status === 'pending' ? 'pending' : p.status} size="sm" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        {activePayment && (
          <Button
            variant="success"
            size="lg"
            fullWidth
            onClick={markReceived}
            icon={<CheckCircle2 size={17} />}
            iconPosition="left"
          >
            Confirm — {activePayment.id} received
          </Button>
        )}
      </div>
    </div>
  );
};
