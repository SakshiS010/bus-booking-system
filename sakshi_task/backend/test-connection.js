import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  console.log('🔄 Testing Supabase connection...\n');
  console.log('Connection String:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
  
  try {
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to database!\n');
    
    // Test if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('buses', 'seats', 'bookings')
      ORDER BY table_name
    `);
    
    console.log('📋 Tables found:');
    tablesResult.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    // Test bus count
    const busCount = await client.query('SELECT COUNT(*) FROM buses');
    console.log(`\n🚌 Buses in database: ${busCount.rows[0].count}`);
    
    // Test seat count
    const seatCount = await client.query('SELECT COUNT(*) FROM seats');
    console.log(`💺 Seats in database: ${seatCount.rows[0].count}`);
    
    // Test booking count
    const bookingCount = await client.query('SELECT COUNT(*) FROM bookings');
    console.log(`📝 Bookings in database: ${bookingCount.rows[0].count}`);
    
    client.release();
    
    console.log('\n✅ All tests passed! Database is working correctly.');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
