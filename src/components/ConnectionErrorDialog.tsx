import React from 'react';

interface ConnectionErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  errorMessage?: string | null;
}

export function ConnectionErrorDialog({
  isOpen,
  onClose,
  onRetry,
  errorMessage = 'useQueueEvents: SSE stream connection lost. Reconnecting...'
}: ConnectionErrorDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="connection-error-title"
      >
        {/* Top Decorative Accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />

        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* Warning Icon with Pulse ring */}
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
              <span className="absolute inset-0 rounded-xl bg-amber-500/20 animate-ping opacity-25" />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>

            <div className="flex-1 min-w-0">
              <h3 id="connection-error-title" className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                Connection Lost
              </h3>
              <p className="mt-1 text-sm text-zinc-400 leading-relaxed">
                The connection to the real-time event stream was interrupted. The application is attempting to reconnect automatically.
              </p>
            </div>
          </div>

          {/* Console Error Detail Box */}
          <div className="mt-4 p-3 bg-zinc-950/80 border border-zinc-800/60 rounded-xl font-mono text-xs text-rose-400/90 break-words select-all">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1 font-sans font-medium">Error Log</div>
            {errorMessage || 'useQueueEvents: SSE stream connection lost. Reconnecting...'}
          </div>

          {/* Status Badge */}
          <div className="mt-4 flex items-center gap-2 text-xs text-amber-400/90">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>Reconnection attempt in progress...</span>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-xl transition cursor-pointer"
            >
              Dismiss
            </button>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 rounded-xl shadow-lg shadow-amber-500/10 transition cursor-pointer flex items-center gap-1.5"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Retry Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
