import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Slash, RefreshCw } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const norm = (status || '').toUpperCase();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  }[size] || 'text-xs px-2.5 py-1';

  let config = {
    bg: 'bg-slate-800/80 text-slate-300 border-slate-700',
    dot: 'bg-slate-400',
    icon: Clock,
    label: norm
  };

  switch (norm) {
    case 'SUCCESS':
    case 'HEALTHY':
    case 'READY':
      config = {
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-400',
        icon: CheckCircle2,
        label: norm === 'HEALTHY' ? 'Healthy' : 'Success'
      };
      break;

    case 'RUNNING':
    case 'DEPLOYING':
      config = {
        bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        dot: 'bg-blue-400 animate-ping',
        icon: RefreshCw,
        label: norm === 'DEPLOYING' ? 'Deploying' : 'Running'
      };
      break;

    case 'FAILED':
    case 'UNHEALTHY':
    case 'ERROR':
      config = {
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        dot: 'bg-rose-400',
        icon: XCircle,
        label: norm === 'UNHEALTHY' ? 'Unhealthy' : 'Failed'
      };
      break;

    case 'DEGRADED':
    case 'WARN':
      config = {
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-400',
        icon: AlertTriangle,
        label: 'Degraded'
      };
      break;

    case 'PENDING':
      config = {
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-400',
        icon: Clock,
        label: 'Pending'
      };
      break;

    case 'CANCELLED':
      config = {
        bg: 'bg-slate-700/40 text-slate-400 border-slate-600/40',
        dot: 'bg-slate-500',
        icon: Slash,
        label: 'Cancelled'
      };
      break;
  }

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${sizeClasses}`}>
      <span className="relative flex h-2 w-2">
        <span className={`inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
      </span>
      <Icon className={`w-3.5 h-3.5 ${norm === 'RUNNING' || norm === 'DEPLOYING' ? 'animate-spin' : ''}`} />
      <span>{config.label}</span>
    </span>
  );
}
