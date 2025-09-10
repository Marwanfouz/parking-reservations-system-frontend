'use client';

import { useState, useEffect, use } from 'react';
import { GateHeader } from '../../../components/GateHeader';
import ZoneSelectionCard from '../../../components/ZoneSelectionCard';
import { TicketModal } from '../../../components/TicketModal';
import { SubscriptionInput } from '../../../components/SubscriptionInput';
import { useZones, useCheckinTicket } from '../../../hooks/useApi';
import { useWebSocket } from '../../../hooks/useWebSocket';
import { useGateStore, useUIStore } from '../../../stores';

const gateNames: Record<string, string> = {
  'gate_1': 'Main Entrance',
  'gate_2': 'East Entrance', 
  'gate_3': 'South Entrance',
  'gate_4': 'West Entrance',
  'gate_5': 'VIP Entrance'
};

export default function GateScreen({ params }: { readonly params: Promise<{ readonly gateId: string }> }) {
  const { gateId } = use(params);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Local state for verification (to avoid Zustand issues)
  const [verifiedSubscription, setVerifiedSubscription] = useState<{
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
  } | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string>('');
  
  const {
    selectedZone,
    activeTab,
    subscriptionId,
    currentTicket,
    showTicketModal,
    setCurrentGate,
    setSelectedZone,
    setActiveTab,
    setSubscriptionId,
    setCurrentTicket,
    setShowTicketModal,
    resetGateState
  } = useGateStore();
  
  const { setError, setSuccess } = useUIStore();

  const { data: zones, isLoading: zonesLoading, error: zonesError } = useZones(gateId);
  const checkinMutation = useCheckinTicket();
  
  const { subscribe, unsubscribe, onZoneUpdate } = useWebSocket();
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      setCurrentTime(timeString);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const gateName = gateNames[gateId];
    if (gateName) {
      setCurrentGate(gateId, gateName);
    }
    
    resetGateState();
    
    setVerifiedSubscription(null);
    setSubscriptionError('');
    setIsVerifying(false);
  }, [gateId, setCurrentGate, resetGateState]);

  useEffect(() => {
    subscribe(gateId);
    
    return () => {
      unsubscribe(gateId);
    };
  }, [gateId, subscribe, unsubscribe]);

  useEffect(() => {
    const unsubscribeZoneUpdates = onZoneUpdate(() => {
    });

    return unsubscribeZoneUpdates;
  }, [onZoneUpdate]);

  useEffect(() => {
    if (!subscriptionId.trim()) {
      setVerifiedSubscription(null);
      setSubscriptionError('');
      setIsVerifying(false);
    }
  }, [subscriptionId]);

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
      
      setCurrentTicket(result.ticket);
      setShowTicketModal(true);
      setSuccess('🎉 Welcome! You have successfully checked in. Your parking session has started.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('zone is full')) {
        setError(`🚗 Zone is full. Try another zone`, 'validation');
      } else if (errorMessage.includes('zone is closed')) {
        setError(`🚫 Zone is closed for maintenance`, 'validation');
      } else {
        setError(`❌ Check-in failed: ${errorMessage}`, 'general');
      }
    }
  };

  const handleVerifySubscription = async (id: string) => {
    if (!id.trim()) {
      setVerifiedSubscription(null);
      setSubscriptionError('Please enter a subscription ID');
      setIsVerifying(false);
      return;
    }
    
    setIsVerifying(true);
    setSubscriptionError('');
    
    try {
      const response = await fetch(`http://localhost:3000/api/v1/subscriptions/${id.trim()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Subscription not found');
        }
        throw new Error(`Failed to fetch subscription: ${response.statusText}`);
      }
      
      const subscriptionData = await response.json();
      
      setVerifiedSubscription(subscriptionData);
      setSubscriptionError('');
      setIsVerifying(false);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify subscription';
      
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        setSubscriptionError('❌ Subscription not found. Please check your subscription ID and try again.');
      } else if (errorMessage.includes('inactive') || errorMessage.includes('expired')) {
        setSubscriptionError('⚠️ This subscription is inactive or expired. Please contact support.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setSubscriptionError('🌐 Network error. Please check your connection and try again.');
      } else {
        setSubscriptionError(`❌ Verification failed: ${errorMessage}`);
      }
      
      setVerifiedSubscription(null);
      setIsVerifying(false);
    }
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
      
      setCurrentTicket(result.ticket);
      setShowTicketModal(true);
      setSuccess('🎉 Welcome! You have successfully checked in. Your parking session has started.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('not valid for this category')) {
        const categoryName = verifiedSubscription.category.replace('cat_', '').toUpperCase();
        setError(`🚫 Access Denied: ${categoryName} subscription cannot access this zone`, 'validation');
      } else if (errorMessage.includes('not found')) {
        setError(`❌ Subscription not found. Please verify your ID`, 'validation');
      } else if (errorMessage.includes('already checked in')) {
        setError(`⚠️ Already checked in. Please check out first`, 'validation');
      } else if (errorMessage.includes('zone is full')) {
        setError(`🚗 Zone is full. Try another zone`, 'validation');
      } else {
        setError(`❌ Check-in failed: ${errorMessage}`, 'general');
      }
    }
  };

  const handleCloseTicket = () => {
    setShowTicketModal(false);
    setSelectedZone(null);
    setCurrentTicket(null);
  };

  const gateName = gateNames[gateId];
  let submitButtonText = 'Go';
  if (activeTab === 'visitor') {
    submitButtonText = selectedZone ? 'Check In' : 'Select Zone';
  } else if (activeTab === 'subscriber') {
    if (!verifiedSubscription) {
      submitButtonText = 'Verify Subscription';
    } else if (!selectedZone) {
      submitButtonText = 'Select Zone';
    } else {
      submitButtonText = 'Check In as Subscriber';
    }
  }

  if (!gateName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Gate Not Found</h1>
          <p className="text-gray-600 text-lg">The gate &quot;{gateId}&quot; does not exist.</p>
        </div>
      </div>
    );
  }

  if (zonesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error Loading Zones</h1>
          <p className="text-gray-600 text-lg">{zonesError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <GateHeader 
        gateName={gateName}
        gateId={gateId}
        currentTime={currentTime}
        connectionStatus="connected"
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex bg-white/80 backdrop-blur-sm rounded-xl shadow-lg mb-8 p-2 border border-white/20 animate-fade-in-down">
            <button 
              onClick={() => setActiveTab('visitor')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'visitor' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              Visitor
            </button>
            <button 
              onClick={() => setActiveTab('subscriber')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                activeTab === 'subscriber' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
              }`}
            >
              Subscriber
            </button>
        </div>

        {/* Visitor Tab */}
        {activeTab === 'visitor' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Visitor Check-in</h2>
              <p className="text-gray-600">Select a zone to park</p>
            </div>
            
            {zonesLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading zones...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {zones?.map((zone, index) => (
                  <div key={zone.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <ZoneSelectionCard
                      zone={zone}
                      selected={selectedZone === zone.id}
                      onSelect={handleZoneSelect}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Subscriber Tab */}
        {activeTab === 'subscriber' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscriber Check-in</h2>
              <p className="text-gray-600">Verify your subscription to proceed</p>
              
            </div>
            
            <div className="mb-6 max-w-md">
              <SubscriptionInput
                subscriptionId={subscriptionId}
                onSubscriptionIdChange={setSubscriptionId}
                onVerify={handleVerifySubscription}
                isLoading={isVerifying}
                error={subscriptionError}
                subscription={verifiedSubscription ? {
                  id: verifiedSubscription.id,
                  userName: verifiedSubscription.userName,
                  cars: verifiedSubscription.cars
                } : undefined}
              />
            </div>
            
            {verifiedSubscription && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Zones</h2>
                <p className="text-gray-800 mb-2">Select a zone to check in</p>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Your Subscription:</strong> {verifiedSubscription.category.replace('cat_', '').toUpperCase()} category
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    You can only check into zones that match your subscription category. Look for zones with the same category as your subscription.
                  </p>
                </div>
              </div>
            )}
            
            {verifiedSubscription && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {zones?.map((zone, index) => (
                  <div key={zone.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <ZoneSelectionCard
                zone={zone}
                      selected={selectedZone === zone.id}
                onSelect={handleZoneSelect}
                      subscriptionCategory={verifiedSubscription.category}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        {(activeTab === 'visitor' || verifiedSubscription) && (
          <div className="mt-8 flex justify-center animate-fade-in-up">
            <button 
              onClick={activeTab === 'visitor' ? handleCheckin : handleSubscriberCheckin}
              disabled={!selectedZone || (activeTab === 'subscriber' && !verifiedSubscription)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-12 rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transform hover:scale-105 transition-all duration-300 animate-glow"
            >
              {submitButtonText}
            </button>
          </div>
        )}
      </div>

      {showTicketModal && currentTicket && (
        <TicketModal 
          ticket={currentTicket}
          zone={zones?.find(z => z.id === currentTicket.zoneId) ?? { id: currentTicket.zoneId, name: 'Unknown Zone', categoryId: 'unknown' }}
          gate={{ id: gateId, name: gateName }}
          isOpen={showTicketModal}
          onClose={handleCloseTicket}
        />
      )}
    </div>
  );
}
