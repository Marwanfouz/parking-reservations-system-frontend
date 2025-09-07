'use client';

import { useState, useEffect } from 'react';
import { CheckoutPanel } from '../../components/CheckoutPanel';

// Mock authentication state
const mockAuth = {
  isAuthenticated: true, // For testing, set to true
  user: { username: 'employee1', role: 'checkpoint' },
  login: async (username: string, password: string) => {
    // Mock login - always succeeds for testing
    console.log('Mock login:', username, password);
  },
  logout: () => {
    console.log('Mock logout');
  }
};

// Mock ticket data
const mockTickets: Record<string, any> = {
  't_1234567890': {
    id: 't_1234567890',
    type: 'visitor',
    zoneId: 'zone_a',
    gateId: 'gate_1',
    checkinAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    subscriptionId: null
  },
  't_9876543210': {
    id: 't_9876543210',
    type: 'subscriber',
    zoneId: 'zone_b',
    gateId: 'gate_2',
    checkinAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    subscriptionId: 'sub_001'
  }
};

// Mock subscription data
const mockSubscriptions: Record<string, any> = {
  'sub_001': {
    id: 'sub_001',
    userName: 'John Doe',
    cars: [
      { plate: 'ABC123', brand: 'Toyota', model: 'Camry', color: 'Silver' },
      { plate: 'XYZ789', brand: 'Honda', model: 'Civic', color: 'Blue' }
    ]
  }
};

// Mock zones for billing calculation
const mockZones: Record<string, any> = {
  'zone_a': { rateNormal: 5.0, rateSpecial: 8.0 },
  'zone_b': { rateNormal: 3.0, rateSpecial: 5.0 }
};

export default function CheckpointScreen() {
  const [ticketId, setTicketId] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Update time on client side only to avoid hydration mismatch
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleTicketLookup = (id: string) => {
    setTicketId(id);
    setShowCheckout(true);
  };

  const handleCheckout = async (id: string, forceConvertToVisitor?: boolean) => {
    setIsLoading(true);
    
    // Mock checkout process
    setTimeout(() => {
      console.log('Mock checkout:', { id, forceConvertToVisitor });
      setShowCheckout(false);
      setTicketId('');
      setIsLoading(false);
      alert('Checkout completed successfully!');
    }, 2000);
  };

  // Mock ticket and subscription data
  const ticket = ticketId ? mockTickets[ticketId] : null;
  const subscription = ticket?.subscriptionId ? mockSubscriptions[ticket.subscriptionId] : null;
  
  // Mock billing calculation
  const calculateBilling = (ticket: any) => {
    if (!ticket) return null;
    
    const checkinTime = new Date(ticket.checkinAt);
    const checkoutTime = new Date();
    const durationMs = checkoutTime.getTime() - checkinTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    
    const zone = mockZones[ticket.zoneId];
    const rate = ticket.type === 'subscriber' ? zone.rateNormal : zone.rateNormal;
    const amount = durationHours * rate;
    
    return {
      billingBreakdown: [{
        from: ticket.checkinAt,
        to: checkoutTime.toISOString(),
        hours: durationHours,
        rateMode: 'normal' as const,
        rate: rate,
        amount: amount
      }],
      totalAmount: amount,
      durationHours: durationHours
    };
  };

  const billingData = ticket ? calculateBilling(ticket) : null;

  if (!mockAuth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Employee Login</h1>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter password"
              />
            </div>
            
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Checkpoint</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-800">Welcome, {mockAuth.user.username}</span>
              <div className="text-sm text-gray-700">{currentTime}</div>
              <button 
                onClick={() => mockAuth.logout()}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Ticket Lookup */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Ticket Lookup</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="ticketId" className="block text-sm font-medium text-gray-700">
                  Ticket ID
                </label>
                <input
                  id="ticketId"
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter ticket ID"
                />
              </div>
              
              <button
                onClick={() => handleTicketLookup(ticketId)}
                disabled={!ticketId}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Lookup Ticket
              </button>
            </div>
            
            {/* Sample ticket IDs for testing */}
            <div className="mt-4 text-sm text-gray-800">
              <p className="mb-2">Sample ticket IDs for testing:</p>
              <div className="space-y-1">
                <button 
                  onClick={() => setTicketId('t_1234567890')}
                  className="block text-blue-600 hover:text-blue-800"
                >
                  t_1234567890 (Visitor)
                </button>
                <button 
                  onClick={() => setTicketId('t_9876543210')}
                  className="block text-blue-600 hover:text-blue-800"
                >
                  t_9876543210 (Subscriber)
                </button>
              </div>
            </div>
          </div>
          
          {/* Checkout Panel */}
          {showCheckout && ticket && (
            <CheckoutPanel 
              ticketId={ticketId}
              ticket={ticket}
              subscription={subscription}
              billingBreakdown={billingData?.billingBreakdown || []}
              totalAmount={billingData?.totalAmount || 0}
              durationHours={billingData?.durationHours || 0}
              onCheckout={handleCheckout}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
