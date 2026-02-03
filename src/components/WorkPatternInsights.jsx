import { AlertTriangle, Moon, Sun, Coffee, Flame, TrendingDown, Clock, Calendar } from 'lucide-react';

function WorkPatternInsights({ developers, commits }) {
  // Analyze work patterns for all developers
  const insights = developers.map(dev => analyzeWorkPattern(dev, dev.commits));

  // Find concerning patterns
  const overtimeWorkers = insights.filter(i => i.overtimeRisk === 'high');
  const nightOwls = insights.filter(i => i.nightCommitPercentage > 30);
  const weekendWarriors = insights.filter(i => i.weekendPercentage > 25);
  const irregularPatterns = insights.filter(i => i.consistencyScore < 40);

  return (
    <div className="space-y-6">
      {/* Overtime Alerts */}
      {overtimeWorkers.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Overtime / Burnout Risk ({overtimeWorkers.length})
          </h3>
          <p className="text-dashboard-muted text-sm mb-4">
            These developers show signs of working unusual hours regularly. Consider checking in with them.
          </p>
          <div className="space-y-3">
            {overtimeWorkers.map(worker => (
              <WorkerCard key={worker.name} worker={worker} type="overtime" />
            ))}
          </div>
        </div>
      )}

      {/* Night Owls */}
      {nightOwls.length > 0 && (
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
            <Moon className="w-5 h-5" />
            Night Owls ({nightOwls.length})
          </h3>
          <p className="text-dashboard-muted text-sm mb-4">
            Developers who frequently commit during late night hours (10 PM - 6 AM).
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {nightOwls.map(worker => (
              <div key={worker.name} className="bg-dashboard-bg rounded-lg p-3 text-center">
                <div className="font-medium text-white truncate">{worker.name}</div>
                <div className="text-2xl font-bold text-purple-400 mt-1">
                  {worker.nightCommitPercentage}%
                </div>
                <div className="text-xs text-dashboard-muted">night commits</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekend Warriors */}
      {weekendWarriors.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekend Activity ({weekendWarriors.length})
          </h3>
          <p className="text-dashboard-muted text-sm mb-4">
            Developers with significant weekend commit activity.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {weekendWarriors.map(worker => (
              <div key={worker.name} className="bg-dashboard-bg rounded-lg p-3 text-center">
                <div className="font-medium text-white truncate">{worker.name}</div>
                <div className="text-2xl font-bold text-blue-400 mt-1">
                  {worker.weekendPercentage}%
                </div>
                <div className="text-xs text-dashboard-muted">weekend commits</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Developer Work Patterns */}
      <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Work Pattern Analysis
        </h3>
        <div className="space-y-4">
          {insights.map(worker => (
            <div key={worker.name} className="bg-dashboard-bg rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-white">{worker.name}</div>
                <div className="flex items-center gap-2">
                  {worker.overtimeRisk === 'high' && (
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Overtime
                    </span>
                  )}
                  {worker.nightCommitPercentage > 30 && (
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs flex items-center gap-1">
                      <Moon className="w-3 h-3" /> Night Owl
                    </span>
                  )}
                  {worker.consistencyScore < 40 && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" /> Irregular
                    </span>
                  )}
                </div>
              </div>

              {/* Hourly distribution bar */}
              <div className="mb-3">
                <div className="text-xs text-dashboard-muted mb-1">Activity by hour</div>
                <div className="flex h-8 rounded overflow-hidden">
                  {worker.hourlyDistribution.map((count, hour) => {
                    const intensity = worker.maxHourly > 0 ? count / worker.maxHourly : 0;
                    const isNight = hour >= 22 || hour < 6;
                    return (
                      <div
                        key={hour}
                        className="flex-1"
                        style={{
                          backgroundColor: isNight
                            ? `rgba(168, 85, 247, ${0.2 + intensity * 0.6})`
                            : `rgba(34, 197, 94, ${0.2 + intensity * 0.6})`
                        }}
                        title={`${hour}:00 - ${count} commits`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-dashboard-muted mt-1">
                  <span>12am</span>
                  <span>6am</span>
                  <span>12pm</span>
                  <span>6pm</span>
                  <span>12am</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 text-center text-sm">
                <div>
                  <div className="text-dashboard-muted">Peak Hour</div>
                  <div className="font-medium text-white">{formatHour(worker.peakHour)}</div>
                </div>
                <div>
                  <div className="text-dashboard-muted">Avg/Day</div>
                  <div className="font-medium text-white">{worker.avgCommitsPerDay}</div>
                </div>
                <div>
                  <div className="text-dashboard-muted">Work Style</div>
                  <div className="font-medium text-white capitalize">{worker.workStyle}</div>
                </div>
                <div>
                  <div className="text-dashboard-muted">Consistency</div>
                  <div className={`font-medium ${
                    worker.consistencyScore >= 70 ? 'text-green-400' :
                    worker.consistencyScore >= 40 ? 'text-yellow-400' : 'text-red-400'
                  }`}>{worker.consistencyScore}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkerCard({ worker, type }) {
  return (
    <div className="flex items-center justify-between p-3 bg-dashboard-bg rounded-lg">
      <div>
        <div className="font-medium text-white">{worker.name}</div>
        <div className="text-sm text-dashboard-muted">
          {type === 'overtime' && (
            <>Peak activity at {formatHour(worker.peakHour)} • {worker.nightCommitPercentage}% night commits</>
          )}
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm text-orange-400">
          {worker.lateNightCount} late commits
        </div>
        <div className="text-xs text-dashboard-muted">
          {worker.weekendPercentage}% weekend
        </div>
      </div>
    </div>
  );
}

function analyzeWorkPattern(developer, commits) {
  const hourlyDistribution = new Array(24).fill(0);
  const dailyDistribution = new Array(7).fill(0);
  let lateNightCount = 0;
  let weekendCount = 0;

  commits.forEach(commit => {
    const date = new Date(commit.commit?.author?.date);
    const hour = date.getHours();
    const day = date.getDay();

    hourlyDistribution[hour]++;
    dailyDistribution[day]++;

    // Late night: 10 PM - 6 AM
    if (hour >= 22 || hour < 6) {
      lateNightCount++;
    }

    // Weekend
    if (day === 0 || day === 6) {
      weekendCount++;
    }
  });

  const totalCommits = commits.length;
  const peakHour = hourlyDistribution.indexOf(Math.max(...hourlyDistribution));
  const maxHourly = Math.max(...hourlyDistribution);

  // Calculate work style
  const morningCommits = hourlyDistribution.slice(6, 12).reduce((a, b) => a + b, 0);
  const afternoonCommits = hourlyDistribution.slice(12, 18).reduce((a, b) => a + b, 0);
  const eveningCommits = hourlyDistribution.slice(18, 22).reduce((a, b) => a + b, 0);

  let workStyle = 'balanced';
  if (morningCommits > afternoonCommits && morningCommits > eveningCommits) {
    workStyle = 'morning';
  } else if (afternoonCommits > morningCommits && afternoonCommits > eveningCommits) {
    workStyle = 'afternoon';
  } else if (eveningCommits > morningCommits && eveningCommits > afternoonCommits) {
    workStyle = 'evening';
  }

  // Calculate consistency (how spread out are commits)
  const uniqueDays = new Set(
    commits.map(c => new Date(c.commit?.author?.date).toISOString().split('T')[0])
  ).size;

  const daySpan = commits.length > 0 ?
    Math.ceil((new Date(Math.max(...commits.map(c => new Date(c.commit?.author?.date)))) -
    new Date(Math.min(...commits.map(c => new Date(c.commit?.author?.date))))) / (1000 * 60 * 60 * 24)) + 1 : 0;

  const consistencyScore = daySpan > 0 ? Math.round((uniqueDays / daySpan) * 100) : 0;

  // Overtime risk assessment
  const nightCommitPercentage = totalCommits > 0 ? Math.round((lateNightCount / totalCommits) * 100) : 0;
  const weekendPercentage = totalCommits > 0 ? Math.round((weekendCount / totalCommits) * 100) : 0;

  let overtimeRisk = 'low';
  if (nightCommitPercentage > 40 || weekendPercentage > 40) {
    overtimeRisk = 'high';
  } else if (nightCommitPercentage > 20 || weekendPercentage > 25) {
    overtimeRisk = 'medium';
  }

  return {
    name: developer.name,
    totalCommits,
    hourlyDistribution,
    dailyDistribution,
    peakHour,
    maxHourly,
    workStyle,
    consistencyScore,
    lateNightCount,
    weekendCount,
    nightCommitPercentage,
    weekendPercentage,
    overtimeRisk,
    avgCommitsPerDay: uniqueDays > 0 ? (totalCommits / uniqueDays).toFixed(1) : '0'
  };
}

function formatHour(hour) {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

export default WorkPatternInsights;
