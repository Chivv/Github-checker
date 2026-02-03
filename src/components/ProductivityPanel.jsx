import { AlertTriangle, AlertCircle, Flame, Trophy, TrendingUp, TrendingDown, Minus, Code2 } from 'lucide-react';
import {
  calculateProductivityScore,
  calculateStreaks,
  checkInactivity,
  estimateCodeContribution
} from '../services/productivityMetrics';

function ProductivityPanel({ developers, timeframeDays = 30 }) {
  // Calculate metrics for all developers
  const developersWithMetrics = developers.map(dev => ({
    ...dev,
    productivity: calculateProductivityScore(dev, timeframeDays),
    streak: calculateStreaks(dev.commits),
    inactivity: checkInactivity(dev),
    codeEstimate: estimateCodeContribution(dev.commits)
  }));

  // Sort by productivity score
  const sortedByProductivity = [...developersWithMetrics].sort(
    (a, b) => b.productivity.score - a.productivity.score
  );

  // Get inactive developers
  const inactiveDevelopers = developersWithMetrics.filter(d => d.inactivity.alert);

  // Get developers with active streaks
  const activeStreaks = developersWithMetrics
    .filter(d => d.streak.current > 0)
    .sort((a, b) => b.streak.current - a.streak.current);

  return (
    <div className="space-y-6">
      {/* Inactivity Alerts */}
      {inactiveDevelopers.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Inactivity Alerts ({inactiveDevelopers.length})
          </h3>
          <div className="space-y-2">
            {inactiveDevelopers.map(dev => (
              <div
                key={dev.email}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  dev.inactivity.alert === 'critical'
                    ? 'bg-red-500/20'
                    : 'bg-yellow-500/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  {dev.inactivity.alert === 'critical' ? (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  )}
                  <div>
                    <div className="font-medium text-white">{dev.name}</div>
                    <div className="text-sm text-dashboard-muted">
                      Last commit: {dev.inactivity.lastCommitDate}
                    </div>
                  </div>
                </div>
                <div className={`text-sm font-medium ${
                  dev.inactivity.alert === 'critical' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {dev.inactivity.daysSinceLastCommit} days inactive
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Productivity Leaderboard */}
      <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Productivity Leaderboard
        </h3>
        <div className="space-y-3">
          {sortedByProductivity.map((dev, idx) => (
            <div
              key={dev.email}
              className="flex items-center gap-4 p-3 bg-dashboard-bg rounded-lg"
            >
              <div className="w-8 text-center">
                {idx === 0 && <span className="text-2xl">🥇</span>}
                {idx === 1 && <span className="text-2xl">🥈</span>}
                {idx === 2 && <span className="text-2xl">🥉</span>}
                {idx > 2 && <span className="text-dashboard-muted">#{idx + 1}</span>}
              </div>

              {dev.avatar ? (
                <img src={dev.avatar} alt={dev.name} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-dashboard-accent/20 flex items-center justify-center text-dashboard-accent font-bold">
                  {dev.name.charAt(0)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">{dev.name}</div>
                <div className="text-sm text-dashboard-muted">
                  {dev.stats.totalCommits} commits • {dev.stats.repositories.length} repos
                </div>
              </div>

              {/* Productivity Score */}
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <div className={`text-2xl font-bold ${dev.productivity.level.color}`}>
                    {dev.productivity.score}
                  </div>
                  <div className="text-xs text-dashboard-muted">/100</div>
                </div>
                <div className={`text-xs ${dev.productivity.level.color}`}>
                  {dev.productivity.level.label}
                </div>
              </div>

              {/* Score breakdown tooltip */}
              <div className="w-24">
                <div className="h-2 bg-dashboard-border rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-blue-400"
                    style={{ width: `${dev.productivity.breakdown.frequency}%` }}
                    title={`Frequency: ${dev.productivity.breakdown.frequency}`}
                  />
                  <div
                    className="h-full bg-green-400"
                    style={{ width: `${dev.productivity.breakdown.consistency}%` }}
                    title={`Consistency: ${dev.productivity.breakdown.consistency}`}
                  />
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${dev.productivity.breakdown.diversity}%` }}
                    title={`Diversity: ${dev.productivity.breakdown.diversity}`}
                  />
                  <div
                    className="h-full bg-purple-400"
                    style={{ width: `${dev.productivity.breakdown.quality}%` }}
                    title={`Quality: ${dev.productivity.breakdown.quality}`}
                  />
                </div>
                <div className="flex justify-between text-xs text-dashboard-muted mt-1">
                  <span title="Frequency">F</span>
                  <span title="Consistency">C</span>
                  <span title="Diversity">D</span>
                  <span title="Quality">Q</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-dashboard-border">
          <div className="text-xs text-dashboard-muted">
            Score breakdown:
            <span className="text-blue-400 ml-2">Frequency (25pts)</span>
            <span className="text-green-400 ml-2">Consistency (25pts)</span>
            <span className="text-yellow-400 ml-2">Diversity (20pts)</span>
            <span className="text-purple-400 ml-2">Quality (30pts)</span>
          </div>
        </div>
      </div>

      {/* Active Streaks */}
      {activeStreaks.length > 0 && (
        <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-4">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Active Streaks
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {activeStreaks.slice(0, 8).map(dev => (
              <div
                key={dev.email}
                className="bg-dashboard-bg rounded-lg p-3 text-center"
              >
                {dev.avatar ? (
                  <img
                    src={dev.avatar}
                    alt={dev.name}
                    className="w-12 h-12 rounded-full mx-auto mb-2"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-dashboard-accent/20 flex items-center justify-center mx-auto mb-2 text-dashboard-accent font-bold">
                    {dev.name.charAt(0)}
                  </div>
                )}
                <div className="font-medium text-white text-sm truncate">
                  {dev.name.split(' ')[0]}
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 font-bold">{dev.streak.current}</span>
                  <span className="text-dashboard-muted text-xs">days</span>
                </div>
                <div className="text-xs text-dashboard-muted mt-1">
                  Best: {dev.streak.longest} days
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Contribution Estimates */}
      <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-dashboard-accent" />
          Estimated Code Contributions
        </h3>
        <div className="space-y-3">
          {sortedByProductivity.slice(0, 5).map(dev => (
            <div
              key={dev.email}
              className="flex items-center gap-4 p-3 bg-dashboard-bg rounded-lg"
            >
              <div className="font-medium text-white flex-1">{dev.name}</div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">+{dev.codeEstimate.linesAdded.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">-{dev.codeEstimate.linesRemoved.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 w-24">
                  <Minus className="w-4 h-4 text-dashboard-accent" />
                  <span className="text-dashboard-accent font-medium">
                    {dev.codeEstimate.netLines > 0 ? '+' : ''}{dev.codeEstimate.netLines.toLocaleString()} net
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-dashboard-muted">
          * Estimates based on commit patterns. Actual line counts may vary.
        </div>
      </div>
    </div>
  );
}

export default ProductivityPanel;
