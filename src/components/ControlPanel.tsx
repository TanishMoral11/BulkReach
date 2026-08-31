import React from 'react';
import { QueueStatus } from '../types';

interface ControlPanelProps {
  status: QueueStatus;
  hasUrls: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  status,
  hasUrls,
  onStart,
  onPause,
  onResume,
  onStop
}) => {
  const isIdle = status === 'IDLE' || status === 'STOPPED' || status === 'COMPLETED';
  const isRunning = status === 'RUNNING';
  const isPaused = status === 'PAUSED';

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-md bg-opacity-70 flex flex-col justify-center">
      <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2 mb-4">
        <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
        Pipeline Controls
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Play/Start Button */}
        {isIdle && (
          <button
            onClick={onStart}
            disabled={!hasUrls}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
            Start Enrichment
          </button>
        )}

        {/* Pause Button */}
        {isRunning && (
          <button
            onClick={onPause}
            className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition shadow-lg shadow-amber-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
            Pause Pipeline
          </button>
        )}

        {/* Resume Button */}
        {isPaused && (
          <button
            onClick={onResume}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
            Resume Pipeline
          </button>
        )}

        {/* Stop Button */}
        <button
          onClick={onStop}
          disabled={isIdle}
          className="w-full py-3 px-4 bg-zinc-800 hover:bg-rose-950 hover:text-rose-200 border border-zinc-700 hover:border-rose-900 text-zinc-300 font-semibold rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
          </svg>
          Stop / Clear
        </button>
      </div>

      {!hasUrls && isIdle && (
        <p className="text-zinc-500 text-xs text-center mt-3">
          Paste some LinkedIn URLs into the text area to enable enrichment.
        </p>
      )}
    </div>
  );
};
