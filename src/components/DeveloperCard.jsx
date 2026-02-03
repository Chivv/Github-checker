import { GitCommit, FolderGit2, Calendar, ArrowRight } from 'lucide-react';
import { getCategoryInfo } from '../services/aiAnalysis';

function DeveloperCard({ developer, rank, onClick }) {
  const { name, avatar, stats, summary } = developer;

  const topCategories = summary?.focusAreas?.slice(0, 3) || [];

  const rankColors = {
    1: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50',
    2: 'from-gray-400/20 to-gray-500/20 border-gray-400/50',
    3: 'from-amber-700/20 to-amber-800/20 border-amber-700/50'
  };

  const rankBadgeColors = {
    1: 'bg-yellow-500 text-black',
    2: 'bg-gray-400 text-black',
    3: 'bg-amber-700 text-white'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-br ${rank <= 3 ? rankColors[rank] : 'from-dashboard-card to-dashboard-card'} border ${rank <= 3 ? '' : 'border-dashboard-border'} rounded-xl p-5 cursor-pointer hover:scale-[1.02] transition-transform`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-12 h-12 rounded-full ring-2 ring-dashboard-border"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-dashboard-accent/20 flex items-center justify-center text-xl font-bold text-dashboard-accent">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h4 className="font-semibold text-white">{name}</h4>
            <p className="text-sm text-dashboard-muted">
              {stats.repositories.length} repo{stats.repositories.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {rank <= 3 && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${rankBadgeColors[rank]}`}>
            #{rank}
          </span>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-dashboard-bg/50 rounded-lg p-2 text-center">
          <GitCommit className="w-4 h-4 mx-auto text-dashboard-accent mb-1" />
          <div className="text-lg font-bold text-white">{stats.totalCommits}</div>
          <div className="text-xs text-dashboard-muted">Commits</div>
        </div>
        <div className="bg-dashboard-bg/50 rounded-lg p-2 text-center">
          <FolderGit2 className="w-4 h-4 mx-auto text-dashboard-success mb-1" />
          <div className="text-lg font-bold text-white">{stats.repositories.length}</div>
          <div className="text-xs text-dashboard-muted">Repos</div>
        </div>
        <div className="bg-dashboard-bg/50 rounded-lg p-2 text-center">
          <Calendar className="w-4 h-4 mx-auto text-dashboard-warning mb-1" />
          <div className="text-lg font-bold text-white">
            {summary?.overview?.metrics?.daysActive || '-'}
          </div>
          <div className="text-xs text-dashboard-muted">Days</div>
        </div>
      </div>

      {/* Focus Areas */}
      {topCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {topCategories.map(cat => (
            <span
              key={cat.category}
              className="flex items-center gap-1 bg-dashboard-bg/50 px-2 py-0.5 rounded-full text-xs"
            >
              <span>{cat.emoji}</span>
              <span className={cat.color}>{cat.count}</span>
            </span>
          ))}
        </div>
      )}

      {/* AI Summary Preview */}
      {summary?.headline && (
        <p className="text-sm text-dashboard-muted line-clamp-2 mb-3">
          {summary.headline}
        </p>
      )}

      <div className="flex items-center justify-end text-dashboard-accent text-sm">
        <span>View Details</span>
        <ArrowRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  );
}

export default DeveloperCard;
