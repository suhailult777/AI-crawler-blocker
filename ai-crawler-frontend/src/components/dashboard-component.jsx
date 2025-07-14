import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import OverviewCards from './dashboard/OverviewCards';
import BotControlPanel from './dashboard/BotControlPanel';
import AnalyticsCharts from './dashboard/AnalyticsCharts';
import RequestLogsTable from './dashboard/RequestLogsTable';
import SettingsPanel from './dashboard/SettingsPanel';
import RevenueManagement from './dashboard/RevenueManagement';
import BillingPanel from './dashboard/billing-panel';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [dashboardData, setDashboardData] = useState({
        overview: {
            botsBlockedToday: 1247,
            revenueThisMonth: 2847.50,
            activeRules: 12,
            requestsProcessed24h: 3891
        },
        botSettings: {
            chatgpt: { status: 'monetized', price: 0.05, name: 'ChatGPT (OpenAI)', userAgent: 'GPTBot' },
            gemini: { status: 'blocked', price: 0.00, name: 'Gemini (Google)', userAgent: 'Google-Extended' },
            claude: { status: 'allowed', price: 0.00, name: 'Claude (Anthropic)', userAgent: 'ClaudeBot' },
            bing: { status: 'monetized', price: 0.03, name: 'Bing AI (Microsoft)', userAgent: 'BingBot' },
            perplexity: { status: 'blocked', price: 0.00, name: 'Perplexity', userAgent: 'PerplexityBot' }
        }
    });

    const tabs = [
        { id: 'overview', name: 'Overview', icon: '📊' },
        { id: 'bots', name: 'Bot Control', icon: '🤖' },
        { id: 'analytics', name: 'Analytics', icon: '📈' },
        { id: 'logs', name: 'Request Logs', icon: '📋' },
        { id: 'revenue', name: 'Revenue', icon: '💰' },
        { id: 'billing', name: 'Billing', icon: '💳' },
        { id: 'settings', name: 'Settings', icon: '⚙️' }
    ];

    const updateBotSettings = (botId, newSettings) => {
        setDashboardData(prev => ({
            ...prev,
            botSettings: {
                ...prev.botSettings,
                [botId]: { ...prev.botSettings[botId], ...newSettings }
            }
        }));
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <OverviewCards data={dashboardData.overview} />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <BotControlPanel
                                botSettings={dashboardData.botSettings}
                                onUpdateBot={updateBotSettings}
                                compact={true}
                            />
                            <AnalyticsCharts compact={true} />
                        </div>
                    </div>
                );
            case 'bots':
                return (
                    <BotControlPanel
                        botSettings={dashboardData.botSettings}
                        onUpdateBot={updateBotSettings}
                    />
                );
            case 'analytics':
                return <AnalyticsCharts />;
            case 'logs':
                return <RequestLogsTable />;
            case 'revenue':
                return <RevenueManagement />;
            case 'billing':
                return <BillingPanel />;
            case 'settings':
                return <SettingsPanel />;
            default:
                return <OverviewCards data={dashboardData.overview} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#374151',
                        color: '#fff',
                    },
                }}
            />

            {/* Header */}
            <div className="bg-gray-800 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                                <p className="mt-1 text-gray-300">Welcome back! Here's what's happening with your bot protection.</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm text-gray-400">Last updated</p>
                                    <p className="text-white font-medium">{new Date().toLocaleTimeString()}</p>
                                </div>
                                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-medium">U</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex space-x-8 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition duration-300 flex items-center space-x-2`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {renderTabContent()}
            </main>
        </div>
    );
};

export default Dashboard;