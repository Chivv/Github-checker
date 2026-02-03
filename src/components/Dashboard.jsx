import { useState } from 'react';
import {
  Users, GitCommit, FolderGit2, TrendingUp, AlertCircle, Loader2,
  LayoutDashboard, Calendar, Trophy, Scale, FileText
} from 'lucide-react';
import WorkspaceSummary from './WorkspaceSummary';
import DeveloperCard from './DeveloperCard';
import ActivityChart from './ActivityChart';
import RepositoryList from './RepositoryList';
import DailyBreakdown from './DailyBreakdown';
import ProductivityPanel from './ProductivityPanel';
import CompareView from './CompareView';
import WeeklySummary from './WeeklySummary';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'daily', label: 'Daily View', icon: Calendar },
  { id: 'productivity', label: 'Productivity', icon: Trophy },
  { id: 'compare', label: 'Compare', icon: Scale },
  { id: 'weekly', label: 'Weekly Report', icon: FileText }
];

function Dashboard({ data, loading, error, progress, onSelectDeveloper, dailyData, weeklyData, timeframeDays }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Error Loading Data</h3>
        <p className="text-dashboard-muted">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <div className="w-16 h-16 bg-dashboard-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Loader2 className="w-8 h-8 text-dashboard-accent animate-spin" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Loading Workspace Data</h3>
        {progress && (
          <div className="mt-4">
            <p className="text-dashboard-muted mb-2">{progress.message}</p>
            {progress.total > 0 && (
              <div className="w-full bg-dashboard-bg rounded-full h-2">
                <div
                  className="bg-dashboard-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { commits, repos, developers, byDate, byRepo, workspaceSummary } = data;

  return (
    <div className="space-y-6">
      {/* Quick Stats - Always visible */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<GitCommit className="w-5 h-5" />}
          label="Total Commits"
          value={commits.length.toLocaleString()}
          color="accent"
        />
        <StatCard
          icon={<Users className="w-5 h-5" />}
          label="Contributors"
          value={developers.length}
          color="success"
        />
        <StatCard
          icon={<FolderGit2 className="w-5 h-5" />}
          label="Repositories"
          value={repos?.length || byRepo.length}
          color="warning"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Avg/Developer"
          value={(commits.length / developers.length || 0).toFixed(1)}
          color="accent"
        />
      </div>

      {/* Tab Navigation */}
      <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-1 flex gap-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-dashboard-accent text-white'
                : 'text-dashboard-muted hover:text-white hover:bg-dashboard-bg'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Workspace Summary */}
          {workspaceSummary && (
            <WorkspaceSummary summary={workspaceSummary} />
          )}

          {/* Activity Chart */}
          <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Activity Timeline</h3>
            <ActivityChart data={byDate} />
          </div>

          {/* Developers Grid */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Developer Activity ({developers.length} contributors)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {developers.map((dev, idx) => (
                <DeveloperCard
                  key={dev.email || idx}
                  developer={dev}
                  rank={idx + 1}
                  onClick={() => onSelectDeveloper(dev)}
                />
              ))}
            </div>
          </div>

          {/* Repositories */}
          <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Repository Activity
            </h3>
            <RepositoryList repositories={byRepo} />
          </div>
        </div>
      )}

      {activeTab === 'daily' && (
        <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Daily Activity Breakdown
          </h3>
          <p className="text-dashboard-muted mb-6">
            Detailed view of all commits for each day. Click on a day to see hourly activity, contributors, and commit details.
          </p>
          <DailyBreakdown dailyData={dailyData} />
        </div>
      )}

      {activeTab === 'productivity' && (
        <ProductivityPanel
          developers={developers}
          timeframeDays={timeframeDays || 30}
        />
      )}

      {activeTab === 'compare' && (
        <CompareView developers={developers} />
      )}

      {activeTab === 'weekly' && (
        <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Weekly Summary Reports
          </h3>
          <p className="text-dashboard-muted mb-6">
            Week-by-week breakdown of activity with trends and top contributors.
          </p>
          <WeeklySummary weeklyData={weeklyData} />
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    accent: 'bg-dashboard-accent/20 text-dashboard-accent',
    success: 'bg-dashboard-success/20 text-dashboard-success',
    warning: 'bg-dashboard-warning/20 text-dashboard-warning'
  };

  return (
    <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-sm text-dashboard-muted">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
