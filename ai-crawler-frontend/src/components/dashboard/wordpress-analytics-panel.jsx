import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const WordPressAnalyticsPanel = ({ siteId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'];

  useEffect(() => {
    if (siteId) {
      fetchAnalytics();
    }
  }, [siteId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/v1/wordpress/sites/${siteId}/analytics?days=${timeRange}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">No analytics data available</p>
      </div>
    );
  }

  const { summary, chartData, topBots } = analytics;

  // Prepare chart data
  const chartDataFormatted = chartData?.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    requests: parseInt(item.totalRequests),
    bots: parseInt(item.botRequests),
    monetized: parseInt(item.monetizedRequests),
    revenue: parseFloat(item.totalRevenue)
  })) || [];

  // Prepare pie chart data for top bots
  const pieData = topBots?.slice(0, 6).map((bot, index) => ({
    name: bot.botName || 'Unknown',
    value: parseInt(bot.requestCount),
    color: COLORS[index % COLORS.length]
  })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
          <p className="text-gray-400 mt-1">Bot detection and monetization insights</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(parseInt(e.target.value))}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Requests</p>
              <p className="text-2xl font-bold text-white mt-2">{summary.totalRequests?.toLocaleString() || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Bot Requests</p>
              <p className="text-2xl font-bold text-red-400 mt-2">{summary.botRequests?.toLocaleString() || 0}</p>
              <p className="text-gray-400 text-xs mt-1">
                {summary.totalRequests > 0 ? ((summary.botRequests / summary.totalRequests) * 100).toFixed(1) : 0}% of total
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500 bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Monetized Requests</p>
              <p className="text-2xl font-bold text-green-400 mt-2">{summary.monetizedRequests?.toLocaleString() || 0}</p>
              <p className="text-gray-400 text-xs mt-1">
                {summary.botRequests > 0 ? ((summary.monetizedRequests / summary.botRequests) * 100).toFixed(1) : 0}% of bots
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-yellow-400 mt-2">${parseFloat(summary.totalRevenue || 0).toFixed(2)}</p>
              <p className="text-gray-400 text-xs mt-1">
                Avg: ${summary.monetizedRequests > 0 ? (summary.totalRevenue / summary.monetizedRequests).toFixed(4) : '0.0000'}/request
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 bg-opacity-20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests Over Time */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Requests Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartDataFormatted}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Line type="monotone" dataKey="requests" stroke="#3B82F6" strokeWidth={2} name="Total Requests" />
              <Line type="monotone" dataKey="bots" stroke="#EF4444" strokeWidth={2} name="Bot Requests" />
              <Line type="monotone" dataKey="monetized" stroke="#10B981" strokeWidth={2} name="Monetized" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Over Time */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartDataFormatted}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
                formatter={(value) => [`$${parseFloat(value).toFixed(4)}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Bots and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Bot Types */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Bot Types</h3>
          {pieData.length > 0 ? (
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-white text-sm">{entry.name}</span>
                    <span className="text-gray-400 text-sm">({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No bot data available</p>
          )}
        </div>

        {/* Top Bots Table */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Bot Details</h3>
          <div className="space-y-3">
            {topBots?.slice(0, 5).map((bot, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700 rounded p-3">
                <div>
                  <div className="text-white font-medium">{bot.botName || 'Unknown Bot'}</div>
                  <div className="text-gray-400 text-sm">{bot.requestCount} requests</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-medium">${parseFloat(bot.totalRevenue || 0).toFixed(4)}</div>
                  <div className="text-gray-400 text-sm">
                    {bot.avgConfidence ? `${parseFloat(bot.avgConfidence).toFixed(0)}% confidence` : 'N/A'}
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-gray-400 text-center py-4">No bot activity recorded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordPressAnalyticsPanel;
