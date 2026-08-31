import React from 'react';
import { ProgressStats } from '../types';

interface ProgressTrackerProps {
  stats: ProgressStats;
  currentUrl: string | null;
  status: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ stats, currentUrl, status }) => {
  const progressPct = stats.total > 0 ? ((stats.completed + stats.failed) / stats.total) * 100 : 0;

  const formatEta = (seconds: number | null): string => {
    if (seconds === null || seconds <= 0) return '--';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs}h ${remainingMins}m`;
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-emerald-500';
    if (rate >= 70) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-md bg-opacity-70 flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
        Progress & Live Analytics
      </h2>

      {/* Grid Counters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-zinc-500 font-medium">Total URLs</span>
          <span className="text-2xl font-bold text-zinc-100 mt-2">{stats.total}</span>
        </div>
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-zinc-500 font-medium">Completed</span>
          <span className="text-2xl font-bold text-emerald-500 mt-2">{stats.completed}</span>
        </div>
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-zinc-500 font-medium">Failed</span>
          <span className="text-2xl font-bold text-rose-500 mt-2">{stats.failed}</span>
        </div>
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-zinc-500 font-medium">Success Rate</span>
          <span className={`text-2xl font-bold mt-2 ${getSuccessRateColor(stats.successRate)}`}>
            {stats.successRate}%
          </span>
        </div>
        <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 flex flex-col justify-between col-span-2 md:col-span-1">
          <span className="text-xs text-zinc-500 font-medium">Estimated Remaining</span>
          <span className="text-2xl font-bold text-blue-400 mt-2">{formatEta(stats.etaSeconds)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs text-zinc-400 font-semibold">
          <span>PIPELINE PROGRESS</span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Active Processing Details */}
      {status === 'RUNNING' && currentUrl && (
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Processing profile:</span>
              <span className="text-sm font-mono text-zinc-200 truncate mt-0.5">{currentUrl}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-xs font-semibold shrink-0">
            {/* Spinning Loader */}
            <svg className="animate-spin h-3 w-3 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Automation Running
          </div>
        </div>
      )}
    </div>
  );
};
