'use client';

import { useEffect, useRef, useState } from 'react';

export interface ZoneUpdate {
  type: 'zone-update';
  payload: {
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
  };
}

export interface AdminUpdate {
  type: 'admin-update';
  payload: {
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    details: any;
    timestamp: string;
  };
}

export type WebSocketMessage = ZoneUpdate | AdminUpdate;

export interface WebSocketHook {
  isConnected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  subscribe: (gateId: string) => void;
  unsubscribe: (gateId: string) => void;
  onZoneUpdate: (callback: (update: ZoneUpdate) => void) => void;
  onAdminUpdate: (callback: (update: AdminUpdate) => void) => void;
}

const WS_URL = 'ws://localhost:3000/api/v1/ws';

export function useWebSocket(): WebSocketHook {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const subscribedGatesRef = useRef<Set<string>>(new Set());
  const zoneUpdateCallbacksRef = useRef<Set<(update: ZoneUpdate) => void>>(new Set());
  const adminUpdateCallbacksRef = useRef<Set<(update: AdminUpdate) => void>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    setConnectionStatus('connecting');
    
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected to', WS_URL);
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Resubscribe to all gates
        subscribedGatesRef.current.forEach(gateId => {
          ws.send(JSON.stringify({
            type: 'subscribe',
            payload: { gateId }
          }));
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          if (message.type === 'zone-update') {
            zoneUpdateCallbacksRef.current.forEach(callback => {
              callback(message as ZoneUpdate);
            });
          } else if (message.type === 'admin-update') {
            adminUpdateCallbacksRef.current.forEach(callback => {
              callback(message as AdminUpdate);
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Only reconnect if it wasn't a manual close
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            connect();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.log('WebSocket readyState:', ws.readyState);
        setConnectionStatus('disconnected');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('disconnected');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  };

  const subscribe = (gateId: string) => {
    subscribedGatesRef.current.add(gateId);
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        payload: { gateId }
      }));
    }
  };

  const unsubscribe = (gateId: string) => {
    subscribedGatesRef.current.delete(gateId);
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        payload: { gateId }
      }));
    }
  };

  const onZoneUpdate = (callback: (update: ZoneUpdate) => void) => {
    zoneUpdateCallbacksRef.current.add(callback);
    
    return () => {
      zoneUpdateCallbacksRef.current.delete(callback);
    };
  };

  const onAdminUpdate = (callback: (update: AdminUpdate) => void) => {
    adminUpdateCallbacksRef.current.add(callback);
    
    return () => {
      adminUpdateCallbacksRef.current.delete(callback);
    };
  };

  useEffect(() => {
    // Add a small delay to ensure backend is ready
    const connectTimeout = setTimeout(() => {
      connect();
    }, 1000);
    
    return () => {
      clearTimeout(connectTimeout);
      disconnect();
    };
  }, []);

  return {
    isConnected,
    connectionStatus,
    subscribe,
    unsubscribe,
    onZoneUpdate,
    onAdminUpdate,
  };
}
