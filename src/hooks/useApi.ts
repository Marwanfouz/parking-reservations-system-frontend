import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchGates,
  fetchZones,
  fetchSubscription,
  checkinTicket,
  checkoutTicket,
  fetchTicket,
} from '../services/api';

// Query keys
export const queryKeys = {
  gates: ['gates'] as const,
  zones: (gateId: string) => ['zones', gateId] as const,
  subscription: (id: string) => ['subscription', id] as const,
  ticket: (id: string) => ['ticket', id] as const,
};

// Hooks
export function useGates() {
  return useQuery({
    queryKey: queryKeys.gates,
    queryFn: fetchGates,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useZones(gateId: string) {
  return useQuery({
    queryKey: queryKeys.zones(gateId),
    queryFn: () => fetchZones(gateId),
    enabled: !!gateId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useSubscription(subscriptionId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.subscription(subscriptionId),
    queryFn: () => fetchSubscription(subscriptionId),
    enabled: enabled && !!subscriptionId,
    retry: false, // Don't retry on 404
  });
}

export function useTicket(ticketId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.ticket(ticketId),
    queryFn: () => fetchTicket(ticketId),
    enabled: enabled && !!ticketId,
    retry: false, // Don't retry on 404
  });
}

// Mutations
export function useCheckinTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: checkinTicket,
    onSuccess: (data) => {
      // Invalidate zones query to refetch updated zone data
      queryClient.invalidateQueries({ queryKey: queryKeys.zones(data.ticket.gateId) });
    },
  });
}

export function useCheckoutTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: checkoutTicket,
    onSuccess: (data) => {
      // Invalidate zones query to refetch updated zone data
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });
}
