import { useState } from 'react';
import { GitBranch, Key, Building2, ArrowRight, Play } from 'lucide-react';

function SetupPanel({ onSetup, onDemoMode }) {
  const [organization, setOrganization] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!organization.trim()) {
      setError('Please enter an organization or username');
      return;
    }

    if (!token.trim()) {
      setError('Please enter a GitHub token');
      return;
    }

    onSetup({
      organization: organization.trim(),
      token: token.trim()
    });
  };

  return (
    <div className="max-w-2xl mx-auto mt-20">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-dashboard-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <GitBranch className="w-10 h-10 text-dashboard-accent" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-3">
          Workspace Commit Dashboard
        </h2>
        <p className="text-dashboard-muted text-lg">
          Track developer activity across your entire GitHub workspace with AI-powered insights
        </p>
      </div>

      <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-dashboard-text mb-2">
              <Building2 className="w-4 h-4 inline mr-2" />
              GitHub Organization or Username
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g., ecom-traffic"
              className="w-full px-4 py-3 bg-dashboard-bg border border-dashboard-border rounded-lg text-white placeholder-dashboard-muted focus:outline-none focus:border-dashboard-accent transition-colors"
            />
            <p className="mt-2 text-sm text-dashboard-muted">
              Enter your GitHub organization name or username to track commits from all repositories
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dashboard-text mb-2">
              <Key className="w-4 h-4 inline mr-2" />
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 bg-dashboard-bg border border-dashboard-border rounded-lg text-white placeholder-dashboard-muted focus:outline-none focus:border-dashboard-accent transition-colors"
            />
            <p className="mt-2 text-sm text-dashboard-muted">
              Create a token at{' '}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dashboard-accent hover:underline"
              >
                github.com/settings/tokens
              </a>
              {' '}with <code className="bg-dashboard-bg px-1 rounded">repo</code> scope
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-dashboard-accent hover:bg-dashboard-accent/80 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            Connect Workspace
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-dashboard-border">
          <button
            onClick={onDemoMode}
            className="w-full py-3 bg-dashboard-bg hover:bg-dashboard-border text-dashboard-text font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-5 h-5" />
            Try Demo Mode (Ecom Traffic Sample Data)
          </button>
          <p className="mt-2 text-center text-sm text-dashboard-muted">
            See how the dashboard works with sample data
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="bg-dashboard-card border border-dashboard-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-dashboard-accent">Real-time</div>
          <div className="text-sm text-dashboard-muted">Commit Tracking</div>
        </div>
        <div className="bg-dashboard-card border border-dashboard-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-dashboard-success">AI-Powered</div>
          <div className="text-sm text-dashboard-muted">Activity Analysis</div>
        </div>
        <div className="bg-dashboard-card border border-dashboard-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-dashboard-warning">Developer</div>
          <div className="text-sm text-dashboard-muted">Insights</div>
        </div>
      </div>
    </div>
  );
}

export default SetupPanel;
