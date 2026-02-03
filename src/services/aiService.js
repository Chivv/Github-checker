// Real AI Integration for human-readable developer summaries
// Supports OpenAI and Anthropic APIs with cost-effective batching

const AI_PROVIDERS = {
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic'
};

// Cache for AI responses to avoid redundant API calls
const responseCache = new Map();

export class AIService {
  constructor(config = {}) {
    this.provider = config.provider || AI_PROVIDERS.OPENAI;
    this.apiKey = config.apiKey;
    this.model = config.model || this.getDefaultModel();
    this.cacheEnabled = config.cacheEnabled !== false;
  }

  getDefaultModel() {
    // Cost-effective models that still give great results
    return this.provider === AI_PROVIDERS.OPENAI
      ? 'gpt-3.5-turbo' // ~$0.002 per 1K tokens
      : 'claude-3-haiku-20240307'; // Cheapest Claude model
  }

  getCacheKey(type, data) {
    return `${type}:${JSON.stringify(data).substring(0, 200)}`;
  }

  async generateDeveloperSummary(developer, commits, timeframe) {
    const cacheKey = this.getCacheKey('dev-summary', {
      name: developer.name,
      commitCount: commits.length,
      timeframe
    });

    if (this.cacheEnabled && responseCache.has(cacheKey)) {
      return responseCache.get(cacheKey);
    }

    // Prepare commit data for AI (limit to save tokens)
    const commitSummary = this.prepareCommitSummary(commits.slice(0, 50));

    const prompt = `Analyze this developer's Git activity and write a brief, human-readable summary (2-3 sentences) of what they accomplished. Be specific about features shipped.

Developer: ${developer.name}
Timeframe: ${timeframe}
Total Commits: ${commits.length}
Repositories: ${[...new Set(commits.map(c => c.repository?.name))].join(', ')}

Recent commits:
${commitSummary}

Write a professional summary focusing on:
1. Key features or fixes they shipped
2. Their main areas of focus
3. Overall contribution impact

Keep it concise and factual. Start directly with their name.`;

    try {
      const response = await this.callAI(prompt);
      if (this.cacheEnabled) {
        responseCache.set(cacheKey, response);
      }
      return response;
    } catch (error) {
      console.error('AI Summary generation failed:', error);
      return this.generateFallbackSummary(developer, commits, timeframe);
    }
  }

  async generateTeamSummary(developers, commits, timeframe) {
    const cacheKey = this.getCacheKey('team-summary', {
      devCount: developers.length,
      commitCount: commits.length,
      timeframe
    });

    if (this.cacheEnabled && responseCache.has(cacheKey)) {
      return responseCache.get(cacheKey);
    }

    // Prepare aggregated data
    const topContributors = developers.slice(0, 5).map(d =>
      `${d.name}: ${d.stats.totalCommits} commits`
    ).join('\n');

    const repoActivity = this.getRepoSummary(commits);
    const categoryBreakdown = this.getCategoryBreakdown(commits);

    const prompt = `Write an executive summary (3-4 sentences) of this development team's activity for ${timeframe}.

Team Size: ${developers.length} developers
Total Commits: ${commits.length}

Top Contributors:
${topContributors}

Work Breakdown:
${categoryBreakdown}

Most Active Repositories:
${repoActivity}

Write a clear, professional summary suitable for a manager reviewing team productivity. Highlight key accomplishments and any notable patterns.`;

    try {
      const response = await this.callAI(prompt);
      if (this.cacheEnabled) {
        responseCache.set(cacheKey, response);
      }
      return response;
    } catch (error) {
      console.error('Team summary generation failed:', error);
      return `The team made ${commits.length} commits across ${developers.length} developers during ${timeframe}.`;
    }
  }

  async generateDailySummary(dayData) {
    const cacheKey = this.getCacheKey('daily', { date: dayData.date, count: dayData.commits.length });

    if (this.cacheEnabled && responseCache.has(cacheKey)) {
      return responseCache.get(cacheKey);
    }

    const commitList = dayData.commits.slice(0, 20).map(c =>
      `- ${c.commit?.message?.split('\n')[0]} (${c.commit?.author?.name})`
    ).join('\n');

    const prompt = `Summarize this day's development activity in 1-2 sentences.

Date: ${dayData.date} (${dayData.dayName})
Commits: ${dayData.commits.length}
Contributors: ${dayData.authors.join(', ')}

Commits:
${commitList}

Write a brief, factual summary of what was accomplished.`;

    try {
      const response = await this.callAI(prompt);
      if (this.cacheEnabled) {
        responseCache.set(cacheKey, response);
      }
      return response;
    } catch (error) {
      return `${dayData.commits.length} commits by ${dayData.authors.length} developers.`;
    }
  }

  async callAI(prompt) {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    if (this.provider === AI_PROVIDERS.OPENAI) {
      return this.callOpenAI(prompt);
    } else {
      return this.callAnthropic(prompt);
    }
  }

  async callOpenAI(prompt) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a technical writer summarizing developer activity. Be concise, specific, and professional.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async callAnthropic(prompt) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 200,
        messages: [
          { role: 'user', content: prompt }
        ],
        system: 'You are a technical writer summarizing developer activity. Be concise, specific, and professional.'
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '';
  }

  prepareCommitSummary(commits) {
    return commits.map(c => {
      const msg = c.commit?.message?.split('\n')[0] || 'No message';
      const repo = c.repository?.name || 'unknown';
      return `- [${repo}] ${msg}`;
    }).join('\n');
  }

  getRepoSummary(commits) {
    const repos = {};
    commits.forEach(c => {
      const repo = c.repository?.name || 'unknown';
      repos[repo] = (repos[repo] || 0) + 1;
    });
    return Object.entries(repos)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([repo, count]) => `${repo}: ${count} commits`)
      .join('\n');
  }

  getCategoryBreakdown(commits) {
    const categories = { features: 0, fixes: 0, refactoring: 0, other: 0 };
    commits.forEach(c => {
      const msg = c.commit?.message?.toLowerCase() || '';
      if (msg.startsWith('feat')) categories.features++;
      else if (msg.startsWith('fix')) categories.fixes++;
      else if (msg.startsWith('refactor')) categories.refactoring++;
      else categories.other++;
    });
    return Object.entries(categories)
      .filter(([,v]) => v > 0)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
  }

  generateFallbackSummary(developer, commits, timeframe) {
    // Rule-based fallback when AI is unavailable
    const repos = [...new Set(commits.map(c => c.repository?.name))];
    const features = commits.filter(c => c.commit?.message?.toLowerCase().startsWith('feat')).length;
    const fixes = commits.filter(c => c.commit?.message?.toLowerCase().startsWith('fix')).length;

    let focus = 'general development';
    if (features > fixes && features > commits.length * 0.3) focus = 'shipping new features';
    else if (fixes > features && fixes > commits.length * 0.3) focus = 'bug fixes and maintenance';

    return `${developer.name} made ${commits.length} commits across ${repos.length} repositories during ${timeframe}, primarily focused on ${focus}.`;
  }

  clearCache() {
    responseCache.clear();
  }
}

// Batch processor for cost-effective AI calls
export class AIBatchProcessor {
  constructor(aiService) {
    this.aiService = aiService;
    this.queue = [];
    this.processing = false;
  }

  async addToQueue(type, data) {
    return new Promise((resolve, reject) => {
      this.queue.push({ type, data, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    // Process in batches of 5 with delays to avoid rate limits
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, 5);

      await Promise.all(batch.map(async (item) => {
        try {
          let result;
          switch (item.type) {
            case 'developer':
              result = await this.aiService.generateDeveloperSummary(
                item.data.developer,
                item.data.commits,
                item.data.timeframe
              );
              break;
            case 'daily':
              result = await this.aiService.generateDailySummary(item.data);
              break;
            case 'team':
              result = await this.aiService.generateTeamSummary(
                item.data.developers,
                item.data.commits,
                item.data.timeframe
              );
              break;
            default:
              result = null;
          }
          item.resolve(result);
        } catch (error) {
          item.reject(error);
        }
      }));

      // Rate limit delay
      if (this.queue.length > 0) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    this.processing = false;
  }
}

export { AI_PROVIDERS };
