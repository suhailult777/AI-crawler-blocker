import { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, subDays } from 'date-fns';

const AnalyticsCharts = ({ compact = false }) => {
  const [dateRange, setDateRange] = useState('30');

  // Generate mock data
  const generateRequestData = (days) => {
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      return {
        date: format(date, 'MM/dd'),
        blocked: Math.floor(Math.random() * 200 + 100),
        allowed: Math.floor(Math.random() * 150 + 50),
        monetized: Math.floor(Math.random() * 100 + 25)
      };
    });
  };

  const generateRevenueData = (days) => {
    return Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      return {
        date: format(date, 'MM/dd'),
        revenue: Math.random() * 50 + 10
      };
    });
  };

  const botDistributionData = [
    { name: 'ChatGPT', value: 35, color: '#10B981' },
    { name: 'Gemini', value: 25, color: '#3B82F6' },
    { name: 'Claude', value: 20, color: '#8B5CF6' },
    { name: 'Bing AI', value: 15, color: '#F59E0B' },
    { name: 'Perplexity', value: 5, color: '#EF4444' }
  ];

  const requestData = generateRequestData(parseInt(dateRange));
  const revenueData = generateRevenueData(parseInt(dateRange));

  const dateRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' }
  ];

  const exportChart = (chartType) => {
    // Mock export functionality
    console.log(`Exporting ${chartType} chart...`);
  };

  if (compact) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Analytics</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={requestData.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#374151',
                  border: '1px solid #4B5563',
                  borderRadius: '6px',
                  color: '#fff'
                }}
              />
              <Line type="monotone" dataKey="blocked" stroke="#EF4444" strokeWidth={2} />
              <Line type="monotone" dataKey="allowed" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="monetized" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => exportChart('all')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition duration-200"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Request Trends Chart */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Request Trends</h3>
          <button
            onClick={() => exportChart('requests')}
            className="text-gray-400 hover:text-white text-sm"
          >
            Export PNG
          </button>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={requestData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#374151',
                  border: '1px solid #4B5563',
                  borderRadius: '6px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="blocked" stroke="#EF4444" strokeWidth={2} name="Blocked" />
              <Line type="monotone" dataKey="allowed" stroke="#10B981" strokeWidth={2} name="Allowed" />
              <Line type="monotone" dataKey="monetized" stroke="#3B82F6" strokeWidth={2} name="Monetized" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Daily Revenue</h3>
            <button
              onClick={() => exportChart('revenue')}
              className="text-gray-400 hover:text-white text-sm"
            >
              Export PNG
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#374151',
                    border: '1px solid #4B5563',
                    borderRadius: '6px',
                    color: '#fff'
                  }}
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bot Distribution Chart */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Bot Distribution</h3>
            <button
              onClick={() => exportChart('distribution')}
              className="text-gray-400 hover:text-white text-sm"
            >
              Export PNG
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={botDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {botDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#374151',
                    border: '1px solid #4B5563',
                    borderRadius: '6px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
