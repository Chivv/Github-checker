import { Calendar, TrendingUp, TrendingDown, Minus, Users, GitCommit, Crown } from 'lucide-react';

function WeeklySummary({ weeklyData }) {
  if (!weeklyData || weeklyData.length === 0) {
    return (
      <div className="text-center text-dashboard-muted py-8">
        No weekly data available
      </div>
    );
  }

  // Calculate week-over-week changes
  const weeksWithChanges = weeklyData.map((week, idx) => {
    const prevWeek = weeklyData[idx + 1];
    const change = prevWeek
      ? ((week.commitCount - prevWeek.commitCount) / prevWeek.commitCount) * 100
      : 0;
    return { ...week, change };
  });

  return (
    <div className="space-y-4">
      {weeksWithChanges.map((week, idx) => (
        <div
          key={week.weekStart}
          className="bg-dashboard-bg border border-dashboard-border rounded-xl p-4"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-dashboard-card rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-dashboard-accent" />
              </div>
              <div>
                <div className="font-semibold text-white">
                  Week of {formatDate(week.weekStart)}
                </div>
                <div className="text-sm text-dashboard-muted">
                  {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
                </div>
              </div>
            </div>

            {/* Week-over-week change */}
            {idx < weeksWithChanges.length - 1 && (
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                week.change > 0
                  ? 'bg-green-500/20 text-green-400'
                  : week.change < 0
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-dashboard-card text-dashboard-muted'
              }`}>
                {week.change > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : week.change < 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
                {week.change > 0 ? '+' : ''}{week.change.toFixed(0)}%
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="bg-dashboard-card rounded-lg p-3 text-center">
              <GitCommit className="w-5 h-5 text-dashboard-accent mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{week.commitCount}</div>
              <div className="text-xs text-dashboard-muted">Commits</div>
            </div>
            <div className="bg-dashboard-card rounded-lg p-3 text-center">
              <Users className="w-5 h-5 text-dashboard-success mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{week.authors.length}</div>
              <div className="text-xs text-dashboard-muted">Contributors</div>
            </div>
            <div className="bg-dashboard-card rounded-lg p-3 text-center">
              <TrendingUp className="w-5 h-5 text-dashboard-warning mx-auto mb-1" />
              <div className="text-2xl font-bold text-white">{week.avgPerDay}</div>
              <div className="text-xs text-dashboard-muted">Avg/Day</div>
            </div>
            <div className="bg-dashboard-card rounded-lg p-3 text-center">
              <Crown className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white truncate" title={week.topContributor?.name}>
                {week.topContributor?.name?.split(' ')[0] || '-'}
              </div>
              <div className="text-xs text-dashboard-muted">
                Top ({week.topContributor?.commits || 0})
              </div>
            </div>
          </div>

          {/* Contributors */}
          <div className="flex flex-wrap gap-2">
            {week.authors.map(author => (
              <span
                key={author}
                className="px-2 py-1 bg-dashboard-card rounded text-xs text-dashboard-text"
              >
                {author}
              </span>
            ))}
          </div>

          {/* Repositories worked on */}
          <div className="mt-3 pt-3 border-t border-dashboard-border">
            <div className="text-xs text-dashboard-muted mb-2">Repositories touched:</div>
            <div className="flex flex-wrap gap-2">
              {week.repositories.slice(0, 5).map(repo => (
                <span
                  key={repo}
                  className="px-2 py-1 bg-dashboard-accent/10 text-dashboard-accent rounded text-xs"
                >
                  {repo.split('/')[1] || repo}
                </span>
              ))}
              {week.repositories.length > 5 && (
                <span className="px-2 py-1 text-dashboard-muted text-xs">
                  +{week.repositories.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Summary Stats */}
      <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-4">
        <h4 className="font-semibold text-white mb-3">Period Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-dashboard-accent">
              {weeksWithChanges.reduce((sum, w) => sum + w.commitCount, 0)}
            </div>
            <div className="text-sm text-dashboard-muted">Total Commits</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-dashboard-success">
              {(weeksWithChanges.reduce((sum, w) => sum + w.commitCount, 0) / weeksWithChanges.length).toFixed(0)}
            </div>
            <div className="text-sm text-dashboard-muted">Avg/Week</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-dashboard-warning">
              {Math.max(...weeksWithChanges.map(w => w.commitCount))}
            </div>
            <div className="text-sm text-dashboard-muted">Peak Week</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default WeeklySummary;
