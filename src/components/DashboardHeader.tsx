import React from 'react';
import { QueueStatus } from '../types';

interface DashboardHeaderProps {
  status: QueueStatus;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'RUNNING':
        return 'bg-emerald-500 text-emerald-100 shadow-emerald-500/20';
      case 'PAUSED':
        return 'bg-amber-500 text-amber-100 shadow-amber-500/20';
      case 'STOPPED':
        return 'bg-rose-500 text-rose-100 shadow-rose-500/20';
      case 'COMPLETED':
        return 'bg-indigo-500 text-indigo-100 shadow-indigo-500/20';
      default:
        return 'bg-zinc-600 text-zinc-300';
    }
  };

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-800 pb-6 mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">
          BulkReach
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Automated bulk email enrichment from LinkedIn profile URLs
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Pipeline Status:</span>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${getStatusColor()}`}>
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
    </header>
  );
};
