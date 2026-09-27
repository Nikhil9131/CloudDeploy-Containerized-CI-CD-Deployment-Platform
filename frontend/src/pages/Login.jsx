import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layers, ShieldCheck, Lock, Mail, ArrowRight, UserCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setError('');
    setLoading(true);
    const demoEmail = role === 'ADMIN' ? 'admin@clouddeploy.io' : 'developer@clouddeploy.io';
    const demoPass = 'Password123!';

    setEmail(demoEmail);
    setPassword(demoPass);

    try {
      await login(demoEmail, demoPass);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-devops-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 items-center justify-center shadow-xl shadow-brand-500/20 mb-2">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            CloudDeploy
          </h1>
          <p className="text-xs text-slate-400">
            Containerized CI/CD Deployment & Orchestration Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-devops-card border border-devops-border rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-white">Sign in to console</h2>
            <p className="text-xs text-slate-400 mt-1">Authenticate using your DevOps engineering credentials</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="developer@clouddeploy.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-devops-border rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-devops-border rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors shadow-sm shadow-brand-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className="mt-6 pt-5 border-t border-devops-border space-y-3">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              Quick Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('ADMIN')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-medium transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Login</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('DEVELOPER')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-lg text-xs font-medium transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Developer Login</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-400">
          Need a new engineer account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
