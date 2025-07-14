import { useState } from 'react';
import toast from 'react-hot-toast';

const SettingsPanel = () => {
  const [expandedSection, setExpandedSection] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteUrl: 'https://example.com',
      defaultBotBehavior: 'monetized',
      rateLimit: 100,
      enableLogging: true
    },
    pricing: {
      defaultPrice: 0.05,
      bulkDiscount: 10,
      subscriptionDaily: 5.00,
      subscriptionMonthly: 50.00
    },
    integration: {
      stripeConnected: false,
      wordpressConnected: true,
      apiKey: 'sk_test_...',
      webhookUrl: 'https://example.com/webhook'
    }
  });

  const [customRules, setCustomRules] = useState([
    {
      id: 1,
      name: 'Block Aggressive Crawlers',
      pattern: '.*aggressive.*',
      action: 'blocked',
      enabled: true
    },
    {
      id: 2,
      name: 'Premium Content Access',
      pattern: '/premium/.*',
      action: 'monetized',
      enabled: true
    }
  ]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    toast.success('Setting updated successfully');
  };

  const addCustomRule = () => {
    const newRule = {
      id: Date.now(),
      name: 'New Rule',
      pattern: '',
      action: 'blocked',
      enabled: true
    };
    setCustomRules(prev => [...prev, newRule]);
  };

  const updateCustomRule = (id, field, value) => {
    setCustomRules(prev =>
      prev.map(rule =>
        rule.id === id ? { ...rule, [field]: value } : rule
      )
    );
  };

  const deleteCustomRule = (id) => {
    setCustomRules(prev => prev.filter(rule => rule.id !== id));
    toast.success('Rule deleted');
  };

  const generateApiKey = () => {
    const newKey = 'sk_' + Math.random().toString(36).substring(2, 15);
    updateSetting('integration', 'apiKey', newKey);
    toast.success('New API key generated');
  };

  const sections = [
    {
      id: 'general',
      title: 'General Settings',
      icon: '⚙️'
    },
    {
      id: 'rules',
      title: 'Custom Rules',
      icon: '📋'
    },
    {
      id: 'pricing',
      title: 'Pricing Configuration',
      icon: '💰'
    },
    {
      id: 'integration',
      title: 'Integration Settings',
      icon: '🔗'
    }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Site URL
        </label>
        <input
          type="url"
          value={settings.general.siteUrl}
          onChange={(e) => updateSetting('general', 'siteUrl', e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Default Bot Behavior
        </label>
        <select
          value={settings.general.defaultBotBehavior}
          onChange={(e) => updateSetting('general', 'defaultBotBehavior', e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
        >
          <option value="blocked">Block</option>
          <option value="allowed">Allow</option>
          <option value="monetized">Monetize</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Rate Limit (requests per minute)
        </label>
        <input
          type="number"
          min="1"
          max="1000"
          value={settings.general.rateLimit}
          onChange={(e) => updateSetting('general', 'rateLimit', parseInt(e.target.value))}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="enableLogging"
          checked={settings.general.enableLogging}
          onChange={(e) => updateSetting('general', 'enableLogging', e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="enableLogging" className="text-sm text-gray-300">
          Enable detailed logging
        </label>
      </div>
    </div>
  );

  const renderCustomRules = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-gray-300 text-sm">
          Create custom rules to control bot access based on patterns
        </p>
        <button
          onClick={addCustomRule}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition duration-200"
        >
          Add Rule
        </button>
      </div>

      {customRules.map((rule) => (
        <div key={rule.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Rule Name</label>
              <input
                type="text"
                value={rule.name}
                onChange={(e) => updateCustomRule(rule.id, 'name', e.target.value)}
                className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Pattern (Regex)</label>
              <input
                type="text"
                value={rule.pattern}
                onChange={(e) => updateCustomRule(rule.id, 'pattern', e.target.value)}
                className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Action</label>
              <select
                value={rule.action}
                onChange={(e) => updateCustomRule(rule.id, 'action', e.target.value)}
                className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="blocked">Block</option>
                <option value="allowed">Allow</option>
                <option value="monetized">Monetize</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={(e) => updateCustomRule(rule.id, 'enabled', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-xs text-gray-400">Enabled</span>
              </label>
              <button
                onClick={() => deleteCustomRule(rule.id)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPricingSettings = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Default Price per Request
        </label>
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">$</span>
          <input
            type="number"
            min="0.01"
            max="1.00"
            step="0.01"
            value={settings.pricing.defaultPrice}
            onChange={(e) => updateSetting('pricing', 'defaultPrice', parseFloat(e.target.value))}
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Bulk Discount (%)
        </label>
        <input
          type="number"
          min="0"
          max="50"
          value={settings.pricing.bulkDiscount}
          onChange={(e) => updateSetting('pricing', 'bulkDiscount', parseInt(e.target.value))}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Daily Subscription
        </label>
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">$</span>
          <input
            type="number"
            min="1"
            step="0.01"
            value={settings.pricing.subscriptionDaily}
            onChange={(e) => updateSetting('pricing', 'subscriptionDaily', parseFloat(e.target.value))}
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Monthly Subscription
        </label>
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">$</span>
          <input
            type="number"
            min="10"
            step="0.01"
            value={settings.pricing.subscriptionMonthly}
            onChange={(e) => updateSetting('pricing', 'subscriptionMonthly', parseFloat(e.target.value))}
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white font-medium">Stripe Connect</h4>
            <span className={`px-2 py-1 rounded text-xs ${settings.integration.stripeConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              {settings.integration.stripeConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-3">
            Connect your Stripe account to receive payments
          </p>
          <button
            onClick={() => updateSetting('integration', 'stripeConnected', !settings.integration.stripeConnected)}
            className={`px-4 py-2 text-sm rounded transition duration-200 ${
              settings.integration.stripeConnected
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {settings.integration.stripeConnected ? 'Disconnect' : 'Connect Stripe'}
          </button>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-white font-medium">WordPress Plugin</h4>
            <span className={`px-2 py-1 rounded text-xs ${settings.integration.wordpressConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
              {settings.integration.wordpressConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <p className="text-gray-400 text-sm mb-3">
            Install our WordPress plugin for easy integration
          </p>
          <button
            onClick={() => updateSetting('integration', 'wordpressConnected', !settings.integration.wordpressConnected)}
            className={`px-4 py-2 text-sm rounded transition duration-200 ${
              settings.integration.wordpressConnected
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {settings.integration.wordpressConnected ? 'Disconnect' : 'Install Plugin'}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          API Key
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={settings.integration.apiKey}
            readOnly
            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none"
          />
          <button
            onClick={generateApiKey}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition duration-200"
          >
            Regenerate
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Webhook URL
        </label>
        <input
          type="url"
          value={settings.integration.webhookUrl}
          onChange={(e) => updateSetting('integration', 'webhookUrl', e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (expandedSection) {
      case 'general':
        return renderGeneralSettings();
      case 'rules':
        return renderCustomRules();
      case 'pricing':
        return renderPricingSettings();
      case 'integration':
        return renderIntegrationSettings();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
      
      {sections.map((section) => (
        <div key={section.id} className="bg-gray-800 rounded-lg border border-gray-700">
          <button
            onClick={() => toggleSection(section.id)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl">{section.icon}</span>
              <h3 className="text-lg font-semibold text-white">{section.title}</h3>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transform transition-transform ${
                expandedSection === section.id ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSection === section.id && (
            <div className="px-6 pb-6">
              {renderSectionContent()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SettingsPanel;
