import { Sparkles, TrendingUp, Users, FolderGit2 } from 'lucide-react';

function WorkspaceSummary({ summary }) {
  if (!summary) return null;

  return (
    <div className="bg-gradient-to-br from-dashboard-accent/10 to-dashboard-success/10 border border-dashboard-accent/30 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-dashboard-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-dashboard-accent" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            AI Workspace Summary
          </h3>
          <p className="text-dashboard-text text-lg">
            {summary.headline}
          </p>

          {summary.dateRange && (
            <p className="text-dashboard-muted text-sm mt-1">
              {summary.dateRange.start} - {summary.dateRange.end}
            </p>
          )}

          {/* Category Breakdown */}
          <div className="mt-4 flex flex-wrap gap-2">
            {summary.categoryBreakdown.slice(0, 6).map(cat => (
              <div
                key={cat.category}
                className="flex items-center gap-1.5 bg-dashboard-card/50 px-3 py-1.5 rounded-full text-sm"
              >
                <span>{cat.emoji}</span>
                <span className={cat.color}>{cat.label}</span>
                <span className="text-dashboard-muted">({cat.count})</span>
              </div>
            ))}
          </div>

          {/* Top Contributors & Repos */}
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-dashboard-muted mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Top Contributors
              </h4>
              <div className="space-y-2">
                {summary.topContributors.slice(0, 3).map((contributor, idx) => (
                  <div key={contributor.name} className="flex items-center gap-2">
                    <span className="text-dashboard-muted text-sm">#{idx + 1}</span>
                    {contributor.avatar ? (
                      <img
                        src={contributor.avatar}
                        alt={contributor.name}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-dashboard-accent/20 flex items-center justify-center text-xs">
                        {contributor.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-dashboard-text">{contributor.name}</span>
                    <span className="text-dashboard-muted text-sm">
                      ({contributor.commits} commits)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-dashboard-muted mb-3 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4" />
                Most Active Repos
              </h4>
              <div className="space-y-2">
                {summary.topRepos.slice(0, 3).map((repo, idx) => (
                  <div key={repo.name} className="flex items-center gap-2">
                    <span className="text-dashboard-muted text-sm">#{idx + 1}</span>
                    <span className="text-dashboard-text truncate">{repo.name}</span>
                    <span className="text-dashboard-muted text-sm">
                      ({repo.commits} commits)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkspaceSummary;
