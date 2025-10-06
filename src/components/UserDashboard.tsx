import { useState, useEffect } from 'react';
import { Bell, BellOff, Check, Clock } from 'lucide-react';
import { AppContext } from '../application/AppContext';
import { Alert, Severity } from '../domain/models';

interface UserDashboardProps {
  userId: string;
}

export function UserDashboard({ userId }: UserDashboardProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [preferences, setPreferences] = useState<Map<string, { isRead: boolean; isSnoozed: boolean }>>(new Map());

  const loadData = () => {
    const ctx = AppContext.getInstance();
    const userAlerts = ctx.userNotificationService.getUserAlerts(userId);
    setAlerts(userAlerts);

    const prefs = ctx.userNotificationService.getUserPreferences(userId);
    const prefMap = new Map();
    const now = new Date();

    prefs.forEach(pref => {
      prefMap.set(pref.alertId, {
        isRead: pref.isRead,
        isSnoozed: pref.snoozedUntil ? pref.snoozedUntil > now : false
      });
    });

    setPreferences(prefMap);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleMarkAsRead = (alertId: string) => {
    const ctx = AppContext.getInstance();
    ctx.userNotificationService.markAsRead(userId, alertId);
    loadData();
  };

  const handleSnooze = (alertId: string) => {
    const ctx = AppContext.getInstance();
    ctx.userNotificationService.snoozeAlert(userId, alertId);
    loadData();
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-orange-500 bg-orange-50';
      case 'info': return 'border-blue-500 bg-blue-50';
    }
  };

  const getSeverityTextColor = (severity: Severity) => {
    switch (severity) {
      case 'critical': return 'text-red-700';
      case 'warning': return 'text-orange-700';
      case 'info': return 'text-blue-700';
    }
  };

  const unreadCount = Array.from(preferences.values()).filter(p => !p.isRead).length;
  const activeAlerts = alerts.filter(alert => {
    const pref = preferences.get(alert.id);
    return !pref?.isRead && !pref?.isSnoozed;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-gray-600">Stay informed about important updates</p>
        </div>

        {activeAlerts.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <BellOff className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">You have no active notifications at this time.</p>
          </div>
        )}

        <div className="space-y-4">
          {alerts.map((alert) => {
            const pref = preferences.get(alert.id) || { isRead: false, isSnoozed: false };

            return (
              <div
                key={alert.id}
                className={`bg-white rounded-lg shadow-sm border-l-4 ${getSeverityColor(alert.severity)} transition-all ${
                  pref.isRead ? 'opacity-60' : 'opacity-100'
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityTextColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      {pref.isRead && (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <Check className="w-4 h-4" />
                          Read
                        </span>
                      )}
                      {pref.isSnoozed && (
                        <span className="flex items-center gap-1 text-orange-600 text-sm">
                          <Clock className="w-4 h-4" />
                          Snoozed
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {alert.startTime.toLocaleString()}
                    </span>
                  </div>

                  <h3 className={`text-xl font-semibold mb-3 ${getSeverityTextColor(alert.severity)}`}>
                    {alert.title}
                  </h3>

                  <p className="text-gray-700 mb-4 leading-relaxed">{alert.message}</p>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    {!pref.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(alert.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Mark as Read
                      </button>
                    )}
                    {!pref.isSnoozed && !pref.isRead && (
                      <button
                        onClick={() => handleSnooze(alert.id)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Clock className="w-4 h-4" />
                        Snooze for Today
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
