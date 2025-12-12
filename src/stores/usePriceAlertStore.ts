import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PriceAlert {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: number;
  triggered: boolean;
}

interface PriceAlertState {
  alerts: PriceAlert[];
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'>) => void;
  removeAlert: (id: string) => void;
  triggerAlert: (id: string) => void;
  clearTriggeredAlerts: () => void;
}

export const usePriceAlertStore = create<PriceAlertState>()(
  persist(
    (set) => ({
      alerts: [],
      
      addAlert: (alert) => {
        const newAlert: PriceAlert = {
          ...alert,
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
          triggered: false,
        };
        set((state) => ({
          alerts: [...state.alerts, newAlert]
        }));
      },
      
      removeAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id)
        }));
      },
      
      triggerAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, triggered: true } : a
          )
        }));
      },
      
      clearTriggeredAlerts: () => {
        set((state) => ({
          alerts: state.alerts.filter((a) => !a.triggered)
        }));
      },
    }),
    {
      name: 'risedex-price-alerts',
    }
  )
);
