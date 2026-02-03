import { ArrowLeft, GitCommit, FolderGit2, Calendar, Clock, Sparkles, TrendingUp } from 'lucide-react';
import { getCategoryInfo } from '../services/aiAnalysis';

function DeveloperDetail({ developer, onBack, timeframe }) {
  const { name, email, avatar, login, commits, stats, summary } = developer;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-dashboard-muted hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      {/* Developer Header */}
      <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-6 mb-6">
        <div className="flex items-start gap-6">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-24 h-24 rounded-full ring-4 ring-dashboard-border"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-dashboard-accent/20 flex items-center justify-center text-4xl font-bold text-dashboard-accent">
              {name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1">{name}</h2>
            {login && (
              <a
                href={`https://github.com/${login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dashboard-accent hover:underline"
              >
                @{login}
              </a>
            )}
            {email && !email.includes('noreply') && (
              <p className="text-dashboard-muted">{email}</p>
            )}

            {/* Quick Stats */}
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-2">
                <GitCommit className="w-5 h-5 text-dashboard-accent" />
                <span className="text-white font-bold">{stats.totalCommits}</span>
                <span className="text-dashboard-muted">commits</span>
              </div>
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-dashboard-success" />
                <span className="text-white font-bold">{stats.repositories.length}</span>
                <span className="text-dashboard-muted">repositories</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-dashboard-warning" />
                <span className="text-white font-bold">{summary?.overview?.metrics?.daysActive || '-'}</span>
                <span className="text-dashboard-muted">days active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Summary Section */}
      {summary && (
        <div className="bg-gradient-to-br from-dashboard-accent/10 to-purple-500/10 border border-dashboard-accent/30 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-dashboard-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-dashboard-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">AI Activity Summary</h3>
              <p className="text-dashboard-text text-lg mb-2">{summary.headline}</p>
              <p className="text-dashboard-muted">{summary.overview?.text}</p>

              {/* Insights */}
              {summary.insights && summary.insights.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {summary.insights.map((insight, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-dashboard-card/50 px-3 py-2 rounded-lg"
                    >
                      <span className="text-xl">{insight.icon}</span>
                      <span className="text-sm text-dashboard-text">{insight.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Work Pattern */}
      {summary?.workPattern && (
        <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Work Pattern
          </h3>
          <p className="text-dashboard-text mb-4">{summary.workPattern.description}</p>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-dashboard-bg rounded-lg p-4 text-center">
              <div className="text-sm text-dashboard-muted mb-1">Peak Hours</div>
              <div className="text-xl font-bold text-dashboard-accent">
                {summary.workPattern.peakHour}
              </div>
            </div>
            <div className="bg-dashboard-bg rounded-lg p-4 text-center">
              <div className="text-sm text-dashboard-muted mb-1">Most Active Day</div>
              <div className="text-xl font-bold text-dashboard-success">
                {summary.workPattern.peakDay}
              </div>
            </div>
            <div className="bg-dashboard-bg rounded-lg p-4 text-center">
              <div className="text-sm text-dashboard-muted mb-1">Work Style</div>
              <div className="text-xl font-bold text-dashboard-warning capitalize">
                {summary.workPattern.pattern}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Focus Areas */}
      {summary?.focusAreas && summary.focusAreas.length > 0 && (
        <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Focus Areas
          </h3>
          <div className="space-y-3">
            {summary.focusAreas.map(area => (
              <div key={area.category} className="flex items-center gap-4">
                <div className="w-10 text-2xl">{area.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium ${area.color}`}>{area.label}</span>
                    <span className="text-dashboard-muted">{area.count} commits</span>
                  </div>
                  <div className="h-2 bg-dashboard-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-dashboard-accent rounded-full"
                      style={{ width: `${(area.count / stats.totalCommits) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Repository Breakdown */}
      {summary?.repositories && summary.repositories.length > 0 && (
        <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5" />
            Repository Contributions
          </h3>
          <div className="space-y-3">
            {summary.repositories.map(repo => (
              <div key={repo.name} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">{repo.name}</div>
                </div>
                <div className="text-dashboard-muted">{repo.commits} commits</div>
                <div className="w-20 text-right text-dashboard-accent">{repo.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Commits */}
      {summary?.recentHighlights && summary.recentHighlights.length > 0 && (
        <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <GitCommit className="w-5 h-5" />
            Recent Commits
          </h3>
          <div className="space-y-3">
            {summary.recentHighlights.map((commit, idx) => {
              const catInfo = getCategoryInfo(commit.category);
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-dashboard-bg rounded-lg"
                >
                  <span className="text-lg">{catInfo.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white truncate">{commit.message}</div>
                    <div className="flex items-center gap-3 text-sm text-dashboard-muted mt-1">
                      <span>{commit.repo}</span>
                      <span className="text-dashboard-border">|</span>
                      <span>{commit.sha}</span>
                      <span className="text-dashboard-border">|</span>
                      <span>{new Date(commit.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DeveloperDetail;
