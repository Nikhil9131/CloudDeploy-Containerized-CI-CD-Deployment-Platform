import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { monitoringAPI, applicationsAPI, deploymentsAPI } from '../services/api';
import MetricCard from '../components/common/MetricCard';
import StatusBadge from '../components/common/StatusBadge';
import {
  Box,
  Rocket,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Layers,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Server,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [recentDeployments, setRecentDeployments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { openNewAppModal } = useOutletContext() || {};

  const fetchData = async () => {
    try {
      const [metricsRes, depsRes, appsRes] = await Promise.all([
        monitoringAPI.getDashboard(),
        deploymentsAPI.getAll({ take: 5 }),
        applicationsAPI.getAll()
      ]);

      setMetrics(metricsRes.data.data);
      setRecentDeployments(depsRes.data.data);
      setApplications(appsRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard telemetry:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-mono">Loading CloudDeploy cluster telemetry...</span>
      </div>
    );
  }

  const kpis = metrics?.kpis || {};
  const charts = metrics?.charts || {};

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-devops-border">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            DevOps Fleet Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time observability across Docker containers, Kubernetes pods, and CI/CD pipelines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-devops-border text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          {openNewAppModal && (
            <button
              onClick={openNewAppModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-medium transition-colors shadow-sm shadow-brand-500/20"
            >
              <span>+ New App</span>
            </button>
          )}
        </div>
      </div>

      {/* 8 Required KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Applications"
          value={kpis.totalApplications || 0}
          subtext="Active microservices in fleet"
          icon={Box}
          color="blue"
        />
        <MetricCard
          title="Successful Deployments"
          value={kpis.successfulDeployments || 0}
          subtext="Automated releases passed"
          icon={CheckCircle2}
          color="emerald"
        />
        <MetricCard
          title="Failed Deployments"
          value={kpis.failedDeployments || 0}
          subtext="Failed build or health checks"
          icon={XCircle}
          color="rose"
        />
        <MetricCard
          title="Running Deployments"
          value={kpis.runningDeployments || 0}
          subtext="In active rollout pipeline"
          icon={Rocket}
          color="purple"
        />
        <MetricCard
          title="Active Containers"
          value={kpis.activeContainers || 0}
          subtext="Allocated container instances"
          icon={Layers}
          color="cyan"
        />
        <MetricCard
          title="Kubernetes Pods"
          value={kpis.kubernetesPods || 0}
          subtext="Across worker nodes pool"
          icon={Server}
          color="blue"
        />
        <MetricCard
          title="Success Rate"
          value={`${kpis.deploymentSuccessRate || 100}%`}
          subtext="Pipeline reliability index"
          icon={TrendingUp}
          trend={{ positive: (kpis.deploymentSuccessRate || 100) >= 90, value: 'Optimal' }}
          color="emerald"
        />
        <MetricCard
          title="Avg Deployment Time"
          value={`${kpis.avgDeploymentTime || 48}s`}
          subtext="From git push to healthy rollout"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Recharts Analytics Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Deployment Frequency & Success */}
        <div className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Deployment Velocity & Outcomes</h3>
              <p className="text-xs text-slate-400">Total vs Successful vs Failed deployment trends</p>
            </div>
            <span className="text-[11px] font-mono text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">
              Last 7 Days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.deploymentFrequency || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2d47" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1f2d47', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="successful" name="Passed" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="failed" name="Failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Build vs Deployment Duration */}
        <div className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Build & Rollout Latency (Seconds)</h3>
              <p className="text-xs text-slate-400">Docker image creation vs Kubernetes deployment rollout</p>
            </div>
            <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
              Per Release
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.durationTrends || []}>
                <defs>
                  <linearGradient id="buildGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="deployGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2d47" />
                <XAxis dataKey="release" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1f2d47', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="buildDuration" name="Build Duration (s)" stroke="#8b5cf6" fillOpacity={1} fill="url(#buildGrad)" />
                <Area type="monotone" dataKey="deployDuration" name="Deploy Duration (s)" stroke="#0ea5e9" fillOpacity={1} fill="url(#deployGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Live CPU & Memory Telemetry */}
        <div className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Cluster Resource Consumption</h3>
              <p className="text-xs text-slate-400">Kubernetes Nodes CPU & Memory percentage utilization</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Autoscaling Active (HPA 2-10)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.resourceMetrics || []}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2d47" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1f2d47', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="cpuUsage" name="CPU Usage %" stroke="#38bdf8" fillOpacity={1} fill="url(#cpuGrad)" />
                <Area type="monotone" dataKey="memoryUsage" name="Memory Usage %" stroke="#f59e0b" fillOpacity={1} fill="url(#memGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Application Fleet & Recent Deployments Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications Summary */}
        <div className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-devops-border">
            <h3 className="text-sm font-semibold text-white">Managed Applications</h3>
            <Link to="/applications" className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {applications.slice(0, 4).map((app) => (
              <Link
                key={app.id}
                to={`/applications/${app.id}`}
                className="block p-3 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">{app.name}</span>
                  <StatusBadge status={app.status} size="sm" />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{app.currentVersion}</span>
                  <span>{app.replicas} pods</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Deployments Table */}
        <div className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between pb-2 border-b border-devops-border">
            <h3 className="text-sm font-semibold text-white">Recent Deployment Pipeline Runs</h3>
            <Link to="/deployments" className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1">
              View All History <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-2 font-medium">Application</th>
                  <th className="pb-2 font-medium">Version / Commit</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Trigger</th>
                  <th className="pb-2 font-medium">Time</th>
                  <th className="pb-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentDeployments.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 font-medium text-slate-200">
                      {dep.application?.name || 'Unknown app'}
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-slate-400">
                      <span className="text-slate-200 font-semibold">{dep.version}</span>
                      <span className="ml-1 text-slate-500">({dep.commitSha?.slice(0, 7)})</span>
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={dep.status} size="sm" />
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-slate-400">
                      {dep.triggerType}
                    </td>
                    <td className="py-2.5 text-slate-400">
                      {new Date(dep.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 text-right">
                      <Link
                        to={`/deployments/${dep.id}`}
                        className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-medium text-xs"
                      >
                        Inspect <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
