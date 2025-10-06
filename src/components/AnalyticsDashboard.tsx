import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { AppContext } from '../application/AppContext';

export function AnalyticsDashboard() {
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [delivered, setDelivered] = useState(0);
  const [read, setRead] = useState(0);
  const [snoozed, setSnoozed] = useState(0);
  const [severityBreakdown, setSeverityBreakdown] = useState<{ severity: string; count: number }[]>([]);

  useEffect(() => {
    const ctx = AppContext.getInstance();
    const analytics = ctx.analyticsService;

    setTotalAlerts(analytics.getTotalAlerts());
    setDelivered(analytics.getAlertsDelivered());
    setRead(analytics.getAlertsRead());

    const snoozedCounts = analytics.getSnoozedCounts();
    const totalSnoozed = Array.from(snoozedCounts.values()).reduce((sum, count) => sum + count, 0);
    setSnoozed(totalSnoozed);

    const breakdown = analytics.getSeverityBreakdown();
    const breakdownArray = Array.from(breakdown.entries()).map(([severity, count]) => ({
      severity,
      count
    }));
    setSeverityBreakdown(breakdownArray);
  }, []);

  const stats = [
    {
      label: 'Total Alerts',
      value: totalAlerts,
      icon: BarChart3,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      label: 'Deliveries',
      value: delivered,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      label: 'Read',
      value: read,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      label: 'Snoozed',
      value: snoozed,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">{stat.label}</span>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </div>
          );
        })}
      </div>

      {severityBreakdown.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Severity Breakdown</h3>
          <div className="grid grid-cols-3 gap-4">
            {severityBreakdown.map(({ severity, count }) => (
              <div key={severity} className="border border-gray-200 rounded-lg p-3">
                <div className={`text-xs font-semibold mb-1 ${
                  severity === 'critical' ? 'text-red-600' :
                  severity === 'warning' ? 'text-orange-600' :
                  'text-blue-600'
                }`}>
                  {severity.toUpperCase()}
                </div>
                <div className="text-xl font-bold text-gray-900">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
