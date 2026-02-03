// AI-powered commit analysis and summary generation
// This generates human-readable breakdowns of developer activity

// Categorize commits based on their messages
export function categorizeCommit(message) {
  const lowerMessage = message.toLowerCase();

  const categories = {
    feature: ['feat', 'feature', 'add', 'implement', 'create', 'new'],
    bugfix: ['fix', 'bug', 'patch', 'resolve', 'issue', 'error', 'crash'],
    refactor: ['refactor', 'restructure', 'reorganize', 'clean', 'improve'],
    docs: ['doc', 'readme', 'comment', 'documentation'],
    test: ['test', 'spec', 'coverage', 'jest', 'mocha'],
    style: ['style', 'format', 'lint', 'prettier', 'css', 'ui'],
    chore: ['chore', 'update', 'upgrade', 'dependency', 'deps', 'version'],
    ci: ['ci', 'deploy', 'pipeline', 'build', 'workflow', 'action'],
    security: ['security', 'auth', 'permission', 'vulnerability', 'cve'],
    performance: ['perf', 'performance', 'optimize', 'speed', 'cache']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return category;
    }
  }

  return 'other';
}

const categoryLabels = {
  feature: { label: 'New Features', emoji: '✨', color: 'text-green-400' },
  bugfix: { label: 'Bug Fixes', emoji: '🐛', color: 'text-red-400' },
  refactor: { label: 'Refactoring', emoji: '♻️', color: 'text-yellow-400' },
  docs: { label: 'Documentation', emoji: '📝', color: 'text-blue-400' },
  test: { label: 'Testing', emoji: '🧪', color: 'text-purple-400' },
  style: { label: 'Styling', emoji: '💅', color: 'text-pink-400' },
  chore: { label: 'Maintenance', emoji: '🔧', color: 'text-gray-400' },
  ci: { label: 'CI/CD', emoji: '🚀', color: 'text-orange-400' },
  security: { label: 'Security', emoji: '🔒', color: 'text-red-500' },
  performance: { label: 'Performance', emoji: '⚡', color: 'text-yellow-300' },
  other: { label: 'Other Changes', emoji: '📦', color: 'text-gray-300' }
};

export function getCategoryInfo(category) {
  return categoryLabels[category] || categoryLabels.other;
}

// Analyze commits and generate statistics
export function analyzeCommits(commits) {
  const categories = {};
  const hourlyActivity = new Array(24).fill(0);
  const dailyActivity = new Array(7).fill(0);
  const fileTypes = {};

  for (const commit of commits) {
    // Category analysis
    const category = categorizeCommit(commit.commit?.message || '');
    categories[category] = (categories[category] || 0) + 1;

    // Time analysis
    const date = new Date(commit.commit?.author?.date);
    hourlyActivity[date.getHours()]++;
    dailyActivity[date.getDay()]++;

    // Extract file types from commit message hints
    const message = commit.commit?.message || '';
    const fileMatches = message.match(/\.(js|ts|jsx|tsx|css|html|json|py|go|rs|java|md|yml|yaml)/gi);
    if (fileMatches) {
      fileMatches.forEach(ext => {
        const normalized = ext.toLowerCase();
        fileTypes[normalized] = (fileTypes[normalized] || 0) + 1;
      });
    }
  }

  return {
    categories,
    hourlyActivity,
    dailyActivity,
    fileTypes,
    totalCommits: commits.length
  };
}

// Generate AI-style summary for a developer
export function generateDeveloperSummary(developer, timeframe = 'this period') {
  const { name, commits, stats } = developer;
  const analysis = analyzeCommits(commits);

  // Determine primary focus
  const sortedCategories = Object.entries(analysis.categories)
    .sort(([, a], [, b]) => b - a);

  const primaryFocus = sortedCategories[0];
  const secondaryFocus = sortedCategories[1];

  // Determine work pattern
  const peakHour = analysis.hourlyActivity.indexOf(Math.max(...analysis.hourlyActivity));
  const workPattern = peakHour < 12 ? 'morning' : peakHour < 17 ? 'afternoon' : 'evening';

  // Calculate productivity metrics
  const daysActive = new Set(
    commits.map(c => new Date(c.commit?.author?.date).toISOString().split('T')[0])
  ).size;

  const avgCommitsPerDay = daysActive > 0 ? (commits.length / daysActive).toFixed(1) : 0;

  // Generate summary sections
  const summary = {
    headline: generateHeadline(name, commits.length, primaryFocus, timeframe),
    overview: generateOverview(name, stats, daysActive, avgCommitsPerDay),
    focusAreas: generateFocusAreas(sortedCategories),
    workPattern: generateWorkPattern(workPattern, peakHour, analysis.dailyActivity),
    repositories: generateRepoSummary(stats.repositories, commits),
    recentHighlights: getRecentHighlights(commits.slice(0, 5)),
    insights: generateInsights(analysis, stats, commits)
  };

  return summary;
}

function generateHeadline(name, commitCount, primaryFocus, timeframe) {
  const focusInfo = primaryFocus ? getCategoryInfo(primaryFocus[0]) : null;

  if (commitCount === 0) {
    return `${name} had no commits during ${timeframe}.`;
  }

  if (commitCount < 5) {
    return `${name} made ${commitCount} commit${commitCount > 1 ? 's' : ''} during ${timeframe}.`;
  }

  if (focusInfo) {
    return `${name} was highly active with ${commitCount} commits, primarily focused on ${focusInfo.label.toLowerCase()}.`;
  }

  return `${name} contributed ${commitCount} commits across the workspace during ${timeframe}.`;
}

function generateOverview(name, stats, daysActive, avgCommitsPerDay) {
  const repoCount = stats.repositories.length;

  return {
    text: `Active across ${repoCount} repositor${repoCount === 1 ? 'y' : 'ies'} over ${daysActive} day${daysActive === 1 ? '' : 's'}, averaging ${avgCommitsPerDay} commits per active day.`,
    metrics: {
      totalCommits: stats.totalCommits,
      repositories: repoCount,
      daysActive,
      avgCommitsPerDay: parseFloat(avgCommitsPerDay)
    }
  };
}

function generateFocusAreas(sortedCategories) {
  return sortedCategories
    .filter(([, count]) => count > 0)
    .slice(0, 5)
    .map(([category, count]) => ({
      category,
      count,
      ...getCategoryInfo(category)
    }));
}

function generateWorkPattern(pattern, peakHour, dailyActivity) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const peakDay = dailyActivity.indexOf(Math.max(...dailyActivity));
  const isWeekendWorker = dailyActivity[0] + dailyActivity[6] > dailyActivity[1] + dailyActivity[5];

  const hourLabel = peakHour === 0 ? '12 AM' :
    peakHour < 12 ? `${peakHour} AM` :
      peakHour === 12 ? '12 PM' : `${peakHour - 12} PM`;

  return {
    pattern,
    peakHour: hourLabel,
    peakDay: dayNames[peakDay],
    isWeekendWorker,
    description: `Most active during ${pattern} hours (peak: ${hourLabel}), with ${dayNames[peakDay]} being the most productive day.${isWeekendWorker ? ' Shows weekend activity.' : ''}`
  };
}

function generateRepoSummary(repositories, commits) {
  const repoCommits = {};

  for (const commit of commits) {
    const repo = commit.repository?.full_name || 'Unknown';
    repoCommits[repo] = (repoCommits[repo] || 0) + 1;
  }

  return Object.entries(repoCommits)
    .sort(([, a], [, b]) => b - a)
    .map(([repo, count]) => ({
      name: repo,
      commits: count,
      percentage: ((count / commits.length) * 100).toFixed(1)
    }));
}

function getRecentHighlights(recentCommits) {
  return recentCommits.map(commit => ({
    message: commit.commit?.message?.split('\n')[0] || 'No message',
    date: commit.commit?.author?.date,
    repo: commit.repository?.name || 'Unknown',
    sha: commit.sha?.substring(0, 7),
    category: categorizeCommit(commit.commit?.message || '')
  }));
}

function generateInsights(analysis, stats, commits) {
  const insights = [];

  // High activity insight
  if (stats.totalCommits > 50) {
    insights.push({
      type: 'high_activity',
      icon: '🔥',
      text: 'High activity developer - one of the top contributors in the workspace.'
    });
  }

  // Diverse contributor
  if (stats.repositories.length > 3) {
    insights.push({
      type: 'diverse',
      icon: '🌐',
      text: `Cross-functional contributor working across ${stats.repositories.length} different repositories.`
    });
  }

  // Bug hunter
  const bugFixes = analysis.categories.bugfix || 0;
  if (bugFixes > stats.totalCommits * 0.3) {
    insights.push({
      type: 'bug_hunter',
      icon: '🐛',
      text: 'Bug hunter - significant portion of work dedicated to fixing issues.'
    });
  }

  // Feature builder
  const features = analysis.categories.feature || 0;
  if (features > stats.totalCommits * 0.3) {
    insights.push({
      type: 'feature_builder',
      icon: '✨',
      text: 'Feature builder - primary focus on shipping new functionality.'
    });
  }

  // Consistent contributor
  const uniqueDays = new Set(
    commits.map(c => new Date(c.commit?.author?.date).toISOString().split('T')[0])
  ).size;

  if (uniqueDays > 14) {
    insights.push({
      type: 'consistent',
      icon: '📈',
      text: 'Consistent contributor with sustained activity over multiple weeks.'
    });
  }

  // Night owl
  const nightCommits = analysis.hourlyActivity.slice(22).reduce((a, b) => a + b, 0) +
    analysis.hourlyActivity.slice(0, 6).reduce((a, b) => a + b, 0);

  if (nightCommits > stats.totalCommits * 0.3) {
    insights.push({
      type: 'night_owl',
      icon: '🦉',
      text: 'Night owl - substantial amount of work done during late night hours.'
    });
  }

  return insights;
}

// Generate workspace-wide summary
export function generateWorkspaceSummary(commits, developers, repos, timeframe) {
  const totalCommits = commits.length;
  const totalDevelopers = developers.length;
  const totalRepos = repos?.length || new Set(commits.map(c => c.repository?.full_name)).size;

  // Get date range
  const dates = commits.map(c => new Date(c.commit?.author?.date)).filter(d => !isNaN(d));
  const earliestDate = dates.length ? new Date(Math.min(...dates)) : null;
  const latestDate = dates.length ? new Date(Math.max(...dates)) : null;

  // Top contributors
  const topContributors = developers.slice(0, 5).map(d => ({
    name: d.name,
    commits: d.stats.totalCommits,
    avatar: d.avatar
  }));

  // Most active repos
  const repoActivity = {};
  for (const commit of commits) {
    const repo = commit.repository?.full_name || 'Unknown';
    repoActivity[repo] = (repoActivity[repo] || 0) + 1;
  }

  const topRepos = Object.entries(repoActivity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, commits: count }));

  // Overall category breakdown
  const overallAnalysis = analyzeCommits(commits);

  return {
    headline: `${totalCommits} commits by ${totalDevelopers} developers across ${totalRepos} repositories`,
    dateRange: earliestDate && latestDate ? {
      start: earliestDate.toLocaleDateString(),
      end: latestDate.toLocaleDateString()
    } : null,
    metrics: {
      totalCommits,
      totalDevelopers,
      totalRepos,
      avgCommitsPerDev: (totalCommits / totalDevelopers).toFixed(1)
    },
    topContributors,
    topRepos,
    categoryBreakdown: Object.entries(overallAnalysis.categories)
      .sort(([, a], [, b]) => b - a)
      .map(([category, count]) => ({
        category,
        count,
        percentage: ((count / totalCommits) * 100).toFixed(1),
        ...getCategoryInfo(category)
      })),
    activityTrend: calculateActivityTrend(commits)
  };
}

function calculateActivityTrend(commits) {
  const dayMap = {};

  for (const commit of commits) {
    const date = new Date(commit.commit?.author?.date).toISOString().split('T')[0];
    dayMap[date] = (dayMap[date] || 0) + 1;
  }

  const sortedDays = Object.entries(dayMap).sort(([a], [b]) => a.localeCompare(b));

  return sortedDays.map(([date, count]) => ({
    date,
    count
  }));
}
