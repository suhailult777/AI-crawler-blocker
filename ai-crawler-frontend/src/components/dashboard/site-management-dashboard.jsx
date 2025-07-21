import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import PluginInstallationWizard from './plugin-installation-wizard';
import WordPressPluginGuide from './wordpress-plugin-guide';
import WordPressSiteConfig from './wordpress-site-config';

// API Client for authenticated requests
class ApiClient {
  constructor() {
    this.baseURL = 'http://localhost:3001/api/v1';
  }

  getAuthToken() {
    return localStorage.getItem('botguard_token');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient();

const SiteManagementDashboard = ({ onSiteSelect }) => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [showPluginGuide, setShowPluginGuide] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      console.log('🔍 Fetching sites...');
      console.log('🔑 Auth token:', localStorage.getItem('botguard_token')?.substring(0, 20) + '...');
      console.log('👤 Current user:', JSON.parse(localStorage.getItem('botguard_user') || '{}'));

      const data = await apiClient.get('/wordpress/sites');

      console.log('📊 Sites API response:', data);

      if (data.success) {
        console.log(`✅ Successfully fetched ${data.data.sites?.length || 0} sites`);
        setSites(data.data.sites || []);
      } else {
        console.error('❌ API returned error:', data.message);
        toast.error(data.message || 'Failed to fetch sites');
      }
    } catch (error) {
      console.error('❌ Fetch sites error:', error);
      toast.error('Error fetching sites: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWizardComplete = async (siteData) => {
    try {
      console.log('🚀 Adding new site:', siteData);
      console.log('👤 Current user:', JSON.parse(localStorage.getItem('botguard_user') || '{}'));

      const result = await apiClient.post('/wordpress/sites', siteData);

      console.log('📊 Site creation response:', result);

      if (result.success) {
        console.log('✅ Site created successfully:', result.data.site);
        setShowWizard(false);

        // Refresh the sites list
        console.log('🔄 Refreshing sites list...');
        await fetchSites();

        // If it's a WordPress plugin, show the setup guide and auto-configure
        if (siteData.siteType === 'wordpress_plugin') {
          setSelectedSite(result.data.site);
          setShowPluginGuide(true);

          // Auto-configure after a short delay to allow plugin installation
          setTimeout(async () => {
            try {
              await autoConfigureWordPressPlugin(result.data.site.id);
            } catch (error) {
              console.error('Auto-configuration failed:', error);
            }
          }, 3000);
        } else {
          toast.success('Site added successfully! Check your email for integration instructions.');
        }
      } else {
        console.error('❌ Site creation failed:', result.message);
        throw new Error(result.message || 'Failed to add site');
      }
    } catch (error) {
      console.error('❌ Site creation error:', error);
      throw error;
    }
  };

  const handleDeleteSite = async (siteId, siteName) => {
    if (!confirm(`Are you sure you want to delete "${siteName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const data = await apiClient.delete(`/wordpress/sites/${siteId}`);

      if (data.success) {
        toast.success('Site deleted successfully');
        fetchSites();
      } else {
        toast.error(data.message || 'Failed to delete site');
      }
    } catch (error) {
      toast.error('Error deleting site');
      console.error('Error:', error);
    }
  };

  const handleToggleStatus = async (siteId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const data = await apiClient.put(`/wordpress/sites/${siteId}`, { status: newStatus });

      if (data.success) {
        toast.success(`Site ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        fetchSites();
      } else {
        toast.error(data.message || 'Failed to update site status');
      }
    } catch (error) {
      toast.error('Error updating site status');
      console.error('Error:', error);
    }
  };

  const handleConfigUpdate = (updatedSite) => {
    // Update the site in the local state
    setSites(prevSites =>
      prevSites.map(site =>
        site.id === updatedSite.id ? { ...site, ...updatedSite } : site
      )
    );
  };

  const autoConfigureWordPressPlugin = async (siteId) => {
    try {
      console.log('🔧 Auto-configuring WordPress plugin for site:', siteId);

      // Default configuration for new WordPress sites
      const defaultConfig = {
        monetizationEnabled: false,
        pricingPerRequest: 0.001,
        allowedBots: ['Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot'],
        botProtectionEnabled: true,
        customRules: []
      };

      const result = await apiClient.post(`/wordpress/sites/${siteId}/configure`, {
        settings: defaultConfig
      });

      if (result.success) {
        console.log('✅ WordPress plugin auto-configured successfully');
        toast.success('WordPress plugin configured automatically!');

        // Update the site in local state
        setSites(prevSites =>
          prevSites.map(site =>
            site.id === siteId ? { ...site, ...result.data.site } : site
          )
        );
      } else {
        console.log('⚠️ Auto-configuration failed, plugin may not be ready yet');
      }
    } catch (error) {
      console.error('❌ Auto-configuration error:', error);
      // Don't show error toast as this is automatic and may fail if plugin isn't ready
    }
  };

  const filteredSites = sites.filter(site => {
    const matchesFilter = filter === 'all' ||
      (filter === 'wordpress' && site.siteType === 'wordpress_plugin') ||
      (filter === 'manual' && site.siteType === 'manual') ||
      (filter === 'active' && site.status === 'active') ||
      (filter === 'inactive' && site.status !== 'active');

    const matchesSearch = !searchTerm ||
      site.siteName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.siteUrl.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getSiteStats = () => {
    const total = sites.length;
    const wordpress = sites.filter(s => s.siteType === 'wordpress_plugin').length;
    const manual = sites.filter(s => s.siteType === 'manual').length;
    const active = sites.filter(s => s.status === 'active').length;

    return { total, wordpress, manual, active };
  };

  const stats = getSiteStats();

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-700 rounded p-4">
                <div className="h-4 bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Site Management</h2>
          <p className="text-gray-400 mt-1">Manage your protected websites and WordPress plugins</p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add New Site</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Sites</p>
              <p className="text-2xl font-bold text-white mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">WordPress Sites</p>
              <p className="text-2xl font-bold text-green-400 mt-2">{stats.wordpress}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Manual Sites</p>
              <p className="text-2xl font-bold text-yellow-400 mt-2">{stats.manual}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Active Sites</p>
              <p className="text-2xl font-bold text-blue-400 mt-2">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search sites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Sites</option>
          <option value="wordpress">WordPress Only</option>
          <option value="manual">Manual Only</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Sites List */}
      {filteredSites.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {sites.length === 0 ? 'No Sites Added Yet' : 'No Sites Match Your Filter'}
          </h3>
          <p className="text-gray-400 mb-4">
            {sites.length === 0
              ? 'Add your first website to start protecting it from AI bots'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
          {sites.length === 0 && (
            <button
              onClick={() => setShowWizard(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
            >
              Add Your First Site
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredSites.map((site) => (
            <div key={site.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{site.siteName || site.siteUrl}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${site.status === 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}>
                      {site.status}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${site.siteType === 'wordpress_plugin' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                      }`}>
                      {site.siteType === 'wordpress_plugin' ? 'WordPress' : 'Manual'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">{site.siteUrl}</p>
                  {site.analytics && (
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className="text-blue-400">{site.analytics.totalRequests} requests</span>
                      <span className="text-red-400">{site.analytics.botRequests} bots</span>
                      <span className="text-green-400">${parseFloat(site.analytics.totalRevenue || 0).toFixed(2)} revenue</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedSite(site);
                      onSiteSelect?.(site.id);
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition duration-200"
                  >
                    View Details
                  </button>
                  {site.siteType === 'wordpress_plugin' && (
                    <button
                      onClick={() => {
                        setSelectedSite(site);
                        setShowConfig(true);
                      }}
                      className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition duration-200"
                    >
                      Configure
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleStatus(site.id, site.status)}
                    className={`px-3 py-1 text-white text-sm rounded transition duration-200 ${site.status === 'active'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-green-600 hover:bg-green-700'
                      }`}
                  >
                    {site.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteSite(site.id, site.siteName || site.siteUrl)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showWizard && (
        <PluginInstallationWizard
          onComplete={handleWizardComplete}
          onCancel={() => setShowWizard(false)}
        />
      )}

      {showPluginGuide && selectedSite && (
        <WordPressPluginGuide
          site={selectedSite}
          onClose={() => {
            setShowPluginGuide(false);
            setSelectedSite(null);
          }}
        />
      )}

      {showConfig && selectedSite && (
        <WordPressSiteConfig
          site={selectedSite}
          onClose={() => {
            setShowConfig(false);
            setSelectedSite(null);
          }}
          onConfigUpdate={handleConfigUpdate}
        />
      )}
    </div>
  );
};

export default SiteManagementDashboard;
