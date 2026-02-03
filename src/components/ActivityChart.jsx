import { useMemo } from 'react';

function ActivityChart({ data }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Get last 30 days of data
    const last30 = data.slice(0, 30).reverse();

    // Find max for scaling
    const maxCommits = Math.max(...last30.map(d => d.commits.length), 1);

    return last30.map(day => ({
      date: day.date,
      count: day.commits.length,
      authors: day.authors,
      height: (day.commits.length / maxCommits) * 100
    }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-dashboard-muted">
        No activity data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bar Chart */}
      <div className="h-48 flex items-end gap-1">
        {chartData.map((day, idx) => (
          <div
            key={day.date}
            className="flex-1 flex flex-col items-center group relative"
          >
            <div
              className="w-full bg-dashboard-accent/80 hover:bg-dashboard-accent rounded-t transition-all cursor-pointer min-h-[2px]"
              style={{ height: `${Math.max(day.height, 2)}%` }}
            />

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
              <div className="bg-dashboard-card border border-dashboard-border rounded-lg p-2 shadow-xl whitespace-nowrap">
                <div className="text-sm font-medium text-white">{formatDate(day.date)}</div>
                <div className="text-xs text-dashboard-muted">
                  {day.count} commit{day.count !== 1 ? 's' : ''}
                </div>
                <div className="text-xs text-dashboard-muted">
                  {day.authors.length} contributor{day.authors.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-dashboard-muted">
        <span>{formatDate(chartData[0]?.date)}</span>
        <span>{formatDate(chartData[Math.floor(chartData.length / 2)]?.date)}</span>
        <span>{formatDate(chartData[chartData.length - 1]?.date)}</span>
      </div>

      {/* Summary stats */}
      <div className="flex items-center justify-center gap-6 text-sm text-dashboard-muted pt-2 border-t border-dashboard-border">
        <div>
          Total: <span className="text-white font-medium">
            {chartData.reduce((sum, d) => sum + d.count, 0)} commits
          </span>
        </div>
        <div>
          Peak: <span className="text-white font-medium">
            {Math.max(...chartData.map(d => d.count))} commits/day
          </span>
        </div>
        <div>
          Avg: <span className="text-white font-medium">
            {(chartData.reduce((sum, d) => sum + d.count, 0) / chartData.length).toFixed(1)}/day
          </span>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default ActivityChart;
