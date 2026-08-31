import React, { useState, useEffect } from 'react';

interface UrlInputAreaProps {
  onUrlsProcessed: (urls: string[]) => void;
  disabled: boolean;
}

export const UrlInputArea: React.FC<UrlInputAreaProps> = ({ onUrlsProcessed, disabled }) => {
  const [urls, setUrls] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    uniqueCount: 0,
    duplicatesCount: 0,
  });

  // Keep parent component updated when URLs change
  useEffect(() => {
    onUrlsProcessed(urls);
  }, [urls, onUrlsProcessed]);

  const addUrlsFromText = (text: string) => {
    // Split by newlines, commas, or whitespace
    const parsed = text
      .split(/[\n\r\s,]+/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (parsed.length === 0) return;

    const combined = [...urls, ...parsed];
    const unique = Array.from(new Set(combined));
    
    setUrls(unique);
    setStats({
      total: combined.length,
      uniqueCount: unique.length,
      duplicatesCount: combined.length - unique.length,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addUrlsFromText(inputValue);
      setInputValue('');
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    addUrlsFromText(pastedText);
    setInputValue('');
  };

  const handleAddClick = () => {
    addUrlsFromText(inputValue);
    setInputValue('');
  };

  const removeUrl = (indexToRemove: number) => {
    const updated = urls.filter((_, idx) => idx !== indexToRemove);
    setUrls(updated);
    setStats((prev) => {
      const newTotal = prev.total > 0 ? Math.max(0, prev.total - 1) : 0;
      return {
        total: newTotal,
        uniqueCount: updated.length,
        duplicatesCount: prev.duplicatesCount,
      };
    });
  };

  const clearAll = () => {
    setUrls([]);
    setStats({ total: 0, uniqueCount: 0, duplicatesCount: 0 });
    setInputValue('');
  };

  // Format index string e.g. 1 -> 01
  const formatIndex = (idx: number): string => {
    const num = idx + 1;
    return num < 10 ? `0${num}` : `${num}`;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-md bg-opacity-70 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500"></span>
          Input LinkedIn Profile URLs
        </h2>
        {urls.length > 0 && (
          <button
            onClick={clearAll}
            disabled={disabled}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Input Box Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            disabled={disabled}
            placeholder="Type or paste LinkedIn URL(s) and press Enter..."
            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl pl-4 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-650 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed font-mono"
          />
        </div>
        <button
          onClick={handleAddClick}
          disabled={disabled || !inputValue.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl px-5 py-3 text-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>

      {/* Visual Tag Cards Container */}
      <div className="border border-zinc-850 rounded-xl bg-zinc-950 p-4 min-h-[120px] max-h-60 overflow-y-auto flex flex-col gap-3">
        {urls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urls.map((url, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs hover:bg-zinc-900 hover:border-zinc-750 transition group"
              >
                <span className="font-mono text-zinc-500 font-bold bg-zinc-950 px-1.5 py-0.5 rounded text-[10px] select-none border border-zinc-850">
                  {formatIndex(idx)}
                </span>
                <span className="text-zinc-300 font-mono truncate flex-1 select-all" title={url}>
                  {url}
                </span>
                <button
                  onClick={() => removeUrl(idx)}
                  disabled={disabled}
                  title="Remove URL"
                  className="text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded p-1 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-zinc-550 text-xs py-4 select-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-8 h-8 text-zinc-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
            <span>No URLs loaded. Type a URL or paste a bulk list to begin.</span>
          </div>
        )}
      </div>

      {/* Stats Board */}
      {stats.total > 0 && (
        <div className="grid grid-cols-3 gap-3 bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs">
          <div className="flex flex-col">
            <span className="text-zinc-500">Total pasted</span>
            <span className="text-zinc-200 font-bold mt-1 text-sm">{stats.total}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500">Duplicates removed</span>
            <span className="text-amber-500 font-bold mt-1 text-sm">{stats.duplicatesCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500">URLs to process</span>
            <span className="text-emerald-500 font-bold mt-1 text-sm">{stats.uniqueCount}</span>
          </div>
        </div>
      )}
    </div>
  );
};
