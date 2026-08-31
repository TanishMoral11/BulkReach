'use client';

import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { UrlInputArea } from '@/components/UrlInputArea';
import { ControlPanel } from '@/components/ControlPanel';
import { ExportPanel } from '@/components/ExportPanel';
import { ProgressTracker } from '@/components/ProgressTracker';
import { ResultsTable } from '@/components/ResultsTable';
import { useQueueEvents } from '@/hooks/useQueueEvents';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export default function Home() {
  const { status, stats, currentUrl, results, isConnected } = useQueueEvents();
  const [urlsToProcess, setUrlsToProcess] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const processedUrlsRef = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  const addToast = (message: string, type: 'success' | 'error' | 'warning' = 'error') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  useEffect(() => {
    if (!mounted) return;

    results.forEach((lead) => {
      if (!processedUrlsRef.current.has(lead.linkedinUrl)) {
        processedUrlsRef.current.add(lead.linkedinUrl);

        const isFailed = lead.status === 'failed';
        const hasNoEmail = lead.status === 'success' && (!lead.email || lead.email.trim() === '');

        if (isFailed || hasNoEmail) {
          const urlSnippet = lead.linkedinUrl.split('/in/')[1]?.split('/')[0] || lead.linkedinUrl;
          const decodedSnippet = decodeURIComponent(urlSnippet);
          const msg = isFailed
            ? `Failed to enrich: ${decodedSnippet} (${lead.error || 'Unknown error'})`
            : `No email found for: ${decodedSnippet}`;
          
          addToast(msg, 'warning');
        }
      }
    });

    if (results.length === 0) {
      processedUrlsRef.current.clear();
    }
  }, [results, mounted]);

  const handleStart = async () => {
    if (urlsToProcess.length === 0) return;
    setErrorMsg(null);

    try {
      const res = await fetch('/api/queue/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'START', urls: urlsToProcess })
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'Failed to start enrichment pipeline');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Network error: failed to trigger queue start.');
    }
  };

  const handlePause = async () => {
    try {
      await fetch('/api/queue/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PAUSE' })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleResume = async () => {
    try {
      await fetch('/api/queue/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESUME' })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleStop = async () => {
    try {
      await fetch('/api/queue/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'STOP' })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const isIdle = status === 'IDLE' || status === 'STOPPED' || status === 'COMPLETED';

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="flex flex-col gap-6 animate-pulse">
            <div className="h-8 bg-zinc-900 rounded w-1/4"></div>
            <div className="h-4 bg-zinc-950 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-indigo-500 selection:text-white pb-16">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-10 left-1/3 w-[350px] h-[350px] bg-violet-500/5 rounded-full blur-[90px] -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <DashboardHeader status={status} />

        {/* Global Connection / Error Alerts */}
        {!isConnected && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex items-center gap-3 text-sm text-amber-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 animate-pulse shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <span>Connection to local pipeline lost. Attempting to reconnect...</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/25 rounded-2xl p-4 flex items-center gap-3 text-sm text-rose-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Left Column: Inputs & Actions (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <UrlInputArea
              onUrlsProcessed={setUrlsToProcess}
              disabled={!isIdle}
            />
            
            <ControlPanel
              status={status}
              hasUrls={urlsToProcess.length > 0}
              onStart={handleStart}
              onPause={handlePause}
              onResume={handleResume}
              onStop={handleStop}
            />

            <ExportPanel
              resultsCount={results.length}
              failedCount={stats.failed}
            />
          </div>

          {/* Right Column: Progress Analytics (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <ProgressTracker
                stats={stats}
                currentUrl={currentUrl}
                status={status}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section: Live Grid View */}
        <div className="w-full">
          <ResultsTable results={results} />
        </div>
      </div>

      {/* Toast Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-3 text-xs text-zinc-200 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
          >
            <span className="flex h-2 w-2 rounded-full bg-rose-500 shrink-0"></span>
            <div className="flex-1 truncate pr-2 font-medium">{toast.message}</div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-zinc-500 hover:text-zinc-300 transition shrink-0 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
