import { FolderGit2, GitCommit, Users } from 'lucide-react';

function RepositoryList({ repositories }) {
  if (!repositories || repositories.length === 0) {
    return (
      <div className="text-center text-dashboard-muted py-8">
        No repository data available
      </div>
    );
  }

  const maxCommits = Math.max(...repositories.map(r => r.commits.length));

  return (
    <div className="space-y-3">
      {repositories.map((repo, idx) => (
        <div
          key={repo.name}
          className="flex items-center gap-4 p-3 bg-dashboard-bg rounded-lg hover:bg-dashboard-border/30 transition-colors"
        >
          <div className="w-8 text-center text-dashboard-muted text-sm">
            #{idx + 1}
          </div>

          <div className="w-10 h-10 rounded-lg bg-dashboard-card flex items-center justify-center">
            <FolderGit2 className="w-5 h-5 text-dashboard-accent" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-medium text-white truncate">{repo.name}</div>
            <div className="flex items-center gap-4 text-sm text-dashboard-muted">
              <span className="flex items-center gap-1">
                <GitCommit className="w-3 h-3" />
                {repo.commits.length} commits
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {repo.authors.length} contributor{repo.authors.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Activity Bar */}
          <div className="w-32 h-2 bg-dashboard-card rounded-full overflow-hidden">
            <div
              className="h-full bg-dashboard-accent rounded-full transition-all"
              style={{ width: `${(repo.commits.length / maxCommits) * 100}%` }}
            />
          </div>

          <div className="w-16 text-right text-dashboard-muted text-sm">
            {((repo.commits.length / repositories.reduce((sum, r) => sum + r.commits.length, 0)) * 100).toFixed(1)}%
          </div>
        </div>
      ))}
    </div>
  );
}

export default RepositoryList;
