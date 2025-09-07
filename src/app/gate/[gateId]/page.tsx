'use client';

import { useState, useEffect, use } from 'react';
import { GateHeader } from '../../../components/GateHeader';
import { ZoneCard } from '../../../components/ZoneCard';
import { TicketModal } from '../../../components/TicketModal';
import { SubscriptionInput } from '../../../components/SubscriptionInput';
import { useZones, useSubscription, useCheckinTicket } from '../../../hooks/useApi';
import { useWebSocket } from '../../../hooks/useWebSocket';

// Gate names mapping (since we don't have a single gate endpoint)
const gateNames: Record<string, string> = {
  'gate_1': 'Main Entrance',
  'gate_2': 'East Entrance', 
  'gate_3': 'South Entrance',
  'gate_4': 'West Entrance',
  'gate_5': 'VIP Entrance'
};

export default function GateScreen({ params }: { readonly params: Promise<{ readonly gateId: string }> }) {
  const { gateId } = use(params);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showTicket, setShowTicket] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  
  // Subscriber flow state
  const [activeTab, setActiveTab] = useState<'visitor' | 'subscriber'>('visitor');
  const [subscriptionId, setSubscriptionId] = useState('');
  const [verifiedSubscription, setVerifiedSubscription] = useState<any>(null);
  const [subscriptionError, setSubscriptionError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // API hooks
  const { data: zones, isLoading: zonesLoading, error: zonesError } = useZones(gateId);
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription(subscriptionId, !!subscriptionId);
  const checkinMutation = useCheckinTicket();
  
  // WebSocket for real-time updates
  const { connectionStatus, subscribe, unsubscribe, onZoneUpdate } = useWebSocket();

  // Update time on client side only to avoid hydration mismatch
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString());
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // WebSocket subscription for real-time updates
  useEffect(() => {
    subscribe(gateId);
    
    return () => {
      unsubscribe(gateId);
    };
  }, [gateId, subscribe, unsubscribe]);

  // Handle real-time zone updates
  useEffect(() => {
    const unsubscribeZoneUpdates = onZoneUpdate((update) => {
      // The zones will be automatically refetched by React Query
      // when the WebSocket update is received
      console.log('Zone update received:', update);
    });

    return unsubscribeZoneUpdates;
  }, [onZoneUpdate]);

  // Handle subscription verification
  useEffect(() => {
    if (subscription) {
      setVerifiedSubscription(subscription);
      setSubscriptionError('');
    } else if (subscriptionId && !subscriptionLoading) {
      setVerifiedSubscription(null);
      setSubscriptionError('Invalid subscription ID. Please try again.');
    }
  }, [subscription, subscriptionId, subscriptionLoading]);

  const handleZoneSelect = (zoneId: string) => {
    setSelectedZone(zoneId);
  };

  const handleCheckin = async () => {
    if (!selectedZone) return;
    
    try {
      const result = await checkinMutation.mutateAsync({
        gateId: gateId,
        zoneId: selectedZone,
        type: 'visitor'
      });
      
      setTicket(result.ticket);
      setShowTicket(true);
    } catch (error) {
      console.error('Check-in failed:', error);
      // Error handling could be improved with a toast notification
    }
  };

  const handleVerifySubscription = async (id: string) => {
    if (!id) return;
    
    setSubscriptionId(id);
    setIsVerifying(true);
    setSubscriptionError('');
    
    // The subscription will be fetched via the useSubscription hook
    // and the useEffect will handle the verification result
    setTimeout(() => setIsVerifying(false), 1000);
  };

  const handleSubscriberCheckin = async () => {
    if (!selectedZone || !verifiedSubscription) return;
    
    try {
      const result = await checkinMutation.mutateAsync({
        gateId: gateId,
        zoneId: selectedZone,
        type: 'subscriber',
        subscriptionId: verifiedSubscription.id
      });
      
      setTicket(result.ticket);
      setShowTicket(true);
    } catch (error) {
      console.error('Subscriber check-in failed:', error);
      // Error handling could be improved with a toast notification
    }
  };

  const handleCloseTicket = () => {
    setShowTicket(false);
    setSelectedZone(null);
    setTicket(null);
  };

  // Check if gate exists
  const gateName = gateNames[gateId];
  if (!gateName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gate Not Found</h1>
          <p className="text-gray-800">Gate {gateId} does not exist</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (zonesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-800">Loading zones...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (zonesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600">Error loading zones: {zonesError.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GateHeader 
        gateId={gateId}
        gateName={gateName}
        connectionStatus={connectionStatus}
        currentTime={currentTime}
      />
      
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('visitor')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'visitor' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              Visitor
            </button>
            <button 
              onClick={() => setActiveTab('subscriber')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'subscriber' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-800 hover:bg-gray-100'
              }`}
            >
              Subscriber
            </button>
          </div>
        </div>

        {activeTab === 'visitor' ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Zones</h2>
              <p className="text-gray-800">Select a zone to check in</p>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscriber Check-in</h2>
              <p className="text-gray-800">Verify your subscription to proceed</p>
            </div>
            
            <div className="mb-6 max-w-md">
              <SubscriptionInput
                subscriptionId={subscriptionId}
                onSubscriptionIdChange={setSubscriptionId}
                onVerify={handleVerifySubscription}
                isLoading={isVerifying || subscriptionLoading}
                error={subscriptionError}
                subscription={verifiedSubscription}
              />
            </div>
            
            {verifiedSubscription && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Zones</h2>
                <p className="text-gray-800">Select a zone to check in</p>
              </div>
            )}
          </>
        )}

        {(activeTab === 'visitor' || (activeTab === 'subscriber' && verifiedSubscription)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {zones?.map(zone => (
              <ZoneCard 
                key={zone.id}
                zone={zone}
                onSelect={handleZoneSelect}
                selected={selectedZone === zone.id}
                disabled={
                  !zone.open || 
                  (activeTab === 'visitor' && zone.availableForVisitors <= 0) ||
                  (activeTab === 'subscriber' && zone.availableForSubscribers <= 0)
                }
              />
            ))}
          </div>
        )}

        {selectedZone && (
          <div className="text-center">
            <button 
              onClick={activeTab === 'visitor' ? handleCheckin : handleSubscriberCheckin}
              disabled={checkinMutation.isPending}
              className="bg-green-600 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkinMutation.isPending ? 'Processing...' : (activeTab === 'visitor' ? 'Go' : 'Check-in as Subscriber')}
            </button>
          </div>
        )}
      </div>

      {showTicket && ticket && (
        <TicketModal 
          ticket={ticket}
          zone={zones?.find(z => z.id === ticket.zoneId) || { id: ticket.zoneId, name: 'Unknown Zone', categoryId: 'unknown' }}
          gate={{ id: gateId, name: gateName }}
          isOpen={showTicket}
          onClose={handleCloseTicket}
        />
      )}
    </div>
  );
}