'use client';

import { useState, useEffect } from 'react';
import { CheckoutPanel } from '../../components/CheckoutPanel';
import { useTicket, useCheckoutTicket, useSubscription } from '../../hooks/useApi';
import { CheckoutResponse } from '../../services/api';
import { Clock, Badge } from 'lucide-react';

export default function CheckpointScreen() {
  const [ticketId, setTicketId] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);

  const { data: ticket, isLoading: ticketLoading, error: ticketError } = useTicket(ticketId, !!ticketId && showCheckout);
  const { data: subscription } = useSubscription(ticket?.subscriptionId ?? '', !!ticket?.subscriptionId);
  const checkoutMutation = useCheckoutTicket();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const hours24 = now.getHours();
      const mod = hours24 % 12;
      const hours12 = mod === 0 ? 12 : mod;
      const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
      setCurrentTime(`${hours12}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTicketLookup = (id: string) => {
    if (!id.trim()) return;
    setTicketId(id.trim());
    setShowCheckout(true);
    setCheckoutData(null);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Top Bar */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 animate-fade-in-left">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Badge className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Employee Checkpoint</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-700 animate-fade-in-right">
              <span className="hidden sm:inline">Employee Portal</span>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{currentTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Ticket Lookup */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-6 animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Ticket Lookup</h2>
            <p className="text-gray-600 mb-6">Enter the ticket ID to view details and proceed to checkout.</p>
            <div className="space-y-6">
              <div>
                <label htmlFor="ticketId" className="block text-sm font-medium text-gray-700 mb-2">
                  Ticket ID
                </label>
                <input
                  id="ticketId"
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 bg-white/50 backdrop-blur-sm transition-all duration-300"
                  placeholder="Enter ticket ID"
                />
              </div>

              <button
                onClick={() => handleTicketLookup(ticketId)}
                disabled={!ticketId.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
              >
                <span className="material-symbols-outlined">search</span>
                Lookup Ticket{' '}
              </button>
            </div>

            {/* Error Display */}
            {ticketError && (
              <div className="mt-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl animate-fade-in-down">
                <p className="text-sm text-red-600">
                  {ticketError.message ?? 'Failed to load ticket'}
                </p>
              </div>
            )}

            {/* Loading State */}
            {ticketLoading && (
              <div className="mt-6 p-4 bg-indigo-50/80 backdrop-blur-sm border border-indigo-200 rounded-xl animate-fade-in-down">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-indigo-700">Loading ticket...</p>
                </div>
              </div>
            )}
          </div>

          {/* Checkout Panel */}
          {showCheckout && ticket && !ticketError && (
            <div className="animate-fade-in-up">
              <CheckoutPanel
                ticketId={ticketId}
                ticket={ticket}
                subscription={subscription}
                billingBreakdown={checkoutData?.breakdown ?? []}
                totalAmount={checkoutData?.amount ?? 0}
                durationHours={checkoutData?.durationHours ?? 0}
                onCheckout={handleCheckout}
                isLoading={checkoutMutation.isPending}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
