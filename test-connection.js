// Quick test script to verify Neon database connection
// Run this locally with: node test-connection.js
// Make sure to set DATABASE_URL in your .env file first

import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL || 
  'postgresql://neondb_owner:npg_s9o4kCYxJUHK@ep-broad-darkness-aeonh7dg-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testConnection() {
  try {
    console.log('Testing Neon database connection...');
    const sql = neon(connectionString);
    
    // Test basic query
    const result = await sql`SELECT version()`;
    console.log('✅ Database connection successful!');
    console.log('PostgreSQL version:', result[0].version);
    
    // Test table creation
    console.log('\nTesting table creation...');
    await sql`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Table creation works!');
    
    // Test insert
    await sql`
      INSERT INTO test_table (name)
      VALUES ('Test Entry')
      ON CONFLICT DO NOTHING
    `;
    console.log('✅ Insert works!');
    
    // Test select
    const rows = await sql`SELECT * FROM test_table LIMIT 5`;
    console.log('✅ Select works!');
    console.log('Sample data:', rows);
    
    // Cleanup
    await sql`DROP TABLE IF EXISTS test_table`;
    console.log('✅ Cleanup complete!');
    
    console.log('\n🎉 All database operations working correctly!');
    console.log('Your connection string is valid and ready for Netlify deployment.');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testConnection();

