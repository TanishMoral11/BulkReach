import React, { useState } from 'react';
import { Lead } from '../types';

interface ResultsTableProps {
  results: Lead[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResults = results.filter((lead) => {
    const term = searchTerm.toLowerCase();
    return (
      (lead.name?.toLowerCase().includes(term) || false) ||
      (lead.company?.toLowerCase().includes(term) || false) ||
      (lead.email?.toLowerCase().includes(term) || false) ||
      lead.linkedinUrl.toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-md bg-opacity-70 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-blue-400"></span>
          Live Results Table ({results.length})
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
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">LinkedIn Profile</th>
              <th className="py-3 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850">
            {filteredResults.length > 0 ? (
              filteredResults.map((lead, idx) => (
                <tr key={idx} className="hover:bg-zinc-900/30 transition-colors group">
                  <td className="py-3 px-4 text-zinc-200 font-medium truncate max-w-[150px]">
                    {lead.name || <span className="text-zinc-600 font-normal">Not found</span>}
                  </td>
                  <td className="py-3 px-4 text-zinc-300 truncate max-w-[180px]">
                    {lead.company || <span className="text-zinc-600">Not found</span>}
                  </td>
                  <td className="py-3 px-4 font-mono select-all">
                    {lead.email ? (
                      <span className="text-blue-400 hover:underline cursor-pointer">{lead.email}</span>
                    ) : (
                      <span className="text-zinc-600">Empty / Not found</span>
                    )}
                  </td>
                  <td className="py-3 px-4 max-w-[200px]">
                    <a
                      href={lead.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-indigo-400 hover:underline truncate block font-mono"
                    >
                      {lead.linkedinUrl}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {lead.status === 'success' ? (
                      lead.email ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="h-1 w-1 rounded-full bg-emerald-400" />
                          Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-400 border border-zinc-700">
                          <span className="h-1 w-1 rounded-full bg-zinc-400" />
                          No Email
                        </span>
                      )
                    ) : (
                      <span
                        title={lead.error}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-help"
                      >
                        <span className="h-1 w-1 rounded-full bg-rose-400" />
                        Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-zinc-500">
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
                      {results.length === 0
                        ? 'No leads processed yet. Start the enrichment pipeline to see results here.'
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
