import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Booking } from '../types/index.js';

interface BookingContextType {
  currentBooking: Booking | null;
  setCurrentBooking: (booking: Booking | null) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  return (
    <BookingContext.Provider value={{ currentBooking, setCurrentBooking }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};
