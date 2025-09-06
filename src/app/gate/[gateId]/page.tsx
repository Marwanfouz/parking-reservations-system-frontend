'use client';

import { useState, useEffect, use } from 'react';
import { GateHeader } from '../../../components/GateHeader';
import { ZoneCard } from '../../../components/ZoneCard';
import { TicketModal } from '../../../components/TicketModal';

// Mock data for testing
const mockGates: Record<string, { id: string; name: string; location: string }> = {
  'gate_1': { id: 'gate_1', name: 'Main Entrance', location: 'North' },
  'gate_2': { id: 'gate_2', name: 'Side Entrance', location: 'East' },
  'gate_3': { id: 'gate_3', name: 'Back Entrance', location: 'South' }
};

const mockZones: Record<string, Array<{
  id: string;
  name: string;
  categoryId: string;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  rateNormal: number;
  rateSpecial: number;
  open: boolean;
}>> = {
  'gate_1': [
    {
      id: 'zone_a',
      name: 'Zone A',
      categoryId: 'premium',
      occupied: 60,
      free: 40,
      reserved: 15,
      availableForVisitors: 25,
      availableForSubscribers: 40,
      rateNormal: 5.0,
      rateSpecial: 8.0,
      open: true
    },
    {
      id: 'zone_b',
      name: 'Zone B',
      categoryId: 'standard',
      occupied: 80,
      free: 20,
      reserved: 10,
      availableForVisitors: 10,
      availableForSubscribers: 20,
      rateNormal: 3.0,
      rateSpecial: 5.0,
      open: true
    }
  ],
  'gate_2': [
    {
      id: 'zone_c',
      name: 'Zone C',
      categoryId: 'economy',
      occupied: 45,
      free: 55,
      reserved: 8,
      availableForVisitors: 47,
      availableForSubscribers: 55,
      rateNormal: 2.0,
      rateSpecial: 3.0,
      open: true
    }
  ],
  'gate_3': [
    {
      id: 'zone_d',
      name: 'Zone D',
      categoryId: 'premium',
      occupied: 30,
      free: 70,
      reserved: 12,
      availableForVisitors: 58,
      availableForSubscribers: 70,
      rateNormal: 5.0,
      rateSpecial: 8.0,
      open: false
    }
  ]
};

export default function GateScreen({ params }: { params: Promise<{ gateId: string }> }) {
  const { gateId } = use(params);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showTicket, setShowTicket] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
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

  const gate = mockGates[gateId];
  const zones = mockZones[gateId] || [];

  const handleZoneSelect = (zoneId: string) => {
    setSelectedZone(zoneId);
  };

  const handleCheckin = () => {
    if (!selectedZone) return;
    
    // Mock check-in - create ticket
    const mockTicket = {
      id: `t_${Date.now()}`,
      type: 'visitor' as const,
      zoneId: selectedZone,
      gateId: gateId,
      checkinAt: new Date().toISOString()
    };
    
    setTicket(mockTicket);
    setShowTicket(true);
  };

  const handleCloseTicket = () => {
    setShowTicket(false);
    setSelectedZone(null);
    setTicket(null);
  };

  if (!gate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Gate Not Found</h1>
          <p className="text-gray-600">Gate {gateId} does not exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <GateHeader 
        gateId={gateId}
        gateName={gate.name}
        connectionStatus="connected"
        currentTime={currentTime}
      />
      
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
            <button className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md">
              Visitor
            </button>
            <button className="flex-1 py-2 px-4 text-gray-600">
              Subscriber
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Zones</h2>
          <p className="text-gray-600">Select a zone to check in</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {zones.map(zone => (
            <ZoneCard 
              key={zone.id}
              zone={zone}
              onSelect={handleZoneSelect}
              selected={selectedZone === zone.id}
              disabled={!zone.open || zone.availableForVisitors <= 0}
            />
          ))}
        </div>

        {selectedZone && (
          <div className="text-center">
            <button 
              onClick={handleCheckin}
              className="bg-green-600 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:bg-green-700"
            >
              Go
            </button>
          </div>
        )}
      </div>

      {showTicket && ticket && (
        <TicketModal 
          ticket={ticket}
          zone={zones.find(z => z.id === ticket.zoneId)!}
          gate={gate}
          isOpen={showTicket}
          onClose={handleCloseTicket}
        />
      )}
    </div>
  );
}
