import axios from 'axios';
import type { Bus, Seat, Booking, CreateBusInput, CreateBookingInput } from '../types/index.js';
import { supabase } from '../lib/supabase.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    const errors = error.response?.data?.errors || [];
    
    throw {
      message,
      errors,
      status: error.response?.status,
    };
  }
);

// Bus API
export const busApi = {
  getAllBuses: async (): Promise<Bus[]> => {
    const { data } = await api.get('/buses');
    return data.data;
  },

  getBusById: async (id: string): Promise<Bus> => {
    const { data } = await api.get(`/buses/${id}`);
    return data.data;
  },

  getSeats: async (busId: string): Promise<Seat[]> => {
    const { data } = await api.get(`/buses/${busId}/seats`);
    return data.data;
  },

  createBus: async (busData: CreateBusInput): Promise<Bus> => {
    const { data } = await api.post('/buses', busData);
    return data.data;
  },
};

// Booking API
export const bookingApi = {
  createBooking: async (bookingData: CreateBookingInput): Promise<Booking> => {
    const { data } = await api.post('/bookings', bookingData);
    return data.data;
  },

  getBookingStatus: async (id: string): Promise<Booking> => {
    const { data } = await api.get(`/bookings/${id}`);
    return data.data;
  },
};
