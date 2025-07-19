import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const BotProtectionPanel = ({ siteId }) => {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    monetizationEnabled: false,
    pricingPerRequest: '0.001',
    allowedBots: []
  });
  const [newAllowedBot, setNewAllowedBot] = useState('');

  const commonBots = [
    { name: 'googlebot', label: 'Google Bot', description: 'Google search crawler' },
    { name: 'bingbot', label: 'Bing Bot', description: 'Microsoft Bing crawler' },
    { name: 'facebookexternalhit', label: 'Facebook Bot', description: 'Facebook link preview' },
    { name: 'twitterbot', label: 'Twitter Bot', description: 'Twitter card crawler' },
    { name: 'linkedinbot', label: 'LinkedIn Bot', description: 'LinkedIn preview crawler' },
    { name: 'slackbot', label: 'Slack Bot', description: 'Slack link unfurling' }
  ];

  const aiBotsToBlock = [
    { name: 'gptbot', label: 'GPT Bot', description: 'OpenAI ChatGPT crawler', company: 'OpenAI' },
    { name: 'claudebot', label: 'Claude Bot', description: 'Anthropic Claude crawler', company: 'Anthropic' },
    { name: 'google-extended', label: 'Google Extended', description: 'Google AI training crawler', company: 'Google' },
    { name: 'ccbot', label: 'Common Crawl', description: 'Common Crawl bot', company: 'Common Crawl' },
    { name: 'perplexitybot', label: 'Perplexity Bot', description: 'Perplexity AI crawler', company: 'Perplexity' },
    { name: 'bytespider', label: 'ByteSpider', description: 'ByteDance crawler', company: 'ByteDance' }
  ];

  useEffect(() => {
    if (siteId) {
      fetchSiteDetails();
    }
  }, [siteId]);

  const fetchSiteDetails = async () => {
    try {
      const response = await fetch(`/api/v1/wordpress/sites/${siteId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setSite(data.data.site);
        setSettings({
          monetizationEnabled: data.data.site.monetizationEnabled,
          pricingPerRequest: data.data.site.pricingPerRequest,
          allowedBots: data.data.site.allowedBots || []
        });
      } else {
        toast.error(data.message || 'Failed to fetch site details');
      }
    } catch (error) {
      toast.error('Error fetching site details');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const response = await fetch(`/api/v1/wordpress/sites/${siteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Settings saved successfully!');
        setSite(data.data.site);
      } else {
        toast.error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('Error saving settings');
      console.error('Error:', error);
    }
  };

  const toggleAllowedBot = (botName) => {
    setSettings(prev => ({
      ...prev,
      allowedBots: prev.allowedBots.includes(botName)
        ? prev.allowedBots.filter(bot => bot !== botName)
        : [...prev.allowedBots, botName]
    }));
  };

  const addCustomBot = () => {
    if (newAllowedBot.trim() && !settings.allowedBots.includes(newAllowedBot.trim())) {
      setSettings(prev => ({
        ...prev,
        allowedBots: [...prev.allowedBots, newAllowedBot.trim()]
      }));
      setNewAllowedBot('');
    }
  };

  const removeCustomBot = (botName) => {
    setSettings(prev => ({
      ...prev,
      allowedBots: prev.allowedBots.filter(bot => bot !== botName)
    }));
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">Site not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Bot Protection Settings</h2>
          <p className="text-gray-400 mt-1">{site.siteName || site.siteUrl}</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
        >
          Save Settings
        </button>
      </div>

      {/* Monetization Settings */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Monetization Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-white font-medium">Enable Monetization</label>
              <p className="text-gray-400 text-sm">Charge AI bots for accessing your content</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.monetizationEnabled}
                onChange={(e) => setSettings(prev => ({ ...prev, monetizationEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.monetizationEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Price per Request (USD)
              </label>
              <input
                type="number"
                step="0.0001"
                min="0"
                value={settings.pricingPerRequest}
                onChange={(e) => setSettings(prev => ({ ...prev, pricingPerRequest: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
              <p className="text-gray-400 text-sm mt-1">
                Recommended: $0.001 - $0.005 per request
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Allowed Bots */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Allowed Bots</h3>
        <p className="text-gray-400 text-sm mb-4">
          These bots will be allowed to access your content without charges
        </p>

        {/* Common Search Engine Bots */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-white mb-3">Search Engine Bots</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonBots.map((bot) => (
              <div key={bot.name} className="flex items-center justify-between bg-gray-700 rounded p-3">
                <div>
                  <div className="text-white font-medium">{bot.label}</div>
                  <div className="text-gray-400 text-sm">{bot.description}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowedBots.includes(bot.name)}
                    onChange={() => toggleAllowedBot(bot.name)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* AI Bots to Block/Monetize */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-white mb-3">AI Bots (Will be blocked/monetized)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {aiBotsToBlock.map((bot) => (
              <div key={bot.name} className="bg-gray-700 rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{bot.label}</div>
                    <div className="text-gray-400 text-sm">{bot.description}</div>
                    <div className="text-blue-400 text-xs">{bot.company}</div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    settings.allowedBots.includes(bot.name) 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {settings.allowedBots.includes(bot.name) ? 'Allowed' : 'Blocked/Monetized'}
                  </div>
                </div>
                <button
                  onClick={() => toggleAllowedBot(bot.name)}
                  className={`mt-2 px-3 py-1 text-sm rounded transition duration-200 ${
                    settings.allowedBots.includes(bot.name)
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {settings.allowedBots.includes(bot.name) ? 'Block/Monetize' : 'Allow'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Allowed Bots */}
        <div>
          <h4 className="text-md font-medium text-white mb-3">Custom Allowed Bots</h4>
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={newAllowedBot}
              onChange={(e) => setNewAllowedBot(e.target.value)}
              placeholder="Enter bot name (e.g., mybot)"
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={addCustomBot}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-200"
            >
              Add
            </button>
          </div>
          
          {settings.allowedBots.filter(bot => !commonBots.some(cb => cb.name === bot)).length > 0 && (
            <div className="space-y-2">
              {settings.allowedBots
                .filter(bot => !commonBots.some(cb => cb.name === bot))
                .map((bot) => (
                  <div key={bot} className="flex items-center justify-between bg-gray-700 rounded p-2">
                    <span className="text-white">{bot}</span>
                    <button
                      onClick={() => removeCustomBot(bot)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition duration-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BotProtectionPanel;
