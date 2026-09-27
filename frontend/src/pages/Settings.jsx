import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  Shield,
  Layers,
  GitBranch,
  Bell,
  CheckCircle2,
  Key,
  Lock,
  UserCheck
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-devops-border">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          Platform Settings & Integrations
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure container registry endpoints, GitHub Webhooks, IAM roles, and security policies
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Platform configuration updated successfully.</span>
        </div>
      )}

      {/* User Session & Role Profile */}
      <div className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-devops-border pb-3">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-semibold text-white">Active Session & Identity</h3>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${user?.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
            Role: {user?.role || 'DEVELOPER'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span className="text-slate-500 block mb-1">User Name</span>
            <span className="text-white font-bold">{user?.name}</span>
          </div>
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span className="text-slate-500 block mb-1">Corporate Email</span>
            <span className="text-slate-200">{user?.email}</span>
          </div>
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span className="text-slate-500 block mb-1">Authorization Scope</span>
            <span className="text-emerald-400">{user?.role === 'ADMIN' ? 'Full Cluster Admin (All Apps)' : 'Developer (Deployment & Monitoring)'}</span>
          </div>
        </div>
      </div>

      {/* Registry Settings */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-devops-border pb-3">
            <Layers className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-semibold text-white">Container Registry Integration</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Amazon ECR Registry URL</label>
              <input
                type="text"
                defaultValue="123456789012.dkr.ecr.us-east-1.amazonaws.com"
                className="w-full bg-slate-900 border border-devops-border rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Docker Hub Organization</label>
              <input
                type="text"
                defaultValue="clouddeploy"
                className="w-full bg-slate-900 border border-devops-border rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* GitHub Webhook Settings */}
        <div className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-devops-border pb-3">
            <GitBranch className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">GitHub Actions Webhook Gateway</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Webhook Endpoint URL</label>
              <input
                type="text"
                readOnly
                value="https://api.clouddeploy.io/api/deployments/webhook"
                className="w-full bg-slate-900 border border-devops-border rounded-lg px-3 py-2 text-brand-400 font-mono text-xs select-all"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Paste this URL in your repository Settings &gt; Webhooks for automated push triggers.
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Webhook Secret Token</label>
              <input
                type="password"
                defaultValue="whsec_clouddeploy_2026_super_secret_payload_verifier"
                className="w-full bg-slate-900 border border-devops-border rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm shadow-brand-500/20"
          >
            Save Platform Settings
          </button>
        </div>
      </form>
    </div>
  );
}
