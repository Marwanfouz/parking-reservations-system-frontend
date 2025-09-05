'use client';

import { useState } from 'react';
import { GateHeader } from '../components/GateHeader';
import { ZoneCard } from '../components/ZoneCard';

// Mock zone data for testing
const mockZones = [
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
  },
  {
    id: 'zone_c',
    name: 'Zone C',
    categoryId: 'economy',
    occupied: 95,
    free: 5,
    reserved: 5,
    availableForVisitors: 0,
    availableForSubscribers: 5,
    rateNormal: 2.0,
    rateSpecial: 3.0,
    open: false
  }
];

export default function Home() {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const handleZoneSelect = (zoneId: string) => {
    setSelectedZone(zoneId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GateHeader 
        gateId="gate_1"
        gateName="Main Entrance"
        connectionStatus="connected"
        currentTime={new Date().toLocaleString()}
      />
      
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Zones</h2>
          <p className="text-gray-600">Select a zone to check in</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {mockZones.map(zone => (
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
            <button className="bg-green-600 text-white py-3 px-8 rounded-lg text-lg font-semibold hover:bg-green-700">
              Go to Zone {selectedZone}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
