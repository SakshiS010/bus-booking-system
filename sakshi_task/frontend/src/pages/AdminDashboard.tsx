import { useState } from 'react';
import { useBus } from '../contexts/BusContext.js';
import { busApi } from '../services/api.js';
import { Navbar } from '../components/Navbar.js';
import '../styles/AdminDashboard.css';

export const AdminDashboard = () => {
  const { buses, fetchBuses } = useBus();
  
  const [formData, setFormData] = useState({
    name: '',
    route: '',
    departure_time: '',
    total_seats: 40,
  });
  
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_seats' ? parseInt(value) || 0 : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Bus name must be at least 3 characters';
    }
    
    if (!formData.route || formData.route.length < 5) {
      newErrors.route = 'Route must be at least 5 characters';
    }
    
    if (!formData.departure_time) {
      newErrors.departure_time = 'Departure time is required';
    }
    
    if (formData.total_seats < 10 || formData.total_seats > 100) {
      newErrors.total_seats = 'Total seats must be between 10 and 100';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    
    try {
      // Convert to ISO format for backend
      const isoDateTime = new Date(formData.departure_time).toISOString();
      
      await busApi.createBus({
        ...formData,
        departure_time: isoDateTime,
      });
      
      setSuccessMessage('Bus created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        route: '',
        departure_time: '',
        total_seats: 40,
      });
      
      // Refresh bus list
      await fetchBuses();
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to create bus' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <header className="page-header">
          <h1>Admin Dashboard</h1>
        </header>

      <div className="admin-content">
        <section className="create-bus-section">
          <h2>Create New Bus</h2>
          
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}
          
          {errors.submit && (
            <div className="error-message">{errors.submit}</div>
          )}

          <form onSubmit={handleSubmit} className="bus-form">
            <div className="form-group">
              <label htmlFor="name">Bus Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Express Deluxe"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="route">Route *</label>
              <input
                type="text"
                id="route"
                name="route"
                value={formData.route}
                onChange={handleChange}
                placeholder="e.g., Delhi to Mumbai"
                className={errors.route ? 'error' : ''}
              />
              {errors.route && <span className="field-error">{errors.route}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="departure_time">Departure Time *</label>
              <input
                type="datetime-local"
                id="departure_time"
                name="departure_time"
                value={formData.departure_time}
                onChange={handleChange}
                className={errors.departure_time ? 'error' : ''}
              />
              {errors.departure_time && (
                <span className="field-error">{errors.departure_time}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="total_seats">Total Seats *</label>
              <input
                type="number"
                id="total_seats"
                name="total_seats"
                value={formData.total_seats}
                onChange={handleChange}
                min="10"
                max="100"
                className={errors.total_seats ? 'error' : ''}
              />
              {errors.total_seats && (
                <span className="field-error">{errors.total_seats}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Bus'}
            </button>
          </form>
        </section>

        <section className="bus-list-section">
          <h2>All Buses ({buses.length})</h2>
          
          {buses.length === 0 ? (
            <p className="empty-text">No buses created yet.</p>
          ) : (
            <div className="bus-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Route</th>
                    <th>Departure</th>
                    <th>Seats</th>
                  </tr>
                </thead>
                <tbody>
                  {buses.map((bus) => (
                    <tr key={bus.id}>
                      <td>{bus.name}</td>
                      <td>{bus.route}</td>
                      <td>{new Date(bus.departure_time).toLocaleString()}</td>
                      <td>
                        {bus.available_seats} / {bus.total_seats}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
    </>
  );
};
