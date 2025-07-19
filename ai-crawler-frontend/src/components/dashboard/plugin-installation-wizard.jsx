import { useState } from 'react';
import { toast } from 'react-hot-toast';

const PluginInstallationWizard = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [installationType, setInstallationType] = useState('');
  const [siteData, setSiteData] = useState({
    siteUrl: '',
    siteName: '',
    adminEmail: '',
    wordpressVersion: '',
    hasAdminAccess: false,
    canInstallPlugins: false
  });
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      id: 1,
      title: 'Choose Protection Type',
      description: 'Select how you want to protect your website'
    },
    {
      id: 2,
      title: 'Site Information',
      description: 'Provide details about your website'
    },
    {
      id: 3,
      title: 'WordPress Setup',
      description: 'Configure WordPress-specific settings'
    },
    {
      id: 4,
      title: 'Installation Method',
      description: 'Choose your preferred installation method'
    }
  ];

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(steps.length, prev + 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!installationType) {
          toast.error('Please select a protection type');
          return false;
        }
        return true;
      case 2:
        if (!siteData.siteUrl || !siteData.siteName) {
          toast.error('Please fill in all required fields');
          return false;
        }
        try {
          new URL(siteData.siteUrl);
        } catch {
          toast.error('Please enter a valid URL');
          return false;
        }
        return true;
      case 3:
        if (installationType === 'wordpress_plugin' && (!siteData.hasAdminAccess || !siteData.canInstallPlugins)) {
          toast.error('WordPress admin access is required for plugin installation');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const finalSiteData = {
        ...siteData,
        siteType: installationType
      };
      
      await onComplete(finalSiteData);
      toast.success('Site protection setup completed!');
    } catch (error) {
      toast.error('Failed to complete setup');
      console.error('Setup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Choose Your Protection Method</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Manual URL Protection */}
              <div 
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                  installationType === 'manual' 
                    ? 'border-blue-500 bg-blue-500 bg-opacity-10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => setInstallationType('manual')}
              >
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Manual URL Protection</h4>
                    <p className="text-gray-400 text-sm">Simple setup for any website</p>
                  </div>
                </div>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Quick 5-minute setup</li>
                  <li>• Works with any website platform</li>
                  <li>• Basic bot detection and logging</li>
                  <li>• Manual configuration required</li>
                </ul>
              </div>

              {/* WordPress Plugin */}
              <div 
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
                  installationType === 'wordpress_plugin' 
                    ? 'border-blue-500 bg-blue-500 bg-opacity-10' 
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => setInstallationType('wordpress_plugin')}
              >
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">WordPress Plugin</h4>
                    <p className="text-gray-400 text-sm">Full integration with WordPress</p>
                  </div>
                </div>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Automatic bot detection</li>
                  <li>• Real-time analytics</li>
                  <li>• Advanced monetization features</li>
                  <li>• WordPress admin integration</li>
                </ul>
              </div>
            </div>

            {installationType && (
              <div className="bg-gray-700 rounded-lg p-4">
                <h5 className="text-white font-medium mb-2">
                  {installationType === 'manual' ? 'Manual Protection' : 'WordPress Plugin'} Selected
                </h5>
                <p className="text-gray-300 text-sm">
                  {installationType === 'manual' 
                    ? 'You\'ll receive an API key to integrate with your website manually or through custom code.'
                    : 'You\'ll download and install a WordPress plugin that automatically protects your site.'
                  }
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Website Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website URL *
                </label>
                <input
                  type="url"
                  value={siteData.siteUrl}
                  onChange={(e) => setSiteData(prev => ({ ...prev, siteUrl: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://example.com"
                  required
                />
                <p className="text-gray-400 text-xs mt-1">Enter the full URL of your website</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website Name *
                </label>
                <input
                  type="text"
                  value={siteData.siteName}
                  onChange={(e) => setSiteData(prev => ({ ...prev, siteName: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="My Awesome Website"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={siteData.adminEmail}
                  onChange={(e) => setSiteData(prev => ({ ...prev, adminEmail: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  placeholder="admin@example.com"
                />
                <p className="text-gray-400 text-xs mt-1">We'll send important notifications to this email</p>
              </div>

              {installationType === 'wordpress_plugin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    WordPress Version
                  </label>
                  <select
                    value={siteData.wordpressVersion}
                    onChange={(e) => setSiteData(prev => ({ ...prev, wordpressVersion: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select WordPress Version</option>
                    <option value="6.4">WordPress 6.4 (Latest)</option>
                    <option value="6.3">WordPress 6.3</option>
                    <option value="6.2">WordPress 6.2</option>
                    <option value="6.1">WordPress 6.1</option>
                    <option value="older">Older Version</option>
                    <option value="unknown">Not Sure</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {installationType === 'wordpress_plugin' ? 'WordPress Requirements' : 'Setup Confirmation'}
            </h3>
            
            {installationType === 'wordpress_plugin' ? (
              <div className="space-y-4">
                <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 rounded-lg p-4">
                  <h4 className="text-yellow-400 font-medium mb-2">WordPress Plugin Requirements</h4>
                  <p className="text-yellow-300 text-sm mb-3">
                    Please confirm you have the necessary access to install the WordPress plugin:
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteData.hasAdminAccess}
                      onChange={(e) => setSiteData(prev => ({ ...prev, hasAdminAccess: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-white">I have administrator access to this WordPress site</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteData.canInstallPlugins}
                      onChange={(e) => setSiteData(prev => ({ ...prev, canInstallPlugins: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-white">I can install and activate plugins on this site</span>
                  </label>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h5 className="text-white font-medium mb-2">What you'll need to do:</h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>1. Download the AI Crawler Guard plugin</li>
                    <li>2. Upload and activate it in your WordPress admin</li>
                    <li>3. Configure the API key in plugin settings</li>
                    <li>4. Test the bot protection functionality</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-500 bg-opacity-20 border border-blue-500 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2">Manual Protection Setup</h4>
                  <p className="text-blue-300 text-sm">
                    You'll receive an API key that you can use to integrate bot protection into your website.
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h5 className="text-white font-medium mb-2">Integration options:</h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Add JavaScript tracking code to your website</li>
                    <li>• Use our REST API for server-side integration</li>
                    <li>• Implement custom bot detection logic</li>
                    <li>• Configure Cloudflare Workers (if using Cloudflare)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Ready to Set Up Protection</h3>
            
            <div className="bg-gray-700 rounded-lg p-6">
              <h4 className="text-white font-medium mb-4">Setup Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Protection Type:</span>
                  <span className="text-white">
                    {installationType === 'wordpress_plugin' ? 'WordPress Plugin' : 'Manual URL Protection'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Website:</span>
                  <span className="text-white">{siteData.siteName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">URL:</span>
                  <span className="text-white">{siteData.siteUrl}</span>
                </div>
                {siteData.adminEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Admin Email:</span>
                    <span className="text-white">{siteData.adminEmail}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-4">
              <h4 className="text-green-400 font-medium mb-2">🎉 Almost Done!</h4>
              <p className="text-green-300 text-sm">
                Click "Complete Setup" to register your site and receive your API key. 
                {installationType === 'wordpress_plugin' 
                  ? ' You\'ll then be guided through the WordPress plugin installation process.'
                  : ' You\'ll receive integration instructions and documentation.'
                }
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white">Website Protection Setup</h2>
            <p className="text-gray-400 text-sm mt-1">Step {currentStep} of {steps.length}</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep > step.id 
                    ? 'bg-green-600 text-white' 
                    : currentStep === step.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-600 text-gray-300'
                }`}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-green-600' : 'bg-gray-600'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h3 className="text-white font-medium">{steps[currentStep - 1].title}</h3>
            <p className="text-gray-400 text-sm">{steps[currentStep - 1].description}</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between p-6 border-t border-gray-700">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-4 py-2 rounded transition duration-200 ${
              currentStep === 1
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            Previous
          </button>

          <div className="flex space-x-3">
            {currentStep < steps.length ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-200"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition duration-200 disabled:opacity-50"
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PluginInstallationWizard;
