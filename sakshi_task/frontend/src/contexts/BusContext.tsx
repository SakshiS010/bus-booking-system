import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Bus } from '../types/index.js';
import { busApi } from '../services/api.js';

interface BusContextType {
  buses: Bus[];
  loading: boolean;
  error: string | null;
  fetchBuses: () => Promise<void>;
  getBusById: (id: string) => Bus | undefined;
}

const BusContext = createContext<BusContextType | undefined>(undefined);

export const BusProvider = ({ children }: { children: ReactNode }) => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchBuses = useCallback(async () => {
    // Prevent redundant requests
    const now = Date.now();
    if (now - lastFetch < 30000 && buses.length > 0) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await busApi.getAllBuses();
      setBuses(data);
      setLastFetch(now);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch buses');
    } finally {
      setLoading(false);
    }
  }, []); // Empty deps - use state setters only

  const getBusById = useCallback((id: string) => {
    return buses.find(bus => bus.id === id);
  }, [buses]);

  return (
    <BusContext.Provider value={{ buses, loading, error, fetchBuses, getBusById }}>
      {children}
    </BusContext.Provider>
  );
};

export const useBus = () => {
  const context = useContext(BusContext);
  if (!context) {
    throw new Error('useBus must be used within BusProvider');
  }
  return context;
};
