import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import '../styles/Navbar.css';

export const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => navigate('/')}>
          <span className="brand-icon">🚌</span>
          <span className="brand-text">Bus Booking</span>
        </div>
        
        <div className="navbar-actions">
          <div className="user-info">
            <span className="user-icon">{isAdmin ? '🛡️' : '👤'}</span>
            <div className="user-details">
              <div className="user-email">{user?.email}</div>
              <div className="user-role">{isAdmin ? 'Administrator' : 'User'}</div>
            </div>
          </div>
          
          {isAdmin && (
            <button className="admin-btn" onClick={() => navigate('/admin')}>
              Admin Panel
            </button>
          )}
          
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
};
