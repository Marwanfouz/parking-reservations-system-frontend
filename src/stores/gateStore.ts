import { create } from 'zustand';

interface Ticket {
  id: string;
  type: 'visitor' | 'subscriber';
  zoneId: string;
  gateId: string;
  checkinAt: string;
}

interface Zone {
  id: string;
  name: string;
  categoryId: string;
  gateIds: string[];
  totalSlots: number;
  occupied: number;
  free: number;
  reserved: number;
  availableForVisitors: number;
  availableForSubscribers: number;
  rateNormal: number;
  rateSpecial: number;
  open: boolean;
}

interface Subscription {
  id: string;
  userName: string;
  active: boolean;
  category: string;
  cars: Array<{
    plate: string;
    brand: string;
    model: string;
    color: string;
  }>;
  startsAt: string;
  expiresAt: string;
  currentCheckins: Array<{
    ticketId: string;
    zoneId: string;
    checkinAt: string;
  }>;
}

interface GateState {
  // Current gate context
  currentGateId: string | null;
  currentGateName: string | null;
  
  // Zone management
  zones: Zone[];
  selectedZone: string | null;
  
  // Subscription management
  activeTab: 'visitor' | 'subscriber';
  subscriptionId: string;
  verifiedSubscription: Subscription | null;
  subscriptionError: string;
  
  // Ticket management
  currentTicket: Ticket | null;
  showTicketModal: boolean;
  
  // Actions
  setCurrentGate: (gateId: string, gateName: string) => void;
  setZones: (zones: Zone[]) => void;
  setSelectedZone: (zoneId: string | null) => void;
  setActiveTab: (tab: 'visitor' | 'subscriber') => void;
  setSubscriptionId: (id: string) => void;
  setVerifiedSubscription: (subscription: Subscription | null) => void;
  setSubscriptionError: (error: string) => void;
  setCurrentTicket: (ticket: Ticket | null) => void;
  setShowTicketModal: (show: boolean) => void;
  resetGateState: () => void;
}

export const useGateStore = create<GateState>((set) => ({
  // Initial state
  currentGateId: null,
  currentGateName: null,
  zones: [],
  selectedZone: null,
  activeTab: 'visitor',
  subscriptionId: '',
  verifiedSubscription: null,
  subscriptionError: '',
  currentTicket: null,
  showTicketModal: false,
  
  // Actions
  setCurrentGate: (gateId: string, gateName: string) => {
    set({ currentGateId: gateId, currentGateName: gateName });
  },
  
  setZones: (zones: Zone[]) => {
    set({ zones });
  },
  
  setSelectedZone: (zoneId: string | null) => {
    set({ selectedZone: zoneId });
  },
  
  setActiveTab: (tab: 'visitor' | 'subscriber') => {
    set({ activeTab: tab, selectedZone: null, subscriptionId: '', verifiedSubscription: null, subscriptionError: '' });
  },
  
  setSubscriptionId: (id: string) => {
    set({ subscriptionId: id, verifiedSubscription: null, subscriptionError: '' });
  },
  
  setVerifiedSubscription: (subscription: Subscription | null) => {
    set({ verifiedSubscription: subscription, subscriptionError: '' });
  },
  
  setSubscriptionError: (error: string) => {
    set({ subscriptionError: error, verifiedSubscription: null });
  },
  
  setCurrentTicket: (ticket: Ticket | null) => {
    set({ currentTicket: ticket });
  },
  
  setShowTicketModal: (show: boolean) => {
    set({ showTicketModal: show });
  },
  
  resetGateState: () => {
    set({
      selectedZone: null,
      subscriptionId: '',
      verifiedSubscription: null,
      subscriptionError: '',
      currentTicket: null,
      showTicketModal: false,
    });
  },
}));
