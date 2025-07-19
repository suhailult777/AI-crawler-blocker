import { useState } from 'react';
import { toast } from 'react-hot-toast';

const WordPressPluginGuide = ({ site, onClose }) => {
  const [activeStep, setActiveStep] = useState(1);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPlugin = () => {
    // Create a download link for the WordPress plugin
    const pluginUrl = '/wp-admin/crawlguard-wp.zip'; // This should be served from your backend
    const link = document.createElement('a');
    link.href = pluginUrl;
    link.download = 'crawlguard-wp.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Plugin download started!');
  };

  const steps = [
    {
      title: 'Download Plugin',
      description: 'Download the AI Crawler Guard WordPress plugin',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">
            First, download the AI Crawler Guard WordPress plugin to your computer.
          </p>
          <button
            onClick={downloadPlugin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download crawlguard-wp.zip</span>
          </button>
          <div className="bg-gray-700 rounded p-3">
            <p className="text-sm text-gray-400">
              <strong>Note:</strong> The plugin file is approximately 50KB and contains all necessary files for WordPress integration.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Install Plugin',
      description: 'Upload and install the plugin in your WordPress admin',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
              <div>
                <p className="text-white font-medium">Go to WordPress Admin</p>
                <p className="text-gray-400 text-sm">Navigate to your WordPress admin dashboard</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
              <div>
                <p className="text-white font-medium">Plugins → Add New</p>
                <p className="text-gray-400 text-sm">Click on "Plugins" in the left menu, then "Add New"</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
              <div>
                <p className="text-white font-medium">Upload Plugin</p>
                <p className="text-gray-400 text-sm">Click "Upload Plugin" and select the crawlguard-wp.zip file</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
              <div>
                <p className="text-white font-medium">Install & Activate</p>
                <p className="text-gray-400 text-sm">Click "Install Now" and then "Activate Plugin"</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded p-3">
            <p className="text-yellow-400 text-sm">
              <strong>Important:</strong> Make sure you have administrator privileges on your WordPress site to install plugins.
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Configure API Key',
      description: 'Enter your API key in the plugin settings',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
              <div>
                <p className="text-white font-medium">Find Plugin Settings</p>
                <p className="text-gray-400 text-sm">Go to Settings → AI Crawler Guard in your WordPress admin</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
              <div>
                <p className="text-white font-medium">Enter API Key</p>
                <p className="text-gray-400 text-sm">Copy and paste your API key from below</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-700 rounded p-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Your API Key</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={site?.apiKey || ''}
                readOnly
                className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white font-mono text-sm"
              />
              <button
                onClick={() => copyToClipboard(site?.apiKey || '')}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-200"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
              <div>
                <p className="text-white font-medium">Save Settings</p>
                <p className="text-gray-400 text-sm">Click "Save Changes" to activate bot protection</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Test & Verify',
      description: 'Verify that the plugin is working correctly',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
              <div>
                <p className="text-white font-medium">Check Plugin Status</p>
                <p className="text-gray-400 text-sm">The plugin should show "Connected" status in WordPress admin</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
              <div>
                <p className="text-white font-medium">Monitor Dashboard</p>
                <p className="text-gray-400 text-sm">Return to this dashboard to see bot detection analytics</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
              <div>
                <p className="text-white font-medium">Test Bot Detection</p>
                <p className="text-gray-400 text-sm">Visit your site with different user agents to test detection</p>
              </div>
            </div>
          </div>

          <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded p-4">
            <h4 className="text-green-400 font-medium mb-2">🎉 Setup Complete!</h4>
            <p className="text-green-300 text-sm">
              Your WordPress site is now protected by AI Crawler Guard. Bot requests will be detected, logged, and monetized according to your settings.
            </p>
          </div>

          <div className="bg-gray-700 rounded p-4">
            <h4 className="text-white font-medium mb-2">What happens next?</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• AI bots visiting your site will be detected automatically</li>
              <li>• Monetization will be applied based on your pricing settings</li>
              <li>• Analytics will appear in this dashboard within minutes</li>
              <li>• You can adjust settings anytime from the Bot Protection tab</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">WordPress Plugin Setup</h2>
            <p className="text-gray-400 text-sm mt-1">{site?.siteName || site?.siteUrl}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  activeStep > index + 1 
                    ? 'bg-green-600 text-white' 
                    : activeStep === index + 1 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-600 text-gray-300'
                }`}>
                  {activeStep > index + 1 ? '✓' : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    activeStep > index + 1 ? 'bg-green-600' : 'bg-gray-600'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Step {activeStep}: {steps[activeStep - 1].title}
            </h3>
            <p className="text-gray-400 text-sm">{steps[activeStep - 1].description}</p>
          </div>

          <div className="mb-8">
            {steps[activeStep - 1].content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
              className={`px-4 py-2 rounded transition duration-200 ${
                activeStep === 1
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              Previous
            </button>

            <div className="flex space-x-3">
              {activeStep < steps.length ? (
                <button
                  onClick={() => setActiveStep(Math.min(steps.length, activeStep + 1))}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-200"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition duration-200"
                >
                  Complete Setup
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordPressPluginGuide;
