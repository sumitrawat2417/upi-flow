import React from 'react';
import type { PaymentStatus, SessionStatus } from '../../types';
import { CheckCircle, Clock, Lock, Zap } from 'lucide-react';

type BadgeVariant = PaymentStatus | SessionStatus | 'info';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  size?: 'sm' | 'md';
}

const config: Record<BadgeVariant, { label: string; className: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   className: 'badge-pending',  icon: <Clock size={10} strokeWidth={2.5} /> },
  active:    { label: 'Active',    className: 'badge-complete', icon: <Zap size={10} strokeWidth={2.5} /> },
  received:  { label: 'Received',  className: 'badge-received', icon: <CheckCircle size={10} strokeWidth={2.5} /> },
  cancelled: { label: 'Cancelled', className: 'badge-locked',   icon: <Lock size={10} strokeWidth={2.5} /> },
  completed: { label: 'Completed', className: 'badge-received', icon: <CheckCircle size={10} strokeWidth={2.5} /> },
  info:      { label: 'Info',      className: 'badge-locked',   icon: null },
};

export const Badge: React.FC<BadgeProps> = ({ variant, label, size = 'md' }) => {
  const { label: defaultLabel, className, icon } = config[variant] ?? config.info;
  return (
    <span className={`badge ${className} ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : ''}`}>
      {icon}
      {label ?? defaultLabel}
    </span>
  );
};
