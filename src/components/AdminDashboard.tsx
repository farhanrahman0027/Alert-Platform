import { useState, useEffect } from 'react';
import { Plus, Archive, CreditCard as Edit2, Users, Building, User as UserIcon } from 'lucide-react';
import { AppContext } from '../application/AppContext';
import { AlertWithTargets, Severity, VisibilityType, DeliveryType } from '../domain/models';
import { CreateAlertModal } from './CreateAlertModal';
import { AnalyticsDashboard } from './AnalyticsDashboard';

export function AdminDashboard() {
  const [alerts, setAlerts] = useState<AlertWithTargets[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('all');
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all');
  const [currentUserId] = useState(() => {
    const ctx = AppContext.getInstance();
    const admins = ctx.userRepository.findByRole('admin');
    return admins[0]?.id || '';
  });

  const loadAlerts = () => {
    const ctx = AppContext.getInstance();
    let filtered = ctx.alertService.getAllAlerts();

    if (filterStatus === 'active') {
      filtered = filtered.filter(a => a.status === 'active');
    } else if (filterStatus === 'archived') {
      filtered = filtered.filter(a => a.status === 'archived');
    }

    if (filterSeverity !== 'all') {
      filtered = filtered.filter(a => a.severity === filterSeverity);
    }

    setAlerts(filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  };

  useEffect(() => {
    loadAlerts();
  }, [filterStatus, filterSeverity]);

  const handleArchive = (id: string) => {
    const ctx = AppContext.getInstance();
    ctx.alertService.archiveAlert(id);
    loadAlerts();
  };

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'info': return 'text-blue-600 bg-blue-50';
    }
  };

  const getVisibilityIcon = (type: VisibilityType) => {
    switch (type) {
      case 'organization': return <Building className="w-4 h-4" />;
      case 'team': return <Users className="w-4 h-4" />;
      case 'user': return <UserIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage alerts and monitor system activity</p>
        </div>

        <AnalyticsDashboard />

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Alerts Management</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Alert
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus('archived')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === 'archived'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Archived
              </button>
            </div>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as Severity | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No alerts found. Create your first alert to get started.
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <div className="flex items-center gap-1 text-gray-600 text-sm">
                          {getVisibilityIcon(alert.visibilityType)}
                          <span className="capitalize">{alert.visibilityType}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          alert.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {alert.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{alert.title}</h3>
                      <p className="text-gray-600 mb-3">{alert.message}</p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Delivery: {alert.deliveryType}</span>
                        <span>Reminder: {alert.reminderEnabled ? `Every ${alert.reminderFrequencyMinutes}min` : 'Disabled'}</span>
                        <span>Start: {alert.startTime.toLocaleDateString()}</span>
                        {alert.expiryTime && <span>Expires: {alert.expiryTime.toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {alert.status === 'active' && (
                        <button
                          onClick={() => handleArchive(alert.id)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Archive"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateAlertModal
          currentUserId={currentUserId}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadAlerts();
          }}
        />
      )}
    </div>
  );
}
