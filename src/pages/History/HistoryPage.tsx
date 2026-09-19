import React, { useState } from 'react';
import { CheckCircle2, Clock, ChevronDown, ChevronUp, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { PaymentSession } from '../../types';
import { formatAmount } from '../../core/splitter';

function formatDate(ts: number): string {
  const d = new Date(ts), t = new Date(), y = new Date();
  y.setDate(y.getDate() - 1);
  if (d.toDateString() === t.toDateString()) return 'Today';
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function groupByDate(sessions: PaymentSession[]) {
  const map = new Map<string, PaymentSession[]>();
  sessions.forEach(s => {
    const k = formatDate(s.createdAt);
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(s);
  });
  return map;
}

const SessionCard: React.FC<{ session: PaymentSession }> = ({ session }) => {
  const [open, setOpen] = useState(false);
  const done = session.status === 'completed';

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3.5 px-5 py-4 text-left"
      >
        <div
          className="icon-circle w-10 h-10 flex-shrink-0"
          style={{
            background: done ? 'rgba(34,197,94,0.10)' : 'rgba(245,158,11,0.10)',
          }}
        >
          {done
            ? <CheckCircle2 size={18} strokeWidth={1.75} color="#16A34A" />
            : <Clock size={18} strokeWidth={1.75} color="#D97706" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--color-text-1)' }}>
            ₹{formatAmount(session.totalAmount)}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>
            {session.id} · {formatTime(session.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`status-pill status-${session.status === 'completed' ? 'complete' : 'active'}`}>
            {session.status === 'completed' ? 'Complete' : 'Active'}
          </span>
          {open
            ? <ChevronUp size={14} color="var(--color-text-3)" />
            : <ChevronDown size={14} color="var(--color-text-3)" />
          }
        </div>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid var(--color-border)' }}>
          {(session.payments || []).map((p, i) => (
            <div
              key={p.id || i}
              className="flex items-center justify-between px-5 py-3"
              style={i > 0 ? { borderTop: '1px solid var(--color-border)' } : {}}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="icon-circle w-6 h-6"
                  style={{
                    background: p.status === 'received'
                      ? 'rgba(34,197,94,0.10)'
                      : 'rgba(245,158,11,0.10)',
                  }}
                >
                  {p.status === 'received'
                    ? <CheckCircle2 size={12} strokeWidth={2} color="#16A34A" />
                    : <Clock size={12} strokeWidth={2} color="#D97706" />
                  }
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--color-text-2)' }}>{p.id || `Payment ${i+1}`}</span>
              </div>
              <span className="text-sm font-bold" style={{ color: 'var(--color-text-1)' }}>
                ₹{formatAmount(p.amount || 0)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessions] = useLocalStorage<PaymentSession[]>('payment_sessions', []);
  const validSessions = sessions.filter(s => s && s.id && s.createdAt && Array.isArray(s.payments));
  const grouped    = groupByDate(validSessions);

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
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">History</h1>
            <p className="text-white/55 text-xs mt-0.5">{sessions.length} total sessions</p>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 pb-10 flex flex-col gap-5"
        style={{
          background: 'var(--color-bg)',
          borderRadius: '24px 24px 0 0',
          marginTop: '-20px',
          zIndex: 10,
          position: 'relative',
          paddingTop: '24px',
        }}
      >
        {sessions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 pt-24">
            <div
              className="icon-circle w-16 h-16 mb-2"
              style={{ background: 'var(--color-surface)' }}
            >
              <Clock size={26} strokeWidth={1.5} color="var(--color-text-3)" />
            </div>
            <p className="font-semibold text-sm" style={{ color: 'var(--color-text-2)' }}>No sessions yet</p>
            <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>
              Completed payment sessions will appear here.
            </p>
          </div>
        ) : (
          [...grouped.entries()].map(([date, group]) => (
            <div key={date} className="flex flex-col gap-3">
              <p className="section-label px-1">{date}</p>
              {group.map(s => <SessionCard key={s.id} session={s} />)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
