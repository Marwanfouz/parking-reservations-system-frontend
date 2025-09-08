'use client';

import { useState, useEffect } from 'react';
import { CheckoutPanel } from '../../components/CheckoutPanel';
import { useTicket, useCheckoutTicket, useSubscription } from '../../hooks/useApi';
import { CheckoutResponse } from '../../services/api';

export default function CheckpointScreen() {
  const [ticketId, setTicketId] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);

  // API hooks
  const { data: ticket, isLoading: ticketLoading, error: ticketError } = useTicket(ticketId, !!ticketId && showCheckout);
  const { data: subscription } = useSubscription(ticket?.subscriptionId || '', !!ticket?.subscriptionId);
  const checkoutMutation = useCheckoutTicket();

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
    if (!id.trim()) return;
    setTicketId(id.trim());
    setShowCheckout(true);
    setCheckoutData(null); // Clear previous checkout data
  };

  const handleCheckout = async (id: string, forceConvertToVisitor?: boolean) => {
    try {
      const result = await checkoutMutation.mutateAsync({
        ticketId: id,
        ...(forceConvertToVisitor !== undefined && { forceConvertToVisitor }),
      });
      
      setCheckoutData(result);
      alert('Checkout completed successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Checkout failed';
      alert(`Checkout failed: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Checkpoint</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-800">Employee Portal</span>
              <div className="text-sm text-gray-700">{currentTime}</div>
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
                disabled={!ticketId.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Lookup Ticket
              </button>
            </div>
            
            {/* Error Display */}
            {ticketError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  {ticketError.message || 'Failed to load ticket'}
                </p>
              </div>
            )}
            
            {/* Loading State */}
            {ticketLoading && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-600">Loading ticket...</p>
              </div>
            )}
          </div>
          
          {/* Checkout Panel */}
          {showCheckout && ticket && !ticketError && (
            <CheckoutPanel 
              ticketId={ticketId}
              ticket={ticket}
              subscription={subscription}
              billingBreakdown={checkoutData?.breakdown || []}
              totalAmount={checkoutData?.amount || 0}
              durationHours={checkoutData?.durationHours || 0}
              onCheckout={handleCheckout}
              isLoading={checkoutMutation.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}
