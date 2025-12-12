export interface Bus {
  id: string;
  name: string;
  route: string;
  departure_time: string;
  total_seats: number;
  available_seats?: number;
  created_at: string;
  updated_at: string;
}

export interface Seat {
  id: string;
  bus_id: string;
  seat_number: number;
  is_available: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  bus_id: string;
  seat_ids: string[];
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  created_at: string;
  updated_at: string;
}

export interface CreateBusInput {
  name: string;
  route: string;
  departure_time: string;
  total_seats: number;
}

export interface CreateBookingInput {
  bus_id: string;
  seat_ids: string[];
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
}
