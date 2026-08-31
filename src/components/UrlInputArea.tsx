import React, { useState, useEffect } from 'react';

interface UrlInputAreaProps {
  onUrlsProcessed: (urls: string[]) => void;
  disabled: boolean;
}

export const UrlInputArea: React.FC<UrlInputAreaProps> = ({ onUrlsProcessed, disabled }) => {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    uniqueCount: 0,
    duplicatesCount: 0,
  });

  useEffect(() => {
    if (!text.trim()) {
      setStats({ total: 0, uniqueCount: 0, duplicatesCount: 0 });
      onUrlsProcessed([]);
      return;
    }

    const lines = text.split('\n').map(line => line.trim());
    const nonKeys = lines.filter(line => line.length > 0);

    // Deduplicate
    const uniqueLines = Array.from(new Set(nonKeys));
    const duplicates = nonKeys.length - uniqueLines.length;

    setStats({
      total: nonKeys.length,
      uniqueCount: uniqueLines.length,
      duplicatesCount: duplicates,
    });

    onUrlsProcessed(uniqueLines);
  }, [text]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-md bg-opacity-70">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500"></span>
          Input LinkedIn Profile URLs
        </h2>
        <span className="text-xs text-zinc-400">One URL per line</span>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          placeholder="https://www.linkedin.com/in/williamhgates&#10;https://www.linkedin.com/in/bilimnemc/"
          className="w-full h-48 bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed resize-none font-mono"
        />
      </div>

      {stats.total > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs">
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
