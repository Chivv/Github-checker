import { useState, useMemo } from 'react';
import { Package, Rocket, Bug, Wrench, FileText, Sparkles, ChevronDown, ChevronRight, User } from 'lucide-react';

function FeatureShippingTracker({ commits, developers, aiSummaries = {} }) {
  const [expandedDev, setExpandedDev] = useState(null);
  const [filter, setFilter] = useState('all');

  // Parse commits and extract features shipped by each developer
  const shippingData = useMemo(() => {
    const data = {};

    developers.forEach(dev => {
      const devCommits = commits.filter(c => c.commit?.author?.name === dev.name);

      // Categorize commits
      const features = [];
      const fixes = [];
      const improvements = [];
      const other = [];

      devCommits.forEach(commit => {
        const msg = commit.commit?.message || '';
        const firstLine = msg.split('\n')[0];
        const lowerMsg = firstLine.toLowerCase();

        const item = {
          message: firstLine,
          fullMessage: msg,
          date: commit.commit?.author?.date,
          repo: commit.repository?.name || 'Unknown',
          sha: commit.sha?.substring(0, 7)
        };

        if (lowerMsg.startsWith('feat') || lowerMsg.includes('add ') || lowerMsg.includes('implement') || lowerMsg.includes('create')) {
          // Extract feature name from conventional commit
          const match = firstLine.match(/^feat(?:\([^)]+\))?:\s*(.+)/i);
          item.title = match ? match[1] : firstLine.replace(/^feat[:\s]*/i, '');
          features.push(item);
        } else if (lowerMsg.startsWith('fix') || lowerMsg.includes('bug') || lowerMsg.includes('resolve')) {
          const match = firstLine.match(/^fix(?:\([^)]+\))?:\s*(.+)/i);
          item.title = match ? match[1] : firstLine.replace(/^fix[:\s]*/i, '');
          fixes.push(item);
        } else if (lowerMsg.startsWith('refactor') || lowerMsg.startsWith('perf') || lowerMsg.includes('improve') || lowerMsg.includes('optimize')) {
          const match = firstLine.match(/^(?:refactor|perf)(?:\([^)]+\))?:\s*(.+)/i);
          item.title = match ? match[1] : firstLine;
          improvements.push(item);
        } else {
          item.title = firstLine;
          other.push(item);
        }
      });

      data[dev.name] = {
        developer: dev,
        features,
        fixes,
        improvements,
        other,
        totalShipped: features.length + fixes.length + improvements.length,
        aiSummary: aiSummaries[dev.name] || null
      };
    });

    return data;
  }, [commits, developers, aiSummaries]);

  // Sort developers by features shipped
  const sortedDevs = useMemo(() => {
    return Object.values(shippingData)
      .sort((a, b) => b.totalShipped - a.totalShipped);
  }, [shippingData]);

  const filteredDevs = filter === 'all'
    ? sortedDevs
    : sortedDevs.filter(d => {
        if (filter === 'features') return d.features.length > 0;
        if (filter === 'fixes') return d.fixes.length > 0;
        if (filter === 'improvements') return d.improvements.length > 0;
        return true;
      });

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Package className="w-5 h-5" />
          What Each Developer Shipped
        </h3>

        <div className="flex gap-2">
          {['all', 'features', 'fixes', 'improvements'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-dashboard-accent text-white'
                  : 'bg-dashboard-bg text-dashboard-muted hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Developer cards */}
      <div className="space-y-4">
        {filteredDevs.map(devData => (
          <DeveloperShippingCard
            key={devData.developer.name}
            data={devData}
            isExpanded={expandedDev === devData.developer.name}
            onToggle={() => setExpandedDev(
              expandedDev === devData.developer.name ? null : devData.developer.name
            )}
            filter={filter}
          />
        ))}
      </div>
    </div>
  );
}

function DeveloperShippingCard({ data, isExpanded, onToggle, filter }) {
  const { developer, features, fixes, improvements, other, aiSummary } = data;

  const displayItems = filter === 'features' ? features :
    filter === 'fixes' ? fixes :
    filter === 'improvements' ? improvements :
    [...features, ...fixes, ...improvements];

  return (
    <div className="bg-dashboard-card border border-dashboard-border rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 hover:bg-dashboard-bg/50 transition-colors"
      >
        {developer.avatar ? (
          <img src={developer.avatar} alt={developer.name} className="w-12 h-12 rounded-full" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-dashboard-accent/20 flex items-center justify-center text-dashboard-accent font-bold text-xl">
            {developer.name.charAt(0)}
          </div>
        )}

        <div className="flex-1 text-left">
          <div className="font-semibold text-white">{developer.name}</div>
          {aiSummary ? (
            <p className="text-sm text-dashboard-muted line-clamp-2">{aiSummary}</p>
          ) : (
            <p className="text-sm text-dashboard-muted">
              Shipped {features.length} feature{features.length !== 1 ? 's' : ''},
              fixed {fixes.length} bug{fixes.length !== 1 ? 's' : ''},
              made {improvements.length} improvement{improvements.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Stats badges */}
        <div className="flex items-center gap-3">
          <StatBadge icon={<Rocket className="w-4 h-4" />} count={features.length} color="green" label="Features" />
          <StatBadge icon={<Bug className="w-4 h-4" />} count={fixes.length} color="red" label="Fixes" />
          <StatBadge icon={<Wrench className="w-4 h-4" />} count={improvements.length} color="yellow" label="Improvements" />
        </div>

        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-dashboard-muted" />
        ) : (
          <ChevronRight className="w-5 h-5 text-dashboard-muted" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-dashboard-border p-4">
          {/* AI Summary */}
          {aiSummary && (
            <div className="bg-dashboard-accent/10 border border-dashboard-accent/30 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-dashboard-accent mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium text-sm">AI Summary</span>
              </div>
              <p className="text-dashboard-text">{aiSummary}</p>
            </div>
          )}

          {/* Features shipped */}
          {features.length > 0 && (filter === 'all' || filter === 'features') && (
            <ShippingSection
              title="Features Shipped"
              icon={<Rocket className="w-4 h-4 text-green-400" />}
              items={features}
              color="green"
            />
          )}

          {/* Bugs fixed */}
          {fixes.length > 0 && (filter === 'all' || filter === 'fixes') && (
            <ShippingSection
              title="Bugs Fixed"
              icon={<Bug className="w-4 h-4 text-red-400" />}
              items={fixes}
              color="red"
            />
          )}

          {/* Improvements */}
          {improvements.length > 0 && (filter === 'all' || filter === 'improvements') && (
            <ShippingSection
              title="Improvements Made"
              icon={<Wrench className="w-4 h-4 text-yellow-400" />}
              items={improvements}
              color="yellow"
            />
          )}

          {displayItems.length === 0 && (
            <p className="text-dashboard-muted text-center py-4">
              No {filter === 'all' ? 'significant contributions' : filter} in this period
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StatBadge({ icon, count, color, label }) {
  const colorClasses = {
    green: 'bg-green-500/20 text-green-400',
    red: 'bg-red-500/20 text-red-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    blue: 'bg-blue-500/20 text-blue-400'
  };

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${colorClasses[color]}`} title={label}>
      {icon}
      <span className="font-bold">{count}</span>
    </div>
  );
}

function ShippingSection({ title, icon, items, color }) {
  const [showAll, setShowAll] = useState(false);
  const displayItems = showAll ? items : items.slice(0, 5);

  const colorClasses = {
    green: 'border-green-500/30',
    red: 'border-red-500/30',
    yellow: 'border-yellow-500/30'
  };

  return (
    <div className="mb-4">
      <h4 className="font-medium text-white mb-2 flex items-center gap-2">
        {icon}
        {title} ({items.length})
      </h4>
      <div className="space-y-2">
        {displayItems.map((item, idx) => (
          <div
            key={idx}
            className={`p-3 bg-dashboard-bg rounded-lg border-l-2 ${colorClasses[color]}`}
          >
            <div className="font-medium text-white">{item.title}</div>
            <div className="flex items-center gap-3 mt-1 text-xs text-dashboard-muted">
              <span className="bg-dashboard-card px-2 py-0.5 rounded">{item.repo}</span>
              <span>{item.sha}</span>
              <span>{new Date(item.date).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
      {items.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-2 text-sm text-dashboard-accent hover:underline"
        >
          {showAll ? 'Show less' : `Show ${items.length - 5} more`}
        </button>
      )}
    </div>
  );
}

export default FeatureShippingTracker;
