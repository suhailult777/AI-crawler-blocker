import { useState, useEffect } from 'react';
import useSubscription from '../../hooks/useSubscription';
import { PLAN_CONFIGS } from '../../services/api';
import toast from 'react-hot-toast';

const BillingPanel = () => {
  const { 
    subscription, 
    loading, 
    getSubscriptionStatus, 
    upgradePlan, 
    cancelSubscription,
    subscribeToPlan 
  } = useSubscription();
  
  const [upgrading, setUpgrading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const subscriptionStatus = getSubscriptionStatus();

  const handleUpgrade = async (planName) => {
    setUpgrading(true);
    try {
      const result = await upgradePlan(planName);
      if (result.success) {
        toast.success(`Successfully upgraded to ${planName} plan!`);
      }
    } catch (error) {
      console.error('Upgrade error:', error);
    } finally {
      setUpgrading(false);
    }
  };

  const handleSubscribe = async (planName) => {
    setUpgrading(true);
    try {
      const result = await subscribeToPlan(planName);
      if (result.success) {
        toast.success(`Successfully subscribed to ${planName} plan!`);
      }
    } catch (error) {
      console.error('Subscribe error:', error);
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
      return;
    }

    setCancelling(true);
    try {
      const result = await cancelSubscription();
      if (result.success) {
        toast.success('Subscription cancelled successfully');
      }
    } catch (error) {
      console.error('Cancel error:', error);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'cancelled': return 'text-yellow-400';
      case 'expired': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'cancelled': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'expired': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Current Subscription</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(subscriptionStatus.status)}`}>
            {subscriptionStatus.status === 'none' ? 'No Subscription' : subscriptionStatus.status.charAt(0).toUpperCase() + subscriptionStatus.status.slice(1)}
          </span>
        </div>

        {subscription ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Plan</p>
                <p className="text-white font-medium">{subscription.planDisplayName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Price</p>
                <p className="text-white font-medium">{subscription.formattedPrice}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className={`font-medium ${getStatusColor(subscription.status)}`}>
                  {subscriptionStatus.message}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Next Billing</p>
                <p className="text-white font-medium">
                  {subscription.renewalDate ? new Date(subscription.renewalDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
              {subscriptionStatus.canUpgrade && (
                <>
                  {subscription.planName !== 'pro' && (
                    <button
                      onClick={() => handleUpgrade('pro')}
                      disabled={upgrading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition duration-300 disabled:opacity-50"
                    >
                      {upgrading ? 'Upgrading...' : 'Upgrade to Pro'}
                    </button>
                  )}
                  {subscription.planName !== 'enterprise' && (
                    <button
                      onClick={() => handleUpgrade('enterprise')}
                      disabled={upgrading}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm font-medium transition duration-300 disabled:opacity-50"
                    >
                      {upgrading ? 'Upgrading...' : 'Upgrade to Enterprise'}
                    </button>
                  )}
                </>
              )}
              
              {subscriptionStatus.canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition duration-300 disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-white mb-2">No Active Subscription</h4>
            <p className="text-gray-400 mb-6">You're currently on the free plan. Upgrade to unlock premium features.</p>
            
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => handleSubscribe('pro')}
                disabled={upgrading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition duration-300 disabled:opacity-50"
              >
                {upgrading ? 'Processing...' : 'Upgrade to Pro'}
              </button>
              <button
                onClick={() => handleSubscribe('enterprise')}
                disabled={upgrading}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition duration-300 disabled:opacity-50"
              >
                {upgrading ? 'Processing...' : 'Upgrade to Enterprise'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Plan Comparison */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(PLAN_CONFIGS).map(([planKey, config]) => (
            <div 
              key={planKey}
              className={`p-4 rounded-lg border ${
                subscription?.planName === planKey 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-600 bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{config.name}</h4>
                {subscription?.planName === planKey && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Current</span>
                )}
              </div>
              <p className="text-2xl font-bold text-blue-400 mb-2">
                ${config.price}{config.price > 0 ? '/mo' : ''}
              </p>
              <ul className="text-sm text-gray-300 space-y-1">
                {config.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="h-4 w-4 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BillingPanel;
