import React from 'react';
import {
  GitBranch,
  Package,
  FileCheck,
  CheckSquare,
  Cpu,
  Layers,
  ShieldCheck,
  UploadCloud,
  Server,
  HeartPulse,
  Flag,
  CheckCircle2,
  Clock,
  XCircle,
  Slash,
  RefreshCw
} from 'lucide-react';

const STAGE_ICONS = {
  'Checkout': GitBranch,
  'Install dependencies': Package,
  'Lint': FileCheck,
  'Unit tests': CheckSquare,
  'Build application': Cpu,
  'Build Docker image': Layers,
  'Security scan': ShieldCheck,
  'Push Docker image': UploadCloud,
  'Deploy to Kubernetes': Server,
  'Health check': HeartPulse,
  'Deployment completed': Flag
};

export default function PipelineVisualizer({ stages = [], selectedStage, onSelectStage }) {
  // Sort stages by stageOrder
  const sorted = [...stages].sort((a, b) => a.stageOrder - b.stageOrder);

  return (
    <div className="w-full bg-devops-card border border-devops-border rounded-xl p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-devops-border">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Continuous Delivery Pipeline Execution</h3>
          <p className="text-xs text-slate-400">11-Stage Automated Verification, Container Build & Kubernetes Rollout</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Passed</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span> Running</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400"></span> Failed</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-600"></span> Pending</span>
        </div>
      </div>

      {/* Horizontal Scrollable Stages Flow */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="flex items-center min-w-max gap-3 px-2">
          {sorted.map((stage, idx) => {
            const Icon = STAGE_ICONS[stage.stageName] || Layers;
            const isSelected = selectedStage?.id === stage.id;
            const isRunning = stage.status === 'RUNNING';
            const isSuccess = stage.status === 'SUCCESS';
            const isFailed = stage.status === 'FAILED';
            const isCancelled = stage.status === 'CANCELLED';

            let stateColors = 'bg-slate-900 border-devops-border text-slate-400';
            let iconColor = 'text-slate-500';

            if (isSuccess) {
              stateColors = 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200';
              iconColor = 'text-emerald-400';
            } else if (isRunning) {
              stateColors = 'bg-blue-950/40 border-blue-500 text-blue-100 stage-running-glow';
              iconColor = 'text-blue-400';
            } else if (isFailed) {
              stateColors = 'bg-rose-950/40 border-rose-500 text-rose-200';
              iconColor = 'text-rose-400';
            } else if (isCancelled) {
              stateColors = 'bg-slate-900/40 border-slate-700 text-slate-500';
              iconColor = 'text-slate-600';
            }

            return (
              <React.Fragment key={stage.id || idx}>
                {/* Stage Node Box */}
                <div
                  onClick={() => onSelectStage && onSelectStage(stage)}
                  className={`cursor-pointer group flex flex-col items-center justify-between p-3 rounded-lg border transition-all w-36 h-28 relative ${stateColors} ${isSelected ? 'ring-2 ring-brand-500 shadow-lg' : 'hover:border-slate-500'}`}
                >
                  {/* Top Order & Duration */}
                  <div className="w-full flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-500">0{stage.stageOrder}</span>
                    <span className="font-mono text-slate-400">
                      {stage.duration ? `${stage.duration}s` : isRunning ? 'running' : '-'}
                    </span>
                  </div>

                  {/* Icon & Stage Name */}
                  <div className="flex flex-col items-center text-center gap-1.5 my-auto">
                    <div className={`p-1.5 rounded-md ${isSuccess ? 'bg-emerald-500/20' : isRunning ? 'bg-blue-500/20' : 'bg-slate-800'}`}>
                      <Icon className={`w-4 h-4 ${iconColor} ${isRunning ? 'animate-spin' : ''}`} />
                    </div>
                    <span className="text-xs font-medium line-clamp-1 text-slate-200 group-hover:text-white">
                      {stage.stageName}
                    </span>
                  </div>

                  {/* Status Indicator Icon at bottom */}
                  <div className="w-full flex items-center justify-center pt-1 border-t border-slate-800/60">
                    {isSuccess && (
                      <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Passed
                      </span>
                    )}
                    {isRunning && (
                      <span className="text-[10px] font-semibold text-blue-400 flex items-center gap-1 animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" /> In Progress
                      </span>
                    )}
                    {isFailed && (
                      <span className="text-[10px] font-semibold text-rose-400 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                    {isCancelled && (
                      <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                        <Slash className="w-3 h-3" /> Cancelled
                      </span>
                    )}
                    {stage.status === 'PENDING' && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Connecting arrow line */}
                {idx < sorted.length - 1 && (
                  <div className="flex items-center text-slate-700">
                    <div className={`w-4 h-[2px] ${isSuccess ? 'bg-emerald-500/60' : 'bg-slate-800'}`}></div>
                    <div className={`w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent ${isSuccess ? 'border-l-emerald-500/60' : 'border-l-slate-800'}`}></div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
