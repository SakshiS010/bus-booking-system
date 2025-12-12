# Bus Booking System - Frontend

A modern, responsive React application for bus ticket booking built with TypeScript and Vite.

## Features

- ✅ **React + TypeScript**: Type-safe component development
- ✅ **Context API**: Global state management for auth, buses, and bookings
- ✅ **React Router**: Client-side routing with 3 main routes
- ✅ **Responsive Design**: Mobile-first approach with grid layouts
- ✅ **Interactive Seat Selection**: Visual seat grid with DOM manipulation
- ✅ **Form Validation**: Client-side validation for all forms
- ✅ **Error Handling**: User-friendly error messages for API failures
- ✅ **Loading States**: Skeleton screens and spinners
- ✅ **Caching**: 30-second cache for bus data to reduce API calls

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Validation**: Zod (shared with backend)
- **Styling**: CSS3 with CSS Variables

## Prerequisites

- Node.js >= 18.x
- npm or yarn
- Backend API running (see backend README)

## Installation

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

   Update the API URL in `.env`:

   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

The app will start on `http://localhost:5173` with hot module replacement.

### Production Build

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components (future)
│   ├── contexts/         # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── BusContext.tsx
│   │   └── BookingContext.tsx
│   ├── pages/            # Page components
│   │   ├── BusListing.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── BookingPage.tsx
│   ├── services/         # API service layer
│   │   └── api.ts
│   ├── types/            # TypeScript interfaces
│   │   └── index.ts
│   ├── styles/           # CSS files
│   │   ├── index.css
│   │   ├── App.css
│   │   ├── BusListing.css
│   │   ├── AdminDashboard.css
│   │   └── BookingPage.css
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── .env.example          # Environment variables template
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Routes

### User Routes

#### `/` - Bus Listing

- Displays all available buses
- Shows available seats count
- Navigate to booking page
- Access admin panel

#### `/booking/:id` - Booking Page

- View bus details
- Interactive seat selection grid
- Passenger information form
- Booking confirmation

### Admin Routes

#### `/admin` - Admin Dashboard

- Create new buses
- View all buses in a table
- Form validation

## Features Walkthrough

### 1. Bus Listing Page

**Features:**

- Grid layout of bus cards
- Real-time available seats display
- Loading spinner while fetching data
- Error handling with retry button
- Empty state when no buses available
- Responsive design for mobile/tablet/desktop

**User Flow:**

1. User lands on homepage
2. Sees list of available buses
3. Clicks "Book Now" on desired bus
4. Redirected to booking page

### 2. Admin Dashboard

**Features:**

- Bus creation form with validation
- Real-time form error display
- Success message on bus creation
- Table view of all buses
- Responsive two-column layout

**Validation Rules:**

- Bus name: 3-100 characters
- Route: 5-200 characters
- Departure time: Required, datetime format
- Total seats: 10-100

**User Flow:**

1. Navigate to `/admin`
2. Fill in bus details
3. Submit form
4. See success message
5. New bus appears in table

### 3. Booking Page

**Features:**

- Bus details display
- Interactive seat grid with visual feedback
- Seat legend (Available/Selected/Booked)
- DOM manipulation for seat selection
- Passenger form with validation
- Booking confirmation card
- Real-time seat availability updates

**Seat Selection:**

- Click available seats to select (turns blue)
- Click selected seats to deselect
- Booked seats are disabled (gray)
- Maximum 10 seats per booking
- Visual hover effects

**Form Validation:**

- Name: Minimum 2 characters
- Email: Valid email format
- Phone: International format (e.g., +919876543210)
- At least 1 seat must be selected

**User Flow:**

1. View bus details
2. Select seats from grid
3. Fill passenger information
4. Submit booking
5. See confirmation with booking ID
6. Option to book another trip

## State Management

### AuthContext

```typescript
- isAdmin: boolean
- setIsAdmin: (value: boolean) => void
```

### BusContext

```typescript
- buses: Bus[]
- loading: boolean
- error: string | null
- fetchBuses: () => Promise<void>
- getBusById: (id: string) => Bus | undefined
```

**Caching Strategy:**

- Caches bus data for 30 seconds
- Prevents redundant API calls
- Automatically refetches after cache expires

### BookingContext

```typescript
- currentBooking: Booking | null
- setCurrentBooking: (booking: Booking | null) => void
```

## API Integration

All API calls are centralized in `src/services/api.ts`:

```typescript
// Bus API
busApi.getAllBuses();
busApi.getBusById(id);
busApi.getSeats(busId);
busApi.createBus(data);

// Booking API
bookingApi.createBooking(data);
bookingApi.getBookingStatus(id);
```

**Error Handling:**

- Axios interceptor catches all errors
- Extracts error message from response
- Throws formatted error object
- Components display user-friendly messages

## Styling

### Design System

**Colors:**

```css
--primary-color: #2563eb (Blue)
--success-color: #10b981 (Green)
--danger-color: #ef4444 (Red)
--warning-color: #f59e0b (Orange)
```

**Layout:**

- Max width: 1200px
- Responsive grid layouts
- Mobile-first approach

**Components:**

- Consistent button styles
- Form input styling
- Card components with shadows
- Loading spinners
- Error/Success messages

### Responsive Breakpoints

```css
@media (max-width: 1024px) {
  /* Tablet */
}
@media (max-width: 768px) {
  /* Mobile */
}
```

## Development Guidelines

### Adding a New Page

1. Create component in `src/pages/`
2. Create corresponding CSS file in `src/styles/`
3. Add route in `App.tsx`
4. Use Context API for state management

### Code Standards

- ✅ Use functional components with hooks
- ✅ Named exports only (no default exports)
- ✅ TypeScript interfaces for all props
- ✅ Proper error handling in async operations
- ✅ Loading and error states for all data fetching
- ✅ Responsive design for all components

## Deployment

### Environment Variables for Production

```env
VITE_API_BASE_URL=https://your-backend-api.com/api
```

### Deploy to Vercel

1. **Connect GitHub repository to Vercel**
2. **Configure build settings:**

   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add environment variables in Vercel dashboard:**

   - `VITE_API_BASE_URL`: Your deployed backend URL

4. **Deploy!**

Vercel will automatically deploy on every push to main branch.

## Troubleshooting

### API Connection Issues

**Problem:** Cannot connect to backend API

**Solution:**

1. Verify backend is running
2. Check `VITE_API_BASE_URL` in `.env`
3. Ensure CORS is enabled on backend
4. Check browser console for errors

### Build Errors

**Problem:** TypeScript compilation errors

**Solution:**

```bash
# Clean node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript config
npx tsc --noEmit
```

### Routing Issues

**Problem:** 404 on page refresh in production

**Solution:**

- Configure your hosting provider to redirect all routes to `index.html`
- For Vercel, this is automatic
- For Netlify, add `_redirects` file:
  ```
  /*    /index.html   200
  ```

## Future Enhancements

- [ ] Live seat availability updates (WebSocket/Polling)
- [ ] Seat selection animations
- [ ] Booking history
- [ ] User authentication
- [ ] Search and filter buses
- [ ] Date picker for departure
- [ ] Multiple bus operators
- [ ] Cancellation feature

## License

ISC
