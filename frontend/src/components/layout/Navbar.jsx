import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Cloud, Shield, Bell, CheckCircle } from 'lucide-react';

export default function Navbar({ onOpenNewAppModal }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 px-6 bg-[#0c101a] border-b border-devops-border flex items-center justify-between sticky top-0 z-30">
      {/* Left: Active Workspace Breadcrumb & AWS Region Badge */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Cloud className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono">aws://us-east-1</span>
          </div>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 font-mono text-[11px]">vpc-07a9b1c</span>
        </div>
      </div>

      {/* Right: Quick Action, Alerts, User Profile & Logout */}
      <div className="flex items-center gap-3">
        {onOpenNewAppModal && (
          <button
            onClick={onOpenNewAppModal}
            className="text-xs font-medium bg-brand-500 hover:bg-brand-600 text-white px-3.5 py-1.5 rounded-lg transition-colors shadow-sm shadow-brand-500/20 flex items-center gap-1.5"
          >
            <span>+ New Application</span>
          </button>
        )}

        {/* User Badge */}
        <div className="flex items-center gap-3 pl-3 border-l border-devops-border">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-200">{user?.name || 'DevOps Engineer'}</span>
            <span className="text-[11px] text-slate-400">{user?.email}</span>
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-brand-400">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            title="Log out of CloudDeploy"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
