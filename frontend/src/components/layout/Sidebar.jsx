import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  Rocket,
  GitMerge,
  Terminal,
  Server,
  Activity,
  Settings,
  Shield,
  Layers,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/applications', label: 'Applications', icon: Box },
  { path: '/deployments', label: 'Deployments', icon: Rocket },
  { path: '/pipelines', label: 'Pipelines', icon: GitMerge },
  { path: '/logs', label: 'Live Logs', icon: Terminal },
  { path: '/infrastructure', label: 'Infrastructure', icon: Server },
  { path: '/monitoring', label: 'Monitoring', icon: Activity },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-[#0c101a] border-r border-devops-border flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 flex items-center gap-3 border-b border-devops-border bg-devops-bg">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              CloudDeploy
            </span>
            <span className="text-[10px] text-brand-400 font-mono block -mt-0.5">
              CI/CD & Orchestration
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Platform Menu
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Cluster Footer Telemetry */}
      <div className="p-4 border-t border-devops-border bg-[#0a0d15]">
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>EKS Cluster</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Healthy
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
            <span>k8s v1.29.2</span>
            <span>AWS us-east-1</span>
          </div>

          <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Role:</span>
            <span className={`px-1.5 py-0.2 rounded font-semibold ${user?.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
              {user?.role || 'DEVELOPER'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
