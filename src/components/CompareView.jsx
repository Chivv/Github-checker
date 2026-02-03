import { useState } from 'react';
import { Scale, GitCommit, FolderGit2, Flame, Trophy, ChevronDown } from 'lucide-react';
import { compareDevelopers } from '../services/productivityMetrics';

function CompareView({ developers }) {
  const [dev1Index, setDev1Index] = useState(0);
  const [dev2Index, setDev2Index] = useState(developers.length > 1 ? 1 : 0);

  if (developers.length < 2) {
    return (
      <div className="text-center text-dashboard-muted py-8">
        Need at least 2 developers to compare
      </div>
    );
  }

  const comparison = compareDevelopers(
    developers[dev1Index],
    developers[dev2Index]
  );

  const metrics = [
    {
      label: 'Total Commits',
      icon: <GitCommit className="w-5 h-5" />,
      value1: comparison.developer1.commits,
      value2: comparison.developer2.commits,
      winner: comparison.winner.commits
    },
    {
      label: 'Repositories',
      icon: <FolderGit2 className="w-5 h-5" />,
      value1: comparison.developer1.repositories,
      value2: comparison.developer2.repositories,
      winner: comparison.developer1.repositories > comparison.developer2.repositories ? 1 : 2
    },
    {
      label: 'Productivity Score',
      icon: <Trophy className="w-5 h-5" />,
      value1: comparison.developer1.productivityScore,
      value2: comparison.developer2.productivityScore,
      winner: comparison.winner.productivity
    },
    {
      label: 'Current Streak',
      icon: <Flame className="w-5 h-5" />,
      value1: `${comparison.developer1.currentStreak} days`,
      value2: `${comparison.developer2.currentStreak} days`,
      winner: comparison.winner.streak
    },
    {
      label: 'Longest Streak',
      icon: <Flame className="w-5 h-5" />,
      value1: `${comparison.developer1.longestStreak} days`,
      value2: `${comparison.developer2.longestStreak} days`,
      winner: comparison.developer1.longestStreak > comparison.developer2.longestStreak ? 1 : 2
    }
  ];

  return (
    <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Scale className="w-5 h-5" />
        Compare Developers
      </h3>

      {/* Developer Selectors */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <DeveloperSelector
          developers={developers}
          selected={dev1Index}
          onSelect={setDev1Index}
          exclude={dev2Index}
          color="blue"
        />
        <DeveloperSelector
          developers={developers}
          selected={dev2Index}
          onSelect={setDev2Index}
          exclude={dev1Index}
          color="purple"
        />
      </div>

      {/* Comparison Metrics */}
      <div className="space-y-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="flex items-center gap-4">
            {/* Left value */}
            <div className={`flex-1 text-right ${metric.winner === 1 ? 'text-green-400' : 'text-white'}`}>
              <span className="text-2xl font-bold">{metric.value1}</span>
              {metric.winner === 1 && <span className="ml-2 text-green-400">+</span>}
            </div>

            {/* Label */}
            <div className="w-40 text-center">
              <div className="flex items-center justify-center gap-2 text-dashboard-muted">
                {metric.icon}
                <span className="text-sm">{metric.label}</span>
              </div>
            </div>

            {/* Right value */}
            <div className={`flex-1 text-left ${metric.winner === 2 ? 'text-green-400' : 'text-white'}`}>
              {metric.winner === 2 && <span className="mr-2 text-green-400">+</span>}
              <span className="text-2xl font-bold">{metric.value2}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Visual comparison bar */}
      <div className="mt-8 pt-6 border-t border-dashboard-border">
        <div className="text-sm text-dashboard-muted mb-2 text-center">Overall Productivity</div>
        <div className="flex items-center gap-4">
          <div className="flex-1 text-right">
            <span className="text-blue-400 font-bold">
              {comparison.developer1.productivityScore}
            </span>
          </div>
          <div className="w-64 h-4 bg-dashboard-bg rounded-full overflow-hidden flex">
            <div
              className="h-full bg-blue-500"
              style={{
                width: `${(comparison.developer1.productivityScore / (comparison.developer1.productivityScore + comparison.developer2.productivityScore)) * 100}%`
              }}
            />
            <div
              className="h-full bg-purple-500"
              style={{
                width: `${(comparison.developer2.productivityScore / (comparison.developer1.productivityScore + comparison.developer2.productivityScore)) * 100}%`
              }}
            />
          </div>
          <div className="flex-1 text-left">
            <span className="text-purple-400 font-bold">
              {comparison.developer2.productivityScore}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeveloperSelector({ developers, selected, onSelect, exclude, color }) {
  const [isOpen, setIsOpen] = useState(false);
  const dev = developers[selected];

  const colorClasses = {
    blue: 'border-blue-500/50 bg-blue-500/10',
    purple: 'border-purple-500/50 bg-purple-500/10'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 rounded-xl border-2 ${colorClasses[color]} flex items-center gap-4 hover:opacity-80 transition-opacity`}
      >
        {dev.avatar ? (
          <img src={dev.avatar} alt={dev.name} className="w-12 h-12 rounded-full" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-dashboard-accent/20 flex items-center justify-center text-dashboard-accent font-bold text-xl">
            {dev.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 text-left">
          <div className="font-semibold text-white">{dev.name}</div>
          <div className="text-sm text-dashboard-muted">{dev.stats.totalCommits} commits</div>
        </div>
        <ChevronDown className={`w-5 h-5 text-dashboard-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dashboard-card border border-dashboard-border rounded-xl shadow-xl z-10 max-h-64 overflow-y-auto">
          {developers.map((d, idx) => (
            idx !== exclude && (
              <button
                key={d.email || idx}
                onClick={() => {
                  onSelect(idx);
                  setIsOpen(false);
                }}
                className={`w-full p-3 flex items-center gap-3 hover:bg-dashboard-bg transition-colors ${
                  idx === selected ? 'bg-dashboard-bg' : ''
                }`}
              >
                {d.avatar ? (
                  <img src={d.avatar} alt={d.name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-dashboard-accent/20 flex items-center justify-center text-dashboard-accent font-bold">
                    {d.name.charAt(0)}
                  </div>
                )}
                <div className="text-left">
                  <div className="font-medium text-white">{d.name}</div>
                  <div className="text-xs text-dashboard-muted">{d.stats.totalCommits} commits</div>
                </div>
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
}

export default CompareView;
