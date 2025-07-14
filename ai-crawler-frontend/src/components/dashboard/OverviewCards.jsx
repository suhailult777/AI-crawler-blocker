import { useState, useEffect } from 'react';

const OverviewCards = ({ data }) => {
  const [animatedValues, setAnimatedValues] = useState({
    botsBlockedToday: 0,
    revenueThisMonth: 0,
    activeRules: 0,
    requestsProcessed24h: 0
  });

  // Animate numbers on mount
  useEffect(() => {
    const animateValue = (key, start, end, duration) => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = start + (end - start) * progress;
        
        setAnimatedValues(prev => ({
          ...prev,
          [key]: Math.floor(current)
        }));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    };

    // Animate each value with different durations
    animateValue('botsBlockedToday', 0, data.botsBlockedToday, 1500);
    animateValue('revenueThisMonth', 0, data.revenueThisMonth, 2000);
    animateValue('activeRules', 0, data.activeRules, 1000);
    animateValue('requestsProcessed24h', 0, data.requestsProcessed24h, 1800);
  }, [data]);

  const cards = [
    {
      title: 'Bots Blocked Today',
      value: animatedValues.botsBlockedToday.toLocaleString(),
      icon: '🛡️',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      trend: '+12%',
      trendColor: 'text-green-400'
    },
    {
      title: 'Revenue This Month',
      value: `$${(animatedValues.revenueThisMonth / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: '💰',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      trend: '+28%',
      trendColor: 'text-green-400'
    },
    {
      title: 'Active Rules',
      value: animatedValues.activeRules.toString(),
      icon: '⚙️',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      trend: '+2',
      trendColor: 'text-blue-400'
    },
    {
      title: 'Requests (24h)',
      value: animatedValues.requestsProcessed24h.toLocaleString(),
      icon: '📊',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      trend: '+5%',
      trendColor: 'text-green-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{card.title}</p>
              <p className="text-2xl font-bold text-white mt-2">{card.value}</p>
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${card.trendColor}`}>
                  {card.trend}
                </span>
                <span className="text-gray-400 text-sm ml-1">vs last period</span>
              </div>
            </div>
            <div className={`${card.bgColor} ${card.color} p-3 rounded-lg`}>
              <span className="text-2xl">{card.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;
