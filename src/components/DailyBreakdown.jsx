import { useState } from 'react';
import { Calendar, Clock, GitCommit, Users, FolderGit2, ChevronDown, ChevronUp } from 'lucide-react';
import { getCategoryInfo } from '../services/aiAnalysis';

function DailyBreakdown({ dailyData, onSelectDay }) {
  const [expandedDay, setExpandedDay] = useState(null);

  if (!dailyData || dailyData.length === 0) {
    return (
      <div className="text-center text-dashboard-muted py-8">
        No daily activity data available
      </div>
    );
  }

  const toggleDay = (date) => {
    setExpandedDay(expandedDay === date ? null : date);
  };

  return (
    <div className="space-y-3">
      {dailyData.map((day) => (
        <div
          key={day.date}
          className="bg-dashboard-bg border border-dashboard-border rounded-lg overflow-hidden"
        >
          {/* Day Header */}
          <button
            onClick={() => toggleDay(day.date)}
            className="w-full p-4 flex items-center justify-between hover:bg-dashboard-border/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-dashboard-card rounded-lg flex flex-col items-center justify-center">
                <span className="text-xs text-dashboard-muted">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short' })}
                </span>
                <span className="text-lg font-bold text-white">
                  {new Date(day.date).getDate()}
                </span>
              </div>

              <div className="text-left">
                <div className="font-medium text-white">{day.dayName}</div>
                <div className="flex items-center gap-4 text-sm text-dashboard-muted">
                  <span className="flex items-center gap-1">
                    <GitCommit className="w-3 h-3" />
                    {day.commitCount} commits
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {day.authors.length} dev{day.authors.length !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <FolderGit2 className="w-3 h-3" />
                    {day.repositories.length} repo{day.repositories.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Category badges */}
              <div className="hidden md:flex items-center gap-2">
                {Object.entries(day.categories).slice(0, 3).map(([cat, count]) => {
                  const catInfo = getCategoryInfo(cat);
                  return (
                    <span
                      key={cat}
                      className="flex items-center gap-1 bg-dashboard-card px-2 py-1 rounded text-xs"
                    >
                      <span>{catInfo.emoji}</span>
                      <span className={catInfo.color}>{count}</span>
                    </span>
                  );
                })}
              </div>

              {/* Activity intensity */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-4 rounded-sm ${
                      i < Math.ceil(day.commitCount / 5)
                        ? 'bg-dashboard-accent'
                        : 'bg-dashboard-border'
                    }`}
                  />
                ))}
              </div>

              {expandedDay === day.date ? (
                <ChevronUp className="w-5 h-5 text-dashboard-muted" />
              ) : (
                <ChevronDown className="w-5 h-5 text-dashboard-muted" />
              )}
            </div>
          </button>

          {/* Expanded Content */}
          {expandedDay === day.date && (
            <div className="border-t border-dashboard-border p-4 space-y-4">
              {/* Hourly Activity */}
              <div>
                <h4 className="text-sm font-medium text-dashboard-muted mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Activity by Hour
                </h4>
                <div className="flex items-end gap-1 h-16">
                  {day.hourlyBreakdown.map((count, hour) => (
                    <div
                      key={hour}
                      className="flex-1 flex flex-col items-center"
                      title={`${hour}:00 - ${count} commits`}
                    >
                      <div
                        className={`w-full rounded-t ${
                          count > 0 ? 'bg-dashboard-accent' : 'bg-dashboard-border/30'
                        }`}
                        style={{
                          height: `${Math.max(4, (count / Math.max(...day.hourlyBreakdown)) * 100)}%`,
                          minHeight: count > 0 ? '8px' : '4px'
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-dashboard-muted mt-1">
                  <span>12am</span>
                  <span>6am</span>
                  <span>12pm</span>
                  <span>6pm</span>
                  <span>12am</span>
                </div>
              </div>

              {/* Contributors */}
              <div>
                <h4 className="text-sm font-medium text-dashboard-muted mb-2">
                  Contributors
                </h4>
                <div className="flex flex-wrap gap-2">
                  {day.authors.map((author) => (
                    <span
                      key={author}
                      className="px-3 py-1 bg-dashboard-card rounded-full text-sm text-white"
                    >
                      {author}
                    </span>
                  ))}
                </div>
              </div>

              {/* Commits List */}
              <div>
                <h4 className="text-sm font-medium text-dashboard-muted mb-2">
                  Commits
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {day.commits.map((commit, idx) => {
                    const msg = commit.commit?.message?.toLowerCase() || '';
                    let cat = 'other';
                    if (msg.startsWith('feat')) cat = 'feature';
                    else if (msg.startsWith('fix')) cat = 'bugfix';
                    else if (msg.startsWith('refactor')) cat = 'refactor';
                    const catInfo = getCategoryInfo(cat);

                    return (
                      <div
                        key={commit.sha || idx}
                        className="flex items-start gap-3 p-2 bg-dashboard-card rounded"
                      >
                        <span className="text-lg">{catInfo.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate">
                            {commit.commit?.message?.split('\n')[0]}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-dashboard-muted">
                            <span>{commit.commit?.author?.name}</span>
                            <span>•</span>
                            <span>{commit.repository?.name}</span>
                            <span>•</span>
                            <span>
                              {new Date(commit.commit?.author?.date).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default DailyBreakdown;
