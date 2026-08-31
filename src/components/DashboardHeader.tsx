import React from 'react';
import { QueueStatus } from '../types';

interface DashboardHeaderProps {
  status: QueueStatus;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ status, theme, onToggleTheme }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'RUNNING':
        return 'bg-emerald-500 text-emerald-100 shadow-emerald-500/20 border-emerald-400/20';
      case 'PAUSED':
        return 'bg-amber-500 text-amber-100 shadow-amber-500/20 border-amber-400/20';
      case 'STOPPED':
        return 'bg-rose-500 text-rose-100 shadow-rose-500/20 border-rose-400/20';
      case 'COMPLETED':
        return 'bg-indigo-500 text-indigo-100 shadow-indigo-500/20 border-indigo-400/20';
      default:
        return 'bg-zinc-650 text-zinc-300 border-zinc-500/20';
    }
  };

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-800 pb-6 mb-8 gap-4 select-none">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">
          BulkReach
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Automated bulk email enrichment from LinkedIn profile URLs
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Modern Theme Switch Toggle */}
        <button
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition cursor-pointer hover:bg-zinc-800 flex items-center justify-center shadow-md shrink-0"
        >
          {theme === 'dark' ? (
            // Sun Icon (Switch to Light)
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          ) : (
            // Moon Icon (Switch to Dark)
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          )}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Status:</span>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold shadow-lg border ${getStatusColor()}`}>
            {status === 'RUNNING' && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
            {status === 'PAUSED' && <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>}
            {status === 'STOPPED' && <span className="h-2 w-2 rounded-full bg-rose-400"></span>}
            {status === 'COMPLETED' && <span className="h-2 w-2 rounded-full bg-indigo-400"></span>}
            {status === 'IDLE' && <span className="h-2 w-2 rounded-full bg-zinc-400"></span>}
            <span>{status}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
