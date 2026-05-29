/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trash2, FileOutput, Calendar, Clock, Download, PlusCircle, Bookmark, Clipboard } from 'lucide-react';
import { HistoryRecord } from '../types';

interface HistoryProps {
  records: HistoryRecord[];
  onClearHistory: () => void;
  onDeleteRecord: (id: string) => void;
  onSelectRecord: (record: HistoryRecord) => void;
}

export default function HistorySidebar({ records, onClearHistory, onDeleteRecord, onSelectRecord }: HistoryProps) {
  
  const formatInputOutput = (record: HistoryRecord) => {
    // Generate simple printable or copyable layout summary
    let summaryText = `--- TRADING CALCULATOR RECORD: ${record.title} ---\n`;
    summaryText += `Timestamp: ${record.timestamp}\n\n`;
    summaryText += `[Inputs]:\n`;
    Object.entries(record.inputs).forEach(([k, v]) => {
      summaryText += `  ${k}: ${v}\n`;
    });
    summaryText += `\n[Outputs]:\n`;
    Object.entries(record.outputs).forEach(([k, v]) => {
      const val = typeof v === 'number' ? v.toFixed(2) : v;
      summaryText += `  ${k}: ${val}\n`;
    });
    return summaryText;
  };

  const copyToClipboard = (record: HistoryRecord) => {
    const text = formatInputOutput(record);
    navigator.clipboard.writeText(text);
    alert('Analysis summary copied to clipboard!');
  };

  const handleExportPDF = () => {
    // Open system print dialog configured nicely for the document
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "trading-calculator-history.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-[#111114] border border-slate-800/80 rounded-2xl p-5 flex flex-col h-full overflow-hidden shrink-0">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h3 className="font-bold text-slate-200 text-sm tracking-wider uppercase flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-emerald-400" />
          Saved Setups ({records.length})
        </h3>
        {records.length > 0 && (
          <button 
            onClick={onClearHistory}
            className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition uppercase tracking-wider flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-[#18181B]/10">
          <Clipboard className="w-8 h-8 text-slate-700 mb-2" />
          <p className="text-xs text-slate-500 font-medium">No saved setups yet.</p>
          <p className="text-[10px] text-slate-600 mt-1 max-w-[200px]">Perform calculations and click "Save" to build your offline trading log.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5 custom-scrollbar">
          {records.map((record) => (
            <div 
              key={record.id}
              onClick={() => onSelectRecord(record)}
              className="group bg-[#18181B]/50 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-3.5 transition cursor-pointer relative flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2">
                  <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-[#111114] border border-slate-800/80 text-emerald-450 text-emerald-400">
                    {record.type}
                  </span>
                  
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition shrink-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); copyToClipboard(record); }}
                      className="p-1 rounded bg-[#111114] hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition" 
                      title="Copy Raw Analysis"
                    >
                      <Clipboard className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteRecord(record.id); }}
                      className="p-1 rounded bg-[#111114] hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition" 
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-xs text-slate-200 mt-1.5 truncate group-hover:text-emerald-400 transition">
                  {record.title}
                </h4>

                {/* Tiny summary list */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 pt-2 border-t border-slate-900 text-[10px] text-slate-500">
                  {Object.entries(record.inputs).slice(0, 2).map(([k, v]) => (
                    <div key={k} className="truncate">
                      <span className="capitalize">{k}:</span> <span className="font-mono text-slate-400 font-semibold">{typeof v === 'number' ? v.toFixed(1) : v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mt-3 text-[9px] text-slate-600 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" />
                  {record.timestamp.split('T')[0]}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {record.timestamp.split('T')[1]?.slice(0, 5) || ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {records.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2.5 shrink-0">
          <button 
            onClick={handleDownloadJSON}
            className="py-1.5 px-2.5 bg-[#18181B] hover:bg-[#202024] text-slate-400 hover:text-slate-100 border border-slate-800/80 rounded-lg text-[10px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-3 h-3" />
            JSON Export
          </button>
          <button 
            onClick={handleExportPDF}
            className="py-1.5 px-2.5 bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-black border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1.5"
          >
            <FileOutput className="w-3 h-3" />
            Print / PDF
          </button>
        </div>
      )}
    </div>
  );
}
