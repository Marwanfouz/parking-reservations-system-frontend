'use client';

import { useState } from 'react';

interface CheckoutPanelProps {
  readonly ticketId: string;
  readonly ticket?: {
    readonly id: string;
    readonly type: 'visitor' | 'subscriber';
    readonly zoneId: string;
    readonly gateId: string;
    readonly checkinAt: string;
  };
  readonly subscription?: {
    readonly id: string;
    readonly userName: string;
    readonly cars: Array<{
      readonly plate: string;
      readonly brand: string;
      readonly model: string;
      readonly color: string;
    }>;
  } | undefined;
  readonly billingBreakdown?: Array<{
    readonly from: string;
    readonly to: string;
    readonly hours: number;
    readonly rateMode: 'normal' | 'special';
    readonly rate: number;
    readonly amount: number;
  }>;
  readonly totalAmount?: number;
  readonly durationHours?: number;
  readonly onCheckout: (ticketId: string, forceConvertToVisitor?: boolean) => void;
  readonly isLoading?: boolean;
}

export function CheckoutPanel({ 
  ticketId, 
  ticket, 
  subscription, 
  billingBreakdown, 
  totalAmount, 
  durationHours,
  onCheckout, 
  isLoading 
}: CheckoutPanelProps) {
  const [forceConvert, setForceConvert] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      
      {/* Ticket Information */}
      {ticket && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Ticket Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-700">Ticket ID:</span>
              <span className="font-semibold ml-2 text-gray-900">{ticket.id}</span>
            </div>
            <div>
              <span className="text-gray-700">Type:</span>
              <span className="font-semibold ml-2 text-gray-900 capitalize">{ticket.type}</span>
            </div>
            <div>
              <span className="text-gray-700">Check-in:</span>
              <span className="font-semibold ml-2 text-gray-900">{new Date(ticket.checkinAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-700">Duration:</span>
              <span className="font-semibold ml-2 text-gray-900">{durationHours?.toFixed(2)} hours</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Subscription Details */}
      {subscription && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Subscription Details</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <div className="text-sm text-gray-700 mb-2">Subscriber: {subscription.userName}</div>
            <div className="space-y-2">
              {subscription.cars.map((car) => (
                <div key={car.plate} className="text-sm text-gray-800">
                  <span className="font-semibold text-gray-900">{car.plate}</span> - {car.brand} {car.model} ({car.color})
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Billing Breakdown */}
      {billingBreakdown && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Billing Breakdown</h3>
          <div className="space-y-2">
            {billingBreakdown.map((segment) => (
              <div key={`${segment.from}-${segment.to}`} className="flex justify-between text-sm border-b pb-2">
                <div>
                  <div>{new Date(segment.from).toLocaleTimeString()} - {new Date(segment.to).toLocaleTimeString()}</div>
                  <div className="text-gray-700">{segment.hours.toFixed(2)} hours @ ${segment.rate}/hr ({segment.rateMode})</div>
                </div>
                <div className="font-semibold">${segment.amount.toFixed(2)}</div>
              </div>
            ))}
            <div className="flex justify-between text-lg font-bold pt-2">
              <span>Total:</span>
              <span>${totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Force Conversion Option */}
      {ticket?.type === 'subscriber' && (
        <div className="mb-6">
          <label className="flex items-center">
            <input 
              type="checkbox" 
              checked={forceConvert}
              onChange={(e) => setForceConvert(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Convert to Visitor (plate mismatch)</span>
          </label>
        </div>
      )}
      
      <button 
        onClick={() => onCheckout(ticketId, forceConvert)}
        disabled={isLoading}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : 'Complete Checkout'}
      </button>
    </div>
  );
}
