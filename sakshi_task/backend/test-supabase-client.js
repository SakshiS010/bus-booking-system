import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('🔄 Testing Supabase client connection...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabaseClient() {
  try {
    // Test 1: Query buses table
    console.log('📋 Testing buses table...');
    const { data: buses, error: busError } = await supabase
      .from('buses')
      .select('*');
    
    if (busError) {
      console.error('❌ Buses query failed:', busError.message);
    } else {
      console.log(`✅ Buses query successful! Found ${buses.length} buses`);
    }

    // Test 2: Query seats table
    console.log('\n💺 Testing seats table...');
    const { data: seats, error: seatError } = await supabase
      .from('seats')
      .select('*');
    
    if (seatError) {
      console.error('❌ Seats query failed:', seatError.message);
    } else {
      console.log(`✅ Seats query successful! Found ${seats.length} seats`);
    }

    // Test 3: Query bookings table
    console.log('\n📝 Testing bookings table...');
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('*');
    
    if (bookingError) {
      console.error('❌ Bookings query failed:', bookingError.message);
    } else {
      console.log(`✅ Bookings query successful! Found ${bookings.length} bookings`);
    }

    console.log('\n✅ Supabase client is working!');
    console.log('\n⚠️  However, we need direct PostgreSQL access for transactions.');
    console.log('Please get your Database Password from:');
    console.log('Supabase Dashboard → Settings → Database → Database Password');
    console.log('(You may need to reset it if you don\'t have it)');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testSupabaseClient();
