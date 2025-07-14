import { useState } from 'react';
import toast from 'react-hot-toast';

const BotControlPanel = ({ botSettings, onUpdateBot, compact = false }) => {
  const [expandedBot, setExpandedBot] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'blocked':
        return 'bg-red-500 text-white';
      case 'allowed':
        return 'bg-green-500 text-white';
      case 'monetized':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'blocked':
        return '🚫';
      case 'allowed':
        return '✅';
      case 'monetized':
        return '💰';
      default:
        return '❓';
    }
  };

  const handleStatusChange = (botId, newStatus) => {
    onUpdateBot(botId, { status: newStatus });
    toast.success(`${botSettings[botId].name} status updated to ${newStatus}`);
  };

  const handlePriceChange = (botId, newPrice) => {
    const price = Math.max(0, Math.min(1, parseFloat(newPrice) || 0));
    onUpdateBot(botId, { price });
    toast.success(`${botSettings[botId].name} price updated to $${price.toFixed(2)}`);
  };

  const handleBulkAction = (action) => {
    Object.keys(botSettings).forEach(botId => {
      const newSettings = { status: action };
      if (action === 'monetized' && botSettings[botId].price === 0) {
        newSettings.price = 0.05; // Default price
      }
      onUpdateBot(botId, newSettings);
    });
    toast.success(`All bots set to ${action}`);
  };

  const toggleExpanded = (botId) => {
    setExpandedBot(expandedBot === botId ? null : botId);
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Bot Access Control</h3>
          {!compact && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('blocked')}
                className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition duration-200"
              >
                Block All
              </button>
              <button
                onClick={() => handleBulkAction('allowed')}
                className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition duration-200"
              >
                Allow All
              </button>
              <button
                onClick={() => handleBulkAction('monetized')}
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-200"
              >
                Monetize All
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {Object.entries(botSettings).map(([botId, bot]) => (
            <div key={botId} className="border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getStatusIcon(bot.status)}</span>
                  <div>
                    <h4 className="text-white font-medium">{bot.name}</h4>
                    <p className="text-gray-400 text-sm">{bot.userAgent}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(bot.status)}`}>
                    {bot.status.charAt(0).toUpperCase() + bot.status.slice(1)}
                  </span>
                  
                  {!compact && (
                    <button
                      onClick={() => toggleExpanded(botId)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <svg
                        className={`w-5 h-5 transform transition-transform ${expandedBot === botId ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Toggle Buttons */}
              <div className="mt-4 flex space-x-2">
                {['blocked', 'allowed', 'monetized'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(botId, status)}
                    className={`px-3 py-1 text-xs rounded transition duration-200 ${
                      bot.status === status
                        ? getStatusColor(status)
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {/* Expanded Configuration */}
              {!compact && expandedBot === botId && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Price per Request
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">$</span>
                        <input
                          type="number"
                          min="0"
                          max="1"
                          step="0.01"
                          value={bot.price.toFixed(2)}
                          onChange={(e) => handlePriceChange(botId, e.target.value)}
                          className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                          disabled={bot.status !== 'monetized'}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Monthly Revenue
                      </label>
                      <p className="text-white font-medium">
                        ${(Math.random() * 100 + 50).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BotControlPanel;
