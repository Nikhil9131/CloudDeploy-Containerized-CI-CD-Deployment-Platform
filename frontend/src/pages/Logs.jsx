import React, { useState, useEffect } from 'react';
import { deploymentsAPI, applicationsAPI } from '../services/api';
import TerminalLogs from '../components/common/TerminalLogs';
import { Terminal, RefreshCw, Filter, Layers } from 'lucide-react';

export default function Logs() {
  const [deployments, setDeployments] = useState([]);
  const [selectedDepId, setSelectedDepId] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeployments = async () => {
    try {
      const res = await deploymentsAPI.getAll({ take: 20 });
      setDeployments(res.data.data);
      if (res.data.data.length > 0 && !selectedDepId) {
        setSelectedDepId(res.data.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load deployments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (depId) => {
    if (!depId) return;
    try {
      const res = await deploymentsAPI.getLogs(depId);
      setLogs(res.data.data);
    } catch (err) {
      console.error('Failed to load deployment logs:', err);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, []);

  useEffect(() => {
    if (selectedDepId) {
      fetchLogs(selectedDepId);
      const interval = setInterval(() => fetchLogs(selectedDepId), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedDepId]);

  const activeDep = deployments.find(d => d.id === selectedDepId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-devops-border">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Centralized Pipeline & Cluster Logs
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Streaming stdout/stderr telemetry from continuous integration runners and pod rollouts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLogs(selectedDepId)}
            className="p-2 rounded-lg bg-slate-900 border border-devops-border text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Select Deployment Bar */}
      <div className="bg-devops-card border border-devops-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layers className="w-4 h-4 text-brand-400" />
          <span className="text-xs font-semibold text-slate-300">Target Deployment Stream:</span>
          <select
            value={selectedDepId}
            onChange={(e) => setSelectedDepId(e.target.value)}
            className="bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
          >
            {deployments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.application?.name} • {d.version} ({d.status}) - {new Date(d.createdAt).toLocaleTimeString()}
              </option>
            ))}
          </select>
        </div>

        {activeDep && (
          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>Commit: <strong className="text-brand-400">{activeDep.commitSha?.slice(0, 8)}</strong></span>
            <span>Image: <strong className="text-slate-300 truncate max-w-[200px] inline-block align-bottom">{activeDep.dockerImage}</strong></span>
          </div>
        )}
      </div>

      {/* Terminal View */}
      <TerminalLogs
        logs={logs}
        title={activeDep ? `Logs: ${activeDep.application?.name} (${activeDep.version})` : 'Pipeline Output Stream'}
        maxHeight="h-[600px]"
      />
    </div>
  );
}
