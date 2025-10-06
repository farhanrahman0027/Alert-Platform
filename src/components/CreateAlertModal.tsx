import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AppContext } from '../application/AppContext';
import { Severity, VisibilityType, DeliveryType, Team, User } from '../domain/models';

interface CreateAlertModalProps {
  currentUserId: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateAlertModal({ currentUserId, onClose, onCreated }: CreateAlertModalProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<Severity>('info');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('in_app');
  const [visibilityType, setVisibilityType] = useState<VisibilityType>('organization');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderFrequency, setReminderFrequency] = useState(120);
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiryTime, setExpiryTime] = useState('');

  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    const ctx = AppContext.getInstance();
    setTeams(ctx.teamRepository.findAll());
    setUsers(ctx.userRepository.findAll().filter(u => u.role === 'user'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ctx = AppContext.getInstance();
    const alert = ctx.alertService.createAlert(
      {
        title,
        message,
        severity,
        deliveryType,
        visibilityType,
        reminderFrequencyMinutes: reminderFrequency,
        reminderEnabled,
        startTime: new Date(startTime),
        expiryTime: hasExpiry && expiryTime ? new Date(expiryTime) : undefined,
        status: 'active',
        createdBy: currentUserId
      },
      visibilityType === 'team' ? selectedTeams : [],
      visibilityType === 'user' ? selectedUsers : []
    );

    const recipientUsers: User[] = [];
    if (visibilityType === 'organization') {
      recipientUsers.push(...ctx.userRepository.findAll().filter(u => u.role === 'user'));
    } else if (visibilityType === 'team') {
      selectedTeams.forEach(teamId => {
        recipientUsers.push(...ctx.userRepository.findByTeam(teamId));
      });
    } else if (visibilityType === 'user') {
      selectedUsers.forEach(userId => {
        const user = ctx.userRepository.findById(userId);
        if (user) recipientUsers.push(user);
      });
    }

    await ctx.notificationService.deliverAlert(alert, recipientUsers);

    onCreated();
  };

  const toggleTeam = (teamId: string) => {
    setSelectedTeams(prev =>
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    );
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Create New Alert</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Alert title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Alert message"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as Severity)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Type</label>
              <select
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="in_app">In-App</option>
                <option value="email">Email (Future)</option>
                <option value="sms">SMS (Future)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
            <select
              value={visibilityType}
              onChange={(e) => {
                setVisibilityType(e.target.value as VisibilityType);
                setSelectedTeams([]);
                setSelectedUsers([]);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="organization">Entire Organization</option>
              <option value="team">Specific Teams</option>
              <option value="user">Specific Users</option>
            </select>
          </div>

          {visibilityType === 'team' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Teams</label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {teams.map(team => (
                  <label key={team.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTeams.includes(team.id)}
                      onChange={() => toggleTeam(team.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{team.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {visibilityType === 'user' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Users</label>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {users.map(user => (
                  <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{user.fullName} ({user.email})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Enable Reminders</span>
            </label>

            {reminderEnabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Frequency (minutes)
                </label>
                <input
                  type="number"
                  value={reminderFrequency}
                  onChange={(e) => setReminderFrequency(parseInt(e.target.value))}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasExpiry}
                  onChange={(e) => setHasExpiry(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Set Expiry Time</span>
              </label>
              {hasExpiry && (
                <input
                  type="datetime-local"
                  value={expiryTime}
                  onChange={(e) => setExpiryTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
