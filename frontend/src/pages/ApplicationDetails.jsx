import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { applicationsAPI, deploymentsAPI, infrastructureAPI } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import {
  Box,
  GitBranch,
  Rocket,
  Server,
  Layers,
  Activity,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Sliders,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

export default function ApplicationDetails() {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [deployments, setDeployments] = useState([]);
  const [clusterInfo, setClusterInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scaling, setScaling] = useState(false);
  const [replicaInput, setReplicaInput] = useState(2);
  const [deploying, setDeploying] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const navigate = useNavigate();

  const fetchAppData = async () => {
    try {
      const [appRes, depsRes, clusterRes] = await Promise.all([
        applicationsAPI.getById(id),
        applicationsAPI.getDeployments(id),
        infrastructureAPI.getCluster()
      ]);
      setApp(appRes.data.data);
      setReplicaInput(appRes.data.data.replicas);
      setDeployments(depsRes.data.data);
      setClusterInfo(clusterRes.data.data);
    } catch (err) {
      console.error('Failed to load application details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppData();
    const interval = setInterval(fetchAppData, 8000);
    return () => clearInterval(interval);
  }, [id]);

  const handleDeploy = async (simulateFailure = false) => {
    setDeploying(true);
    try {
      const res = await applicationsAPI.deploy(id, { simulateFailure });
      navigate(`/deployments/${res.data.data.id}`);
    } catch (err) {
      alert(`Deployment failed: ${err.message}`);
    } finally {
      setDeploying(false);
    }
  };

  const handleScale = async () => {
    setScaling(true);
    try {
      await applicationsAPI.scale(id, parseInt(replicaInput, 10));
      await fetchAppData();
    } catch (err) {
      alert(`Scaling error: ${err.message}`);
    } finally {
      setScaling(false);
    }
  };

  const handleSimulateFailure = async () => {
    setSimulating(true);
    try {
      await applicationsAPI.simulateFailure(id);
      await fetchAppData();
    } catch (err) {
      alert(`Error simulating failure: ${err.message}`);
    } finally {
      setSimulating(false);
    }
  };

  if (loading || !app) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-mono">Loading application specifications...</span>
      </div>
    );
  }

  // Filter pods for this application from cluster
  const appPods = (clusterInfo?.pods || []).filter(p => p.applicationId === app.id || p.applicationName === app.name);

  return (
    <div className="space-y-6">
      {/* Top Navigation & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-devops-border">
        <div className="flex items-center gap-3">
          <Link
            to="/applications"
            className="p-2 rounded-lg bg-slate-900 border border-devops-border text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">{app.name}</h1>
              <StatusBadge status={app.status} size="sm" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{app.description || 'Enterprise microservice'}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDeploy(false)}
            disabled={deploying || app.status === 'DEPLOYING'}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm shadow-brand-500/20"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>{deploying ? 'Deploying...' : 'Trigger Deployment'}</span>
          </button>

          <button
            onClick={() => handleDeploy(true)}
            disabled={deploying}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-medium transition-colors"
            title="Triggers a deployment with simulated test failure to test rollback"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Simulate Pipeline Failure</span>
          </button>
        </div>
      </div>

      {/* Grid: App Specifications & Scaling Control */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Specification Card */}
        <div className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-white border-b border-devops-border pb-2">
            Microservice Configuration & Metadata
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-500 font-medium">GitHub Repository</span>
              <a
                href={app.gitRepo}
                target="_blank"
                rel="noreferrer"
                className="text-brand-400 hover:underline flex items-center gap-1 font-mono break-all"
              >
                {app.gitRepo} <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-500 font-medium">Git Branch / Live Commit</span>
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-200">{app.branch}</span>
                <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                  {app.currentCommit || 'init'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-500 font-medium">Container Image Target</span>
              <span className="block font-mono text-slate-200 break-all">{app.dockerImage}</span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-500 font-medium">K8s Namespace / Ingress Port</span>
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-200">{app.namespace}</span>
                <span className="text-brand-400 font-bold">Port {app.port}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Replica Scaling Control */}
        <div className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-devops-border pb-2">
              <h3 className="text-sm font-semibold text-white">Kubernetes Autoscaling</h3>
              <span className="text-[11px] font-mono text-emerald-400">HPA Enabled</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Scale container replicas horizontally. Demonstrates immediate pod creation across worker nodes.
            </p>

            <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">Desired Replicas</span>
                <span className="text-base font-bold font-mono text-brand-400">{replicaInput} Pods</span>
              </div>

              <input
                type="range"
                min="1"
                max="10"
                value={replicaInput}
                onChange={(e) => setReplicaInput(parseInt(e.target.value, 10))}
                className="w-full accent-brand-500 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 pod (min)</span>
                <span>5 pods</span>
                <span>10 pods (max)</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleScale}
            disabled={scaling || replicaInput === app.replicas}
            className="w-full py-2 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
          >
            {scaling ? 'Updating Deployment...' : `Apply Scale to ${replicaInput} Replicas`}
          </button>
        </div>
      </div>

      {/* Kubernetes Active Pods Table */}
      <div className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-devops-border pb-2">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-semibold text-white">Active Kubernetes Pods ({appPods.length})</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Namespace: {app.namespace}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-2 font-medium">Pod Name</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Ready</th>
                <th className="pb-2 font-medium">Restarts</th>
                <th className="pb-2 font-medium">Pod IP</th>
                <th className="pb-2 font-medium">Node</th>
                <th className="pb-2 font-medium">CPU / Memory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {appPods.map((pod) => (
                <tr key={pod.id} className="hover:bg-slate-900/40">
                  <td className="py-2.5 font-medium text-slate-200">{pod.name}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      pod.status === 'Running' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {pod.status}
                    </span>
                  </td>
                  <td className="py-2.5">{pod.ready}</td>
                  <td className="py-2.5 text-slate-400">{pod.restarts}</td>
                  <td className="py-2.5 text-slate-400">{pod.ip}</td>
                  <td className="py-2.5 text-slate-400 truncate max-w-[140px]">{pod.node}</td>
                  <td className="py-2.5 text-brand-400">{pod.cpuUsage} / {pod.memoryUsage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deployment History Table */}
      <div className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-devops-border pb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Deployment Pipeline History ({deployments.length})</h3>
          </div>
          <span className="text-xs text-slate-400">Chronological release log</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-2 font-medium">Release Version</th>
                <th className="pb-2 font-medium">Commit SHA</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Trigger Mode</th>
                <th className="pb-2 font-medium">Duration</th>
                <th className="pb-2 font-medium">Timestamp</th>
                <th className="pb-2 font-medium text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {deployments.map((dep) => (
                <tr key={dep.id} className="hover:bg-slate-900/40">
                  <td className="py-2.5 font-bold text-white font-mono">{dep.version}</td>
                  <td className="py-2.5 font-mono text-[11px] text-slate-400">{dep.commitSha?.slice(0, 8)}</td>
                  <td className="py-2.5">
                    <StatusBadge status={dep.status} size="sm" />
                  </td>
                  <td className="py-2.5 font-mono text-slate-400">{dep.triggerType}</td>
                  <td className="py-2.5 font-mono text-slate-400">
                    {(dep.buildDuration || 0) + (dep.deploymentDuration || 0)}s
                  </td>
                  <td className="py-2.5 text-slate-400">{new Date(dep.createdAt).toLocaleString()}</td>
                  <td className="py-2.5 text-right">
                    <Link
                      to={`/deployments/${dep.id}`}
                      className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-medium"
                    >
                      Pipeline Run <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
