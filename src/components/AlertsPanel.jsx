import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, AlertCircle, UserX, TrendingDown, Mail, Slack, Settings, X, Check } from 'lucide-react';
import { checkInactivity } from '../services/productivityMetrics';

function AlertsPanel({ developers, commits }) {
  const [alertSettings, setAlertSettings] = useState(() => {
    const saved = localStorage.getItem('alert-settings');
    return saved ? JSON.parse(saved) : {
      inactivityThreshold: 7,
      enableEmail: false,
      enableSlack: false,
      email: '',
      slackWebhook: ''
    };
  });

  const [showSettings, setShowSettings] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState(() => {
    const saved = localStorage.getItem('dismissed-alerts');
    return saved ? JSON.parse(saved) : [];
  });

  // Generate alerts
  const alerts = generateAlerts(developers, commits, alertSettings, dismissedAlerts);

  const dismissAlert = (alertId) => {
    const updated = [...dismissedAlerts, alertId];
    setDismissedAlerts(updated);
    localStorage.setItem('dismissed-alerts', JSON.stringify(updated));
  };

  const clearDismissed = () => {
    setDismissedAlerts([]);
    localStorage.removeItem('dismissed-alerts');
  };

  const saveSettings = (newSettings) => {
    setAlertSettings(newSettings);
    localStorage.setItem('alert-settings', JSON.stringify(newSettings));
    setShowSettings(false);
  };

  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');
  const infoAlerts = alerts.filter(a => a.severity === 'info');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Activity Alerts
          {alerts.length > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {alerts.length}
            </span>
          )}
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-dashboard-muted hover:text-white transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <AlertSettingsPanel
          settings={alertSettings}
          onSave={saveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* No alerts message */}
      {alerts.length === 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
          <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-white mb-1">All Clear!</h4>
          <p className="text-dashboard-muted">
            No activity alerts at this time. All developers are active.
          </p>
        </div>
      )}

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Critical ({criticalAlerts.length})
          </h4>
          {criticalAlerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} onDismiss={dismissAlert} />
          ))}
        </div>
      )}

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-yellow-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Warnings ({warningAlerts.length})
          </h4>
          {warningAlerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} onDismiss={dismissAlert} />
          ))}
        </div>
      )}

      {/* Info Alerts */}
      {infoAlerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-blue-400 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Info ({infoAlerts.length})
          </h4>
          {infoAlerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} onDismiss={dismissAlert} />
          ))}
        </div>
      )}

      {/* Clear dismissed */}
      {dismissedAlerts.length > 0 && (
        <button
          onClick={clearDismissed}
          className="text-sm text-dashboard-muted hover:text-white transition-colors"
        >
          Show {dismissedAlerts.length} dismissed alert{dismissedAlerts.length !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}

function AlertCard({ alert, onDismiss }) {
  const severityStyles = {
    critical: 'bg-red-500/10 border-red-500/30',
    warning: 'bg-yellow-500/10 border-yellow-500/30',
    info: 'bg-blue-500/10 border-blue-500/30'
  };

  const iconStyles = {
    critical: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  };

  return (
    <div className={`p-4 rounded-lg border ${severityStyles[alert.severity]} flex items-start gap-4`}>
      <div className={`mt-0.5 ${iconStyles[alert.severity]}`}>
        {alert.icon}
      </div>
      <div className="flex-1">
        <div className="font-medium text-white">{alert.title}</div>
        <p className="text-sm text-dashboard-muted mt-1">{alert.message}</p>
        {alert.details && (
          <div className="mt-2 text-xs text-dashboard-muted">
            {alert.details}
          </div>
        )}
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        className="text-dashboard-muted hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function AlertSettingsPanel({ settings, onSave, onClose }) {
  const [localSettings, setLocalSettings] = useState(settings);

  return (
    <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-white">Alert Settings</h4>
        <button onClick={onClose} className="text-dashboard-muted hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Inactivity Threshold */}
        <div>
          <label className="block text-sm text-dashboard-text mb-2">
            Inactivity Alert Threshold (days)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={localSettings.inactivityThreshold}
            onChange={(e) => setLocalSettings({ ...localSettings, inactivityThreshold: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-dashboard-bg border border-dashboard-border rounded-lg text-white"
          />
          <p className="text-xs text-dashboard-muted mt-1">
            Alert when a developer hasn't committed for this many days
          </p>
        </div>

        {/* Email notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-dashboard-muted" />
            <span className="text-sm text-dashboard-text">Email Notifications</span>
          </div>
          <button
            onClick={() => setLocalSettings({ ...localSettings, enableEmail: !localSettings.enableEmail })}
            className={`w-10 h-6 rounded-full transition-colors ${
              localSettings.enableEmail ? 'bg-dashboard-accent' : 'bg-dashboard-border'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              localSettings.enableEmail ? 'translate-x-5' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Slack notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Slack className="w-4 h-4 text-dashboard-muted" />
            <span className="text-sm text-dashboard-text">Slack Notifications</span>
          </div>
          <button
            onClick={() => setLocalSettings({ ...localSettings, enableSlack: !localSettings.enableSlack })}
            className={`w-10 h-6 rounded-full transition-colors ${
              localSettings.enableSlack ? 'bg-dashboard-accent' : 'bg-dashboard-border'
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
              localSettings.enableSlack ? 'translate-x-5' : 'translate-x-1'
            }`} />
          </button>
        </div>

        <p className="text-xs text-dashboard-muted">
          Note: Email and Slack notifications require backend setup
        </p>

        <button
          onClick={() => onSave(localSettings)}
          className="w-full py-2 bg-dashboard-accent text-white rounded-lg hover:bg-dashboard-accent/80 transition-colors"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

function generateAlerts(developers, commits, settings, dismissedAlerts) {
  const alerts = [];

  developers.forEach(dev => {
    const inactivity = checkInactivity(dev, settings.inactivityThreshold);

    if (inactivity.isInactive && !dismissedAlerts.includes(`inactive-${dev.name}`)) {
      if (inactivity.alert === 'critical') {
        alerts.push({
          id: `inactive-${dev.name}`,
          type: 'inactivity',
          severity: 'critical',
          icon: <UserX className="w-5 h-5" />,
          title: `${dev.name} has been inactive`,
          message: `No commits in ${inactivity.daysSinceLastCommit} days (since ${inactivity.lastCommitDate})`,
          details: `Last active in: ${dev.stats.repositories.slice(0, 3).join(', ')}`
        });
      } else if (inactivity.alert === 'warning') {
        alerts.push({
          id: `inactive-${dev.name}`,
          type: 'inactivity',
          severity: 'warning',
          icon: <AlertTriangle className="w-5 h-5" />,
          title: `${dev.name} activity declining`,
          message: `Only ${inactivity.daysSinceLastCommit} days since last commit`,
          details: null
        });
      }
    }

    // Check for sudden drops in activity
    const recentCommits = dev.commits.filter(c => {
      const date = new Date(c.commit?.author?.date);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo;
    }).length;

    const olderCommits = dev.commits.filter(c => {
      const date = new Date(c.commit?.author?.date);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      return date >= twoWeeksAgo && date < weekAgo;
    }).length;

    if (olderCommits > 5 && recentCommits < olderCommits * 0.3 && !dismissedAlerts.includes(`drop-${dev.name}`)) {
      alerts.push({
        id: `drop-${dev.name}`,
        type: 'activity_drop',
        severity: 'info',
        icon: <TrendingDown className="w-5 h-5" />,
        title: `${dev.name}'s activity dropped`,
        message: `${recentCommits} commits this week vs ${olderCommits} last week`,
        details: null
      });
    }
  });

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

export default AlertsPanel;
