import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Copy, Check, Download, Search, ArrowDown } from 'lucide-react';

export default function TerminalLogs({ logs = [], title = 'Deployment Pipeline Output Logs', maxHeight = 'h-96' }) {
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef(null);

  const filteredLogs = logs.filter(log => {
    const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;
    const matchesSearch = searchQuery === '' || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.stage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  const copyToClipboard = () => {
    const text = filteredLogs.map(l => `[${new Date(l.timestamp).toLocaleTimeString()}] [${l.stage}] [${l.level}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadLogs = () => {
    const text = filteredLogs.map(l => `[${new Date(l.timestamp).toISOString()}] [${l.stage}] [${l.level}] ${l.message}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clouddeploy-logs-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="terminal-window rounded-xl overflow-hidden flex flex-col font-mono text-xs">
      {/* Terminal Title Bar */}
      <div className="terminal-header px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-devops-border">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>
          <Terminal className="w-4 h-4 text-brand-400" />
          <span className="text-slate-300 font-medium font-sans text-xs">{title}</span>
          <span className="text-slate-500 text-[11px] font-mono">({filteredLogs.length} events)</span>
        </div>

        {/* Controls: Search, Filter, Copy, Download */}
        <div className="flex items-center flex-wrap gap-2 text-[11px]">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700/60 rounded px-2 pl-7 py-1 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 w-32 md:w-44 text-xs font-sans"
            />
          </div>

          {/* Level Filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-slate-900 border border-slate-700/60 rounded px-2 py-1 text-slate-300 focus:outline-none focus:border-brand-500 font-sans"
          >
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="WARN">WARN</option>
            <option value="ERROR">ERROR</option>
          </select>

          {/* Auto Scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded border ${autoScroll ? 'bg-brand-500/20 text-brand-400 border-brand-500/40' : 'bg-slate-900 text-slate-400 border-slate-700/60'} hover:text-white transition-colors`}
            title={autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll disabled'}
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>

          {/* Copy */}
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 px-2 py-1 rounded transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="font-sans">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Download */}
          <button
            onClick={downloadLogs}
            className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 px-2 py-1 rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="font-sans">Download</span>
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div
        ref={scrollRef}
        className={`${maxHeight} overflow-y-auto p-4 space-y-1.5 bg-[#06080d] select-text`}
      >
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 italic py-8 text-center">
            {logs.length === 0 ? 'Waiting for pipeline execution logs...' : 'No logs match active filters'}
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const time = new Date(log.timestamp).toLocaleTimeString();
            let levelColor = 'text-slate-400';
            let badgeBg = 'bg-slate-800/80 text-slate-300';

            if (log.level === 'ERROR') {
              levelColor = 'text-rose-400 font-semibold';
              badgeBg = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
            } else if (log.level === 'WARN') {
              levelColor = 'text-amber-300';
              badgeBg = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
            } else if (log.level === 'INFO') {
              levelColor = 'text-slate-200';
              badgeBg = 'bg-blue-500/10 text-blue-300 border border-blue-500/20';
            }

            return (
              <div key={log.id || index} className="flex items-start gap-2 hover:bg-slate-900/40 px-1 py-0.5 rounded leading-relaxed">
                <span className="text-slate-600 select-none text-[11px] shrink-0">{time}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-sans shrink-0 ${badgeBg}`}>
                  {log.stage}
                </span>
                <span className={`break-all ${levelColor}`}>
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
