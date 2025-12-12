# System Design Document

## Bus Ticket Booking System

**Version:** 1.0  
**Date:** December 2024  
**Author:** Varun Singh

---

## Table of Contents

1. [Overview](#overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Database Design](#database-design)
4. [Concurrency Control](#concurrency-control)
5. [Caching Strategy](#caching-strategy)
6. [Scaling Considerations](#scaling-considerations)
7. [Message Queue Usage](#message-queue-usage)
8. [Security Considerations](#security-considerations)

---

## Overview

### Problem Statement

Build a production-grade bus ticket booking system similar to RedBus/BookMyShow that can handle:

- High concurrent booking requests
- Prevent overbooking (double booking of seats)
- Automatic booking expiry
- Real-time seat availability
- Scalable to millions of users

### Solution Approach

A full-stack application with:

- **Backend**: Express.js + TypeScript + PostgreSQL (Supabase)
- **Frontend**: React + TypeScript
- **Concurrency**: Pessimistic locking with database transactions
- **Scalability**: Horizontal scaling with load balancing and caching

---

## High-Level Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         Users                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (Nginx)                     │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌───────────────────────┐       ┌───────────────────────┐
│   Frontend Server 1   │       │   Frontend Server 2   │
│    (React - Vercel)   │       │    (React - Vercel)   │
└───────────────────────┘       └───────────────────────┘
                │                           │
                └─────────────┬─────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Load Balancer                         │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌───────────────────────┐       ┌───────────────────────┐
│   Backend Server 1    │       │   Backend Server 2    │
│  (Express.js + TS)    │       │  (Express.js + TS)    │
└───────────────────────┘       └───────────────────────┘
                │                           │
                └─────────────┬─────────────┘
                              ▼
                ┌─────────────────────────┐
                │   Redis Cache Cluster   │
                │  (Seat Availability)    │
                └─────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Primary)                   │
│                    (Supabase)                                │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌───────────────────────┐       ┌───────────────────────┐
│   Read Replica 1      │       │   Read Replica 2      │
└───────────────────────┘       └───────────────────────┘

                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Message Queue (RabbitMQ/SQS)                    │
│         (Booking Processing, Notifications)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌───────────────────────┐       ┌───────────────────────┐
│   Worker Service 1    │       │   Worker Service 2    │
│  (Booking Expiry,     │       │  Email Notifications) │
│   Payment Processing) │       │                       │
└───────────────────────┘       └───────────────────────┘
```

### Component Responsibilities

#### Frontend (React)

- User interface for browsing and booking
- Client-side validation
- State management with Context API
- Responsive design

#### Backend API (Express.js)

- RESTful API endpoints
- Business logic
- Input validation (Zod)
- Authentication & authorization
- Rate limiting

#### Database (PostgreSQL)

- Primary data store
- ACID transactions
- Row-level locking for concurrency

#### Cache (Redis)

- Seat availability cache
- Session storage
- Rate limiting counters

#### Message Queue (RabbitMQ/SQS)

- Asynchronous booking processing
- Email notifications
- Booking expiry jobs

#### Worker Services

- Background job processing
- Booking expiry (PENDING → FAILED)
- Payment processing
- Email notifications

---

## Database Design

### Schema

#### buses

```sql
CREATE TABLE buses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    route VARCHAR(200) NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    total_seats INTEGER NOT NULL CHECK (total_seats >= 10 AND total_seats <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_buses_departure_time ON buses(departure_time);
```

#### seats

```sql
CREATE TABLE seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    seat_number INTEGER NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bus_id, seat_number)
);

CREATE INDEX idx_seats_bus_id_available ON seats(bus_id, is_available);
```

#### bookings

```sql
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_id UUID NOT NULL REFERENCES buses(id) ON DELETE CASCADE,
    seat_ids UUID[] NOT NULL,
    passenger_name VARCHAR(100) NOT NULL,
    passenger_email VARCHAR(255) NOT NULL,
    passenger_phone VARCHAR(20) NOT NULL,
    status booking_status DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_status_created ON bookings(status, created_at);
CREATE INDEX idx_bookings_bus_id ON bookings(bus_id);
```

### Database Scaling Strategies

#### 1. Read Replicas

- **Purpose**: Distribute read load across multiple replicas
- **Implementation**:
  - Primary database handles all writes
  - Read replicas handle read queries (bus listings, seat availability)
  - Use connection pooling to route queries appropriately

```typescript
// Example: Route reads to replicas
const readPool = new Pool({ connectionString: READ_REPLICA_URL });
const writePool = new Pool({ connectionString: PRIMARY_DB_URL });

// Read operation
const buses = await readPool.query("SELECT * FROM buses");

// Write operation
const booking = await writePool.query("INSERT INTO bookings ...");
```

#### 2. Sharding

- **Purpose**: Distribute data across multiple database instances
- **Strategy**: Shard by `bus_id` or geographic region

**Horizontal Sharding by Region:**

```
Shard 1: North India buses (Delhi, Punjab, etc.)
Shard 2: South India buses (Chennai, Bangalore, etc.)
Shard 3: East India buses (Kolkata, etc.)
Shard 4: West India buses (Mumbai, Goa, etc.)
```

**Benefits:**

- Reduced load per database
- Improved query performance
- Geographic data locality

**Challenges:**

- Cross-shard queries
- Shard rebalancing
- Increased complexity

#### 3. Connection Pooling

```typescript
const pool = new Pool({
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000, // Close idle connections after 30s
  connectionTimeoutMillis: 2000,
});
```

#### 4. Partitioning

- **Time-based partitioning** for bookings table
- Partition by month/year to improve query performance

```sql
-- Example: Partition bookings by month
CREATE TABLE bookings_2024_12 PARTITION OF bookings
    FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
```

---

## Concurrency Control

### Problem: Race Conditions

Multiple users trying to book the same seat simultaneously can lead to:

- Double booking (overbooking)
- Data inconsistency
- Poor user experience

### Solution: Pessimistic Locking

#### Implementation

```typescript
export const createBookingWithLock = async (data: CreateBookingInput) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // CRITICAL: Lock seats for update (pessimistic locking)
    const seatCheckResult = await client.query(
      `SELECT id, is_available
       FROM seats
       WHERE id = ANY($1::uuid[])
       FOR UPDATE`,  // <-- Locks these rows until transaction completes
      [data.seat_ids]
    );

    // Verify all seats are available
    const unavailableSeats = seatCheckResult.rows.filter(
      seat => !seat.is_available
    );

    if (unavailableSeats.length > 0) {
      throw new ConflictError('Seats no longer available');
    }

    // Mark seats as unavailable
    await client.query(
      `UPDATE seats SET is_available = FALSE WHERE id = ANY($1::uuid[])`,
      [data.seat_ids]
    );

    // Create booking
    const booking = await client.query(
      `INSERT INTO bookings (...) VALUES (...) RETURNING *`,
      [...]
    );

    await client.query('COMMIT');
    return booking.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
```

#### How It Works

1. **Transaction Begins**: `BEGIN` starts a database transaction
2. **Lock Acquisition**: `SELECT FOR UPDATE` locks the seat rows
3. **Validation**: Check if seats are available
4. **Update**: Mark seats as unavailable
5. **Booking Creation**: Insert booking record
6. **Commit**: `COMMIT` releases locks and makes changes permanent

**Concurrency Scenario:**

```
Time    User A                          User B
─────────────────────────────────────────────────────────
T1      BEGIN transaction
T2      SELECT FOR UPDATE (locks seats)
T3                                      BEGIN transaction
T4      Check availability ✓
T5                                      SELECT FOR UPDATE (WAITS)
T6      UPDATE seats
T7      INSERT booking
T8      COMMIT (releases lock)
T9                                      (Lock acquired)
T10                                     Check availability ✗
T11                                     ROLLBACK (seats taken)
```

### Alternative: Optimistic Locking

```typescript
// Add version column to seats table
ALTER TABLE seats ADD COLUMN version INTEGER DEFAULT 0;

// Update with version check
const result = await pool.query(
  `UPDATE seats
   SET is_available = FALSE, version = version + 1
   WHERE id = ANY($1::uuid[])
   AND version = $2
   RETURNING *`,
  [seatIds, expectedVersion]
);

if (result.rowCount !== seatIds.length) {
  throw new ConflictError('Seats were modified by another transaction');
}
```

**Trade-offs:**

- **Pessimistic**: Better for high contention, but can cause lock waits
- **Optimistic**: Better for low contention, but more retries needed

---

## Caching Strategy

### Why Caching?

- Reduce database load
- Improve response times
- Handle traffic spikes

### Redis Cache Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  API Server │
└──────┬──────┘
       │
       ├──────► Check Redis Cache
       │        ├─ Hit: Return cached data
       │        └─ Miss: Query database
       │
       ▼
┌─────────────┐
│  Database   │
└─────────────┘
```

### Caching Layers

#### 1. Seat Availability Cache

```typescript
// Cache key: bus:{busId}:seats
const cacheKey = `bus:${busId}:seats`;

// Get from cache
const cachedSeats = await redis.get(cacheKey);
if (cachedSeats) {
  return JSON.parse(cachedSeats);
}

// Cache miss - fetch from database
const seats = await pool.query("SELECT * FROM seats WHERE bus_id = $1", [
  busId,
]);

// Store in cache (TTL: 30 seconds)
await redis.setex(cacheKey, 30, JSON.stringify(seats.rows));

return seats.rows;
```

**Cache Invalidation:**

- On booking creation: Invalidate seat cache for that bus
- On booking expiry: Invalidate seat cache

```typescript
// Invalidate cache after booking
await redis.del(`bus:${busId}:seats`);
```

#### 2. Bus Listing Cache

```typescript
// Cache all buses for 5 minutes
const cacheKey = "buses:all";
const cachedBuses = await redis.get(cacheKey);

if (cachedBuses) {
  return JSON.parse(cachedBuses);
}

const buses = await pool.query("SELECT * FROM buses ORDER BY departure_time");
await redis.setex(cacheKey, 300, JSON.stringify(buses.rows));

return buses.rows;
```

#### 3. Session Cache

```typescript
// Store user sessions in Redis
await redis.setex(`session:${userId}`, 3600, JSON.stringify(sessionData));
```

### Cache Warming

Pre-populate cache for popular routes:

```typescript
// Run on server startup
const popularBuses = await pool.query(
  "SELECT * FROM buses WHERE departure_time > NOW() LIMIT 100"
);

for (const bus of popularBuses.rows) {
  const seats = await pool.query("SELECT * FROM seats WHERE bus_id = $1", [
    bus.id,
  ]);
  await redis.setex(`bus:${bus.id}:seats`, 300, JSON.stringify(seats.rows));
}
```

### Cache Eviction Policies

- **LRU (Least Recently Used)**: Default Redis eviction
- **TTL-based**: Automatic expiration after set time
- **Manual**: Invalidate on data changes

---

## Scaling Considerations

### Horizontal Scaling

#### API Servers

- Deploy multiple instances behind load balancer
- Stateless design (no in-memory sessions)
- Use Redis for shared state

```yaml
# Docker Compose example
services:
  api-1:
    image: bus-booking-api
    environment:
      - PORT=3000
  api-2:
    image: bus-booking-api
    environment:
      - PORT=3000
  load-balancer:
    image: nginx
    ports:
      - "80:80"
```

#### Database Scaling

1. **Read Replicas**: For read-heavy workloads
2. **Sharding**: For write-heavy workloads
3. **Connection Pooling**: Optimize connection usage

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries (indexes, query plans)
- Use faster storage (SSD)

### Auto-Scaling

```yaml
# Kubernetes HPA example
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-autoscaler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

### Performance Optimizations

#### 1. Database Indexes

```sql
-- Composite index for common queries
CREATE INDEX idx_buses_route_departure ON buses(route, departure_time);

-- Partial index for available seats
CREATE INDEX idx_seats_available ON seats(bus_id) WHERE is_available = TRUE;
```

#### 2. Query Optimization

```typescript
// Bad: N+1 query problem
for (const bus of buses) {
  const seats = await pool.query("SELECT * FROM seats WHERE bus_id = $1", [
    bus.id,
  ]);
}

// Good: Single query with JOIN
const result = await pool.query(`
  SELECT b.*, COUNT(s.id) FILTER (WHERE s.is_available = TRUE) as available_seats
  FROM buses b
  LEFT JOIN seats s ON b.id = s.bus_id
  GROUP BY b.id
`);
```

#### 3. Connection Pooling

```typescript
const pool = new Pool({
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000,
});
```

---

## Message Queue Usage

### Why Message Queues?

- **Decouple services**: Separate booking creation from payment processing
- **Reliability**: Retry failed operations
- **Scalability**: Handle traffic spikes
- **Async processing**: Don't block user requests

### Architecture

```
┌─────────────┐
│  API Server │
└──────┬──────┘
       │
       │ Publish booking event
       ▼
┌─────────────────┐
│  Message Queue  │
│  (RabbitMQ/SQS) │
└─────────┬───────┘
          │
          ├──────► Worker 1: Payment Processing
          ├──────► Worker 2: Email Notifications
          └──────► Worker 3: Booking Expiry
```

### Use Cases

#### 1. Booking Processing

```typescript
// API Server: Publish booking event
await messageQueue.publish("booking.created", {
  bookingId: booking.id,
  userId: user.id,
  amount: totalAmount,
});

// Worker: Process booking
messageQueue.subscribe("booking.created", async (message) => {
  const { bookingId, amount } = message;

  // Process payment
  const paymentResult = await paymentGateway.charge(amount);

  if (paymentResult.success) {
    await updateBookingStatus(bookingId, "CONFIRMED");
  } else {
    await updateBookingStatus(bookingId, "FAILED");
    await releaseSeats(bookingId);
  }
});
```

#### 2. Email Notifications

```typescript
// Publish email event
await messageQueue.publish("email.send", {
  to: passenger.email,
  template: "booking-confirmation",
  data: { bookingId, busName, seats },
});

// Worker: Send email
messageQueue.subscribe("email.send", async (message) => {
  await emailService.send(message);
});
```

#### 3. Booking Expiry

```typescript
// Scheduled job (runs every minute)
setInterval(async () => {
  const expiredBookings = await findExpiredBookings();

  for (const booking of expiredBookings) {
    await messageQueue.publish("booking.expired", { bookingId: booking.id });
  }
}, 60000);

// Worker: Handle expiry
messageQueue.subscribe("booking.expired", async (message) => {
  await updateBookingStatus(message.bookingId, "FAILED");
  await releaseSeats(message.bookingId);
  await sendCancellationEmail(message.bookingId);
});
```

### Queue Configuration

```typescript
// RabbitMQ example
const queue = await channel.assertQueue("bookings", {
  durable: true, // Survive broker restarts
  maxLength: 10000, // Max queue size
  messageTtl: 3600000, // Message TTL: 1 hour
});

// Dead Letter Queue for failed messages
const dlq = await channel.assertQueue("bookings.dlq", {
  durable: true,
});

await channel.consume("bookings", async (msg) => {
  try {
    await processBooking(msg);
    channel.ack(msg);
  } catch (error) {
    // Retry 3 times, then send to DLQ
    if (msg.properties.headers["x-retry-count"] >= 3) {
      channel.sendToQueue("bookings.dlq", msg.content);
      channel.ack(msg);
    } else {
      channel.nack(msg, false, true); // Requeue
    }
  }
});
```

---

## Security Considerations

### 1. Authentication & Authorization

```typescript
// JWT-based authentication
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Role-based access control
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};

// Protected routes
router.post("/buses", authMiddleware, adminOnly, createBusController);
```

### 2. Rate Limiting

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later",
});

app.use("/api/", limiter);
```

### 3. Input Validation

```typescript
// Zod schema validation
const createBookingSchema = z.object({
  bus_id: z.string().uuid(),
  seat_ids: z.array(z.string().uuid()).min(1).max(10),
  passenger_email: z.string().email(),
  // ...
});

// Middleware
app.use(validateRequest(createBookingSchema));
```

### 4. SQL Injection Prevention

```typescript
// ✅ Good: Parameterized queries
const result = await pool.query("SELECT * FROM buses WHERE id = $1", [busId]);

// ❌ Bad: String concatenation
const result = await pool.query(`SELECT * FROM buses WHERE id = '${busId}'`);
```

### 5. CORS Configuration

```typescript
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
```

### 6. Data Encryption

- **In Transit**: HTTPS/TLS for all API calls
- **At Rest**: Encrypt sensitive data in database
- **Passwords**: bcrypt hashing with salt

```typescript
import bcrypt from "bcrypt";

const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
```

---

## Monitoring & Observability

### 1. Logging

```typescript
// Structured logging with Winston
logger.info("Booking created", {
  bookingId: booking.id,
  userId: user.id,
  busId: bus.id,
  seatCount: seats.length,
  timestamp: new Date().toISOString(),
});
```

### 2. Metrics

- **Request rate**: Requests per second
- **Error rate**: Percentage of failed requests
- **Latency**: P50, P95, P99 response times
- **Database**: Query performance, connection pool usage

### 3. Alerts

- High error rate (> 5%)
- High latency (P95 > 1s)
- Database connection pool exhausted
- Queue depth exceeding threshold

---

## Conclusion

This system design provides a scalable, reliable, and performant bus ticket booking platform. Key highlights:

1. **Concurrency**: Pessimistic locking prevents double bookings
2. **Scalability**: Horizontal scaling with load balancing and caching
3. **Reliability**: Message queues for async processing and retries
4. **Performance**: Redis caching and database optimization
5. **Security**: Authentication, authorization, and input validation

The architecture can handle millions of users and thousands of concurrent bookings while maintaining data consistency and providing a great user experience.
