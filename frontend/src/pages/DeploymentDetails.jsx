import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { deploymentsAPI } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import PipelineVisualizer from '../components/common/PipelineVisualizer';
import TerminalLogs from '../components/common/TerminalLogs';
import {
  Rocket,
  ArrowLeft,
  RotateCcw,
  Slash,
  RefreshCw,
  GitBranch,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldAlert,
  Server
} from 'lucide-react';

export default function DeploymentDetails() {
  const { id } = useParams();
  const [deployment, setDeployment] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rollingBack, setRollingBack] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const navigate = useNavigate();

  const fetchDeployment = async () => {
    try {
      const res = await deploymentsAPI.getById(id);
      setDeployment(res.data.data);
      if (!selectedStage && res.data.data.stages?.length > 0) {
        // default select currently running stage, or first failed, or last
        const running = res.data.data.stages.find(s => s.status === 'RUNNING');
        const failed = res.data.data.stages.find(s => s.status === 'FAILED');
        setSelectedStage(running || failed || res.data.data.stages[0]);
      }
    } catch (err) {
      console.error('Failed to load deployment pipeline details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployment();
    // Poll continuously while deployment is RUNNING or PENDING
    const interval = setInterval(() => {
      if (deployment?.status === 'RUNNING' || deployment?.status === 'PENDING') {
        fetchDeployment();
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [id, deployment?.status]);

  const handleRollback = async () => {
    if (!window.confirm(`Initiate automated rollback for application ${deployment.application?.name}?`)) {
      return;
    }
    setRollingBack(true);
    try {
      const res = await deploymentsAPI.rollback(id);
      navigate(`/deployments/${res.data.data.id}`);
    } catch (err) {
      alert(`Rollback initiation failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setRollingBack(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await deploymentsAPI.cancel(id);
      await fetchDeployment();
    } catch (err) {
      alert(`Cancel failed: ${err.message}`);
    } finally {
      setCancelling(false);
    }
  };

  if (loading || !deployment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-mono">Loading CI/CD deployment pipeline...</span>
      </div>
    );
  }

  const isRunning = deployment.status === 'RUNNING' || deployment.status === 'PENDING';
  const isFailed = deployment.status === 'FAILED';
  const totalDuration = (deployment.buildDuration || 0) + (deployment.deploymentDuration || 0);

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-devops-border">
        <div className="flex items-center gap-3">
          <Link
            to="/deployments"
            className="p-2 rounded-lg bg-slate-900 border border-devops-border text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight font-mono">
                {deployment.application?.name} / {deployment.version}
              </h1>
              <StatusBadge status={deployment.status} size="sm" />
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Pipeline Run ID: {deployment.id} • Triggered via {deployment.triggerType}
            </p>
          </div>
        </div>

        {/* Dynamic Pipeline Action Controls: Rollback, Cancel, Sync */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDeployment}
            className="p-2 rounded-lg bg-slate-900 border border-devops-border text-slate-300 hover:text-white transition-colors"
            title="Refresh pipeline status"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          </button>

          {isRunning && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              <Slash className="w-3.5 h-3.5" />
              <span>Cancel Pipeline</span>
            </button>
          )}

          {/* Rollback Button (Section 15) */}
          <button
            onClick={handleRollback}
            disabled={rollingBack || isRunning}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              isFailed
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25 animate-pulse'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25'
            } disabled:opacity-50`}
            title="Automatically rolls back to the last stable release and triggers a Kubernetes rollback rollout"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${rollingBack ? 'animate-spin' : ''}`} />
            <span>{rollingBack ? 'Initiating Rollback...' : 'Rollback to Previous Version'}</span>
          </button>
        </div>
      </div>

      {/* Rollback Alert Banner if applicable */}
      {deployment.rolledBackFrom && (
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between gap-3 text-xs text-purple-300">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              This deployment is an automated rollback reverting failure from run{' '}
              <span className="font-mono font-bold text-white">{deployment.rolledBackFrom}</span>.
            </span>
          </div>
          <Link
            to={`/deployments/${deployment.rolledBackFrom}`}
            className="text-purple-400 hover:text-purple-200 underline font-medium font-mono shrink-0"
          >
            Inspect Failed Run
          </Link>
        </div>
      )}

      {/* Pipeline Visualizer (11 Stages) */}
      <PipelineVisualizer
        stages={deployment.stages || []}
        selectedStage={selectedStage}
        onSelectStage={(stage) => setSelectedStage(stage)}
      />

      {/* Deployment Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-devops-card border border-devops-border rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Commit & Branch</span>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-200 flex items-center gap-1">
              <GitBranch className="w-3.5 h-3.5 text-brand-400" />
              {deployment.branch}
            </span>
            <span className="text-brand-400 bg-slate-900 px-2 py-0.5 rounded">
              {deployment.commitSha?.slice(0, 8)}
            </span>
          </div>
        </div>

        <div className="bg-devops-card border border-devops-border rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Docker Image</span>
          <div className="text-xs font-mono text-slate-300 truncate" title={deployment.dockerImage}>
            {deployment.dockerImage}
          </div>
        </div>

        <div className="bg-devops-card border border-devops-border rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pipeline Duration</span>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Total: {totalDuration}s</span>
            <span className="text-slate-500">Build: {deployment.buildDuration}s</span>
          </div>
        </div>

        <div className="bg-devops-card border border-devops-border rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Target Namespace</span>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">{deployment.application?.namespace || 'default'}</span>
            <span className="text-emerald-400 font-bold">{deployment.application?.environment}</span>
          </div>
        </div>
      </div>

      {/* Selected Stage Detail Panel */}
      {selectedStage && (
        <div className="bg-devops-card border border-devops-border rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-brand-400 font-mono font-bold">
              Stage {selectedStage.stageOrder}
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{selectedStage.stageName}</h4>
              <p className="text-slate-400 text-xs">{selectedStage.logs || 'Verification and execution complete.'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>Duration: <strong className="text-slate-200">{selectedStage.duration || 0}s</strong></span>
            <span>Started: {selectedStage.startedAt ? new Date(selectedStage.startedAt).toLocaleTimeString() : '-'}</span>
            <StatusBadge status={selectedStage.status} size="sm" />
          </div>
        </div>
      )}

      {/* Terminal Deployment Log Stream (Section 20) */}
      <TerminalLogs
        logs={deployment.logs || []}
        title={`Live Pipeline Execution Stream [Run ${deployment.id.slice(0, 12)}]`}
        maxHeight="h-[440px]"
      />
    </div>
  );
}
