import { useState, useEffect } from 'react';
import { AppContext } from './application/AppContext';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { seedData } from './data/seedData';
import { User as UserIcon, Shield } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<'admin' | 'user'>('admin');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [users, setUsers] = useState<Array<{ id: string; email: string; fullName: string }>>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      seedData();
      setInitialized(true);

      const ctx = AppContext.getInstance();
      const allUsers = ctx.userRepository.findByRole('user');
      setUsers(allUsers.map(u => ({ id: u.id, email: u.email, fullName: u.fullName })));
      if (allUsers.length > 0) {
        setSelectedUserId(allUsers[0].id);
      }
    }
  }, [initialized]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#ac5353] rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Alert Platform</h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'admin'
                    ? 'bg-[#ac5353] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>

              {currentView === 'user' && (
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ac5353] focus:border-transparent"
                >
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.fullName}
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={() => setCurrentView('user')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'user'
                    ? 'bg-[#ac5353] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                User
              </button>
            </div>
          </div>
        </div>
      </nav>

      {currentView === 'admin' ? (
        <AdminDashboard />
      ) : (
        selectedUserId && <UserDashboard userId={selectedUserId} />
      )}
    </div>
  );
}

export default App;
