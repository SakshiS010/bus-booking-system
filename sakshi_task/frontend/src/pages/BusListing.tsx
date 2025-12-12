import { useEffect } from 'react';
import { useBus } from '../contexts/BusContext.js';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar.js';
import '../styles/BusListing.css';

export const BusListing = () => {
  const { buses, loading, error, fetchBuses } = useBus();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBuses();
  }, [fetchBuses]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading buses...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="error-message">
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => fetchBuses()}>Retry</button>
          </div>
        </div>
      </>
    );
  }

  if (buses.length === 0) {
    return (
      <>
        <Navbar />
        <div className="container">
          <div className="empty-state">
            <h2>No Buses Available</h2>
            <p>There are currently no buses scheduled. Please check back later.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <header className="page-header">
          <h1>Available Buses</h1>
        </header>

      <div className="bus-grid">
        {buses.map((bus) => (
          <div key={bus.id} className="bus-card">
            <div className="bus-card-header">
              <h3>{bus.name}</h3>
              <span className={`seats-badge ${bus.available_seats === 0 ? 'full' : ''}`}>
                {bus.available_seats} / {bus.total_seats} seats
              </span>
            </div>
            
            <div className="bus-card-body">
              <div className="bus-info">
                <span className="label">Route:</span>
                <span className="value">{bus.route}</span>
              </div>
              
              <div className="bus-info">
                <span className="label">Departure:</span>
                <span className="value">
                  {new Date(bus.departure_time).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bus-card-footer">
              <button
                className="book-btn"
                onClick={() => navigate(`/booking/${bus.id}`)}
                disabled={bus.available_seats === 0}
              >
                {bus.available_seats === 0 ? 'Fully Booked' : 'Book Now'}
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>
    </>
  );
};
