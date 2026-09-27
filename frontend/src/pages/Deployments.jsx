import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { deploymentsAPI, applicationsAPI } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import {
  Rocket,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ArrowUpRight,
  GitBranch,
  Layers,
  Clock,
  RotateCcw
} from 'lucide-react';

export default function Deployments() {
  const [deployments, setDeployments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [branchInput, setBranchInput] = useState('main');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [triggering, setTriggering] = useState(false);

  const fetchData = async () => {
    try {
      const [depsRes, appsRes] = await Promise.all([
        deploymentsAPI.getAll(),
        applicationsAPI.getAll()
      ]);
      setDeployments(depsRes.data.data);
      setApplications(appsRes.data.data);
      if (appsRes.data.data.length > 0 && !selectedAppId) {
        setSelectedAppId(appsRes.data.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load deployments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleTrigger = async (e) => {
    e.preventDefault();
    if (!selectedAppId) return;
    setTriggering(true);

    try {
      const res = await deploymentsAPI.trigger({
        applicationId: selectedAppId,
        branch: branchInput,
        simulateFailure
      });
      setIsTriggerModalOpen(false);
      window.location.href = `/deployments/${res.data.data.id}`;
    } catch (err) {
      alert(`Trigger failed: ${err.message}`);
    } finally {
      setTriggering(false);
    }
  };

  const filtered = deployments.filter((d) => {
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesSearch = search === '' ||
      d.application?.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.version?.toLowerCase().includes(search.toLowerCase()) ||
      d.commitSha?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-devops-border">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Deployment Pipeline Releases
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail of automated builds, image pushes, Kubernetes rollouts, and rollbacks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-slate-900 border border-devops-border text-slate-300 hover:text-white transition-colors"
            title="Refresh deployments"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsTriggerModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm shadow-brand-500/20"
          >
            <Rocket className="w-4 h-4" />
            <span>Trigger Deployment</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-devops-card p-3 rounded-xl border border-devops-border">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by application, version, or commit SHA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-brand-500 font-sans"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="RUNNING">RUNNING</option>
            <option value="FAILED">FAILED</option>
            <option value="PENDING">PENDING</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Deployments Table */}
      <div className="bg-devops-card border border-devops-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No deployments match active filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b0f19] text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Application</th>
                  <th className="py-3 px-4 font-semibold">Release Version</th>
                  <th className="py-3 px-4 font-semibold">Commit SHA</th>
                  <th className="py-3 px-4 font-semibold">Docker Image Tag</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Trigger Type</th>
                  <th className="py-3 px-4 font-semibold">Duration</th>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((dep) => (
                  <tr key={dep.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-white">
                      <Link to={`/applications/${dep.applicationId}`} className="hover:text-brand-400">
                        {dep.application?.name || 'app'}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">
                      {dep.version}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {dep.commitSha?.slice(0, 8)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 truncate max-w-[180px]" title={dep.dockerImage}>
                      {dep.dockerImage}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={dep.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      <span className={`px-2 py-0.5 rounded ${dep.triggerType === 'ROLLBACK' ? 'bg-purple-500/20 text-purple-300 font-bold' : 'bg-slate-800 text-slate-300'}`}>
                        {dep.triggerType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {(dep.buildDuration || 0) + (dep.deploymentDuration || 0)}s
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(dep.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/deployments/${dep.id}`}
                        className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-semibold"
                      >
                        Inspect Pipeline <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trigger Deployment Modal */}
      <Modal
        isOpen={isTriggerModalOpen}
        onClose={() => setIsTriggerModalOpen(false)}
        title="Trigger CI/CD Deployment Pipeline"
        subtitle="Executes 11 automated stages: checkout, test, docker build, vulnerability scan, and k8s rollout"
      >
        <form onSubmit={handleTrigger} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Application *</label>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full bg-slate-900 border border-devops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
            >
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name} (live: {app.currentVersion})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Git Branch</label>
            <input
              type="text"
              value={branchInput}
              onChange={(e) => setBranchInput(e.target.value)}
              className="w-full bg-slate-900 border border-devops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Simulate Pipeline Failure</span>
              <span className="text-[11px] text-slate-400">Fails unit tests (Stage 4) to demonstrate rollback recovery</span>
            </div>
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
              className="w-4 h-4 accent-rose-500 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-devops-border">
            <button
              type="button"
              onClick={() => setIsTriggerModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={triggering}
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 rounded-lg shadow-sm shadow-brand-500/20"
            >
              {triggering ? 'Initiating Pipeline...' : 'Start Pipeline Execution'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
