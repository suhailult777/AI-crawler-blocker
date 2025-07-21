import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const WordPressSiteConfig = ({ site, onClose, onConfigUpdate }) => {
  const [config, setConfig] = useState({
    monetizationEnabled: false,
    pricingPerRequest: 0.001,
    allowedBots: [],
    botProtectionEnabled: true,
    customRules: []
  });
  const [loading, setLoading] = useState(false);
  const [autoConfiguring, setAutoConfiguring] = useState(false);
  const [pluginStatus, setPluginStatus] = useState(null);
  const [newBotName, setNewBotName] = useState('');
  const [newRule, setNewRule] = useState({ pattern: '', action: 'block' });

  useEffect(() => {
    if (site) {
      setConfig({
        monetizationEnabled: site.monetizationEnabled || false,
        pricingPerRequest: site.pricingPerRequest || 0.001,
        allowedBots: site.allowedBots || [],
        botProtectionEnabled: site.botProtectionEnabled !== false,
        customRules: site.customRules || []
      });
      checkPluginStatus();
    }
  }, [site]);

  const checkPluginStatus = async () => {
    try {
      const token = localStorage.getItem('botguard_token');
      const response = await fetch(`http://localhost:3001/api/v1/wordpress/sites/${site.id}/plugin-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        setPluginStatus(result.data);

        // Auto-configure if plugin is online but not configured
        if (result.data.isOnline && result.data.pluginStatus && !result.data.pluginStatus.is_configured) {
          await handleAutoConfiguration();
        }
      }
    } catch (error) {
      console.error('Error checking plugin status:', error);
    }
  };

  const handleAutoConfiguration = async () => {
    setAutoConfiguring(true);
    try {
      const token = localStorage.getItem('botguard_token');

      // Use default configuration for auto-setup
      const defaultConfig = {
        monetizationEnabled: false,
        pricingPerRequest: 0.001,
        allowedBots: ['Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot'],
        botProtectionEnabled: true,
        customRules: []
      };

      const response = await fetch(`http://localhost:3001/api/v1/wordpress/sites/${site.id}/configure`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings: defaultConfig })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('WordPress plugin auto-configured successfully!');
        setConfig(defaultConfig);
        onConfigUpdate?.(result.data.site);

        // Refresh plugin status
        await checkPluginStatus();
      } else {
        console.error('Auto-configuration failed:', result.message);
      }
    } catch (error) {
      console.error('Error during auto-configuration:', error);
    } finally {
      setAutoConfiguring(false);
    }
  };

  const handleConfigUpdate = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addAllowedBot = () => {
    if (newBotName.trim() && !config.allowedBots.includes(newBotName.trim())) {
      setConfig(prev => ({
        ...prev,
        allowedBots: [...prev.allowedBots, newBotName.trim()]
      }));
      setNewBotName('');
    }
  };

  const removeAllowedBot = (botName) => {
    setConfig(prev => ({
      ...prev,
      allowedBots: prev.allowedBots.filter(bot => bot !== botName)
    }));
  };

  const addCustomRule = () => {
    if (newRule.pattern.trim()) {
      setConfig(prev => ({
        ...prev,
        customRules: [...prev.customRules, { ...newRule, id: Date.now() }]
      }));
      setNewRule({ pattern: '', action: 'block' });
    }
  };

  const removeCustomRule = (ruleId) => {
    setConfig(prev => ({
      ...prev,
      customRules: prev.customRules.filter(rule => rule.id !== ruleId)
    }));
  };

  const handleSaveConfiguration = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('botguard_token');
      const response = await fetch(`http://localhost:3001/api/v1/wordpress/sites/${site.id}/configure`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings: config })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Configuration pushed to WordPress plugin successfully!');
        onConfigUpdate?.(result.data.site);
        onClose();
      } else {
        toast.error(result.message || 'Failed to update configuration');
      }
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast.error('Error updating configuration: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const commonBots = [
    'Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider',
    'YandexBot', 'facebookexternalhit', 'Twitterbot', 'LinkedInBot'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Configure WordPress Site</h2>
              <p className="text-gray-400 mt-1">{site?.siteName || site?.siteUrl}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Plugin Status */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Plugin Status</h3>
            {autoConfiguring && (
              <div className="mb-4 p-3 bg-blue-600 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-white">Auto-configuring WordPress plugin...</span>
                </div>
              </div>
            )}
            {pluginStatus ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${pluginStatus.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span className="text-white">{pluginStatus.isOnline ? 'Online' : 'Offline'}</span>
                  {pluginStatus.isOnline && pluginStatus.pluginStatus?.is_configured && (
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Configured</span>
                  )}
                </div>
                {pluginStatus.pluginStatus && (
                  <div className="text-sm text-gray-300">
                    <p>Version: {pluginStatus.pluginStatus.plugin_version}</p>
                    <p>Configured: {pluginStatus.pluginStatus.is_configured ? 'Yes' : 'No'}</p>
                    {pluginStatus.pluginStatus.configured_from_dashboard && (
                      <p className="text-green-400">✓ Managed from Dashboard</p>
                    )}
                    {pluginStatus.pluginStatus.last_updated && (
                      <p>Last Updated: {new Date(pluginStatus.pluginStatus.last_updated * 1000).toLocaleString()}</p>
                    )}
                  </div>
                )}
                {!pluginStatus.isOnline && (
                  <div className="mt-2 p-3 bg-red-600 rounded-lg">
                    <p className="text-white text-sm">
                      Plugin is not responding. Please ensure the CrawlGuard plugin is installed and activated on your WordPress site.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400">Checking plugin status...</p>
            )}
          </div>

          {/* Monetization Settings */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Monetization Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="monetization"
                  checked={config.monetizationEnabled}
                  onChange={(e) => handleConfigUpdate('monetizationEnabled', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
                />
                <label htmlFor="monetization" className="text-white">Enable Monetization</label>
              </div>

              {config.monetizationEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pricing per Request ($)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={config.pricingPerRequest}
                    onChange={(e) => handleConfigUpdate('pricingPerRequest', parseFloat(e.target.value) || 0)}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bot Protection Settings */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Bot Protection</h3>
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                id="botProtection"
                checked={config.botProtectionEnabled}
                onChange={(e) => handleConfigUpdate('botProtectionEnabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500"
              />
              <label htmlFor="botProtection" className="text-white">Enable Bot Protection</label>
            </div>
          </div>

          {/* Allowed Bots */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Allowed Bots</h3>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Bot name (e.g., Googlebot)"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  className="flex-1 bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addAllowedBot}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-200"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {commonBots.map(bot => (
                  <button
                    key={bot}
                    onClick={() => {
                      if (!config.allowedBots.includes(bot)) {
                        setConfig(prev => ({
                          ...prev,
                          allowedBots: [...prev.allowedBots, bot]
                        }));
                      }
                    }}
                    className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded transition duration-200"
                  >
                    + {bot}
                  </button>
                ))}
              </div>

              {config.allowedBots.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">Currently Allowed:</h4>
                  <div className="flex flex-wrap gap-2">
                    {config.allowedBots.map(bot => (
                      <span
                        key={bot}
                        className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded"
                      >
                        {bot}
                        <button
                          onClick={() => removeAllowedBot(bot)}
                          className="ml-2 text-green-200 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-between">
          <div className="flex space-x-3">
            {pluginStatus?.isOnline && !pluginStatus?.pluginStatus?.is_configured && (
              <button
                onClick={handleAutoConfiguration}
                disabled={autoConfiguring || loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition duration-200 disabled:opacity-50"
              >
                {autoConfiguring ? 'Auto-Configuring...' : 'Auto-Configure Plugin'}
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveConfiguration}
              disabled={loading || autoConfiguring}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save & Push to Plugin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordPressSiteConfig;
