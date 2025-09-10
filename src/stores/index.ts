// Export all stores from a central location
export { useAuthStore } from './authStore';
export { useGateStore } from './gateStore';
export { useUIStore } from './uiStore';

// Store types for better TypeScript support
export type { AuthState } from './authStore';
export type { GateState } from './gateStore';
export type { UIState } from './uiStore';
