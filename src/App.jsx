import { useState, useEffect, useCallback } from 'react';
import { GitHubService, groupCommitsByAuthor, groupCommitsByDate, groupCommitsByRepository } from './services/github';
import { generateDeveloperSummary, generateWorkspaceSummary } from './services/aiAnalysis';
import Header from './components/Header';
import SetupPanel from './components/SetupPanel';
import Dashboard from './components/Dashboard';
import DeveloperDetail from './components/DeveloperDetail';

// Demo data for showcasing the app without API token
import { generateDemoData } from './data/demoData';

function App() {
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('workspace-config');
    return saved ? JSON.parse(saved) : null;
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [useDemo, setUseDemo] = useState(false);

  const getDateRange = useCallback((tf) => {
    const now = new Date();
    let since;

    switch (tf) {
      case '7d':
        since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        since = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '365d':
        since = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return {
      since: since.toISOString(),
      until: now.toISOString()
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (useDemo) {
      setLoading(true);
      setError(null);

      // Simulate loading
      await new Promise(r => setTimeout(r, 1000));

      const demoData = generateDemoData(timeframe);
      const developers = groupCommitsByAuthor(demoData.commits);
      const byDate = groupCommitsByDate(demoData.commits);
      const byRepo = groupCommitsByRepository(demoData.commits);

      const developersWithSummaries = developers.map(dev => ({
        ...dev,
        summary: generateDeveloperSummary(dev, getTimeframeLabel(timeframe))
      }));

      const workspaceSummary = generateWorkspaceSummary(
        demoData.commits,
        developersWithSummaries,
        demoData.repos,
        getTimeframeLabel(timeframe)
      );

      setData({
        commits: demoData.commits,
        repos: demoData.repos,
        developers: developersWithSummaries,
        byDate,
        byRepo,
        workspaceSummary
      });

      setLoading(false);
      return;
    }

    if (!config?.organization || !config?.token) {
      return;
    }

    setLoading(true);
    setError(null);
    setProgress({ phase: 'starting', message: 'Initializing...' });

    try {
      const github = new GitHubService(config.token);
      const { since, until } = getDateRange(timeframe);

      const result = await github.getAllWorkspaceCommits(config.organization, {
        since,
        until,
        onProgress: (p) => {
          setProgress({
            phase: p.phase,
            message: p.phase === 'repos'
              ? `Found ${p.total} repositories...`
              : `Fetching commits from ${p.repoName} (${p.current}/${p.total})`,
            current: p.current,
            total: p.total
          });
        }
      });

      const developers = groupCommitsByAuthor(result.commits);
      const byDate = groupCommitsByDate(result.commits);
      const byRepo = groupCommitsByRepository(result.commits);

      // Generate AI summaries for each developer
      const developersWithSummaries = developers.map(dev => ({
        ...dev,
        summary: generateDeveloperSummary(dev, getTimeframeLabel(timeframe))
      }));

      const workspaceSummary = generateWorkspaceSummary(
        result.commits,
        developersWithSummaries,
        result.repos,
        getTimeframeLabel(timeframe)
      );

      setData({
        commits: result.commits,
        repos: result.repos,
        developers: developersWithSummaries,
        byDate,
        byRepo,
        workspaceSummary
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  }, [config, timeframe, getDateRange, useDemo]);

  useEffect(() => {
    if (config || useDemo) {
      fetchData();
    }
  }, [config, timeframe, useDemo]);

  const handleSetup = (newConfig) => {
    localStorage.setItem('workspace-config', JSON.stringify(newConfig));
    setConfig(newConfig);
    setUseDemo(false);
  };

  const handleReset = () => {
    localStorage.removeItem('workspace-config');
    setConfig(null);
    setData(null);
    setUseDemo(false);
  };

  const handleDemoMode = () => {
    setUseDemo(true);
    setConfig(null);
  };

  function getTimeframeLabel(tf) {
    switch (tf) {
      case '7d': return 'the last 7 days';
      case '30d': return 'the last 30 days';
      case '90d': return 'the last 90 days';
      case '365d': return 'the last year';
      default: return 'this period';
    }
  }

  return (
    <div className="min-h-screen bg-dashboard-bg text-dashboard-text">
      <Header
        config={config}
        onReset={handleReset}
        timeframe={timeframe}
        onTimeframeChange={setTimeframe}
        onRefresh={fetchData}
        loading={loading}
        useDemo={useDemo}
      />

      <main className="container mx-auto px-4 py-6">
        {!config && !useDemo ? (
          <SetupPanel onSetup={handleSetup} onDemoMode={handleDemoMode} />
        ) : selectedDeveloper ? (
          <DeveloperDetail
            developer={selectedDeveloper}
            onBack={() => setSelectedDeveloper(null)}
            timeframe={getTimeframeLabel(timeframe)}
          />
        ) : (
          <Dashboard
            data={data}
            loading={loading}
            error={error}
            progress={progress}
            onSelectDeveloper={setSelectedDeveloper}
          />
        )}
      </main>
    </div>
  );
}

export default App;
