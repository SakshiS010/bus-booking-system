import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.js';
import { BusProvider } from './contexts/BusContext.js';
import { BookingProvider } from './contexts/BookingContext.js';
import { BusListing } from './pages/BusListing.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { BookingPage } from './pages/BookingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';

export const App = () => {
  return (
    <AuthProvider>
      <BusProvider>
        <BookingProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <BusListing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking/:id"
                element={
                  <ProtectedRoute>
                    <BookingPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </BookingProvider>
      </BusProvider>
    </AuthProvider>
  );
};
