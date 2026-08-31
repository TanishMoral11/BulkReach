import React, { useState } from 'react';
import { Lead } from '../types';

interface ResultsTableProps {
  results: Lead[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedHeader, setCopiedHeader] = useState<string | null>(null);
  const [copiedCell, setCopiedCell] = useState<{ row: number; field: string } | null>(null);

  // Filter out any results that are failed or don't have an email address
  const validResults = results.filter(
    (lead) => lead.status === 'success' && lead.email && lead.email.trim() !== ''
  );

  const filteredResults = validResults.filter((lead) => {
    const term = searchTerm.toLowerCase();
    return (
      (lead.name?.toLowerCase().includes(term) || false) ||
      (lead.company?.toLowerCase().includes(term) || false) ||
      (lead.jobTitle?.toLowerCase().includes(term) || false) ||
      (lead.email?.toLowerCase().includes(term) || false) ||
      lead.linkedinUrl.toLowerCase().includes(term)
    );
  });

  const copyColumn = (field: keyof Lead) => {
    const textToCopy = filteredResults
      .map((lead) => {
        const val = lead[field];
        return val ? String(val) : '';
      })
      .join('\n');

    navigator.clipboard.writeText(textToCopy);
    setCopiedHeader(field);
    setTimeout(() => {
      setCopiedHeader(null);
    }, 1500);
  };

  const copyCell = (text: string, rowIdx: number, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCell({ row: rowIdx, field });
    setTimeout(() => {
      setCopiedCell(null);
    }, 1500);
  };

  const renderHeader = (label: string, field: keyof Lead) => {
    const isCopied = copiedHeader === field;
    return (
      <th className="py-3 px-4 select-none">
        <div className="flex items-center gap-2">
          <span>{label}</span>
          <button
            onClick={() => copyColumn(field)}
            title={`Copy all ${label}s`}
            className="text-zinc-500 hover:text-zinc-300 transition opacity-60 hover:opacity-100 cursor-pointer"
          >
            {isCopied ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-emerald-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            )}
          </button>
        </div>
      </th>
    );
  };

  const renderCellWithCopy = (
    text: string | null | undefined,
    rowIdx: number,
    field: string,
    isLink = false,
    linkHref = '',
    copyText = ''
  ) => {
    if (!text) return <span className="text-zinc-650 font-normal">Not found</span>;
    const isCopied = copiedCell?.row === rowIdx && copiedCell?.field === field;
    const finalCopyText = copyText || text;

    return (
      <div className="flex items-center gap-2 group/cell w-full justify-between">
        {isLink ? (
          <a
            href={linkHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-indigo-400 hover:underline truncate block font-mono flex-1 pr-2"
          >
            {text}
          </a>
        ) : (
          <span className={`truncate flex-1 pr-2 ${field === 'email' ? 'text-blue-400 font-mono select-all' : ''}`}>
            {text}
          </span>
        )}
        <button
          onClick={() => copyCell(finalCopyText, rowIdx, field)}
          title={`Copy this ${field === 'linkedinUrl' ? 'profile link' : field}`}
          className="text-zinc-600 hover:text-blue-400 transition opacity-0 group-hover/cell:opacity-100 focus:opacity-100 cursor-pointer shrink-0 flex items-center justify-center p-0.5 rounded hover:bg-zinc-800"
        >
          {isCopied ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 text-emerald-400">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-md bg-opacity-70 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-blue-400"></span>
          Live Results Table ({validResults.length})
        </h2>
        
        {/* Search Filter */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
          </svg>
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto border border-zinc-850 rounded-xl bg-zinc-950">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-850 bg-zinc-900/50 text-zinc-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center select-none">#</th>
              {renderHeader('Name', 'name')}
              {renderHeader('Email', 'email')}
              {renderHeader('Company', 'company')}
              {renderHeader('Job Title', 'jobTitle')}
              {renderHeader('LinkedIn Profile', 'linkedinUrl')}
              <th className="py-3 px-4 text-right select-none w-24">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850">
            {filteredResults.length > 0 ? (
              filteredResults.map((lead, idx) => (
                <tr key={idx} className="hover:bg-zinc-900/30 transition-colors group">
                  <td className="py-3 px-4 text-center text-zinc-500 font-mono select-none border-r border-zinc-850/50">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-4 text-zinc-200 font-medium truncate max-w-[140px]">
                    {renderCellWithCopy(lead.name, idx, 'name')}
                  </td>
                  <td className="py-3 px-4 max-w-[220px]">
                    {renderCellWithCopy(lead.email, idx, 'email')}
                  </td>
                  <td className="py-3 px-4 text-zinc-300 truncate max-w-[140px]">
                    {renderCellWithCopy(lead.company, idx, 'company')}
                  </td>
                  <td className="py-3 px-4 text-zinc-300 truncate max-w-[160px]">
                    {renderCellWithCopy(lead.jobTitle, idx, 'jobTitle')}
                  </td>
                  <td className="py-3 px-4 max-w-[100px]">
                    {renderCellWithCopy('Profile', idx, 'linkedinUrl', true, lead.linkedinUrl, lead.linkedinUrl)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 select-none">
                      <span className="h-1 w-1 rounded-full bg-emerald-400" />
                      Valid
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-500">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1}
                      stroke="currentColor"
                      className="w-8 h-8 text-zinc-650"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
                    </svg>
                    <span>
                      {validResults.length === 0
                        ? 'No successful leads processed yet. Start the enrichment pipeline to see results here.'
                        : 'No results matches search filter.'}
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
