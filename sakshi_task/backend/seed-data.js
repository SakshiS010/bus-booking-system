import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const sampleBuses = [
  {
    name: 'Express Deluxe',
    route: 'Delhi to Mumbai',
    departure_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    total_seats: 40
  },
  {
    name: 'Sleeper Coach',
    route: 'Bangalore to Chennai',
    departure_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    total_seats: 30
  },
  {
    name: 'Volvo AC',
    route: 'Pune to Goa',
    departure_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    total_seats: 45
  },
  {
    name: 'Super Fast',
    route: 'Hyderabad to Vijayawada',
    departure_time: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
    total_seats: 35
  },
  {
    name: 'Luxury Liner',
    route: 'Jaipur to Udaipur',
    departure_time: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days from now
    total_seats: 50
  }
];

async function populateDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Populating database with sample buses...\n');
    
    for (const bus of sampleBuses) {
      // Start transaction
      await client.query('BEGIN');
      
      // Create bus
      const busResult = await client.query(
        `INSERT INTO buses (name, route, departure_time, total_seats)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [bus.name, bus.route, bus.departure_time, bus.total_seats]
      );
      
      const createdBus = busResult.rows[0];
      console.log(`✅ Created bus: ${createdBus.name}`);
      console.log(`   Route: ${createdBus.route}`);
      console.log(`   Departure: ${new Date(createdBus.departure_time).toLocaleString()}`);
      console.log(`   Seats: ${createdBus.total_seats}`);
      
      // Create seats
      const seatInserts = [];
      for (let i = 1; i <= bus.total_seats; i++) {
        seatInserts.push(`('${createdBus.id}', ${i}, TRUE)`);
      }
      
      await client.query(
        `INSERT INTO seats (bus_id, seat_number, is_available)
         VALUES ${seatInserts.join(', ')}`
      );
      
      console.log(`   Created ${bus.total_seats} seats\n`);
      
      // Commit transaction
      await client.query('COMMIT');
    }
    
    // Show summary
    const busCount = await client.query('SELECT COUNT(*) FROM buses');
    const seatCount = await client.query('SELECT COUNT(*) FROM seats');
    
    console.log('📊 Database Summary:');
    console.log(`   Total Buses: ${busCount.rows[0].count}`);
    console.log(`   Total Seats: ${seatCount.rows[0].count}`);
    console.log('\n✨ Database populated successfully!');
    console.log('🌐 Refresh your frontend to see the buses!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error populating database:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

populateDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
