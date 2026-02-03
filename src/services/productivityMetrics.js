// Enhanced productivity metrics and analysis

// Calculate productivity score (0-100) based on multiple factors
export function calculateProductivityScore(developer, timeframeDays = 30) {
  const { commits, stats } = developer;

  if (commits.length === 0) return { score: 0, breakdown: {} };

  // Factor 1: Commit frequency (max 25 points)
  // Expected: at least 1 commit per working day (22 days/month)
  const expectedCommits = Math.ceil(timeframeDays * 0.7); // 70% of days
  const frequencyScore = Math.min(25, (commits.length / expectedCommits) * 25);

  // Factor 2: Consistency (max 25 points)
  // How spread out are commits across the timeframe
  const uniqueDays = new Set(
    commits.map(c => new Date(c.commit?.author?.date).toISOString().split('T')[0])
  ).size;
  const consistencyScore = Math.min(25, (uniqueDays / timeframeDays) * 50);

  // Factor 3: Repository diversity (max 20 points)
  // Working across multiple repos shows broader impact
  const repoCount = stats.repositories.length;
  const diversityScore = Math.min(20, repoCount * 5);

  // Factor 4: Commit quality indicators (max 30 points)
  // Based on commit message patterns (features vs fixes vs chores)
  let qualityScore = 0;
  for (const commit of commits) {
    const msg = commit.commit?.message?.toLowerCase() || '';
    if (msg.startsWith('feat')) qualityScore += 3;
    else if (msg.startsWith('fix')) qualityScore += 2.5;
    else if (msg.startsWith('refactor')) qualityScore += 2;
    else if (msg.startsWith('test')) qualityScore += 2;
    else if (msg.startsWith('docs')) qualityScore += 1;
    else qualityScore += 1;
  }
  qualityScore = Math.min(30, (qualityScore / commits.length) * 10);

  const totalScore = Math.round(frequencyScore + consistencyScore + diversityScore + qualityScore);

  return {
    score: Math.min(100, totalScore),
    breakdown: {
      frequency: Math.round(frequencyScore),
      consistency: Math.round(consistencyScore),
      diversity: Math.round(diversityScore),
      quality: Math.round(qualityScore)
    },
    level: getProductivityLevel(totalScore)
  };
}

function getProductivityLevel(score) {
  if (score >= 85) return { label: 'Exceptional', color: 'text-green-400', bg: 'bg-green-400' };
  if (score >= 70) return { label: 'High', color: 'text-blue-400', bg: 'bg-blue-400' };
  if (score >= 50) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-400' };
  if (score >= 30) return { label: 'Low', color: 'text-orange-400', bg: 'bg-orange-400' };
  return { label: 'Minimal', color: 'text-red-400', bg: 'bg-red-400' };
}

// Calculate activity streaks
export function calculateStreaks(commits) {
  if (commits.length === 0) return { current: 0, longest: 0, streakDays: [] };

  const dates = [...new Set(
    commits.map(c => new Date(c.commit?.author?.date).toISOString().split('T')[0])
  )].sort();

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Check if currently on a streak
  const lastCommitDate = dates[dates.length - 1];
  const isActiveStreak = lastCommitDate === today || lastCommitDate === yesterday;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Calculate current streak
  if (isActiveStreak) {
    currentStreak = 1;
    for (let i = dates.length - 2; i >= 0; i--) {
      const currDate = new Date(dates[i + 1]);
      const prevDate = new Date(dates[i]);
      const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  return {
    current: currentStreak,
    longest: longestStreak,
    isActive: isActiveStreak,
    lastActive: lastCommitDate
  };
}

// Check for inactivity
export function checkInactivity(developer, thresholdDays = 7) {
  const { commits } = developer;

  if (commits.length === 0) {
    return { isInactive: true, daysSinceLastCommit: null, alert: 'critical' };
  }

  const lastCommitDate = new Date(
    Math.max(...commits.map(c => new Date(c.commit?.author?.date)))
  );
  const now = new Date();
  const daysSinceLastCommit = Math.floor((now - lastCommitDate) / (1000 * 60 * 60 * 24));

  let alert = null;
  if (daysSinceLastCommit > thresholdDays * 2) {
    alert = 'critical';
  } else if (daysSinceLastCommit > thresholdDays) {
    alert = 'warning';
  }

  return {
    isInactive: daysSinceLastCommit > thresholdDays,
    daysSinceLastCommit,
    lastCommitDate: lastCommitDate.toISOString().split('T')[0],
    alert
  };
}

// Generate daily breakdown
export function generateDailyBreakdown(commits) {
  const dailyData = {};

  for (const commit of commits) {
    const date = new Date(commit.commit?.author?.date);
    const dateKey = date.toISOString().split('T')[0];
    const hour = date.getHours();

    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        date: dateKey,
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
        commits: [],
        authors: new Set(),
        repositories: new Set(),
        hourlyBreakdown: new Array(24).fill(0),
        categories: {}
      };
    }

    dailyData[dateKey].commits.push(commit);
    dailyData[dateKey].authors.add(commit.commit?.author?.name || 'Unknown');
    dailyData[dateKey].repositories.add(commit.repository?.full_name || 'Unknown');
    dailyData[dateKey].hourlyBreakdown[hour]++;

    // Categorize
    const msg = commit.commit?.message?.toLowerCase() || '';
    let category = 'other';
    if (msg.startsWith('feat')) category = 'feature';
    else if (msg.startsWith('fix')) category = 'bugfix';
    else if (msg.startsWith('refactor')) category = 'refactor';
    else if (msg.startsWith('test')) category = 'test';
    else if (msg.startsWith('doc')) category = 'docs';
    else if (msg.startsWith('chore')) category = 'chore';

    dailyData[dateKey].categories[category] = (dailyData[dateKey].categories[category] || 0) + 1;
  }

  return Object.values(dailyData)
    .map(day => ({
      ...day,
      authors: Array.from(day.authors),
      repositories: Array.from(day.repositories),
      commitCount: day.commits.length,
      peakHour: day.hourlyBreakdown.indexOf(Math.max(...day.hourlyBreakdown))
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Generate weekly summary
export function generateWeeklySummary(commits, developers) {
  const weeks = {};

  for (const commit of commits) {
    const date = new Date(commit.commit?.author?.date);
    const weekStart = getWeekStart(date);
    const weekKey = weekStart.toISOString().split('T')[0];

    if (!weeks[weekKey]) {
      weeks[weekKey] = {
        weekStart: weekKey,
        weekEnd: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        commits: [],
        authors: new Set(),
        repositories: new Set()
      };
    }

    weeks[weekKey].commits.push(commit);
    weeks[weekKey].authors.add(commit.commit?.author?.name || 'Unknown');
    weeks[weekKey].repositories.add(commit.repository?.full_name || 'Unknown');
  }

  return Object.values(weeks)
    .map(week => ({
      ...week,
      authors: Array.from(week.authors),
      repositories: Array.from(week.repositories),
      commitCount: week.commits.length,
      avgPerDay: (week.commits.length / 7).toFixed(1),
      topContributor: getTopContributor(week.commits)
    }))
    .sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart));
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getTopContributor(commits) {
  const counts = {};
  for (const commit of commits) {
    const author = commit.commit?.author?.name || 'Unknown';
    counts[author] = (counts[author] || 0) + 1;
  }
  const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
  return sorted[0] ? { name: sorted[0][0], commits: sorted[0][1] } : null;
}

// Compare two developers
export function compareDevelopers(dev1, dev2, timeframeDays = 30) {
  const score1 = calculateProductivityScore(dev1, timeframeDays);
  const score2 = calculateProductivityScore(dev2, timeframeDays);
  const streak1 = calculateStreaks(dev1.commits);
  const streak2 = calculateStreaks(dev2.commits);

  return {
    developer1: {
      name: dev1.name,
      avatar: dev1.avatar,
      commits: dev1.stats.totalCommits,
      repositories: dev1.stats.repositories.length,
      productivityScore: score1.score,
      currentStreak: streak1.current,
      longestStreak: streak1.longest
    },
    developer2: {
      name: dev2.name,
      avatar: dev2.avatar,
      commits: dev2.stats.totalCommits,
      repositories: dev2.stats.repositories.length,
      productivityScore: score2.score,
      currentStreak: streak2.current,
      longestStreak: streak2.longest
    },
    winner: {
      commits: dev1.stats.totalCommits > dev2.stats.totalCommits ? 1 : 2,
      productivity: score1.score > score2.score ? 1 : 2,
      streak: streak1.current > streak2.current ? 1 : 2
    }
  };
}

// Estimate lines of code (based on commit patterns)
export function estimateCodeContribution(commits) {
  // This is an estimation since we don't fetch actual diff stats
  // Based on typical commit sizes by type
  const estimates = {
    feature: { added: 150, removed: 30 },
    bugfix: { added: 25, removed: 15 },
    refactor: { added: 80, removed: 70 },
    test: { added: 100, removed: 20 },
    docs: { added: 50, removed: 10 },
    chore: { added: 20, removed: 10 },
    other: { added: 40, removed: 15 }
  };

  let totalAdded = 0;
  let totalRemoved = 0;

  for (const commit of commits) {
    const msg = commit.commit?.message?.toLowerCase() || '';
    let type = 'other';
    if (msg.startsWith('feat')) type = 'feature';
    else if (msg.startsWith('fix')) type = 'bugfix';
    else if (msg.startsWith('refactor')) type = 'refactor';
    else if (msg.startsWith('test')) type = 'test';
    else if (msg.startsWith('doc')) type = 'docs';
    else if (msg.startsWith('chore')) type = 'chore';

    totalAdded += estimates[type].added;
    totalRemoved += estimates[type].removed;
  }

  return {
    linesAdded: totalAdded,
    linesRemoved: totalRemoved,
    netLines: totalAdded - totalRemoved,
    isEstimate: true
  };
}
