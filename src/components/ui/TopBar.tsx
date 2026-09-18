import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface TopBarProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  backTo,
  onBack,
  rightAction,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) { onBack(); return; }
    if (backTo) { navigate(backTo); return; }
    navigate(-1);
  };

  const hasBack = !!(backTo || onBack);

  return (
    <header className="flex items-center justify-between px-5 pt-14 pb-4">
      <div className="flex items-center gap-3 min-w-0">
        {hasBack && (
          <button
            onClick={handleBack}
            aria-label="Go back"
            className="
              flex-shrink-0 w-9 h-9 rounded-xl
              flex items-center justify-center
              bg-white/[0.04] border border-white/[0.08]
              text-slate-400 hover:text-slate-200
              hover:bg-white/[0.08] hover:border-white/[0.14]
              transition-all duration-150 active:scale-90
            "
          >
            <ArrowLeft size={18} strokeWidth={2} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-slate-100 leading-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      {rightAction && (
        <div className="flex-shrink-0 ml-3">{rightAction}</div>
      )}
    </header>
  );
};
