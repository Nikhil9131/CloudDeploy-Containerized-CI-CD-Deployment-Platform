import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { applicationsAPI, deploymentsAPI } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import {
  Box,
  GitBranch,
  Rocket,
  Search,
  Server,
  Layers,
  ExternalLink,
  Plus,
  RefreshCw,
  Sliders,
  AlertTriangle
} from 'lucide-react';

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [envFilter, setEnvFilter] = useState('ALL');
  const [triggeringId, setTriggeringId] = useState(null);
  const { openNewAppModal } = useOutletContext() || {};

  const fetchApps = async () => {
    try {
      const res = await applicationsAPI.getAll();
      setApps(res.data.data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleQuickDeploy = async (e, app) => {
    e.preventDefault();
    e.stopPropagation();
    setTriggeringId(app.id);

    try {
      await applicationsAPI.deploy(app.id);
      await fetchApps();
    } catch (err) {
      alert(`Deployment failed to trigger: ${err.message}`);
    } finally {
      setTriggeringId(null);
    }
  };

  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.gitRepo.toLowerCase().includes(search.toLowerCase()) ||
      app.dockerImage.toLowerCase().includes(search.toLowerCase());
    const matchesEnv = envFilter === 'ALL' || app.environment === envFilter;
    return matchesSearch && matchesEnv;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-devops-border">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Application Catalog</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Registered containerized microservices managed across Kubernetes clusters
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchApps}
            className="p-2 rounded-lg bg-slate-900 border border-devops-border text-slate-300 hover:text-white transition-colors"
            title="Refresh applications"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {openNewAppModal && (
            <button
              onClick={openNewAppModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-medium transition-colors shadow-sm shadow-brand-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Application</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-devops-card p-3 rounded-xl border border-devops-border">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by app name, repo, or Docker image..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-sans"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Environment:</span>
          <select
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">All Environments</option>
            <option value="production">production</option>
            <option value="staging">staging</option>
            <option value="development">development</option>
          </select>
        </div>
      </div>

      {/* Applications Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="bg-devops-card border border-devops-border rounded-xl p-12 text-center space-y-3">
          <Box className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No Applications Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No microservices matched your search criteria. Create a new application to initiate containerized CI/CD.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-devops-card border border-devops-border hover:border-devops-hover rounded-xl p-5 shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight hover:text-brand-400 transition-colors">
                      <Link to={`/applications/${app.id}`}>{app.name}</Link>
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400 uppercase">
                      env: {app.environment}
                    </span>
                  </div>
                  <StatusBadge status={app.status} size="sm" />
                </div>

                <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                  {app.description || 'No description configured.'}
                </p>

                {/* Microservice Specs */}
                <div className="mt-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                      Branch
                    </span>
                    <span className="font-mono text-slate-300">{app.branch}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      Docker Image
                    </span>
                    <span className="font-mono text-slate-300 truncate max-w-[160px]" title={app.dockerImage}>
                      {app.dockerImage}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-slate-400" />
                      k8s Pod Replicas
                    </span>
                    <span className="font-mono text-emerald-400 font-semibold">{app.replicas} active</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                    <span className="text-slate-500">Live Release</span>
                    <span className="font-mono font-bold text-brand-400">{app.currentVersion}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-devops-border flex items-center justify-between gap-2">
                <Link
                  to={`/applications/${app.id}`}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </Link>

                <button
                  onClick={(e) => handleQuickDeploy(e, app)}
                  disabled={triggeringId === app.id || app.status === 'DEPLOYING'}
                  className="px-3.5 py-1.5 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Rocket className={`w-3.5 h-3.5 ${triggeringId === app.id ? 'animate-bounce' : ''}`} />
                  <span>{triggeringId === app.id ? 'Starting...' : 'Deploy Now'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
