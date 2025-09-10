const API_BASE_URL = 'http://localhost:3000/api/v1';

// Types based on actual API responses
export interface Gate {
  id: string;
  name: string;
  zoneIds: string[];
  location: string;
}

export interface Zone {
  id: string;
  name: string;
  categoryId: string;
  gateIds: string[];
  totalSlots: number;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  rateNormal: number;
  rateSpecial: number;
  open: boolean;
}

export interface Subscription {
  id: string;
  userName: string;
  active: boolean;
  category: string;
  cars: Array<{
    plate: string;
    brand: string;
    model: string;
    color: string;
  }>;
  startsAt: string;
  expiresAt: string;
  currentCheckins: Array<{
    ticketId: string;
    zoneId: string;
    checkinAt: string;
  }>;
}

export interface Ticket {
  id: string;
  type: 'visitor' | 'subscriber';
  zoneId: string;
  gateId: string;
  checkinAt: string;
  checkoutAt?: string;
  subscriptionId?: string;
}

export interface CheckinResponse {
  ticket: Ticket;
  zoneState: Zone;
}

export interface CheckoutResponse {
  ticketId: string;
  checkinAt: string;
  checkoutAt: string;
  durationHours: number;
  breakdown: Array<{
    from: string;
    to: string;
    hours: number;
    rateMode: 'normal' | 'special';
    rate: number;
    amount: number;
  }>;
  amount: number;
  zoneState: Zone;
}

// API functions
export async function fetchGates(): Promise<Gate[]> {
  const response = await fetch(`${API_BASE_URL}/master/gates`);
  if (!response.ok) {
    throw new Error(`Failed to fetch gates: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchZones(gateId: string): Promise<Zone[]> {
  const response = await fetch(`${API_BASE_URL}/master/zones?gateId=${gateId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch zones: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchSubscription(subscriptionId: string): Promise<Subscription> {
  const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Subscription not found');
    }
    throw new Error(`Failed to fetch subscription: ${response.statusText}`);
  }
  return response.json();
}

export async function checkinTicket(data: {
  gateId: string;
  zoneId: string;
  type: 'visitor' | 'subscriber';
  subscriptionId?: string;
}): Promise<CheckinResponse> {
  const response = await fetch(`${API_BASE_URL}/tickets/checkin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Check-in failed: ${response.statusText}`);
  }
  
  return response.json();
}

export async function checkoutTicket(data: {
  ticketId: string;
  forceConvertToVisitor?: boolean;
}): Promise<CheckoutResponse> {
  const response = await fetch(`${API_BASE_URL}/tickets/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Check-out failed: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchTicket(ticketId: string): Promise<Ticket> {
  const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Ticket not found');
    }
    throw new Error(`Failed to fetch ticket: ${response.statusText}`);
  }
  return response.json();
}

// Admin API functions
export async function loginAdmin(username: string, password: string): Promise<{ user: { id: string; username: string; role: string }; token: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  return response.json();
}

export async function fetchAdminSubscriptions(token: string): Promise<Subscription[]> {
  const response = await fetch(`${API_BASE_URL}/admin/subscriptions`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch subscriptions: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchAdminReports(token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/reports/parking-state`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch reports: ${response.statusText}`);
  }
  
  return response.json();
}

export async function updateZoneStatus(zoneId: string, open: boolean, token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/zones/${zoneId}/open`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ open }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update zone status: ${response.statusText}`);
  }
  
  return response.json();
}

export async function updateCategoryRates(categoryId: string, rateNormal: number, rateSpecial: number, token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ rateNormal, rateSpecial }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update category rates: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchEmployees(token: string): Promise<any[]> {
  const response = await fetch(`${API_BASE}/admin/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch employees: ${response.statusText}`);
  }

  return response.json();
}

export async function createEmployee(data: { username: string; password: string; role: string }, token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/admin/users`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Failed to create employee: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchCategories(token: string): Promise<any[]> {
  const response = await fetch(`${API_BASE}/admin/categories`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  return response.json();
}

export async function createRushHours(data: { weekDay: number; from: string; to: string }, token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/admin/rush-hours`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Failed to create rush hours: ${response.statusText}`);
  }

  return response.json();
}

export async function createVacation(data: { name: string; from: string; to: string }, token: string): Promise<any> {
  const response = await fetch(`${API_BASE}/admin/vacations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Failed to create vacation: ${response.statusText}`);
  }

  return response.json();
}