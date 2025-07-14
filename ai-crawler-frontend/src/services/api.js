// API Configuration
const API_BASE_URL = 'http://localhost:5500/api/v1';

// API Client class for handling HTTP requests
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('botguard_token');
  }

  // Create request headers with authentication
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
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

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  // POST request
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PUT request
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

// Create API client instance
const apiClient = new ApiClient();

// Auth API methods
export const authAPI = {
  signUp: (userData) => apiClient.post('/auth/sign-up', userData, { includeAuth: false }),
  signIn: (credentials) => apiClient.post('/auth/sign-in', credentials, { includeAuth: false }),
  signOut: () => apiClient.post('/auth/sign-out'),
};

// User API methods
export const userAPI = {
  getProfile: (userId) => apiClient.get(`/users/${userId}`),
  getAllUsers: () => apiClient.get('/users'),
};

// Subscription API methods
export const subscriptionAPI = {
  // Create a new subscription
  create: (subscriptionData) => apiClient.post('/subscriptions', subscriptionData),
  
  // Get current user's active subscription
  getCurrent: () => apiClient.get('/subscriptions/me/current'),
  
  // Get all subscriptions (admin)
  getAll: () => apiClient.get('/subscriptions'),
  
  // Get subscription by ID
  getById: (id) => apiClient.get(`/subscriptions/${id}`),
  
  // Get user's subscriptions
  getUserSubscriptions: (userId) => apiClient.get(`/subscriptions/user/${userId}`),
  
  // Update subscription
  update: (id, updateData) => apiClient.put(`/subscriptions/${id}`, updateData),
  
  // Cancel subscription
  cancel: (id) => apiClient.put(`/subscriptions/${id}/cancel`),
  
  // Upgrade plan
  upgradePlan: (planName) => apiClient.put('/subscriptions/me/upgrade', { planName }),
  
  // Get upcoming renewals
  getRenewals: () => apiClient.get('/subscriptions/upcoming-renewals'),
};

// Plan configurations (matching backend)
export const PLAN_CONFIGS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      'Advanced Bot Detection',
      'Revenue Analytics Dashboard',
      'Real-time Monitoring',
      'Basic reporting and insights',
      'Community support'
    ],
    limits: {
      monthlyRequests: 10000,
      botDetectionAccuracy: 95,
      analyticsRetention: 30
    }
  },
  pro: {
    name: 'Pro',
    price: 15,
    features: [
      'All Free Tier features',
      'Full Monetization Engine',
      'Stripe Connect Integration',
      'Advanced Rule Engine',
      'Priority Support',
      'Advanced analytics and reporting',
      'Custom bot detection rules'
    ],
    limits: {
      monthlyRequests: 100000,
      botDetectionAccuracy: 99,
      analyticsRetention: 365
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    features: [
      'All Pro Tier features',
      'White-label Solution',
      'Custom Integration Support',
      'Dedicated Account Manager',
      'SLA Guarantee',
      'Custom Analytics',
      'API Access'
    ],
    limits: {
      monthlyRequests: -1,
      botDetectionAccuracy: 99.9,
      analyticsRetention: -1
    }
  }
};

// Helper functions
export const apiHelpers = {
  // Handle API errors consistently
  handleError: (error) => {
    console.error('API Error:', error);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      // Clear auth data and redirect to login
      localStorage.removeItem('botguard_token');
      localStorage.removeItem('botguard_user');
      window.location.href = '/auth';
      return;
    }
    
    throw error;
  },

  // Format subscription data for display
  formatSubscription: (subscription) => {
    if (!subscription) return null;
    
    return {
      ...subscription,
      features: typeof subscription.features === 'string' 
        ? JSON.parse(subscription.features) 
        : subscription.features,
      formattedPrice: `$${subscription.price}/${subscription.frequency}`,
      daysUntilRenewal: Math.ceil(
        (new Date(subscription.renewalDate) - new Date()) / (1000 * 60 * 60 * 24)
      ),
    };
  },

  // Get plan config by name
  getPlanConfig: (planName) => {
    return PLAN_CONFIGS[planName] || PLAN_CONFIGS.free;
  },
};

export default apiClient;
