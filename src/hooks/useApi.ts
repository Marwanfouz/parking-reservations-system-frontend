import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchGates,
  fetchZones,
  fetchSubscription,
  checkinTicket,
  checkoutTicket,
  fetchTicket,
  loginAdmin,
  fetchAdminSubscriptions,
  fetchAdminReports,
  updateZoneStatus,
  updateCategoryRates,
  createRushHours,
  createVacation,
  fetchCategories,
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
    onSuccess: () => {
      // Invalidate zones query to refetch updated zone data
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });
}

// Admin hooks
export function useLoginAdmin() {
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) => 
      loginAdmin(username, password),
  });
}

export function useAdminSubscriptions(token: string, enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'subscriptions'],
    queryFn: () => fetchAdminSubscriptions(token),
    enabled: enabled && !!token,
  });
}

export function useAdminReports(token: string, enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: () => fetchAdminReports(token),
    enabled: enabled && !!token,
  });
}

export function useUpdateZoneStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ zoneId, open, token }: { zoneId: string; open: boolean; token: string }) =>
      updateZoneStatus(zoneId, open, token),
    onSuccess: () => {
      // Invalidate zones queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });
}

export function useUpdateCategoryRates() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ categoryId, rateNormal, rateSpecial, token }: { 
      categoryId: string; 
      rateNormal: number; 
      rateSpecial: number; 
      token: string;
    }) => updateCategoryRates(categoryId, rateNormal, rateSpecial, token),
    onSuccess: () => {
      // Invalidate zones queries to refetch updated rates
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });
}

// Additional admin hooks
export function useCreateRushHours() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ data, token }: { data: { weekDay: number; from: string; to: string }; token: string }) =>
      createRushHours(data, token),
    onSuccess: () => {
      // Invalidate zones queries to refetch updated rates
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });
}

export function useCreateVacation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ data, token }: { data: { name: string; from: string; to: string }; token: string }) =>
      createVacation(data, token),
    onSuccess: () => {
      // Invalidate zones queries to refetch updated rates
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    },
  });
}

export function useCategories(token: string, enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => fetchCategories(token),
    enabled: enabled && !!token,
  });
}
