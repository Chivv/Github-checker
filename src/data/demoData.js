// Demo data for Ecom Traffic workspace
// This simulates realistic commit activity for demonstration purposes

const developers = [
  {
    name: 'Sarah Chen',
    login: 'sarahchen',
    email: 'sarah.chen@ecomtraffic.io',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
  },
  {
    name: 'Marcus Johnson',
    login: 'mjohnson',
    email: 'marcus.j@ecomtraffic.io',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus'
  },
  {
    name: 'Elena Rodriguez',
    login: 'elenarodriguez',
    email: 'elena.r@ecomtraffic.io',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elena'
  },
  {
    name: 'James Wilson',
    login: 'jwilson',
    email: 'james.w@ecomtraffic.io',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james'
  },
  {
    name: 'Priya Patel',
    login: 'priyap',
    email: 'priya.p@ecomtraffic.io',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya'
  },
  {
    name: 'Alex Kim',
    login: 'alexkim',
    email: 'alex.k@ecomtraffic.io',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'
  },
  {
    name: 'David Thompson',
    login: 'dthompson',
    email: 'david.t@ecomtraffic.io',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david'
  },
  {
    name: 'Maria Garcia',
    login: 'mgarcia',
    email: 'maria.g@ecomtraffic.io',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria'
  }
];

const repos = [
  { name: 'ecom-traffic/storefront', description: 'Main customer-facing storefront' },
  { name: 'ecom-traffic/checkout-service', description: 'Checkout and payment processing' },
  { name: 'ecom-traffic/inventory-api', description: 'Inventory management API' },
  { name: 'ecom-traffic/analytics-dashboard', description: 'Internal analytics dashboard' },
  { name: 'ecom-traffic/mobile-app', description: 'React Native mobile application' },
  { name: 'ecom-traffic/notification-service', description: 'Email and push notifications' },
  { name: 'ecom-traffic/search-engine', description: 'Product search and recommendations' },
  { name: 'ecom-traffic/admin-panel', description: 'Admin management interface' },
  { name: 'ecom-traffic/shipping-integration', description: 'Shipping carrier integrations' },
  { name: 'ecom-traffic/customer-service-bot', description: 'AI customer support chatbot' }
];

const commitMessages = {
  feature: [
    'feat: Add product comparison feature',
    'feat: Implement wishlist functionality',
    'feat: Add multi-currency support',
    'feat: Create order tracking page',
    'feat: Implement product reviews system',
    'feat: Add social login options',
    'feat: Create loyalty points system',
    'feat: Implement saved payment methods',
    'feat: Add product bundling feature',
    'feat: Create gift card system',
    'feat: Implement real-time inventory updates',
    'feat: Add personalized recommendations',
    'feat: Create subscription service',
    'feat: Implement A/B testing framework',
    'feat: Add customer segmentation'
  ],
  bugfix: [
    'fix: Resolve cart total calculation issue',
    'fix: Fix checkout timeout errors',
    'fix: Correct shipping rate calculations',
    'fix: Fix mobile responsive layout',
    'fix: Resolve payment gateway timeout',
    'fix: Fix search results pagination',
    'fix: Correct inventory sync delays',
    'fix: Fix user session handling',
    'fix: Resolve image upload failures',
    'fix: Fix email template rendering',
    'fix: Correct tax calculation for EU',
    'fix: Fix order status webhook',
    'fix: Resolve cache invalidation issue',
    'fix: Fix product variant selection',
    'fix: Correct discount code validation'
  ],
  refactor: [
    'refactor: Improve checkout flow performance',
    'refactor: Optimize database queries',
    'refactor: Clean up authentication module',
    'refactor: Restructure API endpoints',
    'refactor: Improve error handling',
    'refactor: Optimize image loading',
    'refactor: Clean up legacy code',
    'refactor: Improve caching strategy',
    'refactor: Restructure component hierarchy',
    'refactor: Optimize bundle size'
  ],
  docs: [
    'docs: Update API documentation',
    'docs: Add deployment guide',
    'docs: Update README with setup instructions',
    'docs: Document webhook integration',
    'docs: Add troubleshooting guide'
  ],
  test: [
    'test: Add checkout flow tests',
    'test: Improve coverage for auth module',
    'test: Add integration tests for API',
    'test: Create E2E tests for cart',
    'test: Add unit tests for validators'
  ],
  chore: [
    'chore: Update dependencies',
    'chore: Upgrade to Node 20',
    'chore: Update CI configuration',
    'chore: Bump version to 2.5.0',
    'chore: Clean up unused packages'
  ],
  ci: [
    'ci: Add automated deployment',
    'ci: Configure staging environment',
    'ci: Add performance benchmarks',
    'ci: Setup monitoring alerts',
    'ci: Add security scanning'
  ],
  style: [
    'style: Update button components',
    'style: Improve dark mode colors',
    'style: Fix mobile navigation styles',
    'style: Update product card design',
    'style: Improve form input styling'
  ],
  performance: [
    'perf: Optimize product page load time',
    'perf: Implement lazy loading for images',
    'perf: Cache API responses',
    'perf: Optimize search queries',
    'perf: Reduce bundle size by 40%'
  ],
  security: [
    'security: Implement rate limiting',
    'security: Add CSRF protection',
    'security: Update authentication tokens',
    'security: Fix XSS vulnerability',
    'security: Implement input sanitization'
  ]
};

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSha() {
  return Math.random().toString(16).substring(2, 42);
}

function getCommitDistribution(developerIndex) {
  // Different developers have different activity patterns
  const patterns = [
    { feature: 35, bugfix: 25, refactor: 15, test: 10, chore: 5, docs: 5, ci: 3, style: 2 },
    { bugfix: 40, feature: 20, refactor: 15, test: 10, security: 8, chore: 5, docs: 2 },
    { feature: 45, style: 20, refactor: 15, docs: 10, test: 5, chore: 5 },
    { refactor: 35, performance: 25, bugfix: 15, feature: 10, test: 10, ci: 5 },
    { test: 40, bugfix: 25, feature: 15, refactor: 10, docs: 5, ci: 5 },
    { ci: 35, chore: 25, security: 15, performance: 10, feature: 10, docs: 5 },
    { feature: 30, bugfix: 30, style: 15, test: 10, refactor: 10, docs: 5 },
    { docs: 30, feature: 25, bugfix: 20, test: 15, refactor: 5, chore: 5 }
  ];
  return patterns[developerIndex % patterns.length];
}

function getRandomMessageType(distribution) {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  let random = Math.random() * total;

  for (const [type, weight] of Object.entries(distribution)) {
    random -= weight;
    if (random <= 0) return type;
  }
  return 'feature';
}

export function generateDemoData(timeframe = '30d') {
  const now = new Date();
  let daysBack;

  switch (timeframe) {
    case '7d': daysBack = 7; break;
    case '30d': daysBack = 30; break;
    case '90d': daysBack = 90; break;
    case '365d': daysBack = 365; break;
    default: daysBack = 30;
  }

  const commits = [];
  const commitCounts = [
    Math.floor(45 * (daysBack / 30)), // Sarah - high activity
    Math.floor(38 * (daysBack / 30)), // Marcus
    Math.floor(35 * (daysBack / 30)), // Elena
    Math.floor(28 * (daysBack / 30)), // James
    Math.floor(25 * (daysBack / 30)), // Priya
    Math.floor(22 * (daysBack / 30)), // Alex
    Math.floor(18 * (daysBack / 30)), // David
    Math.floor(15 * (daysBack / 30))  // Maria
  ];

  developers.forEach((dev, devIndex) => {
    const numCommits = commitCounts[devIndex];
    const distribution = getCommitDistribution(devIndex);

    // Assign repos to developers (each dev works on 2-4 repos primarily)
    const primaryRepos = repos.slice(devIndex % 3, (devIndex % 3) + 3 + (devIndex % 2));

    for (let i = 0; i < numCommits; i++) {
      const daysAgo = Math.floor(Math.random() * daysBack);
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);

      const commitDate = new Date(now);
      commitDate.setDate(commitDate.getDate() - daysAgo);
      commitDate.setHours(hoursAgo, minutesAgo, 0, 0);

      // Bias toward working hours (9 AM - 6 PM) but allow some late night commits
      if (Math.random() > 0.2) {
        const workHour = 9 + Math.floor(Math.random() * 9);
        commitDate.setHours(workHour);
      }

      const messageType = getRandomMessageType(distribution);
      const messages = commitMessages[messageType] || commitMessages.feature;
      const repo = randomChoice(primaryRepos);

      commits.push({
        sha: generateSha(),
        commit: {
          author: {
            name: dev.name,
            email: dev.email,
            date: commitDate.toISOString()
          },
          message: randomChoice(messages)
        },
        author: {
          login: dev.login,
          avatar_url: dev.avatar
        },
        repository: {
          owner: 'ecom-traffic',
          name: repo.name.split('/')[1],
          full_name: repo.name
        }
      });
    }
  });

  // Sort commits by date (newest first)
  commits.sort((a, b) => new Date(b.commit.author.date) - new Date(a.commit.author.date));

  return {
    commits,
    repos: repos.map(r => ({
      name: r.name,
      full_name: r.name,
      description: r.description,
      owner: { login: 'ecom-traffic' }
    }))
  };
}
