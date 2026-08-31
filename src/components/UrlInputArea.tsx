import React, { useState, useEffect } from 'react';

interface UrlInputAreaProps {
  onUrlsProcessed: (urls: string[]) => void;
  disabled: boolean;
}

export const UrlInputArea: React.FC<UrlInputAreaProps> = ({ onUrlsProcessed, disabled }) => {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    validCount: 0,
    invalidCount: 0,
    duplicatesCount: 0,
  });
  const [invalidSamples, setInvalidSamples] = useState<string[]>([]);

  const LINKEDIN_REGEX = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-_%]+\/?$/i;

  useEffect(() => {
    if (!text.trim()) {
      setStats({ total: 0, validCount: 0, invalidCount: 0, duplicatesCount: 0 });
      setInvalidSamples([]);
      onUrlsProcessed([]);
      return;
    }

    const lines = text.split('\n').map(line => line.trim());
    const nonKeys = lines.filter(line => line.length > 0);
    
    // Deduplicate
    const uniqueLines = Array.from(new Set(nonKeys));
    const duplicates = nonKeys.length - uniqueLines.length;

    // Validate
    const valids: string[] = [];
    const invalids: string[] = [];

    uniqueLines.forEach(url => {
      if (LINKEDIN_REGEX.test(url)) {
        valids.push(url);
      } else {
        invalids.push(url);
      }
    });

    setStats({
      total: nonKeys.length,
      validCount: valids.length,
      invalidCount: invalids.length,
      duplicatesCount: duplicates,
    });

    setInvalidSamples(invalids.slice(0, 3)); // show first 3 invalid URLs as warnings
    onUrlsProcessed(valids);
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
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950 border border-zinc-850 rounded-xl p-3 text-xs">
          <div className="flex flex-col">
            <span className="text-zinc-500">Total pasted</span>
            <span className="text-zinc-200 font-bold mt-1 text-sm">{stats.total}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500">Duplicates removed</span>
            <span className="text-amber-500 font-bold mt-1 text-sm">{stats.duplicatesCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500">Valid format</span>
            <span className="text-emerald-500 font-bold mt-1 text-sm">{stats.validCount}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500">Malformed</span>
            <span className={`${stats.invalidCount > 0 ? 'text-rose-500 font-bold' : 'text-zinc-500'} mt-1 text-sm`}>
              {stats.invalidCount}
            </span>
          </div>
        </div>
      )}

      {invalidSamples.length > 0 && (
        <div className="mt-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-400">
          <p className="font-semibold mb-1">Malformed URL format warnings (e.g. must start with https://www.linkedin.com/in/):</p>
          <ul className="list-disc pl-4 space-y-1">
            {invalidSamples.map((sample, idx) => (
              <li key={idx} className="truncate font-mono">{sample}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
