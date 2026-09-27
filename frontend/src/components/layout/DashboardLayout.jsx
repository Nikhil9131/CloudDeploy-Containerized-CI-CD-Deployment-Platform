import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Modal from '../common/Modal';
import { applicationsAPI } from '../../services/api';

export default function DashboardLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gitRepo: '',
    branch: 'main',
    dockerfilePath: './Dockerfile',
    dockerImage: '',
    environment: 'production',
    namespace: 'default',
    replicas: 2,
    port: 80
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreateApp = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await applicationsAPI.create({
        ...formData,
        replicas: parseInt(formData.replicas, 10),
        port: parseInt(formData.port, 10)
      });
      setIsModalOpen(false);
      navigate(`/applications/${res.data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-devops-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenNewAppModal={() => setIsModalOpen(true)} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet context={{ openNewAppModal: () => setIsModalOpen(true) }} />
        </main>
      </div>

      {/* Global New Application Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Application"
        subtitle="Configure repository, container specifications, and Kubernetes target namespace"
      >
        <form onSubmit={handleCreateApp} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Application Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. checkout-service"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-devops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Environment *</label>
              <select
                value={formData.environment}
                onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                className="w-full bg-slate-900 border border-devops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-sans"
              >
                <option value="production">production</option>
                <option value="staging">staging</option>
                <option value="development">development</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <input
              type="text"
              placeholder="e.g. High-throughput shopping cart settlement service"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-900 border border-devops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub Repository URL *</label>
              <input
                type="url"
                required
                placeholder="https://github.com/org/repo"
                value={formData.gitRepo}
                onChange={(e) => setFormData({ ...formData, gitRepo: e.target.value })}
                className="w-full bg-slate-900 border border-devops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Branch</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full bg-slate-900 border border-devops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Docker Image Target *</label>
              <input
                type="text"
                required
                placeholder="e.g. clouddeploy/checkout-service:v1.0.0"
                value={formData.dockerImage}
                onChange={(e) => setFormData({ ...formData, dockerImage: e.target.value })}
                className="w-full bg-slate-900 border border-devops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dockerfile Path</label>
              <input
                type="text"
                value={formData.dockerfilePath}
                onChange={(e) => setFormData({ ...formData, dockerfilePath: e.target.value })}
                className="w-full bg-slate-900 border border-devops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Kubernetes Namespace</label>
              <input
                type="text"
                value={formData.namespace}
                onChange={(e) => setFormData({ ...formData, namespace: e.target.value })}
                className="w-full bg-slate-900 border border-devops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Replicas</label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.replicas}
                onChange={(e) => setFormData({ ...formData, replicas: e.target.value })}
                className="w-full bg-slate-900 border border-devops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Port</label>
              <input
                type="number"
                min="1"
                max="65535"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                className="w-full bg-slate-900 border border-devops-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-sans"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-devops-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 rounded-lg transition-colors shadow-sm shadow-brand-500/20"
            >
              {submitting ? 'Registering...' : 'Register Application'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
