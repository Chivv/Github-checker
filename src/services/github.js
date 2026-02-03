// GitHub API Service for fetching workspace commits

const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubService {
  constructor(token) {
    this.token = token;
    this.headers = {
      'Accept': 'application/vnd.github.v3+json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async fetchWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: { ...this.headers, ...options.headers }
        });

        if (response.status === 403) {
          const resetTime = response.headers.get('X-RateLimit-Reset');
          throw new Error(`Rate limited. Resets at ${new Date(resetTime * 1000).toLocaleTimeString()}`);
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }

  async getOrganizationRepos(org, options = {}) {
    const { perPage = 100, type = 'all' } = options;
    let allRepos = [];
    let page = 1;

    while (true) {
      const repos = await this.fetchWithRetry(
        `${GITHUB_API_BASE}/orgs/${org}/repos?per_page=${perPage}&page=${page}&type=${type}&sort=pushed`
      );

      if (repos.length === 0) break;
      allRepos = [...allRepos, ...repos];
      if (repos.length < perPage) break;
      page++;
    }

    return allRepos;
  }

  async getUserRepos(username, options = {}) {
    const { perPage = 100 } = options;
    let allRepos = [];
    let page = 1;

    while (true) {
      const repos = await this.fetchWithRetry(
        `${GITHUB_API_BASE}/users/${username}/repos?per_page=${perPage}&page=${page}&sort=pushed`
      );

      if (repos.length === 0) break;
      allRepos = [...allRepos, ...repos];
      if (repos.length < perPage) break;
      page++;
    }

    return allRepos;
  }

  async getRepoCommits(owner, repo, options = {}) {
    const { since, until, author, perPage = 100 } = options;
    let allCommits = [];
    let page = 1;

    const params = new URLSearchParams({ per_page: perPage.toString() });
    if (since) params.append('since', since);
    if (until) params.append('until', until);
    if (author) params.append('author', author);

    while (true) {
      params.set('page', page.toString());

      try {
        const commits = await this.fetchWithRetry(
          `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?${params}`
        );

        if (commits.length === 0) break;

        const enrichedCommits = commits.map(c => ({
          ...c,
          repository: { owner, name: repo, full_name: `${owner}/${repo}` }
        }));

        allCommits = [...allCommits, ...enrichedCommits];
        if (commits.length < perPage) break;
        page++;
      } catch (error) {
        // Repository might be empty or have no commits
        console.warn(`Could not fetch commits for ${owner}/${repo}:`, error.message);
        break;
      }
    }

    return allCommits;
  }

  async getAllWorkspaceCommits(org, options = {}) {
    const { since, until, onProgress } = options;

    // First, get all repos
    const repos = await this.getOrganizationRepos(org);

    if (onProgress) onProgress({ phase: 'repos', total: repos.length, current: 0 });

    let allCommits = [];

    for (let i = 0; i < repos.length; i++) {
      const repo = repos[i];

      if (onProgress) {
        onProgress({
          phase: 'commits',
          total: repos.length,
          current: i + 1,
          repoName: repo.name
        });
      }

      const commits = await this.getRepoCommits(repo.owner.login, repo.name, { since, until });
      allCommits = [...allCommits, ...commits];
    }

    return { repos, commits: allCommits };
  }

  async getCommitDetails(owner, repo, sha) {
    return this.fetchWithRetry(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits/${sha}`
    );
  }
}

// Utility functions for commit analysis
export function groupCommitsByAuthor(commits) {
  const grouped = {};

  for (const commit of commits) {
    const authorName = commit.commit?.author?.name || commit.author?.login || 'Unknown';
    const authorEmail = commit.commit?.author?.email || '';
    const authorKey = `${authorName}|${authorEmail}`;

    if (!grouped[authorKey]) {
      grouped[authorKey] = {
        name: authorName,
        email: authorEmail,
        avatar: commit.author?.avatar_url || null,
        login: commit.author?.login || null,
        commits: [],
        stats: {
          totalCommits: 0,
          repositories: new Set(),
          firstCommit: null,
          lastCommit: null
        }
      };
    }

    grouped[authorKey].commits.push(commit);
    grouped[authorKey].stats.totalCommits++;
    grouped[authorKey].stats.repositories.add(commit.repository?.full_name);

    const commitDate = new Date(commit.commit?.author?.date);
    if (!grouped[authorKey].stats.firstCommit || commitDate < grouped[authorKey].stats.firstCommit) {
      grouped[authorKey].stats.firstCommit = commitDate;
    }
    if (!grouped[authorKey].stats.lastCommit || commitDate > grouped[authorKey].stats.lastCommit) {
      grouped[authorKey].stats.lastCommit = commitDate;
    }
  }

  // Convert Sets to arrays and sort by total commits
  return Object.values(grouped)
    .map(author => ({
      ...author,
      stats: {
        ...author.stats,
        repositories: Array.from(author.stats.repositories)
      }
    }))
    .sort((a, b) => b.stats.totalCommits - a.stats.totalCommits);
}

export function groupCommitsByDate(commits) {
  const grouped = {};

  for (const commit of commits) {
    const date = new Date(commit.commit?.author?.date);
    const dateKey = date.toISOString().split('T')[0];

    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: dateKey,
        commits: [],
        authors: new Set()
      };
    }

    grouped[dateKey].commits.push(commit);
    grouped[dateKey].authors.add(commit.commit?.author?.name || 'Unknown');
  }

  return Object.values(grouped)
    .map(day => ({
      ...day,
      authors: Array.from(day.authors)
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function groupCommitsByRepository(commits) {
  const grouped = {};

  for (const commit of commits) {
    const repoKey = commit.repository?.full_name || 'Unknown';

    if (!grouped[repoKey]) {
      grouped[repoKey] = {
        name: repoKey,
        commits: [],
        authors: new Set()
      };
    }

    grouped[repoKey].commits.push(commit);
    grouped[repoKey].authors.add(commit.commit?.author?.name || 'Unknown');
  }

  return Object.values(grouped)
    .map(repo => ({
      ...repo,
      authors: Array.from(repo.authors)
    }))
    .sort((a, b) => b.commits.length - a.commits.length);
}

export function getActivityHeatmap(commits) {
  const heatmap = {};

  for (const commit of commits) {
    const date = new Date(commit.commit?.author?.date);
    const dateKey = date.toISOString().split('T')[0];
    heatmap[dateKey] = (heatmap[dateKey] || 0) + 1;
  }

  return heatmap;
}
