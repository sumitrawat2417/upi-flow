import React, { useState } from 'react';
import { CheckCircle2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { TopBar } from '../../components/ui/TopBar';
import { Badge } from '../../components/ui/Badge';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { PaymentSession } from '../../types';
import { formatAmount } from '../../core/splitter';

function formatDate(ts: number): string {
  const d = new Date(ts);
  const t = new Date();
  const y = new Date();
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
    <div
      className="rounded-2xl overflow-hidden transition-all duration-150"
      style={{ background: 'rgba(13,17,32,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left active:bg-white/[0.02]"
      >
        {/* Status dot */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: done ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
            border:     done ? '1px solid rgba(16,185,129,0.18)' : '1px solid rgba(245,158,11,0.18)',
          }}
        >
          {done
            ? <CheckCircle2 size={15} className="text-emerald-400" strokeWidth={2} />
            : <Clock size={15} className="text-amber-400" strokeWidth={2} />
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold tracking-[-0.02em] text-slate-100 font-mono">
            ₹{formatAmount(session.totalAmount)}
          </p>
          <p className="text-xs text-slate-600 mt-0.5 font-mono">
            {session.id} &nbsp;·&nbsp; {formatTime(session.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant={session.status} size="sm" />
          {open
            ? <ChevronUp size={14} className="text-slate-600" />
            : <ChevronDown size={14} className="text-slate-600" />
          }
        </div>
      </button>

      {open && (
        <div className="border-t border-white/[0.05]">
          {session.payments.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center justify-between px-5 py-3 ${i > 0 ? 'border-t border-white/[0.04]' : ''}`}
            >
              <div className="flex items-center gap-2.5">
                {p.status === 'received'
                  ? <CheckCircle2 size={13} className="text-emerald-400" strokeWidth={2} />
                  : <Clock size={13} className="text-amber-400" strokeWidth={2} />
                }
                <span className="text-xs font-mono text-slate-600">{p.id}</span>
              </div>
              <span className="text-sm font-semibold font-mono text-slate-400">₹{formatAmount(p.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const HistoryPage: React.FC = () => {
  const [sessions] = useLocalStorage<PaymentSession[]>('payment_sessions', []);
  const grouped    = groupByDate(sessions);

  return (
    <div className="app-shell fade-in">
      <TopBar title="History" backTo="/" />

      <div className="flex-1 overflow-y-auto px-5 pb-10 flex flex-col gap-6 slide-up">
        {sessions.length === 0
          ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 pt-24">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2"
                style={{ background: 'rgba(13,17,32,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Clock size={22} strokeWidth={1.5} className="text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium text-sm">No sessions yet</p>
              <p className="text-xs text-slate-700">Completed payment sessions will appear here.</p>
            </div>
          )
          : [...grouped.entries()].map(([date, group]) => (
            <div key={date} className="flex flex-col gap-2.5">
              <p className="label-sm px-1">{date}</p>
              {group.map(s => <SessionCard key={s.id} session={s} />)}
            </div>
          ))
        }
      </div>
    </div>
  );
};
