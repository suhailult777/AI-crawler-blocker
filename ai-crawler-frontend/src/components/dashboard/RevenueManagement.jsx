import { useState } from 'react';
import { format, subMonths } from 'date-fns';

const RevenueManagement = () => {
  const [payoutSchedule, setPayoutSchedule] = useState('monthly');

  // Generate mock revenue data
  const currentMonthRevenue = 2847.50;
  const lastMonthRevenue = 2234.75;
  const revenueGrowth = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1);

  const generatePaymentHistory = () => {
    return Array.from({ length: 12 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        id: i + 1,
        month: format(date, 'MMMM yyyy'),
        revenue: Math.random() * 1000 + 1500,
        payout: Math.random() * 900 + 1350,
        status: i === 0 ? 'pending' : 'completed',
        payoutDate: i === 0 ? null : format(subMonths(new Date(), i - 1), 'MM/dd/yyyy')
      };
    });
  };

  const paymentHistory = generatePaymentHistory();

  const botRevenueBreakdown = [
    { bot: 'ChatGPT', revenue: 1247.30, percentage: 43.8, requests: 24946 },
    { bot: 'Gemini', revenue: 892.15, percentage: 31.3, requests: 17843 },
    { bot: 'Claude', revenue: 456.80, percentage: 16.0, requests: 9136 },
    { bot: 'Bing AI', revenue: 189.25, percentage: 6.6, requests: 6308 },
    { bot: 'Perplexity', revenue: 62.00, percentage: 2.2, requests: 1240 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'failed':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handlePayoutScheduleChange = (schedule) => {
    setPayoutSchedule(schedule);
    // In a real app, this would update the backend
    console.log(`Payout schedule changed to: ${schedule}`);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Revenue Management</h2>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Current Month</p>
              <p className="text-3xl font-bold text-white mt-2">${currentMonthRevenue.toFixed(2)}</p>
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}%
                </span>
                <span className="text-gray-400 text-sm ml-1">vs last month</span>
              </div>
            </div>
            <div className="bg-green-500/10 text-green-400 p-3 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Pending Payout</p>
              <p className="text-3xl font-bold text-white mt-2">${(currentMonthRevenue * 0.95).toFixed(2)}</p>
              <p className="text-gray-400 text-sm mt-2">Available {format(new Date(), 'MM/dd/yyyy')}</p>
            </div>
            <div className="bg-yellow-500/10 text-yellow-400 p-3 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Lifetime</p>
              <p className="text-3xl font-bold text-white mt-2">${paymentHistory.reduce((sum, payment) => sum + payment.revenue, 0).toFixed(2)}</p>
              <p className="text-gray-400 text-sm mt-2">Since launch</p>
            </div>
            <div className="bg-blue-500/10 text-blue-400 p-3 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown by Bot */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by Bot Type</h3>
          <div className="space-y-4">
            {botRevenueBreakdown.map((bot) => (
              <div key={bot.bot} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{bot.bot}</span>
                    <span className="text-gray-300">${bot.revenue.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{bot.requests.toLocaleString()} requests</span>
                    <span>{bot.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${bot.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payout Configuration */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Payout Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Payout Schedule
              </label>
              <div className="space-y-2">
                {['weekly', 'monthly', 'quarterly'].map((schedule) => (
                  <label key={schedule} className="flex items-center">
                    <input
                      type="radio"
                      name="payoutSchedule"
                      value={schedule}
                      checked={payoutSchedule === schedule}
                      onChange={(e) => handlePayoutScheduleChange(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-gray-300 capitalize">{schedule}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Platform Fee</span>
                <span className="text-white">5%</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Processing Fee</span>
                <span className="text-white">2.9% + $0.30</span>
              </div>
              <div className="flex items-center justify-between font-medium">
                <span className="text-white">Net Payout Rate</span>
                <span className="text-green-400">~92%</span>
              </div>
            </div>

            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition duration-200">
              Update Payout Settings
            </button>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Payment History</h3>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition duration-200">
              Export CSV
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Payout
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Payout Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {paymentHistory.slice(0, 6).map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {payment.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      ${payment.revenue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      ${payment.payout.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {payment.payoutDate || 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueManagement;
