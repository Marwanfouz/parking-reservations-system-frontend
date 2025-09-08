'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminSubscriptions, useAdminReports, useUpdateZoneStatus, useGates, useZones } from '../../../hooks/useApi';
import { useWebSocket } from '../../../hooks/useWebSocket';

export default function AdminDashboard() {
  const [adminToken, setAdminToken] = useState<string>('');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'zones' | 'subscriptions' | 'reports'>('overview');
  const [currentTime, setCurrentTime] = useState<string>('');
  const router = useRouter();

  // API hooks
  const { data: subscriptions, isLoading: subscriptionsLoading } = useAdminSubscriptions(adminToken, !!adminToken);
  const { isLoading: reportsLoading } = useAdminReports(adminToken, !!adminToken);
  const { data: gates } = useGates();
  const { data: allZones } = useZones('all'); // We'll need to modify this to get all zones
  const updateZoneMutation = useUpdateZoneStatus();

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
      </div>
    </div>
  );
}
