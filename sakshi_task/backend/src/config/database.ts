import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

// Supabase client for basic operations
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);

// PostgreSQL connection pool for transactions and advanced queries
// Using Supabase transaction pooler - requires specific configuration
export const pool = new Pool({
  connectionString: config.database.url,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Options for Supabase transaction pooler compatibility
  options: '-c statement_timeout=60000',
});

// Disable prepared statements for transaction pooler
// This is required when using Supabase's transaction mode pooler
pool.on('connect', (client) => {
  client.query('SET statement_timeout = 60000');
  logger.info('Database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected database error', { error: err.message });
});

// Helper function to execute queries with error handling
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Query error', { text, error });
    throw error;
  }
};

// Helper function to get a client for transactions
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};
