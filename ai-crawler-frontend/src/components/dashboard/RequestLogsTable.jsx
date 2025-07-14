import { useState, useMemo } from 'react';
import { format } from 'date-fns';

const RequestLogsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Generate mock data
  const generateMockLogs = () => {
    const botTypes = ['ChatGPT', 'Gemini', 'Claude', 'Bing AI', 'Perplexity'];
    const actions = ['blocked', 'allowed', 'monetized'];
    const countries = ['🇺🇸', '🇬🇧', '🇩🇪', '🇫🇷', '🇯🇵', '🇨🇦', '🇦🇺'];
    const urls = ['/api/data', '/content/articles', '/products', '/search', '/blog'];

    return Array.from({ length: 500 }, (_, i) => {
      const action = actions[Math.floor(Math.random() * actions.length)];
      return {
        id: i + 1,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        botType: botTypes[Math.floor(Math.random() * botTypes.length)],
        ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        country: countries[Math.floor(Math.random() * countries.length)],
        requestedUrl: urls[Math.floor(Math.random() * urls.length)] + `?id=${Math.floor(Math.random() * 1000)}`,
        action,
        revenue: action === 'monetized' ? Math.random() * 0.1 + 0.01 : 0,
        userAgent: `${botTypes[Math.floor(Math.random() * botTypes.length)]}Bot/1.0`
      };
    });
  };

  const allLogs = useMemo(() => generateMockLogs(), []);

  // Filter logs based on search term
  const filteredLogs = useMemo(() => {
    if (!searchTerm) return allLogs;
    
    return allLogs.filter(log =>
      log.botType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm) ||
      log.requestedUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allLogs, searchTerm]);

  // Paginate filtered logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const getActionColor = (action) => {
    switch (action) {
      case 'blocked':
        return 'bg-red-500 text-white';
      case 'allowed':
        return 'bg-green-500 text-white';
      case 'monetized':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'Bot Type', 'IP Address', 'Requested URL', 'Action', 'Revenue'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        format(log.timestamp, 'MM/dd/yyyy HH:mm:ss'),
        log.botType,
        log.ipAddress,
        log.requestedUrl,
        log.action,
        log.revenue > 0 ? `$${log.revenue.toFixed(3)}` : 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bot-requests-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const truncateUrl = (url, maxLength = 30) => {
    return url.length > maxLength ? `${url.substring(0, maxLength)}...` : url;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Request Logs</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 pl-10 text-white text-sm focus:outline-none focus:border-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition duration-200"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Bot Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Requested URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {format(log.timestamp, 'MM/dd/yyyy HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {log.botType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <span>{log.country}</span>
                      <span>{log.ipAddress}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    <span title={log.requestedUrl}>
                      {truncateUrl(log.requestedUrl)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {log.revenue > 0 ? `$${log.revenue.toFixed(3)}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedRequest(log)}
                      className="text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-700 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-300">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded transition duration-200"
            >
              Previous
            </button>
            <span className="text-gray-300 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm rounded transition duration-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Request Details</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-400">ID:</span> <span className="text-white">{selectedRequest.id}</span></div>
              <div><span className="text-gray-400">Timestamp:</span> <span className="text-white">{format(selectedRequest.timestamp, 'MM/dd/yyyy HH:mm:ss')}</span></div>
              <div><span className="text-gray-400">Bot Type:</span> <span className="text-white">{selectedRequest.botType}</span></div>
              <div><span className="text-gray-400">User Agent:</span> <span className="text-white">{selectedRequest.userAgent}</span></div>
              <div><span className="text-gray-400">IP Address:</span> <span className="text-white">{selectedRequest.ipAddress}</span></div>
              <div><span className="text-gray-400">Requested URL:</span> <span className="text-white break-all">{selectedRequest.requestedUrl}</span></div>
              <div><span className="text-gray-400">Action:</span> <span className={`px-2 py-1 rounded text-xs ${getActionColor(selectedRequest.action)}`}>{selectedRequest.action}</span></div>
              <div><span className="text-gray-400">Revenue:</span> <span className="text-white">{selectedRequest.revenue > 0 ? `$${selectedRequest.revenue.toFixed(3)}` : 'N/A'}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestLogsTable;
