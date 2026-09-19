import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Lock, Home, ChevronLeft, RefreshCw } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { PaymentSession, Payment, SplitResult, MerchantProfile } from '../../types';
import { generateQRId, generateSessionId, generateShortId, formatAmount } from '../../core/splitter';

/* ─── QR Code component (deterministic pattern) ──────────────── */
const QRCode: React.FC<{ id: string; size?: number }> = ({ id, size = 200 }) => {
  const seed = id.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0);
  const cells = Array.from({ length: 49 }, (_, i) => {
    const r = Math.floor(i / 7), c = i % 7;
    // Corner finder patterns
    if ((r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2)) return true;
    // Data
    return ((seed * (i + 11) + i * 37) % 23) < 12;
  });

  const cellSize = (size - 40) / 7;

  return (
    <div
      style={{
        width: size, height: size,
        background: 'white',
        borderRadius: 20,
        padding: 20,
        boxShadow: '0 4px 24px rgba(232,67,90,0.12), 0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(7, ${cellSize}px)`, gap: 3 }}>
        {cells.map((filled, i) => (
          <div
            key={i}
            style={{
              width: cellSize, height: cellSize,
              background: filled ? '#1A1A2E' : 'transparent',
              borderRadius: 3,
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* ─── Build session ──────────────────────────────────────────── */
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
  const navigate       = useNavigate();
  const { state }      = useLocation();
  const amount: number     = state?.amount ?? 0;
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

  /* ── Completion screen ── */
  if (isComplete) {
    return (
      <div className="app-shell fade-in flex flex-col">
        <div className="hero-header px-5 pt-12 pb-10 flex flex-col items-center relative z-10">
          <div
            className="icon-circle w-16 h-16 mb-4"
            style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}
          >
            <CheckCircle2 size={30} strokeWidth={1.75} color="white" />
          </div>
          <p className="text-white/70 text-sm font-semibold mb-1">Session Complete</p>
          <p className="text-white font-extrabold text-4xl tracking-tight">
            ₹{formatAmount(session.totalAmount)}
          </p>
          <p className="text-white/50 text-xs mt-2">{session.payments.length} payments collected</p>
        </div>

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
          {/* Payment breakdown */}
          <div className="card overflow-hidden">
            {session.payments.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-5 py-3.5"
                style={i > 0 ? { borderTop: '1px solid var(--color-border)' } : {}}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="icon-circle w-7 h-7"
                    style={{ background: 'rgba(34,197,94,0.10)' }}
                  >
                    <CheckCircle2 size={14} strokeWidth={2} color="#16A34A" />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-text-2)' }}>
                    {p.id}
                  </span>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--color-text-1)' }}>
                  ₹{formatAmount(p.amount)}
                </span>
              </div>
            ))}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{
                background: 'rgba(232,67,90,0.04)',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <span className="section-label">Total Collected</span>
              <span className="text-base font-extrabold" style={{ color: 'var(--color-primary)' }}>
                ₹{formatAmount(session.totalAmount)}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-1">
            <button
              className="btn-secondary flex-1"
              onClick={() => navigate('/history')}
            >
              <RefreshCw size={15} strokeWidth={2} />
              History
            </button>
            <button
              className="btn-primary flex-1"
              onClick={() => navigate('/')}
            >
              <Home size={15} strokeWidth={2} />
              New Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Active session ── */
  return (
    <div className="app-shell fade-in">
      {/* Header */}
      <div className="hero-header px-5 pt-12 pb-8 relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate('/')}
            className="icon-circle w-9 h-9 active:scale-90 transition-transform"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <ChevronLeft size={18} strokeWidth={2.5} color="white" />
          </button>
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">
              {session.id}
            </h1>
            <p className="text-white/55 text-xs mt-0.5">
              {received}/{session.payments.length} received · ₹{formatAmount(session.totalAmount)}
            </p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mt-2">
          {session.payments.map((p, i) => (
            <div
              key={p.id}
              className="h-1.5 flex-1 rounded-full transition-all"
              style={{
                background: p.status === 'received'
                  ? 'rgba(255,255,255,0.9)'
                  : p.status === 'active'
                    ? 'rgba(255,255,255,0.5)'
                    : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 flex flex-col px-4 pb-6 gap-4 overflow-y-auto"
        style={{
          background: 'var(--color-bg)',
          borderRadius: '24px 24px 0 0',
          marginTop: '-20px',
          zIndex: 10,
          position: 'relative',
          paddingTop: '24px',
        }}
      >
        {/* QR Card */}
        {activePayment && (
          <div className="card flex flex-col items-center px-5 py-6 gap-4">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--color-text-3)' }}>
                  Payment {activeIdx + 1} of {session.payments.length}
                </p>
                <p className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-primary)' }}>
                  ₹{formatAmount(activePayment.amount)}
                </p>
              </div>
              <div
                className="status-pill status-active pulse-glow"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                Active
              </div>
            </div>

            <QRCode id={activePayment.id} size={200} />

            <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--color-text-3)' }}>
              Show this QR. Confirm from your bank app, then tap below.
            </p>

            <button
              className="btn-primary w-full"
              onClick={markReceived}
            >
              <CheckCircle2 size={17} strokeWidth={2} />
              Confirm Payment Received
            </button>
          </div>
        )}

        {/* Payment list */}
        <div className="card overflow-hidden">
          <div className="px-5 pt-4 pb-2">
            <p className="section-label">All Payments</p>
          </div>
          {session.payments.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center justify-between px-5 py-3.5"
              style={i > 0 ? { borderTop: '1px solid var(--color-border)' } : {}}
            >
              <div className="flex items-center gap-3">
                <div
                  className="icon-circle w-7 h-7"
                  style={{
                    background: p.status === 'received'
                      ? 'rgba(34,197,94,0.10)'
                      : p.status === 'active'
                        ? 'rgba(232,67,90,0.10)'
                        : 'var(--color-surface-2)',
                  }}
                >
                  {p.status === 'received' && <CheckCircle2 size={14} strokeWidth={2} color="#16A34A" />}
                  {p.status === 'active'   && <span className="w-2 h-2 rounded-full bg-red-500 pulse-glow" />}
                  {p.status === 'pending'  && <Lock size={12} strokeWidth={2} color="var(--color-text-3)" />}
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-2)' }}>{p.id}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-bold" style={{ color: 'var(--color-text-1)' }}>
                  ₹{formatAmount(p.amount)}
                </span>
                <span className={`status-pill status-${p.status}`}>
                  {p.status === 'received' ? 'Done' : p.status === 'active' ? 'Active' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
