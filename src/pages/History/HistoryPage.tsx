import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, Clock } from 'lucide-react';
import { TopBar } from '../../components/ui/TopBar';
import { Badge } from '../../components/ui/Badge';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { PaymentSession } from '../../types';
import { formatAmount } from '../../core/splitter';

function formatDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function groupByDate(sessions: PaymentSession[]): Map<string, PaymentSession[]> {
  const map = new Map<string, PaymentSession[]>();
  sessions.forEach(s => {
    const label = formatDate(s.createdAt);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(s);
  });
  return map;
}

const SessionCard: React.FC<{ session: PaymentSession }> = ({ session }) => {
  const [expanded, setExpanded] = useState(false);
  const isComplete = session.status === 'completed';

  return (
    <div className="glass rounded-2xl overflow-hidden transition-all duration-200">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-4 text-left active:bg-white/[0.02]"
      >
        <div className="flex items-center gap-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isComplete ? 'bg-emerald-500/10' : 'bg-amber-500/10'
          }`}>
            {isComplete
              ? <CheckCircle2 size={18} className="text-emerald-400" strokeWidth={1.75} />
              : <Clock size={18} className="text-amber-400" strokeWidth={1.75} />
            }
          </div>
          <div>
            <p className="text-base font-semibold text-slate-100 tracking-tight">
              ₹{formatAmount(session.totalAmount)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {session.id} · {formatTime(session.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={session.status} size="sm" />
          {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/[0.06]">
          {session.payments.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center justify-between px-5 py-3 ${i > 0 ? 'border-t border-white/[0.04]' : ''}`}
            >
              <div className="flex items-center gap-2.5">
                {p.status === 'received'
                  ? <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" strokeWidth={1.75} />
                  : <Clock size={14} className="text-amber-400 flex-shrink-0" strokeWidth={1.75} />
                }
                <span className="text-xs font-mono text-slate-400">{p.id}</span>
              </div>
              <span className="text-sm font-semibold text-slate-200">₹{formatAmount(p.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const HistoryPage: React.FC = () => {
  const [sessions] = useLocalStorage<PaymentSession[]>('payment_sessions', []);
  const grouped = groupByDate(sessions);

  return (
    <div className="app-shell fade-in">
      <TopBar title="History" backTo="/" />

      <div className="flex-1 overflow-y-auto px-5 pb-8 flex flex-col gap-6 slide-up">
        {sessions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-2">
              <Clock size={28} strokeWidth={1.5} className="text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">No payment sessions yet</p>
            <p className="text-sm text-slate-600">Completed sessions will appear here.</p>
          </div>
        ) : (
          [...grouped.entries()].map(([date, group]) => (
            <div key={date} className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 px-1">
                {date}
              </p>
              {group.map(s => <SessionCard key={s.id} session={s} />)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
