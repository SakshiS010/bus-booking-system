# Bus Ticket Booking System

A full-stack bus ticket booking application similar to RedBus, built with modern technologies and best practices.

## 🚀 Features

### Backend

- ✅ **Layered Architecture**: Controllers → Services → Repositories
- ✅ **Concurrency Handling**: Pessimistic locking with PostgreSQL transactions
- ✅ **Booking Expiry**: Automatic PENDING → FAILED after 2 minutes
- ✅ **Input Validation**: Zod schemas for type-safe validation
- ✅ **Error Handling**: Global async wrap handler with custom error classes
- ✅ **Structured Logging**: Winston logger with file and console transports

### Frontend

- ✅ **React + TypeScript**: Type-safe component development
- ✅ **Context API**: Global state management
- ✅ **Interactive Seat Selection**: Visual grid with DOM manipulation
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Form Validation**: Client-side validation with user-friendly errors
- ✅ **API Caching**: 30-second cache to reduce redundant requests

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **Validation**: Zod
- **Logging**: Winston

### Frontend

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Styling**: CSS3 with CSS Variables

## 📁 Project Structure

```
sakshi_task/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── controllers/     # HTTP handlers
│   │   ├── services/        # Business logic
│   │   ├── db/              # Database layer
│   │   ├── middlewares/     # Express middlewares
│   │   ├── utils/           # Utilities (asyncHandler, errors, logger)
│   │   ├── validators/      # Zod schemas
│   │   └── routes/          # API routes
│   └── README.md
│
├── frontend/                # React application
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React Context providers
│   │   ├── services/        # API integration
│   │   ├── types/           # TypeScript interfaces
│   │   └── styles/          # CSS files
│   └── README.md
│
└── SYSTEM_DESIGN.md         # System design document
```

## 🚦 Getting Started

### Prerequisites

- Node.js >= 18.x
- npm or yarn
- Supabase account (or PostgreSQL database)

### Backend Setup

1. **Navigate to backend directory**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Run database migrations**

   ```bash
   # Execute src/db/migrations/001_initial_schema.sql in your Supabase SQL editor
   ```

5. **Start the server**

   ```bash
   npm run dev
   ```

   Server runs on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory**

   ```bash
   cd frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with backend API URL
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   App runs on `http://localhost:5173`

## 📖 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Endpoints

#### Buses

- `POST /buses` - Create a new bus (Admin)
- `GET /buses` - Get all buses
- `GET /buses/:id` - Get bus by ID
- `GET /buses/:id/seats` - Get seats for a bus

#### Bookings

- `POST /bookings` - Create a booking
- `GET /bookings/:id` - Get booking status

See [backend/README.md](backend/README.md) for detailed API documentation.

## 🎨 User Interface

### Routes

- **`/`** - Bus listing page
- **`/admin`** - Admin dashboard (create buses)
- **`/booking/:id`** - Booking page with seat selection

### Features Demo

1. **Admin Creates a Bus**

   - Navigate to `/admin`
   - Fill in bus details (name, route, departure time, seats)
   - Submit form
   - Bus appears in the list

2. **User Books Seats**

   - Browse available buses on homepage
   - Click "Book Now" on desired bus
   - Select seats from interactive grid
   - Fill in passenger details
   - Submit booking
   - Receive confirmation with booking ID

3. **Concurrency Handling**

   - Multiple users can try to book the same seat
   - Only one booking succeeds
   - Others receive "seats no longer available" error

4. **Booking Expiry**
   - Bookings start in PENDING status
   - After 2 minutes, automatically marked as FAILED
   - Seats are released back to available pool

## 🔒 Concurrency Strategy

The system uses **pessimistic locking** to handle concurrent bookings:

1. When a booking is created, `SELECT FOR UPDATE` locks the selected seats
2. Verifies all seats are available
3. Marks seats as unavailable
4. Creates the booking
5. All operations wrapped in a PostgreSQL transaction

This ensures data consistency even under high concurrent load.

## 🏗️ Architecture Highlights

### Backend Layering

```
Request → Controller → Service → Repository → Database
```

- **Controllers**: Handle HTTP requests/responses only
- **Services**: Contain all business logic
- **Repositories**: Encapsulate database operations
- **Middlewares**: Validation, error handling, logging

### Error Handling

- Global async wrap handler for all route handlers
- Custom error classes (ValidationError, NotFoundError, ConflictError)
- Centralized error middleware
- No sensitive data exposed in error responses

### State Management (Frontend)

- **AuthContext**: Mock authentication state
- **BusContext**: Bus data with 30-second caching
- **BookingContext**: Current booking state

## 🚀 Deployment

### Backend (Render)

1. Connect GitHub repository
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add environment variables
5. Deploy

### Frontend (Vercel)

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variable: `VITE_API_BASE_URL`
5. Deploy

See individual READMEs for detailed deployment instructions.

## 📊 System Design

For detailed system design including:

- High-level architecture
- Database design and scaling strategies
- Concurrency control mechanisms
- Caching strategies
- Message queue usage

See [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md)

## 🧪 Testing

Tests are not included in the initial implementation as requested, but the codebase is structured for testability:

- **Backend**: SuperTest for integration tests, Jest for unit tests
- **Frontend**: Playwright for E2E tests, React Testing Library for component tests

## 📝 Code Standards

### Backend

- ✅ Named exports only (no default exports)
- ✅ All async handlers wrapped with `asyncHandler`
- ✅ Zod validation for all inputs
- ✅ Repository pattern for database access
- ✅ No business logic in controllers

### Frontend

- ✅ Functional components with hooks
- ✅ Named exports only
- ✅ TypeScript interfaces for all props
- ✅ Proper error handling in async operations
- ✅ Loading and error states for all data fetching

## 🐛 Known Limitations

1. **Authentication**: Mock authentication only (no real user login)
2. **Payment**: No payment integration (bookings auto-confirm)
3. **Real-time Updates**: No WebSocket for live seat availability
4. **Booking History**: Users can't view past bookings
5. **Cancellation**: No booking cancellation feature

## 🔮 Future Enhancements

- [ ] User authentication with JWT
- [ ] Payment gateway integration
- [ ] WebSocket for real-time seat updates
- [ ] Booking history and management
- [ ] Email notifications
- [ ] Search and filter buses
- [ ] Multiple bus operators
- [ ] Seat selection animations
- [ ] Mobile app (React Native)

## 📄 License

ISC

## 👤 Author

Varun Singh

---

**Note**: This project was built as part of the Modex Full Stack Assessment.
