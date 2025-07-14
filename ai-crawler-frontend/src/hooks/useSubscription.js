import { useState, useEffect, useCallback } from 'react';
import { subscriptionAPI, apiHelpers } from '../services/api';
import toast from 'react-hot-toast';

export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user's subscription
  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await subscriptionAPI.getCurrent();
      const formattedSubscription = apiHelpers.formatSubscription(response.data);
      setSubscription(formattedSubscription);
    } catch (err) {
      if (err.message.includes('404') || err.message.includes('No active subscription')) {
        // User has no active subscription - this is normal for free users
        setSubscription(null);
      } else {
        setError(err.message);
        apiHelpers.handleError(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new subscription
  const createSubscription = useCallback(async (subscriptionData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await subscriptionAPI.create(subscriptionData);
      const formattedSubscription = apiHelpers.formatSubscription(response.data.subscription);
      
      setSubscription(formattedSubscription);
      toast.success('Subscription created successfully!');
      
      return { success: true, data: formattedSubscription };
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to create subscription');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Upgrade plan
  const upgradePlan = useCallback(async (planName) => {
    try {
      setLoading(true);
      setError(null);

      const response = await subscriptionAPI.upgradePlan(planName);
      const formattedSubscription = apiHelpers.formatSubscription(response.data);
      
      setSubscription(formattedSubscription);
      toast.success(`Successfully upgraded to ${planName} plan!`);
      
      return { success: true, data: formattedSubscription };
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to upgrade plan');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Cancel subscription
  const cancelSubscription = useCallback(async () => {
    if (!subscription) return { success: false, error: 'No active subscription' };

    try {
      setLoading(true);
      setError(null);

      const response = await subscriptionAPI.cancel(subscription.id);
      const formattedSubscription = apiHelpers.formatSubscription(response.data);
      
      setSubscription(formattedSubscription);
      toast.success('Subscription cancelled successfully');
      
      return { success: true, data: formattedSubscription };
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to cancel subscription');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [subscription]);

  // Subscribe to a plan (creates subscription with plan details)
  const subscribeToPlan = useCallback(async (planName, paymentMethod = 'stripe') => {
    const planConfig = apiHelpers.getPlanConfig(planName);
    
    const subscriptionData = {
      planName,
      planDisplayName: planConfig.name,
      price: planConfig.price,
      currency: 'USD',
      frequency: 'monthly',
      paymentMethod,
      startDate: new Date().toISOString(),
      features: planConfig.features,
    };

    return await createSubscription(subscriptionData);
  }, [createSubscription]);

  // Check if user has access to a feature
  const hasFeature = useCallback((featureName) => {
    if (!subscription || !subscription.features) return false;
    return subscription.features.includes(featureName);
  }, [subscription]);

  // Check if user is on a specific plan
  const isOnPlan = useCallback((planName) => {
    return subscription?.planName === planName;
  }, [subscription]);

  // Get subscription status info
  const getSubscriptionStatus = useCallback(() => {
    if (!subscription) {
      return {
        status: 'none',
        message: 'No active subscription',
        canUpgrade: true,
        canCancel: false,
      };
    }

    const daysUntilRenewal = subscription.daysUntilRenewal;
    let status = subscription.status;
    let message = '';
    
    if (status === 'active') {
      if (daysUntilRenewal <= 0) {
        message = 'Subscription has expired';
        status = 'expired';
      } else if (daysUntilRenewal <= 7) {
        message = `Renews in ${daysUntilRenewal} day${daysUntilRenewal !== 1 ? 's' : ''}`;
      } else {
        message = `Active until ${new Date(subscription.renewalDate).toLocaleDateString()}`;
      }
    } else if (status === 'cancelled') {
      message = 'Subscription cancelled';
    } else if (status === 'expired') {
      message = 'Subscription expired';
    }

    return {
      status,
      message,
      canUpgrade: status === 'active' && subscription.planName !== 'enterprise',
      canCancel: status === 'active',
      daysUntilRenewal,
    };
  }, [subscription]);

  // Load subscription on mount
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    loading,
    error,
    fetchSubscription,
    createSubscription,
    subscribeToPlan,
    upgradePlan,
    cancelSubscription,
    hasFeature,
    isOnPlan,
    getSubscriptionStatus,
  };
};

export default useSubscription;
