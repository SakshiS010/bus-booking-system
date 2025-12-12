import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🔄 Running database migration via Supabase client...\n');
    
    // Read migration file
    const migrationPath = join(__dirname, 'src', 'db', 'migrations', '001_initial_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');
    
    console.log('📄 Migration SQL loaded');
    console.log('📝 Please run this SQL in your Supabase SQL Editor:\n');
    console.log('=' .repeat(80));
    console.log(migrationSQL);
    console.log('=' .repeat(80));
    
    console.log('\n📍 Steps to run migration:');
    console.log('1. Go to: https://supabase.com/dashboard/project/uotjvxhcrwpwyojdbsee');
    console.log('2. Click "SQL Editor" in the left sidebar');
    console.log('3. Copy the SQL above');
    console.log('4. Paste into the SQL Editor');
    console.log('5. Click "Run" button');
    console.log('\n✅ After running, restart your backend server');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
