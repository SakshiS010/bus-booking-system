# Database Migration Guide

## Quick Start - Run Migration in Supabase

Since the automated migration is having connection issues, please run the migration manually:

### Steps:

1. **Open Supabase SQL Editor**

   - Go to: https://supabase.com/dashboard/project/uotjvxhcrwpwyojdbsee
   - Click on "SQL Editor" in the left sidebar

2. **Copy the Migration SQL**

   - Open file: `backend/src/db/migrations/001_initial_schema.sql`
   - Copy ALL the contents

3. **Execute in Supabase**

   - Paste the SQL into the Supabase SQL Editor
   - Click "Run" button
   - You should see success messages for:
     - Tables created (buses, seats, bookings)
     - Indexes created
     - Triggers created

4. **Verify Migration**
   - In Supabase, go to "Table Editor"
   - You should see 3 tables: `buses`, `seats`, `bookings`

## What the Migration Creates

### Tables:

- **buses**: Stores bus information (name, route, departure time, total seats)
- **seats**: Stores individual seats for each bus
- **bookings**: Stores passenger bookings with status tracking

### Indexes:

- Fast queries on departure time
- Efficient seat availability lookups
- Quick booking status checks

### Triggers:

- Auto-update `updated_at` timestamps

---

## After Migration is Complete

Run these commands to start the application:

### Backend:

```bash
cd backend
npm run dev
```

### Frontend (in new terminal):

```bash
cd frontend
npm run dev
```

Then open: http://localhost:5173

---

## Environment Variables (Already Configured ✅)

**Backend (.env)**:

- SUPABASE_URL: ✅ Set
- SUPABASE_ANON_KEY: ✅ Set
- DATABASE_URL: ✅ Set

**Frontend (.env)**:

- VITE_API_BASE_URL: ✅ Set to http://localhost:3000/api

---

## Troubleshooting

If you see connection errors:

1. Make sure your Supabase project is active
2. Check that the database is not paused
3. Verify the connection pooler is enabled in Supabase settings

---

## Next Steps After Migration

1. ✅ Run migration in Supabase SQL Editor (see above)
2. Start backend server: `cd backend && npm run dev`
3. Start frontend server: `cd frontend && npm run dev`
4. Test the application at http://localhost:5173
5. Create a bus in admin panel
6. Book seats as a user
7. Test concurrency by opening multiple tabs
