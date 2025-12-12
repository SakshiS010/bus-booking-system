import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { busApi, bookingApi } from '../services/api.js';
import type { Bus, Seat, Booking } from '../types/index.js';
import { Navbar } from '../components/Navbar.js';
import '../styles/BookingPage.css';

export const BookingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [bus, setBus] = useState<Bus | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [passengerData, setPassengerData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  
  const [formErrors, setFormErrors] = useState<any>({});
  const [booking, setBooking] = useState<Booking | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchBusAndSeats = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [busData, seatsData] = await Promise.all([
          busApi.getBusById(id),
          busApi.getSeats(id),
        ]);
        
        setBus(busData);
        setSeats(seatsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load bus details');
      } finally {
        setLoading(false);
      }
    };

    fetchBusAndSeats();
  }, [id]);

  const handleSeatClick = (seat: Seat) => {
    if (!seat.is_available) return;

    const seatElement = document.getElementById(`seat-${seat.id}`);
    
    if (selectedSeats.includes(seat.id)) {
      // Deselect seat
      setSelectedSeats(prev => prev.filter(id => id !== seat.id));
      seatElement?.classList.remove('selected');
    } else {
      // Select seat (max 10 seats)
      if (selectedSeats.length >= 10) {
        alert('You can book a maximum of 10 seats at once');
        return;
      }
      setSelectedSeats(prev => [...prev, seat.id]);
      seatElement?.classList.add('selected');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassengerData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: any = {};
    
    if (!passengerData.name || passengerData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!passengerData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passengerData.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!passengerData.phone || !/^\+?[1-9]\d{9,14}$/.test(passengerData.phone)) {
      errors.phone = 'Please enter a valid phone number (e.g., +919876543210)';
    }
    
    if (selectedSeats.length === 0) {
      errors.seats = 'Please select at least one seat';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !id) return;

    setBookingLoading(true);
    setError(null);
    
    try {
      const bookingData = await bookingApi.createBooking({
        bus_id: id,
        seat_ids: selectedSeats,
        passenger_name: passengerData.name,
        passenger_email: passengerData.email,
        passenger_phone: passengerData.phone,
      });
      
      setBooking(bookingData);
      
      // Clear selections
      selectedSeats.forEach(seatId => {
        const seatElement = document.getElementById(`seat-${seatId}`);
        seatElement?.classList.remove('selected');
      });
      setSelectedSeats([]);
      
      // Refresh seats
      const updatedSeats = await busApi.getSeats(id);
      setSeats(updatedSeats);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking. Seats may have been booked by someone else.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading bus details...</p>
        </div>
      </div>
    );
  }

  if (error && !bus) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')}>Back to Buses</button>
        </div>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Bus Not Found</h2>
          <button onClick={() => navigate('/')}>Back to Buses</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>{bus.name}</h1>
      </header>

      <div className="booking-content">
        <section className="bus-details">
          <h3>Trip Details</h3>
          <div className="detail-row">
            <span className="label">Route:</span>
            <span className="value">{bus.route}</span>
          </div>
          <div className="detail-row">
            <span className="label">Departure:</span>
            <span className="value">{new Date(bus.departure_time).toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <span className="label">Available Seats:</span>
            <span className="value">{bus.available_seats} / {bus.total_seats}</span>
          </div>
        </section>

        <section className="seat-selection">
          <h3>Select Seats</h3>
          <div className="seat-legend">
            <div className="legend-item">
              <div className="seat-icon available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="seat-icon selected"></div>
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <div className="seat-icon booked"></div>
              <span>Booked</span>
            </div>
          </div>

          <div className="seat-grid">
            {seats.map((seat) => (
              <div
                key={seat.id}
                id={`seat-${seat.id}`}
                className={`seat ${seat.is_available ? 'available' : 'booked'}`}
                onClick={() => handleSeatClick(seat)}
                title={`Seat ${seat.seat_number}`}
              >
                {seat.seat_number}
              </div>
            ))}
          </div>

          {selectedSeats.length > 0 && (
            <div className="selected-info">
              <p>Selected Seats: {selectedSeats.length}</p>
            </div>
          )}
          
          {formErrors.seats && (
            <div className="field-error">{formErrors.seats}</div>
          )}
        </section>

        <section className="passenger-form">
          <h3>Passenger Details</h3>
          
          {error && (
            <div className="error-message">{error}</div>
          )}

          <form onSubmit={handleBooking}>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={passengerData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={formErrors.name ? 'error' : ''}
              />
              {formErrors.name && (
                <span className="field-error">{formErrors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={passengerData.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className={formErrors.email ? 'error' : ''}
              />
              {formErrors.email && (
                <span className="field-error">{formErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={passengerData.phone}
                onChange={handleInputChange}
                placeholder="+919876543210"
                className={formErrors.phone ? 'error' : ''}
              />
              {formErrors.phone && (
                <span className="field-error">{formErrors.phone}</span>
              )}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={bookingLoading || selectedSeats.length === 0}
            >
              {bookingLoading ? 'Booking...' : `Book ${selectedSeats.length} Seat(s)`}
            </button>
          </form>
        </section>

        {booking && (
          <section className="booking-success">
            <div className="success-card">
              <h2>✓ Booking Successful!</h2>
              <div className="booking-details">
                <p><strong>Booking ID:</strong> {booking.id}</p>
                <p><strong>Status:</strong> <span className={`status ${booking.status.toLowerCase()}`}>{booking.status}</span></p>
                <p><strong>Seats Booked:</strong> {booking.seat_ids.length}</p>
                <p><strong>Passenger:</strong> {booking.passenger_name}</p>
              </div>
              <button onClick={() => navigate('/')}>Book Another Trip</button>
            </div>
          </section>
        )}
      </div>
    </div>
    </>
  );
};
