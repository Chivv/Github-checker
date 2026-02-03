import { useState, useEffect } from 'react';
import { Sparkles, Key, CheckCircle, AlertCircle, Loader2, Settings, DollarSign } from 'lucide-react';

function AISettingsPanel({ onConfigChange, currentConfig }) {
  const [provider, setProvider] = useState(currentConfig?.provider || 'openai');
  const [apiKey, setApiKey] = useState(currentConfig?.apiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('ai-config');
    if (saved) {
      const parsed = JSON.parse(saved);
      setProvider(parsed.provider || 'openai');
      setApiKey(parsed.apiKey || '');
    }
  }, []);

  const validateKey = async () => {
    if (!apiKey.trim()) {
      setValidationResult({ success: false, message: 'Please enter an API key' });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      // Test the API key with a minimal request
      if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (response.ok) {
          setValidationResult({ success: true, message: 'OpenAI API key is valid!' });
        } else {
          setValidationResult({ success: false, message: 'Invalid API key' });
        }
      } else {
        // Anthropic validation
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hi' }]
          })
        });
        if (response.ok || response.status === 400) {
          // 400 might mean message too short but key is valid
          setValidationResult({ success: true, message: 'Anthropic API key is valid!' });
        } else {
          setValidationResult({ success: false, message: 'Invalid API key' });
        }
      }
    } catch (error) {
      setValidationResult({ success: false, message: 'Could not validate key. Check your network.' });
    } finally {
      setIsValidating(false);
    }
  };

  const saveConfig = () => {
    const config = { provider, apiKey, enabled: !!apiKey };
    localStorage.setItem('ai-config', JSON.stringify(config));
    if (onConfigChange) {
      onConfigChange(config);
    }
    setValidationResult({ success: true, message: 'Settings saved!' });
  };

  const clearConfig = () => {
    localStorage.removeItem('ai-config');
    setApiKey('');
    setValidationResult(null);
    if (onConfigChange) {
      onConfigChange({ provider, apiKey: '', enabled: false });
    }
  };

  return (
    <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-dashboard-accent" />
        AI-Powered Summaries
      </h3>

      <p className="text-dashboard-muted text-sm mb-6">
        Connect an AI provider to generate human-readable summaries of developer activity.
        Summaries are cached to minimize API costs.
      </p>

      {/* Cost Estimate */}
      <div className="bg-dashboard-bg rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-dashboard-accent mb-2">
          <DollarSign className="w-4 h-4" />
          <span className="font-medium">Cost Estimate</span>
        </div>
        <p className="text-sm text-dashboard-muted">
          Using GPT-3.5-turbo or Claude Haiku: ~$0.01-0.05 per full workspace analysis.
          Results are cached so repeat views are free.
        </p>
      </div>

      {/* Provider Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-dashboard-text mb-2">
          AI Provider
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setProvider('openai')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
              provider === 'openai'
                ? 'border-dashboard-accent bg-dashboard-accent/10'
                : 'border-dashboard-border hover:border-dashboard-border/70'
            }`}
          >
            <div className="font-medium text-white">OpenAI</div>
            <div className="text-xs text-dashboard-muted">GPT-3.5 / GPT-4</div>
          </button>
          <button
            onClick={() => setProvider('anthropic')}
            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${
              provider === 'anthropic'
                ? 'border-dashboard-accent bg-dashboard-accent/10'
                : 'border-dashboard-border hover:border-dashboard-border/70'
            }`}
          >
            <div className="font-medium text-white">Anthropic</div>
            <div className="text-xs text-dashboard-muted">Claude Haiku / Sonnet</div>
          </button>
        </div>
      </div>

      {/* API Key Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-dashboard-text mb-2">
          <Key className="w-4 h-4 inline mr-2" />
          API Key
        </label>
        <div className="flex gap-2">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
            className="flex-1 px-4 py-3 bg-dashboard-bg border border-dashboard-border rounded-lg text-white placeholder-dashboard-muted focus:outline-none focus:border-dashboard-accent transition-colors"
          />
          <button
            onClick={() => setShowKey(!showKey)}
            className="px-4 py-2 bg-dashboard-bg border border-dashboard-border rounded-lg text-dashboard-muted hover:text-white transition-colors"
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="mt-2 text-xs text-dashboard-muted">
          Get your key from{' '}
          {provider === 'openai' ? (
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-dashboard-accent hover:underline">
              platform.openai.com/api-keys
            </a>
          ) : (
            <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-dashboard-accent hover:underline">
              console.anthropic.com/settings/keys
            </a>
          )}
        </p>
      </div>

      {/* Validation Result */}
      {validationResult && (
        <div className={`p-3 rounded-lg mb-4 flex items-center gap-2 ${
          validationResult.success
            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {validationResult.success ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {validationResult.message}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={validateKey}
          disabled={isValidating || !apiKey}
          className="flex-1 py-3 bg-dashboard-bg hover:bg-dashboard-border text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {isValidating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Validate Key'
          )}
        </button>
        <button
          onClick={saveConfig}
          disabled={!apiKey}
          className="flex-1 py-3 bg-dashboard-accent hover:bg-dashboard-accent/80 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          Save Settings
        </button>
      </div>

      {apiKey && (
        <button
          onClick={clearConfig}
          className="w-full mt-3 py-2 text-dashboard-muted hover:text-red-400 text-sm transition-colors"
        >
          Clear API Key
        </button>
      )}
    </div>
  );
}

export default AISettingsPanel;
