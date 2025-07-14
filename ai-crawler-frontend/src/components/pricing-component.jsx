import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import useSubscription from '../hooks/useSubscription';
import toast from 'react-hot-toast';

const PricingPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const { subscribeToPlan, loading: subscriptionLoading, subscription } = useSubscription();
    const [processingPlan, setProcessingPlan] = useState(null);

    const handleSubscribe = async (planName) => {
        if (!isAuthenticated) {
            toast.error('Please sign in to subscribe to a plan');
            navigate('/auth');
            return;
        }

        if (subscription && subscription.status === 'active') {
            toast.error('You already have an active subscription. Please upgrade or cancel your current plan first.');
            navigate('/dashboard');
            return;
        }

        setProcessingPlan(planName);

        try {
            const result = await subscribeToPlan(planName);
            if (result.success) {
                toast.success(`Successfully subscribed to ${planName} plan!`);
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Subscription error:', error);
        } finally {
            setProcessingPlan(null);
        }
    };
    const pricingTiers = [
        {
            name: 'Free',
            planKey: 'free',
            subtitle: 'User Acquisition Engine',
            price: '$0',
            period: '/month',
            description: 'Perfect for getting started with bot detection and revenue insights',
            features: [
                'Advanced Bot Detection: Identify AI bots with 95%+ accuracy',
                'Revenue Analytics Dashboard: See exactly how much money you\'re losing from unmonetized AI traffic',
                'Real-time Monitoring: Track bot visits and potential revenue in real-time',
                'Basic reporting and insights',
                'Community support'
            ],
            cta: 'Get Started Free',
            ctaAction: () => handleSubscribe('free'),
            popular: false,
            ctaStyle: 'bg-gray-800 hover:bg-gray-700 text-blue-400'
        },
        {
            name: 'Pro',
            planKey: 'pro',
            subtitle: 'Full Monetization Engine',
            price: '$15',
            period: '/month',
            description: 'Convert bot traffic into revenue with advanced monetization tools',
            features: [
                'All Free Tier features',
                'Full Monetization Engine: Convert bot traffic into revenue',
                'Stripe Connect Integration: Secure, automated payouts',
                'Advanced Rule Engine: Granular control over bot access',
                'Priority Support: Dedicated email support',
                'Advanced analytics and reporting',
                'Custom bot detection rules'
            ],
            cta: 'Start Pro Trial',
            ctaAction: () => handleSubscribe('pro'),
            popular: true,
            ctaStyle: 'bg-blue-600 hover:bg-blue-700 text-white'
        },
        {
            name: 'Enterprise',
            planKey: 'enterprise',
            subtitle: 'White-label Solution',
            price: '$99',
            period: '/month',
            description: 'Complete white-label solution with dedicated support and custom features',
            features: [
                'All Pro Tier features',
                'White-label Solution: Remove AI Crawler branding, use your own',
                'Custom Integration Support: Dedicated technical support for complex setups',
                'Dedicated Account Manager: Personal point of contact for your business',
                'SLA Guarantee: 99.9% uptime guarantee with priority support',
                'Custom Analytics: Tailored reporting and insights for your business',
                'API Access: Full API access for custom integrations'
            ],
            cta: 'Contact Sales',
            ctaAction: () => handleSubscribe('enterprise'),
            popular: false,
            ctaStyle: 'bg-purple-600 hover:bg-purple-700 text-white'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header Section */}
            <div className="relative py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
                            <span className="block">Choose Your</span>
                            <span className="block text-blue-400">Bot Protection Plan</span>
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-300">
                            Stop losing revenue to unauthorized AI crawlers. Choose the plan that fits your needs and start monetizing your bot traffic today.
                        </p>
                    </div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
                        {pricingTiers.map((tier) => (
                            <div
                                key={tier.name}
                                className={`relative rounded-2xl shadow-xl ${tier.popular
                                    ? 'bg-gray-800 border-2 border-blue-500 transform scale-105'
                                    : 'bg-gray-800 border border-gray-700'
                                    } transition-all duration-300 hover:shadow-2xl hover:scale-105`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="p-8">
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
                                        <p className="text-blue-400 font-medium mt-1">{tier.subtitle}</p>
                                        <div className="mt-4 flex items-baseline justify-center">
                                            <span className="text-5xl font-extrabold text-white">{tier.price}</span>
                                            <span className="ml-1 text-xl text-gray-400">{tier.period}</span>
                                        </div>
                                        <p className="mt-4 text-gray-300 text-sm">{tier.description}</p>
                                    </div>

                                    <ul className="mt-8 space-y-4">
                                        {tier.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-start">
                                                <div className="flex-shrink-0">
                                                    <svg
                                                        className="h-5 w-5 text-blue-400"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <p className="ml-3 text-gray-300 text-sm">{feature}</p>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-8">
                                        <button
                                            onClick={tier.ctaAction}
                                            disabled={processingPlan === tier.planKey}
                                            className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md transition duration-300 ${tier.ctaStyle} disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {processingPlan === tier.planKey ? (
                                                <div className="flex items-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Processing...
                                                </div>
                                            ) : (
                                                tier.cta
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Trust Indicators Section */}
            <div className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-white mb-8">
                            Trusted by Websites Worldwide
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-400">95%+</div>
                                <div className="text-gray-300 mt-2">Bot Detection Accuracy</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-400">$2M+</div>
                                <div className="text-gray-300 mt-2">Revenue Protected Monthly</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-400">10K+</div>
                                <div className="text-gray-300 mt-2">Websites Protected</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-16 bg-gray-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold text-white">
                            Frequently Asked Questions
                        </h2>
                    </div>
                    <div className="space-y-8">
                        <div className="bg-gray-900 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-white mb-2">
                                How does bot monetization work?
                            </h3>
                            <p className="text-gray-300">
                                Our system detects AI crawlers and bots accessing your content, then presents them with payment options to continue accessing your data. You set the pricing rules and we handle the collection and payouts.
                            </p>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-white mb-2">
                                Will this affect my regular users?
                            </h3>
                            <p className="text-gray-300">
                                No, our AI detection is highly accurate and only targets automated bots and crawlers. Regular human users will never see payment requests or experience any interruption to their browsing.
                            </p>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-6">
                            <h3 className="text-lg font-medium text-white mb-2">
                                Can I customize the pricing for different bots?
                            </h3>
                            <p className="text-gray-300">
                                Yes! With our Pro and Business plans, you can set custom pricing rules based on bot type, content value, and access frequency. You have full control over your monetization strategy.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="py-16 bg-gray-900">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                        Ready to Start Monetizing Bot Traffic?
                    </h2>
                    <p className="mt-4 text-xl text-gray-300">
                        Join thousands of website owners who are already earning revenue from AI crawlers.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => handleSubscribe('free')}
                            disabled={processingPlan === 'free'}
                            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition duration-300 disabled:opacity-50"
                        >
                            {processingPlan === 'free' ? 'Processing...' : 'Start Free Trial'}
                        </button>
                        <button
                            onClick={() => handleSubscribe('enterprise')}
                            disabled={processingPlan === 'enterprise'}
                            className="inline-flex items-center justify-center px-8 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-300 bg-transparent hover:bg-gray-800 transition duration-300 disabled:opacity-50"
                        >
                            {processingPlan === 'enterprise' ? 'Processing...' : 'Schedule Demo'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;