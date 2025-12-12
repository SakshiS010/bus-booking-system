# Bus Booking System - Backend API

A robust bus ticket booking system backend built with Express.js, TypeScript, and PostgreSQL (Supabase).

## Features

- ✅ **Layered Architecture**: Controllers, Services, Repositories pattern
- ✅ **Concurrency Handling**: Pessimistic locking with PostgreSQL transactions
- ✅ **Input Validation**: Zod schemas for type-safe validation
- ✅ **Error Handling**: Global async wrap handler with custom error classes
- ✅ **Booking Expiry**: Automatic PENDING → FAILED after 2 minutes
- ✅ **Structured Logging**: Winston logger with file and console transports
- ✅ **Type Safety**: Full TypeScript with strict mode

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **Validation**: Zod
- **Logging**: Winston

## Prerequisites

- Node.js >= 18.x
- npm or yarn
- Supabase account (or PostgreSQL database)

## Installation

1. **Clone the repository**

   ```bash
   cd backend
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

   Update the following variables in `.env`:

   ```env
   PORT=3000
   NODE_ENV=development

   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   DATABASE_URL=postgresql://user:password@host:port/database

   # Optional
   FRONTEND_URL=http://localhost:5173
   LOG_LEVEL=info
   ```

4. **Set up the database**

   Run the migration script in your Supabase SQL editor or PostgreSQL client:

   ```bash
   # The migration file is located at:
   # src/db/migrations/001_initial_schema.sql
   ```

   Or connect to your database and run:

   ```bash
   psql $DATABASE_URL < src/db/migrations/001_initial_schema.sql
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3000` with hot-reloading enabled.

### Production Mode

```bash
npm run build
npm start
```

## API Endpoints

### Health Check

```
GET /health
```

### Bus Endpoints

#### Create a Bus (Admin)

```http
POST /api/buses
Content-Type: application/json

{
  "name": "Express Deluxe",
  "route": "Delhi to Mumbai",
  "departure_time": "2024-12-15T10:00:00Z",
  "total_seats": 40
}
```

#### Get All Buses

```http
GET /api/buses
```

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Express Deluxe",
      "route": "Delhi to Mumbai",
      "departure_time": "2024-12-15T10:00:00Z",
      "total_seats": 40,
      "available_seats": 35,
      "created_at": "2024-12-12T08:00:00Z",
      "updated_at": "2024-12-12T08:00:00Z"
    }
  ]
}
```

#### Get Bus by ID

```http
GET /api/buses/:id
```

#### Get Seats for a Bus

```http
GET /api/buses/:id/seats
```

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "bus_id": "uuid",
      "seat_number": 1,
      "is_available": true,
      "created_at": "2024-12-12T08:00:00Z"
    }
  ]
}
```

### Booking Endpoints

#### Create a Booking

```http
POST /api/bookings
Content-Type: application/json

{
  "bus_id": "uuid",
  "seat_ids": ["seat-uuid-1", "seat-uuid-2"],
  "passenger_name": "John Doe",
  "passenger_email": "john@example.com",
  "passenger_phone": "+919876543210"
}
```

Response:

```json
{
  "message": "Booking created successfully",
  "data": {
    "id": "uuid",
    "bus_id": "uuid",
    "seat_ids": ["uuid1", "uuid2"],
    "passenger_name": "John Doe",
    "passenger_email": "john@example.com",
    "passenger_phone": "+919876543210",
    "status": "CONFIRMED",
    "created_at": "2024-12-12T08:30:00Z",
    "updated_at": "2024-12-12T08:30:00Z"
  }
}
```

#### Get Booking Status

```http
GET /api/bookings/:id
```

## Error Handling

The API uses standard HTTP status codes:

- `200 OK`: Successful GET request
- `201 Created`: Successful POST request
- `400 Bad Request`: Validation error
- `404 Not Found`: Resource not found
- `409 Conflict`: Seats already booked
- `500 Internal Server Error`: Server error

Error Response Format:

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "field_name",
      "message": "Validation error message"
    }
  ]
}
```

## Concurrency Handling

The system uses **pessimistic locking** to handle concurrent booking requests:

1. When a booking is created, the system uses `SELECT FOR UPDATE` to lock the selected seats
2. It verifies all seats are available
3. Marks seats as unavailable
4. Creates the booking
5. All operations are wrapped in a PostgreSQL transaction

This ensures that even if multiple users try to book the same seat simultaneously, only one will succeed.

## Booking Expiry

A background job runs every 60 seconds to:

1. Find bookings with `PENDING` status older than 2 minutes
2. Mark them as `FAILED`
3. Release the associated seats

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── index.ts      # Environment config
│   │   └── database.ts   # Database connection
│   ├── controllers/      # HTTP request handlers
│   ├── services/         # Business logic
│   ├── db/
│   │   ├── repositories/ # Data access layer
│   │   └── migrations/   # Database migrations
│   ├── middlewares/      # Express middlewares
│   ├── utils/            # Utility functions
│   │   ├── asyncHandler.ts  # Global async wrap handler
│   │   ├── errors.ts         # Custom error classes
│   │   └── logger.ts         # Winston logger
│   ├── types/            # TypeScript interfaces
│   ├── validators/       # Zod schemas
│   ├── routes/           # API routes
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── logs/                 # Log files
├── .env.example          # Environment variables template
├── package.json
└── tsconfig.json
```

## Development Guidelines

### Adding a New Feature

1. **Define types** in `src/types/`
2. **Create Zod schema** in `src/validators/`
3. **Add repository methods** in `src/db/repositories/`
4. **Implement business logic** in `src/services/`
5. **Create controller** in `src/controllers/` (use `asyncHandler`)
6. **Add routes** in `src/routes/`

### Code Standards

- ✅ Use named exports only (no default exports)
- ✅ Wrap all async route handlers with `asyncHandler`
- ✅ Validate all inputs with Zod schemas
- ✅ Follow layered architecture (no business logic in controllers)
- ✅ Use repository pattern for database access
- ✅ Log important events and errors

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_anon_key
DATABASE_URL=your_production_database_url
FRONTEND_URL=https://your-frontend-domain.com
LOG_LEVEL=warn
```

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with compiled JavaScript.

### Deploy to Render

1. Connect your GitHub repository to Render
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add environment variables in Render dashboard
5. Deploy!

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check if your IP is whitelisted in Supabase
- Ensure database is running

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### TypeScript Errors

```bash
# Clean build
rm -rf dist/
npm run build
```

## License

ISC
