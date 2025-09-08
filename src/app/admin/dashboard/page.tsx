'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminSubscriptions, useAdminReports, useUpdateZoneStatus, useGates, useZones, useCreateRushHours, useCreateVacation, useCategories } from '../../../hooks/useApi';
import { useWebSocket } from '../../../hooks/useWebSocket';

export default function AdminDashboard() {
  const [adminToken, setAdminToken] = useState<string>('');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'zones' | 'subscriptions' | 'reports' | 'categories' | 'rush-hours' | 'vacations'>('overview');
  const [currentTime, setCurrentTime] = useState<string>('');
  const router = useRouter();

  // API hooks
  const { data: subscriptions, isLoading: subscriptionsLoading } = useAdminSubscriptions(adminToken, !!adminToken);
  const { isLoading: reportsLoading } = useAdminReports(adminToken, !!adminToken);
  const { data: gates } = useGates();
  const { data: allZones } = useZones('all'); // We'll need to modify this to get all zones
  const updateZoneMutation = useUpdateZoneStatus();
  const createRushHoursMutation = useCreateRushHours();
  const createVacationMutation = useCreateVacation();
  const { data: categories, isLoading: categoriesLoading } = useCategories(adminToken, !!adminToken);

  // State for forms
  const [rushHoursForm, setRushHoursForm] = useState({ weekDay: 1, from: '07:00', to: '09:00' });
  const [vacationForm, setVacationForm] = useState({ name: '', from: '', to: '' });

  // WebSocket for real-time updates
  const { connectionStatus, onAdminUpdate } = useWebSocket();

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    if (!token || !user) {
      router.push('/admin/login');
      return;
    }
    
    setAdminToken(token);
    setAdminUser(JSON.parse(user));
  }, [router]);

  // Update time
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle admin updates from WebSocket
  useEffect(() => {
    const unsubscribe = onAdminUpdate((update) => {
      console.log('Admin update received:', update);
      // You could show a toast notification here
    });

    return unsubscribe;
  }, [onAdminUpdate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const handleZoneToggle = async (zoneId: string, currentStatus: boolean) => {
    try {
      await updateZoneMutation.mutateAsync({
        zoneId,
        open: !currentStatus,
        token: adminToken,
      });
    } catch (error: any) {
      alert(`Failed to update zone: ${error.message}`);
    }
  };

  const handleCreateRushHours = async () => {
    try {
      await createRushHoursMutation.mutateAsync({
        data: rushHoursForm,
        token: adminToken,
      });
      setRushHoursForm({ weekDay: 1, from: '07:00', to: '09:00' });
      alert('Rush hours created successfully!');
    } catch (error: any) {
      alert(`Failed to create rush hours: ${error.message}`);
    }
  };

  const handleCreateVacation = async () => {
    try {
      await createVacationMutation.mutateAsync({
        data: vacationForm,
        token: adminToken,
      });
      setVacationForm({ name: '', from: '', to: '' });
      alert('Vacation period created successfully!');
    } catch (error: any) {
      alert(`Failed to create vacation: ${error.message}`);
    }
  };

  if (!adminToken || !adminUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome, {adminUser.username}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <div>Status: <span className={`font-medium ${connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                  {connectionStatus}
                </span></div>
                <div>{currentTime}</div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'zones', label: 'Zone Management' },
            { id: 'subscriptions', label: 'Subscriptions' },
            { id: 'reports', label: 'Reports' },
            { id: 'categories', label: 'Categories' },
            { id: 'rush-hours', label: 'Rush Hours' },
            { id: 'vacations', label: 'Vacations' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">WebSocket:</span>
                  <span className={`font-medium ${connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                    {connectionStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gates:</span>
                  <span className="font-medium">{gates?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Subscriptions:</span>
                  <span className="font-medium">{subscriptions?.filter(s => s.active).length || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('zones')}
                  className="w-full text-left p-2 rounded-md hover:bg-gray-50"
                >
                  Manage Zones
                </button>
                <button
                  onClick={() => setActiveTab('subscriptions')}
                  className="w-full text-left p-2 rounded-md hover:bg-gray-50"
                >
                  View Subscriptions
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="w-full text-left p-2 rounded-md hover:bg-gray-50"
                >
                  Generate Reports
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="text-gray-600 text-sm">
                <p>WebSocket updates will appear here</p>
                <p>Check the browser console for real-time updates</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Zone Management</h3>
            </div>
            <div className="p-6">
              <div className="text-gray-600">
                <p>Zone management functionality will be implemented here.</p>
                <p>This would include:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Open/Close zones</li>
                  <li>View zone status</li>
                  <li>Monitor occupancy</li>
                  <li>Update zone settings</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Subscriptions</h3>
            </div>
            <div className="p-6">
              {subscriptionsLoading ? (
                <p className="text-gray-600">Loading subscriptions...</p>
              ) : (
                <div className="space-y-4">
                  {subscriptions?.map((sub) => (
                    <div key={sub.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{sub.userName}</h4>
                          <p className="text-sm text-gray-600">ID: {sub.id}</p>
                          <p className="text-sm text-gray-600">Category: {sub.category}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            sub.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {sub.active ? 'Active' : 'Inactive'}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            {sub.cars.length} car(s)
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
            </div>
            <div className="p-6">
              {reportsLoading ? (
                <p className="text-gray-600">Loading reports...</p>
              ) : (
                <div className="text-gray-600">
                  <p>Reports functionality will be implemented here.</p>
                  <p>This would include:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Parking state reports</li>
                    <li>Revenue reports</li>
                    <li>Usage statistics</li>
                    <li>Export capabilities</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
            </div>
            <div className="p-6">
              {categoriesLoading ? (
                <p className="text-gray-600">Loading categories...</p>
              ) : (
                <div className="space-y-4">
                  {categories?.map((category: any) => (
                    <div key={category.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          <p className="text-sm text-gray-600">ID: {category.id}</p>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            <div>Normal Rate: ${category.rateNormal}</div>
                            <div>Special Rate: ${category.rateSpecial}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'rush-hours' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Rush Hours Management</h3>
            </div>
            <div className="p-6">
              <div className="max-w-md">
                <h4 className="text-md font-medium text-gray-900 mb-4">Add New Rush Hours</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Week Day
                    </label>
                    <select
                      value={rushHoursForm.weekDay}
                      onChange={(e) => setRushHoursForm({ ...rushHoursForm, weekDay: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={1}>Monday</option>
                      <option value={2}>Tuesday</option>
                      <option value={3}>Wednesday</option>
                      <option value={4}>Thursday</option>
                      <option value={5}>Friday</option>
                      <option value={6}>Saturday</option>
                      <option value={0}>Sunday</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Time
                    </label>
                    <input
                      type="time"
                      value={rushHoursForm.from}
                      onChange={(e) => setRushHoursForm({ ...rushHoursForm, from: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Time
                    </label>
                    <input
                      type="time"
                      value={rushHoursForm.to}
                      onChange={(e) => setRushHoursForm({ ...rushHoursForm, to: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <button
                    onClick={handleCreateRushHours}
                    disabled={createRushHoursMutation.isPending}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createRushHoursMutation.isPending ? 'Creating...' : 'Create Rush Hours'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vacations' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Vacation Management</h3>
            </div>
            <div className="p-6">
              <div className="max-w-md">
                <h4 className="text-md font-medium text-gray-900 mb-4">Add New Vacation Period</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vacation Name
                    </label>
                    <input
                      type="text"
                      value={vacationForm.name}
                      onChange={(e) => setVacationForm({ ...vacationForm, name: e.target.value })}
                      placeholder="e.g., Eid Holiday"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={vacationForm.from}
                      onChange={(e) => setVacationForm({ ...vacationForm, from: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={vacationForm.to}
                      onChange={(e) => setVacationForm({ ...vacationForm, to: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <button
                    onClick={handleCreateVacation}
                    disabled={createVacationMutation.isPending}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createVacationMutation.isPending ? 'Creating...' : 'Create Vacation Period'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
