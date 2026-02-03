import { GitBranch, RefreshCw, LogOut, Clock } from 'lucide-react';

function Header({ config, onReset, timeframe, onTimeframeChange, onRefresh, loading, useDemo }) {
  const timeframes = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '365d', label: '1 Year' }
  ];

  return (
    <header className="bg-dashboard-card border-b border-dashboard-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-dashboard-accent/20 rounded-lg flex items-center justify-center">
              <GitBranch className="w-6 h-6 text-dashboard-accent" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">
                {useDemo ? 'Ecom Traffic' : (config?.organization || 'Workspace')} Commits
              </h1>
              <p className="text-sm text-dashboard-muted">
                Developer Activity Dashboard
              </p>
            </div>
            {useDemo && (
              <span className="ml-2 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                Demo Mode
              </span>
            )}
          </div>

          {(config || useDemo) && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-dashboard-bg rounded-lg p-1">
                <Clock className="w-4 h-4 text-dashboard-muted ml-2" />
                {timeframes.map(tf => (
                  <button
                    key={tf.value}
                    onClick={() => onTimeframeChange(tf.value)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                      timeframe === tf.value
                        ? 'bg-dashboard-accent text-white'
                        : 'text-dashboard-muted hover:text-white'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              <button
                onClick={onRefresh}
                disabled={loading}
                className="p-2 rounded-lg bg-dashboard-bg hover:bg-dashboard-border transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={onReset}
                className="p-2 rounded-lg bg-dashboard-bg hover:bg-red-500/20 text-dashboard-muted hover:text-red-400 transition-colors"
                title="Reset configuration"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
