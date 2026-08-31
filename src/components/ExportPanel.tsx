import React from 'react';

interface ExportPanelProps {
  resultsCount: number;
  failedCount: number;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ resultsCount, failedCount }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-md bg-opacity-70 flex flex-col justify-center">
      <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2 mb-4">
        <span className="flex h-2.5 w-2.5 rounded-full bg-violet-500"></span>
        Data Export Actions
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* CSV Export Button */}
        <a
          href={resultsCount > 0 ? '/api/export/csv' : undefined}
          onClick={(e) => resultsCount === 0 && e.preventDefault()}
          className={`py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold rounded-xl text-center shadow-lg transition active:scale-[0.98] flex items-center justify-center gap-2 ${
            resultsCount === 0 ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export CSV (Excel)
        </a>

        {/* Failed URLs Export Button */}
        <a
          href={failedCount > 0 ? '/api/export/failed' : undefined}
          onClick={(e) => failedCount === 0 && e.preventDefault()}
          className={`py-3 px-4 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-750 font-semibold rounded-xl text-center transition active:scale-[0.98] flex items-center justify-center gap-2 ${
            failedCount === 0 ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
          </svg>
          Export Failed URLs
        </a>
      </div>

      {resultsCount > 0 && (
        <p className="text-zinc-500 text-xs text-center mt-3">
          {resultsCount} lead records available for download.
        </p>
      )}
    </div>
  );
};
