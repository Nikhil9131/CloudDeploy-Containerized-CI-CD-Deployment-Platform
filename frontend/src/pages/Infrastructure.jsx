import React, { useState, useEffect } from 'react';
import { infrastructureAPI } from '../services/api';
import {
  Server,
  Cloud,
  HardDrive,
  Shield,
  Network,
  Cpu,
  RefreshCw,
  ExternalLink,
  Layers,
  Lock,
  CheckCircle2
} from 'lucide-react';

export default function Infrastructure() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ec2');

  const fetchInfra = async () => {
    try {
      const res = await infrastructureAPI.getDetails();
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load infrastructure details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfra();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-mono">Querying cloud infrastructure topology...</span>
      </div>
    );
  }

  const { aws, kubernetes } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-devops-border">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Cloud Infrastructure & Kubernetes Topology
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Provisioned AWS EC2 compute, S3 artifact buckets, IAM least-privilege policies, and EKS node groups
          </p>
        </div>

        {/* Provider Mode Banner (Section 27 compliance) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
            <Cloud className="w-3.5 h-3.5 text-amber-400" />
            <span>Mode: {aws.mode?.toUpperCase()} ({aws.region})</span>
          </div>
          <button
            onClick={fetchInfra}
            className="p-2 rounded-lg bg-slate-900 border border-devops-border text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Infrastructure KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-devops-card border border-devops-border rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">AWS EC2 Instances</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{aws.ec2Instances?.length || 3}</span>
            <span className="text-xs text-emerald-400 font-mono">100% Running</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">t3.xlarge / m6i.2xlarge</span>
        </div>

        <div className="bg-devops-card border border-devops-border rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Kubernetes Nodes</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{kubernetes.totalNodes || 3}</span>
            <span className="text-xs text-emerald-400 font-mono">v1.29.2 Ready</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">{kubernetes.totalPods} Active Pods</span>
        </div>

        <div className="bg-devops-card border border-devops-border rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">S3 Storage Buckets</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{aws.s3Buckets?.length || 2}</span>
            <span className="text-xs text-brand-400 font-mono">AES256 Encrypted</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Artifacts & Terraform State</span>
        </div>

        <div className="bg-devops-card border border-devops-border rounded-xl p-4 space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">VPC & Security Groups</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">4 Subnets</span>
            <span className="text-xs text-purple-400 font-mono">3 SGs</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">CIDR: {aws.vpc?.cidrBlock}</span>
        </div>
      </div>

      {/* Tabs for Navigation across Infrastructure Layers */}
      <div className="flex items-center gap-2 border-b border-devops-border pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('ec2')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'ec2' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>EC2 Compute Nodes</span>
        </button>
        <button
          onClick={() => setActiveTab('k8s')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'k8s' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>EKS Kubernetes Nodes</span>
        </button>
        <button
          onClick={() => setActiveTab('s3')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${activeTab === 's3' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>S3 Artifact Buckets</span>
        </button>
        <button
          onClick={() => setActiveTab('iam')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'iam' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>IAM Least Privilege</span>
        </button>
        <button
          onClick={() => setActiveTab('vpc')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'vpc' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/30' : 'text-slate-400 hover:text-white'}`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>VPC & Security Groups</span>
        </button>
      </div>

      {/* Layer Content */}
      {activeTab === 'ec2' && (
        <div className="bg-devops-card border border-devops-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-devops-border bg-[#0b0f19]">
            <h3 className="text-sm font-semibold text-white">Amazon EC2 Elastic Compute Cluster</h3>
            <p className="text-xs text-slate-400">Worker nodes hosting container workloads and orchestration daemons</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-900/60">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Instance ID</th>
                  <th className="py-2.5 px-4 font-semibold">Node Name</th>
                  <th className="py-2.5 px-4 font-semibold">Instance Type</th>
                  <th className="py-2.5 px-4 font-semibold">vCPU / RAM</th>
                  <th className="py-2.5 px-4 font-semibold">AZ</th>
                  <th className="py-2.5 px-4 font-semibold">Private IP</th>
                  <th className="py-2.5 px-4 font-semibold">Public IP</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {aws.ec2Instances?.map((inst) => (
                  <tr key={inst.instanceId} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-bold text-white">{inst.instanceId}</td>
                    <td className="py-3 px-4 text-slate-200">{inst.name}</td>
                    <td className="py-3 px-4 text-brand-400">{inst.instanceType}</td>
                    <td className="py-3 px-4">{inst.vCpu} vCPU / {inst.ramGb} GB</td>
                    <td className="py-3 px-4 text-slate-400">{inst.availabilityZone}</td>
                    <td className="py-3 px-4 text-slate-400">{inst.privateIp}</td>
                    <td className="py-3 px-4 text-slate-400">{inst.publicIp}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {inst.state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'k8s' && (
        <div className="bg-devops-card border border-devops-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-devops-border bg-[#0b0f19]">
            <h3 className="text-sm font-semibold text-white">Kubernetes Worker Nodes Fleet</h3>
            <p className="text-xs text-slate-400">Node specifications, kernel version, allocatable CPU/RAM, and pod counts</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 bg-slate-900/60">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Node Name</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold">Role</th>
                  <th className="py-2.5 px-4 font-semibold">K8s Version</th>
                  <th className="py-2.5 px-4 font-semibold">CPU Allocation</th>
                  <th className="py-2.5 px-4 font-semibold">RAM Allocation</th>
                  <th className="py-2.5 px-4 font-semibold">Active Pods</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {kubernetes.nodes?.map((node) => (
                  <tr key={node.name} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-bold text-white">{node.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {node.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-purple-400">{node.role}</td>
                    <td className="py-3 px-4 text-slate-300">{node.version}</td>
                    <td className="py-3 px-4 text-slate-300">{node.cpuUsage}</td>
                    <td className="py-3 px-4 text-slate-300">{node.memoryUsage}</td>
                    <td className="py-3 px-4 font-bold text-brand-400">{node.podsCount} pods</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 's3' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aws.s3Buckets?.map((bucket) => (
            <div key={bucket.name} className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white text-xs">{bucket.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  {bucket.region}
                </span>
              </div>
              <p className="text-xs text-slate-400">{bucket.purpose}</p>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Versioning:</span>
                  <span className="text-emerald-400">{bucket.versioning}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Server Encryption:</span>
                  <span>{bucket.encryption}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Objects / Size:</span>
                  <span>{bucket.objectsCount} objects ({bucket.totalSizeMb} MB)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'iam' && (
        <div className="space-y-4">
          {aws.iamRoles?.map((role) => (
            <div key={role.roleName} className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-white text-xs">{role.roleName}</span>
                <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                  Trust: {role.assumeRolePrincipal}
                </span>
              </div>
              <span className="block font-mono text-[11px] text-slate-500">{role.arn}</span>

              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">Attached Policies:</span>
                <div className="flex flex-wrap gap-2">
                  {role.attachedPolicies?.map((p) => (
                    <span key={p} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'vpc' && (
        <div className="space-y-4">
          <div className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-white">VPC Network Topology ({aws.vpc?.id})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
              {aws.vpc?.subnets?.map((sub) => (
                <div key={sub.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-white font-bold">{sub.name}</span>
                    <span className={`text-[10px] px-1 rounded ${sub.public ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                      {sub.public ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <span className="text-slate-400 block">{sub.cidr}</span>
                  <span className="text-slate-500 block text-[10px]">{sub.az}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-devops-card border border-devops-border rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-white">Security Groups Ingress Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {aws.securityGroups?.map((sg) => (
                <div key={sg.groupId} className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-white font-bold">{sg.name}</span>
                    <span className="text-[10px] text-slate-500">{sg.groupId}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">{sg.description}</p>
                  <div className="space-y-1 font-mono text-[11px] pt-1 border-t border-slate-800">
                    {sg.ingressRules?.map((r, i) => (
                      <div key={i} className="text-slate-300">
                        {r.protocol} Port {r.port} &larr; <span className="text-brand-400">{r.source}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
