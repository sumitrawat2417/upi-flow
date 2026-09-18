import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Lock, ChevronRight, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { TopBar } from '../../components/ui/TopBar';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type {
  PaymentSession, Payment, SplitResult, MerchantProfile, AppSettings,
} from '../../types';
import {
  generateQRId, generateSessionId, generateShortId, formatAmount,
} from '../../core/splitter';

/* ─── Fake QR placeholder (real QR lib will be wired in next phase) ─ */
const QRPlaceholder: React.FC<{ uri: string; size?: number }> = ({ uri, size = 220 }) => {
  // Render a fake QR grid for UI preview
  const seed = uri.length;
  const cells = Array.from({ length: 25 }, (_, i) => {
    // Always fill corners
    const row = Math.floor(i / 5), col = i % 5;
    const corner = (row < 2 && col < 2) || (row < 2 && col > 2) || (row > 2 && col < 2);
    return corner || ((seed + i * 7) % 3 !== 0);
  });

  return (
    <div
      className="rounded-2xl bg-white p-4 flex items-center justify-center glow-primary"
      style={{ width: size, height: size }}
    >
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: 'repeat(5, 1fr)', width: size - 40, height: size - 40 }}
      >
        {cells.map((filled, i) => (
          <div
            key={i}
            className="rounded-sm"
            style={{ background: filled ? '#111' : 'transparent', aspectRatio: '1' }}
          />
        ))}
      </div>
    </div>
  );
};

/* ─── Build session from split ──────────────────────────────────── */
function buildSession(amount: number, split: SplitResult, merchantId: string): PaymentSession {
  const payments: Payment[] = split.amounts.map(amt => ({
    id: generateQRId(),
    amount: amt,
    upiUri: `upi://pay?pa=merchant@upi&pn=Merchant&am=${amt}&tn=${generateShortId()}&cu=INR`,
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
  const navigate = useNavigate();
  const { state } = useLocation();
  const amount: number = state?.amount ?? 0;
  const split: SplitResult = state?.split;

  const [profile] = useLocalStorage<MerchantProfile | null>('merchant_profile', null);
  const [sessions, setSessions] = useLocalStorage<PaymentSession[]>('payment_sessions', []);

  const [session, setSession] = useState<PaymentSession | null>(null);

  // Build session on first render
  useEffect(() => {
    if (!amount || !split) { navigate('/'); return; }
    const s = buildSession(amount, split, profile?.id ?? 'default');
    setSession(s);
    setSessions(prev => [s, ...prev]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!session) return null;

  const activeIdx = session.payments.findIndex(p => p.status === 'active');
  const activePayment = session.payments[activeIdx] ?? null;
  const isComplete = session.status === 'completed';
  const received = session.payments.filter(p => p.status === 'received').length;

  const markReceived = () => {
    setSession(prev => {
      if (!prev) return prev;
      const payments = prev.payments.map((p, i) => {
        if (i === activeIdx) return { ...p, status: 'received' as const, confirmedAt: Date.now() };
        if (i === activeIdx + 1) return { ...p, status: 'active' as const };
        return p;
      });
      const allReceived = payments.every(p => p.status === 'received');
      const updated: PaymentSession = {
        ...prev,
        payments,
        status: allReceived ? 'completed' : 'active',
        completedAt: allReceived ? Date.now() : undefined,
      };
      // Persist
      setSessions(all => all.map(s => s.id === updated.id ? updated : s));
      return updated;
    });
  };

  /* ── Completion screen ──── */
  if (isComplete) {
    return (
      <div className="app-shell fade-in flex flex-col items-center justify-center px-6 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl" />
          <div className="relative w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center glow-success">
            <CheckCircle2 size={44} strokeWidth={1.5} className="text-emerald-400" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-100 mb-2 tracking-tight">Session Complete</h2>
        <p className="text-slate-500 text-sm mb-1">Session {session.id}</p>
        <p className="text-4xl font-bold text-slate-100 mt-6 mb-1 tracking-tight">
          <span className="text-2xl font-medium text-slate-400 mr-1">₹</span>
          {formatAmount(session.totalAmount)}
        </p>
        <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest mb-10">
          Fully Received
        </p>

        {/* Payment summary */}
        <div className="w-full glass rounded-2xl overflow-hidden mb-8">
          {session.payments.map((p, i) => (
            <div key={p.id} className={`flex items-center justify-between px-5 py-4 ${i > 0 ? 'border-t border-white/[0.06]' : ''}`}>
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" strokeWidth={1.75} />
                <span className="text-xs font-mono text-slate-400">{p.id}</span>
              </div>
              <span className="text-sm font-semibold text-slate-200">₹{formatAmount(p.amount)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06] bg-white/[0.03]">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total</span>
            <span className="text-base font-bold text-slate-100">₹{formatAmount(session.totalAmount)}</span>
          </div>
        </div>

        <div className="flex gap-3 w-full">
          <Button variant="secondary" size="lg" fullWidth onClick={() => navigate('/history')} icon={<ChevronRight size={16} />} iconPosition="right">
            View History
          </Button>
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/')} icon={<Home size={16} />} iconPosition="right">
            New Payment
          </Button>
        </div>
      </div>
    );
  }

  /* ── Active session ──── */
  return (
    <div className="app-shell fade-in">
      <TopBar
        title={`Session ${session.id}`}
        subtitle={`₹${formatAmount(session.totalAmount)} total · ${received}/${session.payments.length} received`}
        backTo="/"
      />

      <div className="flex-1 flex flex-col px-5 pb-6 gap-5 overflow-y-auto slide-up">

        {/* QR Card */}
        {activePayment && (
          <div className="glass rounded-3xl p-6 flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-xs font-mono font-semibold text-indigo-400">{activePayment.id}</p>
                <p className="text-2xl font-bold text-slate-100 tracking-tight mt-0.5">
                  ₹{formatAmount(activePayment.amount)}
                </p>
              </div>
              <Badge variant="active" />
            </div>

            <QRPlaceholder uri={activePayment.upiUri} size={230} />

            <p className="text-xs text-slate-500 text-center">
              Show this QR to your customer. Confirm receipt from your UPI bank app.
            </p>
          </div>
        )}

        {/* Progress rail */}
        <div className="glass rounded-2xl overflow-hidden">
          <p className="px-5 pt-4 pb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Payment Progress
          </p>
          {session.payments.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center justify-between px-5 py-4 transition-colors ${
                i > 0 ? 'border-t border-white/[0.06]' : ''
              } ${p.status === 'active' ? 'bg-indigo-500/[0.06]' : ''}`}
            >
              <div className="flex items-center gap-3">
                {p.status === 'received' && <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" strokeWidth={1.75} />}
                {p.status === 'active' && <div className="w-4 h-4 rounded-full border-2 border-indigo-400 flex-shrink-0 animate-pulse" />}
                {p.status === 'pending' && <Lock size={14} className="text-slate-600 flex-shrink-0" strokeWidth={1.75} />}
                <span className="text-xs font-mono text-slate-400">{p.id}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-200">₹{formatAmount(p.amount)}</span>
                <Badge variant={p.status === 'pending' ? 'pending' : p.status} size="sm" />
              </div>
            </div>
          ))}
        </div>

        {/* Mark received CTA */}
        {activePayment && (
          <Button
            variant="success"
            size="lg"
            fullWidth
            onClick={markReceived}
            icon={<CheckCircle2 size={18} />}
            iconPosition="left"
          >
            Mark Received — {activePayment.id}
          </Button>
        )}

        <div className="pb-2" />
      </div>
    </div>
  );
};
