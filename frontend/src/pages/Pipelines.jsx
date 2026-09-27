import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deploymentsAPI } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import {
  GitMerge,
  GitBranch,
  Layers,
  ShieldCheck,
  Server,
  HeartPulse,
  Flag,
  Clock,
  ArrowUpRight,
  Workflow,
  Cpu,
  RefreshCw
} from 'lucide-react';

const PIPELINE_SPEC = [
  { order: 1, name: 'Checkout', desc: 'Fetches Git commit and clones branch into isolated runner workspace', time: '~4s', tool: 'Git CLI' },
  { order: 2, name: 'Install dependencies', desc: 'Deterministic dependency resolution with lockfile verification', time: '~7s', tool: 'NPM / Go Modules' },
  { order: 3, name: 'Lint', desc: 'Static code analysis, code style enforcement, and syntax validation', time: '~5s', tool: 'ESLint / GolangCI' },
  { order: 4, name: 'Unit tests', desc: 'Executes automated unit & integration test suites with coverage gates', time: '~8s', tool: 'Jest / PyTest / Go Test' },
  { order: 5, name: 'Build application', desc: 'Compiles binaries and tree-shakes production web assets', time: '~6s', tool: 'Webpack / esbuild' },
  { order: 6, name: 'Build Docker image', desc: 'Multi-stage container build with non-root security context', time: '~10s', tool: 'Docker BuildKit' },
  { order: 7, name: 'Security scan', desc: 'Static vulnerability scanning on container layers and CVE databases', time: '~6s', tool: 'Trivy / Clair' },
  { order: 8, name: 'Push Docker image', desc: 'Tags and publishes immutable digest to Amazon ECR container registry', time: '~7s', tool: 'AWS ECR / Docker Hub' },
  { order: 9, name: 'Deploy to Kubernetes', desc: 'Rolling update applied to Kubernetes Deployment resource', time: '~12s', tool: 'kubectl / ArgoCD' },
  { order: 10, name: 'Health check', desc: 'Probes HTTP /health liveness and readiness endpoints on pods', time: '~4s', tool: 'k8s Probes' },
  { order: 11, name: 'Deployment completed', desc: 'Traffic shifted 100%, deployment recorded and team notified', time: '~2s', tool: 'CloudDeploy Engine' }
];

export default function Pipelines() {
  const [activeDeployments, setActiveDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActive = async () => {
    try {
      const res = await deploymentsAPI.getAll({ status: 'RUNNING' });
      setActiveDeployments(res.data.data);
    } catch (err) {
      console.error('Failed to load active pipelines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActive();
    const interval = setInterval(fetchActive, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-devops-border">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            CI/CD Delivery Pipeline Architecture
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            11-Stage Continuous Integration & Deployment Workflow Engine
          </p>
        </div>

        <button
          onClick={fetchActive}
          className="p-2 rounded-lg bg-slate-900 border border-devops-border text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Active Running Pipelines Alert */}
      {activeDeployments.length > 0 && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              {activeDeployments.length} Active Pipeline Execution(s) in Progress
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeDeployments.map((dep) => (
              <Link
                key={dep.id}
                to={`/deployments/${dep.id}`}
                className="p-3 rounded-lg bg-slate-900/90 border border-blue-500/20 hover:border-blue-500/50 flex items-center justify-between transition-colors"
              >
                <div>
                  <span className="text-xs font-bold text-white font-mono">{dep.application?.name}</span>
                  <span className="text-[11px] text-slate-400 block font-mono">Target: {dep.version}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status="RUNNING" size="sm" />
                  <ArrowUpRight className="w-4 h-4 text-blue-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 11 Pipeline Stages Master Specification Grid */}
      <div className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Pipeline Execution Stages (Standardized)</h3>
          <p className="text-xs text-slate-400">
            Every deployment strictly follows this deterministic 11-stage delivery model
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PIPELINE_SPEC.map((stg) => (
            <div
              key={stg.order}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center text-xs font-mono font-bold">
                  {stg.order}
                </span>
                <span className="text-[11px] font-mono text-slate-500">{stg.time}</span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-200">{stg.name}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{stg.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Tooling:</span>
                <span className="text-slate-300">{stg.tool}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
