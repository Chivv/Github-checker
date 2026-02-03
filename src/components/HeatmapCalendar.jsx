import { useState, useMemo } from 'react';

function HeatmapCalendar({ commits, developer = null }) {
  const [hoveredDay, setHoveredDay] = useState(null);

  // Build heatmap data for the last 365 days
  const { heatmapData, maxCommits, weeks } = useMemo(() => {
    const data = {};
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    // Initialize all days with 0
    for (let d = new Date(oneYearAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      data[key] = { count: 0, commits: [] };
    }

    // Count commits per day
    const relevantCommits = developer
      ? commits.filter(c => c.commit?.author?.name === developer.name)
      : commits;

    relevantCommits.forEach(commit => {
      const date = new Date(commit.commit?.author?.date);
      const key = date.toISOString().split('T')[0];
      if (data[key]) {
        data[key].count++;
        data[key].commits.push(commit);
      }
    });

    // Find max for color scaling
    const max = Math.max(1, ...Object.values(data).map(d => d.count));

    // Organize into weeks (columns)
    const weeksArray = [];
    let currentWeek = [];
    const startDate = new Date(oneYearAgo);

    // Align to start of week (Sunday)
    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1);
    }

    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      const dayData = data[key] || { count: 0, commits: [] };

      currentWeek.push({
        date: key,
        dayOfWeek: d.getDay(),
        ...dayData
      });

      if (d.getDay() === 6) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      weeksArray.push(currentWeek);
    }

    return { heatmapData: data, maxCommits: max, weeks: weeksArray };
  }, [commits, developer]);

  const getColorClass = (count) => {
    if (count === 0) return 'bg-dashboard-border/30';
    const intensity = count / maxCommits;
    if (intensity > 0.75) return 'bg-green-500';
    if (intensity > 0.5) return 'bg-green-600/80';
    if (intensity > 0.25) return 'bg-green-700/60';
    return 'bg-green-800/50';
  };

  const months = useMemo(() => {
    const monthLabels = [];
    let currentMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstDay = week[0];
      if (firstDay) {
        const month = new Date(firstDay.date).getMonth();
        if (month !== currentMonth) {
          currentMonth = month;
          monthLabels.push({
            month: new Date(firstDay.date).toLocaleDateString('en-US', { month: 'short' }),
            weekIndex
          });
        }
      }
    });

    return monthLabels;
  }, [weeks]);

  const totalCommits = useMemo(() => {
    return Object.values(heatmapData).reduce((sum, d) => sum + d.count, 0);
  }, [heatmapData]);

  const daysWithCommits = useMemo(() => {
    return Object.values(heatmapData).filter(d => d.count > 0).length;
  }, [heatmapData]);

  return (
    <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          {developer ? `${developer.name}'s Activity` : 'Team Activity'} Heatmap
        </h3>
        <div className="text-sm text-dashboard-muted">
          {totalCommits} commits in {daysWithCommits} days
        </div>
      </div>

      {/* Month labels */}
      <div className="flex mb-1 ml-8">
        {months.map((m, i) => (
          <div
            key={i}
            className="text-xs text-dashboard-muted"
            style={{
              position: 'relative',
              left: `${m.weekIndex * 13}px`,
              marginRight: i < months.length - 1 ? `${(months[i + 1]?.weekIndex - m.weekIndex - 1) * 13 - 20}px` : 0
            }}
          >
            {m.month}
          </div>
        ))}
      </div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 text-xs text-dashboard-muted mr-1">
          <div className="h-3"></div>
          <div className="h-3">Mon</div>
          <div className="h-3"></div>
          <div className="h-3">Wed</div>
          <div className="h-3"></div>
          <div className="h-3">Fri</div>
          <div className="h-3"></div>
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-[3px] overflow-x-auto pb-2">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {[0, 1, 2, 3, 4, 5, 6].map(dayOfWeek => {
                const day = week.find(d => d.dayOfWeek === dayOfWeek);
                if (!day) {
                  return <div key={dayOfWeek} className="w-3 h-3" />;
                }

                return (
                  <div
                    key={dayOfWeek}
                    className={`w-3 h-3 rounded-sm cursor-pointer transition-all ${getColorClass(day.count)} ${
                      hoveredDay?.date === day.date ? 'ring-2 ring-white' : ''
                    }`}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 text-xs text-dashboard-muted">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-dashboard-border/30" />
            <div className="w-3 h-3 rounded-sm bg-green-800/50" />
            <div className="w-3 h-3 rounded-sm bg-green-700/60" />
            <div className="w-3 h-3 rounded-sm bg-green-600/80" />
            <div className="w-3 h-3 rounded-sm bg-green-500" />
          </div>
          <span>More</span>
        </div>

        {/* Tooltip */}
        {hoveredDay && (
          <div className="text-sm">
            <span className="text-white font-medium">{hoveredDay.count} commits</span>
            <span className="text-dashboard-muted"> on {new Date(hoveredDay.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default HeatmapCalendar;
