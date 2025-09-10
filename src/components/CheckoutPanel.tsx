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
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <h2 className="text-3xl font-bold mb-2 text-gray-900">Checkout</h2>
      <p className="text-gray-600 mb-6">Review the ticket details and confirm checkout.</p>
      
      {/* Ticket Information */}
      {ticket && (
        <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Ticket Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700">Ticket ID:</span>
              <span className="font-semibold text-gray-900">{ticket.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Type:</span>
              <span className="font-semibold text-gray-900 capitalize">{ticket.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Check-in:</span>
              <span className="font-semibold text-gray-900">{new Date(ticket.checkinAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Duration:</span>
              <span className="font-semibold text-gray-900">{durationHours?.toFixed(2)} hours</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Subscription Details */}
      {subscription && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Subscription Details</h3>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
            <div className="text-sm text-gray-700 mb-4 font-medium">Subscriber: {subscription.userName}</div>
            <div className="space-y-3">
              {subscription.cars.map((car) => (
                <div key={car.plate} className="text-sm text-gray-800 bg-white/50 rounded-lg p-3">
                  <span className="font-semibold text-gray-900">{car.plate}</span> - {car.brand} {car.model} ({car.color})
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Billing Breakdown */}
      {billingBreakdown && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Billing Breakdown</h3>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="space-y-4">
              {billingBreakdown.map((segment) => (
                <div key={`${segment.from}-${segment.to}`} className="flex justify-between text-sm border-b border-green-200 pb-3">
                  <div>
                    <div className="font-medium">{new Date(segment.from).toLocaleTimeString()} - {new Date(segment.to).toLocaleTimeString()}</div>
                    <div className="text-gray-700">{segment.hours.toFixed(2)} hours @ ${segment.rate}/hr ({segment.rateMode})</div>
                  </div>
                  <div className="font-semibold text-green-700">${segment.amount.toFixed(2)}</div>
                </div>
              ))}
              <div className="flex justify-between text-xl font-bold pt-4 border-t border-green-300">
                <span className="text-gray-900">Total:</span>
                <span className="text-green-700">${totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Force Conversion Option */}
      {ticket?.type === 'subscriber' && (
        <div className="mb-6">
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={forceConvert}
              onChange={(e) => setForceConvert(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">Convert to Visitor (plate mismatch)</span>
          </label>
        </div>
      )}
      
      <button 
        onClick={() => onCheckout(ticketId, forceConvert)}
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-lg transform hover:scale-105 transition-all duration-300 animate-glow"
      >
        <span className="material-symbols-outlined">credit_card</span>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </div>
        ) : (
          'Complete Checkout'
        )}
      </button>
    </div>
  );
}
