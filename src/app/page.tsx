'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GateHeader } from '../components/GateHeader';

// Mock gate data
const mockGates = [
  { id: 'gate_1', name: 'Main Entrance', location: 'North' },
  { id: 'gate_2', name: 'Side Entrance', location: 'East' },
  { id: 'gate_3', name: 'Back Entrance', location: 'South' }
];

export default function Home() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <GateHeader 
        gateId="system"
        gateName="Parking Reservation System"
        connectionStatus="connected"
        currentTime={currentTime}
      />
      
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Parking Reservation System
            </h2>
            <p className="text-gray-600 text-lg">
              Select a gate to begin check-in process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {mockGates.map(gate => (
              <Link 
                key={gate.id}
                href={`/gate/${gate.id}`}
                className="block bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {gate.name}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    Gate {gate.id} • {gate.location}
                  </div>
                  <div className="bg-blue-600 text-white py-2 px-4 rounded-md inline-block">
                    Enter Gate
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
}
