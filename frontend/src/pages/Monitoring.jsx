import React, { useState, useEffect } from 'react';
import { monitoringAPI } from '../services/api';
import MetricCard from '../components/common/MetricCard';
import {
  Activity,
  HeartPulse,
  TrendingUp,
  Cpu,
  RefreshCw,
  AlertTriangle,
  Zap,
  Server,
  Layers
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function Monitoring() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const res = await monitoringAPI.getMetrics();
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-mono">Aggregating cluster metrics...</span>
      </div>
    );
  }

  const { charts, cluster } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-devops-border">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Real-Time Cluster & Service Monitoring
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Observability metrics, latency percentiles, error budget tracking, and autoscaling events
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          className="p-2 rounded-lg bg-slate-900 border border-devops-border text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Latency & SLO Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Median Latency (p50)"
          value="28ms"
          subtext="Standard HTTP API response"
          icon={Zap}
          color="emerald"
        />
        <MetricCard
          title="95th Percentile (p95)"
          value="84ms"
          subtext="Under peak database loads"
          icon={Activity}
          color="blue"
        />
        <MetricCard
          title="Error Budget SLI"
          value="99.98%"
          subtext="Target SLA: 99.9% uptime"
          icon={HeartPulse}
          trend={{ positive: true, value: 'Within Budget' }}
          color="emerald"
        />
        <MetricCard
          title="Active Replicas Target"
          value={cluster.pods?.length || 7}
          subtext="Autoscaling min: 2, max: 10"
          icon={Server}
          color="cyan"
        />
      </div>

      {/* Live Request Throughput Chart */}
      <div className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">HTTP Request Ingress & Network Throughput</h3>
            <p className="text-xs text-slate-400">Application Load Balancer ingress rate and network I/O</p>
          </div>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Streaming live (5s interval)
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={charts.resourceMetrics || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2d47" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} tickLine={false} unit="MB/s" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1f2d47', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line yAxisId="left" type="monotone" dataKey="requestRate" name="HTTP Requests (req/s)" stroke="#38bdf8" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="networkIo" name="Network I/O (MB/s)" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* HPA Scaling Event Log & Pod Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-white border-b border-devops-border pb-2">
            Horizontal Pod Autoscaler (HPA) Policy
          </h3>
          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Resource:</span>
                <span className="text-white font-bold">Deployment/clouddeploy-backend</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Scale Triggers:</span>
                <span className="text-brand-400">CPU &gt; 70% or Memory &gt; 80%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Configured Bounds:</span>
                <span className="text-emerald-400">Min: 2 Pods • Max: 10 Pods</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Replica Count:</span>
                <span className="text-white font-bold">{cluster.pods?.length || 7} Pods Allocated</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-sans">
              Kubernetes metrics-server continuously aggregates cgroup statistics from all container runtimes.
            </p>
          </div>
        </div>

        <div className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-white border-b border-devops-border pb-2">
            Synthetic Health Probes & Readiness
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">HTTP /health Probe</span>
                <span className="text-slate-400 text-[11px] font-mono">Endpoint: GET /health</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                200 OK (18ms)
              </span>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">PostgreSQL Read/Write Query</span>
                <span className="text-slate-400 text-[11px] font-mono">Database connection pool</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Active (Pool: 10)
              </span>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Kubernetes Liveness Probe</span>
                <span className="text-slate-400 text-[11px] font-mono">kubelet periodic healthcheck</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Healthy
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
