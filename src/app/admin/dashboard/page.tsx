'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminSubscriptions, useAdminReports, useGates, useCreateRushHours, useCreateVacation, useCategories, useUpdateZoneStatus, useUpdateCategoryRates, useEmployees, useCreateEmployee } from '../../../hooks/useApi';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { useAuthStore } from '../../../stores';
import { LayoutDashboard, Clock, Menu, X } from 'lucide-react';
import ZoneCard from '../../../components/ZoneCard';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'zones' | 'subscriptions' | 'reports' | 'categories' | 'employees' | 'rush-hours' | 'vacations'>('overview');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  const { user: adminUser, token: adminToken, logout, hasHydrated } = useAuthStore();
  const { data: subscriptions, isLoading: subscriptionsLoading } = useAdminSubscriptions(adminToken ?? '', !!adminToken);
  const { data: reportsData, isLoading: reportsLoading } = useAdminReports(adminToken ?? '', !!adminToken);
  const { data: gates } = useGates();
  const createRushHoursMutation = useCreateRushHours();
  const createVacationMutation = useCreateVacation();
  const { data: categories, isLoading: categoriesLoading } = useCategories(adminToken ?? '', !!adminToken);
  const updateZoneStatusMutation = useUpdateZoneStatus();
  const updateCategoryRatesMutation = useUpdateCategoryRates();
  const { data: employees, isLoading: employeesLoading } = useEmployees(adminToken ?? '', !!adminToken);
  const createEmployeeMutation = useCreateEmployee();
  const [rushHoursForm, setRushHoursForm] = useState({ weekDay: 1, from: '07:00', to: '09:00' });
  const [vacationForm, setVacationForm] = useState({ name: '', from: '', to: '' });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryRates, setCategoryRates] = useState<{ [key: string]: { rateNormal: number; rateSpecial: number } }>({});
  const [auditLog, setAuditLog] = useState<Array<{ timestamp: string; action: string; adminId: string; targetType: string; targetId: string }>>([]);
  const [updatingZoneId, setUpdatingZoneId] = useState<string | null>(null);
  const [employeeForm, setEmployeeForm] = useState({ username: '', password: '', role: 'employee' });
  const { connectionStatus, onAdminUpdate } = useWebSocket();
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const hours24 = now.getHours();
      const mod = hours24 % 12;
      const hours12 = mod === 0 ? 12 : mod;
      const ampm = hours24 >= 12 ? 'PM' : 'AM';
      setCurrentTime(`${hours12}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = onAdminUpdate((update) => {
      if (update.type === 'admin-update') {
        const timestamp = new Date().toLocaleTimeString();
        const newLogEntry = {
          timestamp,
          action: update.payload.action,
          adminId: update.payload.adminId,
          targetType: update.payload.targetType,
          targetId: update.payload.targetId
        };
        
        setAuditLog(prev => [newLogEntry, ...prev.slice(0, 9)]);
      }
    });

    return unsubscribe;
  }, [onAdminUpdate]);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const handleZoneStatusUpdate = async (zoneId: string, open: boolean) => {
    if (!adminToken) return;
    
    setUpdatingZoneId(zoneId);
    try {
      await updateZoneStatusMutation.mutateAsync({
        zoneId,
        open,
        token: adminToken
      });
    } catch (error) {
      console.error('Failed to update zone status:', error);
    } finally {
      setUpdatingZoneId(null);
    }
  };

  const handleCategoryRateUpdate = async (categoryId: string, rateNormal: number, rateSpecial: number) => {
    if (!adminToken) return;
    
    try {
      await updateCategoryRatesMutation.mutateAsync({
        categoryId,
        rateNormal,
        rateSpecial,
        token: adminToken
      });
      setEditingCategory(null);
    } catch (error) {
      console.error('Failed to update category rates:', error);
    }
  };

  const startEditingCategory = (category: any) => {
    setEditingCategory(category.id);
    setCategoryRates({
      ...categoryRates,
      [category.id]: {
        rateNormal: category.rateNormal,
        rateSpecial: category.rateSpecial
      }
    });
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    
    try {
      await createEmployeeMutation.mutateAsync({
        data: employeeForm,
        token: adminToken
      });
      setEmployeeForm({ username: '', password: '', role: 'employee' });
    } catch (error) {
      console.error('Failed to create employee:', error);
    }
  };

  const filteredZones = useMemo(() => {
    return reportsData?.filter((zone: any) => zone && (zone.id || zone.zoneId)) || [];
  }, [reportsData]);

  const handleCreateRushHours = async () => {
    try {
      await createRushHoursMutation.mutateAsync({
        data: rushHoursForm,
        token: adminToken ?? '',
      });
      setRushHoursForm({ weekDay: 1, from: '07:00', to: '09:00' });
      alert('Rush hours created successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create rush hours';
      alert(`Failed to create rush hours: ${errorMessage}`);
    }
  };

  const handleCreateVacation = async () => {
    try {
      await createVacationMutation.mutateAsync({
        data: vacationForm,
        token: adminToken ?? '',
      });
      setVacationForm({ name: '', from: '', to: '' });
      alert('Vacation period created successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create vacation';
      alert(`Failed to create vacation: ${errorMessage}`);
    }
  };

  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-soft">
                <LayoutDashboard className="w-6 h-6" />
              </div>
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm sm:text-base text-gray-600">Welcome, {adminUser.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-xs sm:text-sm text-gray-600">
                <div>Status: <span className={`font-medium ${connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                  {connectionStatus}
                </span></div>
                <div className="flex items-center gap-1"><Clock className="w-3 h-3 sm:w-4 sm:h-4" />{currentTime}</div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-red-700 text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Mobile Menu Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span className="font-medium">Menu</span>
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:block">
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'zones', label: 'Zone Management' },
            { id: 'subscriptions', label: 'Subscriptions' },
            { id: 'reports', label: 'Reports' },
            { id: 'categories', label: 'Categories' },
              { id: 'employees', label: 'Employees' },
            { id: 'rush-hours', label: 'Rush Hours' },
            { id: 'vacations', label: 'Vacations' },
          ].map((tab) => (
            <button
              key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'zones' | 'subscriptions' | 'reports' | 'categories' | 'employees' | 'rush-hours' | 'vacations')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                  : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mb-6">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'zones', label: 'Zones' },
                  { id: 'subscriptions', label: 'Subscriptions' },
                  { id: 'reports', label: 'Reports' },
                  { id: 'categories', label: 'Categories' },
                  { id: 'employees', label: 'Employees' },
                  { id: 'rush-hours', label: 'Rush Hours' },
                  { id: 'vacations', label: 'Vacations' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as 'overview' | 'zones' | 'subscriptions' | 'reports' | 'categories' | 'employees' | 'rush-hours' | 'vacations');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
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
                  <span className="font-medium">{gates?.length ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Subscriptions:</span>
                  <span className="font-medium">{subscriptions?.filter(s => s.active).length ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Audit Log</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {auditLog.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No recent admin actions</p>
                ) : (
                  auditLog.map((entry, index) => (
                    <div key={index} className="text-xs border-l-2 border-blue-200 pl-3 py-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium text-gray-900">{entry.action}</span>
                          <span className="text-gray-600"> on {entry.targetType}</span>
                        </div>
                        <span className="text-gray-500">{entry.timestamp}</span>
                      </div>
                      <div className="text-gray-500">
                        Admin: {entry.adminId} | Target: {entry.targetId}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
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
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Zone Management</h3>
              <p className="text-sm text-gray-600 mt-1">Open/close zones and monitor status</p>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredZones.map((zone: any) => (
                  <ZoneCard
                    key={zone.id || zone.zoneId}
                    zone={zone}
                    onStatusUpdate={handleZoneStatusUpdate}
                    isUpdating={updatingZoneId === (zone.id || zone.zoneId)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Subscriptions</h3>
            </div>
            <div className="p-6">
              {subscriptionsLoading ? (
                <p className="text-gray-600">Loading subscriptions...</p>
              ) : (
                <div className="space-y-4">
                  {subscriptions?.filter(sub => sub && sub.id).map((sub) => (
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
          <div className="bg-white rounded-2xl shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Parking State Report</h3>
              <p className="text-sm text-gray-600 mt-1">Real-time zone status and occupancy data</p>
            </div>
            <div className="p-6">
              {reportsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading parking state...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupied</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Free</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reserved</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Visitors</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Subscribers</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscriber Count</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredZones.map((zone: any) => (
                        <tr key={zone.id || zone.zoneId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{zone.name}</div>
                            <div className="text-sm text-gray-500">ID: {zone.id || zone.zoneId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {zone.categoryId?.replace('cat_', '').toUpperCase() || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              zone.open ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {zone.open ? 'Open' : 'Closed'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{zone.totalSlots}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{zone.occupied}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{zone.free}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{zone.reserved}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${
                              zone.availableForVisitors > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {zone.availableForVisitors}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${
                              zone.availableForSubscribers > 0 ? 'text-blue-600' : 'text-red-600'
                            }`}>
                              {zone.availableForSubscribers}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{zone.subscriberCount || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
              <p className="text-sm text-gray-600 mt-1">Manage category rates and settings</p>
            </div>
            <div className="p-6">
              {categoriesLoading ? (
                <p className="text-gray-600">Loading categories...</p>
              ) : (
                <div className="space-y-4">
                  {categories?.filter(category => category && category.id).map((category: { id: string; name: string; rateNormal: number; rateSpecial: number; description?: string }) => (
                    <div key={category.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          <p className="text-sm text-gray-600">ID: {category.id}</p>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          {editingCategory === category.id ? (
                            <div className="flex items-center gap-2">
                        <div className="text-right">
                                <div className="text-sm text-gray-600 mb-1">
                                  <label className="block text-xs">Normal Rate ($)</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={categoryRates[category.id]?.rateNormal || category.rateNormal}
                                    onChange={(e) => setCategoryRates({
                                      ...categoryRates,
                                      [category.id]: {
                                        ...categoryRates[category.id],
                                        rateNormal: parseFloat(e.target.value) || 0
                                      }
                                    })}
                                    className="w-20 px-2 py-1 text-xs border rounded"
                                  />
                                </div>
                          <div className="text-sm text-gray-600">
                                  <label className="block text-xs">Special Rate ($)</label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={categoryRates[category.id]?.rateSpecial || category.rateSpecial}
                                    onChange={(e) => setCategoryRates({
                                      ...categoryRates,
                                      [category.id]: {
                                        ...categoryRates[category.id],
                                        rateSpecial: parseFloat(e.target.value) || 0
                                      }
                                    })}
                                    className="w-20 px-2 py-1 text-xs border rounded"
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => handleCategoryRateUpdate(
                                    category.id,
                                    categoryRates[category.id]?.rateNormal || category.rateNormal,
                                    categoryRates[category.id]?.rateSpecial || category.rateSpecial
                                  )}
                                  disabled={updateCategoryRatesMutation.isPending}
                                  className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 disabled:opacity-50"
                                >
                                  {updateCategoryRatesMutation.isPending ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={() => setEditingCategory(null)}
                                  className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-right">
                              <div className="text-sm text-gray-600 mb-2">
                            <div>Normal Rate: ${category.rateNormal}</div>
                            <div>Special Rate: ${category.rateSpecial}</div>
                          </div>
                              <button
                                onClick={() => startEditingCategory(category)}
                                className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                              >
                                Edit Rates
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Employee Management</h3>
              <p className="text-sm text-gray-600 mt-1">Create and manage employee accounts</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Create Employee Form */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Create New Employee</h4>
                  <form onSubmit={handleCreateEmployee} className="space-y-4">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        value={employeeForm.username}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, username: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={employeeForm.password}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        id="role"
                        value={employeeForm.role}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="employee">Employee</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={createEmployeeMutation.isPending}
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createEmployeeMutation.isPending ? 'Creating...' : 'Create Employee'}
                    </button>
                  </form>
                </div>

                {/* Employee List */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-4">Employee List</h4>
                  {employeesLoading ? (
                    <p className="text-gray-600">Loading employees...</p>
                  ) : (
                    <div className="space-y-2">
                      {employees?.filter((employee: any) => employee && employee.id).map((employee: any) => (
                        <div key={employee.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium text-gray-900">{employee.username}</div>
                            <div className="text-sm text-gray-600">ID: {employee.id}</div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            employee.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {employee.role}
                          </span>
                        </div>
                      ))}
                      {(!employees || employees.length === 0) && (
                        <p className="text-gray-500 italic">No employees found</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
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
                    <label htmlFor="weekDay" className="block text-sm font-medium text-gray-700 mb-1">
                      Week Day
                    </label>
                    <select
                      id="weekDay"
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
                    <label htmlFor="fromTime" className="block text-sm font-medium text-gray-700 mb-1">
                      From Time
                    </label>
                    <input
                      id="fromTime"
                      type="time"
                      value={rushHoursForm.from}
                      onChange={(e) => setRushHoursForm({ ...rushHoursForm, from: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="toTime" className="block text-sm font-medium text-gray-700 mb-1">
                      To Time
                    </label>
                    <input
                      id="toTime"
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
                    <label htmlFor="vacationName" className="block text-sm font-medium text-gray-700 mb-1">
                      Vacation Name
                    </label>
                    <input
                      id="vacationName"
                      type="text"
                      value={vacationForm.name}
                      onChange={(e) => setVacationForm({ ...vacationForm, name: e.target.value })}
                      placeholder="e.g., Eid Holiday"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700 mb-1">
                      From Date
                    </label>
                    <input
                      id="fromDate"
                      type="date"
                      value={vacationForm.from}
                      onChange={(e) => setVacationForm({ ...vacationForm, from: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="toDate" className="block text-sm font-medium text-gray-700 mb-1">
                      To Date
                    </label>
                    <input
                      id="toDate"
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
