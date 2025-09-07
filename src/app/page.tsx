'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GateHeader } from '../components/GateHeader';
import { useGates } from '../hooks/useApi';

export default function Home() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const { data: gates, isLoading, error } = useGates();

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-800">Loading gates...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600">Error loading gates: {error.message}</div>
        </div>
      </div>
    );
  }

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
            <p className="text-gray-800 text-lg mb-6">
              Select a gate to begin check-in process
            </p>
            
            {/* Employee Access */}
            <div className="mb-8">
              <Link 
                href="/checkpoint"
                className="inline-block bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700 transition-colors"
              >
                Employee Checkpoint
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {gates?.map(gate => (
              <Link
                key={gate.id}
                href={`/gate/${gate.id}`}
                className="block bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {gate.name}
                  </div>
                  <div className="text-sm text-gray-800 mb-4">
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